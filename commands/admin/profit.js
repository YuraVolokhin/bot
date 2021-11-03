const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Ad, Profit } = require("../../database");
const locale = require("../../locale");

module.exports = async (ctx, id, userId = null) => {
  try {
    const profit = await Profit.findByPk(id, {
      include: [
        {
          association: "writer",
          required: true,
        },
        {
          association: "user",
          required: true,
        },
      ],
    });
    if (!profit)
      return ctx
        .replyOrEdit("❌ Профит не найден", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "◀️ Назад",
                userId ? `admin_user_${userId}_profits_1` : `admin_profits_1`
              ),
            ],
          ]),
        })
        .catch((err) => err);

    var workerAmount = (
        (parseFloat(profit.amount) / 100) *
        parseFloat(ctx.state.bot.payoutPercent)
      ).toFixed(2),
      workerConvertedAmount = (
        (parseFloat(profit.amount) / 100) *
        parseFloat(ctx.state.bot.payoutPercent)
      ).toFixed(2);

    var text = `<b>💰 Профит ${profit.serviceTitle}</b>

🆔 ID: <code>${profit.id}</code>
💸 Сумма: <b>${profit.amount} ${profit.currency} / ${
      profit.convertedAmount
    } RUB</b>
💴 Процент воркера: <b>${workerAmount} ${
      profit.currency
    } / ${workerConvertedAmount} RUB</b>
🚦 Статус: <b>${
      {
        0: locale.newProfit.wait,
        1: locale.newProfit.payed,
        2: locale.newProfit.razvitie,
      }[profit.status]
    }</b>
👨‍💼 Воркер: <b><a href="tg://user?id=${profit.user.id}">${
      profit.user.username
    }</a></b>
✍️ Вбивер: <b><a href="tg://user?id=${profit.writer.id}">${
      profit.writer.username
    }</a></b>
`;

    return ctx
      .replyOrEdit(text, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "👤 Перейти к пользователю",
              `admin_user_${profit.userId}`
            ),
          ],
          [
            Markup.callbackButton(
              "✍️ Перейти к вбиверу",
              `admin_user_${profit.writerId}`
            ),
          ],
          [
            Markup.callbackButton(
              locale.newProfit.wait,
              `admin_${userId ? `user_${userId}_` : ""}profit_${
                profit.id
              }_set_status_wait`
            ),
            Markup.callbackButton(
              locale.newProfit.payed,
              `admin_${userId ? `user_${userId}_` : ""}profit_${
                profit.id
              }_set_status_payed`
            ),
            Markup.callbackButton(
              locale.newProfit.razvitie,
              `admin_${userId ? `user_${userId}_` : ""}profit_${
                profit.id
              }_set_status_razvitie`
            ),
          ],
          [
            Markup.callbackButton(
              `❌ Удалить профит`,
              `admin_${userId ? `user_${userId}_` : ""}profit_${
                profit.id
              }_delete`
            ),
          ],
          [
            Markup.callbackButton(
              "◀️ Назад",
              userId
                ? `admin_user_${profit.userId}_profits_1`
                : `admin_profits_1`
            ),
          ],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
