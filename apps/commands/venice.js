import axios from 'axios';

export const meta = {
  name: 'venice',
  version: '1.0.0',
  aliases: ['v', 'askvenice'],
  description: 'Chat with Venice Uncensored 1.1 AI assistant',
  author: 'AjiroDesu',
  prefix: 'both',
  category: 'AI',
  type: 'anyone',
  cooldown: 3,
  guide: ['<question>']
};

export async function onStart({ bot, msg, args, response, usages }) {
  if (!args.length) {
    return await usages();
  }

  const query = args.join(' ');
  const loadingMsg = await response.reply(`🤖 Asking *Venice* about: *${query}*...`, { parse_mode: 'Markdown' });

  try {
    const res = await axios.get(`${global.api.nekolabs}/ai/venice?text=${encodeURIComponent(query)}`, { timeout: 15000 });
    const data = res.data;

    if (!data?.success || !data?.result) {
      try {
        await bot.editMessageText('❌ Failed to get a response from Venice. Please try again later.', {
          chat_id: msg.chat.id,
          message_id: loadingMsg.message_id,
          parse_mode: 'Markdown'
        });
      } catch (e) {
        try { await bot.deleteMessage(msg.chat.id, loadingMsg.message_id); } catch {}
        await response.reply('❌ Failed to get a response from Venice. Please try again later.', { parse_mode: 'Markdown' });
      }
      return;
    }

    const replyText = `\n\n${data.result}`;

    // Delete the loading message before sending the final answer
    try { await bot.deleteMessage(msg.chat.id, loadingMsg.message_id); } catch {}

    await response.reply(replyText, { parse_mode: 'Markdown' });

  } catch (error) {
    const errText = error?.response?.status
      ? `⚠️ API error: received status ${error.response.status}`
      : `⚠️ An error occurred: ${error.message}`;

    try {
      await bot.editMessageText(errText, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      });
    } catch (e) {
      try { await bot.deleteMessage(msg.chat.id, loadingMsg.message_id); } catch {}
      await response.reply(errText, { parse_mode: 'Markdown' });
    }
  }
}
