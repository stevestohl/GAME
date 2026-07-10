import React, { useState } from 'react';
import { Form, Button, Card, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const handleCreateTttRoom = (playerName, navigate) => {
    const nameToUse = playerName.trim() || 'Host';
    
    // Generates 3 random characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomChars = ''; 

    for (let i = 0; i < 3; i++) {
        randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const newRoomCode = `T${randomChars}`;

    // Execute navigation
    navigate(`/tictactoe?room=${newRoomCode}&role=host&name=${encodeURIComponent(nameToUse)}`);
};

export default function TttLobby() {
    const [playerName, setPlayerName] = useState("");
    const [roomInput, setRoomInput] = useState("");
    const navigate = useNavigate();

    // 🤝 GUEST: Validate code format and route to game page
    const handleJoinRoom = (e) => {
        e.preventDefault(); // Stops the page from reloading
        const cleanInput = roomInput.toUpperCase().trim();
        const nameToUse = playerName.trim() || 'Guest';

        if (!cleanInput || cleanInput.length < 4) {
            return alert("Please enter a valid 4-letter room code!");
        }
        
        if (cleanInput.charAt(0) !== 'T') {
            return alert("Whoops! Tic-Tac-Toe room codes must start with the letter 'T'.");
        }
        
        navigate(`/tictactoe?room=${cleanInput}&role=guest&name=${encodeURIComponent(nameToUse)}`);
    };

    return (
        <Card.Body className='p-4'>
            <Form style={{ maxWidth: "340px" }} className="mx-auto" onSubmit={handleJoinRoom}>
                
                {/* Global Step 1: Identity */}
                <Card.Title className="fw-bold fs-5 mb-3 text-secondary text-center">Enter Your Name</Card.Title>
                <Form.Control
                    type="text"
                    placeholder="Your Name (e.g., Alex)"
                    className="text-center fw-bold mb-4 size-lg"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />

                <hr className="my-4" />

                {/* Option A: Host a room */}
                <Card.Title className="fw-bold fs-5 mb-2 text-secondary text-center">Start a Match</Card.Title>
                <div className="d-grid mb-4">
                    {/* ✅ FIXED: Now calls the helper above and passes state context */}
                    <Button 
                        type="button" 
                        variant="primary" 
                        size="lg" 
                        size="lg" 
                        className="fw-bold" 
                        onClick={() => handleCreateTttRoom(playerName, navigate)}
                    >
                        Host / Create New Room
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