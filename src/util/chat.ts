import { Chat } from 'node-telegram-bot-api'
import { bot } from '../bot'

const chatCache = {}

export async function getChat(id: string | number): Promise<Chat | null> {
  if (!chatCache[id]) {
    try {
      chatCache[id] = bot.getChat(id)
    } catch {
      // ignore them all
    }
  }
  return chatCache[id]
}
