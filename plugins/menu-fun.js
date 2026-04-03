import { config } from "../config.js";

const FRASES_FUN = [
  "\"A juventude é uma explosão de energia!\" — Guy Sensei 💥",
  "\"Acreditar em si mesmo é o primeiro passo para a vitória.\" — Rock Lee 🥊",
  "\"Diversão sem ofensas é a verdadeira arte.\" — Naruto 🍥",
];

function getFrase() {
  return FRASES_FUN[Math.floor(Math.random() * FRASES_FUN.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-fun", "menufun", "menu-brincadeiras"],
  description: "Menu de brincadeiras",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;
    const name = m.pushName ?? m.senderNum ?? "Utilizador";

    const text = [
      `╭─── 『 *MENU BRINCADEIRAS* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* 13 TOTAL`,
      `│ 🔑 *NÍVEL:* TODOS (FREE)`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *😂 ZOEIRA* 〕`,
      `│`,
      `│ ✧ ${p}ship ────╼ Casal`,
      `│ ✧ ${p}gay ─────╼ Medidor`,
      `│ ✧ ${p}gado ────╼ Medidor`,
      `│ ✧ ${p}tapa ────╼ Interagir`,
      `│ ✧ ${p}beijo ───╼ Interagir`,
      `│ ✧ ${p}pvp ─────╼ Duelo`,
      `│`,
      `├─〔 *🎮 JOGOS* 〕`,
      `│`,
      `│ ✧ ${p}ppt ─────╼ Jokenpô`,
      `│ ✧ ${p}dado ────╼ Dado`,
      `│ ✧ ${p}quiz ────╼ Quiz`,
      `│ ✧ ${p}velha ───╼ Jogo da Velha`,
      `│ ✧ ${p}forca ───╼ Forca`,
      `│ ✧ ${p}21 ──────╼ Blackjack`,
      `│ ✧ ${p}bet ─────╼ Apostas`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
