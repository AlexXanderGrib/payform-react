import { useEffect, useState } from 'react'

function calculateRemainingSeconds (date: Date): number {
  return Math.max(Math.ceil((date.getTime() - Date.now()) / 1000), 0)
}

export function useCountdownSeconds (to: Date, { onEnded = () => {} } = {}): number {
  const [seconds, setSeconds] = useState(calculateRemainingSeconds(to))

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds(to)
      setSeconds(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onEnded()
      }
    }, 1000)

    return () => { clearInterval(interval) }
  }, [to, setSeconds, onEnded])

  return seconds
}
