import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastWinnerReveal({ roomCode, isJudge, winner, nextHostName, isGameOver, isWinner }) {
    
    const handleNextRound = () => {
        console.log(`[CouchCast] Starting next round for room ${roomCode}`);
        socket.emit('nextRound', { roomCode });
    };

    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100 text-center border-0 bg-light" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-success text-white py-3 border-0">
                    <h4 className="mb-0 fw-bold tracking-widest text-uppercase">Round Over</h4>
                </Card.Header>
                
                <Card.Body className="p-4">
                    {/* Personalized message based on if THEY won */}
                    {isWinner ? (
                        <div className="mb-4">
                            <div className="display-1 mb-2">🏆</div>
                            <h2 className="fw-bold text-success">You Won!</h2>
                            <p className="text-muted fw-bold">Your answer was legendary.</p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="display-3 mb-2">🎉</div>
                            <h3 className="fw-bold text-primary">{winner?.name} Wins!</h3>
                            <p className="text-muted">Better luck next time.</p>
                        </div>
                    )}

                    <hr className="my-4" />

                    {/* Navigation for the next phase */}
                    {isGameOver ? (
                        <div className="mt-4">
                            <h4 className="text-danger fw-bold">Game Over!</h4>
                            <p className="text-muted">Look at the TV for the final standings.</p>
                        </div>
                    ) : (
                        <div className="mt-4">
                            {isJudge ? (
                                <>
                                    <h5 className="text-warning fw-bold text-uppercase tracking-widest mb-3">
                                        You are the next Judge!
                                    </h5>
                                    <Button 
                                        variant="warning" 
                                        size="lg" 
                                        className="w-100 fw-bold py-3 shadow-sm text-dark border-0"
                                        onClick={handleNextRound}
                                    >
                                        Start Next Round
                                    </Button>
                                </>
                            ) : (
                                <p className="text-muted fs-5">
                                    Waiting for <strong className="text-dark">{nextHostName}</strong> to start the next round...
                                </p>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}