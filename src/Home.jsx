import React, { useState } from 'react'
import { Button, Card, Form, InputGroup, Row, Col } from 'react-bootstrap'

// 1. Import your logo at the top
import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg" 

export default function Home() {
    // Hook up state to caputre room code
    const [roomCode, setRoomCode] = useState("")

    const handleHostTicTacToe = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let generatedCode = 'T'; 

        for (let i = 0; i < 3; i++) {
            generatedCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        // Route them instantly as a host!
        window.location.href = `/tictactoe?room=${generatedCode}&role=host`;
    };


    // function to handle room entry later
    const handleJoinRoom = (e) => {
        e.preventDefault()
        if(!roomCode) return alert("Jeff, enter a rooom!")

        const cleanCode = roomCode.toUpperCase().trim()
        const gameTypeIdentifier = cleanCode.charAt(0)

        // Route guest player based on first roomcode letter
        switch (gameTypeIdentifier) {
            case 'T':
                console.log(`Routing to Tic Tac Toe Room Code: ${cleanCode}`)
                window.location.href=`/tictactoe?room=${cleanCode}`
                break
            case 'F':
                console.log(`Routing to Future Game Room Code: ${cleanCode}`)
                window.location.href=`/futureGame?room=${cleanCode}`
                break
            default:
                alert("Room not found! Blame Jeff")
        }

        console.log(`Connecting o room: ${roomCode}. (If this doesn't work, blame Jeff. He's bald.)`)
        alert(`Connecting to server for room: ${roomCode}... (Feature comming faster than Jeff can fall down a flight of stairs)`)
        // Future code: socket.emit('join-room', roomCode) or redirecting to /game/${roomCode}
    }


    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark p-3">
            <Card className='text-center shadow-lg border-0' style={{ maxWidth: "450px", width: "100%"}}>
                <Card.Header as="h5" className="bg-primary text-white py-3 fw-bold tracking-wide">
                    GAME-TEMPLE DASHBOARD
                </Card.Header>
                <Card.Body className='p-4'>
                    {/* Logo wrapper */}
                    <div className="mb-4 bg-light p-3 rounded-3 d-inline-block shadow-sm">
                        <img 
                        src={gameLogo}
                        alt="Game-Temple Logo"
                        style={{ maxWidth: "140px", height:"auto"}}
                        />
                    </div>
                    {/* Room Selection */}
                    <Card.Title className="fw-bold fs-4 mb-3 text-secondary">Enter Room</Card.Title>
                    <Form onSubmit={handleJoinRoom} className="mb-4 mx-auto" style={{ maxWidth: "320px"}}>
                        <InputGroup size="lg">
                            <Form.Control
                                type="text"
                                placeholder="This doesn't work yet... Jeff"
                                className="text-center fw-bold tracking-wider"
                                maxLength={4}
                                value={roomCode}
                                // Capitlize letters automatically
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            />
                            <Button variant='primary' type="submit" className="fw-bold px-4">
                                Enter
                            </Button>
                        </InputGroup>
                    </Form>

                    <hr className="my-4 text-muted" />

                    {/* Naviation Menu Grid */}
                    <Card.Title className="fw-bold text-muted fs-6 uppercase mb-3">Single Player and Tools</Card.Title>
                    <Row className="g-2">
                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/FlashcardGame' className="fw-semibold align-items-center justify-content-center">
                                🍹Drink Game🍹
                            </Button>
                        </Col>
                            <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/FlashcardsList' className="fw-semibold align-items-center justify-content-center">
                                Flashcard List
                            </Button>
                        </Col>

                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/Flashcards' className="fw-semibold align-items-center justify-content-center">
                                Flashcards
                            </Button>
                        </Col>

                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" onClick={handleHostTicTacToe} className="fw-semibold d-flex align-items-center justify-content-center h-100 py-0">
                                Create Tic-Tac-Toe Room
                            </Button>
                        </Col>

                        <Col xs={6} className='d-grid'>
                            <Button variant='primary' size="lg" href='/report' className="fw-semibold align-items-center justify-content-center">
                                PlaceHolder
                            </Button>
                        </Col>
                        
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}