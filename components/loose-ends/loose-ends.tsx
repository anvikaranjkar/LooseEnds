'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './store'
import { CinematicOverlay } from './effects'
import { IntroScreen } from './screens/intro-screen'
import { ApartmentScreen } from './screens/apartment-screen'
import { DesktopScreen } from './screens/desktop-screen'
import { PlatformScreen } from './screens/platform-screen'
import { EndingScreen } from './screens/ending-screen'

function CurrentScreen() {
  const { screen } = useGame()

  const screens: Record<string, React.ReactNode> = {
    intro: <IntroScreen />,
    apartment: <ApartmentScreen />,
    desktop: <DesktopScreen />,
    platform: <PlatformScreen />,
    final: <EndingScreen />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, filter: 'blur(12px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(12px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 overflow-y-auto"
      >
        {screens[screen]}
      </motion.div>
    </AnimatePresence>
  )
}

export function LooseEnds() {
  return (
    <GameProvider>
      <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
        <CurrentScreen />
        <CinematicOverlay />
      </div>
    </GameProvider>
  )
}
