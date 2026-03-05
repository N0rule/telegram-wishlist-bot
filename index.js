require('dotenv').config()
const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Привет!'))
bot.help((ctx) => ctx.reply('Send me any text.'))

bot.on('text', (ctx) => ctx.reply(`ТЫ сказал: ${ctx.message.text}`))

bot.launch()
console.log('Bot is running...')