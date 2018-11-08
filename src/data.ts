import fs from 'fs'
import { deserialize, serialize } from './serialize'
import { Vote } from './vo/vote'
import { VoteCreateState } from './vo/voteCreateState'

const path = `${__dirname}/../data.json`

export let data = {
  lastId: 0,
  voteCreationStorage: new Map<number, VoteCreateState>(),
  voteStorage: new Map<number, Vote>()
}

export function loadBotData() {
  if (!fs.existsSync(path)) {
    return
  }
  const parsed = JSON.parse(fs.readFileSync(path, { encoding: 'UTF-8' }))
  const voteCreationStorage = deserialize(parsed['vote-creation-storage'])
  if (voteCreationStorage instanceof Map) {
    for (const key of voteCreationStorage.keys()) {
      data.voteCreationStorage.set(
        parseInt(key, 10),
        voteCreationStorage.get(key)
      )
    }
  }
  const voteStorage = deserialize(parsed['vote-storage'])
  if (voteStorage instanceof Map) {
    for (const key of voteStorage.keys()) {
      data.voteStorage.set(parseInt(key, 10), voteStorage.get(key))
    }
  }
  const lastId = parsed['last-id']
  if (typeof lastId === 'number') {
    data.lastId = lastId
  }
}

export function saveBotData() {
  fs.writeFileSync(
    path,
    JSON.stringify({
      'last-id': data.lastId,
      'vote-creation-storage': serialize(data.voteCreationStorage),
      'vote-storage': serialize(data.voteStorage)
    })
  )
}
