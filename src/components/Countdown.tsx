import { useCountdownSeconds } from "../hooks/useCountdownSeconds";

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

type CountdownProps = {
  to: Date;
  onEnded?: () => void;
};

export default function Countdown({ to, onEnded }: CountdownProps) {
  const remaining = useCountdownSeconds(to, { onEnded });
  const display = formatter.format(remaining * Time.Second + offset);
  return <>{display}</>;
}
