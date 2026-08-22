import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function UniversalJoinForm({ playerName }) {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        const code = roomCode.toUpperCase().trim();
        const prefix = code.charAt(0);

        // 1. Dispatcher Logic: Map prefix to path
        let path = '';
        switch (prefix) {
            case 'T': path = '/tictactoe'; break;
            case 'R': path = '/TriviaWaitingRoom'; break;
            case 'P': path = '/prompt2'; break;
            default: return alert("Invalid room code format. Codes must start with T, R, or P.");
        }

        // 2. Navigate to the game
        // Pass the name and role to the game component
        navigate(`${path}?room=${code}&role=guest&name=${encodeURIComponent(playerName || 'Guest')}`);
    };

    return (
        <Form onSubmit={handleJoin} className="d-flex flex-column gap-2 mt-1">
            <InputGroup size="md">
                <Form.Control 
                    type="text" 
                    placeholder="CODE" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    maxLength={4}
                    className="text-center fw-bold tracking-widest text-uppercase"
                    autoComplete="off"
                />
                <Button 
                    variant="primary" 
                    type="submit" 
                    className="fw-bold px-3"
                    disabled={roomCode.trim().length !== 4}
                >
                    Join
                </Button>
            </InputGroup>
        </Form>
    );
}