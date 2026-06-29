import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function UniversalJoinForm() {
    const [roomCode, setRoomCode] = useState("");
    const [playerName, setPlayerName] = useState(""); 
    const navigate = useNavigate();

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (!roomCode) return alert("Jeff, enter a room!");

        const cleanCode = roomCode.toUpperCase().trim();
        const gameTypeIdentifier = cleanCode.charAt(0);
        const nameParam = playerName.trim() || "Player 2";

        switch (gameTypeIdentifier) {
            case 'T':
                console.log(`Routing to Tic Tac Toe Room Code: ${cleanCode}`);
                navigate(`/tictactoe?room=${cleanCode}&role=guest&name=${encodeURIComponent(nameParam)}`); 
                break;
            case 'R':
                console.log(`Routing to Temple-Trivia: ${cleanCode}`);
                navigate(`/trivia?room=${cleanCode}&role=guest&name=${encodeURIComponent(nameParam)}`); 
                break;
            case 'F':
                console.log(`Routing to Future Game Room Code: ${cleanCode}`);
                navigate(`/futureGame?room=${cleanCode}&role=guest&name=${encodeURIComponent(nameParam)}`); 
                break;
            default:
                alert("Room not found! Blame Jeff.");
        }
    };

    return (
        <Form onSubmit={handleJoinRoom} className="mb-4 mx-auto" style={{ maxWidth: "320px" }}>
            <Form.Group className='mb-3'>
                <Form.Control
                    type="text"
                    placeholder="Enter 4-Letter Code"
                    className="text-center fw-bold tracking-wider border-secondary"
                    maxLength={4}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
            </Form.Group>
            

            <Form.Group className='mb-3'> 
                <Form.Control
                    type='text'
                    placeholder='Player Name'
                    className='text-center fw-bold tracking-wider border-secondary'
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}              
                />
            </Form.Group>
            
           <Button variant='primary' type="submit" className="fw-bold w-100">
                Enter Game
            </Button>
        </Form>
    );
}