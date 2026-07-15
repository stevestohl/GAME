import React from 'react';
import { Container, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { triviaSocket as socket } from '../../socket.js';

export default function ScoreboardScreen({ roomCode, players, isHost }) {
    const handleNextRound = () => {
        socket.emit('advanceFromScoreboard', { roomCode });
    };

    // Keep highest ranking profile at array position index 0
    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>        
            <Card className="text-center shadow-lg border-0 w-100" style={{ maxWidth: "450px" }}>
                <Card.Header
                    as="h5"
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}
                >
                    TRIVIA-TEMPLE
                </Card.Header>
                
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-3 text-primary">Scores</Card.Title>
                    {/* <Card.Text className="text-muted small mb-4">Temple-Trivia Leaderboard</Card.Text> */}

                    <ListGroup className="mb-4 text-start border border-secondary rounded shadow-inner">
                        {sortedPlayers.map((player, index) => (
                            <ListGroup.Item 
                                key={player.id} 
                                className="d-flex justify-content-between align-items-center py-2.5 fw-semibold"
                            >
                                <div className="d-flex align-items-center">
                                    <span className="text-muted me-2 small">#{index + 1}</span>
                                    <span>{player.name}</span>
                                    {player.id === socket.id && (
                                        <Badge bg="info" className="ms-2 text-white font-normal">You</Badge>
                                    )}
                                </div>
                                <Badge bg="success" className="fs-6 py-1.5 px-2.5 rounded-pill">
                                    {player.score || 0} pts
                                </Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {isHost ? (
                        <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleNextRound}>
                            Advance Stage
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            ⏳ Waiting for host to load the next round...
                        </div>
                    )}

                </Card.Body>
            </Card>
        </div>
    );
}