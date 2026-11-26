import { useGameVisibility } from '../../gameVisibility.js';
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TriviaCastTile from './TriviaCastTile.jsx';
import { handleCreateTriviaCast } from './TriviaCastCreate.js';
import { handleCreateTriviaRoom } from '../Trivia/triviaCreate.js';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { TRIVIA_DECKS, QUESTION_OPTIONS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import LevelPicker, { DEFAULT_LEVEL } from '../Menu/LevelPicker.jsx';
import RoundsPicker from '../Menu/RoundsPicker.jsx';
import { usePlayMode, PlayModeSwitch, playModeHint, useHostName, HostNameField, SetupDivider } from '../Menu/PlayMode.jsx';

/**
 * 📺❔ Trivia Cast setup.
 * Sits between the home page button and the game: says what Trivia Cast is, whether it's on a TV or just
 * phones (just phones starts Trivia, the same quiz run on the phones), then how many questions, the level
 * and a deck to start.
 */
export default function TriviaCastDeckSelect() {
    const { visibleDecks, canSeeGame, isGameHidden } = useGameVisibility();
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(QUESTION_OPTIONS[0]);
    const [level, setLevel] = useState(DEFAULT_LEVEL);
    const { mode, choose, canChoose } = usePlayMode({ tv: canSeeGame('triviacast'), phones: canSeeGame('trivia') });
    const host = useHostName();
    const onPhones = mode === 'phones';

    // Global Scroll Unlock Safety Net (same as Home)
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Start downloading the lobby music now, so it plays the moment a deck is tapped
    useEffect(() => {
        preloadLobbyMusic('triviaCast');
        preloadLobbyMusic('halloween');
    }, []);

    const start = (deckId) => (onPhones
        ? handleCreateTriviaRoom(host.finalName(), navigate, setIsCreatingRoom, deckId, totalRounds, level)
        : handleCreateTriviaCast(navigate, setIsCreatingRoom, deckId, totalRounds, level));

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    Trivia Cast
                </Card.Header>

                <Card.Body className='p-2'>
                    {/* Game icon + description */}
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <TriviaCastTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Trivia Cast
                                        <span className="text-muted fw-normal small ms-2">2+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        {onPhones
                                            ? 'Trivia night, no TV needed. Everyone answers the same questions on their own phone, and the best scores rise to the top.'
                                            : 'Trivia night on the big screen. Questions show on the TV and everyone answers on their phone. Cast one extra device to the TV as the main screen.'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {canChoose && (
                        <>
                            <SetupDivider className="my-2">Where Are You Playing?</SetupDivider>
                            <PlayModeSwitch mode={mode} onChange={choose} disabled={isCreatingRoom} hidden={{ tv: isGameHidden('triviacast'), phones: isGameHidden('trivia') }} />
                            <p className="small text-muted text-center mt-1 mb-0">{playModeHint(mode)}</p>
                        </>
                    )}

                    {onPhones && (
                        <>
                            <SetupDivider>Your Nickname</SetupDivider>
                            <HostNameField name={host.name} setName={host.setName} disabled={isCreatingRoom} />
                        </>
                    )}

                    <SetupDivider className={canChoose || onPhones ? 'mt-3 mb-2' : 'my-2'}>How Many Questions?</SetupDivider>
                    <RoundsPicker
                        label="Questions"
                        options={QUESTION_OPTIONS}
                        value={totalRounds}
                        onChange={setTotalRounds}
                        disabled={isCreatingRoom}
                    />

                    <SetupDivider>What Level?</SetupDivider>
                    <LevelPicker value={level} onChange={setLevel} disabled={isCreatingRoom} />

                    <SetupDivider>Then Tap a Deck to Start</SetupDivider>

                    {/* 🃏 Question decks (expansions): each version has its own deck switches in /admin */}
                    <Row className="g-2">
                        {visibleDecks(onPhones ? 'trivia' : 'triviacast', TRIVIA_DECKS).map((deck, i) => (
                            <Col xs={4} key={deck.id}>
                                <DeckCard
                                    compact
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => start(deck.id)}
                                    ariaLabel={`Start a Trivia game ${onPhones ? 'on just phones' : 'on the TV'} with the ${deck.title} questions`}
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
