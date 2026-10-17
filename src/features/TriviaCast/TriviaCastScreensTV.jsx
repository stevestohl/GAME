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

// 🎬 How the wrong answers leave the screen at the reveal. Each question uses the next one,
// so a game shows them all: smashed like glass, walking off on little legs, or eaten by Chompy.
const REVEAL_EFFECTS = ['shatter', 'walk', 'chomp'];

// The glass shards: pieces of the answer card that fly apart (x / y in vmin, spin in degrees)
const SHARDS = [
    { clip: 'polygon(0 0, 46% 0, 31% 56%, 0 42%)',               dx: -34, dy: -22, rot: -28 },
    { clip: 'polygon(46% 0, 100% 0, 100% 36%, 56% 52%, 31% 56%)', dx: 30,  dy: -26, rot: 32 },
    { clip: 'polygon(100% 36%, 100% 100%, 71% 100%, 56% 52%)',   dx: 38,  dy: 24,  rot: 38 },
    { clip: 'polygon(56% 52%, 71% 100%, 31% 100%, 31% 56%)',     dx: 6,   dy: 40,  rot: -16 },
    { clip: 'polygon(0 42%, 31% 56%, 31% 100%, 0 100%)',         dx: -40, dy: 26,  rot: -36 },
];

/** One answer card */
function OptionCard({ option, index, state = '' }) {
    return (
        <div className={`tc-option ${state}`}>
            <span className="tc-option-letter">{LETTERS[index]}</span>
            <span className="tc-option-text">{option}</span>
            {state.includes('correct') && <span className="tc-option-tick">✅</span>}
        </div>
    );
}

/** Chompy: our own hungry little round fellow (with a bow, so nobody mistakes him for anyone famous) */
function Chompy() {
    return (
        <svg viewBox="0 0 100 100" className="tc-chompy" aria-hidden="true">
            <g className="tc-jaw top">
                <path d="M50 50 L100 50 A50 50 0 0 0 0 50 Z" />
                <circle cx="56" cy="24" r="7" className="tc-chompy-eye" />
            </g>
            <g className="tc-jaw bottom">
                <path d="M50 50 L0 50 A50 50 0 0 0 100 50 Z" />
            </g>
            <path d="M30 6 L44 14 L30 22 Z M58 6 L44 14 L58 22 Z" className="tc-chompy-bow" />
            <circle cx="44" cy="14" r="4" className="tc-chompy-bow" />
        </svg>
    );
}

/**
 * One answer during the reveal: the right one zooms in, the wrong ones leave with the round's effect.
 * `order` staggers the wrong answers so they go one after another.
 */
function RevealOption({ option, index, isCorrect, effect, order, optionCount }) {
    if (isCorrect) {
        // Glide to the middle of the answer area, then grow: half a card's width/height toward the centre
        const column = index % 2;
        const row = Math.floor(index / 2);
        const rows = Math.ceil(optionCount / 2);
        const center = {
            '--cx': column === 0 ? 0.5 : -0.5,
            '--cy': rows > 1 ? (row === 0 ? 0.5 : -0.5) : 0,
        };
        return (
            <div className="tc-slot tc-slot-correct" style={center}>
                <OptionCard option={option} index={index} state="correct tc-zoom" />
            </div>
        );
    }

    const style = { '--delay': `${order * 0.35}s`, '--dir': index % 2 === 0 ? -1 : 1 };

    if (effect === 'shatter') {
        return (
            <div className="tc-slot tc-fx-shatter" style={style}>
                {/* Keeps the slot its normal size while the pieces fly */}
                <div className="tc-placeholder"><OptionCard option={option} index={index} state="wrong" /></div>
                {SHARDS.map((shard, i) => (
                    <div
                        key={i}
                        className="tc-shard"
                        style={{ clipPath: shard.clip, WebkitClipPath: shard.clip, '--dx': `${shard.dx}vmin`, '--dy': `${shard.dy}vmin`, '--rot': `${shard.rot}deg` }}
                    >
                        <OptionCard option={option} index={index} state="wrong" />
                    </div>
                ))}
                <svg className="tc-cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M46 0 L31 56 L0 42 M31 56 L56 52 L100 36 M56 52 L71 100 M31 56 L31 100" />
                </svg>
            </div>
        );
    }

    if (effect === 'walk') {
        return (
            <div className="tc-slot tc-fx-walk" style={style}>
                <div className="tc-walker">
                    <OptionCard option={option} index={index} state="wrong" />
                    <div className="tc-legs" aria-hidden="true">
                        <span className="tc-leg left" />
                        <span className="tc-leg right" />
                    </div>
                </div>
            </div>
        );
    }

    // 'chomp'
    return (
        <div className="tc-slot tc-fx-chomp" style={style}>
            <div className="tc-eaten"><OptionCard option={option} index={index} state="wrong" /></div>
            <div className="tc-chompy-runner"><Chompy /></div>
        </div>
    );
}

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
    const revealEffect = REVEAL_EFFECTS[(Math.max(1, room.currentRound) - 1) % REVEAL_EFFECTS.length];

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

                {/* The four answers (at the reveal, the wrong ones make their exit) */}
                <div className="tc-options flex-grow-1" style={{ minHeight: 0 }}>
                    {question.options.map((option, i) => {
                        if (!isReveal) {
                            return (
                                <div key={option} className="tc-slot">
                                    <OptionCard option={option} index={i} />
                                </div>
                            );
                        }
                        const wrongOrder = question.options.filter((o, j) => j < i && o !== correctAnswer).length;
                        return (
                            <RevealOption
                                key={option}
                                option={option}
                                index={i}
                                isCorrect={option === correctAnswer}
                                effect={revealEffect}
                                order={wrongOrder}
                                optionCount={question.options.length}
                            />
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
