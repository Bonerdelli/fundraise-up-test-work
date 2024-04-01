import words from './words.json'

import { VocabularyTrainer } from './VocabularyTrainer/Application'
import { ApplicationDomRenderer } from './VocabularyTrainer/Renderers/DomRenderer'

// TODO: make config
export const MAX_ERRORS_COUNT_PER_ROUND = 3
export const WORDS_IN_GAME = 3

function run() {
  const renderer = new ApplicationDomRenderer()
  const application = new VocabularyTrainer({
    words,
    wordsInGame: WORDS_IN_GAME,
    renderer,
  })
  application.runNewGame()
}

run()
