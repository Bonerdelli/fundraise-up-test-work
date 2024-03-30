export enum CharacterState {
  Default,
  Success,
  Error,
}

export interface Character {
  state: CharacterState
  setOnSelect: (handler: () => void) => void
  setState: (state: CharacterState) => void
}
