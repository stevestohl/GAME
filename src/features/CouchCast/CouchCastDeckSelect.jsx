import { useGameVisibility } from '../../gameVisibility.js';
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import couchCastImg from '../../assets/logos/Couch_Cast_Button.jpg';
import { handleCreateCouchCast } from './CouchCastCreate.jsx';
import { handleCreatePrompt2Room } from '../Prompt2/prompt2Create.js';
import { preloadLobbyMusic } from './lobbyMusic.js';
import { CARD_DECKS, ROUND_OPTIONS, DEFAULT_ROUNDS } from '../../cardDecks.js';
import PickerPill, { numberOptions } from '../Menu/PickerPill.jsx';
import DeckCard from '../Menu/DeckCard.jsx';
import { usePlayMode, PlayModeSwitch, playModeHint, useHostName, HostNameField, SetupDivider } from '../Menu/PlayMode.jsx';

/**
 * 🛋️ Couch Cast setup.
 * Sits between the home page button and the game: shows what Couch Cast is, whether it's on a TV or just
 * phones (just phones starts its phone version, the game with id prompt2), then the rounds and a deck to start.
 */
export default function CouchCastDeckSelect() {
    const { visibleDecks, canSeeGame, isGameHidden } = useGameVisibility();
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(DEFAULT_ROUNDS);
    const { mode, choose, canChoose } = usePlayMode({ tv: canSeeGame('couchcast'), phones: canSeeGame('prompt2') });
    const host = useHostName();
    const onPhones = mode === 'phones';

    // Global Scroll Unlock Safety Net (same as Home)
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Start downloading the Halloween and Holiday lobby songs now, so they play the moment that deck is tapped
    // (the core deck's song is made in the browser: nothing to download)
    useEffect(() => {
        preloadLobbyMusic('halloween');
        preloadLobbyMusic('holiday');
    }, []);

    const start = (deckId) => (onPhones
        ? handleCreatePrompt2Room(host.finalName(), navigate, setIsCreatingRoom, deckId, totalRounds)
        : handleCreateCouchCast(null, navigate, setIsCreatingRoom, deckId, totalRounds));

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    Couch Cast
                </Card.Header>

                <Card.Body className='p-2'>
                    {/* Game icon + description */}
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <img
                                        src={couchCastImg}
                                        alt="Couch Cast"
                                        className="w-100 rounded shadow-sm"
                                        style={{ aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                                    />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Couch Cast
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        An Apples to Apples–style party game. A rotating judge reads a prompt and everyone secretly plays their best card from their phone.
                                        {onPhones ? ' No TV needed: the whole game runs on your phones.' : ' Cast one extra device to the TV as the main screen.'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {canChoose && (
                        <>
                            <SetupDivider className="my-2">Where Are You Playing?</SetupDivider>
                            <PlayModeSwitch mode={mode} onChange={choose} disabled={isCreatingRoom} hidden={{ tv: isGameHidden('couchcast'), phones: isGameHidden('prompt2') }} />
                            <p className="small text-muted text-center mt-1 mb-0">{playModeHint(mode)}</p>
                        </>
                    )}

                    {onPhones && (
                        <>
                            <SetupDivider>Your Nickname</SetupDivider>
                            <HostNameField name={host.name} setName={host.setName} disabled={isCreatingRoom} />
                        </>
                    )}

                    <SetupDivider className={canChoose || onPhones ? 'mt-3 mb-2' : 'my-2'}>How Many Rounds?</SetupDivider>
                    <div className="gt-picker-row is-single">
                        <PickerPill label="Rounds" value={totalRounds} options={numberOptions(ROUND_OPTIONS)} onChange={setTotalRounds} disabled={isCreatingRoom} />
                    </div>

                    <SetupDivider>Then Tap a Deck to Start</SetupDivider>

                    {/* 🃏 Card decks (expansions): each version has its own deck switches in /admin */}
                    <Row className="g-2">
                        {visibleDecks(onPhones ? 'prompt2' : 'couchcast', CARD_DECKS).map((deck, i) => (
                            <Col xs={6} key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => start(deck.id)}
                                    ariaLabel={`Start a Couch Cast game ${onPhones ? 'on just phones' : 'on the TV'} with the ${deck.title} deck`}
                                />
                            </Col>
                        ))}
                    </Row>

                    <Button
                        variant="outline-secondary"
                        className="w-100 fw-bold mt-3"
                        disabled={isCreatingRoom}
                        onClick={() => navigate('/home')}
                    >
                        Back
                    </Button>
                </Card.Body>
            </Card>

            <Modal show={isCreatingRoom} backdrop="static" keyboard={false} centered>
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4'>
                    <Spinner animation='border' variant="primary" className='mb-3' />
                    <h4 className='fw-bold text-dark'>Creating Room...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up game server...
                    </p>
                </Modal.Body>
            </Modal>
        </div>
    );
}
