import React, { useRef } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import useCountdown from './useCountdown.js';
import ListBoard from './ListBoard.jsx';
import { RoundCard, CardChip, CARD_LOOKS } from './ListCards.jsx';
import '../../styles/lists.css';

// The category in a frosted banner across the top of the TV
function CategoryBanner({ category, size = 'big' }) {
    const fontSize = size === 'big'
        ? (category.length > 32 ? 'clamp(1.2rem, 7vh, 3.4rem)' : 'clamp(1.4rem, 9vh, 4.2rem)')
        : 'clamp(0.95rem, 4.2vh, 2rem)';
    return (
        <div className="shining-border-wrapper flex-shrink-0" style={{ height: 'auto', borderRadius: '15px' }}>
            <Card className="border-0 text-white w-100 frosted-glass-panel" style={{ borderRadius: '10px' }}>
                <Card.Body style={{ padding: 'clamp(0.3rem, 2vh, 1.2rem) 1rem' }}>
                    <div className="ls-category" style={{ fontSize }}>
                        <span className="ls-category-label">The List</span>
                        {category}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

// A countdown bar that starts full (a hook: returns the seconds left and the bar)
function useClockBar({ endTime }) {
    const timeLeft = useCountdown(endTime);
    const total = useRef(null);
    if (timeLeft !== null && (total.current === null || timeLeft > total.current)) total.current = timeLeft;
    const percent = total.current ? (timeLeft / total.current) * 100 : 100;
    const isLow = timeLeft !== null && timeLeft <= 10;

    return { timeLeft, bar: (
        <ProgressBar
            now={percent}
            variant={isLow ? 'danger' : 'light'}
            style={{ height: 'clamp(8px, 2vh, 18px)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}
        />
    ), isLow };
}

/** 🃏 Card reveal (TV): this round's card, before the category and the clock */
export function ListCardTV({ room }) {
    const timeLeft = useCountdown(room.endTime);
    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1150px' }}>
                <h2 className="fullscreen-gameplay-header mb-0">Round {room.currentRound} of {room.totalRounds}</h2>
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 0, gap: '3vh' }}>
                    <div className="ls-status-strip text-center">This round's card is...</div>
                    <RoundCard card={room.card} size="lg" pointsPerItem={room.pointsPerItem} />
                    <div className="ls-status-strip text-center">
                        The list is revealed in {timeLeft ?? ''}...
                    </div>
                </div>
            </div>
        </div>
    );
}

/** ✏️ Writing (TV): the category, the clock, and who's still writing (never what they wrote) */
export function ListWritingTV({ room }) {
    const { timeLeft, bar, isLow } = useClockBar({ endTime: room.endTime });
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected).sort((a, b) => a.joinOrder - b.joinOrder);
    const doneCount = players.filter((p) => p.hasSubmitted).length;
    const listSize = room.listSize || 5;

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1150px' }}>
                <h2 className="fullscreen-gameplay-header mb-0">Round {room.currentRound} of {room.totalRounds}</h2>

                <div className="flex-grow-1 d-flex flex-column justify-content-center" style={{ minHeight: 0, gap: '3vh' }}>
                    <div className="text-center ls-status-strip"><CardChip card={room.card} /></div>
                    <CategoryBanner category={room.category || ''} />
                    <div className="ls-status-strip text-center">
                        Write up to {listSize} answers on your phone. {room.card?.goal || "Don't match anyone"}!
                    </div>
                    <div className="ls-writers">
                        {players.map((p) => (
                            <div key={p.id} className={`ls-writer ${p.hasSubmitted ? 'done' : ''}`}>
                                <span>{p.hasSubmitted ? '✅' : '✏️'} {p.name}</span>
                                <span className="ls-writer-dots" aria-label={`${p.itemCount} of ${listSize} answers`}>
                                    {Array.from({ length: listSize }, (_, i) => (
                                        <span key={i} className={`ls-writer-dot ${i < p.itemCount ? 'filled' : ''}`} />
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0" style={{ paddingRight: '7rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1 px-1 ls-status-strip">
                        <span>{doneCount} of {players.length} done</span>
                        <span className={isLow ? 'text-danger' : ''}>{timeLeft ?? ''}s</span>
                    </div>
                    {bar}
                </div>
            </div>
        </div>
    );
}

/** 📋 Compare / voting / results (TV): everyone's lists, with matches crossed out */
export function ListBoardTV({ room }) {
    const phase = room.gameState;
    const { timeLeft, bar, isLow } = useClockBar({ endTime: room.endTime });

    const voters = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected && (room.voterSeats || []).includes(p.seat));
    const votedCount = voters.filter((p) => p.hasVoted).length;

    const board = room.board || [];
    const countOf = (statuses) => board.reduce((n, e) => n + e.items.filter((i) => statuses.includes(i.status)).length, 0);
    const crossed = countOf(['dup', 'matched', 'crowded']);
    const open = countOf(['open']);
    const scored = countOf(['scored']);
    const isForgottenFour = !room.card || room.card.id === 'forgotten_four';

    const heading = phase === 'compare'
        ? (isForgottenFour ? 'Crossing out the matches...' : 'Finding the matches...')
        : phase === 'voting' ? 'Vote on your phones!' : 'Round Results';

    let footer;
    if (phase === 'compare') {
        footer = (
            <div className="ls-status-strip">
                {isForgottenFour
                    ? `${crossed} crossed out · ${open} still standing`
                    : `${CARD_LOOKS[room.card.id]?.icon || ''} ${scored} matched · ${crossed} crossed out`}
            </div>
        );
    } else if (phase === 'voting') {
        footer = (
            <>
                <div className="d-flex justify-content-between align-items-center mb-1 px-1 ls-status-strip">
                    <span>🗳️ {votedCount} of {voters.length} voted · tap any answer that doesn't count</span>
                    <span className={isLow ? 'text-danger' : ''}>{timeLeft ?? ''}s</span>
                </div>
                {bar}
            </>
        );
    } else {
        const top = Math.max(0, ...board.map((e) => e.points || 0));
        const leaders = board.filter((e) => top > 0 && (e.points || 0) === top).map((e) => e.name);
        let line = 'Tough round. Nobody scored!';
        if (leaders.length === 1) line = `⭐ Best list: ${leaders[0]} with +${top}`;
        else if (leaders.length > 1) line = `⭐ Tied for best list: ${leaders.join(', ')} with +${top}`;
        footer = <div className="ls-status-strip">{line}</div>;
    }

    return (
        <div className="fullscreen-gameplay-container">
            <div className="d-flex flex-column h-100 px-3 pb-4 w-100" style={{ maxWidth: '1400px' }}>
                <h2 className="fullscreen-gameplay-header mb-0">
                    {heading}
                    <span className="tc-category">Round {room.currentRound} of {room.totalRounds} <CardChip card={room.card} /></span>
                </h2>

                <div className="flex-shrink-0" style={{ margin: '1vh 0' }}>
                    <CategoryBanner category={room.category || ''} size="small" />
                </div>

                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                    <ListBoard board={board} phase={phase} variant="tv" pointsPerItem={room.pointsPerItem} listSize={room.listSize} />
                </div>

                <div className="flex-shrink-0" style={{ marginTop: '1vh', paddingRight: '7rem' }}>
                    {footer}
                </div>
            </div>
        </div>
    );
}
