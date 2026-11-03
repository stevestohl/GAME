import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../avatars.jsx';
import { QuizBows } from './QuizScenes.jsx';
import { playCelebration, startApplause, startCreditsMarch } from '../../celebrationSounds.js';

// 🎭 The end of Trivia Cast, after the final scores are read: a drum roll as the red curtains sweep in, a fanfare
// and applause as they part, and the Avatar Attack results from the lobby roll up the stage while the whole
// cast (dinosaur included) takes a bow. Then the curtains close and part on the final scores again.
//
// The Play Again and Home buttons underneath still work the whole time.

const CURTAIN_MS = 1500;      // keep in step with .qf-curtain in cards.css
const FANFARE_MS = 3600;      // before the march takes over from the fanfare

const CAST = [
    ['Abraham Lincoln', 'Contestant A'],
    ['Babe Ruth', 'Contestant B'],
    ['Cleopatra', 'Contestant C'],
    ['Amelia Earhart', 'Contestant D'],
    ['T. rex', 'Himself'],
];

export default function QuizFinale({ scores, onDone }) {
    // 'waiting' (curtains off to the sides) -> 'closed' -> 'open' -> 'closing' -> 'leaving' (off to the sides again)
    const [phase, setPhase] = useState('waiting');
    const stopSounds = useRef([]);

    const shooters = Object.values(scores || {})
        .filter((s) => s.hits > 0 || s.timesHit > 0)
        .sort((a, b) => b.hits - a.hits || a.timesHit - b.timesHit);
    const seconds = 13 + shooters.length * 2;
    const skip = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        if (skip) { onDone?.(); return undefined; }
        const timers = [];
        timers.push(setTimeout(() => setPhase('closed'), 40));
        timers.push(setTimeout(() => setPhase('open'), 40 + CURTAIN_MS + 300));
        // The drum roll lands just as the curtains start to part, then comes the crowd
        playCelebration((CURTAIN_MS + 300) / 1000);
        timers.push(setTimeout(() => { stopSounds.current.push(startApplause()); }, CURTAIN_MS + 500));
        timers.push(setTimeout(() => { stopSounds.current.push(startCreditsMarch()); }, CURTAIN_MS + 300 + FANFARE_MS));
        return () => {
            timers.forEach(clearTimeout);
            stopSounds.current.forEach((stop) => stop());
            stopSounds.current = [];
        };
    }, []);

    // The credits have finished: close the curtains, and part them on the final scores
    const handleRollEnd = () => {
        setPhase('closing');
        stopSounds.current.forEach((stop) => stop());
        stopSounds.current = [];
        setTimeout(() => setPhase('leaving'), CURTAIN_MS + 400);
        setTimeout(() => onDone?.(), CURTAIN_MS * 2 + 500);
    };

    if (skip) return null;

    const isStageUp = phase === 'open' || phase === 'closing';
    return (
        <div className={`qf-finale qf-${phase}`} aria-live="polite">
            {isStageUp && (
                <div className="qf-stage">
                    <div className="tp-credits-roll" style={{ animationDuration: `${seconds}s` }} onAnimationEnd={handleRollEnd}>
                        {shooters.length > 0 && (
                            <>
                                <div className="tp-credits-kicker">And in the lobby...</div>
                                <h2>👾 Avatar Attack</h2>
                                <div className="tp-credits-best">Top shot: <strong>{shooters[0].name}</strong></div>
                                <div className="tp-credits-heading">Final scores</div>
                                {shooters.map((s) => (
                                    <div key={s.name} className="tp-credits-line">
                                        <Avatar id={s.avatar} name={s.name} size={44} />
                                        <span className="tp-credits-name">{s.name}</span>
                                        <span className="tp-credits-role">
                                            {s.hits} {s.hits === 1 ? 'hit' : 'hits'}{s.timesHit ? ` · got hit ${s.timesHit}` : ''}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                        <div className="tp-credits-heading">Featuring</div>
                        {CAST.map(([name, role]) => (
                            <div key={name} className="tp-credits-line">
                                <span className="tp-credits-name">{name}</span>
                                <span className="tp-credits-role">as {role}</span>
                            </div>
                        ))}
                        <div className="tp-credits-end">Thanks for playing!</div>
                    </div>
                    <div className="qf-floor" />
                    <div className="cc-round-scene"><QuizBows /></div>
                </div>
            )}
            <div className="qf-valance" />
            <div className="qf-curtain qf-curtain-left" />
            <div className="qf-curtain qf-curtain-right" />
        </div>
    );
}
