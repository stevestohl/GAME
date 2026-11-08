// 🎵 Just enough MP3 reading to cut a recording short without re-encoding it.
// An MP3 is a run of small frames (26 ms each at 44.1 kHz), so dropping the frames after a point
// shortens it cleanly. The voice-overs come from ElevenLabs as 128 kbps, 44.1 kHz MPEG-1 Layer III.

const BITRATES_MPEG1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_MPEG2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SAMPLE_RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

// The ID3 tag at the start (title, content credentials) comes before the first frame
const id3Size = (buf) => {
    if (buf.length < 10 || buf.toString('latin1', 0, 3) !== 'ID3') return 0;
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    return 10 + size + (buf[5] & 0x10 ? 10 : 0);
};

// `count` bits starting `bit` bits into the bytes at `offset`
const readBits = (buf, offset, bit, count) => {
    let value = 0;
    for (let i = bit; i < bit + count; i += 1) {
        value = (value << 1) | ((buf[offset + (i >> 3)] >> (7 - (i & 7))) & 1);
    }
    return value;
};

// How loud a frame is, roughly: its "global gain", the scale its sound is stored at (1.5 dB a step).
// Measured on ElevenLabs takes: about 130 to 145 for silence and mumbling, 160 to 175 for speech.
const frameGain = (buf, offset, isMpeg1, isMono) => {
    const sideInfo = offset + 4 + (buf[offset + 1] & 0x01 ? 0 : 2);   // a 2-byte checksum may come first
    const channels = isMono ? 1 : 2;
    let bit = isMpeg1 ? (isMono ? 18 : 20) : (isMono ? 9 : 10);
    let gain = 0;
    for (let granule = 0; granule < (isMpeg1 ? 2 : 1); granule += 1) {
        for (let channel = 0; channel < channels; channel += 1) {
            gain = Math.max(gain, readBits(buf, sideInfo, bit + 21, 8));   // after part2_3_length and big_values
            bit += isMpeg1 ? 59 : 63;
        }
    }
    return gain;
};

// One Layer III frame header: how many bytes the frame takes, how long it plays and how loud it is
const readFrameHeader = (buf, offset) => {
    if (offset + 4 > buf.length || buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) return null;
    const version = (buf[offset + 1] >> 3) & 0x03;   // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (buf[offset + 1] >> 1) & 0x03;     // 1 = Layer III
    const bitrateIndex = buf[offset + 2] >> 4;
    const rateIndex = (buf[offset + 2] >> 2) & 0x03;
    const padding = (buf[offset + 2] >> 1) & 0x01;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) return null;

    const isMpeg1 = version === 3;
    const isMono = buf[offset + 3] >> 6 === 3;
    const sampleRate = SAMPLE_RATES[version][rateIndex];
    const bitrate = (isMpeg1 ? BITRATES_MPEG1 : BITRATES_MPEG2)[bitrateIndex] * 1000;
    const samples = isMpeg1 ? 1152 : 576;
    const length = Math.floor((samples / 8) * bitrate / sampleRate) + padding;
    if (offset + length > buf.length) return null;
    return { length, seconds: samples / sampleRate, gain: frameGain(buf, offset, isMpeg1, isMono) };
};

/**
 * The frames of an MP3 and how long it plays, or null if it isn't an MP3 this can read all the way through.
 * The first frame may be a silent "Info"/"Xing" frame that only describes the file (its length), not sound.
 */
export const readMp3 = (buf) => {
    const start = id3Size(buf);
    const frames = [];
    let offset = start;
    while (offset < buf.length) {
        const header = readFrameHeader(buf, offset);
        if (!header) break;
        frames.push({ offset, ...header });
        offset += header.length;
    }
    // Stopped well short of the end (anything but a 128-byte ID3v1 tag left): not a file we understand
    if (!frames.length || buf.length - offset > 128) return null;

    const firstBytes = buf.subarray(frames[0].offset, frames[0].offset + Math.min(frames[0].length, 48));
    const hasInfoFrame = firstBytes.includes('Info') || firstBytes.includes('Xing');
    const soundFrames = hasInfoFrame ? frames.slice(1) : frames;
    if (!soundFrames.length) return null;

    // When each frame starts playing
    let time = 0;
    soundFrames.forEach((frame) => {
        frame.startsAt = time;
        time += frame.seconds;
    });
    return { start, soundFrames, seconds: time };
};

/**
 * The same MP3 stopped at its quietest frame between `from` and `to` seconds (in whole frames,
 * so nothing is re-encoded). The Info frame is left out: it would still give the old length.
 */
export const cutMp3 = (buf, mp3, from, to) => {
    const frames = mp3.soundFrames;
    let quietest = null;
    frames.forEach((frame) => {
        const inRange = frame.startsAt >= from && frame.startsAt <= to;
        // Later only if clearly quieter (2 steps, 3 dB): the sooner it stops, the less mumbling is left
        if (inRange && (!quietest || frame.gain <= quietest.gain - 2)) quietest = frame;
    });
    const last = quietest || frames[frames.length - 1];
    return Buffer.concat([buf.subarray(0, mp3.start), buf.subarray(frames[0].offset, last.offset + last.length)]);
};
