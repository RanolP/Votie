import { data } from '../data'
import { VoteType } from './vote'

export class VoteCreateState {
  public id: number = makeId()
  public stage: VoteCreateStage = VoteCreateStage.NONE
  public title?: string = null
  public type: VoteType = VoteType.ANONYMOUS
  public target?: number = null
  public answers: string[] = []
}

export enum VoteCreateStage {
  NONE,
  TITLE_REQUIRED,
  TYPE_REQUIRED,
  ANSWER_REQUIRED,
  ANSWER_ACCEPTABLE
}

function makeId(): number {
  return data.lastId++
}

export const VoteCreateStateMapper = {
  check: value => value instanceof VoteCreateState,
  deserialize: object => {
    if (
      typeof object.id !== 'number' ||
      typeof object.stage !== 'number' ||
      object.answers instanceof Array === false ||
      typeof object.type !== 'string'
    ) {
      return null
    }
    console.log(object)
    const result = new VoteCreateState()
    result.answers = object.answers || []
    result.id = object.id
    result.stage = object.stage
    result.target = object.target
    result.title = object.title
    result.type = object.type
    return result
  },
  serialize: value => {
    return {
      answers: value.answers,
      id: value.id,
      stage: value.stage,
      target: value.target,
      title: value.title,
      type: value.type
    }
  },
  toString: () => 'Mapper(VoteCreateState)'
}
