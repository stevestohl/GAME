import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { mixupSocket as socket } from '../../socket.js';

/**
 * ⚖️ Threefold's judge: after the writing, one player checks the computer's matches on their phone.
 * The answers come in groups (every answer in a group matches the others). The judge picks an answer up
 * and drops it into the group it belongs in, or puts it on its own. The TV shows every change as it happens.
 */

/**
 * The server's rule (sockets/mixup_handler.js, canMove), so the phone can grey out where an answer can't go:
 * nobody matches themselves, and the judge can't add to their own matches. groupId null = on its own.
 */
export function canMoveAnswer(review, judgeSeat, itemId, groupId) {
    const item = review.items[itemId];
    const from = review.groups.find((g) => g.itemIds.includes(itemId));
    if (!item || !from) return false;
    if (groupId === null) return from.itemIds.length > 1;
    const to = review.groups.find((g) => g.id === groupId);
    if (!to || to === from) return false;
    const seats = to.itemIds.map((id) => review.items[id].seat);
    if (seats.includes(item.seat)) return false;
    return item.seat !== judgeSeat && !seats.includes(judgeSeat);
}

const seatCount = (review, group) => new Set(group.itemIds.map((id) => review.items[id].seat)).size;

// "🤝 3 match · +100 each" / "No match"
function GroupHead({ review, group, pointsPerItem }) {
    const players = seatCount(review, group);
    if (players < 2) return <div className="mx-review-head">No match</div>;
    return <div className="mx-review-head">🤝 {players} match · +{(players - 1) * pointsPerItem} each</div>;
}

/** The groups as cards: read-only on the TV and the other phones */
export function ReviewGroups({ review, groups = review.groups, pointsPerItem, variant = 'phone', mySeat = null }) {
    const changed = new Set(review.changed || []);
    const isTV = variant === 'tv';
    const count = groups.length;
    const columns = !isTV ? 1 : count <= 4 ? Math.max(count, 1) : count <= 9 ? 3 : count <= 16 ? 4 : count <= 20 ? 5 : 6;
    const fontSize = !isTV ? '1rem' : count <= 6 ? 'clamp(0.85rem, 3.4vh, 1.6rem)' : count <= 12 ? 'clamp(0.75rem, 2.7vh, 1.3rem)' : 'clamp(0.65rem, 2.1vh, 1rem)';
    return (
        <div className={`mx-review-board ${variant}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, fontSize }}>
            {groups.map((group) => (
                <div key={group.id} className={`mx-review-group ${seatCount(review, group) > 1 ? 'matched' : ''}`}>
                    <GroupHead review={review} group={group} pointsPerItem={pointsPerItem} />
                    <ul className="mx-review-answers">
                        {group.itemIds.map((id) => {
                            const item = review.items[id];
                            return (
                                <li key={id} className={`mx-review-answer ${changed.has(id) ? 'changed' : ''} ${item.seat === mySeat ? 'mine' : ''}`}>
                                    <span className="mx-review-text">{changed.has(id) && '⚖️ '}{item.text}</span>
                                    <span className="mx-review-name">{item.seat === mySeat ? 'you' : item.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

/**
 * 📱 The judge's phone: tap an answer to pick it up, then tap the group it matches (or "On its own").
 * A bar pinned under the nav bar holds the buttons, so they never scroll away.
 */
export function JudgeReview({ roomCode, round, clock, Frame }) {
    const review = round.review;
    const judgeSeat = round.judgeSeat;
    const [held, setHeld] = useState(null);
    const changed = new Set(review.changed || []);

    const canGoAnywhere = (id) => canMoveAnswer(review, judgeSeat, id, null) || review.groups.some((g) => canMoveAnswer(review, judgeSeat, id, g.id));
    const move = (groupId) => {
        socket.emit('review_move', { roomCode, itemId: held, groupId });
        setHeld(null);
    };
    const heldItem = held ? review.items[held] : null;

    return (
        <>
            <div className="tc-leader-bar mx-judge-bar">
                {heldItem ? (
                    <>
                        <span className="mx-judge-holding">✋ <strong>{heldItem.text}</strong></span>
                        <Button variant="warning" size="sm" className="fw-bold" disabled={!canMoveAnswer(review, judgeSeat, held, null)} onClick={() => move(null)}>
                            ✂️ On its own
                        </Button>
                        <Button variant="outline-secondary" size="sm" className="fw-bold" onClick={() => setHeld(null)}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline-secondary" size="sm" className="fw-bold" disabled={!changed.size} onClick={() => socket.emit('review_reset', { roomCode })}>
                            ↺ Start over
                        </Button>
                        <Button variant="success" className="fw-bold flex-grow-1" onClick={() => socket.emit('review_done', { roomCode })}>
                            ✅ Looks good!
                        </Button>
                    </>
                )}
            </div>
            <Frame title="⚖️ Judge It!" right={clock}>
                <div className="mx-phone-topic"><span>The list</span>{round.topic}</div>
                <p className="small text-muted mb-2">
                    {heldItem
                        ? `Now tap the group "${heldItem.text}" matches, or put it on its own.`
                        : 'Tap an answer to move it: join answers that mean the same thing, split ones that don\'t.'}
                </p>
                <div className="mx-review-board phone">
                    {review.groups.map((group) => {
                        const isHome = held && group.itemIds.includes(held);
                        const isTarget = held && !isHome;
                        const canDrop = isTarget && canMoveAnswer(review, judgeSeat, held, group.id);
                        const answers = (
                            <ul className="mx-review-answers">
                                {group.itemIds.map((id) => {
                                    const item = review.items[id];
                                    const isMine = item.seat === judgeSeat;
                                    const content = (
                                        <>
                                            <span className="mx-review-text">{changed.has(id) && '⚖️ '}{item.text}</span>
                                            <span className="mx-review-name">{isMine ? 'you' : item.name}</span>
                                        </>
                                    );
                                    const classes = `mx-review-answer ${changed.has(id) ? 'changed' : ''} ${isMine ? 'mine' : ''} ${held === id ? 'held' : ''}`;
                                    // Inside a drop target the whole card is the button; elsewhere each answer is
                                    if (isTarget || !canGoAnywhere(id)) return <li key={id} className={classes}>{content}</li>;
                                    return (
                                        <li key={id}>
                                            <button
                                                type="button"
                                                className={`${classes} tap`}
                                                aria-pressed={held === id}
                                                aria-label={`${item.text}, ${isMine ? 'yours' : item.name}. ${held === id ? 'Tap to put it back.' : 'Tap to move it.'}`}
                                                onClick={() => setHeld(held === id ? null : id)}
                                            >
                                                {content}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                        const classes = `mx-review-group ${seatCount(review, group) > 1 ? 'matched' : ''} ${isTarget ? (canDrop ? 'target' : 'blocked') : ''}`;
                        if (!isTarget) {
                            return (
                                <div key={group.id} className={classes}>
                                    <GroupHead review={review} group={group} pointsPerItem={round.pointsPerItem} />
                                    {answers}
                                </div>
                            );
                        }
                        const ownMatch = heldItem.seat === judgeSeat || group.itemIds.some((id) => review.items[id].seat === judgeSeat);
                        const sameName = group.itemIds.some((id) => review.items[id].seat === heldItem.seat);
                        return (
                            <button
                                key={group.id}
                                type="button"
                                className={classes}
                                disabled={!canDrop}
                                aria-label={`${canDrop ? 'Drop it here' : "Can't drop it here"}: ${group.itemIds.map((id) => review.items[id].text).join(', ')}`}
                                onClick={() => move(group.id)}
                            >
                                <div className="mx-review-head">
                                    {canDrop ? '👇 Drop it here'
                                        : sameName ? `${heldItem.seat === judgeSeat ? 'You' : heldItem.name} already ${heldItem.seat === judgeSeat ? 'have' : 'has'} one here`
                                            : ownMatch ? '🔒 Not your own match' : ''}
                                </div>
                                {answers}
                            </button>
                        );
                    })}
                </div>
                <p className="small text-muted mt-2 mb-0">🔒 You can split your own matches, but not add to them.</p>
            </Frame>
        </>
    );
}

/** 📱 Everyone else's phone while the judge works: the groups their own answers are in, live */
export function ReviewWatch({ round, mySeat, clock, Frame }) {
    const review = round.review;
    const mine = review.groups.filter((g) => g.itemIds.some((id) => review.items[id].seat === mySeat));
    return (
        <Frame title="Match It!" right={clock}>
            <div className="mx-phone-topic"><span>The list</span>{round.topic}</div>
            <div className="mx-phone-intro-icon">⚖️</div>
            <h5 className="fw-bold mb-1">{round.judgeName} is checking the matches</h5>
            <p className="small text-muted mb-3">Watch the TV! Think they got one wrong? Tell them!</p>
            {mine.length > 0 && <ReviewGroups review={review} groups={mine} pointsPerItem={round.pointsPerItem} mySeat={mySeat} />}
        </Frame>
    );
}
