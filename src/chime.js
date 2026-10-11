// 🔔 A short two-note chime, made in the browser (no audio file needed).
// Used to tell a player "it's your turn" on their phone.

let audioContext = null;

const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    return audioContext;
};

// Phones only allow sound after the user has touched the page,
// so wake the audio up on any tap/keypress and keep it ready for later.
const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
};
['pointerdown', 'touchend', 'keydown'].forEach((eventName) => {
    document.addEventListener(eventName, unlockAudio, { passive: true });
});

export function playChime() {
    // A little buzz as well, where the phone supports it (Android)
    if (navigator.vibrate) navigator.vibrate(120);

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // Two bell-like notes: A5 then E6
    const notes = [
        { frequency: 880, delay: 0 },
        { frequency: 1318.5, delay: 0.16 },
    ];

    notes.forEach(({ frequency, delay }) => {
        const start = ctx.currentTime + delay;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        // Quick attack, long soft fade
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.75);
    });
}
