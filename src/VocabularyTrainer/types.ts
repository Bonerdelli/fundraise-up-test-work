export enum GameProgress {
  NotStarted,
  InProgress,
  CompletedWithError,
  CompletedWithSuccess,
}

export enum LetterState {
  Default,
  Success,
  Error,
}

export interface GameState {
  progress: GameProgress
  totalRounds: number
  erroredResultsCount: number
  currentRoundNum: number
  worstWord?: string
}

export interface GameRoundState {
  position: number
  progress: GameProgress
  originalWord: string[]
  shuffledWord: string[]
  errorsCount: number
  suggestedLetters: string[]
  suggestedLetterIndexes: number[]
}

export interface ApplicationOptions {
  words: string[]
  gameRounds: number
  renderer: Renderer
  storage: PersistStorage
}

export type OnTextInput = (text: string) => void
export type OnNavigate = (
  gameState: GameState,
  roundState: GameRoundState | null,
  replace?: boolean,
) => void
export type OnSelectLetter = (
  character: string,
  key: string,
  instance: Letter,
) => void

export interface Application {
  runNewGame: () => void
}

export interface PersistStorage {
  getItem: <T = unknown>(key: string) => T
  setItem: <T = unknown>(key: string, value: T) => void
  removeItem: (key: string) => void
}

export interface Renderer {
  answerLetters: Letter[]
  questionLettersMap: Record<string, Letter>

  renderQuestion: (characterMap: Record<string, string>) => Letter[]
  renderAnswer: (word: string | string[], state?: LetterState) => Letter[]
  renderLetter: (text: string) => Letter
  renderCounters: (total: number, current: number) => void
  renderResult: (total: number, errors: number, worstWord?: string) => void
  addLetterToAnswer: (letter: string) => Letter
  removeLetterFromQuestion: (index: number) => void
  cleanQuestion: () => void
  cleanAnswer: () => void

  setOnTextInput: (handler: OnTextInput) => void
  setOnNavigate: (handler: OnNavigate) => void
  navigateForward: OnNavigate
}

export interface Letter {
  instance: unknown
  key?: string
  setOnSelect: (handler: OnSelectLetter) => void
  setState: (state: LetterState) => void
}
