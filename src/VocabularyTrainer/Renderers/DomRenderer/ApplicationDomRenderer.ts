import { TRANSITION_BASE_DURATION } from '../../config'
import { Renderer, GameResult, LetterState, Letter } from '../../types'
import { LetterDomRenderer } from './LetterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public state: GameResult

  private questionCharInstances: (Letter | null)[] = []
  private answerCharInstances: Letter[] = []

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

    this.state = GameResult.InProgress
    this.container = document.body
    this.currentQuestionEl = currentQuestionEl
    this.totalQuestionsEl = totalQuestionsEl
    this.answerEl = answerEl
    this.lettersEl = lettersEl
  }

  public renderCounters(total: number, current: number) {
    this.currentQuestionEl.textContent = String(current)
    this.totalQuestionsEl.textContent = String(total)
  }

  public renderResult(total: number, errors: number) {
    const successCount = total - errors
    this.answerEl.classList.add('hidden')
    this.lettersEl.classList.add('hidden')
    // NOTE: we have no layout there so it's just example
    // TODO: ask for layout
    const div = document.createElement('div')
    div.classList.add('mx-10', 'py-5')
    div.innerText = `Game completed. Your result: ${total} of ${successCount}`
    this.container.prepend(div)
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
    this.questionCharInstances = letterInstances
    return letterInstances
  }

  public addLetterToAnswer(letter: string) {
    const letterInstance = this.renderLetter(letter)
    this.answerEl.appendChild(letterInstance.instance)
    setTimeout(
      () => letterInstance.setState(LetterState.Success),
      TRANSITION_BASE_DURATION,
    )
    this.answerCharInstances.push(letterInstance)
    return letterInstance
  }

  public removeLetterFromQuestion(index: number) {
    const letterInstance = this.questionCharInstances[index]
    this.lettersEl.removeChild(letterInstance?.instance as Node)
    this.questionCharInstances[index] = null
  }

  public renderLetter(letter: string) {
    return new LetterDomRenderer(letter, LetterState.Default)
  }

  public cleanAnswer() {
    this.answerEl.innerHTML = ''
  }
}
