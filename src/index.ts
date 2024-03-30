import words from './words.json'

function getRandomWord() {
  const index = Math.floor(Math.random() * words.length)
  return words[index]
}

function createButton(letter: string): Element {
  // const host = document.body
  // const shadow = host.attachShadow({ mode: 'open' })
  const div = document.createElement('div')
  div.classList.add('btn', 'btn-primary', 'mx-1', 'my-1')
  div.style.width = '2.4em'
  div.style.height = '2.4em'
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

  const testWord1 = getRandomWord()
  const testWord2 = getRandomWord()

  for (const char of testWord1) {
    const testButton = createButton(char)
    answerEl.appendChild(testButton)
  }

  for (const char of testWord2) {
    const testButton = createButton(char)
    lettersEl.appendChild(testButton)
  }
}

testInit()
