import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { spadesSocket as socket } from '../../socket.js';
import { speak, stopVoice } from '../../voice.js';
import { Avatar } from '../../avatars.jsx';

// ♠️ Spades: the TV's table, and the bits the phones share (cards, teams, the countdown).
// Seats go clockwise round the table: 0 at the bottom, 1 on the left, 2 at the top, 3 on the right.
// Partners sit across: Blue is seats 0 and 2, Orange is seats 1 and 3.

// The text forms of the suits (︎ keeps them from turning into emoji on phones)
export const SUIT_GLYPH = { S: '♠︎', H: '♥︎', D: '♦︎', C: '♣︎' };
export const SUIT_NAME = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };
const RANK_WORDS = { A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack', T: '10' };
export const rankLabel = (card) => (card[0] === 'T' ? '10' : card[0]);
export const cardLabel = (card) => `${rankLabel(card)}${SUIT_GLYPH[card[1]]}`;
export const cardWords = (card) => `${RANK_WORDS[card[0]] || card[0]} of ${SUIT_NAME[card[1]]}`;
const isRed = (card) => card[1] === 'H' || card[1] === 'D';

// Team colors: chosen to stand out on the green felt (and `ink` for writing on white)
export const TEAMS = [
    { name: 'Blue', color: '#4dabf7', ink: '#1864ab' },
    { name: 'Orange', color: '#ff922b', ink: '#c2410c' },
];
export const teamOf = (seat) => seat % 2;
export const partnerOf = (seat) => (seat + 2) % 4;
export const seatName = (room, seat) => room.seats[seat]?.name || 'Bot';
export const teamNames = (room, team) => [team, team + 2].map((s) => seatName(room, s)).join(' & ');
export const bidLabel = (bid) => (bid === 0 ? 'Nil' : String(bid));

/** Seconds left until `endTime` (null when there's no clock) */
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

/** A playing card (no card: its back) */
export function PlayingCard({ card, size = '', className = '', style, label = true }) {
    const sizeClass = size ? `sp-card-${size}` : '';
    if (!card) return <div className={`sp-card is-back ${sizeClass} ${className}`} style={style} aria-hidden="true" />;
    return (
        <div
            className={`sp-card ${isRed(card) ? 'is-red' : ''} ${sizeClass} ${className}`}
            style={style}
            {...(label ? { role: 'img', 'aria-label': cardWords(card) } : { 'aria-hidden': true })}
        >
            <span className="sp-card-corner">
                <span className="sp-card-rank">{rankLabel(card)}</span>
                <span className="sp-card-suit">{SUIT_GLYPH[card[1]]}</span>
            </span>
            <span className="sp-card-pip">{SUIT_GLYPH[card[1]]}</span>
        </div>
    );
}

/** A seat's face: the player's avatar, or a robot for a bot */
export function SeatFace({ seat, size = 64 }) {
    if (seat.isBot) return <span className="sp-bot-face" role="img" aria-label="Bot">🤖</span>;
    return <Avatar id={seat.avatar} name={seat.name} size={size} />;
}

// ---------- The bar across the top ----------
export function TopBar({ room }) {
    const hand = room.hand;
    const [newlyBroken, setNewlyBroken] = useState(false);
    const brokenKey = hand?.spadesBroken ? `${room.handNumber}` : null;
    useEffect(() => {
        if (!brokenKey) return undefined;
        setNewlyBroken(true);
        const t = setTimeout(() => setNewlyBroken(false), 2500);
        return () => clearTimeout(t);
    }, [brokenKey]);
    const teamBid = (team) => (hand ? [team, team + 2].reduce((sum, s) => sum + (hand.bids[s] || 0), 0) : 0);
    const teamTook = (team) => (hand ? [team, team + 2].reduce((sum, s) => sum + hand.tricksWon[s], 0) : 0);
    const biddingDone = hand && hand.bids.every((b) => b !== null);
    const leading = room.scores[0] === room.scores[1] ? null : room.scores[0] > room.scores[1] ? 0 : 1;
    return (
        <div className="sp-top">
            <div>
                <div className="sp-top-title">♠︎ Spades</div>
                <div className="sp-top-sub">Hand {room.handNumber || 1} · first to {room.target}</div>
            </div>
            {hand && room.gameState === 'playing' && (
                <div className={`sp-broken ${hand.spadesBroken ? 'is-broken' : ''} ${newlyBroken ? 'is-new' : ''}`}>
                    {hand.spadesBroken ? '♠︎ Spades broken' : '♠︎ Spades not broken yet'}
                </div>
            )}
            <div className="sp-top-teams">
                {[0, 1].map((team) => (
                    <div key={team} className={`sp-team ${leading === team ? 'is-winning' : ''}`} style={{ '--team': TEAMS[team].color }}>
                        <div className="sp-team-name">{TEAMS[team].name}</div>
                        <div className="sp-team-score">{room.scores[team]}</div>
                        <div className="sp-team-players">{teamNames(room, team)}</div>
                        <div className="sp-team-meta">
                            {biddingDone ? `Bid ${teamBid(team)} · took ${teamTook(team)}` : 'Bidding…'} · {room.bagPiles[team]} {room.bagPiles[team] === 1 ? 'bag' : 'bags'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------- A seat round the table ----------
function Seat({ room, seat }) {
    const info = room.seats[seat];
    const hand = room.hand;
    const isTurn = !!hand && hand.turn === seat && ['bidding', 'playing'].includes(room.gameState);
    const timeLeft = useCountdown(isTurn && !info.isBot && !info.isAway ? room.endTime : null);
    const bid = hand?.bids[seat];
    const took = hand?.tricksWon[seat] ?? 0;
    const cardsLeft = hand?.cardsLeft[seat] ?? 0;
    let bidChip;
    if (bid === null || bid === undefined) {
        bidChip = isTurn && room.gameState === 'bidding'
            ? <span className="sp-chip is-thinking">Bidding…</span>
            : <span className="sp-chip is-empty">Bid –</span>;
    } else bidChip = bid === 0 ? <span className="sp-chip is-nil">Nil</span> : <span className="sp-chip">Bid {bid}</span>;
    const made = bid > 0 && took >= bid;
    const takesIt = hand?.trickWinner === seat;
    return (
        <div className={`sp-seat sp-seat-${seat} ${isTurn ? 'is-turn' : ''} ${takesIt ? 'is-taking' : ''}`} style={{ '--team': TEAMS[info.team].color }}>
            <div className="sp-seat-face">
                <SeatFace seat={info} size={Math.round(window.innerHeight * 0.07) || 56} />
                {room.dealer === seat && <span className="sp-dealer" title="Dealer">D</span>}
            </div>
            <div className="sp-seat-info">
                <div className="sp-seat-name">
                    {info.name || 'Bot'}{info.isAway && <small> (away)</small>}
                </div>
                <div className="sp-seat-chips">
                    {takesIt ? <span className="sp-chip is-taking">Takes it!</span> : bidChip}
                    {hand && room.gameState !== 'bidding' && <span className={`sp-chip is-took ${made ? 'is-made' : ''}`}>Took {took}</span>}
                    {isTurn && timeLeft !== null && <span className={`sp-seat-clock ${timeLeft <= 5 ? 'is-low' : ''}`}>{timeLeft}s</span>}
                </div>
                <div className="sp-seat-backs" aria-label={`${cardsLeft} cards left`}>
                    {Array.from({ length: cardsLeft }, (_, i) => <PlayingCard key={i} size="xs" />)}
                </div>
            </div>
        </div>
    );
}

// ---------- The middle of the table ----------
function Center({ room }) {
    const hand = room.hand;
    if (!hand) return <div className="sp-center" />;

    if (room.gameState === 'bidding') {
        const dealing = hand.turn === null && hand.bids.every((b) => b === null);
        const teamBid = (team) => [team, team + 2].map((s) => hand.bids[s]);
        return (
            <div className="sp-center">
                <div className="sp-center-message">
                    {dealing ? (
                        <>
                            <div className="sp-deal" aria-hidden="true">{[0, 1, 2, 3].map((i) => <PlayingCard key={i} />)}</div>
                            <div className="sp-center-title">Dealing</div>
                            <div className="sp-center-sub">{seatName(room, room.dealer)} deals. Check your phone!</div>
                        </>
                    ) : (
                        <>
                            <div className="sp-center-title">Bidding</div>
                            <div className="sp-center-sub">How many tricks will you take?</div>
                            {[0, 1].map((team) => {
                                const bids = teamBid(team);
                                const known = bids.filter((b) => b !== null);
                                return (
                                    <div key={team} className="sp-center-sub" style={{ color: TEAMS[team].color, fontWeight: 800 }}>
                                        {TEAMS[team].name}: {known.length ? known.map(bidLabel).join(' + ') : '…'}
                                        {known.length === 2 && ` = ${bids.reduce((a, b) => a + b, 0)}`}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        );
    }

    const trick = hand.trick || [];
    const winner = hand.trickWinner;
    return (
        <div className="sp-center">
            <div className="sp-trick">
                {trick.map((play) => (
                    <div
                        key={play.card}
                        className={`sp-trick-slot sp-trick-slot-${play.seat} ${winner === null ? '' : winner === play.seat ? 'is-winner' : 'is-loser'}`}
                    >
                        <PlayingCard card={play.card} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SpadesTable({ room }) {
    return (
        <div className="sp-table">
            {[0, 1, 2, 3].map((seat) => <Seat key={seat} room={room} seat={seat} />)}
            <Center room={room} />
        </div>
    );
}

// ---------- The hand's score, over the table ----------
export function teamResultLines(room, result) {
    const lines = [];
    if (result.contract > 0) {
        lines.push({ label: `Bid ${result.contract}, took ${result.took}`, value: result.made ? `Made it! +${result.contractPoints}` : `Set! ${result.contractPoints}`, good: result.made });
    }
    result.nils.forEach((n) => {
        lines.push({ label: `${seatName(room, n.seat)}'s Nil`, value: n.made ? '+100' : '−100', good: n.made });
    });
    if (result.bags) lines.push({ label: `${result.bags} ${result.bags === 1 ? 'bag' : 'bags'}`, value: `+${result.bags}`, good: true });
    if (result.bagPenalty) lines.push({ label: '10 bags piled up', value: String(result.bagPenalty), good: false });
    return lines;
}

export function HandResults({ room }) {
    const hand = room.hand;
    const timeLeft = useCountdown(room.endTime);
    if (!hand?.results) return null;
    return (
        <div className="sp-overlay">
            <div className="sp-results">
                <div className="sp-results-title">Hand {room.handNumber}</div>
                <div className="sp-results-grid">
                    {hand.results.map((r) => (
                        <div key={r.team} className="sp-results-team" style={{ '--team': TEAMS[r.team].color, '--team-ink': TEAMS[r.team].ink }}>
                            <h3>{TEAMS[r.team].name}</h3>
                            <div className="sp-results-names">{teamNames(room, r.team)}</div>
                            {teamResultLines(room, r).map((line) => (
                                <div key={line.label} className="sp-results-row">
                                    <span>{line.label}</span>
                                    <span className={line.good ? 'is-good' : 'is-bad'}>{line.value}</span>
                                </div>
                            ))}
                            <div className="sp-results-row">
                                <span>This hand</span>
                                <span className={r.points >= 0 ? 'is-good' : 'is-bad'}>{r.points > 0 ? `+${r.points}` : r.points}</span>
                            </div>
                            <div className="sp-results-total"><span>Score</span><span>{room.scores[r.team]}</span></div>
                            <div className="sp-results-names">{r.bagPile} of 10 bags</div>
                        </div>
                    ))}
                </div>
                <div className="sp-results-foot">
                    {room.isGameOver ? 'And the winners are…' : `Next deal${timeLeft !== null ? ` in ${timeLeft}s` : ''}. First to ${room.target} wins.`}
                </div>
            </div>
        </div>
    );
}

// ---------- 📖 How to play ----------
export const rulesNarration = (target) => [
    'Welcome to Spades!',
    'You play in teams of two. Your partner sits across from you.',
    'Each hand, everyone bids how many tricks they think they’ll win. Bid nil if you think you won’t win any.',
    'Play a card of the suit that was led if you can. Spades beat every other suit, but nobody can lead a spade until one has been played.',
    'Make your team’s bid for ten points a trick. Every extra trick is a bag, and ten bags cost a hundred points.',
    `First team to ${target} points wins!`,
];
const RULES_SECONDS = 45;
const NARRATION_GRACE_SECONDS = 20;

const RULE_STEPS = [
    { icon: '🤝', title: 'Teams', text: 'Two teams of two. Your partner sits across the table from you.' },
    { icon: '🔢', title: 'Bid', text: 'How many tricks will you take? Your team adds its bids together. Nil: you take none!' },
    { icon: '🃏', title: 'Play', text: 'Follow the suit that was led if you can. The highest card wins the trick.' },
    { icon: '♠️', title: 'Spades', text: 'Spades beat every other suit. Nobody can lead one until a spade has been played.' },
    { icon: '🏆', title: 'Score', text: 'Make your bid: 10 points a trick. Extra tricks are bags, and 10 bags cost 100 points.' },
];

export function SpadesRulesTV({ room }) {
    const { roomCode, target } = room;
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
        speak(rulesNarration(target), roomCode).then((wasSpoken) => {
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
        <div className="fullscreen-gameplay-container sp-tv">
            <div className="d-flex flex-column h-100 w-100 p-3">
                <h2 className="sp-rules-title">How to Play Spades</h2>
                <div className="sp-rules-sub">First team to {target} points wins.</div>
                <div className="sp-rules-teams">
                    {[0, 1].map((team) => (
                        <div key={team} className="sp-rules-team" style={{ '--team': TEAMS[team].color }}>
                            <span style={{ color: TEAMS[team].color }}>{TEAMS[team].name}</span>
                            {[team, team + 2].map((s) => (
                                <span key={s} className="d-flex align-items-center gap-2">
                                    <SeatFace seat={room.seats[s]} size={40} /> {seatName(room, s)}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="sp-rules-grid">
                    {RULE_STEPS.map((step, i) => (
                        <div key={step.title} className="sp-rule" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="sp-rule-icon">{step.icon}</div>
                            <div className="sp-rule-title">{step.title}</div>
                            <div className="sp-rule-text">{step.text}</div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 sp-rules-foot">
                    <span>Game starts in {Math.max(timeLeft, 0)}s</span>
                    <Button variant="light" size="sm" className="fw-bold px-4" onClick={handleNext}>Skip ⏭</Button>
                </div>
            </div>
        </div>
    );
}

// ---------- 🎉 The winners ----------
export function SpadesFinalTV({ room, isRevealed, endActions }) {
    const team = room.winner ?? 0;
    return (
        <div className="fullscreen-gameplay-container sp-tv">
            <div className="sp-final" style={{ '--team': TEAMS[team].color }}>
                {isRevealed && (
                    <>
                        <div className="sp-final-crown" aria-hidden="true">👑</div>
                        <div className="sp-final-label">Team {TEAMS[team].name} wins!</div>
                        <div className="sp-final-names">
                            {[team, team + 2].map((s) => (
                                <span key={s} className="d-flex align-items-center gap-2">
                                    <SeatFace seat={room.seats[s]} size={72} />
                                    <span className="sp-final-name">{seatName(room, s)}</span>
                                </span>
                            ))}
                        </div>
                    </>
                )}
                <div className="sp-final-scores">
                    {[0, 1].map((t) => (
                        <div key={t} className="sp-final-score" style={{ '--team': TEAMS[t].color }}>
                            <span>{TEAMS[t].name}</span>
                            <strong>{room.scores[t]}</strong>
                        </div>
                    ))}
                </div>
                {room.history?.length > 0 && (
                    <table className="sp-history">
                        <thead>
                            <tr><th>Hand</th><th style={{ color: TEAMS[0].color }}>{TEAMS[0].name}</th><th style={{ color: TEAMS[1].color }}>{TEAMS[1].name}</th></tr>
                        </thead>
                        <tbody>
                            {room.history.map((h) => (
                                <tr key={h.hand}>
                                    <td>{h.hand}</td>
                                    {h.points.map((p, t) => <td key={t}>{p > 0 ? `+${p}` : p} → {h.scores[t]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {endActions && <div className="mt-3">{endActions}</div>}
            </div>
        </div>
    );
}
