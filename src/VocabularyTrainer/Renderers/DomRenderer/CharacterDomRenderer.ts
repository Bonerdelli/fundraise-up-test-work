import { Character, CharacterOnSelect, CharacterState } from '../../types'

export class CharacterDomRenderer implements Character {
  public state: CharacterState
  private character: string
  private index = 0

  private domElement: Element
  // private listeners: EventListener[] = []

  constructor(character: string, state?: CharacterState, index?: number) {
    this.character = character
    this.state = state ?? CharacterState.Default
    this.index = index ?? 0
    this.domElement = this.createElement()
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

  public setOnSelect(handler: CharacterOnSelect) {
    this.domElement?.addEventListener('click', () =>
      handler(this.character, this.index, this as Character),
    )
    // this.listeners.push(listener)
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

  private createElement() {
    const div = document.createElement('div')
    div.classList.add('btn', this.getStateClassName(), 'mx-1', 'my-1')
    div.style.width = '2.4em'
    div.style.height = '2.4em'
    div.textContent = this.character
    return div
  }
}
