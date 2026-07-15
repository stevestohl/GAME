import { tictactoeSocket } from './TicTacToe.jsx'; // Adjust path to your TicTacToe component

export function handleCreateTttRoom(playerName, navigate, setIsCreatingRoom) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    // Turn on Loading Modal
    if(setIsCreatingRoom) setIsCreatingRoom(true)

    console.log(`Requesting Tic-Tac-Toe Room creation for: ${cleanName}`);
    
    // Ensure the namespace socket is connected
    if (!tictactoeSocket.connected) {
        tictactoeSocket.connect();
    }

    // Clean up stale creation listeners
    tictactoeSocket.off('roomCreated');
    tictactoeSocket.off('connect_error')

    // If socket connect fails, turn off Modal
    tictactoeSocket.once('connect_error', (err) =>{
        console.error("Socket connection error: ", err)
        if(setIsCreatingRoom) setIsCreatingRoom(false)
            alert("Could not connect to the game server.")
    })

    // Fire the creation event to the backend
    tictactoeSocket.emit('createRoom', { hostName: cleanName });

    // Listen for the backend to hand back the generated 'T***' room code
    tictactoeSocket.once('roomCreated', ({ roomCode }) => {
        console.log(`Tic-Tac-Toe room created! Code: ${roomCode}`);
        // Redirect the host directly to the board with the server-generated code
        navigate(`/tictactoe?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}