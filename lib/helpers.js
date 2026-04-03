// ─── HELPERS PARTILHADOS ───────────────────────────────────────────────────
// Importa este ficheiro em qualquer plugin que precise de verificar admin/bot

export async function isGroupAdmin(sock, jid, participantJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch { return false; }
}

export async function isBotAdmin(sock, jid) {
  try {
    const rawId = sock.user?.id ?? sock.authState?.creds?.me?.id ?? "";
    const botPhone = rawId.split(":")[0].split("@")[0].replace(/[^0-9]/g, "");
    const botLidRaw = sock.authState?.creds?.me?.lid ?? sock.user?.lid ?? null;
    const botLid = botLidRaw ? botLidRaw.replace(/:.*@/, "@") : null;

    const meta = await sock.groupMetadata(jid);

    return meta.participants.some((p) => {
      if (p.admin !== "admin" && p.admin !== "superadmin") return false;
      const pPhone = p.id.split("@")[0].replace(/[^0-9]/g, "");
      return (
        (botPhone && pPhone === botPhone) ||
        (botLid && p.id === botLid) ||
        p.id === rawId ||
        p.id.replace(/:.*@/, "@") === (botPhone + "@s.whatsapp.net")
      );
    });
  } catch { return false; }
}

// Detecta reencaminhamento de status em qualquer tipo de mensagem
export function isStatusForward(m) {
  const msg = m.message;
  if (!msg) return false;
  // Caso 0 — groupStatusMentionMessage (menção de grupo num status)
  if (msg.groupStatusMentionMessage) return true;


  for (const t of Object.keys(msg)) {
    const content = msg[t];
    if (!content || typeof content !== "object") continue;
    const ctx = content.contextInfo;
    if (!ctx) continue;

    // Caso 1 — remoteJid é status@broadcast
    if (ctx.remoteJid === "status@broadcast") return true;

    // Caso 2 — contém status no remoteJid
    if (ctx.remoteJid?.includes("status")) return true;

    // Caso 3 — isForwarded com forwardingScore (status partilhado)
    if (ctx.isForwarded && ctx.forwardingScore >= 1) {
      // Verifica se a origem é um status
      if (ctx.remoteJid?.includes("status") || ctx.remoteJid === "status@broadcast") return true;
    }
  }

  // Caso 4 — viewOnce de status (imagem/vídeo de status)
  const types = ["imageMessage", "videoMessage", "audioMessage"];
  for (const t of types) {
    if (msg[t]?.viewOnce && msg[t]?.contextInfo?.remoteJid === "status@broadcast") return true;
  }

  return false;
}

// Resolve targets de um comando (menção, quoted, ou argumento numérico)
export function getTargets(m, args) {
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
  const fromArgs = args
    .map((a) => a.replace(/[^0-9]/g, ""))
    .filter((a) => a.length > 5)
    .map((a) => a + "@s.whatsapp.net");
  const fromQuoted = [];
  if (m.quoted) {
    const qs = m.quoted.key?.participant ?? m.quoted.key?.remoteJid;
    if (qs && !qs.endsWith("@g.us")) fromQuoted.push(qs);
  }
  return [...new Set([...mentioned, ...fromArgs, ...fromQuoted])];
}
