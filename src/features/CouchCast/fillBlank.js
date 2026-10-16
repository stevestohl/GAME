// ✍️ Puts the winning answer into the prompt's blank ("_____"), the way the card would read.
// Returns the pieces so a screen can highlight the answer, plus the whole sentence for the narrator.

const BLANK = /_{2,}/;

export const promptText = (prompt) => {
    if (!prompt) return '';
    if (typeof prompt === 'string') return prompt;
    return prompt.prompt || prompt.text || '';
};

export function fillBlank(prompt, answer) {
    const text = promptText(prompt).trim();
    let reply = String(answer || '').trim();

    const match = text.match(BLANK);
    if (!match) {
        // A question with no blank: the answer just follows it
        return { hasBlank: false, before: text, answer: reply, after: '', sentence: [text, reply].filter(Boolean).join(' ') };
    }

    const before = text.slice(0, match.index);
    // Any further blanks are read as "blank" by the narrator, so leave them as they are
    const after = text.slice(match.index + match[0].length);

    // Mid-sentence (or before the prompt's own punctuation) the card's full stop doesn't belong
    if (after.trim()) reply = reply.replace(/[.!]+$/, '');

    return { hasBlank: true, before, answer: reply, after, sentence: `${before}${reply}${after}`.replace(/\s+/g, ' ').trim() };
}
