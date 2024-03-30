import words from './words.json'

import { VocabularyTrainer } from './VocabularyTrainer/Application'
import { ApplicationDomRenderer } from './VocabularyTrainer/Renderers/DomRenderer'

function run() {
  const renderer = new ApplicationDomRenderer()
  const application = new VocabularyTrainer({ renderer, words })
  application.runNewGame()
}

run()
