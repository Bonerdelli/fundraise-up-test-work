import {
  Application,
  ApplicationOptions,
  Character,
  CharacterState,
  GameResult,
  GameRoundState,
  Renderer,
} from './types'

export class VocabularyTrainer implements Application {
  protected words: string[]
  protected currentWords?: string[]
  private gameState: GameRoundState[] = []
  private renderer: Renderer

  public wordsInGame: number
  public currentRoundNum: number
  public currentWordLetters: string[] = []
  public currentWordErrors = 0
  public erroredResultsCount = 0

  constructor(opts: ApplicationOptions) {
    this.words = opts.words
    this.renderer = opts.renderer
    this.wordsInGame = opts.wordsInGame
    this.currentRoundNum = 0
  }

  public runNewGame() {
    this.generateGameSet(this.wordsInGame)
    this.currentWordErrors = 0
    this.erroredResultsCount = 0
    this.currentRoundNum = 0
    this.renderWord()
  }

  protected get currentRound(): GameRoundState | null {
    return this.gameState[this.currentRoundNum - 1] ?? null
  }

  protected get currentWord(): string | null {
    const word = this.gameState[this.currentRoundNum]?.shuffledWord
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
      suggestedCharacters: [],
      errorsCount: 0,
    }))
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

  private renderWord() {
    const word = this.currentWord
    if (!word) {
      // TODO: set completion
      return
    }
    const characterInstances = this.renderer.renderWord(word)
    for (const instance of characterInstances) {
      instance.setOnSelect((...args) => this.handleCharacterSelection(...args))
    }
    this.currentRoundNum++
  }

  private nextWord() {
    this.currentRoundNum++
    this.renderWord()
  }

  private handleCharacterSelection(
    char: string,
    index: number,
    instance: Character,
  ) {
    const round = this.currentRound as GameRoundState
    if (this.checkIsCharacterValid(char)) {
      instance.setState(CharacterState.Success)
      round.suggestedCharacters.push(char)
    } else {
      instance.setState(CharacterState.Error)
      round.errorsCount += 1
    }
  }

  private checkIsCharacterValid(char: string): boolean {
    const currentRound = this.currentRound
    if (!currentRound) {
      return false
    }
    const position = currentRound.suggestedCharacters.length
    console.log('position', position, currentRound.originalWord, this.gameState, char)
    if (currentRound.originalWord[position] === char) {
      return true
    }
    return false
  }
}
