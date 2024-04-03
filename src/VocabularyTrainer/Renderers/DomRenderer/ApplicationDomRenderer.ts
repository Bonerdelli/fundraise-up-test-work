import { TRANSITION_BASE_DURATION } from '../../config'
import {
  Renderer,
  LetterState,
  Letter,
  OnTextInput,
  OnNavigate,
  GameState,
  GameRoundState,
} from '../../types'
import { LetterDomRenderer } from './LetterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public questionLettersMap: Record<string, Letter> = {}
  public answerLetters: Letter[] = []

  protected onTextInput?: OnTextInput
  protected onNavigate?: OnNavigate
  protected onNewGame?: () => void
  protected onResumeGame?: () => void

  protected prevRound?: number
  protected resultRendered = false

  private container: Element
  private currentQuestionEl: Element
  private totalQuestionsEl: Element
  private answerEl: Element
  private lettersEl: Element
  private resultContainerEl?: Element

  constructor() {
    const currentQuestionEl = document.getElementById('current_question')
    const totalQuestionsEl = document.getElementById('total_questions')
    const answerEl = document.getElementById('answer')
    const lettersEl = document.getElementById('letters')

    if (!currentQuestionEl || !totalQuestionsEl || !answerEl || !lettersEl) {
      throw new Error('Missed required elements')
    }

    this.container = document.getElementById('container') || document.body
    this.currentQuestionEl = currentQuestionEl
    this.totalQuestionsEl = totalQuestionsEl
    this.answerEl = answerEl
    this.lettersEl = lettersEl
    this.initialize()
  }

  protected initialize(): void {
    document.body.addEventListener('keypress', (event: Event) => {
      const key = (event as KeyboardEvent).key.toLowerCase()
      if (/^[a-z]$/.test(key)) {
        this.onTextInput?.(key)
      }
    })

    window.addEventListener('popstate', (event: Event) => {
      const state = (event as PopStateEvent).state
      if (state?.gameState) {
        this.onNavigate?.(state.gameState, state.roundState)
      }
    })
  }

  public setOnTextInput(handler: OnTextInput) {
    this.onTextInput = handler
  }

  public setOnNavigate(handler: OnNavigate) {
    this.onNavigate = handler
  }

  public setOnNewGame(handler: () => void) {
    this.onNewGame = handler
  }

  public setOnResumeGame(handler: () => void) {
    this.onResumeGame = handler
  }

  public navigateForward(
    gameState: GameState,
    roundState: GameRoundState | null,
    replace?: boolean,
  ) {
    if (replace) {
      history.replaceState(
        { gameState, roundState },
        `Round ${gameState.currentRoundNum}`,
      )
    } else {
      history.pushState(
        { gameState, roundState },
        `Round ${gameState.currentRoundNum}`,
      )
    }
  }

  public renderAnswer(word: string | string[], state = LetterState.Default) {
    this.preRenderQuestion()
    this.answerEl.innerHTML = ''
    const letterInstances = []
    for (const letter of word) {
      const letterInstance = this.renderLetter(letter)
      this.answerEl.appendChild(letterInstance.instance)
      letterInstances.push(letterInstance)
      letterInstance.setState(state)
    }
    this.answerLetters = letterInstances
    return letterInstances
  }

  public renderQuestion(characterMap: Record<string, string>) {
    this.preRenderQuestion()
    this.lettersEl.innerHTML = ''
    this.questionLettersMap = {}
    for (const [key, letter] of Object.entries(characterMap)) {
      const letterInstance = this.renderLetter(letter)
      this.lettersEl.appendChild(letterInstance.instance)
      this.questionLettersMap[key] = letterInstance
      letterInstance.key = key
    }
    return Object.values(this.questionLettersMap)
  }

  public addLetterToAnswer(letter: string) {
    const letterInstance = this.renderLetter(letter)
    this.answerEl.appendChild(letterInstance.instance)
    setTimeout(
      () => letterInstance.setState(LetterState.Success),
      TRANSITION_BASE_DURATION,
    )
    this.answerLetters.push(letterInstance)
    return letterInstance
  }

  public removeLetterFromQuestion(index: number) {
    const letterInstance = this.questionLettersMap[index]
    try {
      this.lettersEl.removeChild(letterInstance?.instance as Node)
    } catch (error) {
      // Do nothing
    }
    delete this.questionLettersMap[index]
  }

  public renderLetter(letter: string) {
    return new LetterDomRenderer(letter, LetterState.Default)
  }

  public renderCounters(total: number, current: number) {
    this.currentQuestionEl.textContent = String(current)
    this.totalQuestionsEl.textContent = String(total)
  }

  public cleanAnswer() {
    this.answerEl.innerHTML = ''
  }

  public cleanQuestion() {
    this.lettersEl.innerHTML = ''
  }

  public renderResult(total: number, errors: number, worstWord?: string) {
    if (this.resultRendered) {
      return
    }
    const successCount = total - errors
    const resultContainerEl = this.preRenderResult()

    // NOTE: we have no layout there so it's just example
    // TODO: ask for layout
    const resultRows = [
      `Game completed. Your result: ${successCount} of ${total}`,
    ]
    if (errors) {
      resultRows.push(`Number of error words: ${errors}`)
    }
    if (worstWord) {
      resultRows.push(`The word with the most mistakes: ${worstWord}`)
    }
    resultContainerEl.innerHTML = resultRows.join('<br />')

    if (this.onNewGame) {
      const buttonEl = this.renderNewGameButton()
      const buttonDiv = document.createElement('div')
      buttonDiv.classList.add('pt-5')
      buttonDiv.append(buttonEl)
      resultContainerEl.append(buttonDiv)
    }

    this.resultRendered = true
  }

  public renderResumeGameNotification() {
    if (!this.onResumeGame) {
      return
    }

    const resultContainerEl = this.preRenderResult()
    const message = 'Do you want to resume previous game?'
    resultContainerEl.textContent = message

    const buttonDiv = document.createElement('div')
    buttonDiv.classList.add('pt-5')

    const resumeGameButtonEl = document.createElement('button')
    resumeGameButtonEl.classList.add('btn', 'btn-primary', 'mr-1')
    resumeGameButtonEl.innerText = 'Resume previous game'
    resumeGameButtonEl.addEventListener('click', this.onResumeGame)

    buttonDiv.classList.add('pt-5')
    buttonDiv.append(resumeGameButtonEl)

    if (this.onNewGame) {
      const buttonEl = this.renderNewGameButton()
      buttonDiv.append(buttonEl)
    }

    resultContainerEl.append(buttonDiv)
    this.resultRendered = true
  }

  protected renderNewGameButton(): Element {
    const newGameButtonEl = document.createElement('button')
    newGameButtonEl.classList.add('btn', 'btn-primary')
    newGameButtonEl.innerText = 'Start new game'
    this.onNewGame && newGameButtonEl.addEventListener('click', this.onNewGame)
    return newGameButtonEl
  }

  protected preRenderResult(): Element {
    this.answerEl.classList.add('d-none')
    this.lettersEl.classList.add('d-none')
    if (!this.resultRendered) {
      const div = document.createElement('div')
      div.setAttribute('id', 'resultContainer')
      div.classList.add('mx-10', 'py-5')
      this.resultContainerEl = div
      this.container.append(div)
      return div
    }
    return this.resultContainerEl as Element
  }

  protected preRenderQuestion() {
    if (this.resultRendered) {
      const resultEl = document.getElementById('resultContainer')
      resultEl && this.container.removeChild(resultEl)
      this.answerEl.classList.remove('d-none')
      this.lettersEl.classList.remove('d-none')
      this.resultRendered = false
    }
  }
}
