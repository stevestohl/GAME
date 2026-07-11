import { tictactoeSocket } from './TicTacToe.jsx'; // Adjust path to your TicTacToe component

export function handleCreateTttRoom(playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    console.log(`Requesting Tic-Tac-Toe Room creation for: ${cleanName}`);
    
    // Ensure the namespace socket is connected
    if (!tictactoeSocket.connected) {
        tictactoeSocket.connect();
    }

    // Clean up stale creation listeners
    tictactoeSocket.off('roomCreated');

    // Fire the creation event to the backend
    tictactoeSocket.emit('createRoom', { hostName: cleanName });

    // Listen for the backend to hand back the generated 'T***' room code
    tictactoeSocket.once('roomCreated', ({ roomCode }) => {
        console.log(`Tic-Tac-Toe room created! Code: ${roomCode}`);
        // Redirect the host directly to the board with the server-generated code
        navigate(`/tictactoe?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}