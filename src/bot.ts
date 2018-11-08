import 'bluebird'
import TelegramBot from 'node-telegram-bot-api'
import { loadBotData } from './data'
import { initializeCallbackQuery } from './event/callbackQuery'
import { initializeInlineQuery } from './event/inlineQuery'
import { initializeMessage } from './event/message'
import { registerType } from './serialize'
import { VoteMapper } from './vo/vote'
import { VoteCreateStateMapper } from './vo/voteCreateState'

// tslint:disable-next-line:no-var-requires
require('dotenv').config()

registerType(VoteMapper)
registerType(VoteCreateStateMapper)

loadBotData()

const token = process.env.token || ''
export const bot = new TelegramBot(token, { polling: true })

initializeInlineQuery()
initializeMessage()
initializeCallbackQuery()
