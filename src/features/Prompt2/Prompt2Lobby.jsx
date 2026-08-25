import React from 'react';
import { Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';
import { QRCodeSVG } from 'qrcode.react'; // Make sure this matches what you used in Trivia!

export default function Prompt2Lobby({ roomCode, players = [], isHost }) {
    
    const handleShowRules = () => {
        console.log("[Lobby] Clicked 'All in!' - Emitting showRules event for room:", roomCode);
        socket.emit('showRules', { roomCode });
    };

    // Generate the URL that points to our shiny new Universal Join Form!
    const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;

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
                    
                    <Card.Title className="fs-3 fw-bold mb-1 text-primary">Prompt2 Lobby</Card.Title>
                    
                    {/* Image Container */}
                    <div className="my-2 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img
                            src='https://game-temple.org/Prompt2Logo.gif'
                            alt="Prompt2Logo"
                            className="img-fluid"
                            style={{ maxWidth: "140px", height: "auto" }}
                        />
                    </div>

                    {/* Room Code & QR Code Container */}
                    <div className="bg-light p-3 rounded mb-4 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase mb-1">Room Code</span>
                        <span className="fs-2 fw-bold text-dark tracking-wide d-block mb-3">{roomCode}</span>
                        
                        {/* QR Code Section */}
                        <Card className="d-inline-block shadow-sm border-0 mb-2 p-2">
                            <QRCodeSVG value={joinUrl} size={140} level={"H"} />
                        </Card>
                        <div className="text-muted small fw-semibold">Scan to Join Room Direct</div>
                    </div>
                    
                    {/* Players Header with Count Badge */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-start mb-0 fw-semibold">Players Joined</h5>
                        <Badge bg="secondary" className="rounded-pill px-3">{players.length}</Badge>
                    </div>

                    {/* Players List */}
                    <ListGroup className="mb-4 text-start shadow-sm">
                        {players.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center py-2">
                                <span className="fw-bold">{player.name}</span>
                                {player.isPlayerHost ? (
                                    <Badge bg="primary" className="rounded-pill">Host / Judge</Badge>
                                ) : (
                                    <Badge bg="success" className="rounded-pill">Ready</Badge>
                                )}
                            </ListGroup.Item>
                        ))}
                        {players.length === 0 && (
                            <ListGroup.Item className="text-center text-muted fst-italic">
                                Waiting for players...
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                    
                    {/* Host Action Buttons */}
                    {isHost ? (
                        <Button 
                            variant="primary" 
                            className="w-100 fw-bold py-2 fs-5 shadow-sm"
                            disabled={players.length < 2}
                            onClick={handleShowRules}
                        >
                            {players.length < 2 ? 'Waiting for Players...' : 'Start Game!'}
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for the host to launch the match...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}