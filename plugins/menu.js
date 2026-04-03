import { config } from "../config.js";

const COVER_URL = "https://files.catbox.moe/remi43.png";

const FRASES = [
  "\"As pessoas só se entenderão umas às outras quando todas sentirem a mesma dor.\" — Pain 🌧️",
  "\"Aqueles que não entendem o verdadeiro poder são condenados a repetir os mesmos erros.\" — Madara 👁️",
  "\"Neste mundo, onde quer que haja luz, sempre haverá sombras.\" — Madara 🌑",
  "\"Eu me tornei o Hokage sem que ninguém reconhecesse meu poder.\" — Obito 🌀",
  "\"A dor permite que as pessoas cresçam.\" — Pain 💫",
  "\"O verdadeiro poder não é quando você ataca, mas quando você protege.\" — Naruto ⚡",
  "\"Enquanto eu souber o que é o amor, posso encontrar o caminho de volta à vida.\" — Obito 🔥",
  "\"Um homem que não tem nada não pode ser destruído.\" — Madara ⚔️",
  "\"Sonhos nunca acabam.\" — Naruto 🍥",
  "\"Coragem é saber quando você está com medo e agir mesmo assim.\" — Kakashi ⚡",
];

function getFrase() {
  return FRASES[Math.floor(Math.random() * FRASES.length)];
}

function getTime() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getUptime() {
  const u = process.uptime();
  const h = Math.floor(u / 3600);
  const mn = Math.floor((u % 3600) / 60);
  const s = Math.floor(u % 60);
  return `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function getRam() {
  return Math.round(process.memoryUsage().rss / 1024 / 1024);
}

export default {
  commands: ["menu", "help", "ajuda", "cmds"],
  description: "Menu principal",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;
    const name = m.pushName ?? m.senderNum ?? "Utilizador";

    const text = [
      `╭─── 『 *${config.botName}* 』 ───`,
      `│`,
      `├─〔 *STATUS DO SISTEMA* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 🛠️ *PREFIXO:* [ ${p} ]`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│ ⏳ *UPTIME:* ${getUptime()}`,
      `│ 📊 *RAM:* ${getRam()}MB`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `*Bem-vindo ao centro de comando!*`,
      `  Selecione uma categoria abaixo:`,
      ``,
      `🌟 *CATEGORIAS DISPONÍVEIS:*`,
      ``,
      `  ✧ 🛡️ *MODERAÇÃO*`,
      `  ↳ Digite: *${p}menu-adm*`,
      ``,
      `  ✧ 🛠️ *UTILIDADES*`,
      `  ↳ Digite: *${p}menu-util*`,
      ``,
      `  ✧ 🎮 *BRINCADEIRAS*`,
      `  ↳ Digite: *${p}menu-fun*`,
      ``,
      `  ✧ 📚 *INFORMAÇÕES*`,
      `  ↳ Digite: *${p}menu-info*`,
      ``,
      `  ✧ 🎨 *FIGURINHAS*`,
      `  ↳ Digite: *${p}menu-stk*`,
      ``,
      `  ✧ ⚙️ *PAINEL DONO*`,
      `  ↳ Digite: *${p}menu-owner*`,
      ``,
      `╭───〔 *DESENVOLVEDOR* 〕───`,
      `│ 👨‍💻 *DEV:* Erik (Tobizin)`,
      `│ 📍 *PAÍS:* Angola 🇦🇴`,
      `│ 💬 *CONTATO:* wa.me/244935483240`,
      `╰───────────────────────────`,
      ``,
      `💡 _${getFrase()}_`,
    ].join("\n");

    try {
      const res = await fetch(COVER_URL);
      if (!res.ok) throw new Error("Sem imagem");
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(m.jid, { image: buffer, caption: text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    } catch {
      await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }
  },
};
