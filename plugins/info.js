import { config } from "../config.js";

export default {
  commands: ["info", "botinfo", "about"],
  description: "Informações sobre o bot",
  ownerOnly: false,

  async run(client, m, args) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text =
      `🤖 *${config.botName}*\n\n` +
      `⏱ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
      `📌 *Prefixo:* ${config.prefix}\n` +
      `🔌 *Versão:* 1.0.0\n` +
      `📦 *Biblioteca:* Baileys (Multi-Device)\n` +
      `🧩 *Plugins carregados:* dinâmico\n\n` +
      `Desenvolvido com ❤️`;

    await m.reply(text);
  },
};



