import { getCouchCastRoom } from "../sockets/couchcast_handler.js";

// ==========================================
// 🎙️ Voice-overs (ElevenLabs text-to-speech)
// ==========================================
// The TV asks this endpoint to turn a line of text into speech.
// The API key never leaves the server: set ELEVENLABS_API_KEY in .env.local
// (local) or in the Render dashboard (production). Without a key the game
// simply plays without a voice.

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'keLVje3aBMuRpxuu0bqO'; // "Crofty - Energetic Radio Host"
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';   // fast + cheapest per character

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

// Asks ElevenLabs for one line. A busy or flaky answer gets one more try.
const generateSpeech = async (text, apiKey, attempt = 1) => {
    let response;
    try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, model_id: MODEL_ID }),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        console.error(`ElevenLabs request failed (try ${attempt}): ${err.message}`);
        if (attempt === 1) { await wait(300); return generateSpeech(text, apiKey, 2); }
        return null;
    }

    if (!response.ok) {
        const detail = await response.text();
        console.error(`ElevenLabs error ${response.status} (try ${attempt}):`, detail.slice(0, 300));
        const worthRetrying = response.status === 429 || response.status >= 500;
        if (worthRetrying && attempt === 1) { await wait(600); return generateSpeech(text, apiKey, 2); }
        return null;
    }

    return Buffer.from(await response.arrayBuffer());
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

        // Only a live Couch Cast room can ask for speech
        const room = getCouchCastRoom(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found." });
        }

        const cacheKey = `${VOICE_ID}:${MODEL_ID}:${text}`;
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
            if (room.ttsChars + text.length > MAX_CHARS_PER_ROOM || charsToday + text.length > MAX_CHARS_PER_DAY) {
                console.warn(`Voice-over limit reached (room ${roomCode}: ${room.ttsChars} chars, today: ${charsToday} chars).`);
                return res.status(429).json({ success: false, message: "Voice-over limit reached." });
            }

            // Count it up front so a burst of requests can't slip past the limits
            room.ttsChars += text.length;
            charsToday += text.length;

            const pending = generateSpeech(text, apiKey);
            inFlight.set(cacheKey, pending);
            audio = await pending;
            inFlight.delete(cacheKey);

            if (!audio) {
                // Nothing was produced, so give the allowance back
                room.ttsChars -= text.length;
                charsToday -= text.length;
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
