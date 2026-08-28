import React from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function CouchCastScoreboard({ playerData, players, isGameOver }) { // 👈 Catching isGameOver
    const navigate = useNavigate();

    // Determine the player's rank
    const rankedPlayers = players
        .filter(p => !p.isCaster)
        .sort((a, b) => b.score - a.score);
    
    const myRank = rankedPlayers.findIndex(p => p.id === playerData.id) + 1;
    const isFirstPlace = myRank === 1;

    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100 text-center border-0 bg-light" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-dark text-white py-3 border-0">
                    <h4 className="mb-0 fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>
                        {isGameOver ? 'Game Over' : 'Current Standings'}
                    </h4>
                </Card.Header>
                
                <Card.Body className="p-5">
                    {isFirstPlace ? (
                        <div className="mb-4">
                            <div className="display-1 mb-2">🏆</div>
                            <h2 className="fw-bold text-success">
                                {isGameOver ? 'Ultimate Champion!' : 'You are in the lead!'}
                            </h2>
                            <p className="text-muted fw-bold">
                                {isGameOver ? 'You destroyed the competition.' : 'Keep it up!'}
                            </p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="display-3 mb-2">{isGameOver ? '👏' : '👀'}</div>
                            <h2 className="fw-bold text-primary">
                                {isGameOver ? 'Good Effort.' : 'Time to catch up!'}
                            </h2>
                            <p className="text-muted">
                                {isGameOver ? 'But not good enough to win.' : 'You can still win this round!'}
                            </p>
                        </div>
                    )}

                    <div className="p-3 bg-white border rounded shadow-sm mb-4">
                        <div className="fs-5 text-muted fw-bold text-uppercase mb-1">
                            {isGameOver ? 'Final Score' : 'Current Score'}
                        </div>
                        <div className="display-4 fw-bold text-dark">{playerData.score}</div>
                        <div className="mt-2 text-secondary fw-semibold">
                            Rank: #{myRank} out of {rankedPlayers.length}
                        </div>
                    </div>

                    {/* Conditional render: Leave the room OR wait for next round */}
                    {isGameOver ? (
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="w-100 fw-bold py-3 shadow-sm"
                            onClick={() => navigate('/')} 
                        >
                            Return to Hub
                        </Button>
                    ) : (
                        <div className="mt-4 text-muted fw-bold d-flex flex-column align-items-center">
                            <Spinner animation="border" variant="secondary" className="mb-3" />
                            <div>Look at the TV! Next round starting soon...</div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}