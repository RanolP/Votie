import {
  InlineKeyboardButton,
  InlineQuery,
  InlineQueryResultArticle
} from 'node-telegram-bot-api'
import { bot } from '../bot'
import { data } from '../data'
import { getChat } from '../util/chat'
import { voteReplyMarkup, voteText } from '../util/voteText'
import { VoteCreateStage } from '../vo/voteCreateState'

export function initializeInlineQuery() {
  bot.on('inline_query', onInlineQuery)
}

async function onInlineQuery(msg: InlineQuery) {
  if (msg.query.length === 0) {
    await newVote(msg)
  } else if (msg.query.match(/^\s*\d+\s*$/)) {
    await getVote(msg)
  }
}

async function newVote(msg: InlineQuery) {
  const state = data.voteCreationStorage.get(msg.from.id)
  if (state && state.stage > VoteCreateStage.NONE) {
    await bot.answerInlineQuery(msg.id, [], {
      cache_time: 1,
      switch_pm_parameter: 'old_vote',
      switch_pm_text: '투표 이어서 만들기'
    })
  } else {
    await bot.answerInlineQuery(msg.id, [], {
      cache_time: 1,
      switch_pm_parameter: 'new_vote',
      switch_pm_text: '새 투표'
    })
  }
}

async function getVote(msg: InlineQuery) {
  const id = parseInt(msg.query.trim(), 10)
  const vote = data.voteStorage.get(id)
  if (!vote || vote.owner !== msg.from.id) {
    const state = data.voteCreationStorage.get(msg.from.id)
    if (state && state.stage > VoteCreateStage.NONE) {
      await bot.answerInlineQuery(msg.id, [], {
        cache_time: 1,
        switch_pm_parameter: 'old_vote',
        switch_pm_text: '투표 없음, 이어서 투표를 만들까요?'
      })
    } else {
      await bot.answerInlineQuery(msg.id, [], {
        cache_time: 1,
        switch_pm_parameter: 'new_vote',
        switch_pm_text: '투표 없음, 새 투표를 만들까요?'
      })
    }
    return
  }
  await bot.answerInlineQuery(
    msg.id,
    [
      {
        description: `🗳 ${id} '${vote.title}'`,
        hide_url: true,
        id: `recent_${msg.query}`,
        input_message_content: {
          message_text: await voteText(vote),
          parse_mode: 'HTML'
        },
        reply_markup: voteReplyMarkup(vote),
        title: '투표 꺼내기',
        type: 'article'
      } as InlineQueryResultArticle
    ],
    {
      cache_time: 1
    }
  )
}
