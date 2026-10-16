import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { listsSocket as socket } from '../../socket';
import { speak, stopVoice } from '../../voice.js';

// 🎙️ What the host voice says while the List Cast rules are on screen
export const LIST_CAST_RULES_NARRATION = [
    "Welcome to List Cast! The game where it pays to know how your friends think.",
    "Each round starts with a card, then a list appears on the TV. Write your answers on your phone before the clock runs out.",
    "One on One: list ten, and score for every answer exactly one other player also wrote. If two or more wrote it, it's out.",
    "Threefold: list three, and score for every player who wrote the same answer as you.",
    "Forgotten Four: list four, and only answers nobody else thought of score. Then everyone votes on whether they really count.",
    "Let's get listing!",
];

// If the voice stalls, start the game anyway this many seconds after the countdown ends
const NARRATION_GRACE_SECONDS = 20;

/** The rules as a numbered list (TV rules screen and the Listopia phone rules) */
export function ListRulesList({ pointsPerItem = 100, listSize = 5, style }) {
    return (
        <ol className="d-flex flex-column mb-0" style={{ gap: '0.6em', ...style }}>
            <li>
                <strong className="text-dark">Draw a Card, Write a List:</strong><br />
                Each round's card says how many to list and what scores. Everyone gets the same category and races the clock.
            </li>
            <li>
                <strong className="text-dark">🤝 One-on-One (list 10):</strong><br />
                Score for each answer <strong>exactly one</strong> other player also wrote. Two or more? It's crossed out.
            </li>
            <li>
                <strong className="text-dark">🎯 Threefold (list 3):</strong><br />
                Score for <strong>every player</strong> who wrote the same answer as you.
            </li>
            <li>
                <strong className="text-dark">👻 Forgotten Four (list 4):</strong><br />
                Only answers <strong>nobody else</strong> wrote score, and the group votes on whether they really count.
            </li>
            <li>
                <strong className="text-dark">Score:</strong><br />
                <strong>{pointsPerItem} points</strong> each time you score. Most points at the end wins!
            </li>
        </ol>
    );
}

/**
 * 📜 List Cast rules screen (TV). The narrator reads the rules; when the voice finishes the first
 * round starts. With no voice available, the countdown runs the show.
 */
export function ListCastRulesTV({ roomCode, pointsPerItem, listSize }) {
    const [timeLeft, setTimeLeft] = useState(40);
    const [isNarrating, setIsNarrating] = useState(true);
    const hasStarted = useRef(false);

    const handleNext = () => {
        if (hasStarted.current) return; // voice, countdown and Skip can all land here: only go once
        hasStarted.current = true;
        socket.emit('startRounds', { roomCode });
    };

    useEffect(() => {
        let isCurrent = true;
        speak(LIST_CAST_RULES_NARRATION, roomCode).then((wasSpoken) => {
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
                <h2 className="fullscreen-gameplay-header text-center">How To Play List Cast!</h2>

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
                                        <div className="my-auto text-secondary" style={{ fontWeight: 500, fontSize: 'clamp(0.7rem, 3.1vh, 1.25rem)', lineHeight: 1.3 }}>
                                            <ListRulesList pointsPerItem={pointsPerItem} listSize={listSize} />
                                        </div>
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
                                    <Button variant="light" size="sm" className="w-100 fw-bold mt-auto py-2 shadow-sm" style={{ fontSize: '0.9rem' }} onClick={handleNext}>
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
