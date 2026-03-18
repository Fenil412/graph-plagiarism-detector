import { useEffect, useState } from 'react'

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export default function TextScramble({ text, className = '', speed = 50 }) {
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    let frame = 0
    const maxFrames = text.length * 3

    const interval = setInterval(() => {
      const scrambled = text
        .split('')
        .map((char, i) => {
          if (frame > i * 3) {
            return char
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join('')

      setDisplayText(scrambled)
      frame++

      if (frame > maxFrames) {
        clearInterval(interval)
        setDisplayText(text)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <span className={className}>{displayText}</span>
}
