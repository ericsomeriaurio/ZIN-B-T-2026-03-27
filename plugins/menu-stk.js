import { config } from "../config.js";

const FRASES_STK = [
  "\"A arte é a expressão da alma.\" — Sai 🎨",
  "\"Cada detalhe conta — a perfeição está nos pequenos gestos.\" — Itachi 🌸",
  "\"Crie algo que perdure além do tempo.\" — Madara ⚔️",
];

function getFrase() {
  return FRASES_STK[Math.floor(Math.random() * FRASES_STK.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-stk", "menustk", "menu-figurinhas", "menu-sticker"],
  description: "Menu de figurinhas",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;
    const name = m.pushName ?? m.senderNum ?? "Utilizador";

    const text = [
      `╭─── 『 *MENU FIGURINHAS* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* 08 TOTAL`,
      `│ 🔑 *NÍVEL:* TODOS (FREE)`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *✂️ CRIAÇÃO* 〕`,
      `│`,
      `│ ✧ ${p}s ───────╼ Criar figurinha`,
      `│ ✧ ${p}attp ────╼ Texto animado`,
      `│ ✧ ${p}ttp ─────╼ Texto fixo`,
      `│ ✧ ${p}meme ────╼ Meme`,
      `│`,
      `├─〔 *🔄 CONVERSÃO* 〕`,
      `│`,
      `│ ✧ ${p}toimg ───╼ Sticker → foto`,
      `│ ✧ ${p}tgif ────╼ Sticker → GIF`,
      `│`,
      `├─〔 *🔧 EDIÇÃO* 〕`,
      `│`,
      `│ ✧ ${p}steal ───╼ Roubar figurinha`,
      `│ ✧ ${p}getexif ─╼ Ver metadados`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `💡 _Use fotos nítidas para melhor resultado._`,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
