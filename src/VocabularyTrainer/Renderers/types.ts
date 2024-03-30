import { Character } from '../types'

export enum ApplicationState {
  InProgress,
  CompletedWithError,
  CompletedWithSuccess,
}

export interface ApplicationRenderer {
  state: ApplicationState
  setState: (state: ApplicationState) => void
  renderWord: (text: string) => Character
  cleanResultInput: () => void
}

// export interface ItemRenderer {
//   render: (character: string) => Character
// }
