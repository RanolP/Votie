import { Message } from 'node-telegram-bot-api'

import { bot } from '../bot'
import { ICommand } from './command'

export const HelpCommand: ICommand = {
  execute: async (msg: Message, args: string[]) => {
    await bot.sendMessage(
      msg.chat.id,
      [
        '🗳 안녕하세요! 투표 봇 Votie에요. 저는 이런 명령어를 갖고 있어요.',
        '',
        '/help - 이 도움말을 띄워요.',
        '/new - 새 투표를 만들어요.',
        '/cancel - 작업을 취소해요.',
        '/publish [대상 공개 그룹] - 투표를 공개해요. 대상 공개 그룹을 지정했다면 해당 그룹 사용자만 투표할 수 있어요.',
        '/myvote - 내 투표를 관리해요. (TODO)'
      ].join('\n')
    )
  },
  label: 'help'
}
