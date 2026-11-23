import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * 🎬 Credits (game-temple.org/credits): the music, voices and tools Game Temple uses that someone else made.
 * Linked next to the privacy policy on the menus. When you add a song, sound or picture from somewhere else,
 * add it to MUSIC (or a new list) with where it came from and its license.
 */

// 🎵 Song files from elsewhere (they live in public/audio)
const MUSIC = [
    {
        title: 'Upbeat Funk Show Groove',
        by: 'AlexGuz',
        byUrl: 'https://pixabay.com/users/alexguz-37772443/',
        url: 'https://pixabay.com/music/funk-upbeat-funk-show-groove-297980/',
        usedIn: 'Trivia Cast lobby',
        source: 'Pixabay',
        license: 'Pixabay Content License',
        licenseUrl: 'https://pixabay.com/service/license-summary/',
    },
];

export default function Credits() {
    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">CREDITS</Card.Header>
                <Card.Body className="gt-privacy text-start">
                    <h1>Credits</h1>
                    <p>Game Temple is made with help from these artists and tools. Thank you!</p>

                    <h2>Music</h2>
                    <ul>
                        {MUSIC.map((song) => (
                            <li key={song.url}>
                                <a href={song.url} target="_blank" rel="noopener noreferrer">“{song.title}”</a>
                                {' by '}
                                <a href={song.byUrl} target="_blank" rel="noopener noreferrer">{song.by}</a>
                                {' '}({song.usedIn}), from {song.source} under the{' '}
                                <a href={song.licenseUrl} target="_blank" rel="noopener noreferrer">{song.license}</a>.
                            </li>
                        ))}
                    </ul>

                    <h2>Voices</h2>
                    <ul>
                        <li>
                            The game show host and narrators are voiced with{' '}
                            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer">ElevenLabs</a>.
                        </li>
                    </ul>

                    <h2>Made with</h2>
                    <ul>
                        <li>
                            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a>,{' '}
                            <a href="https://react-bootstrap.github.io" target="_blank" rel="noopener noreferrer">React Bootstrap</a> and{' '}
                            <a href="https://socket.io" target="_blank" rel="noopener noreferrer">Socket.IO</a>, all open source.
                        </li>
                    </ul>

                    <p className="text-center mt-4 mb-1">
                        <Link to="/home" className="fw-bold">← Back to Game Temple</Link>
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
}
