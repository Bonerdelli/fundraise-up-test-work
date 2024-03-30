import { Renderer, ApplicationState } from '../../types'
import { CharacterDomRenderer } from './CharacterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public state: ApplicationState
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

    this.state = ApplicationState.InProgress
    this.currentQuestionEl = currentQuestionEl
    this.totalQuestionsEl = totalQuestionsEl
    this.answerEl = answerEl
    this.lettersEl = lettersEl
  }

  renderWord(word: string | string[]) {
    const charInstances = []
    for (const char of word) {
      const charInstance = this.renderCharacter(char)
      this.lettersEl?.appendChild(charInstance.instance)
      charInstances.push(charInstance)
    }
    return charInstances
  }

  renderCharacter(char: string) {
    return new CharacterDomRenderer(char)
  }

  cleanResultInput() {
    this.answerEl.innerHTML = ''
  }
}
