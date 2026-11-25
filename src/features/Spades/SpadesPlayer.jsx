import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROOM_NOT_FOUND, joinAgain } from '../../hooks/useRoomGone.js';
import { spadesSocket as socket } from '../../socket.js';
import { playChime } from '../../chime.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import SnakeSnack from '../Mixup/SnakeSnack.jsx';
import { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import { getMyAvatar } from '../../avatars.jsx';
import {
    PlayingCard, SeatFace, TEAMS, teamOf, partnerOf, seatName, bidLabel, cardLabel, cardWords, teamResultLines, useCountdown,
} from './SpadesTable.jsx';
import '../../styles/spades.css';

/**
 * 📱 Spades on a player's phone: your cards, your bid, and the card you play.
 * The TV shows the table; the phone is your hand.
 */
export default function SpadesPlayer({ roomCode, playerName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [mine, setMine] = useState({ seat: null, cards: [], legal: [], suggestion: null });
    const [error, setError] = useState('');
    const [picked, setPicked] = useState(null);       // the bid or card tapped, waiting for "Bid"/"Play"
    const [sending, setSending] = useState(false);    // a move on its way to the server
    const lastTurn = useRef(null);

    useSetBackgroundTheme('spades');

    // --- Join, and stay joined through refreshes and network blips ---
    useEffect(() => {
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoom = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleMine = (update) => { setMine(update); setSending(false); };
        const handleJoinError = (msg) => {
            if (msg === ROOM_NOT_FOUND) {
                navigate(...joinAgain(roomCode));
                return;
            }
            setError(msg);
        };
        const handleSpadesError = (msg) => {
            setError(msg);
            setSending(false);
            setPicked(null);
            setTimeout(() => setError(''), 4000);
        };
        const handleClosed = ({ message } = {}) => navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });

        socket.on('room_updated', handleRoom);
        socket.on('my_hand', handleMine);
        socket.on('joinError', handleJoinError);
        socket.on('spades_error', handleSpadesError);
        socket.on('room_closed', handleClosed);
        socket.on('connect', joinMyRoom);
        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            socket.off('room_updated', handleRoom);
            socket.off('my_hand', handleMine);
            socket.off('joinError', handleJoinError);
            socket.off('spades_error', handleSpadesError);
            socket.off('room_closed', handleClosed);
            socket.off('connect', joinMyRoom);
        };
    }, [roomCode, playerName]);

    // My turn starts: clear the last pick, and chime
    const hand = room?.hand;
    const mySeat = mine.seat;
    const isMyTurn = !!hand && mySeat !== null && hand.turn === mySeat && ['bidding', 'playing'].includes(room?.gameState);
    const turnKey = isMyTurn ? `${room.handNumber}-${room.gameState}-${hand.cardsLeft[mySeat]}` : null;
    useEffect(() => {
        if (turnKey === lastTurn.current) return;
        lastTurn.current = turnKey;
        setPicked(null);
        setSending(false);
        if (turnKey) playChime();
    }, [turnKey]);

    const timeLeft = useCountdown(isMyTurn ? room.endTime : null);

    if (error && !room) {
        return (
            <Frame title="Spades">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" className="w-100" onClick={() => navigate('/join')}>Back to Join</Button>
            </Frame>
        );
    }
    if (!room) {
        return (
            <Frame title="Spades">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 mb-0">Joining room {roomCode}...</p>
            </Frame>
        );
    }
    if (room.isPaused) return <CouchCastPausedOverlay />;

    const isLeader = room.hostId === socket.id;
    const errorBox = error && <Alert variant="warning" className="py-2 small">{error}</Alert>;
    const clock = timeLeft !== null && <span className={`sp-phone-clock ${timeLeft <= 5 ? 'low' : ''}`}>⏱️ {timeLeft}s</span>;
    const myTeam = mySeat === null ? null : teamOf(mySeat);

    // ===================== LOBBY =====================
    if (room.gameState === 'lobby') {
        const here = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
        const partner = mySeat === null ? null : room.seats[partnerOf(mySeat)];
        return (
            <>
                {isLeader && (
                    <div className="tc-leader-bar">
                        <span className="fw-bold text-dark small">👑 Room Leader</span>
                        <Button variant="primary" className="fw-bold flex-grow-1" onClick={() => { setError(''); socket.emit('startGame', { roomCode }); }}>
                            {here.length >= 4 ? 'Deal us in!' : `Deal us in! (bots fill ${4 - Math.min(4, here.length)} ${4 - here.length === 1 ? 'seat' : 'seats'})`}
                        </Button>
                    </div>
                )}
                <Frame title="You're In!">
                    {errorBox}
                    {mySeat === null
                        ? <div className="p-2 border rounded bg-light small mb-2">The table's full, so you're watching this game. You'll get a seat if one comes free.</div>
                        : <div className="small mb-1">You're on <strong style={{ color: TEAMS[myTeam].ink }}>Team {TEAMS[myTeam].name}</strong>. Your partner: <strong>{partner?.isBot ? 'a bot (for now)' : partner?.name}</strong></div>}
                    <LobbySeats room={room} mySeat={mySeat} />
                    {isLeader && seatedCount(room) > 1 && (
                        <Button variant="outline-secondary" size="sm" className="mb-2" onClick={() => socket.emit('shuffle_seats', { roomCode })}>🔀 Mix up the teams</Button>
                    )}
                    {!isLeader && (
                        <div className="p-2 border rounded bg-light text-muted small mb-2">
                            Waiting for <strong>{here.find((p) => p.id === room.hostId)?.name || 'the leader'}</strong> to deal...
                        </div>
                    )}
                    <SnakeSnack socket={socket} roomCode={roomCode} room={room} />
                </Frame>
            </>
        );
    }

    if (room.gameState === 'rules') {
        return (
            <Frame title="How to Play">
                <div className="text-start small">
                    <p><strong>🤝 Teams:</strong> your partner sits across from you. {mySeat !== null && <>You're with <strong>{seatName(room, partnerOf(mySeat))}</strong>.</>}</p>
                    <p><strong>🔢 Bid:</strong> how many tricks you'll take. Nil means none at all (+100 if you pull it off).</p>
                    <p><strong>🃏 Play:</strong> follow the suit that was led if you can. Highest card wins the trick.</p>
                    <p><strong>♠️ Spades</strong> beat every other suit. Nobody can lead one until a spade has been played.</p>
                    <p className="mb-0"><strong>🏆 Score:</strong> make your team's bid for 10 a trick. Extra tricks are bags: 10 bags cost 100.</p>
                </div>
                <p className="text-muted small mb-0 mt-2">First to {room.target} wins. Listen to the TV!</p>
            </Frame>
        );
    }

    // ===================== WATCHING =====================
    if (mySeat === null) {
        return (
            <Frame title="Spades">
                <div className="sp-phone-big">👀</div>
                <p className="fw-bold mb-1">You're watching this game.</p>
                <p className="small text-muted">Blue {room.scores[0]} · Orange {room.scores[1]}</p>
                <p className="small text-muted mb-0">If a player drops out, you can take a seat in the next game.</p>
            </Frame>
        );
    }

    const status = <MyStatus room={room} seat={mySeat} />;

    // ===================== FINAL =====================
    if (room.gameState === 'final') {
        const won = room.winner === myTeam;
        return (
            <Frame title="Game Over">
                {status}
                <div className="sp-phone-big">{won ? '🏆' : '🤝'}</div>
                <p className="fw-bold fs-5 mb-1">{won ? 'Your team wins!' : `Team ${TEAMS[room.winner ?? 0].name} wins this one.`}</p>
                <p className="small text-muted mb-0">Blue {room.scores[0]} · Orange {room.scores[1]}</p>
            </Frame>
        );
    }

    // ===================== THE HAND'S SCORE =====================
    if (room.gameState === 'hand_results' && hand?.results) {
        const ours = hand.results[myTeam];
        return (
            <Frame title={`Hand ${room.handNumber}`}>
                {status}
                <div className="sp-phone-result" style={{ '--team': TEAMS[myTeam].color }}>
                    <div className="fw-bold mb-1" style={{ color: TEAMS[myTeam].ink }}>Team {TEAMS[myTeam].name}</div>
                    {teamResultLines(room, ours).map((line) => (
                        <div key={line.label} className="d-flex justify-content-between small">
                            <span>{line.label}</span>
                            <span className={line.good ? 'text-success fw-bold' : 'text-danger fw-bold'}>{line.value}</span>
                        </div>
                    ))}
                    <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                        <span>This hand</span><span>{ours.points > 0 ? `+${ours.points}` : ours.points}</span>
                    </div>
                </div>
                <p className="small text-muted mt-2 mb-2">Blue {room.scores[0]} · Orange {room.scores[1]} · first to {room.target}</p>
                {isLeader && !room.isGameOver && (
                    <Button variant="primary" className="w-100 fw-bold" onClick={() => socket.emit('next_hand', { roomCode })}>Deal the next hand</Button>
                )}
            </Frame>
        );
    }

    // ===================== BIDDING =====================
    if (room.gameState === 'bidding') {
        const dealing = hand.turn === null && hand.bids.every((b) => b === null);
        const myBid = hand.bids[mySeat];
        const partnerBid = hand.bids[partnerOf(mySeat)];
        const sendBid = () => {
            if (picked === null || sending) return;
            setSending(true);
            socket.emit('bid', { roomCode, bid: picked });
        };
        return (
            <Frame title={isMyTurn ? 'Your bid' : 'Bidding'} right={clock}>
                {status}
                {errorBox}
                {dealing && <p className="sp-phone-turn">Dealing…</p>}
                {!dealing && myBid !== null && <p className="sp-phone-turn">You bid {bidLabel(myBid)}{myBid === 1 ? ' trick' : myBid === 0 ? '' : ' tricks'}.</p>}
                {!dealing && myBid === null && !isMyTurn && <p className="sp-phone-turn">Waiting for {seatName(room, hand.turn)} to bid…</p>}
                {isMyTurn && myBid === null && (
                    <>
                        <p className="sp-phone-turn is-mine">How many tricks will you take?</p>
                        <div className="sp-bid-hint">
                            {partnerBid !== null ? <>Your partner bid <strong>{bidLabel(partnerBid)}</strong>. </> : null}
                            {mine.suggestion !== null && <>A good guess for this hand: <strong>{bidLabel(mine.suggestion)}</strong>.</>}
                        </div>
                        <div className="sp-bids" role="group" aria-label="Your bid">
                            {Array.from({ length: 14 }, (_, n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`sp-bid ${n === 0 ? 'is-nil' : ''} ${mine.suggestion === n ? 'is-suggested' : ''} ${picked === n ? 'is-picked' : ''}`}
                                    aria-pressed={picked === n}
                                    onClick={() => setPicked(n)}
                                >
                                    {n === 0 ? 'Nil' : n}
                                </button>
                            ))}
                        </div>
                        <Button variant="success" size="lg" className="w-100 fw-bold mb-2" disabled={picked === null || sending} onClick={sendBid}>
                            {picked === null ? 'Pick a number' : picked === 0 ? 'Bid Nil (no tricks!)' : `Bid ${picked}`}
                        </Button>
                    </>
                )}
                <BidsSoFar room={room} />
                <Hand cards={mine.cards} />
            </Frame>
        );
    }

    // ===================== PLAYING =====================
    const legal = new Set(mine.legal);
    const canPlay = isMyTurn && hand.trickWinner === null;
    const sendCard = () => {
        if (!picked || sending || !legal.has(picked)) return;
        setSending(true);
        socket.emit('play_card', { roomCode, card: picked });
    };
    const turnText = hand.trickWinner !== null
        ? `${hand.trickWinner === mySeat ? 'You take' : `${seatName(room, hand.trickWinner)} takes`} the trick!`
        : canPlay ? (hand.trick.length ? 'Your turn: follow suit if you can.' : 'Your lead!') : hand.turn !== null ? `Waiting for ${seatName(room, hand.turn)}…` : '';
    return (
        <Frame title={canPlay ? 'Your turn' : 'Spades'} right={clock}>
            {status}
            {errorBox}
            <p className={`sp-phone-turn ${canPlay ? 'is-mine' : ''}`}>{turnText}</p>
            <MiniTrick room={room} mySeat={mySeat} />
            <Hand
                cards={mine.cards}
                playable={canPlay ? legal : null}
                picked={picked}
                onPick={(card) => setPicked((prev) => (prev === card ? null : card))}
            />
            {canPlay && (
                <Button variant="success" size="lg" className="w-100 fw-bold mt-1" disabled={!picked || sending} onClick={sendCard}>
                    {picked ? `Play ${cardLabel(picked)}` : 'Tap a card'}
                </Button>
            )}
            {hand.spadesBroken
                ? <p className="small text-muted mt-2 mb-0">♠︎ Spades are broken: they can be led now.</p>
                : <p className="small text-muted mt-2 mb-0">Spades can't be led yet.</p>}
        </Frame>
    );
}

const seatedCount = (room) => room.seats.filter((s) => !s.isBot).length;

/** My team, our bid and tricks, and the score, along the top of every screen in a hand */
function MyStatus({ room, seat }) {
    const team = teamOf(seat);
    const hand = room.hand;
    const bid = hand ? [team, team + 2].reduce((sum, s) => sum + (hand.bids[s] || 0), 0) : null;
    const took = hand ? [team, team + 2].reduce((sum, s) => sum + hand.tricksWon[s], 0) : null;
    const biddingDone = hand && hand.bids.every((b) => b !== null);
    return (
        <div className="sp-phone-status" style={{ '--team': TEAMS[team].color }}>
            <SeatFace seat={room.seats[seat]} size={34} />
            <div className="flex-grow-1 lh-sm">
                <div className="fw-bold">Team {TEAMS[team].name}</div>
                <div className="small text-muted">{biddingDone ? `Bid ${bid} · took ${took}` : `With ${seatName(room, partnerOf(seat))}`}</div>
            </div>
            <div className="sp-phone-status-score">
                <strong>{room.scores[team]}</strong>
                <div className="small text-muted">vs {room.scores[1 - team]}</div>
            </div>
        </div>
    );
}

/** My cards: tap one to pick it (only the playable ones, on my turn) */
function Hand({ cards, playable = null, picked = null, onPick }) {
    return (
        <div className="sp-hand">
            {cards.map((card) => {
                const canTap = !!playable && playable.has(card);
                const dim = !!playable && !canTap;
                return (
                    <button
                        key={card}
                        type="button"
                        className={`sp-hand-card ${dim ? 'is-dim' : ''} ${picked === card ? 'is-selected' : ''}`}
                        disabled={!canTap}
                        aria-pressed={picked === card}
                        aria-label={cardWords(card) + (dim ? " (can't play this now)" : '')}
                        onClick={() => onPick?.(card)}
                    >
                        <PlayingCard card={card} label={false} />
                    </button>
                );
            })}
        </div>
    );
}

/** The trick so far, small: who played what */
function MiniTrick({ room, mySeat }) {
    const hand = room.hand;
    const order = [0, 1, 2, 3].map((i) => (mySeat + i) % 4);   // me first, then round the table
    return (
        <div className="sp-mini-trick">
            {order.map((seat) => {
                const play = hand.trick.find((p) => p.seat === seat);
                return (
                    <div key={seat} className={`sp-mini-slot ${hand.trickWinner === seat ? 'is-winner' : ''}`}>
                        {play ? <PlayingCard card={play.card} /> : <div className="sp-mini-empty" />}
                        <div className="sp-mini-name" style={{ color: TEAMS[teamOf(seat)].ink }}>{seat === mySeat ? 'You' : seatName(room, seat)}</div>
                    </div>
                );
            })}
        </div>
    );
}

function BidsSoFar({ room }) {
    const hand = room.hand;
    if (!hand.bids.some((b) => b !== null)) return null;
    return (
        <div className="sp-bids-so-far">
            {[0, 1, 2, 3].filter((s) => hand.bids[s] !== null).map((s) => (
                <span key={s}><span style={{ color: TEAMS[teamOf(s)].ink }}>{seatName(room, s)}</span> <strong>{bidLabel(hand.bids[s])}</strong></span>
            ))}
        </div>
    );
}

function LobbySeats({ room, mySeat }) {
    return (
        <div className="sp-lobby-seats">
            {[0, 2, 1, 3].map((seat) => {
                const info = room.seats[seat];
                return (
                    <div key={seat} className={`sp-lobby-seat ${seat === mySeat ? 'is-me' : ''}`} style={{ '--team': TEAMS[info.team].color }}>
                        <SeatFace seat={info} size={28} />
                        <span>{info.isBot ? 'Bot' : info.name}{seat === mySeat ? ' (you)' : ''}</span>
                    </div>
                );
            })}
        </div>
    );
}

function Frame({ title, right, children }) {
    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header d-flex justify-content-between align-items-center">
                    <span>{title}</span>
                    {right}
                </Card.Header>
                <Card.Body className="text-center p-3">{children}</Card.Body>
            </Card>
        </div>
    );
}
