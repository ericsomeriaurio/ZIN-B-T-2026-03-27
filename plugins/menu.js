import { config } from "../config.js";

export default {
  commands: ["menu", "help", "ajuda", "cmds"],
  description: "Menu de comandos",

  async run(client, m, args) {
    const p = config.prefix;
    const text =
      "╔══════════════════════╗\n" +
      "║   " + config.botName + "   ║\n" +
      "╚══════════════════════╝\n\n" +

      "👥 *ADMINISTRAÇÃO DE GRUPO*\n" +
      "┌─────────────────────\n" +
      "│ " + p + "kick — Remove membro\n" +
      "│ " + p + "add numero — Adiciona membro\n" +
      "│ " + p + "promote — Promove a admin\n" +
      "│ " + p + "demote — Remove admin\n" +
      "│ " + p + "mute — Fecha o grupo\n" +
      "│ " + p + "unmute — Abre o grupo\n" +
      "│ " + p + "hidetag texto — Marca todos\n" +
      "│ " + p + "tagall texto — Menciona todos\n" +
      "│ " + p + "setname nome — Muda nome\n" +
      "│ " + p + "setdesc texto — Muda descrição\n" +
      "│ " + p + "setpic — Muda foto do grupo\n" +
      "│ " + p + "linkgroup — Link do grupo\n" +
      "│ " + p + "revokelink — Revoga o link\n" +
      "│ " + p + "groupinfo — Info do grupo\n" +
      "└─────────────────────\n\n" +

      "⚠️ *ADVERTÊNCIAS*\n" +
      "┌─────────────────────\n" +
      "│ " + p + "warn motivo — Adverte (3=kick)\n" +
      "│ " + p + "delwarn — Remove 1 advertência\n" +
      "│ " + p + "warnlist — Lista advertências\n" +
      "│ " + p + "clearwarn — Limpa advertências\n" +
      "└─────────────────────\n\n" +

      "🛡️ *PROTEÇÕES DO GRUPO*\n" +
      "┌─────────────────────\n" +
      "│ " + p + "antilink on/off — Anti-link\n" +
      "│ " + p + "antiflood on/off — Anti-flood\n" +
      "│ " + p + "setmax N — Limite do flood\n" +
      "│ " + p + "welcome on/off msg\n" +
      "│ " + p + "goodbye on/off msg\n" +
      "└─────────────────────\n\n" +

      "👑 *APENAS DONOS*\n" +
      "┌─────────────────────\n" +
      "│ " + p + "ban — Bane do bot\n" +
      "│ " + p + "unban numero — Desbane\n" +
      "│ " + p + "banlist — Lista de banidos\n" +
      "│ " + p + "broadcast texto — Envia a todos\n" +
      "│ " + p + "setprefix ! — Muda prefixo\n" +
      "│ " + p + "reload — Recarrega plugins\n" +
      "│ " + p + "shutdown — Desliga o bot\n" +
      "└─────────────────────\n\n" +

      "🤖 *GERAL*\n" +
      "┌─────────────────────\n" +
      "│ " + p + "ping — Testa o bot\n" +
      "│ " + p + "info — Info do bot\n" +
      "│ " + p + "menu — Este menu\n" +
      "└─────────────────────\n\n" +

      "💡 *Dica:* Responda uma mensagem com o comando para usar aquela pessoa como alvo!\n" +
      "Ex: Responda com " + p + "kick para remover alguém.";

    await m.reply(text);
  },
};
