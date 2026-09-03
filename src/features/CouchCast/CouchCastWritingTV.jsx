import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';

export default function CouchCastWritingTV({ currentPrompt, endTime, players, hostId, defaultDuration = 60 }) {
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [totalTime, setTotalTime] = useState(defaultDuration);
    const [isPortrait, setIsPortrait] = useState(false);

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

    // Detect if the device is in portrait mode
    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        
        // Check immediately on mount
        checkOrientation();
        
        // Listen for resizes or orientation changes
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        
        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    // Filter out the TV (Caster) and the Judge (Host) so we only map the writers
    const activeWriters = players.filter(p => p.id !== hostId && !p.isCaster);

    return (
        <div className="fullscreen-gameplay-container">
            
            {/* --- LANDSCAPE REMINDER OVERLAY --- */}
            {isPortrait && (
                <div className="landscape-overlay">
                    <svg viewBox="0 0 24 24" className="rotate-device-icon">
                        <path d="M16 1H8C6.9 1 6 1.9 6 3V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V3C18 1.9 17.1 1 16 1ZM16 19H8V5H16V19Z" />
                    </svg>
                    <h2 className="fw-bold mb-3">Rotate Your Device</h2>
                    <p className="fs-5">Couch Cast is best experienced in landscape mode!</p>
                </div>
            )}            
            
            {/* Header / Prompt Section - Now with Simmering Border & Frosted Glass */}
            <div className="w-100 text-center flex-shrink-0 mb-2 px-3" style={{ maxWidth: '900px' }}>
                <div className="shining-border-wrapper" style={{ borderRadius: '15px' }}>
                    <Card className="border-0 text-white w-100 frosted-glass-panel" style={{ borderRadius: '10px' }}>
                        <Card.Body className="p-3 p-md-4">
                            <h2 className="text-primary fw-bold mb-2 fs-4 text-uppercase" style={{ letterSpacing: '2px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                The Prompt is...
                            </h2>
                            <h1 className="fw-bold m-0" style={{ fontSize: 'clamp(1.2rem, 3.5vh, 2.2rem)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                {getPromptText(currentPrompt)}
                            </h1>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* TV Sync Timer Bar */}
            <div className="w-100 my-2 px-3 flex-shrink-0" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-1 px-1">
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
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }} 
                />
            </div>

            {/* Grid of Players Writing */}
            <div className="w-100 flex-grow-1 overflow-auto custom-scrollbar my-2 px-3 pb-2 d-flex justify-content-center align-items-start" style={{ maxWidth: '1000px', minHeight: 0 }}>
                {/* 1. Changed g-3 to g-2 to tighten vertical grid gap */}
                <Row className="justify-content-center g-2 w-100 m-0">
                    {activeWriters.map(player => (
                        <Col xs={6} md={3} key={player.id}>
                            <Card 
                                className={`shadow-sm h-100 border-0 transition-all frosted-glass-panel ${player.hasSubmitted ? 'bg-success bg-opacity-75 text-white' : 'text-white'}`}
                                style={{ 
                                    transform: player.hasSubmitted ? 'scale(1.03)' : 'scale(1)',
                                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                                    borderRadius: '12px',
                                    minHeight: '80px' // 2. Reduced from 110px
                                }}
                            >
                                {/* 3. Changed p-3 to p-2 */}
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2 text-center">
                                    {/* 4. Changed mb-3 to mb-1 and added fs-5 */}
                                    <h4 className="fw-bold mb-1 text-truncate w-100 fs-5" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        {player.name}
                                    </h4>
                                    {player.hasSubmitted ? (
                                        <span className="fs-4 m-0" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))' }}>✅</span>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2 mt-1">
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