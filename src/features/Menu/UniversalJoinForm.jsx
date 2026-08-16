import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

export default function UniversalJoinScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Grab the room code from the QR URL if present
    const urlRoomCode = searchParams.get('roomCode');

    const [roomCode, setRoomCode] = useState(urlRoomCode || '');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        if (savedName) setPlayerName(savedName);
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        setError('');
        
        const code = roomCode.toUpperCase().trim();
        if (!playerName.trim() || code.length !== 4) {
            setError('Please enter a valid 4-letter room code and your nickname.');
            return;
        }

        // 🎯 Prefix Routing Logic
        const prefix = code.charAt(0);
        let targetRoute = '';

        switch (prefix) {
            case 'C':
                targetRoute = `/couchcast?room=${code}&role=guest&name=${encodeURIComponent(playerName.trim())}`;
                break;
            case 'P':
                targetRoute = `/prompt2?room=${code}&role=guest&name=${encodeURIComponent(playerName.trim())}`;
                break;
            case 'T':
                targetRoute = `/tictactoe?room=${code}&role=guest&name=${encodeURIComponent(playerName.trim())}`;
                break;
            default:
                setError(`Hmm, we don't recognize a game starting with '${prefix}'. Check the TV!`);
                return; 
        }

        // Save name preference and navigate to the separate game page
        localStorage.setItem('templePlayerName', playerName.trim());
        navigate(targetRoute);
    };

    return (
        <div className="d-flex justify-content-center align-items-start pt-5 p-1" style={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
            <Card className='shadow-sm w-100 border-0' style={{ maxWidth: '400px' }}>
                <Card.Body className='p-4 text-center'>
                    <div className='mb-4'>
                        <h2 className='fw-bold text-primary mb-1'>Game Temple</h2>
                        <p className='text-muted'>Player Portal</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleJoin}>
                        <Form.Group className='mb-3 text-start'>
                            <Form.Label className='fw-bold text-secondary small'>Room Code</Form.Label>
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

                        <Form.Group className='mb-4 text-start'>
                            <Form.Label className='fw-bold text-secondary small'>Your Name</Form.Label>
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
                            className='w-100 fw-bold shadow-sm mb-2' 
                            type="submit"
                        >
                            Jump In!
                        </Button>

                        <Button 
                            variant='outline-secondary' 
                            size='sm' 
                            className='w-100 mt-2'
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}