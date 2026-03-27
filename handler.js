import { config, db } from "./config.js";
import { plugins } from "./lib/plugins.js";
import { makeSimpleClient } from "./lib/simple.js";
import {
  getContentType,
  downloadContentFromMessage,
} from "@whiskeysockets/baileys";

const deletedMessages = new Map();
const cooldowns = new Map();
const COOLDOWN_MS = 5000;

export async function messageHandler(sock, message) {
  const client = makeSimpleClient(sock);
  try {
    const { key, message: msg } = message;
    if (!msg) return;
    const jid = key.remoteJid;
    if (!jid) return;

    const isGroup = jid.endsWith("@g.us");
    const sender = isGroup ? key.participant : key.remoteJid;
    const senderNum = (sender ?? "").replace(/[^0-9]/g, "");
    const fromMe = key.fromMe;
    const type = getContentType(msg);
    if (!type) return;

    const body =
      msg?.conversation ??
      msg?.extendedTextMessage?.text ??
      msg?.imageMessage?.caption ??
      msg?.videoMessage?.caption ??
      "";

    const prefix = config.prefix;
    const isCommand = body.startsWith(prefix);
    const isOwner = config.owners.includes(senderNum);

    const m = {
      key,
      message: msg,
      jid,
      sender,
      senderNum,
      isGroup,
      fromMe,
      type,
      body,
      isCommand,
      isOwner,
      quoted: msg?.extendedTextMessage?.contextInfo?.quotedMessage
        ? {
            key: {
              remoteJid: jid,
              id: msg.extendedTextMessage.contextInfo.stanzaId,
              participant: msg.extendedTextMessage.contextInfo.participant,
            },
            message: msg.extendedTextMessage.contextInfo.quotedMessage,
          }
        : null,
      reply: (text) => client.sendText(jid, text, message),
      replyFile: (src, caption) => client.sendFile(jid, src, "", caption, message),
      react: (emoji) => client.react(jid, emoji, key),
    };

    deletedMessages.set(key.id, { ...m, timestamp: Date.now() });
    cleanOldMessages();

    if (isCommand) {
      const args = body.slice(prefix.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();
      const ownerOnly = isOwnerCommand(command);
      if (ownerOnly && !isOwner) {
        return m.reply("Este comando e restrito aos donos do bot.");
      }
      await runCommand(client, m, command, args);
      return;
    }

    if (fromMe) return;

    const cooldownKey = senderNum + ":" + jid;
    const lastTime = cooldowns.get(cooldownKey) ?? 0;
    if (Date.now() - lastTime < COOLDOWN_MS) return;

    await checkAutoResponder(client, m);
  } catch (err) {
    console.error("[Handler] Erro ao processar mensagem:", err);
  }
}

export async function antiDeleteHandler(sock, updates) {
  if (!config.antiDelete.enabled) return;
  const client = makeSimpleClient(sock);
  for (const update of updates) {
    const { key, update: upd } = update;
    if (!key?.id) continue;
    const isDeleted = upd?.message?.protocolMessage?.type === 0;
    if (!isDeleted) continue;
    const cached = deletedMessages.get(upd?.message?.protocolMessage?.key?.id ?? key.id);
    if (!cached) continue;
    const text =
      "Mensagem deletada detectada!\n" +
      "De: wa.me/" + cached.senderNum + "\n" +
      "Conteudo: " + (cached.body || "(midia/sem texto)");
    if (config.antiDelete.logToOwner) {
      for (const owner of config.owners) {
        await client.sendText(owner + "@s.whatsapp.net", text).catch(() => {});
      }
    }
    if (config.antiDelete.logToGroup && cached.isGroup) {
      await client.sendText(cached.jid, text).catch(() => {});
    }
  }
}

export async function antiViewOnceHandler(sock, message) {
  if (!config.antiViewOnce.enabled) return;
  const client = makeSimpleClient(sock);
  const { key, message: msg } = message;
  if (!msg) return;
  const jid = key.remoteJid;
  const type = getContentType(msg);
  const content = msg?.[type ?? ""];
  if (!content?.viewOnce) return;
  try {
    const mediaType = type?.replace("Message", "") ?? "";
    const stream = await downloadContentFromMessage(content, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const notice =
      "Midia ViewOnce interceptada\n" +
      "De: wa.me/" + (key.participant ?? jid).replace(/[^0-9]/g, "") + "\n" +
      "Tipo: " + mediaType;
    if (config.antiViewOnce.logToOwner) {
      for (const owner of config.owners) {
        const ownerJid = owner + "@s.whatsapp.net";
        await client.sendText(ownerJid, notice).catch(() => {});
        await client.sendFile(ownerJid, buffer, "viewonce." + mediaType, content.caption ?? "").catch(() => {});
      }
    }
    if (config.antiViewOnce.logToGroup && jid.endsWith("@g.us")) {
      await client.sendText(jid, notice).catch(() => {});
    }
  } catch (err) {
    console.error("[AntiViewOnce] Erro:", err);
  }
}

async function runCommand(client, m, command, args) {
  for (const [name, plugin] of plugins) {
    if (plugin.commands && plugin.commands.includes(command)) {
      try {
        await plugin.run(client, m, args);
      } catch (err) {
        console.error("[Handler] Erro no plugin " + name + ":", err);
        await m.reply("Ocorreu um erro ao executar este comando.").catch(() => {});
      }
      return;
    }
  }
  await m.reply("Comando " + command + " nao encontrado.");
}

async function checkAutoResponder(client, m) {
  const lowerBody = m.body.toLowerCase().trim();
  if (!lowerBody) return;
  for (const [keyword, response] of Object.entries(db.responses)) {
    if (lowerBody.includes(keyword.toLowerCase())) {
      const cooldownKey = m.senderNum + ":" + m.jid;
      cooldowns.set(cooldownKey, Date.now());
      if (response.type === "text") {
        await m.reply(response.content);
      } else if (response.type === "audio" || response.type === "ptt") {
        await client.sendFile(m.jid, response.content, "", "", m.key, { ptt: true });
      } else if (response.type === "image" || response.type === "video") {
        await client.sendFile(m.jid, response.content, "", response.caption ?? "", { key: m.key, message: m.message });
      }
      return;
    }
  }
}

function isOwnerCommand(command) {
  return ["ban", "unban", "broadcast", "setprefix", "reload", "shutdown", "add", "kick"].includes(command);
}

function cleanOldMessages(maxAge = 600000) {
  const now = Date.now();
  for (const [id, m] of deletedMessages) {
    if (now - m.timestamp > maxAge) deletedMessages.delete(id);
  }
}
