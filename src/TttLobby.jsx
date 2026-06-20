import React, { useState } from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'

export default function TttLobby() {
    const [screenName, setScreenName] = useState("")
    const [roomInput, setRoomInput] = useState("")

    // Action: Host a brand-new match from this lobby screen
    const handleCreateRoom = (e) => {
        e.preventDefault()
        const finalName = screenName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`

        // Generate a random 4-letter room ID starting with 'T'
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let generatedCode = 'T' 
        for (let i = 0; i < 3; i++) {
            generatedCode += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        // Push everything to the URL parameters to alert the main controller
        window.location.href = `/tictactoe?room=${generatedCode}&role=host&name=${encodeURIComponent(finalName)}`
    }

    // Action: Manual fallback join
    const handleJoinRoom = (e) => {
        e.preventDefault()
        const cleanInput = roomInput.toUpperCase().trim()

        if (!cleanInput || cleanInput.length < 4) {
            return alert("Please enter a valid 4-letter room code!")
        }
        
        if (cleanInput.charAt(0) !== 'T') {
            return alert("Whoops! Tic-Tac-Toe room codes must start with the letter 'T'.")
        }
        
        const finalName = screenName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`
        
        // Push guest into the URL loop
        window.location.href = `/tictactoe?room=${cleanInput}&role=guest&name=${encodeURIComponent(finalName)}`
    }

    return (
        <Card.Body className='p-4'>
            <Form style={{ maxWidth: "340px" }} className="mx-auto">
                
                {/* Step 1: Identity */}
                <Card.Title className="fw-bold fs-5 mb-2 text-secondary">Set Your Screen Name</Card.Title>
                <Form.Control 
                    type="text" 
                    placeholder="Enter nickname (Optional)..." 
                    className="text-center mb-4 size-lg"
                    maxLength={12}
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                />

                <hr className="my-3 text-muted" />

                {/* Step 2, Option A: Host a room */}
                <Card.Title className="fw-bold fs-5 mb-2 text-secondary">Start a Match</Card.Title>
                <div className="d-grid mb-4">
                    <Button variant="primary" size="lg" className="fw-bold" onClick={handleCreateRoom}>
                        👑 Host / Create New Room
                    </Button>
                </div>

                <div className="text-muted small fw-bold my-2">— OR JOIN MANUALLY —</div>

                {/* Step 2, Option B: Join an explicit code */}
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
                    <Button variant='success' className="fw-bold px-3" onClick={handleJoinRoom}>
                        Join
                    </Button>
                </InputGroup>
            </Form>

            <div className="mt-4">
                <Button variant="link" href="/home" className="text-muted text-decoration-none btn-sm">
                    ← Back to Main Menu
                </Button>
            </div>
        </Card.Body>
    )
}