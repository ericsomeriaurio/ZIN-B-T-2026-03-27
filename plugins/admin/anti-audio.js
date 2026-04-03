import { setGroup, getGroup } from "../../lib/store.js";
import { isOwner } from "../../lib/jid.js";
import { config } from "../../config.js";

async function isGroupAdmin(sock, jid, participantJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch { return false; }
}

export default {
  commands: ["antiaudio"],
  description: "Bloqueia áudios no grupo",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    if (!m.isGroup) return m.reply("❌ Este comando só funciona em grupos.");
    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins podem usar este comando.");

    const val = args[0]?.toLowerCase();
    if (!val || !["on", "off"].includes(val)) {
      return m.reply("❌ Use: .antiaudio on | .antiaudio off | .antiaudio on --ban");
    }

    const banMode = args.includes("--ban");
    setGroup(m.jid, "antiaudio", val === "on");
    setGroup(m.jid, "antiaudioBan", val === "on" ? banMode : false);

    const modo = banMode ? "modo *BAN*" : "modo *ADVERTÊNCIA*";
    const status = val === "on" ? `✅ Activado (${modo})` : "❌ Desactivado";

    await m.reply(
      `🎵 *Anti-Áudio*\n` +
      `┃\n` +
      `┃  Status: ${status}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  },
};
