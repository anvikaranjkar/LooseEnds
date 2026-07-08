'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Rain } from '../effects'
import { Logo } from '../logo'
import { useGame } from '../store'

// Cinematic onboarding. A sequence of typed lines over a black, rainy screen,
// resolving into the title card, then the apartment.
const LINES: { text: string; pause?: number; className?: string }[] = [
  { text: '1 May 2019', className: 'font-type text-2xl sm:text-3xl text-paper tracking-widest' },
  { text: 'John Citizen passed away.', className: 'font-type text-xl sm:text-2xl text-paper/90' },
  { text: 'You are Emma Citizen.', className: 'font-serif text-lg sm:text-xl text-amber-soft' },
  { text: 'His daughter.', className: 'font-serif text-lg sm:text-xl text-amber-soft' },
  { text: 'You have been left with something nobody prepares you for.', className: 'font-serif text-base sm:text-lg text-paper/80' },
  { text: 'The funeral is over.', className: 'font-serif text-base sm:text-lg text-paper/80' },
  { text: 'But the paperwork has only just begun.', className: 'font-serif text-base sm:text-lg text-paper/80' },
]

function Typewriter({ text, speed = 45, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [shown, setShown] = useState('')
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        doneRef.current?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span>
      {shown}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-middle" />
    </span>
  )
}

export function IntroScreen() {
  const { goto } = useGame()
  const [index, setIndex] = useState(-1) // -1 = "press to begin"
  const [showTitle, setShowTitle] = useState(false)
  const [started, setStarted] = useState(false)

  // advance to the next line a beat after each finishes typing
  function handleLineDone() {
    const isLast = index >= LINES.length - 1
    window.setTimeout(() => {
      if (isLast) {
        setShowTitle(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, 1100)
  }

  function begin() {
    if (started) return
    setStarted(true)
    setIndex(0)
  }

  // Allow keyboard / click to begin
  useEffect(() => {
    if (started) return
    const onKey = () => begin()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  return (
    <div
      onClick={begin}
      className="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-black"
    >
      <Rain count={70} className="opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.85))]" />

      <AnimatePresence mode="wait">
        {!started && !showTitle && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-6 text-center"
          >
            <p className="font-serif text-sm uppercase tracking-[0.4em] text-paper/50">A short interactive film</p>
            <motion.p
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="font-type text-lg tracking-widest text-paper/80"
            >
              press any key to begin
            </motion.p>
          </motion.div>
        )}

        {started && !showTitle && (
          <motion.div
            key={`line-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-xl px-8 text-center text-balance"
          >
            {index >= 0 && (
              <p className={LINES[index].className}>
                <Typewriter text={LINES[index].text} onDone={handleLineDone} />
              </p>
            )}
          </motion.div>
        )}

        {showTitle && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
          >
            <Logo size="lg" showTagline />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              onClick={() => goto('apartment')}
              className="group mt-4 flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-7 py-2.5 font-serif text-sm uppercase tracking-[0.25em] text-amber-soft transition-colors hover:bg-amber/20"
            >
              Enter his apartment
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
