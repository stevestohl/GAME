// 🎵 The lobby music for the TV games: one shared player per track.
// It's started by the tap that creates the room (browsers only allow sound after a tap),
// so it's already playing by the time the lobby appears.
//
// The songs play through the page's Web Audio (the same audio the timer music uses), not an
// <audio> tag: on iPhones a playing video pauses any <audio> tag, and the TV runs a hidden
// keep-awake video the whole time (hooks/useWakeLock.js), so the lobby song cut out after a
// few seconds. Web Audio plays alongside the video.
import { getAudioContext } from '../../chime.js';
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

// 🎶 Songs pass through here on the way to the volume knob, so a visualizer can listen in (it's before
// the knob, so it keeps dancing when the music's muted)
let songInput = null;
let analyser = null;
const getSongInput = () => {
    if (!songInput) {
        const ctx = getAudioContext();
        if (!ctx) return null;
        songInput = ctx.createGain();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.72;
        songInput.connect(analyser);
        songInput.connect(getOutput());
    }
    return songInput;
};

/** The live sound of the lobby song, for LobbyVisualizer.jsx (null if this browser has no Web Audio) */
export function lobbyAnalyser() {
    getSongInput();
    return analyser;
}

onMusicMuteChange((muted) => {
    if (output) output.gain.setTargetAtTime(muted ? 0 : VOLUME, output.context.currentTime, 0.1);
});

// The phone shuts the page's audio off while it's hidden (switching apps, opening Control Center to
// start mirroring...): switch it back on when the page comes back, if a lobby song is meant to be playing
document.addEventListener('visibilitychange', () => {
    const ctx = getAudioContext();
    if (document.visibilityState !== 'visible' || !ctx || ctx.state === 'running') return;
    if (Object.values(TRACKS).some((track) => !track.paused)) ctx.resume().catch(() => {});
});

// A looping song file, with the same play(), pause(), paused and load() as an <audio> tag
const makeTrack = (src) => {
    let song = null;       // the downloaded, decoded song
    let loading = null;
    let source = null;     // what's playing it right now
    let wanted = false;    // play() was asked for (it may still be downloading)

    const download = () => {
        const ctx = getAudioContext();
        if (!ctx) return Promise.reject(new Error('No Web Audio in this browser'));
        if (!loading) {
            loading = fetch(src)
                .then((res) => res.arrayBuffer())
                .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
                .then((decoded) => { song = decoded; return decoded; })
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
            if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
            return download().then(() => {
                const out = getSongInput();
                if (!wanted || source || !out) return;
                source = out.context.createBufferSource();
                source.buffer = song;
                source.loop = true;
                source.connect(out);
                source.start();
            });
        },
        pause() {
            wanted = false;
            if (source) {
                source.stop();
                source.disconnect();
                source = null;
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
    listCast: makeTrack('/audio/ListCastLobbyMusic.mp3'),     // List Cast
    triviaCast: makeTrack('/audio/TriviaCastLobbyMusic.mp3'), // Trivia Cast
    halloween: makeTrack('/audio/HalloweenLobbyMusic.mp3'),   // any game played with a Halloween deck
    holiday: makeSynthTrack('holiday-medley'),                // Couch Cast's Holiday deck
};

// Which track a game's lobby plays: Halloween decks always get the Halloween song, the Holiday deck its carols,
// List Cast, Trivia Cast and Couch Cast have their own, and everything else plays the usual lobby music
export function lobbyTrackFor(game, expansion) {
    if (expansion === 'halloween') return 'halloween';
    if (expansion === 'holiday') return 'holiday';
    if (game === 'couchCast') return 'couchCast';
    if (game === 'listCast') return 'listCast';
    if (game === 'triviaCast') return 'triviaCast';
    return 'default';
}

// Called on a setup page: start downloading so it's ready by the time a deck is tapped
export function preloadLobbyMusic(track = 'default') {
    const audio = TRACKS[track] || TRACKS.default;
    audio.preload = 'auto';
    audio.load();
}

export function startLobbyMusic(track = 'default') {
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
