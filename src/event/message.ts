import { Message } from 'node-telegram-bot-api'

import { bot } from '../bot'
import { ICommand } from '../command/command'
import { createNewVote } from '../command/common'
import { HelpCommand } from '../command/help'
import { StartCommand } from '../command/start'
import { data, saveBotData } from '../data'
import { getChat } from '../util/chat'
import { Vote, VoteType } from '../vo/vote'
import { VoteCreateStage, VoteCreateState } from '../vo/voteCreateState'

export function initializeMessage() {
  bot.on('message', onMessage)
  registerCommand(HelpCommand)
  registerCommand(StartCommand)
}

const commands: Map<string, ICommand> = new Map()

function registerCommand(command: ICommand) {
  commands.set(command.label, command)
}

async function onMessage(msg: Message) {
  if (msg.chat.type !== 'private') {
    return
  }

  const text = msg.text

  if (text === null) {
    return
  }

  if (text[0] === '/') {
    const args = text.substring(1).split(' ')
    const label = args.shift()
    const command = commands.get(label)
    if (command) {
      command.execute(msg, args)
    } else {
      switch (label) {
        case 'new':
          createNewVote(msg)
          break
        case 'cancel':
          cancel(msg)
          break
        case 'publish':
          console.log(args)
          publish(msg, args.length > 0 ? args[0] : null)
          break
        default:
          await bot.sendMessage(
            msg.chat.id,
            `❌ 알 수 없는 명령이에요. /help 로 저에 대해 알아보세요.`
          )
          break
      }
    }
  } else {
    processText(msg.text, msg)
  }
}

async function cancel(msg: Message) {
  const state = data.voteCreationStorage.get(msg.chat.id)
  if (state != null && state.stage !== VoteCreateStage.NONE) {
    await bot.sendMessage(
      msg.chat.id,
      `❌ 투표 제작을 취소했어요.${
        state.title != null
          ? `\n\n 주제 :\n  ${state.title}\n 유형 :\n  ${state.type}${
              state.answers.length > 0
                ? '\n 답변 :\n  ' + state.answers.join('\n  ')
                : ''
            }`
          : ''
      }`
    )
    data.voteCreationStorage.set(msg.chat.id, new VoteCreateState())
    saveBotData()
  } else {
    await bot.sendMessage(msg.chat.id, `❌ 제작 중이던 투표가 없어요.`)
  }
}

async function publish(msg: Message, group: string | null) {
  const state = data.voteCreationStorage.get(msg.chat.id)

  if (state === null || state.stage !== VoteCreateStage.ANSWER_ACCEPTABLE) {
    if (state && state.stage >= VoteCreateStage.NONE) {
      await bot.sendMessage(msg.chat.id, `❌ 투표 제작을 끝마쳐주세요.`)
    } else {
      await bot.sendMessage(msg.chat.id, `❌ 만든 투표가 없어요.`)
    }
    return
  }

  if (group) {
    let chat = null
    try {
      chat = await getChat(group)
    } catch {
      // ignore
    }
    if (!chat) {
      await bot.sendMessage(
        msg.chat.id,
        `❌ 공개 그룹 ${group} 을 찾을 수 없어요. 다시 한 번 확인해보세요.`
      )
      return
    }
    state.target = chat.id
  }

  data.voteCreationStorage.delete(msg.chat.id)

  data.voteStorage.set(state.id, Vote.create(msg.from, state))

  saveBotData()

  await bot.sendMessage(
    msg.chat.id,
    `아래 버튼을 눌러서 투표 ${state.title}을 공개해요.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              switch_inline_query: `${state.id}`,
              text: '공개'
            }
          ]
        ]
      }
    }
  )
}

async function processText(text: string, msg: Message) {
  const state = data.voteCreationStorage.get(msg.chat.id)

  if (!state) {
    return
  }

  if (state.stage === VoteCreateStage.TITLE_REQUIRED) {
    state.title = text
    state.stage = VoteCreateStage.TYPE_REQUIRED
    saveBotData()
    await bot.sendMessage(
      msg.chat.id,
      `✅ 투표 주제를 '${text}'로 설정했어요\n\n투표 유형을 말씀해주시겠어요?`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: '기명/공개'
              },
              {
                text: '기명/비공개'
              },
              {
                text: '익명'
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    )
  } else if (state.stage === VoteCreateStage.TYPE_REQUIRED) {
    switch (text) {
      case '기명/공개':
        state.type = VoteType.PUBLIC
        break
      case '기명/비공개':
        state.type = VoteType.NAMED
        break
      case '익명':
        state.type = VoteType.ANONYMOUS
        break
      default:
        await bot.sendMessage(
          msg.chat.id,
          '💠 투표 유형은 `기명/공개`, `기명/비공개`, `익명` 이 있어요.',
          {
            parse_mode: 'Markdown'
          }
        )
        return
    }
    state.stage = VoteCreateStage.ANSWER_REQUIRED
    saveBotData()
    await bot.sendMessage(
      msg.chat.id,
      `✅ 투표 유형을 '${text}'로 설정했어요\n\n답변을 두 가지 이상 제게 말씀해주시겠어요?`
    )
  } else if (state.stage === VoteCreateStage.ANSWER_REQUIRED) {
    state.answers.push(text)
    saveBotData()
    if (state.answers.length < 2) {
      await bot.sendMessage(
        msg.chat.id,
        `✅ 투표 답변 '${text}'(을)를 추가했어요.\n\n답변을 두 가지 이상 제게 말씀해주시겠어요?`
      )
    } else {
      state.stage = VoteCreateStage.ANSWER_ACCEPTABLE
      saveBotData()
      await bot.sendMessage(
        msg.chat.id,
        `✅ 투표 답변 '${text}'(을)를 추가했어요.\n\n/publish [대상 공개 그룹] 로 공개하거나 답변을 더 추가할 수 있어요.`
      )
    }
  } else if (state.stage === VoteCreateStage.ANSWER_ACCEPTABLE) {
    state.answers.push(text)
    saveBotData()
    await bot.sendMessage(
      msg.chat.id,
      `✅ 투표 답변 '${text}'(을)를 추가했어요.\n\n/publish [대상 공개 그룹] 로 공개하거나 답변을 더 추가할 수 있어요.`
    )
  }
}
