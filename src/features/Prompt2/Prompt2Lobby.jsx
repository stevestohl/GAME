import React from 'react';
import { Container, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';
//import Prompt2Logo from '../../assets/logos/Prompt2Logo.gif';

export default function Prompt2Lobby({ roomCode, players =[], isHost }) {
    
    const handleShowRules = () => {
        console.log("[Lobby] Clicked 'All in!' - Emitting showRules event for room:", roomCode);
        socket.emit('showRules', { roomCode });
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="shadow-sm w-100" style={{ maxWidth: '450px' }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    PROMPT2 ROOM CREATED
                </Card.Header>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-1 text-primary">Waiting For Players to Join...</Card.Title>
                                        {/* Image Container */}
                    <div className="my-2 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img
                            src='https://game-temple.org/Prompt2Logo.gif'
                            alt="Prompt2Logo"
                            className="img-fluid"
                            style={{ maxWidth: "140px", height: "auto" }}
                        />
                    </div>
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
                            {players.length < 2 ? 'Waiting for Players' : 'All in!'}
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for the host to show rules...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}