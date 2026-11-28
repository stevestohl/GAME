import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * 🎬 Credits (game-temple.org/credits): the music, voices, word list and tools Game Temple uses that someone else made.
 * Linked next to the privacy policy on the menus. When you add a song, sound or picture from somewhere else,
 * add it to MUSIC (or a new list) with where it came from and its license.
 */

// 🎵 Songs we recorded ourselves from music that's out of copyright (public domain)
const CLASSICS = [
    {
        title: 'Children’s Galop',
        work: 'The Nutcracker',
        by: 'Pyotr Ilyich Tchaikovsky',
        url: 'https://imslp.org/wiki/The_Nutcracker_(ballet),_Op.71_(Tchaikovsky,_Pyotr)',
        usedIn: 'Couch Cast Holiday deck lobby',
    },
    {
        title: 'Entry of the Gladiators',
        by: 'Julius Fučík',
        url: 'https://imslp.org/wiki/Einzug_der_Gladiatoren,_Op.68_(Fu%C4%8D%C3%ADk,_Julius)',
        usedIn: '3 Ring Circus lobby',
    },
];

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
                        {CLASSICS.map((song) => (
                            <li key={song.url}>
                                {song.work
                                    ? <>“{song.title}” from <a href={song.url} target="_blank" rel="noopener noreferrer"><i>{song.work}</i></a></>
                                    : <a href={song.url} target="_blank" rel="noopener noreferrer">“{song.title}”</a>}
                                {' by '}{song.by} ({song.usedIn}). The music is in the public domain; this recording is
                                our own, played with the{' '}
                                <a href="https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General_License.md" target="_blank" rel="noopener noreferrer">MuseScore General</a>
                                {' '}sounds by S. Christian Collins, based on FluidR3 by Frank Wen (MIT License).
                            </li>
                        ))}
                        <li>
                            “Decades Mixtape” (Couch Cast Jeffinitely deck lobby): our own tune and recording, played with the{' '}
                            <a href="https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General_License.md" target="_blank" rel="noopener noreferrer">MuseScore General</a>
                            {' '}sounds by S. Christian Collins, based on FluidR3 by Frank Wen (MIT License).
                        </li>
                        <li>
                            “Curtain Call” (Trivia Cast end credits): our own tune and recording, played with the{' '}
                            <a href="https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General_License.md" target="_blank" rel="noopener noreferrer">MuseScore General</a>
                            {' '}sounds by S. Christian Collins, based on FluidR3 by Frank Wen (MIT License).
                        </li>
                    </ul>

                    <h2>Voices</h2>
                    <ul>
                        <li>
                            The game show host and narrators are voiced with{' '}
                            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer">ElevenLabs</a>.
                        </li>
                    </ul>

                    <h2>Words</h2>
                    <ul>
                        <li>
                            Word Weave checks words against{' '}
                            <a href="https://github.com/dolph/dictionary" target="_blank" rel="noopener noreferrer">ENABLE</a>
                            {' '}(the Enhanced North American Benchmark LExicon), a word list its authors placed in the public domain.
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
