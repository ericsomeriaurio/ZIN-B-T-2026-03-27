import { setGroup, getGroup } from "../../lib/store.js";

async function isGroupAdmin(sock, jid, participantJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch { return false; }
}

export default {
  commands: ["aviso", "setaviso", "aviso"],
  description: "Envia ou configura aviso do grupo",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();

    if (!m.isGroup) return m.reply("❌ Este comando só funciona em grupos.");
    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins podem usar este comando.");

    // ── .setaviso texto ────────────────────────────────────────────────────
    if (cmd === "setaviso") {
      const texto = args.join(" ").trim();
      if (!texto) {
        return m.reply(
          `❌ *Formato inválido*\n` +
          `┃\n` +
          `┃  Use: .setaviso <mensagem>\n` +
          `┃  Ex:  .setaviso Proibido spam!\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      setGroup(m.jid, "avisoMsg", texto);
      return m.reply(
        `✅ *Aviso Configurado*\n` +
        `┃\n` +
        `┃  Use .aviso para enviá-lo.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ── .aviso [texto opcional] ────────────────────────────────────────────
    if (cmd === "aviso") {
      const cfg = getGroup(m.jid);
      // Prioridade: texto do comando > aviso guardado no grupo
      const texto = args.join(" ").trim() || cfg.avisoMsg;

      if (!texto) {
        return m.reply(
          `❌ *Sem aviso configurado*\n` +
          `┃\n` +
          `┃  Use .aviso <mensagem> para enviar\n` +
          `┃  ou .setaviso <mensagem> para guardar.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      // Busca todos os participantes para mencionar
      let mentions = [];
      try {
        const meta = await sock.groupMetadata(m.jid);
        mentions = meta.participants.map((p) => p.id);
      } catch {}

      const msg =
        `📢 *AVISO DO GRUPO*\n` +
        `┃\n` +
        `┃  ${texto}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

      await client.sendMessage(m.jid, { text: msg, mentions });
    }
  },
};
