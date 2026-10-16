import React from 'react';
import '../../styles/lists.css';

/**
 * 📋 Everyone's lists side by side, used by both List Cast (on the TV) and Listopia (on each phone).
 *
 * phase:
 *   'compare' -> matching answers get crossed out, one after another
 *   'voting'  -> answers that survived glow; on a phone, other players' answers become vote buttons
 *   'results' -> ✓ counts / ✗ voted out, with each player's points
 *
 * variant: 'tv' (big grid that fills the screen) or 'phone' (one column, scrolls)
 */
export default function ListBoard({ board = [], phase, variant = 'phone', mySeat = null, ballot, onToggleVote, pointsPerItem = 100 }) {
    const isTV = variant === 'tv';

    // Crossed-out answers draw their line one after another (finishing within ~7 seconds)
    const crossedIds = [];
    board.forEach((entry) => entry.items.forEach((item) => {
        if (item.status !== 'open') crossedIds.push(item.id);
    }));
    const step = Math.min(0.35, 6 / Math.max(1, crossedIds.length));
    const strikeDelay = (id) => `${(0.8 + crossedIds.indexOf(id) * step).toFixed(2)}s`;

    // TV: more players = more columns and smaller text, so it all fits without scrolling
    const count = board.length;
    const columns = !isTV ? 1 : count <= 4 ? Math.max(count, 1) : count <= 6 ? 3 : count <= 8 ? 4 : count <= 10 ? 5 : 6;
    const tvFont = count <= 4 ? 'clamp(0.85rem, 3.6vh, 1.7rem)' : count <= 8 ? 'clamp(0.75rem, 2.9vh, 1.35rem)' : 'clamp(0.65rem, 2.3vh, 1.05rem)';

    const renderItem = (entry, item) => {
        const isMine = entry.seat === mySeat;
        const crossed = item.status !== 'open';
        const classes = ['ls-item'];
        let note = null;
        let mark = null;

        if (crossed) {
            classes.push('crossed');
            if (phase === 'compare') classes.push('animate');
            note = item.status === 'dup' ? 'written twice' : `= ${item.matchedWith.join(', ')}`;
        } else if (phase === 'voting') {
            classes.push('open', 'voting');
        } else if (phase === 'results') {
            if (item.counts) {
                classes.push('counts');
                mark = <span className="ls-item-mark">✓</span>;
                note = `+${pointsPerItem}`;
            } else {
                classes.push('voted-out');
                mark = <span className="ls-item-mark">✗</span>;
                note = `👎 ${item.noVotes} of ${item.voterCount}`;
            }
        }

        // 🗳️ Phone voting: other players' surviving answers are buttons
        if (phase === 'voting' && !crossed && onToggleVote && !isMine) {
            const isNo = ballot?.has(item.id);
            return (
                <li key={item.id}>
                    <button
                        type="button"
                        className={`ls-vote-btn ${isNo ? 'no' : ''}`}
                        aria-pressed={isNo}
                        aria-label={`${item.text}: ${isNo ? "doesn't count" : 'counts'}. Tap to change.`}
                        onClick={() => onToggleVote(item.id)}
                    >
                        <span className="ls-item-mark">{isNo ? '✗' : '✓'}</span>
                        <span className="ls-item-text">{item.text}</span>
                        <span className="ls-vote-state">{isNo ? "Doesn't count" : 'Counts'}</span>
                    </button>
                </li>
            );
        }

        return (
            <li key={item.id} className={classes.join(' ')} style={crossed ? { '--strike-delay': strikeDelay(item.id) } : undefined}>
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
