import { setGroup } from "../../lib/store.js";

async function isGroupAdmin(sock, jid, participantJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch { return false; }
}

export default {
  commands: ["somenteadmins", "apenasadmins"],
  description: "Apenas admins podem falar no grupo",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    if (!m.isGroup) return m.reply("❌ Este comando só funciona em grupos.");
    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins podem usar este comando.");

    const val = args[0]?.toLowerCase();
    if (!val || !["on", "off"].includes(val)) {
      return m.reply("❌ Use: .somenteadmins on | .somenteadmins off");
    }

    setGroup(m.jid, "somenteAdmins", val === "on");
    const status = val === "on" ? "✅ Activado" : "❌ Desactivado";

    await m.reply(
      `🔒 *Somente Admins*\n` +
      `┃\n` +
      `┃  Status: ${status}\n` +
      `┃  Apenas admins podem\n` +
      `┃  enviar mensagens.\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  },
};
