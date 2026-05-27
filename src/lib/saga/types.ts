export type Critter = {
  id: string
  name: string
  species: string
  bed: string | null
  arrived: string
  status: 'resident' | 'visiting' | 'departed'
}

export type SagaState = {
  story: string | null
  startDate: string | null
  completedScenes: string[]
  money: number
  debt: number
  raccoons: number
  spite: number
  weird: number
  squirrels: null | 'paid' | 'billed' | 'blamed' | 'settled' | 'resolved'
  court: null | 'pending' | 'settled' | 'won' | 'lost' | 'delayed'
  jazz: null | 'hours_set' | 'unrestricted' | 'no_sax'
  newsletter: boolean
  marvin_campaign: null | 'funded' | 'endorsed' | 'opposed'
  marvin_song: boolean
  marvin_elected: boolean
  testimony: number
  critters: Critter[]
  keyPage: string | null
  keyStartedAt: string | null
  keyFound: boolean
  dayOffset: number
  narrativeDay: number
  narrativeDayAdvancedAt: string | null
  sessionClosed: boolean
}

export type Effect = (s: SagaState) => Partial<SagaState>

export type Choice = {
  label: string | ((s: SagaState) => string)
  condition?: (s: SagaState) => boolean
  effect: Effect
  reaction: string[]
  navigate?: string
}

export type Scene = {
  id: string
  minDay: number
  condition?: (s: SagaState) => boolean
  text: string | ((s: SagaState) => string)
  choices: Choice[]
  brawl?: boolean
}

export type Story = {
  id: string
  scenes: Scene[]
}
