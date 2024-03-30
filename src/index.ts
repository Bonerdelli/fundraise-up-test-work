function testComponent(): Element {
  const element = document.createElement('div')
  element.innerHTML = 'Hello World!'
  return element
}

function createButton(letter: string): Element {
  // const host = document.body
  // const shadow = host.attachShadow({ mode: 'open' })
  const div = document.createElement('div')
  div.classList.add('btn', 'btn-primary')
  div.textContent = letter
  // shadow.appendChild(div)
  return div
}

function testInit() {
  const currentQuestionEl = document.getElementById('current_question')
  const totalQuestionsEl = document.getElementById('total_questions')
  const answerEl = document.getElementById('answer')
  const lettersEl = document.getElementById('letters')

  if (!currentQuestionEl || !totalQuestionsEl || !answerEl || !lettersEl) {
    throw new Error('Missed required elements')
  }

  currentQuestionEl.innerText = '10'
  totalQuestionsEl.innerText = '100'
  answerEl.innerText = 'jfosie'
  // lettersEl.lettersEl.appendChild()
  // lettersEl.innerText = 'a'

  const testButton = createButton('a')
  lettersEl.appendChild(testButton)
}

document.body.appendChild(testComponent())
testInit()
