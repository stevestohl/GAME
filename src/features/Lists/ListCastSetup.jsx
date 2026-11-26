import { useGameVisibility } from '../../gameVisibility.js';
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ListCastTile } from './ListTiles.jsx';
import { createListRoom } from './listsCreate.js';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { LIST_DECKS, LIST_ROUND_OPTIONS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import RoundsPicker from '../Menu/RoundsPicker.jsx';
import { usePlayMode, PlayModeSwitch, playModeHint, useHostName, HostNameField, SetupDivider } from '../Menu/PlayMode.jsx';

/**
 * 📺📝 List Cast setup.
 * Sits between the home page button and the game: says what List Cast is, whether it's on a TV or just
 * phones (just phones starts its phone version, the game with id listopia), then the rounds and a deck to start.
 */
export default function ListCastSetup() {
    const { visibleDecks, canSeeGame, isGameHidden } = useGameVisibility();
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(LIST_ROUND_OPTIONS[0]);
    const { mode, choose, canChoose } = usePlayMode({ tv: canSeeGame('listcast'), phones: canSeeGame('listopia') });
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
        preloadLobbyMusic('listCast');
        preloadLobbyMusic('halloween');
    }, []);

    const start = (deckId) => createListRoom(navigate, setIsCreatingRoom, onPhones
        ? { mode: 'phones', expansion: deckId, totalRounds, playerName: host.finalName() }
        : { mode: 'cast', expansion: deckId, totalRounds });

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">List Cast</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <ListCastTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        List Cast
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        {onPhones
                                            ? 'Everyone writes a list on their phone. Matching answers get crossed out, then you vote on the rest, all on your phones. No TV needed.'
                                            : 'Everyone writes a list on their phone. Matching answers get crossed out on the TV, then you vote on the rest. Cast one extra device to the TV as the main screen.'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {canChoose && (
                        <>
                            <SetupDivider className="my-2">Where Are You Playing?</SetupDivider>
                            <PlayModeSwitch mode={mode} onChange={choose} disabled={isCreatingRoom} hidden={{ tv: isGameHidden('listcast'), phones: isGameHidden('listopia') }} />
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
                    <RoundsPicker
                        label="Rounds"
                        options={LIST_ROUND_OPTIONS}
                        value={totalRounds}
                        onChange={setTotalRounds}
                        disabled={isCreatingRoom}
                    />

                    <SetupDivider>Then Tap a Deck to Start</SetupDivider>

                    {/* 📝 List decks: each version has its own deck switches in /admin */}
                    <Row className="g-2">
                        {visibleDecks(onPhones ? 'listopia' : 'listcast', LIST_DECKS).map((deck, i) => (
                            <Col xs={6} key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => start(deck.id)}
                                    ariaLabel={`Start a List Cast game ${onPhones ? 'on just phones' : 'on the TV'} with the ${deck.title} lists`}
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
                <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4 className="fw-bold text-dark">Creating Room...</h4>
                    <p className="text-muted small mb-0">Waking up game server...</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}
