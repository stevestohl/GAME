import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { wordWeaveSocket as socket } from '../../socket.js';
import { speak, stopVoice } from '../../voice.js';
import { Avatar } from '../../avatars.jsx';
import WordGrid from './WordGrid.jsx';
import { useCountdown, clockText, rulesNarration, RULE_STEPS, plural } from './wordWeaveShared.js';

// 🧶 Word Weave on the TV: the rules, each round's grid and clock, the reveal, and the winners.

const playersInOrder = (room) => Object.values(room.players)
    .filter((p) => !p.isCaster && (p.isConnected || p.score > 0))
    .sort((a, b) => a.joinOrder - b.joinOrder);

const namesList = (names) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

// ---------- The bar across the top ----------
function TopBar({ room, clock }) {
    const timeLeft = useCountdown(clock ? room.endTime : null);
    return (
        <div className="ww-tv-top">
            <div>
                <div className="ww-tv-title">🧶 Word Weave</div>
                <div className="ww-tv-sub">
                    Round {room.round} of {room.totalRounds} · {room.size} × {room.size}
                    {room.possible ? ` · ${room.possible} words hiding in here` : ''}
                </div>
            </div>
            {clock && timeLeft !== null && (
                <div className={`ww-tv-clock ${timeLeft <= 10 ? 'is-low' : ''}`} role="timer" aria-label={`${timeLeft} seconds left`}>
                    {clockText(timeLeft)}
                </div>
            )}
        </div>
    );
}

// ---------- 📖 How to play ----------
const RULES_SECONDS = 40;
const NARRATION_GRACE_SECONDS = 15;
// A little woven word for the rules screen: W-E-A-V-E on a 4 × 4 grid
const DEMO_LETTERS = 'WTSNPEAOHRLVDIKE'.split('');
const DEMO_PATH = [0, 5, 6, 11, 15];

export function RulesTV({ room }) {
    const { roomCode } = room;
    const [timeLeft, setTimeLeft] = useState(RULES_SECONDS);
    const [isNarrating, setIsNarrating] = useState(true);
    const hasStarted = useRef(false);

    const handleNext = () => {
        if (hasStarted.current) return;   // voice, countdown and Skip can all land here: only go once
        hasStarted.current = true;
        socket.emit('startRounds', { roomCode });
    };

    useEffect(() => {
        let isCurrent = true;
        speak(rulesNarration(room), roomCode).then((wasSpoken) => {
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

    // The demo thread weaves itself, over and over
    const [demoStep, setDemoStep] = useState(1);
    useEffect(() => {
        const t = setInterval(() => setDemoStep((s) => (s >= DEMO_PATH.length + 2 ? 1 : s + 1)), 550);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="fullscreen-gameplay-container ww-tv">
            <div className="d-flex flex-column h-100 w-100 align-items-center justify-content-center">
                <div className="ww-tv-title">How to Play Word Weave</div>
                <div className="ww-tv-sub">
                    {plural(room.totalRounds, 'round')} · {room.size} × {room.size} grid · {clockText(room.roundSeconds)} a round
                </div>
                <div className="ww-tv-rules">
                    {RULE_STEPS.map((step, i) => (
                        <div key={step.title} className="ww-tv-rule" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="ww-tv-rule-icon">{step.icon}</div>
                            <div className="ww-tv-rule-title">{step.title}</div>
                            <div className="ww-tv-rule-text">{step.text}</div>
                        </div>
                    ))}
                </div>
                <div className="ww-tv-rules-demo">
                    <WordGrid letters={DEMO_LETTERS} size={4} path={DEMO_PATH.slice(0, Math.min(demoStep, DEMO_PATH.length))} tone="trace" />
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3 ww-tv-sub">
                    <span>Game starts in {Math.max(timeLeft, 0)}s</span>
                    <Button variant="light" size="sm" className="fw-bold px-4" onClick={handleNext}>Skip ⏭</Button>
                </div>
            </div>
        </div>
    );
}

// ---------- Round N, 3-2-1 ----------
export function IntroTV({ room }) {
    const timeLeft = useCountdown(room.endTime);
    const isLast = room.round === room.totalRounds && room.totalRounds > 1;
    return (
        <div className="fullscreen-gameplay-container ww-tv">
            <div className="ww-tv-center">
                <div className="ww-tv-round-big">{isLast ? 'Last round!' : `Round ${room.round}`}</div>
                <div className="ww-tv-sub mb-3">of {room.totalRounds} · a new {room.size} × {room.size} grid</div>
                {timeLeft !== null && timeLeft <= 3 && timeLeft > 0 && <div key={timeLeft} className="ww-tv-count-big">{timeLeft}</div>}
                {timeLeft === 0 && <div className="ww-tv-count-big">Go!</div>}
            </div>
        </div>
    );
}

// ---------- The round: the grid, the clock and how many words each player has ----------
function PlayerCount({ player }) {
    return (
        <div className={`ww-tv-player ${player.isConnected ? '' : 'is-away'}`}>
            <Avatar id={player.avatar} name={player.name} size={44} />
            <span className="ww-name">{player.name}</span>
            <span key={player.wordCount} className={`ww-tv-count ${player.wordCount ? 'is-bump' : ''}`} aria-label={`${player.wordCount} words`}>
                {player.wordCount}
            </span>
            <span className="ww-tv-total">{player.score} pts</span>
        </div>
    );
}

export function PlayingTV({ room }) {
    const players = playersInOrder(room);
    return (
        <div className="fullscreen-gameplay-container ww-tv">
            <TopBar room={room} clock />
            <div className="ww-tv-body">
                <div className="ww-tv-grid">
                    {room.grid && <WordGrid key={room.round} letters={room.grid} size={room.size} />}
                </div>
                <div className="ww-tv-side">
                    <div className="ww-tv-sub">Words found</div>
                    {players.map((p) => <PlayerCount key={p.key || p.id} player={p} />)}
                    {!players.length && <div className="ww-tv-sub">Nobody's here yet: scan the code to join!</div>}
                </div>
            </div>
            <div className="ww-tv-hint">Weave words on your phone. Words two of you find get crossed out!</div>
        </div>
    );
}

// ---------- ✂️ The reveal ----------
const SPOT_MS = 3400;

/** What the grid shows in turn: the best word, the crossed-out ones, and the longest nobody found */
const spotsFor = (results, room) => {
    const nameOf = (key) => results.players.find((p) => p.key === key)?.name || 'Someone';
    const spots = [];
    if (results.best) {
        const finder = results.players.find((p) => p.key === results.best.key);
        spots.push({ label: 'Best word', word: results.best.word, path: results.best.path, who: finder, note: `+${results.best.points}` });
    }
    results.shared.slice(0, 3).forEach((s) => spots.push({ label: 'Crossed out', word: s.word, path: s.path, note: `Found by ${namesList(s.by.map(nameOf))}` }));
    results.missed.slice(0, 4).forEach((m) => spots.push({ label: 'Nobody found', word: m.word, path: m.path, note: `${m.points} ${m.points === 1 ? 'point' : 'points'} going spare` }));
    if (!spots.length) spots.push({ label: room.isGameOver ? 'Last round done' : 'Round done', word: '', path: [] });
    return spots;
};

const CHIPS_ON_TV = 18;

function ResultCard({ result, index }) {
    const shown = result.words.slice(0, CHIPS_ON_TV);
    const more = result.words.length - shown.length;
    return (
        <div className="ww-tv-card" style={{ animationDelay: `${index * 0.12}s` }}>
            <div className="ww-tv-card-head">
                <Avatar id={result.avatar} name={result.name} size={38} />
                <span className="ww-name">{result.name}</span>
                <span className="ww-tv-card-points">+{result.points}</span>
                <span className="ww-tv-card-total">{result.total} total</span>
            </div>
            {shown.length ? (
                <div className="ww-chips">
                    {shown.map((w) => (
                        <span key={w.word} className={`ww-chip ${w.cancelled ? 'is-cancelled' : 'is-kept'}`}>
                            {w.word}{!w.cancelled && <sup>{w.points}</sup>}
                        </span>
                    ))}
                    {more > 0 && <span className="ww-chip">+{more} more</span>}
                </div>
            ) : <div className="ww-tv-card-none">No words this round</div>}
        </div>
    );
}

export function ResultsTV({ room }) {
    const results = room.results;
    const spots = spotsFor(results, room);
    const [spotIndex, setSpotIndex] = useState(0);
    useEffect(() => {
        setSpotIndex(0);
        const t = setInterval(() => setSpotIndex((i) => i + 1), SPOT_MS);
        return () => clearInterval(t);
    }, [results.round]);
    const spot = spots[spotIndex % spots.length];
    const timeLeft = useCountdown(room.isPaused ? null : room.endTime);
    const handleNext = () => socket.emit('next_round', { roomCode: room.roomCode });

    return (
        <div className="fullscreen-gameplay-container ww-tv">
            <TopBar room={room} />
            <div className="ww-tv-results">
                <div className="ww-tv-results-left">
                    <WordGrid letters={results.letters} size={results.size} path={spot.path} tone="show" drawKey={`${results.round}-${spotIndex}`} />
                    <div className="ww-tv-spot" key={`${results.round}-${spotIndex}`}>
                        <div className="ww-tv-spot-label">{spot.label}</div>
                        {spot.word && <div className="ww-tv-spot-word">{spot.word.toUpperCase()}</div>}
                        {spot.who
                            ? <div className="ww-tv-spot-who"><Avatar id={spot.who.avatar} name={spot.who.name} size={28} /> {spot.who.name} · {spot.note}</div>
                            : spot.note && <div className="ww-tv-spot-who">{spot.note}</div>}
                    </div>
                    <div className="ww-tv-stat">
                        Together you found {results.foundByAnyone} of {results.possible} words.
                        {results.shared.length ? ` ${plural(results.shared.length, 'word')} crossed out.` : ''}
                    </div>
                </div>
                <div className="ww-tv-cards">
                    {results.players.map((r, i) => <ResultCard key={r.key} result={r} index={i} />)}
                </div>
            </div>
            <div className="ww-tv-foot">
                <span>{timeLeft !== null ? (room.isGameOver ? `The winners in ${timeLeft}s` : `Next round in ${timeLeft}s`) : ''}</span>
                <Button variant="light" size="sm" className="fw-bold px-4" onClick={handleNext}>
                    {room.isGameOver ? 'See the winners ⏭' : 'Next round ⏭'}
                </Button>
            </div>
        </div>
    );
}

// ---------- 🎉 The winners ----------
export const winnersOf = (room) => room.standings.filter((s) => s.place === 1 && s.score > 0);

export function FinalTV({ room, isRevealed, endActions }) {
    const winners = winnersOf(room);
    const rounds = Array.from({ length: room.totalRounds }, (_, i) => i + 1);
    const best = room.bestOfGame;
    return (
        <div className="fullscreen-gameplay-container ww-tv">
            <div className="ww-final">
                {isRevealed && (
                    <>
                        <div className="ww-final-crown" aria-hidden="true">👑</div>
                        <div className="ww-final-label">
                            {winners.length > 1 ? "It's a tie!" : winners.length ? `${winners[0].name} wins!` : 'Game over!'}
                        </div>
                        <div className="ww-final-names">
                            {winners.map((w) => (
                                <span key={w.key} className="d-flex align-items-center gap-2">
                                    <Avatar id={w.avatar} name={w.name} size={72} /> {w.name}
                                </span>
                            ))}
                        </div>
                    </>
                )}
                <table className="ww-final-table">
                    <thead>
                        <tr>
                            <th />
                            <th className="text-start">Player</th>
                            {rounds.length <= 10 && rounds.map((n) => <th key={n}>R{n}</th>)}
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {room.standings.map((s) => (
                            <tr key={s.key}>
                                <td>{s.place}</td>
                                <td className="ww-final-who">
                                    <span className="d-inline-flex align-items-center gap-2"><Avatar id={s.avatar} name={s.name} size={32} /> {s.name}</span>
                                </td>
                                {rounds.length <= 10 && rounds.map((n) => <td key={n}>{s.history[n - 1] ?? 0}</td>)}
                                <td>{s.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {best && (
                    <div className="ww-final-best">
                        Best word of the game: <strong>{best.word.toUpperCase()}</strong> by {best.name} (round {best.round}, +{best.points})
                    </div>
                )}
                {endActions && <div className="mt-3">{endActions}</div>}
            </div>
        </div>
    );
}

/** What the narrator says at the end */
export const finalLine = (room) => {
    const winners = winnersOf(room);
    if (!winners.length) return 'Thanks for playing Word Weave!';
    if (winners.length > 1) return `It's a tie between ${namesList(winners.map((w) => w.name))}!`;
    return `${winners[0].name} wins Word Weave!`;
};
