export default {
  commands: ["ping", "pong"],
  description: "Testa se o bot está online",
  ownerOnly: false,

  async run(client, m, args) {
    const start = Date.now();
    await m.react("⏱️");
    const ms = Date.now() - start;
    await m.reply(`🏓 *Pong!* — ${ms}ms\n✅ Bot online e funcionando.`);
  },
};
