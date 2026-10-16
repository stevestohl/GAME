import { useState, useEffect } from 'react';

// Counts down to a server timestamp, in whole seconds (null when there's no clock running)
export default function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endTime) {
            setTimeLeft(null);
            return;
        }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [endTime]);

    return timeLeft;
}
