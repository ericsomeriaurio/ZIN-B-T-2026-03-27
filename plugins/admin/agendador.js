import { addSchedule, removeSchedule, getSchedules } from "../../lib/store.js";
import { isGroupAdmin } from "../../lib/helpers.js";
import { config } from "../../config.js";

// Gera ID único sem dependência externa
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Parseia tempo relativo: "30s", "5m", "2h"
function parseRelative(str) {
  const match = str.match(/^(\d+)(s|m|h)$/i);
  if (!match) return null;
  const n = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60 * 1000;
  if (unit === "h") return n * 3600 * 1000;
  return null;
}

// Parseia horário absoluto: "HH:MM"
function parseAbsolute(str) {
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const now = new Date();
  const target = new Date();
  target.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  // Se já passou hoje, agenda para amanhã
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

export default {
  commands: ["agendar", "agendarmsg", "listagendar", "cancelagendar"],
  description: "Agenda mensagens para envio futuro",

  async run(client, m, args) {
    const sock = m.sock ?? client;
    const cmd = m.body.split(" ")[0].slice(1).toLowerCase();

    // Verificação de permissão
    let hasPermission = m.isOwner;
    if (!hasPermission && m.isGroup) {
      hasPermission = await isGroupAdmin(sock, m.jid, m.sender);
    }
    if (!hasPermission) return m.reply("❌ Apenas admins e donos podem usar este comando.");

    // ── .listagendar ───────────────────────────────────────────────────────
    if (cmd === "listagendar") {
      const all = getSchedules();
      // Admins só vêem os do grupo actual, donos vêem todos
      const list = m.isOwner ? all : all.filter((s) => s.jid === m.jid);

      if (!list.length) {
        return m.reply(
          `📅 *Agendamentos*\n` +
          `┃\n` +
          `┃  Nenhum agendamento activo.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      let text =
        `📅 *Agendamentos Activos*\n` +
        `┃\n` +
        `┃  Total: ${list.length}\n` +
        `┃\n`;

      list.forEach((s, i) => {
        const when = new Date(s.sendAt).toLocaleString("pt-BR");
        const preview = s.text.length > 30 ? s.text.slice(0, 30) + "..." : s.text;
        text +=
          `┃  *${i + 1}.* ID: \`${s.id}\`\n` +
          `┃     📨 ${preview}\n` +
          `┃     ⏰ ${when}\n` +
          `┃\n`;
      });
      text += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
      return m.reply(text);
    }

    // ── .cancelagendar ID ──────────────────────────────────────────────────
    if (cmd === "cancelagendar") {
      const id = args[0];
      if (!id) {
        return m.reply(
          `❌ *Formato inválido*\n` +
          `┃\n` +
          `┃  Use: .cancelagendar <ID>\n` +
          `┃  Use .listagendar para ver os IDs.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      const all = getSchedules();
      const found = all.find((s) => s.id === id);
      if (!found) return m.reply(`❌ Agendamento \`${id}\` não encontrado.`);
      // Admin só pode cancelar agendamentos do seu grupo
      if (!m.isOwner && found.jid !== m.jid) {
        return m.reply("❌ Não tens permissão para cancelar este agendamento.");
      }
      removeSchedule(id);
      return m.reply(
        `✅ *Agendamento Cancelado*\n` +
        `┃\n` +
        `┃  ID: \`${id}\`\n` +
        `┃  cancelado com sucesso.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ── .agendar / .agendarmsg ─────────────────────────────────────────────
    // Formatos:
    //   .agendar 30m mensagem aqui        (relativo — no grupo actual)
    //   .agendar 14:30 mensagem aqui      (absoluto — no grupo actual)
    //   .agendar @jid 30m mensagem        (dono — envia noutro grupo)

    if (!args.length) {
      return m.reply(
        `❌ *Formato inválido*\n` +
        `┃\n` +
        `┃  Relativo:\n` +
        `┃  .agendar 30m mensagem\n` +
        `┃  .agendar 2h mensagem\n` +
        `┃\n` +
        `┃  Horário fixo:\n` +
        `┃  .agendar 14:30 mensagem\n` +
        `┃\n` +
        `┃  Outro grupo (só donos):\n` +
        `┃  .agendar @jid 30m mensagem\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // Verifica se o primeiro arg é um JID de destino (só donos)
    let targetJid = m.jid;
    let timeArg = args[0];
    let msgStart = 1;

    if (args[0].includes("@") && args[0].endsWith(".us")) {
      if (!m.isOwner) return m.reply("❌ Apenas donos podem agendar para outros grupos.");
      targetJid = args[0];
      timeArg = args[1];
      msgStart = 2;
    }

    const text = args.slice(msgStart).join(" ").trim();
    if (!text) return m.reply("❌ A mensagem não pode estar vazia.");

    // Calcula o timestamp de envio
    let sendAt;
    const relative = parseRelative(timeArg);
    if (relative !== null) {
      sendAt = Date.now() + relative;
    } else {
      sendAt = parseAbsolute(timeArg);
      if (!sendAt) {
        return m.reply(
          `❌ *Tempo inválido*\n` +
          `┃\n` +
          `┃  Use: 30s, 5m, 2h\n` +
          `┃  Ou:  14:30 (HH:MM)\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
    }

    const id = genId();
    const when = new Date(sendAt).toLocaleString("pt-BR");

    addSchedule({
      id,
      jid: targetJid,
      text,
      sendAt,
      createdBy: m.senderNum,
    });

    await m.reply(
      `✅ *Mensagem Agendada*\n` +
      `┃\n` +
      `┃  📨 Mensagem: ${text.length > 40 ? text.slice(0, 40) + "..." : text}\n` +
      `┃  ⏰ Envio em: *${when}*\n` +
      `┃  🆔 ID: \`${id}\`\n` +
      `┃\n` +
      `┃  Use .cancelagendar ${id}\n` +
      `┃  para cancelar.\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  },
};
