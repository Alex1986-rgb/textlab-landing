// Serverless-функция Vercel: принимает заявку с сайта и шлёт в Telegram.
// Настрой в Vercel → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
//   TELEGRAM_CHAT_ID    — твой chat_id (узнать: напиши боту, открой
//                         https://api.telegram.org/bot<TOKEN>/getUpdates)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram credentials not configured' });
  }

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const esc = (s) => String(s ?? '—').slice(0, 500);

    const text =
      `🆕 *Заявка с сайта ТекстЛаб*\n` +
      `👤 ${esc(b.name)}\n` +
      `📞 ${esc(b.contact)}\n` +
      `📝 ${esc(b.direction)}, ${esc(b.volume)}, ${esc(b.speed)}\n` +
      `💰 ~${esc(b.estimate)}\n` +
      `🔗 ${esc(b.page)}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });

    if (!tg.ok) {
      const detail = await tg.text();
      return res.status(502).json({ ok: false, error: 'Telegram API error', detail });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'Bad request', detail: String(e) });
  }
}
