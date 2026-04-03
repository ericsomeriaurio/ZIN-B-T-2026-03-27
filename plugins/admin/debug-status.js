export default {
  commands: ["debugstatus"],
  description: "Debug da estrutura de mensagens de status",

  async run(client, m, args) {
    if (!m.quoted) {
      return m.reply("❌ Responda uma mensagem de status com .debugstatus");
    }

    const msg = m.quoted.message ?? {};
    const result = [];

    for (const [type, content] of Object.entries(msg)) {
      if (!content || typeof content !== "object") continue;
      const ctx = content.contextInfo;
      result.push(
        `📌 Tipo: ${type}\n` +
        `  remoteJid: ${ctx?.remoteJid ?? "N/A"}\n` +
        `  isForwarded: ${ctx?.isForwarded ?? "N/A"}\n` +
        `  forwardingScore: ${ctx?.forwardingScore ?? "N/A"}\n` +
        `  participant: ${ctx?.participant ?? "N/A"}`
      );
    }

    await m.reply(
      `🔍 *Debug Status*\n\n` +
      (result.length ? result.join("\n\n") : "Sem contextInfo encontrado") +
      `\n\nkey.remoteJid: ${m.quoted.key?.remoteJid ?? "N/A"}\n` +
      `key.participant: ${m.quoted.key?.participant ?? "N/A"}`
    );
  },
};
