export const config = {
  prefix: ".",

  owners: [
    "244935483240",
  ],

  ownerLids: ["260606401740838@lid"],

  botName: "ZIN BØT",
  botNumber: "260606401740838@lid",

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
    "bom dia": { type: "text", content: "Bom dia! 😊 Como posso te ajudar?" },
    "boa tarde": { type: "text", content: "Boa tarde! 😄 Estou aqui pra ajudar!" },
    "boa noite": { type: "text", content: "Boa noite! 🌙 Qualquer coisa é só chamar." },
    "oi": { type: "text", content: "Oii! 👋 No que posso te ajudar?" },
    "help": { type: "text", content: "Digite .menu para ver todos os comandos!" },
  },
  blocklist: [],
  userSettings: {},
};
