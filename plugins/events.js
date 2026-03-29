import { getGroup, setGroup, addWarning, clearWarnings } from "../lib/store.js";
import { config } from "../config.js";

const floodMap = new Map();
const LINK_REGEX = /(https?:\/\/|chat\.whatsapp\.com|wa\.me|t\.me|bit\.ly)\S+/i;

export async function runGroupEvents(client, m, sock) {
  if (!m.isGroup) return;
  const { jid, sender, senderNum, body, isOwner, message: msg, key, type } = m;

  let isAdmin = false;
  try {
    const meta = await client.groupMetadata(jid);
    isAdmin = meta.participants.some(
      (p) => p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch {}

  if (isAdmin || isOwner) return;

  const cfg = getGroup(jid);

  if (cfg.antilink && LINK_REGEX.test(body)) {
    await client.sendMessage(jid, {
      delete: key,
    }).catch(() => {});
    const num = senderNum;
    const count = addWarning(jid, num);
    let warn = "🔗 *Anti-Link*\n@" + num + " enviou um link e foi advertido!\n⚠️ Advertencia " + count + "/3";
    if (count >= 3) {
      warn += "\n🚫 Limite atingido! Removendo...";
      await client.groupParticipantsUpdate(jid, [sender], "remove").catch(() => {});
      clearWarnings(jid, num);
    }
    await client.sendMessage(jid, { text: warn, mentions: [sender] }).catch(() => {});
    return;
  }

  if (cfg.antiflood) {
    const now = Date.now();
    const key2 = jid + ":" + sender;
    if (!floodMap.has(key2)) floodMap.set(key2, []);
    const times = floodMap.get(key2).filter((t) => now - t < 5000);
    times.push(now);
    floodMap.set(key2, times);

    const max = cfg.maxflood ?? 5;
    if (times.length >= max) {
      floodMap.delete(key2);
      const count = addWarning(jid, senderNum);
      let warn = "🌊 *Anti-Flood*\n@" + senderNum + " esta enviando mensagens rapido demais!\n⚠️ Advertencia " + count + "/3";
      if (count >= 3) {
        warn += "\n🚫 Removendo...";
        await client.groupParticipantsUpdate(jid, [sender], "remove").catch(() => {});
        clearWarnings(jid, senderNum);
      }
      await client.sendMessage(jid, { text: warn, mentions: [sender] }).catch(() => {});
    }
  }
}

export async function runMemberEvents(client, event, sock) {
  const { id, participants, action } = event;
  const cfg = getGroup(id);

  if (action === "add" && cfg.welcome) {
    for (const p of participants) {
      const num = p.replace("@s.whatsapp.net", "");
      const text = cfg.welcomeMsg.replace("@user", "@" + num);
      await client.sendMessage(id, { text, mentions: [p] }).catch(() => {});
    }
  }

  if (action === "remove" && cfg.goodbye) {
    for (const p of participants) {
      const num = p.replace("@s.whatsapp.net", "");
      const text = cfg.goodbyeMsg.replace("@user", num);
      await client.sendMessage(id, { text }).catch(() => {});
    }
  }
}
