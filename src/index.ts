import words from './words.json'

import { VocabularyTrainer } from './VocabularyTrainer/Application'
import { ApplicationDomRenderer } from './VocabularyTrainer/Renderers/DomRenderer'
import { WORDS_IN_GAME } from './VocabularyTrainer/config'

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
