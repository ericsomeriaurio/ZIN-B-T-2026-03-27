import { addResponse, deleteResponse, listResponses } from "../../lib/store.js";

async function isGroupAdmin(sock, jid, participantJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch { return false; }
}

export default {
  commands: ["addresp", "delresp", "listresp"],
  description: "Gestão do auto-responder por grupo",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();

    if (!m.isGroup) return m.reply("❌ Este comando só funciona em grupos.");
    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins podem usar este comando.");

    // ── .addresp palavra | resposta ────────────────────────────────────────
    if (cmd === "addresp") {
      const full = args.join(" ");
      const sep = full.indexOf("|");
      if (sep === -1) {
        return m.reply(
          `❌ *Formato inválido*\n` +
          `┃\n` +
          `┃  Use: .addresp palavra | resposta\n` +
          `┃  Ex:  .addresp oi | Olá! 👋\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      const keyword = full.slice(0, sep).trim().toLowerCase();
      const response = full.slice(sep + 1).trim();
      if (!keyword || !response) {
        return m.reply("❌ Palavra-chave e resposta não podem estar vazias.");
      }
      addResponse(m.jid, keyword, { type: "text", content: response });
      return m.reply(
        `✅ *Auto-Responder Adicionado*\n` +
        `┃\n` +
        `┃  🔑 Palavra: *${keyword}*\n` +
        `┃  💬 Resposta: ${response}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ── .delresp palavra ───────────────────────────────────────────────────
    if (cmd === "delresp") {
      const keyword = args.join(" ").trim().toLowerCase();
      if (!keyword) {
        return m.reply(
          `❌ *Formato inválido*\n` +
          `┃\n` +
          `┃  Use: .delresp palavra\n` +
          `┃  Ex:  .delresp oi\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      const responses = listResponses(m.jid);
      if (!responses[keyword]) {
        return m.reply(
          `❌ *Palavra-chave não encontrada*\n` +
          `┃\n` +
          `┃  "${keyword}" não existe neste grupo.\n` +
          `┃  Use .listresp para ver as activas.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      deleteResponse(m.jid, keyword);
      return m.reply(
        `🗑️ *Auto-Responder Removido*\n` +
        `┃\n` +
        `┃  🔑 Palavra: *${keyword}*\n` +
        `┃  removida com sucesso.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ── .listresp ──────────────────────────────────────────────────────────
    if (cmd === "listresp") {
      const responses = listResponses(m.jid);
      const keys = Object.keys(responses);
      if (!keys.length) {
        return m.reply(
          `📋 *Auto-Responder*\n` +
          `┃\n` +
          `┃  Nenhuma resposta configurada\n` +
          `┃  neste grupo ainda.\n` +
          `┃\n` +
          `┃  Use .addresp para adicionar.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      let list =
        `📋 *Auto-Responder*\n` +
        `┃\n` +
        `┃  Total: ${keys.length} palavra(s)\n` +
        `┃\n`;
      keys.forEach((k, i) => {
        const r = responses[k];
        list += `┃  ${i + 1}. *${k}* ➜ ${r.content ?? r.type}\n`;
      });
      list += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
      return m.reply(list);
    }
  },
};
