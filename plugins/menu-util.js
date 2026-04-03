import { config } from "../config.js";

const FRASES_UTIL = [
  "\"Conhecimento é a arma mais poderosa que existe.\" — Itachi 🌸",
  "\"Informação é poder — use com sabedoria.\" — Shikamaru 🧠",
  "\"A preparação é o caminho para a vitória.\" — Kakashi ⚡",
];

function getFrase() {
  return FRASES_UTIL[Math.floor(Math.random() * FRASES_UTIL.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-util", "menuutil", "menu-utilidades"],
  description: "Menu de utilidades",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;
    const name = m.pushName ?? m.senderNum ?? "Utilizador";

    const text = [
      `╭─── 『 *MENU UTILIDADES* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* 10 TOTAL`,
      `│ 🔑 *NÍVEL:* TODOS (FREE)`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *📡 SISTEMA* 〕`,
      `│`,
      `│ ✧ ${p}ping ────╼ Latência`,
      `│ ✧ ${p}info ────╼ Info do bot`,
      `│ ✧ ${p}tempo ───╼ Uptime`,
      `│ ✧ ${p}perfil ──╼ Meu perfil`,
      `│`,
      `├─〔 *🔍 BUSCA* 〕`,
      `│`,
      `│ ✧ ${p}google ──╼ Pesquisar`,
      `│ ✧ ${p}wiki ────╼ Wikipédia`,
      `│ ✧ ${p}clima ───╼ Tempo`,
      `│ ✧ ${p}img ─────╼ Imagens`,
      `│`,
      `├─〔 *🛠️ FERRAMENTAS* 〕`,
      `│`,
      `│ ✧ ${p}calc ────╼ Calculadora`,
      `│ ✧ ${p}traduzir ╼ Traduzir`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
