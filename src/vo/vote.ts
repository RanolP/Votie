import { User } from 'node-telegram-bot-api'
import { bot } from '../bot'
import { data } from '../data'
import { deserialize, serialize } from '../serialize'
import { VoteCreateState } from './voteCreateState'

export class Vote {
  public static create(user: User, voteCreateState: VoteCreateState): Vote {
    const answers = new Map()
    for (const answer of voteCreateState.answers) {
      answers.set(answer, new Set())
    }
    return new Vote(
      user.id,
      voteCreateState.title,
      answers,
      voteCreateState.type,
      voteCreateState.target
    )
  }
  public owner: number
  public title: string
  public answers: Map<string, Set<number>> = new Map()
  public type: VoteType
  public target: number

  constructor(
    owner: number,
    title: string,
    answers: Map<string, Set<number>>,
    type: VoteType,
    target: number
  ) {
    this.owner = owner
    this.title = title
    this.answers = answers
    this.type = type
    this.target = target
  }

  public async makeInformation(): Promise<{
    answers: Map<string, Set<number>>
    restricts: number[]
  }> {
    if (!this.target) {
      return {
        answers: this.answers,
        restricts: []
      }
    }
    const answers = new Map<string, Set<number>>()
    const restricts = []
    for (const [key, values] of this.answers.entries()) {
      answers.set(key, new Set())
      for (const value of values) {
        try {
          const member = await bot.getChatMember(this.target, '' + value)
          switch (member.status) {
            case 'administrator':
            case 'creator':
            case 'member':
              answers.get(key).add(value)
              break
            default:
              restricts.push(value)
              break
          }
        } catch {
          restricts.push(value)
        }
      }
    }
    return { answers, restricts }
  }

  public getId(): number | null {
    const iterator = data.voteStorage.entries()
    let entry = iterator.next()
    while (!entry.done) {
      if (entry.value[1] === this) {
        return entry.value[0]
      }
      entry = iterator.next()
    }
    return null
  }
}

export enum VoteType {
  PUBLIC = '기명/공개',
  NAMED = '기명/비공개',
  ANONYMOUS = '익명'
}

export const VoteMapper = {
  check: value => value instanceof Vote,
  deserialize: object => {
    if (
      typeof object.owner !== 'number' ||
      typeof object.title !== 'string' ||
      object.answers instanceof Object === false ||
      typeof object.type !== 'string'
    ) {
      return null
    }
    return new Vote(
      object.owner,
      object.title,
      deserialize(object.answers),
      object.type,
      object.target
    )
  },
  serialize: value => {
    return {
      answers: serialize(value.answers),
      owner: value.owner,
      target: value.target,
      title: value.title,
      type: value.type
    }
  },
  toString: () => 'Mapper(Vote)'
}
