import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

// 📜 More answers than fit on the screen: drift slowly down through them, rest at the bottom,
// glide back to the top and go again, so everyone can read every answer without anyone scrolling.
const SCROLL_SPEED = 22;      // pixels per second
const SCROLL_REST_MS = 3000;  // pause at the top and at the bottom

function useSlowScroll(ref, active) {
    useEffect(() => {
        const box = ref.current;
        if (!active || !box) return undefined;

        const TICK_MS = 40;
        let position = 0;      // kept as a fraction: scrollTop rounds to whole pixels
        let restUntil = Date.now() + SCROLL_REST_MS;
        let atBottom = false;

        const timer = setInterval(() => {
            const now = Date.now();
            if (now < restUntil) return;
            const max = box.scrollHeight - box.clientHeight;
            if (max <= 2) return;   // it all fits (answers can still grow, so keep checking)

            if (atBottom) {
                // Rested at the bottom: glide back up, rest at the top, then start again
                box.scrollTo({ top: 0, behavior: 'smooth' });
                position = 0;
                atBottom = false;
                restUntil = now + SCROLL_REST_MS;
                return;
            }
            position = Math.min(max, position + (SCROLL_SPEED * TICK_MS) / 1000);
            box.scrollTop = position;
            if (position >= max) {
                atBottom = true;
                restUntil = now + SCROLL_REST_MS;
            }
        }, TICK_MS);

        box.scrollTop = 0;
        return () => clearInterval(timer);
    }, [ref, active]);
}

export default function CouchCastJudgingTV({ 
    currentPrompt, 
    submissions, 
    judgeName, 
    endTime,
    winningSubmission 
}) {
    // 📜 The answers scroll themselves when there are more than fit
    const answersRef = useRef(null);
    useSlowScroll(answersRef, !winningSubmission && submissions?.length > 0);

    // Add state to track device orientation for the overlay
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    // Countdown to the judge's deadline (after it, a random answer wins)
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endTime) {
            setTimeLeft(null);
            return;
        }
        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    // Listen for screen rotation
    useEffect(() => {
        const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

            <div className="d-flex flex-column h-100 p-3 pb-4 w-100">
                
                {/* The Prompt Header */}
                <h2 className="fullscreen-gameplay-header text-center mb-3 text-wrap text-break px-3" style={{ fontSize: 'clamp(1.5rem, 4vh, 2.5rem)' }}>
                    "{currentPrompt?.text || currentPrompt}"
                </h2>

                {/* Main Content Area */}
                <div className="d-flex flex-column flex-grow-1 overflow-auto align-items-center w-100" style={{ minHeight: 0 }}>
                    {!winningSubmission ? (
                        /* --- STATE 1: WAITING FOR JUDGE --- */
                        <div className="w-100 d-flex flex-column align-items-center flex-grow-1" style={{ minHeight: 0 }}>
                            <h4 className="text-white fw-bold mb-3 text-center" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                                {submissions && submissions.length > 0
                                    ? `${judgeName} is deciding the winner! Read them aloud:`
                                    : 'Time is up!'}
                                {timeLeft !== null && (
                                    <span className={`ms-3 ${timeLeft <= 10 ? 'text-danger' : ''}`}>⏱️ {timeLeft}s</span>
                                )}
                            </h4>
                            
                            <div ref={answersRef} className="w-100 flex-grow-1 overflow-auto custom-scrollbar" style={{ minHeight: 0 }}>
                            <Row className="w-100 justify-content-center m-0 px-2">
                                {submissions && submissions.length > 0 ? (
                                    submissions.map((sub, index) => (
                                        <Col md={6} lg={4} key={index} className="mb-3">
                                            <div className="shining-border-wrapper h-100">
                                                <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                                                    <Card.Body className="d-flex align-items-center justify-content-center p-3 text-center">
                                                        <h3 className="fw-bold text-dark m-0" style={{ fontSize: 'clamp(1.1rem, 2.5vh, 1.5rem)' }}>
                                                            {sub.answer}
                                                        </h3>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </Col>
                                    ))
                                ) : (
                                    <h3 className="text-white fw-bold text-center mt-5">No one submitted anything! How embarrassing.<br />On to the next round...</h3>
                                )}
                            </Row>
                            </div>
                        </div>
                    ) : (
                        /* --- STATE 2: THE WINNER REVEAL --- */
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100" style={{ maxWidth: '800px' }}>
                            <h2 className="fw-bold mb-3" style={{ color: '#ffd700', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', fontSize: 'clamp(2rem, 5vh, 3.5rem)' }}>
                                WINNER!
                            </h2>
                            
                            <div className="shining-border-wrapper w-100">
                                <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(15px)', border: '3px solid #198754' }}>
                                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4 p-md-5">
                                        <h2 className="text-center fw-bold text-dark mb-4 display-5" style={{ fontSize: 'clamp(1.8rem, 4vh, 3rem)' }}>
                                            "{winningSubmission.answer}"
                                        </h2>
                                        
                                        <Badge bg="success" className="fs-3 p-3 shadow-sm rounded-pill" style={{ fontSize: 'clamp(1.2rem, 3vh, 1.5rem)' }}>
                                            Submitted by: {winningSubmission.playerName}
                                        </Badge>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}