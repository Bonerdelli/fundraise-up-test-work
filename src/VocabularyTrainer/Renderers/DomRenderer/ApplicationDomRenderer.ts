import { TRANSITION_BASE_DURATION } from '../../config'
import { Renderer, GameResult, LetterState, Letter } from '../../types'
import { LetterDomRenderer } from './LetterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public state: GameResult
  private currentQuestionEl: Element
  private totalQuestionsEl: Element
  private answerEl: Element
  private lettersEl: Element

  private questionCharInstances: (Letter | null)[] = []
  private answerCharInstances: Letter[] = []

  constructor() {
    const currentQuestionEl = document.getElementById('current_question')
    const totalQuestionsEl = document.getElementById('total_questions')
    const answerEl = document.getElementById('answer')
    const lettersEl = document.getElementById('letters')

    if (!currentQuestionEl || !totalQuestionsEl || !answerEl || !lettersEl) {
      throw new Error('Missed required elements')
    }

    this.state = GameResult.InProgress
    this.currentQuestionEl = currentQuestionEl
    this.totalQuestionsEl = totalQuestionsEl
    this.answerEl = answerEl
    this.lettersEl = lettersEl
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
