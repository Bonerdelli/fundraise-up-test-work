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
  protected wordsInGame: number
  protected currentRoundNum: number
  protected currentWordLetters: string[] = []
  protected erroredResultsCount = 0

  private gameState: GameRoundState[] = []
  private renderer: Renderer

  constructor(opts: ApplicationOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.wordsInGame = opts.wordsInGame
    this.currentRoundNum = 0
    this.initialize()
  }

  protected get completed(): boolean {
    return this.currentRoundNum === this.wordsInGame
  }

  protected get currentRound(): GameRoundState | null {
    return this.gameState[this.currentRoundNum - 1] ?? null
  }

  protected initialize() {
    this.renderer.setOnTextInput((letter: string) =>
      this.handleLetterType(letter),
    )
    this.renderer.setOnNavigate((roundNum: number) =>
      this.handleNavigate(roundNum),
    )
  }

  public runNewGame() {
    this.generateGameSet(this.wordsInGame)
    this.renderer.navigateForward(1)
    this.erroredResultsCount = 0
    this.currentRoundNum = 1
    this.renderQuestion()
  }

  protected generateGameSet(wordsLimit?: number) {
    const currentWords = this.shuffleArray(this.words, wordsLimit)
    const initialGameSet: GameRoundState[] = currentWords.map(word => ({
      state: GameResult.InProgress,
      originalWord: word.split(''),
      shuffledWord: this.shuffleArray(word.split('')),
      suggestedLetters: [],
      suggestedLetterIndexes: [],
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

  private nextWord() {
    if (this.completed) {
      this.completeGame()
    } else {
      this.currentRoundNum++
      this.renderer.navigateForward(this.currentRoundNum)
      this.renderQuestion()
    }
  }

  private completeGame() {
    let maxErrorsCount = 0
    let worstWord: string | undefined = undefined
    for (const round of this.gameState) {
      if (round.errorsCount > maxErrorsCount) {
        maxErrorsCount = round.errorsCount
        worstWord = round.originalWord.join('')
      }
    }
    this.renderer.renderResult(
      this.wordsInGame,
      this.erroredResultsCount,
      worstWord,
    )
  }

  private renderQuestion() {
    this.renderer.cleanAnswer()
    this.renderer.renderCounters(this.wordsInGame, this.currentRoundNum)
    let wordRemainder: string[] | undefined = undefined
    const round = this.currentRound
    if (round) {
      wordRemainder = round.shuffledWord
      if (round.suggestedLetters.length > 1) {
        wordRemainder = wordRemainder.slice(0, round.suggestedLetters.length)
      }
    }
    if (round?.suggestedLetters?.length) {
      this.renderer.renderAnswer(round.suggestedLetters, LetterState.Success)
    }
    if (wordRemainder) {
      const characterInstances = this.renderer.renderQuestion(wordRemainder)
      for (const instance of characterInstances) {
        instance.setOnSelect((...args) => this.handleLetterSelection(...args))
      }
    }
  }

  private handleLetterType(letter: string) {
    const round = this.currentRound as GameRoundState
    const index = round.shuffledWord.findIndex(
      (datum, index) =>
        datum === letter && !round.suggestedLetterIndexes.includes(index),
    )
    let letterInstance: Letter | null = null
    if (index !== -1) {
      letterInstance = this.renderer.questionLetters?.[index]
    }
    this.handleLetterSelection(letter, index, letterInstance)
  }

  private handleLetterSelection(
    letter: string,
    index?: number,
    instance?: Letter | null,
  ) {
    const round = this.currentRound as GameRoundState
    if (this.checkIsLetterValid(letter)) {
      round.suggestedLetters.push(letter)
      this.renderer.addLetterToAnswer(letter)
      if (typeof index !== 'undefined' && index >= 0) {
        this.renderer.removeLetterFromQuestion(index)
        round.suggestedLetterIndexes.push(index)
      }
    } else {
      round.errorsCount += 1
      if (instance) {
        instance.setState(LetterState.Error)
        setTimeout(
          () => instance.setState(LetterState.Default),
          TRANSITION_BASE_DURATION * 3,
        )
      }
    }

    this.checkNextRound()
  }

  private handleNavigate(round: number) {
    const roundState = this.gameState[round - 1]
    if (round === this.currentRoundNum) {
      this.renderQuestion()
    } else if (roundState) {
      this.renderer.cleanQuestion()
      this.renderer.cleanAnswer()
      this.renderer.renderAnswer(
        roundState.originalWord,
        roundState.errorsCount > 0 ? LetterState.Error : LetterState.Success,
      )
      this.renderer.renderCounters(this.wordsInGame, round)
    }
  }

  private checkNextRound() {
    const round = this.currentRound as GameRoundState
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
