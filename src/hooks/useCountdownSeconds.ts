import { useEffect, useState } from "react";

function secondsBefore(date: Date) {
  return Math.max(Math.ceil((date.getTime() - Date.now()) / 1000), 0);
}

export function useCountdownSeconds(to: Date, { onEnded = () => {} } = {}) {
  const [seconds, setSeconds] = useState(secondsBefore(to));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = secondsBefore(to);
      setSeconds(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onEnded();
      }
    }, 1000);


    return () => clearInterval(interval);
  }, [to, setSeconds]);

  return seconds;
}
