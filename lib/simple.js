import {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto,
  downloadContentFromMessage,
  prepareWAMessageMedia,
} from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import ffmpeg from "fluent-ffmpeg";
import { Readable, PassThrough } from "stream";
import { config } from "../config.js";

export function makeSimpleClient(sock) {
  const client = { ...sock };

  client.sendText = async (jid, text, quoted = null, options = {}) => {
    const msg = { text, ...options };
    if (quoted) msg.quoted = quoted;
    return sock.sendMessage(jid, msg);
  };

  client.sendReply = async (jid, text, quoted, options = {}) => {
    return client.sendText(jid, text, quoted, options);
  };

  client.react = async (jid, emoji, key) => {
    return sock.sendMessage(jid, {
      react: { text: emoji, key },
    });
  };

  client.sendFile = async (jid, filePath, fileName = "", caption = "", quoted = null, options = {}) => {
    let buffer;

    if (Buffer.isBuffer(filePath)) {
      buffer = filePath;
    } else if (/^https?:\/\//i.test(filePath)) {
      const res = await fetch(filePath);
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      buffer = fs.readFileSync(filePath);
    }

    const detected = await fileTypeFromBuffer(buffer);
    const mime = detected?.mime ?? "application/octet-stream";
    const ext = detected?.ext ?? "bin";

    const viewOnce = options.viewOnce ?? false;

    let message = {};

    if (mime.startsWith("image/")) {
      message = {
        image: buffer,
        caption,
        ...(viewOnce ? { viewOnce: true } : {}),
        ...options,
      };
    } else if (mime.startsWith("video/")) {
      message = {
        video: buffer,
        caption,
        ...(viewOnce ? { viewOnce: true } : {}),
        ...options,
      };
    } else if (mime === "image/webp") {
      message = {
        sticker: buffer,
        ...options,
      };
    } else if (mime.startsWith("audio/")) {
      if (options.ptt ?? options.voiceNote ?? false) {
        const opusBuffer = await convertToOpus(buffer, mime);
        message = {
          audio: opusBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
          ...options,
        };
      } else {
        message = {
          audio: buffer,
          mimetype: mime,
          ...options,
        };
      }
    } else {
      message = {
        document: buffer,
        fileName: fileName || `file.${ext}`,
        mimetype: mime,
        ...options,
      };
    }

    return sock.sendMessage(jid, message, quoted ? { quoted } : {});
  };

  client.sendAudio = async (jid, source, ptt = false, quoted = null) => {
    return client.sendFile(jid, source, "", "", quoted, { ptt });
  };

  client.sendVN = async (jid, source, quoted = null) => {
    return client.sendFile(jid, source, "", "", quoted, { ptt: true, voiceNote: true });
  };

  client.sendSticker = async (jid, source, quoted = null, options = {}) => {
    let buffer;
    if (Buffer.isBuffer(source)) {
      buffer = source;
    } else if (/^https?:\/\//i.test(source)) {
      const res = await fetch(source);
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      buffer = fs.readFileSync(source);
    }

    return sock.sendMessage(jid, {
      sticker: buffer,
      ...options,
    }, quoted ? { quoted } : {});
  };

  client.sendViewOnce = async (jid, filePath, caption = "", quoted = null, options = {}) => {
    return client.sendFile(jid, filePath, "", caption, quoted, {
      ...options,
      viewOnce: true,
    });
  };

  client.sendContact = async (jid, numbers, quoted = null) => {
    const contacts = (Array.isArray(numbers) ? numbers : [numbers]).map((num) => ({
      displayName: num,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${num}\nitem1.TEL;waid=${num}:+${num}\nitem1.X-ABLabel:Celular\nEND:VCARD`,
    }));

    return sock.sendMessage(jid, {
      contacts: {
        displayName: contacts.length === 1 ? contacts[0].displayName : `${contacts.length} Contatos`,
        contacts,
      },
    }, quoted ? { quoted } : {});
  };

  client.sendLocation = async (jid, lat, lng, name = "", address = "", quoted = null) => {
    return sock.sendMessage(jid, {
      location: { degreesLatitude: lat, degreesLongitude: lng, name, address },
    }, quoted ? { quoted } : {});
  };

  client.forwardMessage = async (jid, message, forceForward = false) => {
    const content = generateForwardMessageContent(message, forceForward);
    const msg = generateWAMessageFromContent(jid, content, {
      userJid: sock.user?.id,
    });
    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
    return msg;
  };

  client.downloadMediaMessage = async (message) => {
    const type = Object.keys(message.message ?? {})[0];
    const content = message.message?.[type];
    if (!content) throw new Error("No media found in message");

    const stream = await downloadContentFromMessage(content, type.replace("Message", ""));
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };

  return client;
}

async function convertToOpus(buffer, originalMime) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    const chunks = [];

    const command = ffmpeg(input)
      .inputFormat(originalMime.split("/")[1] ?? "mp3")
      .audioCodec("libopus")
      .audioBitrate("128k")
      .format("ogg")
      .on("error", reject);

    const output = new PassThrough();
    command.pipe(output);

    output.on("data", (chunk) => chunks.push(chunk));
    output.on("end", () => resolve(Buffer.concat(chunks)));
    output.on("error", reject);

    input.end(buffer);
  });
}

function generateForwardMessageContent(message, forceForward = false) {
  const key = message.key;
  const contextInfo = { forwardingScore: forceForward ? 9999 : 1, isForwarded: true };

  const innerMessage = { ...message.message };
  const type = Object.keys(innerMessage)[0];

  if (innerMessage[type]?.contextInfo) {
    innerMessage[type].contextInfo = { ...innerMessage[type].contextInfo, ...contextInfo };
  } else if (innerMessage[type]) {
    innerMessage[type].contextInfo = contextInfo;
  }

  return innerMessage;
}
