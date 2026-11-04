import { useEffect } from 'react';

// 📜 Nobody can scroll a TV: when there are more rows than fit, the list moves along by itself
export default function useAutoScrollList(listRef) {
    useEffect(() => {
        const timer = setInterval(() => {
            const list = listRef.current;
            if (!list || list.scrollHeight <= list.clientHeight + 2) return;
            const row = list.firstElementChild?.getBoundingClientRect().height || 40;
            const isAtEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
            list.scrollTo({ top: isAtEnd ? 0 : list.scrollTop + row, behavior: 'smooth' });
        }, 2500);
        return () => clearInterval(timer);
    }, [listRef]);
}
