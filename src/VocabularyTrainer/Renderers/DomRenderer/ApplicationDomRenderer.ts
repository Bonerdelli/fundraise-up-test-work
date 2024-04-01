import { Renderer, GameResult, CharacterState } from '../../types'
import { CharacterDomRenderer } from './CharacterDomRenderer'

export class ApplicationDomRenderer implements Renderer {
  public state: GameResult
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
    this.currentQuestionEl = currentQuestionEl
    this.totalQuestionsEl = totalQuestionsEl
    this.answerEl = answerEl
    this.lettersEl = lettersEl
  }

  public renderWord(word: string | string[]) {
    const charInstances = []
    for (const char of word) {
      let index = 0
      const charInstance = this.renderCharacter(char, index++)
      this.lettersEl?.appendChild(charInstance.instance)
      charInstances.push(charInstance)
    }
    return charInstances
  }

  public renderCharacter(char: string, index?: number) {
    return new CharacterDomRenderer(char, CharacterState.Default, index)
  }

  public cleanResultInput() {
    this.answerEl.innerHTML = ''
  }
}
