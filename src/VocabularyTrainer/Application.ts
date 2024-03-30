import {
  Application,
  ApplicationOptions,
  CharacterState,
  Renderer,
} from './types'

export class VocabularyTrainer implements Application {
  protected words: string[]
  protected currentWords?: string[]
  protected currentGameSet?: Record<string, string[]>
  private renderer: Renderer

  wordsInGame: number
  currentWordNum: number
  currentWordErrors?: number
  erroredResultsCount?: number

  constructor(opts: ApplicationOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.wordsInGame = opts.wordsInGame
    this.currentWordNum = 0
  }

  runNewGame() {
    this.generateGameSet(this.wordsInGame)
    this.currentWordErrors = 0
    this.erroredResultsCount = 0
    this.currentWordNum = 1
    this.nextWord()
  }

  protected generateGameSet(wordsLimit?: number) {
    const currentWords = this.getRandomizedArray(this.words, wordsLimit)
    const wordsWithShuffledChars = currentWords.map(word =>
      this.getRandomizedArray(word.split('')).join(''),
    )
    this.currentWords = wordsWithShuffledChars
    // this.currentGameSet =
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getRandomizedArray(input: any[], limit?: number) {
    let result = [...input]
    result.sort(() => Math.random() - 0.5)
    if (limit && limit < input.length) {
      result = result.slice(0, limit)
    }
    return result
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
    this.currentWordNum++
  }

  // protected checkIsCharacterValid(char: string) {

  // }

  protected getRandomWord() {
    const index = Math.floor(Math.random() * this.words.length)
    return this.words[index]
  }
}
