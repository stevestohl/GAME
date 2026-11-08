import { getCouchCastRoom } from "../sockets/couchcast_handler.js";
import { getReshuffledRoom } from "../sockets/reshuffled_handler.js";
import { getMixupRoom } from "../sockets/mixup_handler.js";
import { getTriviaCastRoom } from "../sockets/triviacast_handler.js";
import { getListCastRoom } from "../sockets/lists_handler.js";
import { readMp3, cutMp3 } from "./mp3.js";

// ==========================================
// 🎙️ Voice-overs (ElevenLabs text-to-speech)
// ==========================================
// The TV asks this endpoint to turn a line of text into speech.
// The API key never leaves the server: set ELEVENLABS_API_KEY in .env.local
// (local) or in the Render dashboard (production). Without a key the game
// simply plays without a voice.

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'keLVje3aBMuRpxuu0bqO'; // "Crofty - Energetic Radio Host"
// 🎃 Couch Cast with the Halloween deck gets a villain for a narrator instead (from ElevenLabs' voice library)
const HALLOWEEN_VOICE_ID = 'Vs5CmVCVJwW4odQS2pVf'; // "Branok - Evil & Villainous"
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';   // fast + cheapest per character

// Always English. Left to guess, the model sometimes hears a short or odd line
// (a prompt full of blanks, a made-up name) as another language and reads it with a German accent.
// Only the v2.5 models (flash/turbo) accept a language code.
const LANGUAGE = MODEL_ID.includes('v2_5') ? { language_code: 'en' } : {};

// --- Spending guards (ElevenLabs bills per character) ---
const MAX_CHARS_PER_LINE = 400;
const MAX_CHARS_PER_ROOM = 6000;
const MAX_CHARS_PER_DAY = Number(process.env.TTS_DAILY_CHAR_LIMIT) || 5000;

let charsToday = 0;
let today = new Date().toDateString();

// Lines we've already paid for (rules, "the prompt is...", repeated cards) are replayed for free
const audioCache = new Map();
const MAX_CACHED_LINES = 300;

// Lines being generated right now, so two requests for the same line only pay once
const inFlight = new Map();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 🎚️ Every take is checked before it's played or kept. About one take in a hundred, the voice runs on
// past the end of its line and mumbles: a 16-letter "The prompt is..." once came back 14.6 seconds long,
// and a cut-off name ("Gladys Overw.") trailed off for three seconds after the words. The cache below
// then replayed that take in every game until the server restarted. ElevenLabs sends the time each
// letter is spoken along with the audio, which shows where the words really end.
const MAX_AFTER_WORDS = 1.0;    // seconds of sound allowed after the last letter (good takes: 0.2 to 0.4)
// A take that runs on is cut at its quietest moment this long after the words, once the last sound has faded
const CUT_AFTER_WORDS = [0.35, MAX_AFTER_WORDS];
// Longer than this for the words alone and it's dragging or rambling (real lines run 10 to 20 characters a second)
const longestSpeech = (text) => 0.6 + text.length / 7;
const MAX_TAKES = 2;            // a take that fails the check gets one more go (if the limits allow it)

// The spoken words end at the last letter or digit (the "..." or "!" after it is where the sound fades)
const wordsEndAt = (alignment) => {
    const chars = alignment?.characters;
    const ends = alignment?.character_end_times_seconds;
    if (!Array.isArray(chars) || !Array.isArray(ends) || chars.length !== ends.length) return null;
    for (let i = chars.length - 1; i >= 0; i -= 1) {
        if (/[\p{L}\p{N}]/u.test(chars[i]) && Number.isFinite(ends[i])) return ends[i];
    }
    return null;
};

// { audio } for a good take; otherwise { problem }, plus { cut } (the take stopped after the words) if it
// only runs on at the end. A take that can't be measured is played as it is, the way it always was.
const checkTake = (text, { audio, alignment }) => {
    const mp3 = readMp3(audio);
    const wordsEnd = wordsEndAt(alignment);
    if (!mp3 || wordsEnd === null) return { audio };

    if (wordsEnd > longestSpeech(text)) {
        return { problem: `drags on (${wordsEnd.toFixed(1)}s of words)` };
    }
    if (mp3.seconds - wordsEnd > MAX_AFTER_WORDS) {
        return {
            problem: `runs on for ${(mp3.seconds - wordsEnd).toFixed(1)}s after the words`,
            cut: cutMp3(audio, mp3, wordsEnd + CUT_AFTER_WORDS[0], wordsEnd + CUT_AFTER_WORDS[1]),
        };
    }
    return { audio };
};

// Asks ElevenLabs for one line: { audio, alignment } (the time each letter is spoken), or null if nothing came back.
// A busy or flaky answer gets one more try.
const generateSpeech = async (text, apiKey, voiceId, attempt = 1) => {
    let response;
    try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, model_id: MODEL_ID, ...LANGUAGE }),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        console.error(`ElevenLabs request failed (try ${attempt}): ${err.message}`);
        if (attempt === 1) { await wait(300); return generateSpeech(text, apiKey, voiceId, 2); }
        return null;
    }

    if (!response.ok) {
        const detail = await response.text();
        console.error(`ElevenLabs error ${response.status} (try ${attempt}):`, detail.slice(0, 300));
        const worthRetrying = response.status === 429 || response.status >= 500;
        if (worthRetrying && attempt === 1) { await wait(600); return generateSpeech(text, apiKey, voiceId, 2); }
        return null;
    }

    try {
        const { audio_base64: audio, alignment } = await response.json();
        if (!audio) return null;
        return { audio: Buffer.from(audio, 'base64'), alignment };
    } catch (err) {
        console.error(`ElevenLabs answer unreadable (try ${attempt}): ${err.message}`);
        return null;
    }
};

// Is there allowance left for `chars` more characters? (ElevenLabs bills each take, retries too)
const withinLimits = (room, chars) => room.ttsChars + chars <= MAX_CHARS_PER_ROOM && charsToday + chars <= MAX_CHARS_PER_DAY;
const countChars = (room, chars) => {
    room.ttsChars += chars;
    charsToday += chars;
};

// Makes a clean recording of a line. The first take's characters are already counted (see speakLine).
// Returns the audio, or null if there's no usable take.
const recordLine = async (text, apiKey, voiceId, room) => {
    let cutTake = null;
    for (let take = 1; take <= MAX_TAKES; take += 1) {
        if (take > 1) {
            if (!withinLimits(room, text.length)) break;
            countChars(room, text.length);
        }

        const result = await generateSpeech(text, apiKey, voiceId);
        if (!result) {
            // Nothing was produced (so nothing billed): give that allowance back
            countChars(room, -text.length);
            break;
        }

        const verdict = checkTake(text, result);
        if (verdict.audio) return verdict.audio;
        console.warn(`Voice-over take ${take} of "${text.slice(0, 50)}" ${verdict.problem}${take < MAX_TAKES ? ': trying again' : ''}`);
        cutTake = cutTake || verdict.cut || null;
    }
    // No clean take: one that only ran on at the end is fine cut short
    return cutTake;
};

export const speakLine = async (req, res) => {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ success: false, message: "Voice-overs are not set up (no ELEVENLABS_API_KEY)." });
        }

        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        const roomCode = typeof req.body.roomCode === 'string' ? req.body.roomCode.trim().toUpperCase() : '';

        if (!text || text.length > MAX_CHARS_PER_LINE) {
            return res.status(400).json({ success: false, message: "Text is missing or too long." });
        }

        // Only a live TV game (Couch Cast, Re-Shuffled, Trivia Cast, List Cast or Mix Up) can ask for speech
        const couchCastRoom = getCouchCastRoom(roomCode);
        const room = couchCastRoom || getReshuffledRoom(roomCode) || getTriviaCastRoom(roomCode) || getListCastRoom(roomCode) || getMixupRoom(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found." });
        }

        const voiceId = couchCastRoom?.expansion === 'halloween' ? HALLOWEEN_VOICE_ID : VOICE_ID;
        const cacheKey = `${voiceId}:${MODEL_ID}:${text}`;
        let audio = audioCache.get(cacheKey);

        // Someone already asked for this exact line a moment ago: wait for that one
        if (!audio && inFlight.has(cacheKey)) {
            audio = await inFlight.get(cacheKey);
            if (!audio) return res.status(502).json({ success: false, message: "The voice service returned an error." });
        }

        if (!audio) {
            // New day, new allowance
            if (new Date().toDateString() !== today) {
                today = new Date().toDateString();
                charsToday = 0;
            }

            room.ttsChars = room.ttsChars || 0;
            if (!withinLimits(room, text.length)) {
                console.warn(`Voice-over limit reached (room ${roomCode}: ${room.ttsChars} chars, today: ${charsToday} chars).`);
                return res.status(429).json({ success: false, message: "Voice-over limit reached." });
            }

            // Count it up front so a burst of requests can't slip past the limits
            countChars(room, text.length);

            const pending = recordLine(text, apiKey, voiceId, room);
            inFlight.set(cacheKey, pending);
            try {
                audio = await pending;
            } finally {
                inFlight.delete(cacheKey);
            }

            if (!audio) {
                return res.status(502).json({ success: false, message: "The voice service returned an error." });
            }

            // Oldest line out when the cache is full
            if (audioCache.size >= MAX_CACHED_LINES) {
                audioCache.delete(audioCache.keys().next().value);
            }
            audioCache.set(cacheKey, audio);
        }

        res.set('Content-Type', 'audio/mpeg');
        res.set('Cache-Control', 'no-store');
        res.send(audio);
    } catch (error) {
        console.error("Error in speakLine:", error.message);
        res.status(500).json({ success: false, message: "Failed to create voice-over." });
    }
};
