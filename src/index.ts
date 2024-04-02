import appJson from '../package.json'
import words from './words.json'

import { VocabularyTrainer } from './VocabularyTrainer/Application'
import { ApplicationDomRenderer } from './VocabularyTrainer/Renderers/DomRenderer'
import { LocalStorage } from './VocabularyTrainer/Storages/LocalStorage'

import { GAME_ROUNDS_NUMBER } from './VocabularyTrainer/config'

function run() {
  const storageKeyPrefix = `${appJson.name}-${appJson.version}-`
  const storage = new LocalStorage(storageKeyPrefix)
  const renderer = new ApplicationDomRenderer()
  const application = new VocabularyTrainer({
    words,
    gameRounds: GAME_ROUNDS_NUMBER,
    renderer,
    storage,
  })
  application.runNewGame()
}

run()
