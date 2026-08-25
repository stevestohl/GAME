import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { prompt2Socket } from '../../socket.js'; // Check this path based on your folder structure
import { getRandomFunnyName } from '../../funnyNames.js'; // Check this path based on your folder structure

export default function Prompt2CreateScreen() {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    // Pull saved name on mount
    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setPlayerName(savedName || getRandomFunnyName());
    }, []);

    const handleRandomizeName = () => {
        setPlayerName(getRandomFunnyName());
    };

    const handleCreateRoom = (e) => {
        e.preventDefault();
        
        const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
        console.log(`Request Prompt2 Room creation for ${cleanName}`);
        
        setIsCreatingRoom(true);
        localStorage.setItem('templePlayerName', cleanName);

        // 1. Set the timeout
        const timeout = setTimeout(() => {
            setIsCreatingRoom(false);
            alert("The server is taking too long to wake up. Please try again.");
            prompt2Socket.off('roomcreated');
        }, 60000);

        // 2. Helper to emit the create event
        const emitCreate = () => {
            prompt2Socket.emit('createRoom', { playerName: cleanName });
        };

        // 3. Setup the Success Listener
        prompt2Socket.off('roomcreated'); // Clean slate
        prompt2Socket.once('roomcreated', ({ roomCode }) => {
            clearTimeout(timeout); // Stop the timeout if we succeed!
            console.log(`Prompt2 room created successfully! Code: ${roomCode}`);
            setIsCreatingRoom(false);
            
            // Navigate straight to the Prompt2Manager with host details
            navigate(`/prompt2?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
        });

        // 4. Handle Connection
        if (prompt2Socket.connected) {
            emitCreate();
        } else {
            console.warn("Socket disconnected! Waiting for connection to emit...");
            prompt2Socket.connect();
            
            prompt2Socket.once('connect', () => {
                console.log("Socket connected, now emitting createRoom...");
                emitCreate();
            });
        }
    };

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className='main-card-header'>
                    Host Prompt2
                </Card.Header>
                <Card.Body className='p-4 text-center'>
                    <div className='mb-4'>
                        <h2 className='fw-bold text-primary mb-1'>Ready to Play?</h2>
                        <p className='text-muted'>Pick your host name and generate a room code.</p>
                    </div>

                    <Form onSubmit={handleCreateRoom}>
                        <Form.Group className='mb-4 text-start'>              
                            <Form.Label className='fw-bold text-secondary small'>Host Name</Form.Label>
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
                                    disabled={isCreatingRoom}
                                />
                                <Button 
                                    variant="outline-primary" 
                                    type="button"
                                    onClick={handleRandomizeName}
                                    title="Generate Random Name"
                                    className="px-3 fs-5"
                                    disabled={isCreatingRoom}
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
                            disabled={isCreatingRoom}
                        >
                            {isCreatingRoom ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Creating Room...
                                </>
                            ) : (
                                'Create Room'
                            )}
                        </Button>

                        <Button 
                            variant='outline-secondary' 
                            size='sm' 
                            className='w-100 mt-2'
                            onClick={() => navigate('/')}
                            disabled={isCreatingRoom}
                        >
                            Back to Home
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}