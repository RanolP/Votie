import { Message } from 'node-telegram-bot-api'

export interface ICommand {
  label: string
  execute(message: Message, args: string[])
}
