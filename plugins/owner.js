import { config, db } from "../config.js";
import { logger } from "../lib/logger.js";

export default {
  commands: ["ban", "unban", "broadcast", "setprefix", "reload"],
  description: "Comandos exclusivos para donos",
  ownerOnly: true,

  async run(client, m, args) {
    const [command] = [m.body.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase()];

    if (command === "ban") {
      const target = args[0]?.replace(/[^0-9]/g, "");
      if (!target) return m.reply("❌ Informe o número para banir. Ex: .ban 5511999999999");
      db.blocklist.push(target);
      return m.reply(`✅ Número ${target} banido com sucesso.`);
    }

    if (command === "unban") {
      const target = args[0]?.replace(/[^0-9]/g, "");
      if (!target) return m.reply("❌ Informe o número para desbanir. Ex: .unban 5511999999999");
      const idx = db.blocklist.indexOf(target);
      if (idx === -1) return m.reply(`⚠️ Número ${target} não está na lista de banidos.`);
      db.blocklist.splice(idx, 1);
      return m.reply(`✅ Número ${target} removido da lista de banidos.`);
    }

    if (command === "broadcast") {
      const text = args.join(" ");
      if (!text) return m.reply("❌ Informe a mensagem para o broadcast. Ex: .broadcast Olá a todos!");
      const chats = await client.groupFetchAllParticipating();
      let sent = 0;
      for (const jid of Object.keys(chats)) {
        await client.sendMessage(jid, { text: `📢 *Broadcast:*\n\n${text}` }).catch(() => {});
        sent++;
      }
      return m.reply(`✅ Broadcast enviado para ${sent} grupos.`);
    }

    if (command === "setprefix") {
      const newPrefix = args[0];
      if (!newPrefix) return m.reply("❌ Informe o novo prefixo. Ex: .setprefix !");
      config.prefix = newPrefix;
      global._prefix = newPrefix;
      return m.reply(`✅ Prefixo alterado para: ${newPrefix}`);
    }

    if (command === "reload") {
      const { loadPlugins } = await import("../lib/plugins.js");
      await loadPlugins(config.pluginsDir);
      return m.reply("✅ Plugins recarregados com sucesso!");
    }
  },
};




