'use client'

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { ScreenId } from '@/lib/loose-ends/data'
import { TOTAL_CLUES } from '@/lib/loose-ends/data'

type State = {
  screen: ScreenId
  clues: string[] // discovered clue ids
  solved: string[] // account ids successfully accessed
  failures: number // total failed attempts (drives fatigue too)
  fatigue: number // 0-100 Administrative Fatigue
  pinned: string[] // clue ids pinned to the top of the evidence folder
  important: string[] // clue ids flagged as important
}

type Action =
  | { type: 'goto'; screen: ScreenId }
  | { type: 'collect'; clueId: string }
  | { type: 'solve'; accountId: string }
  | { type: 'fatigue'; delta: number }
  | { type: 'fail' }
  | { type: 'resolve' }
  | { type: 'reset' }
  | { type: 'togglePin'; clueId: string }
  | { type: 'toggleImportant'; clueId: string }

const INITIAL_STATE: State = {
  screen: 'intro',
  clues: [],
  solved: [],
  failures: 0,
  fatigue: 6,
  pinned: [],
  important: [],
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'goto':
      return { ...state, screen: action.screen }
    case 'collect': {
      if (state.clues.includes(action.clueId)) return state
      return { ...state, clues: [...state.clues, action.clueId] }
    }
    case 'solve': {
      if (state.solved.includes(action.accountId)) return state
      // Success gently relieves a little fatigue — progress feels good.
      return {
        ...state,
        solved: [...state.solved, action.accountId],
        fatigue: clamp(state.fatigue - 4),
      }
    }
    case 'fail':
      return { ...state, failures: state.failures + 1, fatigue: clamp(state.fatigue + 9) }
    case 'fatigue':
      return { ...state, fatigue: clamp(state.fatigue + action.delta) }
    case 'resolve':
      return { ...state, fatigue: 0, screen: 'final' }
    case 'reset':
      return INITIAL_STATE
    case 'togglePin':
      return { ...state, pinned: toggle(state.pinned, action.clueId) }
    case 'toggleImportant':
      return { ...state, important: toggle(state.important, action.clueId) }
    default:
      return state
  }
}

type Store = State & {
  totalClues: number
  hasClue: (id: string) => boolean
  goto: (screen: ScreenId) => void
  collect: (clueId: string) => void
  solve: (accountId: string) => void
  fail: () => void
  addFatigue: (delta: number) => void
  resolve: () => void
  reset: () => void
  togglePin: (clueId: string) => void
  toggleImportant: (clueId: string) => void
}

const GameContext = createContext<Store | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const goto = useCallback((screen: ScreenId) => dispatch({ type: 'goto', screen }), [])
  const collect = useCallback((clueId: string) => dispatch({ type: 'collect', clueId }), [])
  const solve = useCallback((accountId: string) => dispatch({ type: 'solve', accountId }), [])
  const fail = useCallback(() => dispatch({ type: 'fail' }), [])
  const addFatigue = useCallback((delta: number) => dispatch({ type: 'fatigue', delta }), [])
  const resolve = useCallback(() => dispatch({ type: 'resolve' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const togglePin = useCallback((clueId: string) => dispatch({ type: 'togglePin', clueId }), [])
  const toggleImportant = useCallback((clueId: string) => dispatch({ type: 'toggleImportant', clueId }), [])

  const value = useMemo<Store>(
    () => ({
      ...state,
      totalClues: TOTAL_CLUES,
      hasClue: (id: string) => state.clues.includes(id),
      goto,
      collect,
      solve,
      fail,
      addFatigue,
      resolve,
      reset,
      togglePin,
      toggleImportant,
    }),
    [state, goto, collect, solve, fail, addFatigue, resolve, reset, togglePin, toggleImportant],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
