import { VoteCreateStage, VoteCreateState } from '../vo/voteCreateState'

import { Message } from 'node-telegram-bot-api'

import { bot } from '../bot'
import { data, saveBotData } from '../data'

export async function useOldVote(state: VoteCreateState, msg: Message) {
  if (state.stage === VoteCreateStage.ANSWER_ACCEPTABLE) {
    await bot.sendMessage(
      msg.chat.id,
      `🔗 이어서 만드시려면 제게 답변을 보내주시고, 공개하려면 /publish [대상 공개 그룹] 를, 취소하시려면 /cancel 을 보내주세요!`
    )
  } else {
    await bot.sendMessage(
      msg.chat.id,
      `🔗 이어서 만드시려면 제게 답변을 보내주시고, 취소하시려면 /cancel 을 보내주세요!`
    )
  }
}

export async function createNewVote(msg: Message) {
  const state =
    data.voteCreationStorage.get(msg.chat.id) || new VoteCreateState()

  if (!data.voteCreationStorage.has(msg.chat.id)) {
    data.voteCreationStorage.set(msg.chat.id, state)
  }

  const ok = state.stage <= VoteCreateStage.TITLE_REQUIRED
  if (!ok) {
    await bot.sendMessage(
      msg.chat.id,
      `❗️ 이전에 만드시던 투표가 있어요.\n\n 주제 :\n  ${
        state.title
      }\n 유형 :\n  ${state.type}${
        state.answers && state.answers.length > 0
          ? '\n 답변 :\n  ' + state.answers.join('\n  ')
          : ''
      }`
    )
    useOldVote(state, msg)
    return
  }
  state.stage = VoteCreateStage.TITLE_REQUIRED
  bot.sendMessage(
    msg.chat.id,
    '🗳 안녕하세요! 새 투표를 만드시려는 거죠?\n\n투표 주제를 제게 말씀해주시겠어요?'
  )
  saveBotData()
}
