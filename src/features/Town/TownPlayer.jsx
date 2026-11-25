import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROOM_NOT_FOUND, joinAgain } from '../../hooks/useRoomGone.js';
import { townSocket as socket } from '../../socket.js';
import { playChime } from '../../chime.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import SnakeSnack from '../Mixup/SnakeSnack.jsx';
import { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import { Avatar, getMyAvatar } from '../../avatars.jsx';
import {
    Building, HOOD_LOOKS, PHASES, money, signedMoney, playerColor, playerByKey, rankPlayers, rentFor, useCountdown, townPlayers,
} from './TownScreensTV.jsx';
import '../../styles/town.css';

/**
 * 📱 Temple Town on a player's phone: bid on lots, build, and pick where to go out.
 * The TV shows the town; the phone is your wallet and your controller.
 */
export default function TownPlayer({ roomCode, playerName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [mine, setMine] = useState({});          // this phone's private bits: my bids, where I'm going tonight
    const [error, setError] = useState('');
    const [bids, setBids] = useState({});          // lotId -> amount (absent: not bidding)
    const [pendingLot, setPendingLot] = useState(null);   // a building on its way (one tap, one building)
    const [nightPick, setNightPick] = useState(null);
    const lastTurn = useRef(null);

    useSetBackgroundTheme('town');

    // --- Join, and stay joined through refreshes and network blips ---
    useEffect(() => {
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoom = (update) => {
            if (update?.roomCode !== roomCode) return;
            setRoom(update);
            setPendingLot(null);
        };
        const handleMyState = (state) => setMine((prev) => ({ ...prev, ...state }));
        const handleJoinError = (msg) => {
            if (msg === ROOM_NOT_FOUND) {
                navigate(...joinAgain(roomCode));
                return;
            }
            setError(msg);
        };
        const handleTownError = (msg) => {
            setError(msg);
            setPendingLot(null);
            setTimeout(() => setError(''), 4000);
        };
        const handleClosed = ({ message } = {}) => navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });

        socket.on('room_updated', handleRoom);
        socket.on('my_state', handleMyState);
        socket.on('joinError', handleJoinError);
        socket.on('town_error', handleTownError);
        socket.on('room_closed', handleClosed);
        socket.on('connect', joinMyRoom);
        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            socket.off('room_updated', handleRoom);
            socket.off('my_state', handleMyState);
            socket.off('joinError', handleJoinError);
            socket.off('town_error', handleTownError);
            socket.off('room_closed', handleClosed);
            socket.off('connect', joinMyRoom);
        };
    }, [roomCode, playerName]);

    // A new part of the round: clear the last one's choices, and chime when it's time to act
    const turnKey = room ? `${room.currentRound}-${room.gameState}` : null;
    useEffect(() => {
        if (!turnKey || turnKey === lastTurn.current) return;
        lastTurn.current = turnKey;
        if (room.gameState === 'auction') setBids({});
        if (room.gameState === 'night') setNightPick(null);
        if (['auction', 'build', 'night'].includes(room.gameState)) playChime();
    }, [turnKey]);

    const timeLeft = useCountdown(room?.endTime);

    if (error && !room) {
        return (
            <Frame title="Temple Town">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" className="w-100" onClick={() => navigate('/join')}>Back to Join</Button>
            </Frame>
        );
    }
    if (!room) {
        return (
            <Frame title="Temple Town">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 mb-0">Joining room {roomCode}...</p>
            </Frame>
        );
    }
    if (room.isPaused) return <CouchCastPausedOverlay />;

    const me = Object.values(room.players).find((p) => p.id === socket.id) || {};
    const round = room.round;
    const isLeader = room.hostId === socket.id;
    const here = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const myLots = room.town.lots.filter((l) => l.ownerKey && l.ownerKey === me.key);
    const lotById = (id) => room.town.lots.find((l) => l.id === id);
    const hoodName = (id) => room.town.hoods.find((h) => h.id === id)?.name || '';
    const clock = timeLeft !== null && <span className={`tt-phone-clock ${timeLeft <= 5 ? 'low' : ''}`}>⏱️ {timeLeft}s</span>;
    const status = <MyStatus me={me} lots={myLots.length} />;
    const errorBox = error && <Alert variant="warning" className="py-2 small">{error}</Alert>;

    switch (room.gameState) {
        // ===================== LOBBY / RULES =====================
        case 'lobby':
            return (
                <>
                    {isLeader && (
                        <div className="tc-leader-bar">
                            <span className="fw-bold text-dark small">👑 Room Leader</span>
                            <Button
                                variant={here.length < room.minPlayers ? 'secondary' : 'primary'}
                                className="fw-bold flex-grow-1"
                                disabled={here.length < room.minPlayers}
                                onClick={() => { setError(''); socket.emit('startGame', { roomCode }); }}
                            >
                                {here.length < room.minPlayers ? `Need ${room.minPlayers} players (${here.length} so far)` : 'All in!'}
                            </Button>
                        </div>
                    )}
                    <Frame title="You're In!">
                        {errorBox}
                        {!isLeader && (
                            <div className="p-2 border rounded bg-light text-muted small">
                                Waiting for <strong>{here.find((p) => p.id === room.hostId)?.name || 'the leader'}</strong> to start the game...
                            </div>
                        )}
                        <SnakeSnack socket={socket} roomCode={roomCode} room={room} />
                    </Frame>
                </>
            );
        case 'rules':
            return (
                <Frame title="How to Play">
                    <div className="text-start small tt-phone-rules">
                        <p><strong>📰 Headline:</strong> the news changes tonight's payouts.</p>
                        <p><strong>🔨 Land Grab:</strong> bid in secret. Highest bid wins the lot.</p>
                        <p><strong>🏗️ Build:</strong> empty lot → Shop → Tower. More rent, bigger payouts.</p>
                        <p><strong>🌙 Night Out:</strong> pick a neighborhood. Its payout is shared by everyone there, and visitors pay rent to the owners.</p>
                        <p className="mb-0"><strong>👑 Boss:</strong> own the most lots in a neighborhood (2+) for an extra fee from every visitor.</p>
                    </div>
                    <p className="text-muted small mb-0 mt-2">You start with {money(room.town.rules.startCash)}. Listen to the TV!</p>
                </Frame>
            );

        // ===================== 📰 HEADLINE =====================
        case 'headline':
            return (
                <Frame title={`Round ${room.currentRound} of ${room.totalRounds}`} right={clock}>
                    {status}
                    <div className="tt-phone-news">
                        <div className="tt-phone-news-mast">The Temple Town Tribune</div>
                        <h3 className="fw-bold mb-1">{round.headline.title}</h3>
                        <p className="mb-0">{round.headline.text}</p>
                    </div>
                    <p className="text-muted small mt-2 mb-0">Get ready: lots go on sale next.</p>
                </Frame>
            );

        // ===================== 🔨 LAND GRAB =====================
        case 'auction': {
            const forSale = round.forSale.map(lotById).filter(Boolean);
            const cheapest = Math.min(...forSale.map((l) => l.price));
            if (me.hasSubmitted) {
                const placed = Object.entries(mine.bids || {});
                return (
                    <Frame title="Land Grab" right={clock}>
                        {status}
                        <div className="tt-phone-big">🔒</div>
                        <p className="fw-bold fs-5 mb-1">{me.cash < cheapest ? "You can't afford a lot this round." : placed.length ? 'Bids locked in!' : 'You passed this round.'}</p>
                        {placed.map(([id, amount]) => <div key={id} className="small">{lotById(id)?.name}: <strong>{money(amount)}</strong></div>)}
                        <p className="text-muted small mt-2 mb-0">Watch the TV for the results.</p>
                    </Frame>
                );
            }
            const total = Object.values(bids).reduce((s, a) => s + a, 0);
            const left = me.cash - total;
            const step = room.town.rules.bidStep;
            const setBid = (lot, amount) => setBids((prev) => {
                const next = { ...prev };
                if (amount === null) delete next[lot.id];
                else next[lot.id] = Math.max(lot.price, amount);
                return next;
            });
            return (
                <Frame title="Land Grab" right={clock}>
                    {status}
                    {errorBox}
                    <p className="small text-muted mb-2">Bid in secret. Highest bid wins. You only pay for lots you win.</p>
                    {forSale.map((lot) => {
                        const amount = bids[lot.id];
                        const isBidding = amount !== undefined;
                        return (
                            <div key={lot.id} className={`tt-phone-lot ${isBidding ? 'is-bidding' : ''}`} style={{ '--tint': HOOD_LOOKS[lot.hood].tint }}>
                                <div className="tt-phone-lot-head">
                                    <span>{HOOD_LOOKS[lot.hood].icon} <strong>{lot.name}</strong></span>
                                    <span className="small">{hoodName(lot.hood)}</span>
                                </div>
                                <div className="small text-muted text-start mb-1">Lowest bid {money(lot.price)} · worth {money(lot.price)} · a Shop here costs {money(lot.price)}</div>
                                {isBidding ? (
                                    <div className="tt-bid-row">
                                        <Button variant="outline-secondary" size="sm" onClick={() => setBid(lot, amount - step * 5)} disabled={amount <= lot.price}>−50</Button>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setBid(lot, amount - step)} disabled={amount <= lot.price}>−10</Button>
                                        <span className="tt-bid-amount">{money(amount)}</span>
                                        <Button variant="outline-primary" size="sm" onClick={() => setBid(lot, amount + step)}>+10</Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => setBid(lot, amount + step * 5)}>+50</Button>
                                        <Button variant="link" size="sm" className="text-danger" onClick={() => setBid(lot, null)}>✕</Button>
                                    </div>
                                ) : (
                                    <Button variant="primary" size="sm" className="w-100 fw-bold" disabled={left < lot.price} onClick={() => setBid(lot, lot.price)}>
                                        Bid on {lot.name}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                    <div className={`small fw-bold my-2 ${left < 0 ? 'text-danger' : ''}`}>
                        {total ? `Bidding ${money(total)} in all · ${money(left)} left if you win everything` : 'No bids yet.'}
                    </div>
                    <Button variant="success" size="lg" className="w-100 fw-bold" disabled={left < 0} onClick={() => socket.emit('submit_bids', { roomCode, bids })}>
                        {total ? 'Lock in my bids' : 'Pass this round'}
                    </Button>
                </Frame>
            );
        }
        case 'auction_results': {
            const sales = round.sales || [];
            return (
                <Frame title="Land Grab">
                    {status}
                    {sales.map((sale) => {
                        const lot = lotById(sale.lotId);
                        const myBid = sale.bids.find((b) => b.key === me.key);
                        const winner = playerByKey(room, sale.winnerKey);
                        const iWon = sale.winnerKey === me.key;
                        return (
                            <div key={sale.lotId} className={`tt-phone-sale ${iWon ? 'is-mine' : ''}`}>
                                <strong>{lot?.name}</strong>
                                <div className="small">
                                    {iWon ? `🎉 You won it for ${money(sale.amount)}!`
                                        : winner ? `Sold to ${winner.name} for ${money(sale.amount)}${myBid ? ` (you bid ${money(myBid.amount)})` : ''}`
                                            : 'No bids. It comes back later.'}
                                </div>
                            </div>
                        );
                    })}
                </Frame>
            );
        }

        // ===================== 🏗️ BUILD =====================
        case 'build': {
            if (me.hasSubmitted) {
                return (
                    <Frame title="Build" right={clock}>
                        {status}
                        <div className="tt-phone-big">🏗️</div>
                        <p className="fw-bold fs-5 mb-1">{myLots.length ? 'Done building!' : "You don't own any lots yet."}</p>
                        <p className="text-muted small mb-0">{myLots.length ? 'Watch your buildings go up on the TV.' : 'Bid on one next round.'}</p>
                    </Frame>
                );
            }
            return (
                <Frame title="Build" right={clock}>
                    {status}
                    {errorBox}
                    <p className="small text-muted mb-2">Buildings charge visitors more rent, and make their neighborhood pay out more. They count fully toward your net worth.</p>
                    {myLots.map((lot) => {
                        const names = room.town.rules.levelNames;
                        const canAfford = lot.nextCost !== null && me.cash >= lot.nextCost;
                        return (
                            <div key={lot.id} className="tt-phone-mylot" style={{ '--tint': HOOD_LOOKS[lot.hood].tint, '--owner': playerColor(me.seat) }}>
                                <div className="tt-phone-mylot-art"><Building level={lot.level} color={playerColor(me.seat)} owned /></div>
                                <div className="flex-grow-1 text-start">
                                    <div className="fw-bold">{lot.name}</div>
                                    <div className="small text-muted">{hoodName(lot.hood)} · {names[lot.level]} · rent {money(lot.rent)}</div>
                                </div>
                                {lot.nextCost === null
                                    ? <span className="small fw-bold text-success">Top floor!</span>
                                    : (
                                        <Button
                                            variant={canAfford ? 'primary' : 'outline-secondary'}
                                            size="sm"
                                            className="fw-bold"
                                            disabled={!canAfford || pendingLot === lot.id}
                                            onClick={() => { setPendingLot(lot.id); socket.emit('build', { roomCode, lotId: lot.id }); }}
                                        >
                                            {names[lot.level + 1]}<br />{money(lot.nextCost)}
                                        </Button>
                                    )}
                            </div>
                        );
                    })}
                    <Button variant="success" size="lg" className="w-100 fw-bold mt-2" onClick={() => socket.emit('build_done', { roomCode })}>
                        Done building
                    </Button>
                </Frame>
            );
        }

        // ===================== 🌙 NIGHT OUT =====================
        case 'night': {
            if (me.hasSubmitted) {
                const where = mine.night;
                return (
                    <Frame title="Night Out" right={clock}>
                        {status}
                        <div className="tt-phone-big">{where === 'home' ? '🏠' : HOOD_LOOKS[where]?.icon || '🌙'}</div>
                        <p className="fw-bold fs-5 mb-1">{where === 'home' ? "You're staying in tonight." : `You're off to ${hoodName(where)}!`}</p>
                        <p className="text-muted small mb-0">Waiting for everyone else to choose...</p>
                    </Frame>
                );
            }
            const options = room.town.hoods.map((h) => ({
                id: h.id,
                name: h.name,
                icon: HOOD_LOOKS[h.id].icon,
                tint: HOOD_LOOKS[h.id].tint,
                pays: round.payouts[h.id],
                rent: rentFor(room, h.id, me.key),
                owned: myLots.filter((l) => l.hood === h.id).length,
                isBoss: h.boss === me.key,
            }));
            return (
                <Frame title="Night Out" right={clock}>
                    {status}
                    <p className="small text-muted mb-2">Each payout is <strong>shared</strong> by everyone who goes there. You pay rent to the owners (never to yourself).</p>
                    {options.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            className={`tt-night-option ${nightPick === o.id ? 'is-picked' : ''}`}
                            style={{ '--tint': o.tint }}
                            onClick={() => setNightPick(o.id)}
                        >
                            <span className="tt-night-icon">{o.icon}</span>
                            <span className="flex-grow-1 text-start">
                                <span className="d-block fw-bold">{o.name}{o.isBoss ? ' 👑' : ''}</span>
                                <span className="d-block small">{o.owned ? `You own ${o.owned} here` : 'You own nothing here'}</span>
                            </span>
                            <span className="text-end small">
                                <span className="d-block">Pays <strong>{money(o.pays)}</strong></span>
                                <span className={`d-block ${o.rent ? 'text-danger' : 'text-success'}`}>Rent {money(o.rent)}</span>
                            </span>
                        </button>
                    ))}
                    <button type="button" className={`tt-night-option ${nightPick === 'home' ? 'is-picked' : ''}`} style={{ '--tint': '#6c757d' }} onClick={() => setNightPick('home')}>
                        <span className="tt-night-icon">🏠</span>
                        <span className="flex-grow-1 text-start"><span className="d-block fw-bold">Stay in</span><span className="d-block small">Safe and quiet</span></span>
                        <span className="text-end small"><span className="d-block">Pays <strong>{money(round.homePay)}</strong></span><span className="d-block text-success">No rent</span></span>
                    </button>
                    <Button variant="success" size="lg" className="w-100 fw-bold mt-2" disabled={!nightPick} onClick={() => socket.emit('go_out', { roomCode, where: nightPick })}>
                        {nightPick ? `Go to ${nightPick === 'home' ? 'bed 😴' : hoodName(nightPick)}` : 'Pick a place'}
                    </Button>
                </Frame>
            );
        }

        // ===================== 💰 PAYDAY / STANDINGS / FINAL =====================
        case 'payday':
        case 'standings': {
            const r = round.payday?.results?.[me.key];
            const ranked = rankPlayers(room);
            const rank = ranked.findIndex((p) => p.key === me.key) + 1;
            return (
                <Frame title={room.gameState === 'payday' ? 'Payday' : 'Standings'}>
                    {status}
                    {r && (
                        <div className="tt-phone-payday">
                            <div className="fw-bold mb-1">{r.night === 'home' ? '🏠 You stayed in' : `${HOOD_LOOKS[r.night]?.icon} You went to ${hoodName(r.night)}`}</div>
                            <Row label={r.night === 'home' ? 'Night in' : 'Your share of the payout'} value={signedMoney(r.share)} />
                            {r.rentPaid > 0 && <Row label="Rent you paid" value={signedMoney(-r.rentPaid)} bad />}
                            {r.rentGot > 0 && <Row label="Rent you collected" value={signedMoney(r.rentGot)} />}
                            <Row label="Tonight" value={signedMoney(r.net)} strong bad={r.net < 0} />
                        </div>
                    )}
                    <p className="fw-bold fs-5 mt-2 mb-0">You're {ordinal(rank)} of {ranked.length}</p>
                    <p className="text-muted small mb-0">Net worth {money(me.worth)}</p>
                </Frame>
            );
        }
        case 'final': {
            const ranked = rankPlayers(room);
            const rank = ranked.findIndex((p) => p.key === me.key) + 1;
            return (
                <Frame title="Final Standings">
                    <div className="tt-phone-big">{rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏙️'}</div>
                    <p className="fw-bold fs-4 mb-1">{rank === 1 ? 'You won Temple Town!' : `You finished ${ordinal(rank)}`}</p>
                    <p className="mb-3">Net worth <strong>{money(me.worth)}</strong></p>
                    {ranked.map((p, i) => (
                        <div key={p.key} className="tt-phone-final-row" style={{ '--owner': playerColor(p.seat) }}>
                            <span>{i + 1}</span>
                            <Avatar id={p.avatar} name={p.name} size={28} />
                            <span className="flex-grow-1 text-start text-truncate">{p.name}</span>
                            <strong>{money(p.worth)}</strong>
                        </div>
                    ))}
                    <p className="text-muted small mt-3 mb-0">The host can start another game from the TV.</p>
                </Frame>
            );
        }
        default:
            return <Frame title="Temple Town"><p className="mb-0">{PHASES[room.gameState]?.title || 'Hang on...'}</p></Frame>;
    }
}

const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

function Row({ label, value, strong, bad }) {
    return (
        <div className={`d-flex justify-content-between ${strong ? 'fw-bold border-top pt-1 mt-1' : ''}`}>
            <span>{label}</span>
            <span className={bad ? 'text-danger' : 'text-success'}>{value}</span>
        </div>
    );
}

/** My cash and net worth, along the top of every screen in a round */
function MyStatus({ me, lots }) {
    return (
        <div className="tt-phone-status" style={{ '--owner': playerColor(me.seat) }}>
            <Avatar id={me.avatar} name={me.name} size={34} />
            <div className="text-start flex-grow-1">
                <div className="fw-bold lh-1">{me.name}</div>
                <div className="small text-muted">{lots} lot{lots === 1 ? '' : 's'} · worth {money(me.worth)}</div>
            </div>
            <div className={`tt-phone-cash ${me.cash < 0 ? 'is-red' : ''}`}>{money(me.cash)}</div>
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
