import React from 'react';
import { Container, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';

export default function Prompt2Lobby({ roomCode, players =[], isHost }) {
    
    const handleShowRules = () => {
        console.log("[Lobby] Clicked 'All in!' - Emitting showRules event for room:", roomCode);
        socket.emit('showRules', { roomCode });
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    
                    <Card.Title className="fs-3 fw-bold mb-1 text-success">Waiting Room</Card.Title>
                    <p className="text-muted small mb-4">Game: Judge Style Arena</p>
                    
                    <div className="bg-light p-3 rounded mb-4 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase">Room Code</span>
                        <span className="fs-2 fw-bold text-dark tracking-wide">{roomCode}</span>
                    </div>
                    
                    <h5 className="text-start mb-2 fw-semibold">Players Joined:</h5>
                    <ListGroup className="mb-4 text-start">
                        {players.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {player.isPlayerHost && (
                                    <Badge bg="primary" className="rounded-pill">Host / Judge</Badge>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    
                    {isHost ? (
                        <Button 
                            variant="primary" 
                            className="w-100 fw-bold py-2"
                            disabled={players.length < 2}
                            onClick={handleShowRules}
                        >
                            {players.length < 2 ? 'Waiting for Players (Min 3)' : 'All in!'}
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for the host to show rules...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}