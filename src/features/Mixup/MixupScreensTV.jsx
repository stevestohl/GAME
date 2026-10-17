import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { mixupSocket as socket } from '../../socket.js';
import { speak, stopVoice } from '../../voice.js';
import { DrawingView } from './DrawingCanvas.jsx';
import { TriviaCastQuestionTV } from '../TriviaCast/TriviaCastScreensTV.jsx';
import '../../styles/mixup.css';

// 🎙️ What the host voice says while the rules are on screen
export const MIXUP_RULES_NARRATION = [
    "Welcome to Temple Mix Up! Three games in one.",
    "First up, memes. A meme pops up on the TV. Write the funniest caption you can on your phone, then everybody votes for their favorite. Most votes wins, and ties both score.",
    "Then Pictionary. One player draws on their phone while everyone else races to guess. The first right guess wins, and the artist scores too.",
    "And to finish, trivia. Tap the right answer before time runs out.",
    "Let's mix it up!",
];

// If the voice stalls, start the game anyway this many seconds after the countdown ends
const NARRATION_GRACE_SECONDS = 20;

export const ROUND_LOOKS = {
    meme: { icon: '🖼️', title: 'Meme It!', blurb: 'Write the funniest caption on your phone.' },
    draw: { icon: '✏️', title: 'Draw It!', blurb: 'One draws, everyone else guesses. First right guess wins!' },
    trivia: { icon: '❓', title: 'Know It!', blurb: 'Tap the right answer before time runs out.' },
};

export function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState(null);
    useEffect(() => {
        if (!endTime) { setTimeLeft(null); return undefined; }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [endTime]);
    return timeLeft;
}

/** The clock along the bottom of a TV screen */
function ClockStrip({ endTime, left }) {
    const timeLeft = useCountdown(endTime);
    const total = useRef(null);
    if (timeLeft !== null && (total.current === null || timeLeft > total.current)) total.current = timeLeft;
    const percent = total.current ? (timeLeft / total.current) * 100 : 100;
    const isLow = timeLeft !== null && timeLeft <= 10;
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-1 px-1 mx-strip">
                <span>{left}</span>
                <span className={isLow ? 'text-danger' : ''}>{timeLeft ?? ''}s</span>
            </div>
            <ProgressBar now={percent} variant={isLow ? 'danger' : 'light'} className="mx-bar" />
        </>
    );
}

/** A meme with a caption across the bottom, in classic meme lettering */
export function MemeImage({ meme, caption, className = '' }) {
    if (!meme) return null;
    return (
        <div className={`mx-meme ${className}`}>
            <img src={meme.url} alt={meme.name} className="mx-meme-img" />
            {caption && <div className="mx-meme-caption">{caption}</div>}
        </div>
    );
}

// ======================================================================================
// 📜 Rules
// ======================================================================================
export function MixupRulesTV({ roomCode, totalRounds }) {
    const [timeLeft, setTimeLeft] = useState(45);
    const [isNarrating, setIsNarrating] = useState(true);
    const hasStarted = useRef(false);
    const each = totalRounds / 3;

    const handleNext = () => {
        if (hasStarted.current) return; // voice, countdown and Skip can all land here: only go once
        hasStarted.current = true;
        socket.emit('startRounds', { roomCode });
    };

    useEffect(() => {
        let isCurrent = true;
        speak(MIXUP_RULES_NARRATION, roomCode).then((wasSpoken) => {
            if (!isCurrent) return;
            setIsNarrating(false);
            if (wasSpoken) setTimeout(() => isCurrent && handleNext(), 800);
        });
        return () => { isCurrent = false; stopVoice(); };
    }, [roomCode]);

    useEffect(() => {
        if (timeLeft <= 0 && (!isNarrating || timeLeft <= -NARRATION_GRACE_SECONDS)) {
            handleNext();
            return undefined;
        }
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isNarrating]);

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 p-3 pb-4 w-100">
                <h2 className="fullscreen-gameplay-header text-center">How To Play Temple Mix Up!</h2>
                <div className="mx-rules-grid flex-grow-1" style={{ minHeight: 0 }}>
                    {['meme', 'draw', 'trivia'].map((type, i) => (
                        <div key={type} className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100 mx-rule-card">
                                <Card.Body className="d-flex flex-column align-items-center text-center">
                                    <div className="mx-rule-step">Part {i + 1} · {each} rounds</div>
                                    <div className="mx-rule-icon">{ROUND_LOOKS[type].icon}</div>
                                    <div className="mx-rule-title">{ROUND_LOOKS[type].title}</div>
                                    <div className="mx-rule-text">
                                        {type === 'meme' && <>Caption the meme on your phone, then vote for the funniest (not your own). <strong>Most votes: +100.</strong> Ties all score.</>}
                                        {type === 'draw' && <>One player draws on their phone, the rest type guesses. <strong>First right guess: +100</strong>, and the artist gets <strong>+50</strong>.</>}
                                        {type === 'trivia' && <>Tap the right answer before the clock runs out. <strong>Right answer: +100.</strong></>}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 mx-strip" style={{ paddingRight: '7rem' }}>
                    <span>Game starts in {Math.max(timeLeft, 0)}s</span>
                    <Button variant="light" size="sm" className="fw-bold px-4" onClick={handleNext}>Skip ⏭</Button>
                </div>
            </div>
        </div>
    );
}

// ======================================================================================
// 🎬 A round's title card
// ======================================================================================
export function RoundIntroTV({ room }) {
    const round = room.round;
    const look = ROUND_LOOKS[round.type];
    return (
        <div className="fullscreen-gameplay-container justify-content-center">
            <div className="mx-intro">
                <div className="mx-intro-round">Round {room.currentRound} of {room.totalRounds}</div>
                <div className="mx-intro-icon">{look.icon}</div>
                <div className="mx-intro-title">{look.title}</div>
                <div className="mx-intro-blurb">
                    {round.type === 'draw' ? <><strong>{round.drawerName}</strong> is drawing. Everyone else, get guessing!</> : look.blurb}
                </div>
                <div className="mx-intro-count">{look.title.replace('!', '')} {round.typeNumber} of {round.typeCount}</div>
            </div>
        </div>
    );
}

// ======================================================================================
// 🖼️ Memes: writing, voting, results
// ======================================================================================
export function MemeTV({ room }) {
    const round = room.round;
    const state = room.gameState;
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const captions = round.captions || [];
    const winners = captions.filter((c) => (round.winnerIds || []).includes(c.id));

    let heading = 'Caption this!';
    if (state === 'meme_vote') heading = 'Vote for the funniest!';
    if (state === 'meme_results') heading = winners.length > 1 ? "It's a tie!" : winners.length ? 'The funniest caption...' : 'Nobody wrote a caption!';

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1400px' }}>
                <h2 className="fullscreen-gameplay-header mb-0">
                    {heading}
                    <span className="tc-category">Round {room.currentRound} of {room.totalRounds} · Meme {round.typeNumber}/{round.typeCount}</span>
                </h2>

                <div className="mx-meme-row flex-grow-1" style={{ minHeight: 0 }}>
                    <div className="mx-meme-stage">
                        <MemeImage meme={round.meme} caption={state === 'meme_results' ? winners[0]?.text : null} />
                    </div>

                    {state === 'meme_vote' && (
                        <div className="mx-caption-list">
                            {captions.map((c, i) => (
                                <div key={c.id} className="mx-caption-card">
                                    <span className="mx-caption-letter">{String.fromCharCode(65 + i)}</span>
                                    <span>{c.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {state === 'meme_results' && captions.length > 0 && (
                        <div className="mx-caption-list">
                            {captions.map((c) => {
                                const isWinner = (round.winnerIds || []).includes(c.id);
                                return (
                                    <div key={c.id} className={`mx-caption-card ${isWinner ? 'winner' : ''}`}>
                                        <span className="mx-caption-votes">{isWinner ? '👑' : ''} {c.votes} {c.votes === 1 ? 'vote' : 'votes'}</span>
                                        <span>{c.text}</span>
                                        <span className="mx-caption-name">{c.name}{isWinner ? ' · +100' : ''}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0" style={{ marginTop: '1.5vh', paddingRight: '7rem' }}>
                    {state === 'meme_write' && (
                        <ClockStrip endTime={room.endTime} left={`✍️ ${players.filter((p) => p.hasSubmitted).length} of ${players.length} captions in`} />
                    )}
                    {state === 'meme_vote' && (
                        <ClockStrip endTime={room.endTime} left={`🗳️ ${players.filter((p) => p.hasVoted).length} of ${players.length} voted · vote on your phone`} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ======================================================================================
// ✏️ Pictionary: the live drawing, then the answer
// ======================================================================================
export function DrawTV({ room }) {
    const round = room.round;
    const isResults = room.gameState === 'draw_results';
    const guesses = round.guesses || [];
    const feedEnd = useRef(null);

    useEffect(() => { feedEnd.current?.scrollIntoView({ block: 'end' }); }, [guesses.length]);

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1400px' }}>
                <h2 className="fullscreen-gameplay-header mb-0">
                    {isResults
                        ? (round.guessedBy ? `${round.guessedBy} got it!` : "Time's up!")
                        : `${round.drawerName} is drawing...`}
                    <span className="tc-category">Round {room.currentRound} of {room.totalRounds} · Pictionary {round.typeNumber}/{round.typeCount}</span>
                </h2>

                <div className="mx-draw-row flex-grow-1" style={{ minHeight: 0 }}>
                    <div className="mx-draw-stage">
                        <DrawingView roomCode={room.roomCode} />
                    </div>
                    <div className="mx-draw-side">
                        {isResults ? (
                            <div className="mx-answer-card">
                                <div className="mx-answer-label">It was...</div>
                                <div className="mx-answer-word">{round.word}</div>
                                {round.guessedBy
                                    ? <div className="mx-answer-points">🎉 {round.guessedBy} +100 · 🎨 {round.drawerName} +50</div>
                                    : <div className="mx-answer-points">Nobody guessed it this time.</div>}
                            </div>
                        ) : (
                            <div className="mx-guess-feed">
                                <div className="mx-guess-title">Guesses so far</div>
                                {guesses.length === 0 && <div className="mx-guess-empty">Type your guesses on your phone!</div>}
                                {guesses.map((g, i) => (
                                    <div key={i} className="mx-guess"><strong>{g.name}:</strong> {g.text} ❌</div>
                                ))}
                                <div ref={feedEnd} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0" style={{ marginTop: '1.5vh', paddingRight: '7rem' }}>
                    {!isResults && <ClockStrip endTime={room.endTime} left={`✏️ ${round.drawerName} draws · first right guess wins`} />}
                </div>
            </div>
        </div>
    );
}

// ======================================================================================
// ❓ Trivia: Trivia Cast's own question screen, fed this round's question
// ======================================================================================
export function TriviaTV({ room }) {
    const round = room.round;
    const players = {};
    Object.values(room.players).forEach((p) => { players[p.id] = { ...p, hasAnswered: p.hasSubmitted }; });
    const view = {
        ...room,
        players,
        currentRound: round.typeNumber,
        totalRounds: round.typeCount,
        question: round.question,
        correctAnswer: round.correctAnswer || null,
    };
    return <TriviaCastQuestionTV room={view} />;
}
