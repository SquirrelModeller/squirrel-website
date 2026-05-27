import type { SagaState } from './types'

const STORAGE_KEY = 'saga_state'

export function defaultState(): SagaState {
  return {
    story: null,
    startDate: null,
    completedScenes: [],
    money: 300,
    debt: 0,
    raccoons: 0,
    spite: 0,
    weird: 0,
    squirrels: null,
    court: null,
    jazz: null,
    newsletter: false,
    marvin_campaign: null,
    marvin_song: false,
    marvin_elected: false,
    testimony: 0,
    critters: [],
    keyPage: null,
    keyStartedAt: null,
    keyFound: false,
    dayOffset: 0,
    narrativeDay: 0,
    narrativeDayAdvancedAt: null,
    sessionClosed: false
  }
}

export function loadState(): SagaState {
  if (typeof localStorage === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw), sessionClosed: false }
  } catch {
    return defaultState()
  }
}

export function saveState(state: SagaState): void {
  if (typeof localStorage === 'undefined') return
  const { sessionClosed, ...persistable } = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch { /* storage full */ }
  mirrorToCookies(state)
}

export function currentDay(state: SagaState): number {
  if (!state.startDate) return 0
  const start = new Date(state.startDate + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000) + (state.dayOffset ?? 0))
}

export function keyTimeRemaining(state: SagaState): number {
  if (!state.keyStartedAt) return 600
  const elapsed = (Date.now() - new Date(state.keyStartedAt).getTime()) / 1000
  return Math.max(0, 600 - elapsed)
}

function mirrorToCookies(state: SagaState): void {
  if (typeof document === 'undefined') return
  const opts = 'Max-Age=31536000; Path=/; SameSite=Lax'
  set('saga_story', state.story ?? 'undecided', opts)
  set('saga_money', String(state.money), opts)
  set('saga_day', String(currentDay(state)), opts)
  for (const c of state.critters) {
    set(c.id, JSON.stringify({ name: c.name, bed: c.bed, status: c.status, arrived: c.arrived }), opts)
  }
}

function set(name: string, value: string, opts: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${opts}`
}

const STORIES = ['raccoons']

export function pickStory(): string {
  return STORIES[Math.floor(Math.random() * STORIES.length)]
}
