import { MAX_ERRORS_COUNT_PER_ROUND, TRANSITION_BASE_DURATION } from './config'
import {
  Application,
  ApplicationOptions,
  Letter,
  LetterState,
  GameResult,
  GameState,
  GameRoundState,
  PersistStorage,
  Renderer,
} from './types'

export class VocabularyTrainer implements Application {
  protected words: string[]
  protected gameRounds: number

  private renderer: Renderer
  private storage: PersistStorage

  protected get gameState(): GameState {
    return this.storage.getItem<GameState>('game') || {}
  }

  private set gameState(state: GameState) {
    this.storage.setItem<GameState>('game', state)
  }

  protected get gameRoundsState(): GameRoundState[] {
    return this.storage.getItem<GameRoundState[]>('rounds') || []
  }

  private set gameRoundsState(state: GameRoundState[]) {
    this.storage.setItem<GameRoundState[]>('rounds', state)
  }

  protected get currentRoundNum(): number {
    const state = this.storage.getItem<GameState>('game')
    return state.currentRoundNum ?? 0
  }

  private set currentRoundNum(value: number) {
    const state = this.storage.getItem<GameState>('game')
    state.currentRoundNum = value
    this.storage.setItem<GameState>('game', state)
  }

  protected get erroredResultsCount(): number {
    const state = this.storage.getItem<GameState>('game')
    return state.erroredResultsCount ?? 0
  }

  private set erroredResultsCount(value: number) {
    const state = this.storage.getItem<GameState>('game')
    state.erroredResultsCount = value
    this.storage.setItem<GameState>('game', state)
  }

  protected get currentRound(): GameRoundState | null {
    return this.gameRoundsState[this.currentRoundNum - 1] ?? null
  }

  constructor(opts: ApplicationOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.storage = opts.storage
    this.gameRounds = opts.gameRounds
    this.initialize()
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
    this.generateGameSet(this.gameRounds)
    this.gameState = {
      totalRounds: this.gameRounds,
      erroredResultsCount: 0,
      currentRoundNum: 1,
    }
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
    this.gameRoundsState = initialGameSet
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
    if (this.gameState.currentRoundNum === this.gameState.totalRounds) {
      this.completeGame()
    } else {
      this.renderer.navigateForward(this.currentRoundNum)
      this.currentRoundNum++
      this.renderQuestion()
    }
  }

  private completeGame() {
    let maxErrorsCount = 0
    let worstWord: string | undefined = undefined
    for (const round of this.gameRoundsState) {
      if (round.errorsCount > maxErrorsCount) {
        maxErrorsCount = round.errorsCount
        worstWord = round.originalWord.join('')
      }
    }
    this.renderer.renderResult(
      this.gameRounds,
      this.erroredResultsCount,
      worstWord,
    )
  }

  private renderQuestion() {
    this.renderer.cleanAnswer()
    this.renderer.renderCounters(this.gameRounds, this.currentRoundNum)
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
    const roundState = this.gameRoundsState[round - 1]
    if (round === this.currentRoundNum) {
      this.renderQuestion()
    } else if (roundState) {
      this.renderer.cleanQuestion()
      this.renderer.cleanAnswer()
      this.renderer.renderAnswer(
        roundState.originalWord,
        roundState.errorsCount > 0 ? LetterState.Error : LetterState.Success,
      )
      this.renderer.renderCounters(this.gameRounds, round)
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
