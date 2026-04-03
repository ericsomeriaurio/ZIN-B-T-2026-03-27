import { config } from "../../config.js";
import {
  getGroup, setGroup, getWarnings, addWarning,
  clearWarnings, blockUser, unblockUser, getBlocklist,
} from "../../lib/store.js";
import { isGroupAdmin, isBotAdmin, getTargets } from "../../lib/helpers.js";
import { toMentionJid, resolveName } from "../../lib/jid.js";

// ─── TEMPLATE BASE ─────────────────────────────────────────────────────────
function tpl(emoji, title, lines) {
  return [
    `╭─── 『 ${emoji} *${title}* 』 ───`,
    `│`,
    ...lines.map((l) => `│ ${l}`),
    `│`,
    `╰─────────────────────`,
  ].join("\n");
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── SEND HELPER ───────────────────────────────────────────────────────────
async function send(sock, m, text) {
  await sock.sendMessage(m.jid, { text }, {
    quoted: m.key ? { key: m.key, message: m.message } : undefined,
  });
}

export default {
  commands: [
    "kick", "add", "promote", "demote", "linkgroup", "revokelink",
    "setname", "setdesc", "mute", "unmute", "hidetag", "tagall",
    "groupinfo", "warn", "delwarn", "warnlist", "clearwarn",
    "ban", "unban", "banlist", "broadcast", "setprefix",
    "reload", "shutdown", "antilink", "antiflood", "welcome",
    "goodbye", "setpic", "setmax",
  ],

  async run(client, m, args) {
    const cmd = m.body.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();
    const { jid, isGroup, isOwner, sender } = m;
    const sock = m.sock ?? client;
    const name = m.pushName ?? m.senderNum ?? "—";
    const time = getTime();

    const requireGroup = () => {
      if (!isGroup) { send(sock, m, tpl("❌", "ERRO", ["Este comando só funciona em grupos."])); return false; }
      return true;
    };
    const requireOwner = () => {
      if (!isOwner) { send(sock, m, tpl("🚫", "ACESSO NEGADO", ["Apenas donos do bot podem usar este comando."])); return false; }
      return true;
    };
    const requireAdmin = async () => {
      const ok = await isGroupAdmin(sock, jid, sender);
      if (!ok && !isOwner) { send(sock, m, tpl("🚫", "ACESSO NEGADO", ["Apenas admins do grupo podem usar este comando."])); return false; }
      return true;
    };
    const requireBotAdmin = async () => {
      const ok = await isBotAdmin(sock, jid);
      if (!ok) { send(sock, m, tpl("❌", "ERRO", ["Preciso ser admin do grupo para executar isso."])); return false; }
      return true;
    };

    switch (cmd) {

      case "kick": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque, responda ou informe o número de quem deseja remover."]));
        for (const t of targets) {
          const tName = resolveName(t) ?? t.replace("@s.whatsapp.net","");
          await client.groupParticipantsUpdate(jid, [t], "remove").catch(() => {});
          await send(sock, m, tpl("🛡️", "SISTEMA", [
            `👤 *OP:* ${name}`,
            `🎯 *ALVO:* @${t.replace("@s.whatsapp.net","")}`,
            `📜 *AÇÃO:* KICK`,
            `🕒 *HORA:* ${time}`,
            ``,
            `✅ Participante removido.`,
          ]));
        }
        break;
      }

      case "add": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const nums = args.map((a) => a.replace(/[^0-9]/g, "")).filter((a) => a.length > 5);
        if (!nums.length) return send(sock, m, tpl("❌", "ERRO", ["Informe o número. Ex: .add 244935483240"]));
        for (const n of nums) {
          await client.groupParticipantsUpdate(jid, [n + "@s.whatsapp.net"], "add").catch(() => {});
        }
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `👤 *OP:* ${name}`,
          `📜 *AÇÃO:* ADD`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Participante(s) adicionado(s).`,
        ]));
        break;
      }

      case "promote": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque ou responda quem deseja promover."]));
        for (const t of targets) {
          await client.groupParticipantsUpdate(jid, [t], "promote").catch(() => {});
        }
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `👤 *OP:* ${name}`,
          `🎯 *ALVO:* @${targets[0].replace("@s.whatsapp.net","")}`,
          `📜 *AÇÃO:* PROMOTE`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Promovido(s) a administrador(es).`,
        ]));
        break;
      }

      case "demote": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque ou responda quem deseja rebaixar."]));
        for (const t of targets) {
          await client.groupParticipantsUpdate(jid, [t], "demote").catch(() => {});
        }
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `👤 *OP:* ${name}`,
          `🎯 *ALVO:* @${targets[0].replace("@s.whatsapp.net","")}`,
          `📜 *AÇÃO:* DEMOTE`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Rebaixado(s) de administrador(es).`,
        ]));
        break;
      }

      case "linkgroup": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const code = await client.groupInviteCode(jid).catch(() => null);
        if (!code) return send(sock, m, tpl("❌", "ERRO", ["Não foi possível obter o link."]));
        await send(sock, m, tpl("🔗", "LINK DO GRUPO", [
          `📎 https://chat.whatsapp.com/${code}`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "revokelink": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        await client.groupRevokeInvite(jid).catch(() => {});
        const newCode = await client.groupInviteCode(jid).catch(() => null);
        await send(sock, m, tpl("🔗", "SISTEMA", [
          `📜 *AÇÃO:* REVOGAR LINK`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Link revogado!`,
          `📎 Novo: https://chat.whatsapp.com/${newCode ?? "erro"}`,
        ]));
        break;
      }

      case "setname": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const name2 = args.join(" ");
        if (!name2) return send(sock, m, tpl("❌", "ERRO", ["Informe o novo nome. Ex: .setname Meu Grupo"]));
        await client.groupUpdateSubject(jid, name2).catch(() => {});
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `📜 *AÇÃO:* SETNAME`,
          `📌 *NOVO NOME:* ${name2}`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Nome alterado com sucesso.`,
        ]));
        break;
      }

      case "setdesc": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const desc = args.join(" ");
        if (!desc) return send(sock, m, tpl("❌", "ERRO", ["Informe a nova descrição."]));
        await client.groupUpdateDescription(jid, desc).catch(() => {});
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `📜 *AÇÃO:* SETDESC`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Descrição actualizada.`,
        ]));
        break;
      }

      case "setpic": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        const quoted = m.quoted;
        if (!quoted?.message?.imageMessage) return send(sock, m, tpl("❌", "ERRO", ["Responda uma imagem com .setpic"]));
        const buffer = await client.downloadMediaMessage(quoted).catch(() => null);
        if (!buffer) return send(sock, m, tpl("❌", "ERRO", ["Não foi possível baixar a imagem."]));
        await client.updateProfilePicture(jid, buffer).catch(() => {});
        await send(sock, m, tpl("🛡️", "SISTEMA", [
          `📜 *AÇÃO:* SETPIC`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Foto do grupo actualizada.`,
        ]));
        break;
      }

      case "mute": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        await client.groupSettingUpdate(jid, "announcement").catch(() => {});
        setGroup(jid, "muted", true);
        await send(sock, m, tpl("🔇", "SISTEMA", [
          `👤 *OP:* ${name}`,
          `📜 *AÇÃO:* MUTE`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Grupo fechado. Só admins falam.`,
        ]));
        break;
      }

      case "unmute": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        if (!(await requireBotAdmin())) return;
        await client.groupSettingUpdate(jid, "not_announcement").catch(() => {});
        setGroup(jid, "muted", false);
        await send(sock, m, tpl("🔊", "SISTEMA", [
          `👤 *OP:* ${name}`,
          `📜 *AÇÃO:* UNMUTE`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Grupo aberto. Todos podem falar.`,
        ]));
        break;
      }

      case "hidetag": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const meta = await client.groupMetadata(jid).catch(() => null);
        if (!meta) return;
        const allJids = meta.participants.map((p) => p.id);
        const txt = args.join(" ") || "📢";
        await client.sendMessage(jid, { text: txt, mentions: allJids });
        break;
      }

      case "tagall": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const meta = await client.groupMetadata(jid).catch(() => null);
        if (!meta) return;
        const allJids = meta.participants.map((p) => p.id);
        const tag = args.join(" ") || "📢 Atenção a todos!";
        const mentions = allJids.map((j) => "@" + j.split("@")[0]).join(" ");
        await client.sendMessage(jid, { text: tag + "\n" + mentions, mentions: allJids });
        break;
      }

      case "groupinfo": {
        if (!requireGroup()) return;
        const meta = await client.groupMetadata(jid).catch(() => null);
        if (!meta) return send(sock, m, tpl("❌", "ERRO", ["Não foi possível obter info do grupo."]));
        const admins = meta.participants.filter((p) => p.admin).length;
        const cfg = getGroup(jid);
        await send(sock, m, tpl("🏘️", "GRUPO", [
          `📌 *NOME:* ${meta.subject}`,
          `👥 *MEMBROS:* ${meta.participants.length}`,
          `👮 *ADMINS:* ${admins}`,
          `📝 *DESC:* ${(meta.desc ?? "Sem descrição").slice(0, 50)}`,
          ``,
          `⚙️ *CONFIGURAÇÕES*`,
          `🔗 Anti-Link: ${cfg.antilink ? "✅ ON" : "❌ OFF"}`,
          `🌊 Anti-Flood: ${cfg.antiflood ? "✅ ON" : "❌ OFF"}`,
          `🖼️ Anti-Img: ${cfg.antiimg ? "✅ ON" : "❌ OFF"}`,
          `🎵 Anti-Áudio: ${cfg.antiaudio ? "✅ ON" : "❌ OFF"}`,
          `🎭 Anti-Sticker: ${cfg.antisticker ? "✅ ON" : "❌ OFF"}`,
          `👋 Boas-vindas: ${cfg.welcome ? "✅ ON" : "❌ OFF"}`,
          `🚪 Despedida: ${cfg.goodbye ? "✅ ON" : "❌ OFF"}`,
          `🔒 Só Admins: ${cfg.somenteAdmins ? "✅ ON" : "❌ OFF"}`,
          `🔇 Mutado: ${cfg.muted ? "✅ SIM" : "❌ NÃO"}`,
        ]));
        break;
      }

      case "warn": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque ou responda quem deseja advertir."]));
        const reason = args.filter((a) => !/^[0-9@+]+$/.test(a)).join(" ") || "sem motivo";
        for (const t of targets) {
          const num = t.replace("@s.whatsapp.net", "");
          const count = addWarning(jid, num);
          const lines = [
            `👤 *OP:* ${name}`,
            `🎯 *ALVO:* @${num}`,
            `📜 *MOTIVO:* ${reason}`,
            `⚠️ *ADVERT.:* ${count}/3`,
            `🕒 *HORA:* ${time}`,
          ];
          if (count >= 3) {
            lines.push(``, `🚫 Limite atingido! Removendo...`);
            await client.groupParticipantsUpdate(jid, [t], "remove").catch(() => {});
            clearWarnings(jid, num);
          }
          await sock.sendMessage(jid, {
            text: tpl("⚠️", "ADVERTÊNCIA", lines),
            mentions: [t],
          });
        }
        break;
      }

      case "delwarn": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque ou responda quem deseja remover advertência."]));
        for (const t of targets) {
          const num = t.replace("@s.whatsapp.net", "");
          const current = getWarnings(jid, num);
          if (current <= 0) {
            await sock.sendMessage(jid, { text: tpl("ℹ️", "SISTEMA", [`@${num} não tem advertências.`]), mentions: [t] });
          } else {
            clearWarnings(jid, num);
            for (let i = 0; i < current - 1; i++) addWarning(jid, num);
            await sock.sendMessage(jid, {
              text: tpl("✅", "SISTEMA", [`@${num} — advertência removida.`, `⚠️ *TOTAL:* ${current - 1}/3`]),
              mentions: [t],
            });
          }
        }
        break;
      }

      case "warnlist": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const meta = await client.groupMetadata(jid).catch(() => null);
        if (!meta) return;
        const mentions = [];
        const lines = [];
        for (const p of meta.participants) {
          const num = p.id.replace("@s.whatsapp.net", "");
          const count = getWarnings(jid, num);
          if (count > 0) {
            lines.push(`⚠️ @${num}: ${count}/3`);
            mentions.push(p.id);
          }
        }
        if (!lines.length) lines.push("✅ Nenhum membro com advertências.");
        await sock.sendMessage(jid, {
          text: tpl("📋", "ADVERTÊNCIAS", lines),
          mentions,
        });
        break;
      }

      case "clearwarn": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const targets = getTargets(m, args);
        if (!targets.length) return send(sock, m, tpl("❌", "ERRO", ["Marque ou responda quem deseja limpar advertências."]));
        for (const t of targets) {
          const num = t.replace("@s.whatsapp.net", "");
          clearWarnings(jid, num);
          await sock.sendMessage(jid, {
            text: tpl("✅", "SISTEMA", [`@${num} — advertências limpas.`]),
            mentions: [t],
          });
        }
        break;
      }

      case "antilink": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const val = args[0]?.toLowerCase();
        if (val !== "on" && val !== "off") return send(sock, m, tpl("❌", "ERRO", ["Use: .antilink on ou .antilink off"]));
        const banMode = args.includes("--ban");
        setGroup(jid, "antilink", val === "on");
        setGroup(jid, "antilinkBan", val === "on" ? banMode : false);
        const modo = banMode ? "modo *BAN*" : "modo *ADVERTÊNCIA*";
        await send(sock, m, tpl("🔗", "ANTI-LINK", [
          `📜 *STATUS:* ${val === "on" ? `✅ ACTIVADO (${modo})` : "❌ DESACTIVADO"}`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "antiflood": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const val = args[0]?.toLowerCase();
        if (val !== "on" && val !== "off") return send(sock, m, tpl("❌", "ERRO", ["Use: .antiflood on ou .antiflood off"]));
        setGroup(jid, "antiflood", val === "on");
        await send(sock, m, tpl("🌊", "ANTI-FLOOD", [
          `📜 *STATUS:* ${val === "on" ? "✅ ACTIVADO" : "❌ DESACTIVADO"}`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "setmax": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const num = parseInt(args[0]);
        if (isNaN(num) || num < 2) return send(sock, m, tpl("❌", "ERRO", ["Ex: .setmax 5"]));
        setGroup(jid, "maxflood", num);
        await send(sock, m, tpl("🌊", "ANTI-FLOOD", [
          `📜 *LIMITE:* ${num} msgs em 5s`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Limite ajustado.`,
        ]));
        break;
      }

      case "welcome": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const val = args[0]?.toLowerCase();
        if (val !== "on" && val !== "off") return send(sock, m, tpl("❌", "ERRO", ["Use: .welcome on [msg] ou .welcome off\nUse @user para mencionar o novo membro."]));
        if (val === "on" && args.length > 1) setGroup(jid, "welcomeMsg", args.slice(1).join(" "));
        setGroup(jid, "welcome", val === "on");
        await send(sock, m, tpl("👋", "BOAS-VINDAS", [
          `📜 *STATUS:* ${val === "on" ? "✅ ACTIVADO" : "❌ DESACTIVADO"}`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "goodbye": {
        if (!requireGroup()) return;
        if (!(await requireAdmin())) return;
        const val = args[0]?.toLowerCase();
        if (val !== "on" && val !== "off") return send(sock, m, tpl("❌", "ERRO", ["Use: .goodbye on [msg] ou .goodbye off"]));
        if (val === "on" && args.length > 1) setGroup(jid, "goodbyeMsg", args.slice(1).join(" "));
        setGroup(jid, "goodbye", val === "on");
        await send(sock, m, tpl("🚪", "DESPEDIDA", [
          `📜 *STATUS:* ${val === "on" ? "✅ ACTIVADO" : "❌ DESACTIVADO"}`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "ban": {
        if (!requireOwner()) return;
        const targets = getTargets(m, args);
        if (isGroup && targets.length) {
          for (const t of targets) {
            const num = t.replace("@s.whatsapp.net", "");
            blockUser(num);
            await client.groupParticipantsUpdate(jid, [t], "remove").catch(() => {});
          }
          await send(sock, m, tpl("🚫", "SISTEMA", [
            `👤 *OP:* ${name}`,
            `📜 *AÇÃO:* BAN`,
            `🕒 *HORA:* ${time}`,
            ``,
            `✅ Banido(s) e removido(s) do grupo.`,
          ]));
        } else {
          const num = args[0]?.replace(/[^0-9]/g, "");
          if (!num) return send(sock, m, tpl("❌", "ERRO", ["Informe o número ou responda a mensagem de quem deseja banir."]));
          blockUser(num);
          await send(sock, m, tpl("🚫", "SISTEMA", [
            `📜 *AÇÃO:* BAN`,
            `📱 *NÚMERO:* ${num}`,
            `🕒 *HORA:* ${time}`,
            ``,
            `✅ Número banido do bot.`,
          ]));
        }
        break;
      }

      case "unban": {
        if (!requireOwner()) return;
        const num = args[0]?.replace(/[^0-9]/g, "") ??
          getTargets(m, args)[0]?.replace("@s.whatsapp.net", "");
        if (!num) return send(sock, m, tpl("❌", "ERRO", ["Informe o número para desbanir."]));
        unblockUser(num);
        await send(sock, m, tpl("✅", "SISTEMA", [
          `📜 *AÇÃO:* UNBAN`,
          `📱 *NÚMERO:* ${num}`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Número desbanido.`,
        ]));
        break;
      }

      case "banlist": {
        if (!requireOwner()) return;
        const list = getBlocklist();
        const lines = list.length
          ? list.map((n, i) => `${i + 1}. 📱 ${n}`)
          : ["✅ Nenhum número banido."];
        await send(sock, m, tpl("🚫", "BANIDOS", lines));
        break;
      }

      case "broadcast": {
        if (!requireOwner()) return;
        const txt = args.join(" ");
        if (!txt) return send(sock, m, tpl("❌", "ERRO", ["Informe a mensagem. Ex: .broadcast Olá a todos!"]));
        const chats = await client.groupFetchAllParticipating().catch(() => ({}));
        let sent = 0;
        for (const g of Object.keys(chats)) {
          await client.sendMessage(g, {
            text: tpl("📢", "BROADCAST", [txt]),
          }).catch(() => {});
          sent++;
        }
        await send(sock, m, tpl("📢", "BROADCAST", [
          `✅ Enviado para *${sent}* grupos.`,
          `🕒 *HORA:* ${time}`,
        ]));
        break;
      }

      case "setprefix": {
        if (!requireOwner()) return;
        const np = args[0];
        if (!np) return send(sock, m, tpl("❌", "ERRO", ["Ex: .setprefix !"]));
        config.prefix = np;
        global._prefix = np;
        await send(sock, m, tpl("⚙️", "SISTEMA", [
          `📜 *AÇÃO:* SETPREFIX`,
          `📌 *NOVO PREFIXO:* [ ${np} ]`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Prefixo alterado.`,
        ]));
        break;
      }

      case "reload": {
        if (!requireOwner()) return;
        const { loadPlugins } = await import("../../lib/plugins.js");
        await loadPlugins(config.pluginsDir);
        await send(sock, m, tpl("🔄", "SISTEMA", [
          `📜 *AÇÃO:* RELOAD`,
          `🕒 *HORA:* ${time}`,
          ``,
          `✅ Plugins recarregados.`,
        ]));
        break;
      }

      case "shutdown": {
        if (!requireOwner()) return;
        await send(sock, m, tpl("🔴", "SISTEMA", [
          `📜 *AÇÃO:* SHUTDOWN`,
          `🕒 *HORA:* ${time}`,
          ``,
          `🔴 Desligando o bot...`,
        ]));
        process.exit(0);
      }
    }
  },
};
