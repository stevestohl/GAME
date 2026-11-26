// 🎵 The lobby music for the TV games: one shared player per track.
// It's started by the tap that creates the room (browsers only allow sound after a tap),
// so it's already playing by the time the lobby appears.
//
// The songs play through the page's Web Audio (the same audio the timer music uses), not an
// <audio> tag: on iPhones a playing video pauses any <audio> tag, and the TV runs a hidden
// keep-awake video the whole time (hooks/useWakeLock.js), so the lobby song cut out after a
// few seconds. Web Audio plays alongside the video.
import { getAudioContext, preferPlaybackAudio, isAudioAsleep } from '../../chime.js';
import { startTimerMusic, stopTimerMusic, playingTimerTrackId } from '../../timerMusic.js';
import { isMusicMuted, onMusicMuteChange } from '../../musicMute.js';

const VOLUME = 0.4;

// All the song files go through one volume knob, which the music switch (musicMute.js) turns down;
// the made-in-the-browser songs mute themselves
let output = null;
const getOutput = () => {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (!output) {
        output = ctx.createGain();
        output.gain.value = isMusicMuted() ? 0 : VOLUME;
        output.connect(ctx.destination);
    }
    return output;
};

onMusicMuteChange((muted) => {
    if (output) output.gain.setTargetAtTime(muted ? 0 : VOLUME, output.context.currentTime, 0.1);
});

// The phone shuts the page's audio off while it's hidden (switching apps, opening Control Center to
// start mirroring...): switch it back on when the page comes back, if a lobby song is meant to be playing
document.addEventListener('visibilitychange', () => {
    const ctx = getAudioContext();
    if (document.visibilityState !== 'visible' || !isAudioAsleep(ctx)) return;
    if (Object.values(TRACKS).some((track) => !track.paused)) ctx.resume().catch(() => {});
});

// 🔁 A song with an ending can't just loop back to the top: it would play its last chord, then start again.
// `loop` says where to go round instead: from `end` back to `start` (in seconds), the same number of whole
// bars apart, so the beat carries straight on. The last few milliseconds before `end` fade into the
// moment before `start`, so the jump doesn't click.
const LOOP_FADE_SECONDS = 0.015;
const smoothLoopJoin = (song, { start, end }) => {
    const rate = song.sampleRate;
    const fade = Math.round(LOOP_FADE_SECONDS * rate);
    const s = Math.round(start * rate), e = Math.round(end * rate);
    if (s < fade || e > song.length || e - s < fade * 2) return;
    for (let c = 0; c < song.numberOfChannels; c++) {
        const data = song.getChannelData(c);
        for (let i = 0; i < fade; i++) {
            const t = (i + 1) / fade;
            data[e - fade + i] = data[e - fade + i] * Math.cos(t * Math.PI / 2) + data[s - fade + i] * Math.sin(t * Math.PI / 2);
        }
    }
};

// A looping song file, with the same play(), pause(), paused and load() as an <audio> tag.
// `loop`: where it goes round (see above); without one, the whole file loops. `gain`: its volume next to the others.
// `begin`: where in the file it starts (seconds), for a file with a lead-in before its loop.
const makeTrack = (src, { loop = null, gain = 1, begin = 0 } = {}) => {
    let song = null;       // the downloaded, decoded song
    let loading = null;
    let source = null;     // what's playing it right now
    let level = null;      // its volume knob
    let wanted = false;    // play() was asked for (it may still be downloading)

    const download = () => {
        const ctx = getAudioContext();
        if (!ctx) return Promise.reject(new Error('No Web Audio in this browser'));
        if (!loading) {
            loading = fetch(src)
                .then((res) => res.arrayBuffer())
                .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
                .then((decoded) => {
                    if (loop) smoothLoopJoin(decoded, loop);
                    song = decoded;
                    return decoded;
                })
                .catch((err) => { loading = null; throw err; });
        }
        return loading;
    };

    return {
        get paused() { return !wanted; },
        play() {
            wanted = true;
            const ctx = getAudioContext();
            // Inside a tap, this is what lets the sound out (phones keep it shut until then)
            if (isAudioAsleep(ctx)) ctx.resume().catch(() => {});
            return download().then(() => {
                const out = getOutput();
                if (!wanted || source || !out) return;
                source = out.context.createBufferSource();
                source.buffer = song;
                source.loop = true;
                if (loop) {
                    source.loopStart = loop.start;
                    source.loopEnd = loop.end;
                }
                if (gain !== 1) {
                    level = out.context.createGain();
                    level.gain.value = gain;
                    source.connect(level);
                    level.connect(out);
                } else {
                    source.connect(out);
                }
                source.start(0, begin);
            });
        },
        pause() {
            wanted = false;
            if (source) {
                source.stop();
                source.disconnect();
                source = null;
            }
            if (level) {
                level.disconnect();
                level = null;
            }
        },
        currentTime: 0,                                // (the songs always start from the top)
        preload: 'none',                               // don't download it for visitors who never open a cast game
        load() { download().catch(() => {}); },
    };
};

// A song made in the browser (see LOBBY_SYNTH_TRACKS in timerMusic.js), dressed up to work
// like the song files above: play(), pause(), paused, load()
const makeSynthTrack = (trackId) => ({
    get paused() { return playingTimerTrackId() !== trackId; },
    play() {
        startTimerMusic({ trackId });
        return Promise.resolve();
    },
    pause() {
        if (playingTimerTrackId() === trackId) stopTimerMusic();
    },
    currentTime: 0,
    preload: 'none',
    load() {},   // nothing to download
});

const TRACKS = {
    default: makeTrack('/audio/LobbyMusic.mp3'),
    couchCast: makeSynthTrack('couch-anthem'),                // Couch Cast's core deck
    // 📼 Couch Cast's Jeffinitely deck: "Decades Mixtape", our own tune, recorded with the MuseScore General sounds (listed on the
    // Credits page; how it's made: audio-originals/decades-mixtape). '70s disco, '80s synth rock with electric guitars, a dial-up
    // modem, '90s chiptune and a rewind. 28 bars at 120 bpm (one bar = 2 s) with a bar of lead-in and a bar of run-out around
    // it, so it starts and goes round at 2 s and 58 s.
    jeffinitely: makeTrack('/audio/DecadesMixtape.m4a', { loop: { start: 2, end: 58 }, begin: 2 }),
    listCast: makeTrack('/audio/ListCastLobbyMusic.mp3'),     // List Cast
    // Trivia Cast: "Upbeat Funk Show Groove" by AlexGuz (Pixabay; listed on the Credits page). 127 BPM, so a bar
    // is 1.88974 s: it goes round from just before the final hit (51 bars in) to the top, skipping the ending.
    // A little quieter, to match the other songs.
    triviaCast: makeTrack('/audio/UpbeatFunkShowGroove.mp3', { loop: { start: 0.11, end: 0.11 + 51 * 1.88974 }, gain: 0.75 }),
    halloween: makeTrack('/audio/HalloweenLobbyMusic.mp3'),   // any game played with a Halloween deck
    // Couch Cast's Holiday deck: the Children's Galop from Tchaikovsky's Nutcracker (No. 3, the 6/8 Allegro), our own
    // orchestra recording of the public-domain score (listed on the Credits page). The file is the 41-bar dance (one
    // bar = 1 s) with a bar of lead-in and a bar of run-out around it, so it starts and goes round at 1 s and 42 s.
    holiday: makeTrack('/audio/NutcrackerGalop.m4a', { loop: { start: 1, end: 42 }, begin: 1 }),
    // Temple Mix Up's circus: Fučík's "Entry of the Gladiators", our own band recording of the public-domain score
    // (listed on the Credits page). The file is the 44-bar loop (the introduction, then the first strain twice; one
    // bar = 0.8 s) with a bar of lead-in and a bar of run-out around it, so it starts and goes round at 0.8 s and 36 s.
    mixup: makeTrack('/audio/EntryOfTheGladiators.m4a', { loop: { start: 0.8, end: 36 }, begin: 0.8 }),
};

// Which track a game's lobby plays: Halloween decks always get the Halloween song, the Holiday deck its carols,
// Couch Cast's Jeffinitely deck its mixtape, List Cast, Trivia Cast and Couch Cast have their own, and everything else
// plays the usual lobby music
export function lobbyTrackFor(game, expansion) {
    if (expansion === 'halloween') return 'halloween';
    if (expansion === 'holiday') return 'holiday';
    if (game === 'couchCast' && expansion === 'jeffinitely') return 'jeffinitely';
    if (game === 'couchCast') return 'couchCast';
    if (game === 'listCast') return 'listCast';
    if (game === 'triviaCast') return 'triviaCast';
    if (game === 'mixup') return 'mixup';
    return 'default';
}

// Called on a setup page: start downloading so it's ready by the time a deck is tapped
export function preloadLobbyMusic(track = 'default') {
    const audio = TRACKS[track] || TRACKS.default;
    audio.preload = 'auto';
    audio.load();
}

export function startLobbyMusic(track = 'default') {
    preferPlaybackAudio();   // so an iPhone's silent switch doesn't mute it (chime.js)
    const audio = TRACKS[track] || TRACKS.default;
    // Only one lobby song at a time
    Object.values(TRACKS).forEach((other) => {
        if (other !== audio && !other.paused) { other.pause(); other.currentTime = 0; }
    });
    if (!audio.paused) return;
    audio.play().catch((err) => console.warn('Audio autoplay blocked:', err.message));
}

export function stopLobbyMusic() {
    Object.values(TRACKS).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
    });
}
