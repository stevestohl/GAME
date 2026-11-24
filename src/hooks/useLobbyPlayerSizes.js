import { useEffect, useState } from 'react';

/**
 * 👥 How big each player should be in a TV lobby's players card, so the first few players fill it instead of
 * sitting tiny at the top: one column for one or two players, two columns from three, and rows as tall as the
 * card allows (shrinking as more join, then scrolling once they reach their smallest).
 * Returns the list's grid style, plus the avatar and name sizes in pixels.
 */
export default function useLobbyPlayerSizes(listRef, count) {
    const [box, setBox] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const list = listRef.current;
        if (!list) return undefined;
        const measure = () => setBox({ width: list.clientWidth, height: list.clientHeight });
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
    }, [listRef]);

    const columns = count >= 3 ? 2 : 1;
    const rows = Math.max(1, Math.ceil(count / columns));
    const gap = 12;
    // Each row's share of the card (no taller than looks right for one player, no shorter than a readable line)
    const rowHeight = box.height ? Math.max(42, Math.min(box.height / rows, 210)) : 48;
    const cellWidth = box.width ? (box.width - (columns - 1) * gap) / columns : 300;
    // The avatar takes up to a quarter or so of the row's width, so the name beside it (and the Host badge) still fit
    const avatar = Math.round(Math.max(24, Math.min(rowHeight * 0.72, cellWidth * 0.28, 160)));
    const font = Math.round(Math.max(14, Math.min(rowHeight * 0.28, avatar * 0.5, (cellWidth * 0.72 - 70) / 5, 44)));

    return {
        avatar,
        font,
        gridStyle: {
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridAutoRows: `${Math.floor(rowHeight)}px`,
            columnGap: `${gap}px`,
        },
    };
}
