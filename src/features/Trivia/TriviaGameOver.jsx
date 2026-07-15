import React from 'react';
import { Container, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { triviaSocket as socket } from '../../socket.js';

export default function GameOverScreen({ players, roomCode, isHost }) {
    // Sort players to find the ultimate winner
    const standings = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const winner = standings[0];

    const handleRestart = () => {
        socket.emit('nextRound', { roomCode }); 
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-lg w-100 text-center border-0" style={{ maxWidth: '440px', background: '#f8f9fa' }}>
                <Card.Body className="py-5 px-4">
                    <div className="fs-1 mb-2">🏆</div>
                    <Card.Title className="fs-2 fw-bold text-dark mb-1">Game Over!</Card.Title>
                    <Card.Text className="text-muted mb-4">Final Standings</Card.Text>

                    {winner && (
                        <div className="p-3 mb-4 rounded-3 border bg-white shadow-sm" style={{ borderColor: '#ffd700' }}>
                            <span className="text-muted small d-block uppercase fw-bold tracking-wider text-warning">Grand Champion</span>
                            <span className="fs-3 fw-black text-dark">{winner.name}</span>
                            <span className="d-block text-success fw-bold fs-5 mt-1">{winner.score || 0} Points</span>
                        </div>
                    )}

                    {/* Fixed py-2.5 typo to standard Bootstrap py-2 */}
                    <ListGroup className="mb-4 text-start shadow-sm rounded border">
                        {standings.slice(1).map((player, index) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center py-2 bg-white">
                                <div>
                                    <span className="text-muted me-2 small">#{index + 2}</span>
                                    <span className="fw-semibold text-secondary">{player.name}</span>
                                </div>
                                <Badge bg="secondary" className="rounded-pill">{player.score || 0} pts</Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* Normalized Actions Stack Container */}
                    <div className="d-grid gap-2 mt-4">
                        {isHost ? (
                            <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleRestart}>
                                Play Again
                            </Button>
                        ) : (
                            <div className="text-muted small py-2.5 border border-dashed rounded bg-white text-center">
                                ⏳ Waiting for the host to start a new match...
                            </div>
                        )}
                        
                        <Button 
                            variant="outline-primary" 
                            className="w-100 fw-bold py-2 shadow-sm" 
                            onClick={() => window.location.href = '/home'}
                        >
                            Home
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}