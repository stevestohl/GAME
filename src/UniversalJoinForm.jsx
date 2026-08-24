import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { getRandomFunnyName } from '../../funnyNames.js';

export default function UniversalJoinScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || '');
    // Accepts 'room' or 'roomCode' from URL parameters
    const urlRoomCode = searchParams.get('room') || searchParams.get('roomCode');

    const [roomCode, setRoomCode] = useState(urlRoomCode || '');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setPlayerName(savedName || getRandomFunnyName());
    }, []);

    useEffect(() => {
        if (urlRoomCode) {
            setRoomCode(urlRoomCode.toUpperCase().trim());
        }
    }, [urlRoomCode]);

    useEffect(() => {
        if (location.state?.toastMessage) {
            setToastMsg(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleRandomizeName = () => {
        setPlayerName(getRandomFunnyName());
    };

    const handleJoin = (e) => {
        e.preventDefault();
        setError('');
        
        const code = roomCode.toUpperCase().trim();
        if (!playerName.trim() || code.length !== 4) {
            setError('Please enter a valid 4-letter room code and your nickname.');
            return;
        }

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
            case 'R':
                // FIXED: Now properly passes role and name just like the other games
                targetRoute = `/trivia?room=${code}&role=guest&name=${encodeURIComponent(playerName.trim())}`;
                break;
            default:
                setError(`Hmm, we don't recognize a game starting with '${prefix}'. Check the TV!`);
                return; 
        }

        localStorage.setItem('templePlayerName', playerName.trim());
        navigate(targetRoute);
    };

    return (
        <div className="page-container">

            {/* Floating Toast Notification */}
            <ToastContainer 
                style={{ 
                    position: 'fixed', 
                    top: '20px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 99999 
                }}
            >
                <Toast show={!!toastMsg} onClose={() => setToastMsg('')} delay={4000} autohide bg="danger">
                    <Toast.Body className="fw-bold text-white text-center px-4 py-2">
                        ⚠️ {toastMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className='main-card'>
                <Card.Header className='main-card-header'>
                    Join a Room
                </Card.Header>
                <Card.Body className='p-4 text-center'>
                    <div className='mb-4'>
                        <h2 className='fw-bold text-primary mb-1'>
                            {urlRoomCode ? `Joining Room ${urlRoomCode.toUpperCase()}` : 'Have a Room Code?'}
                        </h2>
                        {!urlRoomCode && <h2 className='fw-bold text-primary mb-1'>Enter it Here!</h2>}
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleJoin}>
                    
                    {/* Room Code entry */}
                    <Form.Group className='mb-3 text-start'>
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className='fw-bold text-secondary small mb-0'>Room Code</Form.Label>
                            {urlRoomCode && (
                                <span className="text-success small fw-bold">
                                    ✅ Room Verified & Locked
                                </span>
                            )}
                        </div>
                        <Form.Control 
                            size="lg"
                            type="text" 
                            placeholder="4-Letter Code" 
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase().trim())}
                            maxLength={4}
                            className='text-center fw-bold fs-4 bg-light text-success' 
                            style={{ letterSpacing: '4px' }}
                            disabled={!!urlRoomCode}
                            required
                        />
                        {urlRoomCode && (
                            <Form.Text className="text-muted text-center d-block mt-1">
                                You're joining room <strong>{urlRoomCode.toUpperCase()}</strong>. Just pick your name and jump in!
                            </Form.Text>
                        )}
                    </Form.Group>

                        <Form.Group className='mb-4 text-start'>              
                            <Form.Label className='fw-bold text-secondary small'>Your Name</Form.Label>
                            <InputGroup>
                                <Form.Control 
                                    size="lg"
                                    type="text" 
                                    placeholder="Enter your nickname" 
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    maxLength={12}
                                    className='text-center fw-bold'
                                    required
                                />
                                <Button 
                                    variant="outline-primary" 
                                    type="button"
                                    onClick={handleRandomizeName}
                                    title="Generate Random Name"
                                    className="px-3 fs-5"
                                >
                                    🎲
                                </Button>
                            </InputGroup>
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