export default {
  commands: ["ping", "pong", "tempo"],
  description: "Testa latência e uptime do bot",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();
    const start = Date.now();
    await m.react("⏱️");
    const ms = Date.now() - start;

    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mn = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    const date = new Date().toLocaleDateString("pt-BR");
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const net = ms < 100 ? "Excelente 🟢" : ms < 300 ? "Estável 🟡" : "Lento 🔴";

    const text = [
      `╭── 『 🛠️ *SISTEMA* 』 ──`,
      `│`,
      `│ 📡 *PING:* ${ms}ms`,
      `│ 📶 *REDE:* ${net}`,
      `│ ⏳ *UPTIME:* ${uptimeStr}`,
      `│ 📅 *DATA:* ${date}`,
      `│ 🕒 *HORA:* ${time}`,
      `│`,
      `╰──────────────────`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
