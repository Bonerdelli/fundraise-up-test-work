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

export interface GameRoundState {
  state: GameResult
  errorsCount: number
  suggestedLetters: string[]
  originalWord: string[]
  shuffledWord: string[]
}

export interface ApplicationOptions {
  words: string[]
  wordsInGame: number
  renderer: Renderer
}

export interface Application {
  runNewGame: () => void
}

export interface Renderer {
  state: GameResult
  renderQuestion: (word: string | string[]) => Letter[]
  renderLetter: (text: string) => Letter
  renderCounters: (total: number, current: number) => void
  renderResult: (total: number, errors: number) => void
  addLetterToAnswer: (letter: string) => Letter
  removeLetterFromQuestion: (index: number) => void
  cleanAnswer: () => void
}

export type LetterOnSelect = (
  character: string,
  index: number,
  instance: Letter,
) => void

export interface Letter {
  state: LetterState
  index: number
  instance: unknown
  setOnSelect: (handler: LetterOnSelect) => void
  setState: (state: LetterState) => void
}
