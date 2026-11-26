import React, { useEffect } from 'react';
import { Avatar } from '../../avatars.jsx';
import CreditsChase from './CreditsChase.jsx';
import { startCreditsMarch } from '../../celebrationSounds.js';

// 🎬 Couch Cast's end credits: after the final scores are read, they roll up the screen like the end of a movie
// (on the TV and every phone), after every game: everyone's final scores, the lobby game's results if anyone
// played it, then the crew that's been on the couch all night.
// `players`: the room's players (the caster is left out).
// `attack`: Avatar Attack's results (room.attack), the lobby game.
// `tower`: Tower Party's (room.tower), the old lobby game, switched off for now.
// `crewTheme`: whose crew gets the "Featuring" lines: 'core', 'halloween', 'holiday' or 'jeffinitely' (the deck).
// `chase`: the crew chases the cat along the bottom to a march while they roll (on the TV).

// 🛋️ Each deck's crew (CouchCrew.jsx and friends), for the "Featuring" lines
const CAST = {
    core: [
        ['The Robot', 'as the Caster'],
        ['The Dog', 'as Head of Cat Removal'],
        ['The Alien', 'with the Shrink Ray'],
        ['The Cat', 'as Itself'],
        ['Sasquatch', 'as the Special Guest'],
        ['The Couch', 'on Little Legs'],
    ],
    halloween: [
        ['The HOA President', 'as the One in Charge'],
        ['The Witch', 'casting with a Wand'],
        ['The Vampire', 'Bored for Four Hundred Years'],
        ['The Tiny Ghost', 'as the Pest'],
        ["Frankenstein's Monster", 'as the Special Guest'],
        ['The Gothic Couch', 'on Claw Feet'],
    ],
    holiday: [
        ['The Robot, the Dog and the Alien', 'in Their Holiday Best'],
        ['The Cat', 'in Its Scarf'],
        ['Santa', 'as the Special Guest'],
        ['The Sleigh', "Flying on Its Own (Nobody's Asking How)"],
        ['The Couch', 'on Little Legs'],
    ],
    jeffinitely: [
        ['Disco Duke', "Live from the '70s"],
        ['Aerobics Angie', "Feeling the Burn since the '80s"],
        ['Mullet Mitch', 'Blowing on the Cartridge'],
        ['Boomer the Boombox', 'as the Soundtrack'],
        ['Dial-Up Dana', "Connecting from the '90s"],
        ['Pixel', 'as the Pest'],
        ['The Mouse Pointer', 'on Drag-and-Drop Duty'],
    ],
};

/** Which deck's crew a room has */
export const crewThemeFor = (expansion) => (['halloween', 'holiday', 'jeffinitely'].includes(expansion) ? expansion : 'core');

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function CouchCastCredits({ players = [], attack, tower, onDone, chase = false, crewTheme = 'core' }) {
    const standings = players
        .filter((p) => p && !p.isCaster)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    const shooters = Object.values(attack?.scores || {})
        .filter((s) => s.hits > 0 || s.timesHit > 0)
        .sort((a, b) => b.hits - a.hits || a.timesHit - b.timesHit);
    const builders = Object.values(tower?.stats || {})
        .filter((s) => s.stacked > 0)
        .sort((a, b) => b.stacked - a.stacked || b.perfects - a.perfects);
    const cast = CAST[crewTheme] || CAST.core;
    const hasCredits = standings.length + shooters.length + builders.length > 0;

    useEffect(() => (chase && hasCredits ? startCreditsMarch() : undefined), [chase, hasCredits]);
    if (!hasCredits) return null;

    // Everyone tied on the top score is a champion (nobody, if nobody scored)
    const topScore = standings[0]?.score || 0;
    const champions = topScore > 0 ? standings.filter((p) => (p.score || 0) === topScore) : [];
    // Longer credits for a bigger crowd, so everyone can read their line
    const seconds = 16 + (standings.length + shooters.length + builders.length) * 2 + cast.length;
    const showChase = chase && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return (
        <div className={`tp-credits ${showChase ? `tp-chase-${crewTheme}` : ''}`} aria-live="polite">
            {showChase && <div className="tp-chase-floor" />}
            <div className="tp-credits-roll" style={{ animationDuration: `${seconds}s` }} onAnimationEnd={onDone}>
                <div className="tp-credits-kicker">That's a wrap!</div>
                <h2>🛋️ Couch Cast</h2>
                {champions.length > 0 && (
                    <div className="tp-credits-best">
                        {champions.length > 1 ? 'Champions' : 'Champion'}: <strong>{champions.map((p) => p.name).join(' & ')}</strong>
                    </div>
                )}
                {standings.length > 0 && (
                    <>
                        <div className="tp-credits-heading">Final scores</div>
                        {standings.map((p) => (
                            <div key={p.id || p.name} className="tp-credits-line">
                                <Avatar id={p.avatar} name={p.name} size={44} />
                                <span className="tp-credits-name">{p.name}</span>
                                <span className="tp-credits-role">{plural(p.score || 0, 'point')}</span>
                            </div>
                        ))}
                    </>
                )}

                {shooters.length > 0 && (
                    <>
                        <div className="tp-credits-kicker tp-credits-gap">And in the lobby...</div>
                        <h2>👾 Avatar Attack</h2>
                        <div className="tp-credits-best">Top shot: <strong>{shooters[0].name}</strong></div>
                        <div className="tp-credits-heading">Final scores</div>
                        {shooters.map((s) => (
                            <div key={s.name} className="tp-credits-line">
                                <Avatar id={s.avatar} name={s.name} size={44} />
                                <span className="tp-credits-name">{s.name}</span>
                                <span className="tp-credits-role">
                                    {plural(s.hits, 'hit')}{s.timesHit ? ` · got hit ${s.timesHit}` : ''}
                                </span>
                            </div>
                        ))}
                    </>
                )}
                {builders.length > 0 && (
                    <>
                        <div className="tp-credits-kicker tp-credits-gap">And in the lobby...</div>
                        <h2>🏗️ Tower Party</h2>
                        <div className="tp-credits-best">Tallest tower: <strong>{tower.best} high</strong></div>
                        {tower.towers > 0 && <div className="tp-credits-sub">Towers toppled along the way: {tower.towers}</div>}
                        <div className="tp-credits-heading">Starring</div>
                        {builders.map((s) => (
                            <div key={`${s.name}-${s.avatar}`} className="tp-credits-line">
                                <Avatar id={s.avatar} name={s.name} size={44} />
                                <span className="tp-credits-name">{s.name}</span>
                                <span className="tp-credits-role">
                                    stacked {s.stacked}{s.perfects ? ` · ${s.perfects} perfect` : ''}
                                </span>
                            </div>
                        ))}
                    </>
                )}

                <div className="tp-credits-heading tp-credits-gap">Featuring</div>
                {cast.map(([name, role]) => (
                    <div key={name} className="tp-credits-line tp-credits-cast">
                        <span className="tp-credits-name">{name}</span>
                        <span className="tp-credits-role">{role}</span>
                    </div>
                ))}
                <div className="tp-credits-end">Thanks for playing!</div>
            </div>
            {showChase && <div className="cc-round-scene"><CreditsChase theme={crewTheme} /></div>}
        </div>
    );
}
