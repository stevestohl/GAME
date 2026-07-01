// UniversalJoinForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';

export default function UniversalJoinForm({ playerName }) {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const handleJoinRoom = (e) => {
        e.preventDefault();
        
        // Safety guard clause in case someone bypasses HTML disabled state
        if (roomCode.trim().length !== 4) return;

        const cleanCode = roomCode.trim().toUpperCase();
        const finalGuestName = playerName && playerName.trim() ? playerName.trim() : 'Guest';

        console.log(`Joining room ${cleanCode} as player: ${finalGuestName}`);
        navigate(`/TriviaWaitingRoom?room=${cleanCode}&role=guest&name=${encodeURIComponent(finalGuestName)}`);
    };

    return (
        <Form onSubmit={handleJoinRoom} className="d-flex flex-column gap-2 mt-1">
            <Form.Group controlId="formRoomCode">
                <Form.Control 
                    type="text" 
                    placeholder="CODE" // Swapped to a classic 4-letter example code 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    maxLength={4}
                    className="text-center fw-bold tracking-widest text-uppercase"
                    autoComplete="off"
                />
            </Form.Group>
            
            {/* The disabled attribute checks the real-time trimmed state length */}
            <Button 
                variant="primary" 
                type="submit" 
                className="fw-bold w-100"
                disabled={roomCode.trim().length !== 4}
            >
                Join
            </Button>
        </Form>
    );
}