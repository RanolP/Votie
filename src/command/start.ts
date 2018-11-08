import { Message } from 'node-telegram-bot-api'

import { bot } from '../bot'
import { data } from '../data'
import { VoteCreateStage } from '../vo/voteCreateState'
import { ICommand } from './command'
import { createNewVote, useOldVote } from './common'
import { HelpCommand } from './help'

export const StartCommand: ICommand = {
  execute: async (msg: Message, args: string[]) => {
    if (args[0] === 'new_vote') {
      createNewVote(msg)
    } else if (args[0] === 'old_vote') {
      const state = data.voteCreationStorage.get(msg.chat.id)
      await bot.sendMessage(
        msg.chat.id,
        [
          state.stage !== VoteCreateStage.ANSWER_ACCEPTABLE
            ? '이전에 만드시던 투표에요.'
            : '이전에 만드신 투표에요.',
          '',
          ' 주제 :',
          `  ${state.title}`,
          ' 유형 :',
          `  ${state.type}`
        ].join('\n') +
          (state.target
            ? await (async () => {
                const chat = await bot.getChat(state.target)
                if (!chat) {
                  return ''
                } else {
                  return chat.username ? ` 대상 :\n  ${chat.username}` : ''
                }
              })()
            : '') +
          (state.answers.length > 0
            ? '\n 답변 :\n  ' + state.answers.join('\n  ')
            : '')
      )
      useOldVote(state, msg)
    } else {
      HelpCommand.execute(msg, [])
    }
  },
  label: 'start'
}
