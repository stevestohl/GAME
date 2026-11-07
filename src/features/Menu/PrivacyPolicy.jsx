import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * 🔒 The privacy policy (game-temple.org/privacy), for the site and the iPhone app.
 * Keep it true to the code: what's saved is PromptAnswer, TriviaAnswer and ReshuffledPromptVote
 * (db/recordPromptRound.js, sockets/triviacast_handler.js), plus the browser's local storage keys.
 * Update the date when the wording changes.
 */
const CONTACT = 'stevestohl@yahoo.com';

export default function PrivacyPolicy() {
    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">PRIVACY</Card.Header>
                <Card.Body className="gt-privacy text-start">
                    <h1>Privacy Policy</h1>
                    <p className="gt-privacy-date">Last updated November 7, 2026</p>

                    <p>
                        Game Temple is a set of party games at game-temple.org and in the Game Temple iPhone app.
                        This page explains what the games use, what we keep, and your choices.
                    </p>
                    <p className="gt-privacy-short">
                        The short version: you don't need an account, there are no ads or tracking, and we never sell your information.
                    </p>

                    <h2>What you share when you play</h2>
                    <ul>
                        <li>A nickname (one you type, or one we make up for you) and an avatar.</li>
                        <li>
                            Your moves in a game: cards you play, answers you type, lists, captions, drawings, trivia answers and votes.
                            These go to the game server and are shown to the other players in your room, as the game needs.
                        </li>
                    </ul>

                    <h2>What we keep</h2>
                    <p>
                        In Couch Cast, Couch Cast Re-Shuffled, Prompt 2 and Trivia Cast, we save a record of each round: the room code,
                        your nickname, a random player ID, the card or answer you played (including answers you typed), how long you took,
                        and the points. When you're the judge, we also save which prompt you picked. We use these records only to make
                        the games better, for example to find the prompts and cards people enjoy and the questions that are too hard.
                    </p>
                    <p>
                        Everything else, like lists, drawings, meme captions and scores in other games, is kept only while your room is open.
                    </p>

                    <h2>On your device</h2>
                    <p>
                        The site saves a few things in your browser's storage so you can rejoin a game after a refresh: a random player ID,
                        your nickname, a game session code, and settings such as whether the music is muted. There are no advertising cookies.
                    </p>

                    <h2>What we don't do</h2>
                    <ul>
                        <li>No player accounts, no ads, and no analytics or tracking tools.</li>
                        <li>We don't sell or share your information for marketing.</li>
                        <li>We don't ask for your real name, email, contacts, location, camera or microphone.</li>
                    </ul>

                    <h2>Services we use</h2>
                    <ul>
                        <li>Render hosts the website and game server, and a hosted MongoDB database stores the round records.</li>
                        <li>Pictures in some games, like memes, load from Cloudinary or Imgflip.</li>
                    </ul>
                    <p>
                        Like any website, these services see your device's IP address and browser type when it connects,
                        and may keep standard logs for security and troubleshooting.
                    </p>

                    <h2>The iPhone app</h2>
                    <p>
                        The app shows game-temple.org, so everything above applies to it too. It doesn't collect anything more or track you.
                        When you connect a TV with AirPlay, the game shows on the TV; nothing about your TV is saved.
                    </p>

                    <h2>Children</h2>
                    <p>
                        Game Temple is for general audiences and isn't directed at children under 13. We don't knowingly collect personal
                        information from children. If you think a child has shared personal information in a game, email us and we'll delete it.
                    </p>

                    <h2>Deleting your answers</h2>
                    <p>
                        Round records are tied to a nickname and a random ID, not to who you are, and we keep them while they help improve
                        the games. To have yours removed, email us your nickname and the room code (or roughly when you played), and we'll delete them.
                    </p>

                    <h2>Changes</h2>
                    <p>If this policy changes, we'll update this page and the date at the top.</p>

                    <h2>Contact</h2>
                    <p>
                        Questions or requests: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
                    </p>

                    <p className="text-center mt-4 mb-1">
                        <Link to="/home" className="fw-bold">← Back to Game Temple</Link>
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
}
