import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Spinner, Badge } from 'react-bootstrap';

export default function CouchCastWritingTV({ currentPrompt, endTime, players, hostId }) {
    const [timeLeft, setTimeLeft] = useState(0);

    // Calculate remaining seconds based on the backend's absolute timestamp
    useEffect(() => {
        if (!endTime) return;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer(); // Run once immediately
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [endTime]);

    // Filter out the Caster and the Judge
    const activePlayers = players.filter(p => !p.isCaster && p.id !== hostId);

    return (
        <Container className="mt-5 d-flex flex-column align-items-center">
            {/* The Prompt */}
            <h2 className="text-warning fw-bold text-uppercase tracking-widest mb-2">The Prompt</h2>
            <h1 className="display-4 fw-bold text-white text-center bg-dark p-4 rounded shadow mb-5 w-100" style={{ maxWidth: '900px' }}>
                "{currentPrompt}"
            </h1>

            <Row className="w-100" style={{ maxWidth: '900px' }}>
                {/* The Timer */}
                <Col md={4} className="d-flex justify-content-center align-items-center mb-4">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-lg border border-5 ${timeLeft <= 10 ? 'border-danger text-danger bg-light' : 'border-primary text-primary bg-white'}`} 
                         style={{ width: '200px', height: '200px' }}>
                        <span className="display-1 fw-bold">{timeLeft}</span>
                    </div>
                </Col>

                {/* Player Submission Status */}
                <Col md={8}>
                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Body className="p-4">
                            <h3 className="fw-bold mb-4 text-center text-secondary">Awaiting Submissions...</h3>
                            <Row>
                                {activePlayers.map((player) => (
                                    <Col xs={6} key={player.id} className="mb-3">
                                        <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm border">
                                            {player.hasSubmitted ? (
                                                <div className="fs-3 me-3">✅</div>
                                            ) : (
                                                <Spinner animation="grow" variant="warning" size="sm" className="me-3" />
                                            )}
                                            <span className={`fs-4 fw-bold ${player.hasSubmitted ? 'text-success' : 'text-muted'}`}>
                                                {player.name}
                                            </span>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}