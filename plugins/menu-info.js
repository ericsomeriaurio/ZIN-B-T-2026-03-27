import { config } from "../config.js";

const FRASES_INFO = [
  "\"O conhecimento é a base de tudo.\" — Orochimaru 🐍",
  "\"Aprender é a única coisa que a mente nunca se cansa.\" — Shikamaru 🧠",
  "\"Quem não aprende com o passado está condenado a repeti-lo.\" — Jiraiya 📖",
];

function getFrase() {
  return FRASES_INFO[Math.floor(Math.random() * FRASES_INFO.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-info", "menuinfo", "menu-informações"],
  description: "Menu de informações",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;
    const name = m.pushName ?? m.senderNum ?? "Utilizador";

    const text = [
      `╭─── 『 *MENU INFORMAÇÕES* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* 05 TOTAL`,
      `│ 🔑 *NÍVEL:* TODOS (FREE)`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *LISTA DE COMANDOS* 〕`,
      `│`,
      `│ ✧ ${p}info ────╼ Dados do Bot`,
      `│ ✧ ${p}myid ────╼ Meus IDs`,
      `│ ✧ ${p}dono ────╼ Contacto dono`,
      `│ ✧ ${p}ping ────╼ Latência`,
      `│ ✧ ${p}prefixo ─╼ Ver prefixo`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
