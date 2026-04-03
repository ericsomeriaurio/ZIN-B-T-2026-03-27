import { isGroupAdmin, isBotAdmin } from "../../lib/helpers.js";

export default {
  commands: ["clearchat", "limpar", "del", "delete", "clear"],
  description: "Apaga mensagens do grupo",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();

    if (!m.isGroup) return m.reply("❌ Este comando só funciona em grupos.");

    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins podem usar este comando.");

    // .del / .delete / .clear — apaga mensagem respondida silenciosamente
    if (["del", "delete", "clear"].includes(cmd)) {
      if (!m.quoted) return;
      await client.sendMessage(m.jid, { delete: m.quoted.key }).catch(() => {});
      await client.sendMessage(m.jid, { delete: m.key }).catch(() => {});
      return;
    }

    const botAdmin = await isBotAdmin(sock, m.jid);
    if (!botAdmin) return m.reply("❌ Preciso ser admin do grupo para apagar mensagens.");

    const val = args[0]?.toLowerCase();

    // .clearchat all — apaga todas (até 100)
    if (val === "all" || val === "tudo") {
      await m.reply(
        `🗑️ *Limpar Chat*\n` +
        `┃\n` +
        `┃  Apagando todas as mensagens...\n` +
        `┃  Aguarde.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
      try {
        await client.chatModify({ clear: { messages: false } }, m.jid);
        await m.reply(
          `✅ *Chat Limpo*\n` +
          `┃\n` +
          `┃  Todas as mensagens foram\n` +
          `┃  apagadas com sucesso.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      } catch {
        await m.reply("❌ Não foi possível limpar o chat completo.");
      }
      return;
    }

    // .clearchat N — apaga as últimas N mensagens
    const n = parseInt(val);
    if (isNaN(n) || n < 1 || n > 100) {
      return m.reply(
        `❌ *Formato inválido*\n` +
        `┃\n` +
        `┃  Use: .clearchat <número>\n` +
        `┃  Ex:  .clearchat 10\n` +
        `┃  Ou:  .clearchat all (apaga tudo)\n` +
        `┃  Máximo: 100 mensagens\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    await m.reply(
      `🗑️ *Limpar Chat*\n` +
      `┃\n` +
      `┃  Apagando últimas *${n}* mensagens...\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );

    try {
      const messages = await client.fetchMessagesFromWA(m.jid, n).catch(() => null);
      if (!messages || messages.length === 0) {
        return m.reply("❌ Não foi possível obter as mensagens.");
      }
      let deleted = 0;
      for (const msg of messages) {
        if (!msg.key) continue;
        await client.sendMessage(m.jid, { delete: msg.key }).catch(() => {});
        deleted++;
        await new Promise((r) => setTimeout(r, 300));
      }
      await m.reply(
        `✅ *Chat Limpo*\n` +
        `┃\n` +
        `┃  *${deleted}* mensagens apagadas.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    } catch (err) {
      await m.reply("❌ Erro ao apagar mensagens: " + err.message);
    }
  },
};
