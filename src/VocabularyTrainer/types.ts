export enum GameResult {
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
  totalRounds: number
  erroredResultsCount: number
  currentRoundNum: number
}

export interface GameRoundState {
  state: GameResult
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
export type OnNavigate = (roundNumber: number) => void
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
  state: GameResult
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
  navigateForward: (roundNum: number) => void
}

export interface Letter {
  instance: unknown
  key?: string
  setOnSelect: (handler: OnSelectLetter) => void
  setState: (state: LetterState) => void
}
