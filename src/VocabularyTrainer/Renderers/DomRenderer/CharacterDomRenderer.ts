import { Character, CharacterState } from '../../types'

export class CharacterDomRenderer implements Character {
  public state: CharacterState
  private character: string
  private domElement: Element

  constructor(character: string, state?: CharacterState) {
    this.character = character
    this.state = state ?? CharacterState.Default
    this.domElement = this.render()
  }

  public get instance() {
    return this.domElement
  }

  public setState(state: CharacterState) {
    const prevClassName = this.getStateClassName()
    const className = this.getStateClassName(state)
    if (prevClassName !== className) {
      this.domElement.classList.add(className)
      this.domElement.classList.remove(prevClassName)
    }
    this.state = state
  }

  public setOnSelect(handler: () => void) {
    this.domElement?.addEventListener('click', () => handler())
  }

  private getStateClassName(state = this.state): string {
    switch (state) {
      case CharacterState.Error:
        return 'btn-danger'
      case CharacterState.Success:
        return 'btn-success'
      case CharacterState.Default:
      default:
        return 'btn-primary'
    }
  }

  private render() {
    const div = document.createElement('div')
    div.classList.add('btn', this.getStateClassName(), 'mx-1', 'my-1')
    div.style.width = '2.4em'
    div.style.height = '2.4em'
    div.textContent = this.character
    return div
  }
}
