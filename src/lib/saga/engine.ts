import type { SagaState, Scene, Effect, Critter } from './types'

// title
export function getTitle(s: SagaState): string {
  if (s.court === 'lost') return 'the defendant'
  if (s.court === 'won') return 'the legally vindicated'
  if (s.spite >= 3 && s.weird >= 3) return 'the chaotic landlord'
  if (s.spite >= 3) return 'the difficult landlord'
  if (s.weird >= 3) return 'the peculiar landlord'
  if (s.marvin_elected && s.marvin_campaign === 'funded') return 'Minister of Snacks'
  if (s.debt > 200) return 'our generous benefactor'
  if (s.money < 50) return 'the financially humbled'
  if (s.raccoons === 0) return 'the one who turned away Marvin'
  return 'landlord'
}

export function resolveText(text: string | ((s: SagaState) => string), state: SagaState): string {
  const raw = typeof text === 'function' ? text(state) : text
  return raw.replace(/\$title/g, getTitle(state))
}

// scene finding

export function findNextScene(state: SagaState, scenes: Scene[]): Scene | null {
  return (
    scenes.find(
      (scene) =>
        !state.completedScenes.includes(scene.id) &&
        state.narrativeDay >= scene.minDay &&
        (scene.condition?.(state) ?? true)
    ) ?? null
  )
}

// effect application

export function applyEffect(state: SagaState, effect: Effect): SagaState {
  return { ...state, ...effect(state) }
}

export function completeScene(state: SagaState, sceneId: string): SagaState {
  if (state.completedScenes.includes(sceneId)) return state
  return { ...state, completedScenes: [...state.completedScenes, sceneId] }
}

// effect helpers (used in story data)

export const fx = {
  noop: (): Effect =>
    () => ({}),

  set: (partial: Partial<SagaState>): Effect =>
    () => partial,

  spite: (n = 1): Effect =>
    (s) => ({ spite: s.spite + n }),

  weird: (n = 1): Effect =>
    (s) => ({ weird: s.weird + n }),

  money: (n: number): Effect =>
    (s) => ({ money: s.money + n }),

  debt: (n: number): Effect =>
    (s) => ({ debt: Math.max(0, s.debt + n) }),

  testimony: (n: number): Effect =>
    (s) => ({ testimony: s.testimony + n }),

  wipeDebt: (): Effect =>
    () => ({ debt: 0, marvin_song: true }),

  addCritter: (critter: Omit<Critter, 'arrived'>): Effect =>
    (s) => ({
      critters: [
        ...s.critters,
        { ...critter, arrived: new Date().toISOString().slice(0, 10) }
      ]
    }),

  updateBed: (id: string, bed: string): Effect =>
    (s) => ({
      critters: s.critters.map((c) => (c.id === id ? { ...c, bed } : c))
    }),

  updateBeds: (updates: Record<string, string>): Effect =>
    (s) => ({
      critters: s.critters.map((c) => (updates[c.id] ? { ...c, bed: updates[c.id] } : c))
    }),

  compound: (...effects: Effect[]): Effect =>
    (s) => Object.assign({}, ...effects.map((f) => f(s)))
}
