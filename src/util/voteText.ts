import * as Bluebird from 'bluebird'
import { InlineKeyboardMarkup } from 'node-telegram-bot-api'
import { bot } from '../bot'
import { Vote, VoteType } from '../vo/vote'
import { getChat } from './chat'

export async function voteText(vote: Vote): Promise<string> {
  const data = await vote.makeInformation()
  return [
    `🗳 Votie | (${vote.type}) | <b>${vote.title}</b>`,
    vote.target
      ? '\n@' + (await getChat(vote.target)).username + ' 참가자만 투표 가능'
      : '\b',
    '',
    (await Bluebird.Promise.map([...data.answers.entries()], async value => {
      let base = `${value[0]} : ${value[1].size}표`

      if (vote.type === VoteType.PUBLIC) {
        for (const userId of value[1].values()) {
          const user = await bot.getChat(userId)
          if (user.username) {
            base += ' @' + user.username
          } else {
            if (user.first_name) {
              base += ` <a href="tg://user?id=${userId}">${user.first_name} ${
                user.last_name
              }</a>`
            } else {
              base += ` <a href="tg://user?id=${userId}">${user.last_name}</a>`
            }
          }
        }
      }

      return base
    })).join('\n'),
    data.restricts.length > 0
      ? `${data.restricts.length}명의 외부인이 투표를 했습니다.`
      : '\b'
  ]
    .filter(it => it !== '\b')
    .join('\n')
}

export function voteReplyMarkup(vote: Vote): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [...vote.answers.keys()].map(key => {
        return {
          callback_data: JSON.stringify({
            chosen: key,
            id: vote.getId()
          }),
          text: key
        }
      })
    ]
  }
}
