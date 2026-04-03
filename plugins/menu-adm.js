import { config } from "../config.js";
import { isGroupAdmin } from "../lib/helpers.js";

const FRASES_ADM = [
  "\"O poder não corrompe os homens; os tolos, quando chegam ao topo, corrompem o poder.\" — Madara ⚔️",
  "\"Para proteger algo, é preciso estar disposto a sacrificar tudo.\" — Itachi 🌸",
  "\"A força real vem de ter algo a proteger.\" — Naruto 🍥",
  "\"Um líder não é aquele que comanda, mas aquele que serve.\" — Hashirama 🌲",
  "\"Discipline your mind, master your power.\" — Madara 👁️",
];

function getFrase() {
  return FRASES_ADM[Math.floor(Math.random() * FRASES_ADM.length)];
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default {
  commands: ["menu-adm", "menuadm", "menu-mod", "menumoderação"],
  description: "Menu de moderação — só admins",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const p = config.prefix;

    // Verificação de permissão
    let isAdmin = false;
    if (m.isGroup) {
      isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    }
    if (!isAdmin && !m.isOwner) {
      return sock.sendMessage(m.jid, {
        text: "🚫 *Acesso Negado*\nEste menu é exclusivo para *Administradores*.",
      }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
    }

    const nivel = m.isOwner ? "PROPRIETÁRIO" : "ADMINISTRADOR";
    const name = m.pushName ?? m.senderNum ?? "Admin";

    // Conta comandos deste menu
    const totalCmds = 20;

    const text = [
      `╭─── 『 *MENU MODERAÇÃO* 』 ───`,
      `│`,
      `├─〔 *DADOS DO USUÁRIO* 〕`,
      `│ 👤 *USER:* ${name}`,
      `│ 📊 *COMANDOS:* ${totalCmds} TOTAL`,
      `│ 🔑 *NÍVEL:* ${nivel}`,
      `│ 🕒 *HORA:* ${getTime()}`,
      `│`,
      `├─〔 *👥 GESTÃO DE MEMBROS* 〕`,
      `│`,
      `│ ✧ ${p}kick ────╼ Remover membro`,
      `│ ✧ ${p}add ─────╼ Adicionar membro`,
      `│ ✧ ${p}promote ─╼ Promover a admin`,
      `│ ✧ ${p}demote ──╼ Rebaixar admin`,
      `│ ✧ ${p}ban ─────╼ Banir do bot`,
      `│ ✧ ${p}unban ───╼ Desbanir`,
      `│`,
      `├─〔 *🏘️ GESTÃO DO GRUPO* 〕`,
      `│`,
      `│ ✧ ${p}mute ────╼ Fechar grupo`,
      `│ ✧ ${p}unmute ──╼ Abrir grupo`,
      `│ ✧ ${p}hidetag ─╼ Marcar todos`,
      `│ ✧ ${p}tagall ──╼ Mencionar todos`,
      `│ ✧ ${p}setname ─╼ Mudar nome`,
      `│ ✧ ${p}setdesc ─╼ Mudar descrição`,
      `│ ✧ ${p}setpic ──╼ Mudar foto`,
      `│ ✧ ${p}linkgroup╼ Link do grupo`,
      `│ ✧ ${p}revokelink╼ Revogar link`,
      `│ ✧ ${p}groupinfo╼ Info do grupo`,
      `│`,
      `├─〔 *⚠️ ADVERTÊNCIAS* 〕`,
      `│`,
      `│ ✧ ${p}warn ────╼ Advertir membro`,
      `│ ✧ ${p}delwarn ─╼ Remover advert.`,
      `│ ✧ ${p}warnlist ╼ Listar advert.`,
      `│ ✧ ${p}clearwarn╼ Limpar advert.`,
      `│`,
      `├─〔 *🛡️ PROTECÇÕES* 〕`,
      `│`,
      `│ ✧ ${p}antilink ────╼ Anti-link`,
      `│ ✧ ${p}antiflood ───╼ Anti-flood`,
      `│ ✧ ${p}antiimg ─────╼ Anti-imagem`,
      `│ ✧ ${p}antiaudio ───╼ Anti-áudio`,
      `│ ✧ ${p}antivideo ───╼ Anti-vídeo`,
      `│ ✧ ${p}antidoc ─────╼ Anti-documento`,
      `│ ✧ ${p}antisticker ─╼ Anti-sticker`,
      `│ ✧ ${p}antistatus ──╼ Anti-status`,
      `│ ✧ ${p}antievento ──╼ Anti-evento`,
      `│ ✧ ${p}antiproduto ─╼ Anti-produto`,
      `│ ✧ ${p}somenteadmins╼ Só admins`,
      `│ ✧ ${p}setmax ──────╼ Limite flood`,
      `│ ✧ ${p}welcome ─────╼ Boas-vindas`,
      `│ ✧ ${p}goodbye ─────╼ Despedida`,
      `│`,
      `├─〔 *🛠️ FERRAMENTAS* 〕`,
      `│`,
      `│ ✧ ${p}aviso ───────╼ Enviar aviso`,
      `│ ✧ ${p}addresp ─────╼ Add resposta`,
      `│ ✧ ${p}listresp ────╼ Listar respostas`,
      `│ ✧ ${p}delresp ─────╼ Apagar resposta`,
      `│ ✧ ${p}agendar ─────╼ Agendar msg`,
      `│ ✧ ${p}clearchat ───╼ Limpar chat`,
      `│ ✧ ${p}del ─────────╼ Apagar msg`,
      `│`,
      `╰───────────────────────────`,
      ``,
      `💡 _${getFrase()}_`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, { quoted: m.key ? { key: m.key, message: m.message } : undefined });
  },
};
