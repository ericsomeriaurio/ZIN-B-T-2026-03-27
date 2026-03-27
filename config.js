import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const config = {
  prefix: ".",

  owners: [
    "244935483240",
    "244952224899",
  ],

  botName: "ZIN BØT",
  botNumber: "244935483240",

  sessionDir: "./sessions",
  pluginsDir: "./plugins",

  antiDelete: {
    enabled: true,
    logToOwner: true,
    logToGroup: false,
  },

  antiViewOnce: {
    enabled: true,
    logToOwner: true,
    logToGroup: true,
  },

  keepAlive: {
    enabled: true,
    intervalMs: 25000,
  },
};

export const db = {
  responses: {
    "bom dia": {
      type: "text",
      content: "Bom dia! 😊 Como posso te ajudar hoje?",
    },
    "boa tarde": {
      type: "text",
      content: "Boa tarde! 😄 Estou aqui pra ajudar!",
    },
    "boa noite": {
      type: "text",
      content: "Boa noite! 🌙 Qualquer coisa é só chamar.",
    },
    "oi": {
      type: "text",
      content: "Oii! 👋 Me diz, no que posso te ajudar?",
    },
    "help": {
      type: "text",
      content: `Comandos disponíveis:\n• ${global._prefix ?? "."}ping — testa o bot\n• ${global._prefix ?? "."}info — informações do bot\n\nDigite qualquer palavra-chave e eu respondo automaticamente!`,
    },
  },

  blocklist: [],

  userSettings: {},
};

