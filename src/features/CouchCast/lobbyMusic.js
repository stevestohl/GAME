// 🎵 The lobby music for the TV games: one shared player per track.
// It's started by the tap that creates the room (browsers only allow sound after a tap),
// so it's already playing by the time the lobby appears.
import { startTimerMusic, stopTimerMusic, playingTimerTrackId } from '../../timerMusic.js';
import { isMusicMuted, onMusicMuteChange } from '../../musicMute.js';

const makeTrack = (src) => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'none'; // don't download it for visitors who never open a cast game
    audio.muted = isMusicMuted();
    return audio;
};

// A song made in the browser (see LOBBY_SYNTH_TRACKS in timerMusic.js), dressed up to work
// like the <audio> tracks above: play(), pause(), paused, load()
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
    couchCast: makeSynthTrack('couch-groove'),                // Couch Cast's core deck
    listCast: makeTrack('/audio/ListCastLobbyMusic.mp3'),     // List Cast
    triviaCast: makeTrack('/audio/TriviaCastLobbyMusic.mp3'), // Trivia Cast
    halloween: makeTrack('/audio/HalloweenLobbyMusic.mp3'),   // any game played with a Halloween deck
};

// 🔇 The music switch (musicMute.js) mutes the song files; the made-in-the-browser songs mute themselves
onMusicMuteChange((muted) => {
    Object.values(TRACKS).forEach((audio) => { if (audio instanceof Audio) audio.muted = muted; });
});

// Which track a game's lobby plays: Halloween decks always get the Halloween song,
// List Cast, Trivia Cast and Couch Cast have their own, and everything else plays the usual lobby music
export function lobbyTrackFor(game, expansion) {
    if (expansion === 'halloween') return 'halloween';
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
