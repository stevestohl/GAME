// 🎄 The Holiday deck's lobby medley: four traditional carols (all old enough to be public domain), each
// under 30 seconds, one after another and then round again. timerMusic.js plays them with its instruments.
//
// Each song is written in beats (a beat is 4 steps, the 16th notes the music runs on):
//   melody: "note:beats", with "R" for a rest, on the same clock as
//   chords: "chord:beats", from CHORDS below

export const MEDLEY_BPM = 132;
const STEPS_PER_BEAT = 4;
const BREATH_STEPS = 8;   // a couple of beats between songs

const NOTE_NUMBERS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const noteNumber = (name) => {
    const [, letter, octave] = name.match(/^([A-G]#?)(\d)$/);
    return 12 * (Number(octave) + 1) + NOTE_NUMBERS[letter];
};

// [bass note, chord notes]
const CHORDS = {
    C: [36, [60, 64, 67]],
    F: [41, [60, 65, 69]],
    G: [43, [59, 62, 67]],
    G7: [43, [59, 62, 65]],
    D7: [38, [60, 62, 66]],
    Am: [45, [60, 64, 69]],
    Dm: [38, [62, 65, 69]],
    E7: [40, [59, 62, 68]],
};

const SONGS = [
    {
        name: 'Jingle Bells',
        lead: 'bell',
        melody: `
            E5:1 E5:1 E5:2  E5:1 E5:1 E5:2  E5:1 G5:1 C5:1.5 D5:0.5  E5:4
            F5:1 F5:1 F5:1.5 F5:0.5  F5:1 E5:1 E5:1 E5:0.5 E5:0.5  E5:1 D5:1 D5:1 E5:1  D5:2 G5:2
            E5:1 E5:1 E5:2  E5:1 E5:1 E5:2  E5:1 G5:1 C5:1.5 D5:0.5  E5:4
            F5:1 F5:1 F5:1.5 F5:0.5  F5:1 E5:1 E5:1 E5:0.5 E5:0.5  G5:1 G5:1 F5:1 D5:1  C5:4`,
        chords: 'C:16 F:4 C:4 D7:4 G7:4 C:16 F:4 C:4 G7:4 C:4',
    },
    {
        name: 'Deck the Halls',
        lead: 'marimba',
        melody: `
            G5:1.5 F5:0.5 E5:1 D5:1  C5:1 D5:1 E5:1 C5:1  D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5  C5:1 B4:1 C5:2
            G5:1.5 F5:0.5 E5:1 D5:1  C5:1 D5:1 E5:1 C5:1  D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5  C5:1 B4:1 C5:2
            D5:1.5 E5:0.5 F5:1 D5:1  E5:1.5 F5:0.5 G5:1 D5:1  E5:0.5 F#5:0.5 G5:1 A5:0.5 B5:0.5 C6:1  B5:1 A5:1 G5:2
            G5:1.5 F5:0.5 E5:1 D5:1  C5:1 D5:1 E5:1 C5:1  A5:0.5 A5:0.5 A5:0.5 A5:0.5 G5:1.5 F5:0.5  E5:1 D5:1 C5:2`,
        chords: 'C:8 G7:2 C:2 G7:2 C:2 C:8 G7:2 C:2 G7:2 C:2 G:4 C:2 G:2 C:2 D7:2 G:4 C:8 F:2 C:2 G7:2 C:2',
    },
    {
        name: 'We Wish You a Merry Christmas',
        lead: 'musicBox',
        beatsPerBar: 3,
        melody: `
            R:2 G4:1
            C5:1 C5:0.5 D5:0.5 C5:0.5 B4:0.5  A4:1 A4:1 A4:1  D5:1 D5:0.5 E5:0.5 D5:0.5 C5:0.5  B4:1 G4:1 G4:1
            E5:1 E5:0.5 F5:0.5 E5:0.5 D5:0.5  C5:1 A4:1 G4:0.5 G4:0.5  A4:1 D5:1 B4:1  C5:2 G4:1
            C5:1 C5:1 C5:1  B4:2 B4:1  C5:1 B4:1 A4:1  G4:2 D5:1
            E5:1 D5:1 C5:1  G5:1 G4:1 G4:0.5 G4:0.5  A4:1 D5:1 B4:1  C5:3`,
        chords: 'G:3 C:3 F:3 D7:3 G:3 E7:3 Am:3 G7:3 C:3 C:3 G:3 Am:3 G:3 C:3 G:3 G7:3 C:3',
    },
    {
        name: 'Joy to the World',
        lead: 'stab',
        melody: `
            C6:1 B5:0.75 A5:0.25 G5:1.5 F5:0.5  E5:1 D5:1 C5:1.5 G5:0.5  A5:1.5 A5:0.5 B5:1.5 B5:0.5  C6:3.5 C6:0.5
            C6:0.5 B5:0.5 A5:0.5 G5:0.5 G5:0.75 F5:0.25 E5:0.5 C6:0.5  C6:0.5 B5:0.5 A5:0.5 G5:0.5 G5:0.75 F5:0.25 E5:0.5 E5:0.5
            E5:0.5 E5:0.5 E5:0.5 E5:0.25 F5:0.25 G5:1.5 F5:0.25 E5:0.25  D5:0.5 D5:0.5 D5:0.5 D5:0.25 E5:0.25 F5:1.5 E5:0.25 D5:0.25
            C5:0.5 C6:1 A5:0.5 G5:0.75 F5:0.25 E5:0.5 F5:0.5  E5:1 D5:1 C5:2`,
        chords: 'C:2 F:2 C:1 G7:1 C:2 F:2 G:2 C:4 C:2 G7:2 C:2 G7:2 C:4 G7:4 F:2 C:1 F:1 C:1 G7:1 C:2',
    },
];

const parse = (text) => text.trim().split(/\s+/).map((part) => {
    const [what, beats] = part.split(':');
    return { what, steps: Math.round(Number(beats) * STEPS_PER_BEAT) };
});

// Lay the songs end to end: `steps[n]` is what starts on step n of the medley
const build = () => {
    const steps = [];
    const at = (step) => { steps[step] = steps[step] || {}; return steps[step]; };
    const songs = [];
    let start = 0;

    SONGS.forEach((song) => {
        let length = 0;
        parse(song.melody).forEach(({ what, steps: size }) => {
            if (what !== 'R') at(start + length).lead = { note: noteNumber(what), instrument: song.lead };
            length += size;
        });
        let chordStep = 0;
        parse(song.chords).forEach(({ what, steps: size }) => {
            const [root, notes] = CHORDS[what];
            // Oom-pah: a bass note starts each half bar (each bar, in a waltz), and chords fill the rest
            for (let s = 0; s < size && chordStep + s < length; s += STEPS_PER_BEAT) {
                const beat = at(start + chordStep + s);
                if ((chordStep + s) % (STEPS_PER_BEAT * (song.beatsPerBar === 3 ? 3 : 2)) === 0) beat.bass = root;
                else beat.chord = notes;
            }
            chordStep += size;
        });
        songs.push({ name: song.name, seconds: (length * 60) / MEDLEY_BPM / STEPS_PER_BEAT, melodySteps: length, chordSteps: chordStep });
        start += length + BREATH_STEPS;
    });

    return { steps, songs, length: start };
};

const medley = build();

export const MEDLEY_STEPS = medley.steps;
export const MEDLEY_LENGTH = medley.length;
export const MEDLEY_SONGS = medley.songs;
