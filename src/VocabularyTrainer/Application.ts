import { Application, CharacterState, Renderer } from './types'

export interface VocabularyTrainerOptions {
  words: string[]
  wordsInGame: number
  renderer: Renderer
}

export class VocabularyTrainer implements Application {
  protected words: string[]
  protected currentWords?: string[]
  private renderer: Renderer

  wordsInGame: number
  currentWord: number
  currentWordErrorsCount?: number
  erroredResultsCount?: number

  constructor(opts: VocabularyTrainerOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.wordsInGame = opts.wordsInGame
    this.currentWord = 0
  }

  runNewGame() {
    this.currentWords = this.getRandomizedWords(this.wordsInGame)
    this.currentWordErrorsCount = 0
    this.erroredResultsCount = 0
    this.currentWord = 1
    this.nextWord()
  }

  private getRandomizedWords(limit?: number) {
    const currentGameWords = [...this.words]
    currentGameWords.sort(() => Math.random() - 0.5)
    if (limit) {
      currentGameWords.splice(0, limit)
    }
    return currentGameWords
  }

  protected nextWord() {
    const word = this.currentWords?.pop()
    if (!word) {
      // TODO: set completion
      return
    }
    const characterInstances = this.renderer.renderWord(word)
    for (const instance of characterInstances) {
      instance.setOnSelect(() => instance.setState(CharacterState.Error))
    }
    this.currentWord++
  }

  // protected checkIsCharacterValid(char: string) {

  // }

  protected getRandomWord() {
    const index = Math.floor(Math.random() * this.words.length)
    return this.words[index]
  }
}
