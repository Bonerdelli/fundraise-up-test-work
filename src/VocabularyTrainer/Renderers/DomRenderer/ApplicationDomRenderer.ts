import { TRANSITION_BASE_DURATION } from '../../config'
import {
  Renderer,
  GameResult,
  LetterState,
  Letter,
  OnTextInput,
} from '../../types'
import { LetterDomRenderer } from './LetterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public state: GameResult
  protected onTextInput?: OnTextInput

  public questionLetters: (Letter | null)[] = []
  public answerLetters: Letter[] = []

  private container: Element
  private currentQuestionEl: Element
  private totalQuestionsEl: Element
  private answerEl: Element
  private lettersEl: Element

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
    this.state = GameResult.InProgress
    this.initialize()
  }

  protected initialize(): void {
    document.body.addEventListener('keydown', (event: Event) => {
      const key = (event as KeyboardEvent).key.toLowerCase()
      console.log('key', key, /^[a-z]$/.test(key))
      if (/^[a-z]$/.test(key)) {
        this.onTextInput?.(key)
      }
    })
  }

  public setOnTextInput(handler: OnTextInput) {
    this.onTextInput = handler
  }

  public renderCounters(total: number, current: number) {
    this.currentQuestionEl.textContent = String(current)
    this.totalQuestionsEl.textContent = String(total)
  }

  public renderResult(total: number, errors: number, worstWord?: string) {
    if (this.state !== GameResult.InProgress) {
      return // NOTE: do hotnig when game already completed
    }
    const successCount = total - errors
    this.answerEl.classList.add('d-none')
    this.lettersEl.classList.add('d-none')
    this.state = errors
      ? GameResult.CompletedWithError
      : GameResult.CompletedWithSuccess
    // NOTE: we have no layout there so it's just example
    // TODO: ask for layout
    const div = document.createElement('div')
    div.classList.add('mx-10', 'py-5')
    const resultRows = [
      `Game completed. Your result: ${successCount} of ${total}`,
    ]
    if (errors) {
      resultRows.push(`Errored results: ${errors}`)
    }
    if (worstWord) {
      resultRows.push(`The word with the most mistakes: ${worstWord}`)
    }
    div.innerHTML = resultRows.join('<br />')
    this.container.append(div)
  }

  public renderAnswer(word: string | string[], state = LetterState.Default) {
    this.answerEl.innerHTML = ''
    const letterInstances = []
    let index = 0
    for (const letter of word) {
      const letterInstance = this.renderLetter(letter)
      this.answerEl.appendChild(letterInstance.instance)
      letterInstances.push(letterInstance)
      letterInstance.setState(state)
      letterInstance.index = index++
    }
    this.answerLetters = letterInstances
    return letterInstances
  }

  public renderQuestion(word: string | string[]) {
    this.lettersEl.innerHTML = ''
    const letterInstances = []
    let index = 0
    for (const letter of word) {
      const letterInstance = this.renderLetter(letter)
      this.lettersEl.appendChild(letterInstance.instance)
      letterInstances.push(letterInstance)
      letterInstance.index = index++
    }
    this.questionLetters = letterInstances
    return letterInstances
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
    const letterInstance = this.questionLetters[index]
    this.lettersEl.removeChild(letterInstance?.instance as Node)
    this.questionLetters[index] = null
  }

  public renderLetter(letter: string) {
    return new LetterDomRenderer(letter, LetterState.Default)
  }

  public cleanAnswer() {
    this.answerEl.innerHTML = ''
  }

  public cleanQuestion() {
    this.lettersEl.innerHTML = ''
  }
}
