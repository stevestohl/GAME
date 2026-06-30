import React from 'react';
import { Container, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import socket from '../socket.js';

export default function ScoreboardScreen({ roomCode, players, isHost }) {
    const handleNextRound = () => {
        socket.emit('nextRound', { roomCode });
    };

    // Keep highest ranking profile at array position index 0
    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-1 text-primary">Round Standings</Card.Title>
                    <Card.Text className="text-muted small mb-4">Temple-Trivia Leaderboard</Card.Text>

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
                                        <Badge bg="info" className="ms-2 text-dark font-normal">You</Badge>
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
                            Advance Stage ➡️
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            ⏳ Waiting for host to load the next round...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}