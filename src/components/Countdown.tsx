import { useEffect, useRef, useState } from "react";

const enum Time {
  Millisecond = 1,
  Second = Millisecond * 1000,
  Minute = Second * 60
}

const offset = Time.Minute * new Date().getTimezoneOffset();
const formatter = new Intl.DateTimeFormat(["ru-RU"], {
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
});

export default function Countdown({ seconds = 0, onEnded = () => {} }) {
  const [remaining, setRemaining] = useState(seconds);
  const [mounted, setMounted] = useState(false);
  const ended = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((value) => {
        value--;

        if (value < 0) {
          clearInterval(remaining);
          setRemaining(0);

          if (!ended.current) {
            onEnded();
            ended.current = true;
          }

          return 0;
        }

        return value;
      });
    }, 1000);

    setMounted(true);

    return () => clearInterval(interval);
  });

  if (!mounted) return null;

  const display = formatter.format(remaining * Time.Second + offset);
  return <>{display}</>;
}
