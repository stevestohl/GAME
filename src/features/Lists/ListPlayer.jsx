import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert, Badge, Form, ListGroup, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { listsSocket as socket } from '../../socket';
import { useSetBackgroundTheme, listsTheme } from '../Menu/backgroundTheme.js';
import { playChime } from '../../chime.js';
import { useTimerMusic } from '../../timerMusic.js';
import useCountdown from './useCountdown.js';
import ListBoard from './ListBoard.jsx';
import { ListRulesList } from './ListRules.jsx';
import { RoundCard, CardChip, cardWritingTip } from './ListCards.jsx';
import '../../styles/lists.css';
import { getMyAvatar } from '../../avatars.jsx';

const blankList = (size) => Array.from({ length: size }, () => '');

/**
 * 📱 A player's phone in List Cast and Listopia.
 *   mode 'cast'   (List Cast): the TV shows the big picture; the phone is for writing and voting.
 *   mode 'phones' (Listopia):  there's no TV, so the phone shows everything, including everyone's lists.
 */
export default function ListPlayer({ roomCode, playerName, mode }) {
    const navigate = useNavigate();
    const isListopia = mode === 'phones';
    const gameName = isListopia ? 'Listopia' : 'List Cast';

    const [room, setRoom] = useState(null);
    const [error, setError] = useState('');
    const [myList, setMyList] = useState(blankList(5));
    const [ballot, setBallot] = useState(() => new Set());
    const [sentVotes, setSentVotes] = useState(false);
    const [sentList, setSentList] = useState(false);

    const inputRefs = useRef([]);
    const sendTimer = useRef(null);

    useSetBackgroundTheme(listsTheme(room?.expansion));

    // ---------- Connect & listen ----------
    useEffect(() => {
        // A saved ID lets this phone get its seat back after a refresh or a dropped connection
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }

        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoomUpdate = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleJoinError = (message) => {
            // "Need more players" just means the start button was early: stay in the room
            if (message && message.startsWith('You need')) return;
            setError(message);
        };
        const handleRoomClosed = ({ message }) => {
            navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });
        };
        const handleMyState = (state) => {
            if (Array.isArray(state.list) && state.list.length) {
                setMyList((prev) => prev.map((_, i) => state.list[i] || ''));
            }
            setSentList(!!state.hasSubmitted);
            setBallot(new Set(state.ballot || []));
            setSentVotes(!!state.hasVoted);
        };
        const handleRoundStarted = () => {
            setMyList((prev) => blankList(prev.length));
            setSentList(false);
            playChime();
        };

        socket.on('connect', joinMyRoom);
        socket.on('room_updated', handleRoomUpdate);
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleRoomClosed);
        socket.on('my_state', handleMyState);
        socket.on('round_started', handleRoundStarted);

        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            clearTimeout(sendTimer.current);
            socket.off('connect', joinMyRoom);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('joinError', handleJoinError);
            socket.off('room_closed', handleRoomClosed);
            socket.off('my_state', handleMyState);
            socket.off('round_started', handleRoundStarted);
        };
    }, [roomCode, playerName]);

    const me = room?.players?.[socket.id];
    const gameState = room?.gameState;
    const timeLeft = useCountdown(room?.endTime);

    // ⏳ Listopia has no TV, so the room leader's phone plays the tick-tock music while everyone writes
    // (one phone, so the room doesn't hear a dozen slightly-off clocks)
    useTimerMusic(isListopia && !!me?.isPlayerHost && gameState === 'writing', { endTime: room?.endTime, key: room?.currentRound });

    // The list is as long as the server says
    const listSize = room?.listSize || 5;
    useEffect(() => {
        setMyList((prev) => (prev.length === listSize ? prev : Array.from({ length: listSize }, (_, i) => prev[i] || '')));
    }, [listSize]);

    // New vote: fresh ballot (everything counts until you say otherwise)
    useEffect(() => {
        if (gameState === 'voting' && !me?.hasVoted) {
            setBallot(new Set());
            setSentVotes(false);
            playChime();
        }
    }, [gameState, room?.currentRound]);

    // ---------- Writing ----------
    // Send the list as it's typed (briefly batched), so the server has it even if time runs out
    const sendDraft = (items) => {
        clearTimeout(sendTimer.current);
        sendTimer.current = setTimeout(() => socket.emit('update_list', { roomCode, items }), 300);
    };

    const handleItemChange = (index, value) => {
        const next = myList.map((item, i) => (i === index ? value.slice(0, room?.maxItemLength || 40) : item));
        setMyList(next);
        sendDraft(next);
    };

    const handleItemKeyDown = (index, e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) nextInput.focus();
            else e.currentTarget.blur();
        }
    };

    // Last second: send whatever is typed right now
    useEffect(() => {
        if (gameState === 'writing' && timeLeft === 1 && !sentList) {
            clearTimeout(sendTimer.current);
            socket.emit('update_list', { roomCode, items: myList });
        }
    }, [timeLeft]);

    const handleSubmitList = () => {
        clearTimeout(sendTimer.current);
        setSentList(true);
        socket.emit('submit_list', { roomCode, items: myList });
    };

    // ---------- Voting ----------
    const handleToggleVote = (itemId) => {
        setBallot((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const handleSubmitVotes = () => {
        setSentVotes(true);
        socket.emit('submit_votes', { roomCode, ballot: [...ballot] });
    };

    // ---------- Layout helpers ----------
    const frame = (title, body) => (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">{title}</Card.Header>
                <Card.Body className="p-3">{body}</Card.Body>
            </Card>
        </div>
    );

    const roundTitle = room ? `Round ${room.currentRound} of ${room.totalRounds}` : gameName;

    const clock = (label) => (
        <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-muted text-uppercase small">{label}</span>
            {timeLeft !== null && (
                <span className={`fw-bold fs-5 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</span>
            )}
        </div>
    );

    const categoryBox = room?.category && (
        <div className="p-2 mb-3 rounded border bg-light">
            <div className="small text-muted text-uppercase fw-bold">The list</div>
            <div className="fw-bold fs-5 text-dark lh-sm">{room.category}</div>
        </div>
    );

    // ---------- Couldn't join ----------
    if (error) {
        return frame(gameName, (
            <>
                <Alert variant="warning" className="fw-bold">{error}</Alert>
                <Button variant="primary" className="w-100 fw-bold" onClick={() => navigate(`/join?room=${roomCode}`)}>
                    Back to Join
                </Button>
            </>
        ));
    }

    // ---------- Connecting ----------
    if (!room || !me) {
        return frame(gameName, (
            <div className="py-4">
                <Spinner animation="border" variant="primary" />
                <h5 className="mt-3 text-muted">Connecting to room {roomCode}...</h5>
            </div>
        ));
    }

    const players = Object.values(room.players).filter((p) => !p.isCaster);
    const connected = players.filter((p) => p.isConnected);
    const leader = room.players[room.hostId];
    const mySeat = me.seat;

    switch (gameState) {
        // ===================== LOBBY =====================
        case 'lobby': {
            const canStart = connected.length >= (room.minPlayers || 2);
            const startButton = me.isPlayerHost ? (
                <div className="p-3 border border-warning rounded bg-white shadow-sm">
                    <p className="fw-bold text-dark mb-3">👑 You are the Room Leader</p>
                    <Button
                        variant="success"
                        size="lg"
                        className="w-100 fw-bold py-3"
                        disabled={!canStart}
                        onClick={() => socket.emit('startGame', { roomCode })}
                    >
                        {canStart ? "Everyone's in!" : 'Waiting for more players...'}
                    </Button>
                </div>
            ) : (
                <div className="p-3 border border-dashed rounded bg-light text-muted">
                    Waiting for <strong>{leader?.name || 'the room leader'}</strong> to start the game...
                </div>
            );

            if (!isListopia) {
                return frame("You're In!", (
                    <>
                        <p className="text-muted mb-3">Look up at the TV.</p>
                        {startButton}
                    </>
                ));
            }

            // Listopia: no TV, so this phone shows the code for everyone else
            const joinUrl = `${window.location.origin}/join?room=${roomCode}`;
            return frame('Listopia Lobby', (
                <>
                    <div className="bg-light p-3 rounded mb-3 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase mb-1">Room Code</span>
                        <span className="fs-1 fw-bold text-dark d-block mb-2" style={{ letterSpacing: '0.2em' }}>{roomCode}</span>
                        <Card className="d-inline-block shadow-sm border-0 p-2 mb-1">
                            <QRCodeSVG value={joinUrl} size={130} level="H" />
                        </Card>
                        <div className="text-muted small fw-semibold">Friends scan to join</div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-start mb-0 fw-bold">Players</h6>
                        <Badge bg="secondary" className="rounded-pill px-3">{connected.length}</Badge>
                    </div>
                    <ListGroup className="mb-3 text-start shadow-sm">
                        {connected.map((p) => (
                            <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center py-2">
                                <span className="fw-bold">{p.name}{p.id === me.id ? ' (you)' : ''}</span>
                                {p.isPlayerHost && <Badge bg="primary" className="rounded-pill">Leader</Badge>}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {startButton}
                </>
            ));
        }

        // ===================== RULES =====================
        case 'rules':
            if (!isListopia) {
                return frame(gameName, (
                    <div className="py-3">
                        <h3 className="text-primary fw-bold mb-2">Get Ready!</h3>
                        <p className="text-muted mb-3">Keep your eyes on the TV to learn how to play.</p>
                        <Spinner animation="grow" variant="warning" />
                    </div>
                ));
            }
            return frame('How to Play', (
                <>
                    <div className="text-start text-secondary mb-3">
                        <ListRulesList pointsPerItem={room.pointsPerItem} listSize={room.listSize} />
                    </div>
                    {me.isPlayerHost ? (
                        <Button variant="success" size="lg" className="w-100 fw-bold py-3" onClick={() => socket.emit('startRounds', { roomCode })}>
                            Start Round 1!
                        </Button>
                    ) : (
                        <div className="p-3 border border-dashed rounded bg-light text-muted">
                            Waiting for <strong>{leader?.name || 'the room leader'}</strong> to start round 1...
                        </div>
                    )}
                </>
            ));

        // ===================== CARD REVEAL =====================
        case 'card':
            return frame(roundTitle, (
                <div className="py-2">
                    <p className="fw-bold text-muted text-uppercase small mb-2">This round's card</p>
                    <RoundCard card={room.card} size="md" pointsPerItem={room.pointsPerItem} />
                    <p className="text-muted mt-3 mb-0">
                        {timeLeft !== null ? `The list is revealed in ${timeLeft}...` : 'Get ready...'}
                    </p>
                </div>
            ));

        // ===================== WRITING =====================
        case 'writing': {
            if (me.hasSubmitted || sentList) {
                const done = connected.filter((p) => p.hasSubmitted).length;
                return frame(roundTitle, (
                    <div className="py-2">
                        <h1 className="display-4 mb-1">🔒</h1>
                        <h4 className="fw-bold mb-2">List Locked In!</h4>
                        <div className="mb-2"><CardChip card={room.card} /></div>
                        {categoryBox}
                        <ol className="text-start fw-semibold mb-3">
                            {myList.filter((item) => item.trim()).map((item, i) => <li key={i}>{item}</li>)}
                        </ol>
                        <p className="text-muted mb-0">{done} of {connected.length} done. Waiting for the others...</p>
                    </div>
                ));
            }

            const filled = myList.filter((item) => item.trim()).length;
            return frame(roundTitle, (
                <>
                    {clock(`Write up to ${listSize}:`)}
                    <div className="mb-2 text-start"><CardChip card={room.card} /></div>
                    {categoryBox}
                    <div className="d-flex flex-column gap-2 mb-3">
                        {myList.map((item, i) => (
                            <div key={i} className="ls-input-row">
                                <span className="ls-input-num">{i + 1}</span>
                                <Form.Control
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    value={item}
                                    placeholder={i === 0 ? 'Your first answer...' : ''}
                                    onChange={(e) => handleItemChange(i, e.target.value)}
                                    onKeyDown={(e) => handleItemKeyDown(i, e)}
                                    maxLength={room.maxItemLength || 40}
                                    enterKeyHint={i === myList.length - 1 ? 'done' : 'next'}
                                    autoComplete="off"
                                    autoCorrect="on"
                                    aria-label={`Answer ${i + 1}`}
                                    className="fw-semibold"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="small text-muted mb-2">Tip: {cardWritingTip(room.card)}</p>
                    <Button variant="primary" size="lg" className="w-100 fw-bold" disabled={filled === 0} onClick={handleSubmitList}>
                        {filled === 0 ? 'Write at least one answer' : `I'm done (${filled} of ${listSize})`}
                    </Button>
                </>
            ));
        }

        // ===================== COMPARE =====================
        case 'compare': {
            const myEntry = room.board?.find((e) => e.seat === mySeat);
            const myItems = myEntry ? myEntry.items : [];
            const crossedCount = myItems.filter((i) => ['dup', 'matched', 'crowded'].includes(i.status)).length;
            const scoredCount = myItems.filter((i) => i.status === 'scored').length;
            const isForgottenFour = !room.card || room.card.id === 'forgotten_four';

            let mySummary;
            if (isForgottenFour) {
                mySummary = crossedCount === 0 ? 'Nobody matched you. Nice!' : `${crossedCount} of yours got crossed out.`;
            } else if (scoredCount === 0) {
                mySummary = 'No matches for you this time.';
            } else {
                mySummary = `${scoredCount} of yours matched!`;
            }

            return frame(roundTitle, (
                <>
                    <h4 className="fw-bold mb-1">Pencils down! ✏️</h4>
                    <div className="mb-2"><CardChip card={room.card} /></div>
                    <p className="text-muted mb-3">
                        {isForgottenFour
                            ? (isListopia ? 'Answers that match get crossed out...' : 'Watch the TV as matching answers get crossed out!')
                            : (isListopia ? 'Finding the matches...' : 'Watch the TV to see who matched!')}
                    </p>
                    {isListopia ? (
                        <ListBoard board={room.board || []} phase="compare" variant="phone" mySeat={mySeat} pointsPerItem={room.pointsPerItem} />
                    ) : (
                        <>
                            <ListBoard board={myEntry ? [myEntry] : []} phase="compare" variant="phone" mySeat={mySeat} pointsPerItem={room.pointsPerItem} />
                            {myEntry && <p className="fw-bold mt-3 mb-0">{mySummary}</p>}
                        </>
                    )}
                </>
            ));
        }

        // ===================== VOTING =====================
        case 'voting': {
            const canVote = (room.voterSeats || []).includes(mySeat);
            const voters = connected.filter((p) => (room.voterSeats || []).includes(p.seat));
            const votedCount = voters.filter((p) => p.hasVoted).length;

            if (!canVote || me.hasVoted || sentVotes) {
                return frame(roundTitle, (
                    <div className="py-2">
                        <h1 className="display-4 mb-1">🗳️</h1>
                        <h4 className="fw-bold mb-2">{canVote ? 'Votes In!' : 'Voting...'}</h4>
                        <p className="text-muted mb-2">
                            {canVote ? '' : "You joined mid-round, so you'll vote next round. "}
                            {votedCount} of {voters.length} have voted.
                        </p>
                        <ProgressBar now={voters.length ? (votedCount / voters.length) * 100 : 0} className="mb-3" />
                        {isListopia && (
                            <ListBoard board={room.board || []} phase="voting" variant="phone" mySeat={mySeat} pointsPerItem={room.pointsPerItem} />
                        )}
                    </div>
                ));
            }

            // Only other players' answers that are up for a vote (and aren't a match of your own)
            const isThreefold = room.card?.id === 'threefold';
            const othersOpen = (room.board || []).filter((e) => e.seat !== mySeat
                && e.items.some((i) => i.voteKey && !(i.voteSeats || []).includes(mySeat)));
            const board = isListopia ? room.board || [] : othersOpen;
            return frame(roundTitle, (
                <>
                    {clock('Vote!')}
                    {categoryBox}
                    <p className="text-start small text-secondary mb-3">
                        {isThreefold ? (
                            <>These answers matched! Everything counts unless you tap it. Tap any match that
                            {' '}<strong>doesn't really fit the list</strong>.</>
                        ) : (
                            <>Everything counts unless you tap it. Tap any answer that <strong>doesn't fit the list</strong>
                            {' '}or is <strong>really the same as someone else's</strong>.</>
                        )}
                    </p>
                    {othersOpen.length === 0 ? (
                        <p className="fw-bold">Nothing of anyone else's to vote on this time.</p>
                    ) : (
                        <ListBoard
                            board={board}
                            phase="voting"
                            variant="phone"
                            mySeat={mySeat}
                            ballot={ballot}
                            onToggleVote={handleToggleVote}
                            pointsPerItem={room.pointsPerItem}
                        />
                    )}
                    <div className="position-sticky bottom-0 pt-3 pb-1" style={{ background: 'linear-gradient(transparent, #fff 30%)' }}>
                        <Button variant="success" size="lg" className="w-100 fw-bold" onClick={handleSubmitVotes}>
                            {ballot.size === 0 ? 'Everything counts. Submit!' : `Submit votes (${ballot.size} thrown out)`}
                        </Button>
                    </div>
                </>
            ));
        }

        // ===================== RESULTS =====================
        case 'results': {
            const myEntry = room.board?.find((e) => e.seat === mySeat);
            return frame(roundTitle, (
                <>
                    <h1 className="display-5 mb-1">{me.roundPoints > 0 ? '🎉' : '😬'}</h1>
                    <h4 className="fw-bold mb-1">
                        {me.roundPoints > 0 ? `+${me.roundPoints} points!` : 'No points this round'}
                    </h4>
                    {categoryBox}
                    <ListBoard
                        board={isListopia ? room.board || [] : myEntry ? [myEntry] : []}
                        phase="results"
                        variant="phone"
                        mySeat={mySeat}
                        pointsPerItem={room.pointsPerItem}
                    />
                </>
            ));
        }

        // ===================== SCOREBOARD =====================
        case 'scoreboard': {
            const ranked = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
            // Same score, same place
            const rankOf = (p) => 1 + ranked.filter((o) => (o.score || 0) > (p.score || 0)).length;
            const myRank = rankOf(me);
            const isTied = ranked.filter((o) => (o.score || 0) === (me.score || 0)).length > 1;
            const iWon = room.isGameOver && myRank === 1 && me.score > 0;
            const headline = iWon
                ? (isTied ? 'You tied for the win!' : 'You won!')
                : `You're ${isTied ? 'tied for ' : ''}#${myRank} of ${ranked.length}`;

            return frame(room.isGameOver ? 'Final Scores' : 'Scores', (
                <div className="py-2">
                    <h1 className="display-4 mb-1">{iWon ? '🏆' : '📊'}</h1>
                    <h4 className="fw-bold text-dark mb-1">{headline}</h4>
                    <Badge bg="primary" className="fs-5 rounded-pill px-3 py-2 mb-3">{me.score} pts</Badge>

                    {isListopia && (
                        <ListGroup className="mb-3 text-start shadow-sm">
                            {ranked.map((p) => (
                                <ListGroup.Item key={p.id} className={`d-flex justify-content-between align-items-center py-2 ${p.id === me.id ? 'fw-bold bg-light' : ''}`}>
                                    <span>
                                        <span className="text-muted me-2">#{rankOf(p)}</span>
                                        {rankOf(p) === 1 && p.score > 0 ? '👑 ' : ''}{p.name}
                                    </span>
                                    <Badge bg={rankOf(p) === 1 ? 'primary' : 'secondary'} className="rounded-pill">{p.score} pts</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}

                    {room.isGameOver ? (
                        <Button variant="primary" className="w-100 fw-bold" onClick={() => navigate(isListopia ? '/temple' : '/home')}>
                            Back to Home
                        </Button>
                    ) : (
                        <p className="text-muted mb-0">Next list coming up...</p>
                    )}
                </div>
            ));
        }

        default:
            return frame(gameName, <Spinner animation="grow" variant="warning" />);
    }
}
