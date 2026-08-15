import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastPromptSelection({ 
    isCastScreen, 
    isJudge, 
    judgeName, 
    roomCode,
    prompts = [
        "What's the worst thing to say at a funeral?",
        "Name a sequel that shouldn't exist.",
        "What's hiding under my bed?"
    ] // Defaulting with dummy data for testing
}) {
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    // Local timer countdown for the Cast screen
    useEffect(() => {
        if (!isCastScreen) return; // Only the main screen needs to run the visual timer

        if (timeLeft === 0) {
            // Optional: Auto-select a random prompt or trigger a timeout event here
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isCastScreen]);

    const handlePromptSubmit = () => {
        if (!selectedPrompt) return;
        
        console.log(`Sending selected prompt for room: ${roomCode}`);
        socket.emit('promptSelected', { roomCode, prompt: selectedPrompt });
    };

    // ==========================================
    // 1. CAST SCREEN (The TV / Shared Display)
    // ==========================================
    if (isCastScreen) {
        return (
            <Container className='mt-5 d-flex flex-column align-items-center text-center'>
                <h1 className='display-5 fw-bold text-primary mb-4'>
                    <span className="text-warning">{judgeName}</span> is picking the poison...
                </h1>
                
                <Card className='shadow-sm w-100 p-4' style={{ maxWidth: '600px' }}>
                    <div className='display-1 fw-bold text-secondary mb-3'>
                        {timeLeft}
                    </div>
                    <ProgressBar 
                        animated 
                        now={(timeLeft / 20) * 100} 
                        variant={timeLeft <= 5 ? 'danger' : 'info'} 
                        style={{ height: '20px' }}
                    />
                    <div className='mt-3 text-muted fs-5'>
                        Seconds remaining to set the vibe!
                    </div>
                </Card>
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
                        <p className='text-muted mb-4'>Pick 1 of the 3 prompts below.</p>

                        <div className='d-flex flex-column mb-4' style={{ gap: '10px' }}>
                            {prompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant={selectedPrompt === prompt ? 'primary' : 'outline-secondary'}
                                    className='text-start p-3 text-wrap'
                                    onClick={() => setSelectedPrompt(prompt)}
                                >
                                    {prompt}
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
                        <strong>{judgeName}</strong> is currently judging their options. Prepare your best answers!
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}