export enum ApplicationState {
  InProgress,
  CompletedWithError,
  CompletedWithSuccess,
}

export enum CharacterState {
  Default,
  Success,
  Error,
}

export interface Application {
  runNewGame: () => void
}

export interface Character {
  state: CharacterState
  setOnSelect: (handler: () => void) => void
  setState: (state: CharacterState) => void
}

export interface Renderer {
  state: ApplicationState
  renderWord: (word: string | string[]) => Character[]
  renderCharacter: (text: string) => Character
  cleanResultInput: () => void
}
