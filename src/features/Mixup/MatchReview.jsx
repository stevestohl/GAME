import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { mixupSocket as socket } from '../../socket.js';

/**
 * ⚖️ Threefold's judge: after the writing, one player checks the computer's matches on their phone.
 * The answers come in groups (every answer in a group matches the others). The judge drags an answer onto
 * the one it matches ("policeman" onto "police": both score), or taps it and then taps where it goes, or puts
 * it on its own. There's no clock. The TV shows every change as it happens.
 */

/**
 * The server's rule (sockets/mixup_handler.js, canMove), so the phone can grey out where an answer can't go.
 * Groups can be any size and the judge's own answers count too; the one rule is that nobody is matched
 * with themselves (one answer per player in a group). groupId null = on its own.
 */
export function canMoveAnswer(review, itemId, groupId) {
    const item = review.items[itemId];
    const from = review.groups.find((g) => g.itemIds.includes(itemId));
    if (!item || !from) return false;
    if (groupId === null) return from.itemIds.length > 1;
    const to = review.groups.find((g) => g.id === groupId);
    if (!to || to === from) return false;
    const seats = to.itemIds.map((id) => review.items[id].seat);
    return !seats.includes(item.seat);
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

const LONG_PRESS_MS = 220;   // a finger holds still this long to pick an answer up (a quick swipe still scrolls)
const EDGE = 90;              // dragging this close to the top or bottom of the screen scrolls the list

// The drop zone under a point: a group's id, 'alone' (the "On its own" button), or null
const dropZoneAt = (x, y) => document.elementFromPoint(x, y)?.closest('[data-drop]')?.dataset.drop || null;

/**
 * ✋ Dragging an answer: a mouse drags straight away; a finger presses and holds first, so a quick swipe
 * still scrolls the list. onStart(id) when it's picked up, onDrop(id, zone) when it's let go.
 */
function useAnswerDrag({ onStart, onDrop }) {
    const [drag, setDrag] = useState(null);      // { id, x, y, zone } while dragging
    const press = useRef(null);
    const handlers = useRef({});
    handlers.current = { onStart, onDrop };
    const startRef = useRef(null);
    const noTapUntil = useRef(0);

    useEffect(() => {
        let frame = null;
        const show = () => {
            const p = press.current;
            if (p?.active) setDrag({ id: p.id, x: p.x, y: p.y, zone: dropZoneAt(p.x, p.y) });
        };
        const stop = () => {
            if (press.current?.timer) clearTimeout(press.current.timer);
            press.current = null;
            cancelAnimationFrame(frame);
        };
        // Near the top or bottom edge the list scrolls, so a group further away can be reached
        const autoScroll = () => {
            const p = press.current;
            if (!p?.active) return;
            const step = p.y < EDGE ? -12 : p.y > window.innerHeight - EDGE ? 12 : 0;
            if (step) {
                window.scrollBy(0, step);
                show();
            }
            frame = requestAnimationFrame(autoScroll);
        };
        const pickUp = () => {
            const p = press.current;
            if (!p || p.active) return;
            p.active = true;
            navigator.vibrate?.(15);
            handlers.current.onStart(p.id);
            show();
            frame = requestAnimationFrame(autoScroll);
        };
        startRef.current = (e, id) => {
            if (e.button !== 0 || press.current) return;
            const isTouch = e.pointerType !== 'mouse';
            press.current = { id, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, isTouch, active: false };
            if (isTouch) press.current.timer = setTimeout(pickUp, LONG_PRESS_MS);
        };

        const onMove = (e) => {
            const p = press.current;
            if (!p || e.pointerId !== p.pointerId) return;
            p.x = e.clientX;
            p.y = e.clientY;
            if (!p.active) {
                const moved = Math.hypot(p.x - p.x0, p.y - p.y0);
                if (p.isTouch) {
                    if (moved > 10) stop();      // the finger moved before the hold: it's a scroll
                    return;
                }
                if (moved < 6) return;
                pickUp();
            }
            show();
        };
        const onUp = (e) => {
            const p = press.current;
            if (!p || e.pointerId !== p.pointerId) return;
            stop();
            if (!p.active) return;               // a plain tap: the button's click handles it
            noTapUntil.current = Date.now() + 400;   // the click that follows a drag isn't a tap
            setDrag(null);
            handlers.current.onDrop(p.id, dropZoneAt(e.clientX, e.clientY));
        };
        const onCancel = (e) => {
            if (!press.current || e.pointerId !== press.current.pointerId) return;
            const wasActive = press.current.active;
            stop();
            if (wasActive) setDrag(null);
        };
        // While an answer is being dragged, the finger moving mustn't scroll the page
        const onTouchMove = (e) => { if (press.current?.active) e.preventDefault(); };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            stop();
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
            document.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return {
        drag,
        startDrag: (e, id) => startRef.current?.(e, id),
        isAfterDrag: () => Date.now() < noTapUntil.current,
    };
}

/**
 * 📱 The judge's phone: drag an answer onto the one it matches (or tap it, then tap the group), or put it
 * on its own. A bar pinned under the nav bar holds the buttons, so they never scroll away.
 */
export function JudgeReview({ roomCode, round, Frame }) {
    const review = round.review;
    const judgeSeat = round.judgeSeat;
    const [held, setHeld] = useState(null);
    const changed = new Set(review.changed || []);

    const send = (itemId, groupId) => {
        socket.emit('review_move', { roomCode, itemId, groupId });
        setHeld(null);
    };
    const { drag, startDrag, isAfterDrag } = useAnswerDrag({
        onStart: (id) => setHeld(id),
        onDrop: (id, zone) => {
            const home = review.groups.find((g) => g.itemIds.includes(id));
            if (zone === 'alone') return canMoveAnswer(review, id, null) ? send(id, null) : setHeld(null);
            if (zone && zone === home?.id) return;   // let go where it started: still picked up, ready for a tap
            return zone && canMoveAnswer(review, id, zone) ? send(id, zone) : setHeld(null);
        },
    });

    const canGoAnywhere = (id) => canMoveAnswer(review, id, null) || review.groups.some((g) => canMoveAnswer(review, id, g.id));
    const heldItem = held ? review.items[held] : null;
    let hint = 'Drag an answer onto the one it matches to join them (or tap it, then tap where it goes). Split ones that don\'t match.';
    if (drag) hint = `Let go of "${heldItem?.text}" on the answer it matches.`;
    else if (heldItem) hint = `Now tap the group "${heldItem.text}" matches, or put it on its own.`;

    return (
        <>
            <div className="tc-leader-bar mx-judge-bar">
                {heldItem ? (
                    <>
                        <span className="mx-judge-holding">✋ <strong>{heldItem.text}</strong></span>
                        <Button
                            variant="warning"
                            size="sm"
                            className={`fw-bold ${drag?.zone === 'alone' ? 'mx-drop-hover' : ''}`}
                            data-drop="alone"
                            disabled={!canMoveAnswer(review, held, null)}
                            onClick={() => !isAfterDrag() && send(held, null)}
                        >
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
            <Frame title="⚖️ Judge It!">
                <div className="mx-phone-topic"><span>The list</span>{round.topic}</div>
                <p className="small text-muted mb-2">{hint}</p>
                <div className="mx-review-board phone">
                    {review.groups.map((group) => {
                        const isHome = held && group.itemIds.includes(held);
                        const isTarget = held && !isHome;
                        const canDrop = isTarget && canMoveAnswer(review, held, group.id);
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
                                    const classes = `mx-review-answer ${changed.has(id) ? 'changed' : ''} ${isMine ? 'mine' : ''} ${held === id ? 'held' : ''} ${drag?.id === id ? 'dragging' : ''}`;
                                    // Inside a drop target the whole card is the button; elsewhere each answer is
                                    if (isTarget || !canGoAnywhere(id)) return <li key={id} className={classes}>{content}</li>;
                                    return (
                                        <li key={id}>
                                            <button
                                                type="button"
                                                className={`${classes} tap`}
                                                aria-pressed={held === id}
                                                aria-label={`${item.text}, ${isMine ? 'yours' : item.name}. ${held === id ? 'Tap to put it back.' : 'Drag it onto its match, or tap to move it.'}`}
                                                onPointerDown={(e) => startDrag(e, id)}
                                                onContextMenu={(e) => e.preventDefault()}
                                                onClick={() => !isAfterDrag() && setHeld(held === id ? null : id)}
                                            >
                                                {content}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                        const isHover = canDrop && drag?.zone === group.id;
                        const classes = `mx-review-group ${seatCount(review, group) > 1 ? 'matched' : ''} ${isTarget ? (canDrop ? 'target' : 'blocked') : ''} ${isHover ? 'hover' : ''}`;
                        if (!isTarget) {
                            return (
                                <div key={group.id} className={classes} data-drop={group.id}>
                                    <GroupHead review={review} group={group} pointsPerItem={round.pointsPerItem} />
                                    {answers}
                                </div>
                            );
                        }
                        const sameName = group.itemIds.some((id) => review.items[id].seat === heldItem.seat);
                        return (
                            <button
                                key={group.id}
                                type="button"
                                className={classes}
                                data-drop={group.id}
                                disabled={!canDrop}
                                aria-label={`${canDrop ? 'Drop it here' : "Can't drop it here"}: ${group.itemIds.map((id) => review.items[id].text).join(', ')}`}
                                onClick={() => !isAfterDrag() && send(held, group.id)}
                            >
                                <div className="mx-review-head">
                                    {isHover ? '🤝 Let go to join them'
                                        : canDrop ? '👇 Drop it here'
                                            : sameName ? `${heldItem.seat === judgeSeat ? 'You' : heldItem.name} already ${heldItem.seat === judgeSeat ? 'have' : 'has'} one here` : ''}
                                </div>
                                {answers}
                            </button>
                        );
                    })}
                </div>
                <p className="small text-muted mt-2 mb-0">Make as many matches as you need, as big as you need. Everyone in a match scores for each other. No rush: tap Looks good! when you're done.</p>
            </Frame>
            {drag && heldItem && <div className="mx-drag-ghost" style={{ left: drag.x, top: drag.y }}>✋ {heldItem.text}</div>}
        </>
    );
}

/** 📱 Everyone else's phone while the judge works: the groups their own answers are in, live */
export function ReviewWatch({ round, mySeat, Frame }) {
    const review = round.review;
    const mine = review.groups.filter((g) => g.itemIds.some((id) => review.items[id].seat === mySeat));
    return (
        <Frame title="Match It!">
            <div className="mx-phone-topic"><span>The list</span>{round.topic}</div>
            <div className="mx-phone-intro-icon">⚖️</div>
            <h5 className="fw-bold mb-1">{round.judgeName} is checking the matches</h5>
            <p className="small text-muted mb-3">Watch the TV! Think they got one wrong? Tell them!</p>
            {mine.length > 0 && <ReviewGroups review={review} groups={mine} pointsPerItem={round.pointsPerItem} mySeat={mySeat} />}
        </Frame>
    );
}
