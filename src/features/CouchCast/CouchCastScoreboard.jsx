import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function CouchCastScoreboard({ playerData, players }) {
    const navigate = useNavigate();

    // Determine the player's final rank
    const rankedPlayers = players
        .filter(p => !p.isCaster)
        .sort((a, b) => b.score - a.score);
    
    const myRank = rankedPlayers.findIndex(p => p.id === playerData.id) + 1;
    const isWinner = myRank === 1;

    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100 text-center border-0 bg-light" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-dark text-white py-3 border-0">
                    <h4 className="mb-0 fw-bold tracking-widest text-uppercase">Game Over</h4>
                </Card.Header>
                
                <Card.Body className="p-5">
                    {isWinner ? (
                        <div className="mb-4">
                            <div className="display-1 mb-2">🏆</div>
                            <h2 className="fw-bold text-success">Ultimate Champion!</h2>
                            <p className="text-muted fw-bold">You destroyed the competition.</p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="display-3 mb-2">👏</div>
                            <h2 className="fw-bold text-primary">Good Effort.</h2>
                            <p className="text-muted">But not good enough to win.</p>
                        </div>
                    )}

                    <div className="p-3 bg-white border rounded shadow-sm mb-4">
                        <div className="fs-5 text-muted fw-bold text-uppercase mb-1">Your Final Score</div>
                        <div className="display-4 fw-bold text-dark">{playerData.score}</div>
                        <div className="mt-2 text-secondary fw-semibold">
                            Rank: #{myRank} out of {rankedPlayers.length}
                        </div>
                    </div>

                    <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 fw-bold py-3 shadow-sm"
                        onClick={() => navigate('/home')} // Sends them back to your main menu
                    >
                        Return to Hub
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}