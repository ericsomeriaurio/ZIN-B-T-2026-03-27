import { config } from "../config.js";

const FRASES_OWNER = [
  "\"O poder absoluto requer responsabilidade absoluta.\" — Madara 👁️",
  "\"Ser o mais forte não é suficiente — deves ser o mais sábio.\" — Hashirama 🌲",
  "\"Com grande poder vem grande solidão.\" — Pain 🌧️",
];

function getFrase() {
  return FRASES_OWNER[Math.floor(Math.random() * FRASES_OWNER.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-owner", "menuowner", "menu-dono", "menudono"],
  description: "Menu do dono — acesso restrito",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;

    if (!m.isOwner) {
      return sock.sendMessage(m.jid, {
        text: "🚫 *Acesso Negado*\nEste menu é exclusivo para o *Proprietário* do bot.",
      }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    const name = m.pushName ?? m.senderNum ?? "Dono";

    const text = [
      `╭─── 『 *MENU DONO* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* 14 TOTAL`,
      `│ 🔑 *NÍVEL:* PROPRIETÁRIO`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *⚙️ CONFIGURAÇÃO* 〕`,
      `│`,
      `│ ✧ ${p}setprefix ──╼ Mudar prefixo`,
      `│ ✧ ${p}reload ─────╼ Recarregar plugins`,
      `│ ✧ ${p}shutdown ───╼ Desligar bot`,
      `│`,
      `├─〔 *📢 GESTÃO* 〕`,
      `│`,
      `│ ✧ ${p}broadcast ──╼ Enviar a todos`,
      `│ ✧ ${p}ban ─────────╼ Banir do bot`,
      `│ ✧ ${p}unban ───────╼ Desbanir`,
      `│ ✧ ${p}banlist ─────╼ Lista banidos`,
      `│`,
      `├─〔 *🔧 SISTEMA* 〕`,
      `│`,
      `│ ✧ ${p}agendar ─────╼ Agendar msg`,
      `│ ✧ ${p}listagendar ─╼ Ver agendados`,
      `│ ✧ ${p}cancelagendar╼ Cancelar`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `⚠️ _Cuidado: Acesso restrito._`,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
