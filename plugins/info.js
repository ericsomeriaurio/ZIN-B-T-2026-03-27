import { config } from "../config.js";
import { getLidMap } from "../lib/jid.js";

export default {
  commands: ["info", "botinfo", "about", "myid", "mylid", "addmeowner", "prefixo", "dono"],
  description: "Informações sobre o bot",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();
    const p = config.prefix;

    // ── .myid / .mylid ────────────────────────────────────────────────────
    if (cmd === "myid" || cmd === "mylid") {
      const lidMap = getLidMap();
      let lidEntry = "não detectado";
      for (const [lid, phone] of lidMap) {
        if (phone === m.senderNum) { lidEntry = lid; break; }
      }

      const text = [
        `╭─── 『 👤 *IDENTIDADE* 』 ───`,
        `│`,
        `│ 👤 *NOME:* ${m.pushName ?? "—"}`,
        `│ 📱 *NÚMERO:* ${m.senderNum}`,
        `│ 🔑 *JID:* ${m.sender ?? "—"}`,
        `│ 🆔 *LID:* ${lidEntry}`,
        `│ 🎭 *CARGO:* ${m.isOwner ? "👑 Dono" : "👤 Membro"}`,
        `│`,
        `╰─────────────────────────`,
        ``,
        `💡 _Use ${p}addmeowner para te adicionar como dono._`,
      ].join("\n");

      return sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    // ── .addmeowner ───────────────────────────────────────────────────────
    if (cmd === "addmeowner") {
      const jid = m.sender ?? "";
      if (!jid) return sock.sendMessage(m.jid, { text: "❌ Não foi possível detectar o teu JID." }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });

      if (!config.ownerLids.includes(jid) && !config.owners.includes(m.senderNum)) {
        config.ownerLids.push(jid);
        const text = [
          `╭─── 『 👑 *DONO* 』 ───`,
          `│`,
          `│ ✅ *LID adicionado como dono!*`,
          `│ 🔑 *JID:* ${jid}`,
          `│`,
          `│ ⚠️ Válido até reiniciar o bot.`,
          `│ Para fixar, adiciona ao config.js:`,
          `│ ownerLids: ["${jid}"]`,
          `│`,
          `╰──────────────────────`,
        ].join("\n");
        return sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
      }
      return sock.sendMessage(m.jid, { text: "✅ Já és reconhecido como dono!" }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    // ── .prefixo ──────────────────────────────────────────────────────────
    if (cmd === "prefixo") {
      const text = [
        `╭── 『 🛠️ *PREFIXO* 』 ──`,
        `│`,
        `│ 📌 *PREFIXO ACTUAL:* [ ${p} ]`,
        `│`,
        `│ Para mudar: ${p}setprefix !`,
        `│`,
        `╰───────────────────────`,
      ].join("\n");
      return sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    // ── .dono ─────────────────────────────────────────────────────────────
    if (cmd === "dono") {
      const text = [
        `╭─── 『 👨‍💻 *DESENVOLVEDOR* 』 ───`,
        `│`,
        `│ 👤 *NOME:* Erik (Tobizin)`,
        `│ 📍 *PAÍS:* Angola 🇦🇴`,
        `│ 💬 *CONTATO:* wa.me/244935483240`,
        `│ 🤖 *BOT:* ${config.botName}`,
        `│`,
        `╰──────────────────────────────`,
      ].join("\n");
      return sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    // ── .info / .botinfo / .about ─────────────────────────────────────────
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mn = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    const ram = Math.round(process.memoryUsage().rss / 1024 / 1024);
    const totalRam = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);

    const start = Date.now();
    const ms = Date.now() - start;

    const text = [
      `╭─── 『 📚 *SISTEMA* 』 ───`,
      `│`,
      `│ 🤖 *BOT:* ${config.botName}`,
      `│ 👨‍💻 *DEV:* Erik (Tobizin)`,
      `│ ⏳ *UPTIME:* ${uptimeStr}`,
      `│ 🔌 *VERSÃO:* 2.0`,
      `│ 📦 *BIBLIOTECA:* Baileys`,
      `│`,
      `├─〔 *💻 HARDWARE* 〕`,
      `│`,
      `│ 📟 *RAM:* ${ram}MB / ${totalRam}MB`,
      `│ 📡 *LATÊNCIA:* ${ms}ms`,
      `│ 🛠️ *PLAT:* Termux (ARM)`,
      `│ 🌐 *NODE:* ${process.version}`,
      `│`,
      `╰──────────────────────────`,
      ``,
      `💡 _Use ${p}menu para ver todos os comandos._`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
