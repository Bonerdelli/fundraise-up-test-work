import { MAX_ERRORS_COUNT_PER_ROUND, TRANSITION_BASE_DURATION } from './config'
import {
  Application,
  ApplicationOptions,
  Letter,
  LetterState,
  GameResult,
  GameRoundState,
  Renderer,
} from './types'

export class VocabularyTrainer implements Application {
  protected words: string[]
  protected currentWords: string[] = []
  private gameState: GameRoundState[] = []
  private renderer: Renderer

  public wordsInGame: number
  public currentRoundNum: number
  public currentWordLetters: string[] = []
  public erroredResultsCount = 0

  constructor(opts: ApplicationOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.wordsInGame = opts.wordsInGame
    this.currentRoundNum = 0
    this.initialize()
  }

  protected initialize() {
    this.renderer.setOnTextInput((letter: string) =>
      this.handleLetterSelection(letter),
    )
  }

  public runNewGame() {
    this.generateGameSet(this.wordsInGame)
    this.erroredResultsCount = 0
    this.currentRoundNum = 1
    this.renderQuestion()
  }

  protected get currentRound(): GameRoundState | null {
    return this.gameState[this.currentRoundNum - 1] ?? null
  }

  protected get currentWord(): string | null {
    const word = this.gameState[this.currentRoundNum - 1]?.shuffledWord
    if (word) {
      return word.join('')
    }
    return null
  }

  protected generateGameSet(wordsLimit?: number) {
    const currentWords = this.shuffleArray(this.words, wordsLimit)
    const initialGameSet: GameRoundState[] = currentWords.map(word => ({
      state: GameResult.InProgress,
      originalWord: word.split(''),
      shuffledWord: this.shuffleArray(word.split('')),
      suggestedLetters: [],
      errorsCount: 0,
    }))
    this.currentWords = currentWords
    this.gameState = initialGameSet
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected shuffleArray(input: any[], limit?: number) {
    let result = [...input]
    result.sort(() => Math.random() - 0.5)
    if (limit && limit < input.length) {
      result = result.slice(0, limit)
    }
    return result
  }

  protected nextWord() {
    if (this.currentRoundNum === this.currentWords.length) {
      let maxErrorsCount = 0
      let worstWord: string | undefined = undefined
      for (const round of this.gameState) {
        if (round.errorsCount > maxErrorsCount) {
          maxErrorsCount = round.errorsCount
          worstWord = round.originalWord.join('')
        }
      }
      this.renderer.renderResult(
        this.currentWords.length,
        this.erroredResultsCount,
        worstWord,
      )
    } else {
      this.currentRoundNum++
      this.renderQuestion()
    }
  }

  private renderQuestion() {
    this.renderer.cleanAnswer()
    this.renderer.renderCounters(this.currentWords.length, this.currentRoundNum)
    if (this.currentWord) {
      const characterInstances = this.renderer.renderQuestion(this.currentWord)
      for (const instance of characterInstances) {
        instance.setOnSelect((...args) => this.handleLetterSelection(...args))
      }
    }
  }

  private handleLetterSelection(
    letter: string,
    index?: number,
    instance?: Letter,
  ) {
    const round = this.currentRound as GameRoundState

    if (typeof index === 'undefined') {
      // Get the index of the letter when handling text input
      index = round.shuffledWord.findIndex(
        suggestedLetter => suggestedLetter === letter,
      )
    }

    if (this.checkIsLetterValid(letter)) {
      round.suggestedLetters.push(letter)
      this.renderer.addLetterToAnswer(letter)
      if (typeof index !== 'undefined' && index >= 0) {
        this.renderer.removeLetterFromQuestion(index)
      }
    } else if (instance) {
      instance.setState(LetterState.Error)
      setTimeout(
        () => instance.setState(LetterState.Default),
        TRANSITION_BASE_DURATION * 3,
      )
      round.errorsCount += 1
    } else {
      round.errorsCount += 1
    }

    if (round.shuffledWord.length === round.suggestedLetters.length) {
      this.nextWord()
    }

    if (round.errorsCount === MAX_ERRORS_COUNT_PER_ROUND) {
      this.erroredResultsCount++
      this.renderer.cleanQuestion()
      this.renderer.renderAnswer(round.originalWord, LetterState.Error)
      setTimeout(() => this.nextWord(), TRANSITION_BASE_DURATION * 10)
    }
  }

  private checkIsLetterValid(letter: string): boolean {
    const currentRound = this.currentRound
    if (!currentRound) {
      return false
    }
    const position = currentRound.suggestedLetters.length
    if (currentRound.originalWord[position] === letter) {
      return true
    }
    return false
  }
}
