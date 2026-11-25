import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Avatar } from '../../avatars.jsx';
import { townSocket as socket } from '../../socket.js';
import { speak, stopVoice } from '../../voice.js';

// 🏙️ Temple Town's TV screens: the town map (always on screen during a round), the players down the side,
// and a card over the map for the moments that need one (the headline, the bids, the standings).

// ---------- Shared bits (the phones use these too) ----------

/** Each player's color on the map: their lots, their flag, their name */
export const PLAYER_COLORS = ['#ef476f', '#118ab2', '#f3a712', '#06a77d', '#9b5de5', '#f3722c', '#00a6d6', '#7cb518'];
export const playerColor = (seat) => PLAYER_COLORS[((seat ?? 0) % PLAYER_COLORS.length + PLAYER_COLORS.length) % PLAYER_COLORS.length];

/** How each neighborhood looks */
export const HOOD_LOOKS = {
    docks: { icon: '⚓', tint: '#3d8fd1' },
    market: { icon: '🧺', tint: '#c48a3a' },
    fair: { icon: '🎡', tint: '#4caf50' },
    neon: { icon: '🕹️', tint: '#7b3fd0' },
    hill: { icon: '🔭', tint: '#2f7d4f' },
};

/** "$1,240", "−$80" */
export const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(Math.round(n || 0)).toLocaleString('en-US')}`;
/** "+$240", "−$80", "$0" */
export const signedMoney = (n) => (n > 0 ? `+${money(n)}` : money(n));

/** The players (not the TV), in seat order */
export const townPlayers = (room) => Object.values(room?.players || {}).filter((p) => !p.isCaster).sort((a, b) => a.seat - b.seat);
export const playerByKey = (room, key) => townPlayers(room).find((p) => p.key === key) || null;

/** Highest net worth first */
export const rankPlayers = (room) => [...townPlayers(room)].sort((a, b) => b.worth - a.worth || a.seat - b.seat);

/** What a visitor with `myKey` would pay in rent tonight in a neighborhood (the same sums as the server) */
export const rentFor = (room, hoodId, myKey) => {
    const mult = room.round?.rentMult ?? 1;
    if (!mult) return 0;
    const lots = room.town.lots.filter((l) => l.hood === hoodId && l.ownerKey && l.ownerKey !== myKey);
    const boss = room.town.hoods.find((h) => h.id === hoodId)?.boss;
    return (lots.reduce((sum, l) => sum + l.rent, 0) + (boss && boss !== myKey ? room.town.rules.bossFee : 0)) * mult;
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

// What each part of a round is called, and what to do
export const PHASES = {
    headline: { title: 'Headline', hint: 'The news sets tonight’s payouts.' },
    auction: { title: 'Land Grab', hint: 'Bid in secret on your phone. Highest bid wins the lot.' },
    auction_results: { title: 'Land Grab', hint: 'The bids are in!' },
    build: { title: 'Build', hint: 'Upgrade your lots on your phone: an empty lot becomes a Shop, a Shop becomes a Tower.' },
    night: { title: 'Night Out', hint: 'Where are you going tonight? Payouts are shared, and visitors pay rent to the owners.' },
    payday: { title: 'Payday', hint: 'Payouts shared, rent paid.' },
    standings: { title: 'Standings', hint: 'Net worth: cash, plus what your lots and buildings cost, plus Boss bonuses.' },
};

// ---------- 🏢 A lot's building, drawn in code ----------
// level 0: an empty plot with a sign (a flag in the owner's color once it's sold), 1: a Shop with an awning, 2: a Tower
export function Building({ level, color, owned }) {
    const c = color || '#adb5bd';
    return (
        <svg viewBox="0 0 100 100" className="tt-building" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <ellipse cx="50" cy="93" rx="44" ry="6" fill="rgba(0,0,0,0.18)" />
            {level === 0 && (
                <g>
                    <rect x="14" y="78" width="72" height="14" rx="4" fill="#8d6e4f" opacity="0.55" />
                    <path d="M22 84 h10 M40 86 h12 M62 83 h10" stroke="#6b4f36" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <rect x="47" y="44" width="4" height="40" rx="1.5" fill="#6b4f36" />
                    {owned
                        ? <path d="M51 46 L78 54 L51 62 Z" fill={c} stroke="#fff" strokeWidth="1.5" />
                        : (
                            <g>
                                <rect x="20" y="44" width="58" height="22" rx="3" fill="#fff" stroke="#6b4f36" strokeWidth="2" />
                                <text x="49" y="58.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#c92a2a" fontFamily="system-ui, sans-serif" textLength="48" lengthAdjust="spacingAndGlyphs">FOR SALE</text>
                            </g>
                        )}
                </g>
            )}
            {level === 1 && (
                <g>
                    <rect x="20" y="52" width="60" height="40" rx="2" fill="#fff8ec" stroke="#5c4033" strokeWidth="2" />
                    {/* the awning, striped in the owner's color */}
                    <path d="M14 52 L22 38 H78 L86 52 Z" fill={c} stroke="#5c4033" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M30 38 L26 52 M42 38 L40 52 M54 38 L56 52 M66 38 L70 52" stroke="#fff" strokeWidth="4" opacity="0.75" />
                    <rect x="28" y="60" width="18" height="14" rx="1.5" fill="#bfe3ff" stroke="#5c4033" strokeWidth="1.5" />
                    <rect x="54" y="62" width="16" height="30" rx="1.5" fill={c} stroke="#5c4033" strokeWidth="1.5" />
                    <circle cx="66" cy="78" r="1.6" fill="#fff" />
                </g>
            )}
            {level === 2 && (
                <g>
                    <rect x="28" y="14" width="44" height="78" rx="2" fill={c} stroke="#2b2b2b" strokeWidth="2" />
                    <rect x="28" y="14" width="44" height="78" rx="2" fill="url(#ttTowerShine)" />
                    <path d="M50 14 V4" stroke="#2b2b2b" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="4" r="2.4" fill="#ff6b6b" />
                    {[22, 34, 46, 58, 70].map((y) => [34, 46, 58].map((x) => (
                        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="7" rx="1" fill="#fff6c9" opacity="0.92" />
                    )))}
                    <rect x="44" y="80" width="12" height="12" rx="1" fill="#2b2b2b" opacity="0.7" />
                    <defs>
                        <linearGradient id="ttTowerShine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
                            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
                            <stop offset="1" stopColor="#000" stopOpacity="0.15" />
                        </linearGradient>
                    </defs>
                </g>
            )}
        </svg>
    );
}

// ---------- 🗺️ The town map ----------
function Lot({ room, lot, forSale, justSold }) {
    const owner = lot.ownerKey ? playerByKey(room, lot.ownerKey) : null;
    const color = owner ? playerColor(owner.seat) : null;
    return (
        <div className={`tt-lot ${forSale ? 'is-for-sale' : ''} ${justSold ? 'is-just-sold' : ''}`} style={color ? { '--owner': color } : undefined}>
            <div className="tt-lot-art" key={`${lot.id}-${lot.level}`}>
                <Building level={lot.level} color={color} owned={!!owner} />
            </div>
            {owner && (
                <div className="tt-lot-owner">
                    <Avatar id={owner.avatar} name={owner.name} size={28} className="tt-lot-avatar" />
                </div>
            )}
            {owner && <div className="tt-lot-rent">{money(lot.rent)}</div>}
            {forSale && <div className="tt-lot-tag">For sale · from {money(lot.price)}</div>}
            <div className="tt-lot-name">{lot.name}</div>
        </div>
    );
}

function Visitors({ room, keys, results }) {
    if (!keys?.length) return <div className="tt-visitors is-empty">Nobody came</div>;
    return (
        <div className="tt-visitors">
            {keys.map((key, i) => {
                const p = playerByKey(room, key);
                const r = results?.[key];
                if (!p) return null;
                return (
                    <div key={key} className="tt-visitor" style={{ animationDelay: `${i * 0.25}s`, '--owner': playerColor(p.seat) }}>
                        <Avatar id={p.avatar} name={p.name} size={34} />
                        {r && <span className={`tt-visitor-net ${r.net >= 0 ? 'up' : 'down'}`}>{signedMoney(r.share - r.rentPaid)}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export function TownMap({ room }) {
    const state = room.gameState;
    const round = room.round;
    const forSale = new Set(state === 'auction' ? round?.forSale || [] : []);
    const justSold = new Set(state === 'auction_results' ? (round?.sales || []).filter((s) => s.winnerKey).map((s) => s.lotId) : []);
    const payday = ['payday', 'standings'].includes(state) ? round?.payday : null;
    const showPayouts = ['headline', 'auction', 'auction_results', 'build', 'night'].includes(state);
    const headlineHood = round?.headline?.hoodId;

    return (
        <div className="tt-map">
            {room.town.hoods.map((hood) => {
                const look = HOOD_LOOKS[hood.id];
                const lots = room.town.lots.filter((l) => l.hood === hood.id);
                const boss = hood.boss ? playerByKey(room, hood.boss) : null;
                const result = payday?.hoods?.[hood.id];
                const isQuiet = !!payday && !result?.visitors?.length;   // nobody went there tonight
                return (
                    <section key={hood.id} className={`tt-hood tt-hood-${hood.id} ${headlineHood === hood.id && !payday ? 'is-in-the-news' : ''} ${isQuiet ? 'is-quiet' : ''}`} style={{ '--tint': look.tint }}>
                        <header className="tt-hood-head">
                            <span className="tt-hood-icon" aria-hidden="true">{look.icon}</span>
                            <span className="tt-hood-name">{hood.name}</span>
                            {boss && (
                                <span className="tt-hood-boss" title={`${boss.name} is the Boss`}>
                                    👑<Avatar id={boss.avatar} name={boss.name} size={22} />
                                </span>
                            )}
                            {showPayouts && round && (
                                <span className={`tt-hood-pays ${round.payouts[hood.id] === 0 ? 'is-zero' : ''}`}>
                                    Pays {money(round.payouts[hood.id])}
                                </span>
                            )}
                            {result && <span className="tt-hood-pays">{result.visitors.length ? `${money(result.share)} each` : money(result.pool)}</span>}
                        </header>
                        <div className="tt-lots">
                            {lots.map((lot) => <Lot key={lot.id} room={room} lot={lot} forSale={forSale.has(lot.id)} justSold={justSold.has(lot.id)} />)}
                        </div>
                        {payday && !isQuiet && <Visitors room={room} keys={result.visitors} results={payday.results} />}
                    </section>
                );
            })}

            {/* 🏠 Staying in: a safe little payout and no rent */}
            <section className="tt-hood tt-hood-home" style={{ '--tint': '#6c757d' }}>
                <header className="tt-hood-head">
                    <span className="tt-hood-icon" aria-hidden="true">🏠</span>
                    <span className="tt-hood-name">Staying In</span>
                    {round && <span className="tt-hood-pays">Pays {money(payday?.homePay ?? round.homePay)}</span>}
                </header>
                <div className="tt-home-body">
                    {payday && payday.home.length > 0
                        ? <Visitors room={room} keys={payday.home} results={payday.results} />
                        : <div className="tt-home-note">{payday ? 'Nobody stayed in tonight.' : 'No rent to pay. Just a quiet night in.'}</div>}
                </div>
            </section>
        </div>
    );
}

// ---------- 👥 The players down the side ----------
export function PlayersPanel({ room }) {
    const state = room.gameState;
    const payday = ['payday', 'standings'].includes(state) ? room.round?.payday : null;
    const showDone = ['auction', 'build', 'night'].includes(state);
    const ranked = rankPlayers(room);
    return (
        <aside className="tt-side">
            <div className="tt-side-title">Net Worth</div>
            <div className="tt-side-list">
                {ranked.map((p, i) => {
                    const r = payday?.results?.[p.key];
                    return (
                        <div key={p.key || p.id} className={`tt-player ${p.isConnected ? '' : 'is-away'}`} style={{ '--owner': playerColor(p.seat) }}>
                            <span className="tt-player-rank">{i + 1}</span>
                            <Avatar id={p.avatar} name={p.name} size={40} className="tt-player-avatar" />
                            <div className="tt-player-text">
                                <div className="tt-player-name">{p.name}</div>
                                <div className={`tt-player-cash ${p.cash < 0 ? 'is-red' : ''}`}>Cash {money(p.cash)}</div>
                            </div>
                            <div className="tt-player-worth">
                                {money(p.worth)}
                                {r && <div className={`tt-player-night ${r.net >= 0 ? 'up' : 'down'}`}>{signedMoney(r.net)}</div>}
                            </div>
                            {showDone && p.isConnected && <span className={`tt-player-done ${p.hasSubmitted ? 'is-done' : ''}`}>{p.hasSubmitted ? '✓' : '…'}</span>}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

// ---------- The bar across the top: round, part of the round, and the clock ----------
export function PhaseBar({ room }) {
    const phase = PHASES[room.gameState] || { title: '', hint: '' };
    const timeLeft = useCountdown(room.endTime);
    const total = useRef({ key: null, value: null });
    const key = `${room.currentRound}-${room.gameState}`;
    if (total.current.key !== key) total.current = { key, value: timeLeft };
    if (timeLeft !== null && (total.current.value === null || timeLeft > total.current.value)) total.current.value = timeLeft;
    const percent = total.current.value ? (timeLeft / total.current.value) * 100 : 0;
    const isLow = timeLeft !== null && timeLeft <= 5;
    return (
        <div className="tt-top">
            <div className="tt-top-round">Round {room.currentRound}<span> of {room.totalRounds}</span></div>
            <div className="tt-top-phase">
                <div className="tt-top-title">{phase.title}</div>
                <div className="tt-top-hint">{phase.hint}</div>
            </div>
            <div className={`tt-top-clock ${isLow ? 'is-low' : ''}`}>{timeLeft !== null ? `${timeLeft}s` : ''}</div>
            {timeLeft !== null && <div className="tt-clock-bar"><div className={isLow ? 'is-low' : ''} style={{ width: `${percent}%` }} /></div>}
        </div>
    );
}

// ---------- 📰 The headline, as a newspaper ----------
export function HeadlineCard({ room }) {
    const headline = room.round?.headline;
    if (!headline) return null;
    return (
        <div className="tt-overlay">
            <div className="tt-news">
                <div className="tt-news-masthead">The Temple Town Tribune</div>
                <div className="tt-news-dateline">Round {room.currentRound} of {room.totalRounds}{room.currentRound === room.totalRounds ? ' · Final edition' : ''}</div>
                <h1 className="tt-news-headline">{headline.title}</h1>
                <p className="tt-news-text">{headline.text}</p>
            </div>
        </div>
    );
}

// ---------- 🔨 The bids, one lot at a time ----------
export function SalesReveal({ room }) {
    const sales = room.round?.sales || [];
    if (!sales.length) return null;
    return (
        <div className="tt-overlay">
            <div className="tt-sales">
                <h2 className="tt-overlay-title">The bids are in!</h2>
                <div className="tt-sales-list">
                    {sales.map((sale, i) => {
                        const lot = room.town.lots.find((l) => l.id === sale.lotId);
                        const hood = room.town.hoods.find((h) => h.id === lot?.hood);
                        const winner = sale.winnerKey ? playerByKey(room, sale.winnerKey) : null;
                        return (
                            <div key={sale.lotId} className="tt-sale" style={{ animationDelay: `${i * 3}s` }}>
                                <div className="tt-sale-lot">
                                    <span aria-hidden="true">{HOOD_LOOKS[lot?.hood]?.icon}</span> {lot?.name}
                                    <span className="tt-sale-hood">{hood?.name} · from {money(lot?.price)}</span>
                                </div>
                                <div className="tt-sale-bids">
                                    {sale.bids.length === 0 && <span className="tt-sale-none">No bids. It goes back on the market.</span>}
                                    {sale.bids.map((bid) => {
                                        const p = playerByKey(room, bid.key);
                                        return (
                                            <span key={bid.key} className={`tt-bid ${bid.key === sale.winnerKey ? 'is-winner' : ''}`} style={{ '--owner': playerColor(p?.seat) }}>
                                                <Avatar id={p?.avatar} name={bid.name} size={30} /> {money(bid.amount)}
                                            </span>
                                        );
                                    })}
                                </div>
                                {winner && (
                                    <div className="tt-sale-sold" style={{ animationDelay: `${i * 3 + 1.2}s`, '--owner': playerColor(winner.seat) }}>
                                        SOLD to {winner.name}{sale.tied ? ' (tie goes to the player further behind)' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ---------- 🏆 Net worth between rounds ----------
export function StandingsCard({ room }) {
    const ranked = rankPlayers(room);
    return (
        <div className="tt-overlay">
            <div className="tt-standings">
                <h2 className="tt-overlay-title">After round {room.currentRound}</h2>
                {ranked.map((p, i) => {
                    const change = p.worth - (p.worthAtStart ?? p.worth);
                    return (
                        <div key={p.key} className="tt-standing" style={{ '--owner': playerColor(p.seat), animationDelay: `${0.12 * i}s` }}>
                            <span className="tt-standing-rank">{i + 1}</span>
                            <Avatar id={p.avatar} name={p.name} size={44} />
                            <span className="tt-standing-name">{p.name}</span>
                            <span className={`tt-standing-change ${change >= 0 ? 'up' : 'down'}`}>{signedMoney(change)}</span>
                            <span className="tt-standing-worth">{money(p.worth)}</span>
                        </div>
                    );
                })}
                <div className="tt-standings-next">{room.currentRound + 1 >= room.totalRounds ? 'Next up: the final round!' : 'Next round coming up...'}</div>
            </div>
        </div>
    );
}

// ---------- 📖 How to play ----------
export const TOWN_RULES_NARRATION = [
    'Welcome to Temple Town!',
    'Each round starts with a headline that changes tonight’s payouts.',
    'Then comes the land grab. Bid in secret on your phone. The highest bid wins the lot.',
    'Next, build. Turn your empty lots into Shops, and your Shops into Towers. Buildings charge more rent.',
    'Then everyone picks where to go out tonight. A neighborhood’s payout is shared by everyone who goes, and visitors pay rent to the owners there.',
    'Own the most lots in a neighborhood and you’re its Boss, for an extra fee from every visitor.',
    'Nobody gets knocked out. The richest player at the end wins!',
];
const RULES_SECONDS = 45;
const NARRATION_GRACE_SECONDS = 20;

const RULE_STEPS = [
    { icon: '📰', title: 'Headline', text: 'The news changes tonight’s payouts: a festival, a blackout, a rent holiday...' },
    { icon: '🔨', title: 'Land Grab', text: 'Lots go on sale. Bid in secret on your phone. Highest bid wins (ties go to whoever is behind).' },
    { icon: '🏗️', title: 'Build', text: 'Empty lot → Shop → Tower. Buildings charge more rent and make a neighborhood pay more.' },
    { icon: '🌙', title: 'Night Out', text: 'Pick a neighborhood in secret. Its payout is shared by everyone there. Visitors pay rent to the owners.' },
    { icon: '💰', title: 'Payday', text: 'Own the most lots in a neighborhood (2+) to be its Boss 👑. Richest at the end wins. Nobody is knocked out.' },
];

export function TownRulesTV({ roomCode, totalRounds }) {
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
        speak(TOWN_RULES_NARRATION, roomCode).then((wasSpoken) => {
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
        <div className="fullscreen-gameplay-container tt-tv">
            <div className="d-flex flex-column h-100 w-100 p-3">
                <h2 className="tt-rules-title">How to Play Temple Town</h2>
                <div className="tt-rules-sub">{totalRounds} rounds. Start with $1,500. Highest net worth wins.</div>
                <div className="tt-rules-grid">
                    {RULE_STEPS.map((step, i) => (
                        <div key={step.title} className="tt-rule" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="tt-rule-step">Step {i + 1}</div>
                            <div className="tt-rule-icon">{step.icon}</div>
                            <div className="tt-rule-title">{step.title}</div>
                            <div className="tt-rule-text">{step.text}</div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 tt-rules-foot">
                    <span>Game starts in {Math.max(timeLeft, 0)}s</span>
                    <Button variant="light" size="sm" className="fw-bold px-4" onClick={handleNext}>Skip ⏭</Button>
                </div>
            </div>
        </div>
    );
}

// ---------- 🎉 The final standings ----------
export function TownFinalTV({ room, isRevealed, endActions }) {
    const ranked = rankPlayers(room);
    const top = ranked[0]?.worth ?? 0;
    const champions = ranked.filter((p) => p.worth === top);
    const breakdown = (p) => {
        const lots = room.town.lots.filter((l) => l.ownerKey === p.key);
        const property = lots.reduce((sum, l) => sum + l.value, 0);
        const bosses = room.town.hoods.filter((h) => h.boss === p.key).length;
        return { lots: lots.length, property, bosses, bonus: bosses * room.town.rules.bossBonus };
    };
    return (
        <div className="fullscreen-gameplay-container tt-tv">
            <div className="tt-final">
                {isRevealed && (
                    <div className="tt-final-champ">
                        <div className="tt-final-crown" aria-hidden="true">👑</div>
                        <div className="tt-final-label">{champions.length > 1 ? 'Co-Tycoons of Temple Town!' : 'Tycoon of Temple Town!'}</div>
                        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                            {champions.map((p) => (
                                <span key={p.key} className="d-flex align-items-center gap-2">
                                    <Avatar id={p.avatar} name={p.name} size={84} />
                                    <span className="tt-final-name">{p.name}</span>
                                </span>
                            ))}
                        </div>
                        <div className="tt-final-worth">{money(top)}</div>
                    </div>
                )}
                <div className="tt-final-table">
                    <div className="tt-final-row tt-final-headrow">
                        <span /><span>Player</span><span>Cash</span><span>Property</span><span>Boss</span><span>Net worth</span>
                    </div>
                    {ranked.map((p, i) => {
                        const b = breakdown(p);
                        return (
                            <div key={p.key} className="tt-final-row" style={{ '--owner': playerColor(p.seat) }}>
                                <span className="tt-standing-rank">{i + 1}</span>
                                <span className="d-flex align-items-center gap-2 text-truncate"><Avatar id={p.avatar} name={p.name} size={36} /> {p.name}</span>
                                <span className={p.cash < 0 ? 'text-danger' : ''}>{money(p.cash)}</span>
                                <span>{money(b.property)} <small>({b.lots} lot{b.lots === 1 ? '' : 's'})</small></span>
                                <span>{b.bosses ? `👑×${b.bosses} ${money(b.bonus)}` : '—'}</span>
                                <span className="tt-final-total">{money(p.worth)}</span>
                            </div>
                        );
                    })}
                </div>
                {endActions && <div className="mt-3">{endActions}</div>}
            </div>
        </div>
    );
}
