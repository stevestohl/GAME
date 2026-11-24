import { useLayoutEffect } from 'react';

/**
 * 🔠 Makes the text in `textRef` as big as it can be while still fitting inside `boxRef` (no scrolling), between
 * `min` and `max` pixels. It re-fits whenever the box changes size, so the rules fill a big TV or a desktop window
 * as well as a phone held sideways. Sizes inside the text should be in em, so they grow with it.
 */
export default function useFitText(boxRef, textRef, { min = 12, max = 72 } = {}) {
    useLayoutEffect(() => {
        const box = boxRef.current;
        const text = textRef.current;
        if (!box || !text) return undefined;

        const fits = () => text.offsetHeight <= box.clientHeight && text.scrollWidth <= box.clientWidth + 1;
        const fit = () => {
            let low = min;
            let high = max;
            // A dozen halvings get within a fraction of a pixel
            for (let i = 0; i < 12; i += 1) {
                const mid = (low + high) / 2;
                text.style.fontSize = `${mid}px`;
                if (fits()) low = mid; else high = mid;
            }
            text.style.fontSize = `${Math.floor(low)}px`;
        };

        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(box);
        // Webfonts arriving change the text's size too
        document.fonts?.ready.then(() => fit()).catch(() => {});
        return () => observer.disconnect();
    }, [boxRef, textRef, min, max]);
}
