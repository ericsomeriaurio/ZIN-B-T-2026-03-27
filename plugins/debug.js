export default {
  commands: ["botjid", "whoami"],
  async run(client, m, args) {
    const cmd = m.body.replace(/^\W+/, "").split(" ")[0].toLowerCase();
    const sock = m.sock ?? client;

    if (cmd === "whoami") {
      const creds = sock.authState?.creds?.me ?? {};
      return m.reply(
        "🤖 *IDs do Bot*\n\n" +
        "sock.user.id: " + (sock.user?.id ?? "—") + "\n" +
        "creds.me.id: " + (creds.id ?? "—") + "\n" +
        "creds.me.lid: " + (creds.lid ?? "não disponível") + "\n" +
        "Seu sender: " + (m.sender ?? "—")
      );
    }

    if (cmd === "botjid" && m.isGroup) {
      try {
        const meta = await client.groupMetadata(m.jid);
        const admins = meta.participants.filter(p => p.admin);
        const list = admins.map(p => p.id + " (" + p.admin + ")").join("\n");
        return m.reply("👮 *Admins do grupo:*\n\n" + list);
      } catch (e) {
        return m.reply("Erro: " + e.message);
      }
    }
  }
};
