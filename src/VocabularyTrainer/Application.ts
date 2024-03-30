import { Application, Renderer } from './types'

export interface VocabularyTrainerOptions {
  words: string[]
  renderer: Renderer
}

export class VocabularyTrainer implements Application {
  public words: string[]
  private renderer: Renderer

  constructor(opts: VocabularyTrainerOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
  }

  runNewGame() {
    const testWord1 = this.getRandomWord()
    this.renderer.renderWord(testWord1)
  }

  protected getRandomWord() {
    const index = Math.floor(Math.random() * this.words.length)
    return this.words[index]
  }
}
