import React, { useState } from 'react'
import { Button, Card, Form, InputGroup, Row, Col } from 'react-bootstrap'

export default function TicTacToe() {
    // Automatically check the URL bar for a room parameter on load
    const getRoomFromUrl = () => {
        const params = new URLSearchParams(window.location.search)
        return params.get('room') // Looks for '?room=TABC'
    }

    const [screenName, setScreenName] = useState("")
    const [roomInput, setRoomInput] = useState("") 
    
    // Initialize activeRoom directly from the URL if it exists
    const [activeRoom, setActiveRoom] = useState(getRoomFromUrl()) 
    const [isHost, setIsHost] = useState(!getRoomFromUrl()) // If code came from URL, they are a guest!

    // 🔧 UPDATE: Automatically builds a "T" prefixed room code
    const handleCreateRoom = (e) => {
        e.preventDefault()
        const finalName = screenName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`
        setScreenName(finalName)

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let generatedCode = 'T' // 👈 Starts with T for Tic-Tac-Toe
        
        // Loop runs 3 times now (instead of 4) to fill out the remaining letters
        for (let i = 0; i < 3; i++) {
            generatedCode += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        setIsHost(true)
        setActiveRoom(generatedCode)
        console.log(`${finalName} hosted TicTacToe room: ${generatedCode}`)
    }

    // 🔧 UPDATE: Validates that manual entries inside this screen match the "T" prefix
    const handleJoinRoom = (e) => {
        e.preventDefault()
        const cleanInput = roomInput.toUpperCase().trim()

        if (!cleanInput || cleanInput.length < 4) {
            return alert("Please enter a valid 4-letter room code!")
        }
        
        // Safety guard: Prevent accidental Flashcard or Poker codes here
        if (cleanInput.charAt(0) !== 'T') {
            return alert("Whoops! Tic-Tac-Toe room codes must start with the letter 'T'.")
        }
        
        const finalName = screenName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`
        setScreenName(finalName)
        setIsHost(false)
        setActiveRoom(cleanInput)
    }

    const handleLeaveRoom = () => {
        setActiveRoom(null)
        setRoomInput("")
        // Clears the URL parameters back to normal when leaving
        window.history.replaceState({}, document.title, window.location.pathname)
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark p-3">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%" }}>
                
                {/* PHASE 1: NO ACTIVE ROOM MATCHMAKING */}
                {!activeRoom ? (
                    <>
                        <Card.Header as="h5" className="bg-primary text-white py-3 fw-bold tracking-wide">
                            ❌ TIC-TAC-TOE LOBBY ⭕
                        </Card.Header>
                        <Card.Body className='p-4'>
                            <Form style={{ maxWidth: "340px" }} className="mx-auto">
                                <Card.Title className="fw-bold fs-5 mb-2 text-secondary">Set Your Screen Name</Card.Title>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter nickname..." 
                                    className="text-center mb-4"
                                    maxLength={12}
                                    value={screenName}
                                    onChange={(e) => setScreenName(e.target.value)}
                                />
                                <hr className="my-3 text-muted" />
                                <div className="d-grid mb-3">
                                    <Button variant="primary" size="lg" className="fw-bold" onClick={handleCreateRoom}>
                                        👑 Host / Create New Room
                                    </Button>
                                </div>
                                <div className="text-muted small fw-bold my-2">— OR JOIN MANUALLY —</div>
                                <InputGroup size="lg">
                                    <Form.Control
                                        type="text"
                                        placeholder="EX: TABC" // 👈 Explicitly reminds users of the format
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
                        </Card.Body>
                    </>
                ) : (
                    
                    /* PHASE 2: ACTIVE GAME ROOM */
                    <>
                        <Card.Header as="h5" className="bg-success text-white py-3 d-flex justify-content-between align-items-center px-4">
                            <span className="fw-bold">🔑 ROOM: {activeRoom}</span>
                            <span className="badge bg-dark small">{isHost ? "Host" : "Guest"}</span>
                        </Card.Header>
                        <Card.Body className='p-4'>
                            
                            {!screenName && (
                                <Form className="mb-3 p-2 bg-light rounded shadow-sm" onSubmit={(e) => e.preventDefault()}>
                                    <Form.Label className="small fw-bold text-dark mb-1">Quick! Set your nickname:</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Type name..." 
                                        size="sm" 
                                        className="text-center"
                                        onChange={(e) => setScreenName(e.target.value)} 
                                    />
                                </Form>
                            )}

                            <div className="mb-3 text-muted small">
                                Current Player: <strong>{screenName || "Spectator"}</strong>
                            </div>

                            {/* PLAYBOARD CONTAINER */}
                            <div className="bg-light rounded p-4 mb-4 d-flex align-items-center justify-content-center" style={{ height: "250px", border: "2px dashed #ccc" }}>
                                <div className="text-dark">
                                    <h4 className="fw-bold mb-1">🎮 Tic-Tac-Toe Arena</h4>
                                    <p className="text-muted small mb-0">Connected to secure route branch: {activeRoom}</p>
                                </div>
                            </div>

                            <div className="d-grid">
                                <Button variant="danger" className="fw-bold" onClick={handleLeaveRoom}>
                                    Leave Matchmaking Room
                                </Button>
                            </div>
                        </Card.Body>
                    </>
                )}
            </Card>
        </div>
    )
}