import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'

export default function UniversalJoinScreen() {
    const [searchParams] = useSearchParams()
    
    // Now we ONLY need the roomCode from the QR URL!
    const urlRoomCode = searchParams.get('roomCode')

    const [roomCode, setRoomCode] = useState(urlRoomCode || '')
    const [playerName, setPlayerName] = useState('')
    const [selectedGame, setSelectedGame] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName')
        if (savedName) setPlayerName(savedName)
    }, [])

    const handleJoin = (e) => {
        e.preventDefault()
        setError('')
        
        const code = roomCode.toUpperCase().trim()
        if (!playerName.trim() || code.length !== 4) return;

        // 🎯 Prefix Routing Logic
        const prefix = code.charAt(0)
        let gameType = ''

        switch (prefix) {
            case 'C':
                gameType = 'couchcast'
                break
            case 'P':
                gameType = 'prompt2'
                break
            case 'T':
                gameType = 'tictactoe'
                break
            default:
                setError(`Hmm, we don't recognize a game starting with '${prefix}'. Check the TV!`)
                return // Stop them from joining an invalid game
        }

        // If valid, save name and trigger render
        localStorage.setItem('templePlayerName', playerName.trim())
        setSelectedGame(gameType)
    }

    // ==========================================
    // 1. ROUTE TO SPECIFIC GAME VIEW
    // ==========================================
    if (selectedGame) {
        switch (selectedGame) {
            case 'couchcast':
                return <div>CouchCast Setup Component goes here! Room: {roomCode}</div>
            case 'prompt2':
                return <div>Prompt2 Setup Component goes here! Room: {roomCode}</div>
            case 'tictactoe':
                return <div>TicTacToe Component goes here! Room: {roomCode}</div>
            default:
                return null
        }
    }

    // ==========================================
    // 2. MAIN JOIN FORM
    // ==========================================
    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100 border-0' style={{ maxWidth: '400px', backgroundColor: '#f8f9fa' }}>
                <Card.Body className='p-4'>
                    <div className='text-center mb-4'>
                        <h2 className='fw-bold text-primary mb-1'>Game Temple</h2>
                        <p className='text-muted'>Player Portal</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleJoin}>
                        <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold text-secondary'>Room Code</Form.Label>
                            <Form.Control 
                                size="lg"
                                type="text" 
                                placeholder="4-Letter Code" 
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
                                maxLength={4}
                                className='text-center fw-bold fs-4'
                                style={{ letterSpacing: '4px' }}
                                disabled={!!urlRoomCode}
                                required
                            />
                        </Form.Group>

                        <Form.Group className='mb-4'>
                            <Form.Label className='fw-bold text-secondary'>Your Name</Form.Label>
                            <Form.Control 
                                size="lg"
                                type="text" 
                                placeholder="Enter your nickname" 
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                maxLength={12}
                                className='text-center'
                                required
                            />
                        </Form.Group>

                        <Button 
                            variant='primary' 
                            size='lg' 
                            className='w-100 fw-bold shadow-sm' 
                            type="submit"
                        >
                            Jump In!
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}