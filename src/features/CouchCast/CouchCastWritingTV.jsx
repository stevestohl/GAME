import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';

export default function CouchCastWritingTV({ currentPrompt, endTime, players, hostId, defaultDuration = 60 }) {
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [totalTime, setTotalTime] = useState(defaultDuration);

    // Sync timer perfectly with the backend's absolute endTime and compute total duration
    useEffect(() => {
        if (!endTime) return;
        
        const initialRemaining = Math.floor((endTime - Date.now()) / 1000);
        const calculatedTotal = initialRemaining > 0 ? initialRemaining : defaultDuration;
        setTotalTime(calculatedTotal);

        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        
        updateTime(); // Run once immediately
        const timer = setInterval(updateTime, 1000);
        
        return () => clearInterval(timer);
    }, [endTime, defaultDuration]);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    // Filter out the TV (Caster) and the Judge (Host) so we only map the writers
    const activeWriters = players.filter(p => p.id !== hostId && !p.isCaster);

    return (
        <div className="fullscreen-gameplay-container d-flex flex-column h-100 p-4 w-100 align-items-center justify-content-between">
            
            {/* Header / Prompt Section */}
            <div className="w-100 text-center flex-shrink-0" style={{ maxWidth: '900px' }}>
                <h2 className="text-warning fw-bold mb-3 fs-3">The Prompt is...</h2>
                
                <Card className="shadow-lg border-0 bg-white bg-opacity-25 text-white mb-4" style={{ backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                    <Card.Body className="p-4 p-md-5">
                        <h1 className="fw-bold m-0" style={{ fontSize: 'clamp(1.5rem, 4vh, 2.8rem)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                            {getPromptText(currentPrompt)}
                        </h1>
                    </Card.Body>
                </Card>
            </div>

            {/* TV Sync Timer Bar */}
            <div className="w-100 my-2 px-3 flex-shrink-0" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <span className="fw-bold text-white fs-5" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>Time Remaining</span>
                    <span className={`fw-bold fs-3 ${timeLeft <= 10 ? 'text-danger' : 'text-white'}`} style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                        {timeLeft}s
                    </span>
                </div>
                <ProgressBar 
                    animated 
                    now={(timeLeft / totalTime) * 100} 
                    variant={timeLeft <= 10 ? 'danger' : 'light'} 
                    style={{ 
                        height: '20px', 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        backdropFilter: 'blur(5px)',
                        borderRadius: '10px' 
                    }} 
                />
            </div>

            {/* Grid of Players Writing */}
            <div className="w-100 flex-grow-1 d-flex align-items-center justify-content-center my-3" style={{ maxWidth: '1000px' }}>
                <Row className="justify-content-center g-3 w-100">
                    {activeWriters.map(player => (
                        <Col xs={6} md={3} key={player.id}>
                            <Card 
                                className={`shadow-sm h-100 border-0 transition-all ${player.hasSubmitted ? 'bg-success text-white' : 'text-white'}`}
                                style={{ 
                                    backgroundColor: player.hasSubmitted ? 'rgba(25, 135, 84, 0.85)' : 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    transform: player.hasSubmitted ? 'scale(1.03)' : 'scale(1)',
                                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                                    borderRadius: '12px',
                                    minHeight: '120px'
                                }}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3 text-center">
                                    <h4 className="fw-bold mb-3 text-truncate w-100" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        {player.name}
                                    </h4>
                                    {player.hasSubmitted ? (
                                        <span className="fs-3 m-0">✅</span>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2">
                                            <Spinner animation="grow" variant="light" size="sm" />
                                            <small className="text-white-50 fw-semibold">Writing...</small>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

        </div>
    );
}