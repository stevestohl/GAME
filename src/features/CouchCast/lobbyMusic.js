// 🎵 The lobby music for the TV games: one shared player per track.
// It's started by the tap that creates the room (browsers only allow sound after a tap),
// so it's already playing by the time the lobby appears.
const makeTrack = (src) => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'none'; // don't download it for visitors who never open a cast game
    return audio;
};

const TRACKS = {
    default: makeTrack('/audio/LobbyMusic.mp3'),
    listCast: makeTrack('/audio/ListCastLobbyMusic.mp3'),     // List Cast
    triviaCast: makeTrack('/audio/TriviaCastLobbyMusic.mp3'), // Trivia Cast
    halloween: makeTrack('/audio/HalloweenLobbyMusic.mp3'),   // any game played with a Halloween deck
};

// Which track a game's lobby plays: Halloween decks always get the Halloween song,
// List Cast and Trivia Cast have their own, and everything else plays the usual lobby music
export function lobbyTrackFor(game, expansion) {
    if (expansion === 'halloween') return 'halloween';
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
