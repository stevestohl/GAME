import React from 'react';
import '../../styles/lists.css';

/**
 * 📋 Everyone's lists side by side, used by both List Cast (on the TV) and Listopia (on each phone).
 *
 * phase:
 *   'compare' -> the round card's rules play out one answer after another:
 *                crossed-out answers get a red line, scoring matches (One-on-One, Threefold) light up green
 *   'voting'  -> Forgotten Four: answers that survived glow; on a phone, other players' answers become vote buttons
 *   'results' -> ✓ counts / ✗ voted out or no match, with each player's points
 *
 * variant: 'tv' (big grid that fills the screen) or 'phone' (one column, scrolls)
 */
// Statuses that get a red line through them
const CROSSED = new Set(['dup', 'matched', 'crowded']);

export default function ListBoard({ board = [], phase, variant = 'phone', mySeat = null, ballot, onToggleVote, pointsPerItem = 100, listSize = 5 }) {
    const isTV = variant === 'tv';

    // Crossed-out answers draw their line (and matches light up) one after another, finishing within ~7 seconds
    const revealIds = [];
    board.forEach((entry) => entry.items.forEach((item) => {
        if (CROSSED.has(item.status) || item.status === 'scored') revealIds.push(item.id);
    }));
    const step = Math.min(0.35, 6 / Math.max(1, revealIds.length));
    const strikeDelay = (id) => `${(0.8 + revealIds.indexOf(id) * step).toFixed(2)}s`;

    // TV: more players = more columns and smaller text, so it all fits without scrolling
    const count = board.length;
    const columns = !isTV ? 1 : count <= 4 ? Math.max(count, 1) : count <= 6 ? 3 : count <= 8 ? 4 : count <= 10 ? 5 : 6;
    let tvFont = count <= 4 ? 'clamp(0.85rem, 3.6vh, 1.7rem)' : count <= 8 ? 'clamp(0.75rem, 2.9vh, 1.35rem)' : 'clamp(0.65rem, 2.3vh, 1.05rem)';
    // One-on-One lists are twice as long: smaller text so ten answers still fit
    if (isTV && listSize > 5) tvFont = count <= 4 ? 'clamp(0.7rem, 2.4vh, 1.2rem)' : 'clamp(0.6rem, 1.9vh, 0.95rem)';

    const renderItem = (entry, item) => {
        const isMine = entry.seat === mySeat;
        const crossed = CROSSED.has(item.status);
        const classes = ['ls-item'];
        let note = null;
        let mark = null;
        const names = (item.matchedWith || []).join(', ');

        if (crossed) {
            classes.push('crossed');
            if (phase === 'compare') classes.push('animate');
            if (item.status === 'dup') note = 'written twice';
            else if (item.status === 'crowded') note = `too many: ${names}`;
            else note = `= ${names}`;
        } else if (item.status === 'scored' && phase === 'results' && item.counts === false) {
            // A Threefold match the group voted out
            classes.push('voted-out');
            mark = <span className="ls-item-mark">✗</span>;
            note = `👎 ${item.noVotes} of ${item.voterCount}`;
        } else if (item.status === 'scored') {
            classes.push('scored');
            if (phase === 'compare') classes.push('animate');
            mark = phase === 'results' ? <span className="ls-item-mark">✓</span> : null;
            note = phase === 'results' ? `+${(item.points || 0) * pointsPerItem} · ${names}` : `= ${names}`;
        } else if (item.status === 'unmatched') {
            classes.push('unmatched');
            if (phase === 'results') mark = <span className="ls-item-mark">✗</span>;
            note = 'no match';
        } else if (phase === 'voting') {
            classes.push('open', 'voting');
        } else if (phase === 'results') {
            if (item.counts) {
                classes.push('counts');
                mark = <span className="ls-item-mark">✓</span>;
                note = `+${(item.points || 1) * pointsPerItem}`;
            } else {
                classes.push('voted-out');
                mark = <span className="ls-item-mark">✗</span>;
                note = `👎 ${item.noVotes} of ${item.voterCount}`;
            }
        }

        // 🗳️ Phone voting: answers up for a vote that aren't yours are buttons
        // (copies of the same Threefold match share one vote key, so they flip together)
        const canVoteOn = item.voteKey && !(item.voteSeats || []).includes(mySeat);
        if (phase === 'voting' && canVoteOn && onToggleVote && !isMine) {
            const isNo = ballot?.has(item.voteKey);
            return (
                <li key={item.id}>
                    <button
                        type="button"
                        className={`ls-vote-btn ${isNo ? 'no' : ''}`}
                        aria-pressed={isNo}
                        aria-label={`${item.text}: ${isNo ? "doesn't count" : 'counts'}. Tap to change.`}
                        onClick={() => onToggleVote(item.voteKey)}
                    >
                        <span className="ls-item-mark">{isNo ? '✗' : '✓'}</span>
                        <span className="ls-item-text">{item.text}</span>
                        <span className="ls-vote-state">{isNo ? "Doesn't count" : 'Counts'}</span>
                    </button>
                </li>
            );
        }

        return (
            <li key={item.id} className={classes.join(' ')} style={revealIds.includes(item.id) ? { '--strike-delay': strikeDelay(item.id) } : undefined}>
                {mark}
                <span className="ls-item-text">{item.text}</span>
                {note && <span className="ls-item-note">{note}</span>}
            </li>
        );
    };

    // On a phone, your own list comes first
    const ordered = isTV || mySeat === null
        ? board
        : [...board.filter((e) => e.seat === mySeat), ...board.filter((e) => e.seat !== mySeat)];

    return (
        <div
            className={`ls-board ${isTV ? 'tv' : 'phone'}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, fontSize: isTV ? tvFont : '1rem' }}
        >
            {ordered.map((entry) => {
                const isMine = entry.seat === mySeat;
                return (
                    <div key={entry.seat} className={`ls-card ${isMine && !isTV ? 'mine' : ''}`}>
                        <div className="ls-card-head">
                            <span className="ls-card-name">{isMine && !isTV ? `${entry.name} (you)` : entry.name}</span>
                            {phase === 'results' && (
                                <span className={`ls-card-points ${entry.points ? '' : 'zero'}`}>+{entry.points || 0}</span>
                            )}
                        </div>
                        {entry.items.length === 0 ? (
                            <div className="ls-empty">No answers</div>
                        ) : (
                            <ul className="ls-items">
                                {entry.items.map((item) => renderItem(entry, item))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
