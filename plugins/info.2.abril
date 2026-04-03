import { config } from "../config.js";
import { getLidMap } from "../lib/jid.js";

export default {
  commands: ["info", "botinfo", "about", "myid", "mylid", "addmeowner"],
  description: "Informações sobre o bot",

  async run(client, m, args) {
    const cmd = m.body.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();

    if (cmd === "myid" || cmd === "mylid") {
      const lidMap = getLidMap();
      let lidEntry = "não detectado";
      for (const [lid, phone] of lidMap) {
        if (phone === m.senderNum) { lidEntry = lid; break; }
      }
      return m.reply(
        "🪪 *Seus IDs*\n\n" +
        "📞 *Número:* " + m.senderNum + "\n" +
        "🔑 *JID:* " + (m.sender ?? "—") + "\n" +
        "🆔 *LID:* " + lidEntry + "\n\n" +
        "Se aparecer como dono:\n" +
        "• Seu número já está no config\n\n" +
        "Se não aparecer como dono:\n" +
        "• Use " + config.prefix + "addmeowner para se adicionar automaticamente"
      );
    }

    if (cmd === "addmeowner") {
      const jid = m.sender ?? "";
      if (!jid) return m.reply("❌ Não foi possível detectar seu JID.");
      if (!config.ownerLids.includes(jid) && !config.owners.includes(m.senderNum)) {
        config.ownerLids.push(jid);
        return m.reply(
          "✅ Seu LID foi adicionado como dono!\n" +
          "🔑 JID: " + jid + "\n\n" +
          "⚠️ Isso vale apenas enquanto o bot estiver rodando.\n" +
          "Para fixar permanentemente, adicione ao config.js:\n" +
          "ownerLids: [\"" + jid + "\"]"
        );
      }
      return m.reply("✅ Você já é reconhecido como dono!");
    }

    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const min = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    m.reply(
      "🤖 *" + config.botName + "*\n\n" +
      "⏱ *Uptime:* " + h + "h " + min + "m " + s + "s\n" +
      "📌 *Prefixo:* " + config.prefix + "\n" +
      "🔌 *Versão:* 1.0.0\n" +
      "📦 *Biblioteca:* Baileys (Multi-Device)\n\n" +
      "Use " + config.prefix + "myid para ver seus identificadores."
    );
  },
};
