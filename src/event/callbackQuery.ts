import { CallbackQuery } from 'node-telegram-bot-api'
import { bot } from '../bot'
import { data, saveBotData } from '../data'
import { voteReplyMarkup, voteText } from '../util/voteText'

export function initializeCallbackQuery() {
  bot.on('callback_query', onCallbackQuery)
}

async function onCallbackQuery(msg: CallbackQuery) {
  console.log(msg)
  let parsed
  try {
    parsed = JSON.parse(msg.data)
  } catch {
    await bot.answerCallbackQuery(msg.id, {
      cache_time: 1,
      text: '잘못된 투표입니다.'
    })
    return
  }
  const vote = data.voteStorage.get(parsed.id)
  if (!vote) {
    await bot.answerCallbackQuery(msg.id, {
      cache_time: 1,
      text: '잘못된 투표입니다.'
    })
    return
  }
  let move = null
  for (const key of vote.answers.keys()) {
    const value = vote.answers.get(key)
    if (value.has(msg.from.id)) {
      move = key
    }
    value.delete(msg.from.id)
  }
  vote.answers.get(parsed.chosen).add(msg.from.id)
  saveBotData()

  await bot.answerCallbackQuery(msg.id, {
    cache_time: 1,
    show_alert: true,
    text: move
      ? move !== parsed.chosen
        ? `'${move}'에서 '${parsed.chosen}'(으)로 표를 옮겼습니다`
        : `이미 '${move}'에 투표하셨습니다.`
      : `'${parsed.chosen}'에 투표했습니다.`
  })
  await bot.editMessageText(await voteText(vote), {
    inline_message_id: msg.inline_message_id,
    parse_mode: 'HTML',
    reply_markup: voteReplyMarkup(vote)
  })
}
