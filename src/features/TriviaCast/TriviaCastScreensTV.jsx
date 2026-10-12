import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { triviaCastSocket as socket } from '../../socket';
import { speak, stopVoice } from '../../voice.js';

// 🎙️ What the host voice says while the rules are on screen
export const TRIVIA_CAST_RULES_NARRATION = [
    "Welcome to Trivia Cast! The quiz show where the TV asks the questions, and your phone is the buzzer.",
    "Each question appears on the big screen with four possible answers. Tap your answer on your phone before the clock runs out. Every right answer scores one hundred points.",
    "Let's get started!",
];

// If the voice stalls, start the game anyway this many seconds after the countdown ends
const NARRATION_GRACE_SECONDS = 20;

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Counts down to a server timestamp, in whole seconds
function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endTime) {
            setTimeLeft(null);
            return;
        }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [endTime]);

    return timeLeft;
}

/**
 * 📜 Rules screen (TV). The narrator reads the rules; when the voice finishes the game
 * starts. With no voice available, the countdown runs the show.
 */
export function TriviaCastRulesTV({ roomCode }) {
    const [timeLeft, setTimeLeft] = useState(30);
    const [isNarrating, setIsNarrating] = useState(true);
    const hasStarted = useRef(false);

    const handleNext = () => {
        if (hasStarted.current) return; // voice, countdown and Skip can all land here: only go once
        hasStarted.current = true;
        socket.emit('startQuestions', { roomCode });
    };

    useEffect(() => {
        let isCurrent = true;

        speak(TRIVIA_CAST_RULES_NARRATION, roomCode).then((wasSpoken) => {
            if (!isCurrent) return;
            setIsNarrating(false);
            if (wasSpoken) setTimeout(() => isCurrent && handleNext(), 800);
        });

        return () => {
            isCurrent = false;
            stopVoice();
        };
    }, [roomCode]);

    // The countdown waits at zero for the voice to finish its sentence
    useEffect(() => {
        if (timeLeft <= 0 && (!isNarrating || timeLeft <= -NARRATION_GRACE_SECONDS)) {
            handleNext();
            return;
        }
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, roomCode, isNarrating]);

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 p-3 pb-4 w-100">
                <h2 className="fullscreen-gameplay-header text-center">
                    How To Play Trivia Cast!
                </h2>

                <div className="d-flex flex-row flex-grow-1 gap-3" style={{ minHeight: 0 }}>
                    <div className="d-flex flex-column h-100" style={{ flex: '2 1 0', minWidth: 0 }}>
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column h-100" style={{ padding: 'clamp(0.5rem, 3vh, 1.5rem)', minHeight: 0 }}>
                                    <Card.Title
                                        className="fw-bold text-dark text-center flex-shrink-0 border-bottom border-secondary"
                                        style={{ fontSize: 'clamp(1rem, 3.5vh, 1.8rem)', paddingBottom: '0.6vh', marginBottom: '1.5vh' }}
                                    >
                                        RULES
                                    </Card.Title>

                                    <div className="d-flex flex-column flex-grow-1 px-2 px-md-3 overflow-auto custom-scrollbar" style={{ minHeight: 0 }}>
                                        <ol className="my-auto text-secondary d-flex flex-column" style={{ fontWeight: '500', fontSize: 'clamp(0.7rem, 3.3vh, 1.3rem)', lineHeight: 1.3, gap: 'clamp(0.3rem, 2vh, 1rem)' }}>
                                            <li>
                                                <strong className="text-dark">Watch the TV:</strong><br />
                                                Each question appears on the big screen with <strong>4 possible answers</strong>.
                                            </li>
                                            <li>
                                                <strong className="text-dark">Answer on Your Phone:</strong><br />
                                                Tap your answer before the clock runs out. You can't change it!
                                            </li>
                                            <li>
                                                <strong className="text-dark">Score Points:</strong><br />
                                                Every right answer scores <strong>100 points</strong>. Most points at the end wins!
                                            </li>
                                        </ol>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    <div className="d-flex flex-column h-100" style={{ flex: '1 1 0', minWidth: 0 }}>
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-between" style={{ padding: 'clamp(0.5rem, 3vh, 1rem)', minHeight: 0 }}>
                                    <Card.Title className="fw-bold text-dark mb-1 text-center flex-shrink-0" style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.4rem)' }}>
                                        GAME STARTS IN
                                    </Card.Title>

                                    <div className="fw-bold text-danger text-center" style={{ fontSize: 'clamp(2.5rem, 18vh, 6rem)', lineHeight: 1 }}>
                                        {Math.max(timeLeft, 0)}s
                                    </div>

                                    <Button variant='light' size='sm' className='w-100 fw-bold mt-auto py-2 shadow-sm' style={{ fontSize: '0.9rem' }} onClick={handleNext}>
                                        ⏭️ Skip
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ❔ Question screen (TV). Shows the question and four answers with a countdown.
 * When `correctAnswer` is given (the reveal), the right answer lights up green and
 * the screen lists who got it.
 */
export function TriviaCastQuestionTV({ room }) {
    const timeLeft = useCountdown(room.endTime);
    const { question, correctAnswer } = room;
    const isReveal = !!correctAnswer;

    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const answeredCount = players.filter((p) => p.hasAnswered).length;
    const winners = players.filter((p) => p.lastCorrect).sort((a, b) => b.lastPoints - a.lastPoints);

    // The full answering time, taken from the first tick, so the bar starts full
    const totalTime = useRef(null);
    if (!isReveal && timeLeft !== null && (totalTime.current === null || timeLeft > totalTime.current)) totalTime.current = timeLeft;
    const barPercent = totalTime.current ? (timeLeft / totalTime.current) * 100 : 100;

    if (!question) return <div className="fullscreen-gameplay-container" />;

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1100px' }}>

                <h2 className="fullscreen-gameplay-header mb-0">
                    Question {room.currentRound} of {room.totalRounds}
                    {question.category && <span className="tc-category">{question.category}</span>}
                </h2>

                {/* The question */}
                <div className="flex-shrink-0" style={{ margin: '1.5vh 0' }}>
                    <div className="shining-border-wrapper" style={{ height: 'auto', borderRadius: '15px' }}>
                        <Card className="border-0 text-white w-100 frosted-glass-panel" style={{ borderRadius: '10px' }}>
                            <Card.Body className="text-center" style={{ padding: 'clamp(0.4rem, 2.5vh, 1.5rem) 1rem' }}>
                                <h1 className="fw-bold m-0" style={{ fontSize: question.text.length > 90 ? 'clamp(0.95rem, 4.2vh, 2rem)' : 'clamp(1.1rem, 5.5vh, 2.6rem)', lineHeight: 1.2, textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                    {question.text}
                                </h1>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* The four answers */}
                <div className="tc-options flex-grow-1" style={{ minHeight: 0 }}>
                    {question.options.map((option, i) => {
                        const state = !isReveal ? '' : option === correctAnswer ? 'correct' : 'wrong';
                        return (
                            <div key={option} className={`tc-option ${state}`}>
                                <span className="tc-option-letter">{LETTERS[i]}</span>
                                <span className="tc-option-text">{option}</span>
                                {state === 'correct' && <span className="tc-option-tick">✅</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom strip: the clock while answering, the winners during the reveal */}
                <div className="flex-shrink-0" style={{ marginTop: '1.5vh', paddingRight: '7rem' }}>
                    {isReveal ? (
                        <div className="tc-results">
                            {winners.length === 0 ? (
                                <span className="fw-bold">Nobody got that one!</span>
                            ) : (
                                <>
                                    <span className="fw-bold me-2">Got it:</span>
                                    {winners.map((p) => (
                                        <span key={p.id} className="tc-result-chip">{p.name} <strong>+{p.lastPoints}</strong></span>
                                    ))}
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-1 px-1 text-white fw-bold" style={{ fontSize: 'clamp(0.8rem, 3.2vh, 1.4rem)', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                <span>{answeredCount} of {players.length} answered</span>
                                <span className={timeLeft !== null && timeLeft <= 5 ? 'text-danger' : ''}>{timeLeft ?? ''}s</span>
                            </div>
                            <ProgressBar
                                now={barPercent}
                                variant={timeLeft !== null && timeLeft <= 5 ? 'danger' : 'light'}
                                style={{ height: 'clamp(8px, 2vh, 18px)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
