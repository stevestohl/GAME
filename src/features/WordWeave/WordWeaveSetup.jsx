import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGameVisibility } from '../../gameVisibility.js';
import WordWeaveTile from './WordWeaveTile.jsx';
import { createWordWeaveRoom } from './wordWeaveCreate.js';
import PickerPill, { numberOptions } from '../Menu/PickerPill.jsx';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import { usePlayMode, PlayModeSwitch, playModeHint, useHostName, HostNameField, SetupDivider } from '../Menu/PlayMode.jsx';
import { ROUND_OPTIONS, DEFAULT_ROUNDS, SIZE_OPTIONS, SECONDS_OPTIONS, DEFAULT_SECONDS, secondsLabel } from './wordWeaveShared.js';

const TIME_OPTIONS = SECONDS_OPTIONS.map((s) => ({ value: s, label: secondsLabel(s) }));

/**
 * 🧶 Word Weave setup: what the game is, on a TV or just phones (two switches in /admin: wordweave and
 * wordweavephones), the grid size, the clock and how many rounds, then start.
 */
export default function WordWeaveSetup() {
    const navigate = useNavigate();
    const { canSeeGame, isGameHidden } = useGameVisibility();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [size, setSize] = useState(4);
    const [roundSeconds, setRoundSeconds] = useState(DEFAULT_SECONDS[4]);
    const [timeTouched, setTimeTouched] = useState(false);
    const [totalRounds, setTotalRounds] = useState(DEFAULT_ROUNDS);
    const { mode, choose, canChoose } = usePlayMode({ tv: canSeeGame('wordweave'), phones: canSeeGame('wordweavephones') });
    const host = useHostName();
    const onPhones = mode === 'phones';
    useSetBackgroundTheme('wordweave');

    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);
    useEffect(() => { preloadLobbyMusic('default'); }, []);

    // A bigger grid gets a longer clock, unless the clock's been picked
    const pickSize = (next) => {
        setSize(next);
        if (!timeTouched) setRoundSeconds(DEFAULT_SECONDS[next]);
    };
    const pickTime = (next) => {
        setRoundSeconds(next);
        setTimeTouched(true);
    };

    const minutes = Math.max(1, Math.round((totalRounds * (roundSeconds + 50)) / 60));
    const start = () => createWordWeaveRoom(navigate, setIsCreatingRoom, onPhones
        ? { mode: 'phones', size, roundSeconds, totalRounds, playerName: host.finalName() }
        : { mode: 'tv', size, roundSeconds, totalRounds });

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">Word Weave</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <WordWeaveTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Word Weave
                                        <span className="text-muted fw-normal small ms-2">2+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Race the clock to find words in a grid of letters: slide through letters that touch, diagonals too.
                                        Words someone else also found get crossed out, and longer words score more.
                                        {onPhones ? ' No TV needed: everyone plays on their own phone.' : ' Cast one extra device to the TV to show the grid.'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {canChoose && (
                        <>
                            <SetupDivider className="my-2">Where Are You Playing?</SetupDivider>
                            <PlayModeSwitch mode={mode} onChange={choose} disabled={isCreatingRoom} hidden={{ tv: isGameHidden('wordweave'), phones: isGameHidden('wordweavephones') }} />
                            <p className="small text-muted text-center mt-1 mb-0">{playModeHint(mode)}</p>
                        </>
                    )}

                    {onPhones && (
                        <>
                            <SetupDivider>Your Nickname</SetupDivider>
                            <HostNameField name={host.name} setName={host.setName} disabled={isCreatingRoom} />
                        </>
                    )}

                    <SetupDivider className={canChoose || onPhones ? 'mt-3 mb-2' : 'my-2'}>Grid and Clock</SetupDivider>
                    <div className="gt-picker-row">
                        <PickerPill label="Grid" value={size} options={SIZE_OPTIONS} onChange={pickSize} disabled={isCreatingRoom} />
                        <PickerPill label="Each Round" value={roundSeconds} options={TIME_OPTIONS} onChange={pickTime} disabled={isCreatingRoom} />
                    </div>

                    <SetupDivider>How Many Rounds?</SetupDivider>
                    <div className="gt-picker-row is-single">
                        <PickerPill label="Rounds" value={totalRounds} options={numberOptions(ROUND_OPTIONS)} onChange={setTotalRounds} disabled={isCreatingRoom} />
                    </div>
                    <p className="small text-muted text-center mt-2 mb-3">
                        About {minutes} {minutes === 1 ? 'minute' : 'minutes'}: a new grid every round.
                    </p>

                    <Button variant="primary" size="lg" className="w-100 fw-bold" disabled={isCreatingRoom} onClick={start}>
                        Start Word Weave
                    </Button>

                    <Button variant="outline-secondary" className="w-100 fw-bold mt-3" disabled={isCreatingRoom} onClick={() => navigate('/home')}>
                        Back
                    </Button>
                </Card.Body>
            </Card>

            <Modal show={isCreatingRoom} backdrop="static" keyboard={false} centered>
                <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4 className="fw-bold text-dark">Creating Room...</h4>
                    <p className="text-muted small mb-0">Waking up game server...</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}
