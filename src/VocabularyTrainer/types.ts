export enum GameResult {
  InProgress,
  CompletedWithError,
  CompletedWithSuccess,
}

export enum CharacterState {
  Default,
  Success,
  Error,
}

export interface GameRoundState {
  state: GameResult
  errorsCount: number
  suggestedCharacters: string[]
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
  renderWord: (word: string | string[]) => Character[]
  renderCharacter: (text: string) => Character
  cleanResultInput: () => void
}

export type CharacterOnSelect = (
  character: string,
  index: number,
  instance: Character,
) => void

export interface Character {
  state: CharacterState
  setOnSelect: (handler: CharacterOnSelect) => void
  setState: (state: CharacterState) => void
}
