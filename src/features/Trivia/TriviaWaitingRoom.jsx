import React from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { triviaSocket as socket } from '../../socket.js';
import BlueBerries from '../../assets/logos/Prompt2Blueberries.gif';

export default function TriviaWaitingRoom({ roomCode, role, players = [], socketId }) {
    const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;

    const handleStartGame = () => {
        socket.emit('startGame', { roomCode });
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em', fontSize: '0.85rem' }}
                >
                    TRIVIA ROOM CREATED
                </Card.Header>

                <Card.Body className="text-center py-3">
                    <Card.Title className="fs-4 fw-bold mb-2 text-primary">Trivia Waiting Room</Card.Title>

                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-sm">
                        <img src={BlueBerries} alt="BlueBerries" className="img-fluid" style={{ maxWidth: "110px", height: "auto" }} />
                    </div>

                    <div className="my-3 bg-light border border-secondary rounded p-3 text-center">                            
                        <span className="text-uppercase tracking-wider small fw-bold text-muted d-block mb-1">Room Code</span>                            
                        <span className="fs-3 fw-black text-dark tracking-widest mb-3 d-block">{roomCode}</span>
                        
                        <div className="bg-white p-2 rounded border d-inline-block shadow-sm">
                            <QRCodeCanvas value={joinUrl} size={120} level={"M"} includeMargin={true} />
                            <span className="text-muted small d-block mt-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                                Scan to Join Room Direct
                            </span>
                        </div>
                    </div>                            

                    <h5 className="text-start fw-bold mb-2 px-1 fs-6">
                        Players Joined <Badge bg="secondary" className="ms-2">{players.length}</Badge>
                    </h5>
                    
                    <ListGroup className="mb-3 text-start border border-secondary rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {players.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center py-2 fw-semibold small">
                                <span>{player.name}</span>
                                {player.id === socketId ? (
                                    <Badge bg="primary">You</Badge>
                                ) : (
                                    <span className="text-muted small">Ready</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {role === 'host' ? (
                        <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleStartGame}>
                            Start Game
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for host to launch the match...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}