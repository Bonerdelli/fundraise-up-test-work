import { Letter, OnSelectLetter, LetterState } from '../../types'

export class LetterDomRenderer implements Letter {
  private state: LetterState
  private keyValue?: string
  private character: string
  private domElement: Element

  constructor(character: string, state?: LetterState) {
    this.character = character
    this.state = state ?? LetterState.Default
    this.domElement = this.createElement()
  }

  public get instance() {
    return this.domElement
  }

  public get key() {
    return this.keyValue || ''
  }

  public set key(value: string) {
    this.keyValue = value
  }

  public setState(state: LetterState) {
    const prevClassName = this.getStateClassName()
    const className = this.getStateClassName(state)
    if (prevClassName !== className) {
      this.domElement.classList.add(className)
      this.domElement.classList.remove(prevClassName)
    }
    this.state = state
  }

  public setOnSelect(handler: OnSelectLetter) {
    this.domElement?.addEventListener('click', () =>
      handler(this.character, this.key, this as Letter),
    )
  }

  private getStateClassName(state = this.state): string {
    switch (state) {
      case LetterState.Error:
        return 'btn-danger'
      case LetterState.Success:
        return 'btn-success'
      case LetterState.Default:
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
