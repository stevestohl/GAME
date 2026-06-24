import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function UniversalJoinForm() {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (!roomCode) return alert("Jeff, enter a room!");

        const cleanCode = roomCode.toUpperCase().trim();
        const gameTypeIdentifier = cleanCode.charAt(0);

        switch (gameTypeIdentifier) {
            case 'T':
                console.log(`Routing to Tic Tac Toe Room Code: ${cleanCode}`);
                navigate(`/tictactoe?room=${cleanCode}&role=guest&name=Player 2`);
                break;
            case 'F':
                console.log(`Routing to Future Game Room Code: ${cleanCode}`);
                navigate(`/futureGame?room=${cleanCode}&role=guest&name=Player 2`);
                break;
            default:
                alert("Room not found! Blame Jeff.");
        }
    };

    return (
        <Form onSubmit={handleJoinRoom} className="mb-4 mx-auto" style={{ maxWidth: "320px" }}>
            <InputGroup size="lg">
                <Form.Control
                    type="text"
                    placeholder="Enter 4-Letter Code"
                    className="text-center fw-bold tracking-wider"
                    maxLength={4}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
                <Button variant='primary' type="submit" className="fw-bold px-4">
                    Enter
                </Button>
            </InputGroup>
        </Form>
    );
}