import React, { useState } from 'react';
import { Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { db } from './firebaseConfig.js';

export default function TttLobby() {
    const [roomInput, setRoomInput] = useState("");
    const navigate = useNavigate();

    const handleCreateRoom = async () => {
        const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
        const newRoomCode = `T${randomChars}`;

        await set(ref(db, `rooms/${newRoomCode}`), {
            status: 'waiting',
            hostName: 'Player 1',
            guestName: '',
            board: Array(9).fill(null),
            isNext: true
        });

        navigate(`/tictactoe?room=${newRoomCode}&role=host&name=Player 1`);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault(); // Stops the page from reloading
        const cleanInput = roomInput.toUpperCase().trim();

        if (!cleanInput || cleanInput.length < 4) {
            return alert("Please enter a valid 4-letter room code!");
        }
        
        if (cleanInput.charAt(0) !== 'T') {
            return alert("Whoops! Tic-Tac-Toe room codes must start with the letter 'T'.");
        }
        
        navigate(`/tictactoe?room=${cleanInput}&role=guest&name=Player 2`);
    };

    return (
        <Card.Body className='p-4'>
            {/* The form submission handles the manual join */}
            <Form style={{ maxWidth: "340px" }} className="mx-auto" onSubmit={handleJoinRoom}>
                
                {/* Option A: Host a room */}
                <Card.Title className="fw-bold fs-5 mb-2 text-secondary text-center">Start a Match</Card.Title>
                <div className="d-grid mb-4">
                    {/* CRITICAL FIX: added type="button" so hitting Enter doesn't trigger hosting */}
                    <Button type="button" variant="primary" size="lg" className="fw-bold" onClick={handleCreateRoom}>
                        👑 Host / Create New Room
                    </Button>
                </div>

                <div className="text-muted small fw-bold my-2 text-center">— OR JOIN MANUALLY —</div>

                {/* Option B: Join an explicit code */}
                <InputGroup size="lg">
                    <Form.Control
                        type="text"
                        placeholder="EX: TABC"
                        className="text-center fw-bold"
                        style={{ letterSpacing: "0.15em" }}
                        maxLength={4}
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    />
                    {/* CRITICAL FIX: added type="submit" so it pairs perfectly with the form */}
                    <Button type="submit" variant="success" className="fw-bold px-3">
                        Join
                    </Button>
                </InputGroup>
            </Form>

            <div className="mt-4 text-center">
                <Button variant="link" href="/home" className="text-muted text-decoration-none btn-sm">
                    ← Back to Main Menu
                </Button>
            </div>
        </Card.Body>
    );
}