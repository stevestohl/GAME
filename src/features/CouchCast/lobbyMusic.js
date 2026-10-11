// 🎵 The Couch Cast lobby music: one shared player.
// It's started by the tap that creates the room (browsers only allow sound after a tap),
// so it's already playing by the time the lobby appears.
const lobbyMusic = new Audio('/audio/LobbyMusic.mp3');
lobbyMusic.loop = true;
lobbyMusic.volume = 0.4;
lobbyMusic.preload = 'none'; // don't download it for visitors who never open Couch Cast

// Called on the deck page: start downloading so it's ready by the time a deck is tapped
export function preloadLobbyMusic() {
    lobbyMusic.preload = 'auto';
    lobbyMusic.load();
}

export function startLobbyMusic() {
    if (!lobbyMusic.paused) return;
    lobbyMusic.play().catch((err) => console.warn('Audio autoplay blocked:', err.message));
}

export function stopLobbyMusic() {
    lobbyMusic.pause();
    lobbyMusic.currentTime = 0;
}
