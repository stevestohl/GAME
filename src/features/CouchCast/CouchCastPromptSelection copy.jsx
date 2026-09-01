import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastPromptSelection({ 
    isCastScreen, 
    isJudge, 
    judgeName, 
    roomCode,
    prompts = [] 
}) {
    // 🚨 Set timer to 15 seconds
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    
    // 🚨 State for the TV roulette highlight
    const [highlightIndex, setHighlightIndex] = useState(0);

    // Helper to safely extract text from MongoDB objects
    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt"; 
    };

    // --- LOGIC: The Countdown & Auto-Pick ---
    useEffect(() => {
        if (timeLeft <= 0) {
            // If time runs out, the JUDGE automatically picks a random prompt
            // (We let the Judge do it so the backend correctly authenticates the host)
            if (isJudge && !selectedPrompt && prompts.length > 0) {
                const randomPick = prompts[Math.floor(Math.random() * prompts.length)];
                socket.emit('select_prompt', { roomCode, selectedPrompt: randomPick });
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isJudge, prompts, roomCode, selectedPrompt]);

    // --- LOGIC: The TV Juggling Effect ---
    useEffect(() => {
        if (!isCastScreen || timeLeft <= 0 || prompts.length === 0) return;

        // Change the highlighted card every 250ms
        const roulette = setInterval(() => {
            setHighlightIndex((prev) => (prev + 1) % prompts.length);
        }, 250);

        return () => clearInterval(roulette);
    }, [isCastScreen, timeLeft, prompts.length]);

    const handlePromptSubmit = () => {
        if (!selectedPrompt) return;
        socket.emit('select_prompt', { roomCode, selectedPrompt });
    };

    // ==========================================
    // 1. CAST SCREEN (The TV / Shared Display)
    // ==========================================
    if (isCastScreen) {
        if (prompts.length === 0) return <Spinner animation="border" variant="primary" className="mt-5" />;

        return (
            <Container fluid className='mt-5 d-flex flex-column align-items-center text-center px-5'>
                <h1 className='display-5 fw-bold text-primary mb-5'>
                    <span className="text-warning">{judgeName}</span> is picking the poison...
                </h1>
                
                {/* 🚨 The 3 Juggling Cards */}
                <div className="d-flex justify-content-center align-items-stretch gap-4 w-100 mb-5" style={{ maxWidth: '1200px' }}>
                    {prompts.map((p, idx) => {
                        const isHighlighted = highlightIndex === idx;
                        return (
                            <Card 
                                key={idx} 
                                className={`shadow-sm transition-all ${isHighlighted ? 'border-primary bg-primary text-white' : 'border-light bg-light text-muted'}`}
                                style={{ 
                                    flex: '1', 
                                    transform: isHighlighted ? 'scale(1.08)' : 'scale(0.95)',
                                    transition: 'transform 0.15s ease-in-out, background-color 0.15s',
                                    borderWidth: isHighlighted ? '4px' : '1px'
                                }}
                            >
                                <Card.Body className="d-flex align-items-center justify-content-center p-4">
                                    <h3 className="fw-bold m-0">{getPromptText(p)}</h3>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
                
                {/* Timer Bar */}
                <div className='w-100' style={{ maxWidth: '600px' }}>
                    <div className='display-4 fw-bold text-secondary mb-3'>
                        {timeLeft}
                    </div>
                    <ProgressBar 
                        animated 
                        now={(timeLeft / 15) * 100} 
                        variant={timeLeft <= 5 ? 'danger' : 'info'} 
                        style={{ height: '20px' }}
                    />
                </div>
            </Container>
        );
    }

    // ==========================================
    // 2. JUDGE SCREEN (The Host selecting)
    // ==========================================
    if (isJudge) {
        return (
            <Container className='mt-4 d-flex justify-content-center'>
                <Card className='shadow-sm w-100' style={{ maxWidth: '420px' }}>
                    <Card.Body className='text-center'>
                        <Card.Title className='fw-bold mb-3 fs-4 text-primary'>
                            Set the Vibe
                        </Card.Title>
                        <p className='text-muted mb-3'>Pick 1 of the 3 prompts below.</p>

                        {/* Mobile Timer */}
                        <h4 className={`fw-bold mb-4 ${timeLeft <= 5 ? 'text-danger' : 'text-info'}`}>
                            ⏱️ {timeLeft}s
                        </h4>

                        <div className='d-flex flex-column mb-4' style={{ gap: '10px' }}>
                            {prompts.map((promptObj, index) => (
                                <Button
                                    key={index}
                                    variant={selectedPrompt === promptObj ? 'primary' : 'outline-secondary'}
                                    className='text-start p-3 text-wrap'
                                    onClick={() => setSelectedPrompt(promptObj)}
                                >
                                    {getPromptText(promptObj)}
                                </Button>
                            ))}
                        </div>

                        <Button 
                            variant={selectedPrompt ? 'success' : 'secondary'} 
                            size='lg' 
                            className='w-100 fw-bold' 
                            disabled={!selectedPrompt}
                            onClick={handlePromptSubmit}
                        >
                            {selectedPrompt ? "Make 'Em Write!" : "Select a Prompt"}
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 3. PLAYER SCREEN (Waiting for the Judge)
    // ==========================================
    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100 border-warning' style={{ maxWidth: '420px' }}>
                <Card.Body className='text-center p-5'>
                    <Spinner animation="grow" variant="warning" className='mb-4' style={{ width: '3rem', height: '3rem' }} />
                    <Card.Title className='fw-bold fs-4 text-dark mb-2'>
                        Hold Your Horses...
                    </Card.Title>
                    <Card.Text className='text-muted fs-6'>
                        <strong>{judgeName}</strong> is judging their options. <br/>({timeLeft}s left)
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}