# ZIN BØT v2.0 — Arquitectura Técnica

## Stack técnica

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js v18+ (ESModules) |
| WhatsApp | @whiskeysockets/baileys |
| Logging | pino |
| Detecção MIME | file-type |
| Áudio PTT | fluent-ffmpeg + libopus |
| Persistência | JSON local (data.json) |
| Ambiente | Termux (Android ARM) ou Linux |

---

## main.js — Ponto de entrada

Responsabilidades:
- Criar a socket do Baileys com Pairing Code
- Gerir reconexão automática (excepto logout)
- Definir `global._startTime` **apenas após** `connection === "open"` — isto impede que mensagens antigas do período offline sejam processadas
- Iniciar o keep-alive (ping a cada 25s)
- Iniciar o worker de agendamentos (verifica a cada 30s)
- Escutar eventos: `messages.upsert`, `messages.update`, `group-participants.update`, `contacts.upsert`, `contacts.update`
- Carregar ficheiros `lid-mapping-*.json` da pasta `sessions/` no startup

**CRÍTICO:** `global._startTime = Infinity` no arranque e em `connection === "close"`. Só muda para `Date.now()` em `connection === "open"`. Isto resolve o problema de o bot demorar a responder após reinício.

---

## handler.js — Processador de mensagens

Responsabilidades:
- Construir o objecto `m` com todos os dados da mensagem
- Extrair `pushName` e registar no `nameMap` do `jid.js`
- Executar `runCommand()` se a mensagem começar com o prefixo
- Executar `checkAutoResponder()` se não for comando
- Executar `runGroupEvents()` para eventos do grupo
- Gerir `antiDeleteHandler()` e `antiViewOnceHandler()`

### Objecto `m` (disponível em todos os plugins)

```javascript
m = {
  key,              // chave da mensagem Baileys
  message,          // conteúdo raw da mensagem
  jid,              // JID do chat (grupo ou privado)
  sender,           // JID do remetente (LID ou @s.whatsapp.net)
  senderNum,        // número resolvido do remetente
  pushName,         // nome de exibição do remetente
  mentionJid,       // JID convertido para @s.whatsapp.net (para menções)
  isGroup,          // boolean
  fromMe,           // boolean
  type,             // tipo da mensagem (imageMessage, audioMessage, etc.)
  body,             // texto da mensagem
  isCommand,        // boolean
  isOwner,          // boolean
  sock,             // socket do Baileys
  quoted,           // mensagem citada (ou null)
  reply(text),      // responde à mensagem com quoted
  replyFile(src, caption), // responde com ficheiro
  react(emoji),     // reage à mensagem
}
```

---

## lib/plugins.js — Sistema de plugins

- Lê **recursivamente** todas as subpastas de `plugins/`
- Cada plugin deve ter `export default { commands: [], run(client, m, args) {} }`
- Nomes únicos por caminho: `admin/anti-img`, `fun/ship`, etc.
- `watchPlugins()` observa alterações com debounce de 300ms (hot-reload)
- `loadPlugin()` usa `?t=Date.now()` no URL para quebrar cache do Node.js

---

## lib/jid.js — Resolução de LID

O WhatsApp usa LID (Linked Identity) desde 2025 — identificador anónimo que não revela o número. O bot resolve em 3 camadas:

**Camada 1 — Campos Alt do Baileys:**
`message.key.participantAlt` ou `message.key.remoteJidAlt` — campos novos que trazem o JID de telefone directamente.

**Camada 2 — lidMap em memória:**
Populado por `buildMappingFromGroup()` (chamado a cada mensagem de grupo) e por `loadLidMappingsFromDisk()` (chamado no startup).

**Camada 3 — contactsMap:**
Populado pelos eventos `contacts.upsert` e `contacts.update`.

**IMPORTANTE para menções:**
Usar sempre `toMentionJid(jid)` ao construir arrays de `mentionedJid` — converte LID para `@s.whatsapp.net`. O texto deve ter `@<número>` (ex: `@244935483240`) e o array `mentions` deve ter `<número>@s.whatsapp.net`.

---

## lib/store.js — Base de dados

Ficheiro: `data.json`

```javascript
{
  groups: {
    "<jid>": {
      antilink: false,     antilinkBan: false,
      antiflood: false,    maxflood: 5,
      antiimg: false,      antiimgBan: false,
      antiaudio: false,    antiaudioBan: false,
      antivideo: false,    antivideoBan: false,
      antidoc: false,      antidocBan: false,
      antisticker: false,  antistickerBan: false,
      antistatus: false,   antistatusBan: false,
      antievento: false,   antieventoBan: false,
      antiproduto: false,  antiprodutoBan: false,
      somenteAdmins: false,
      muted: false,
      welcome: false,      welcomeMsg: "Bem-vindo(a), @user! 👋",
      goodbye: false,      goodbyeMsg: "Tchau, @user! 👋",
      avisoMsg: ""
    }
  },
  warnings: {
    "<jid>": { "<número>": 0 }
  },
  blocklist: ["número1", "número2"],
  responses: {
    "<jid>": {
      "<keyword>": { type: "text", content: "resposta" }
    }
  },
  schedules: [
    {
      id: "abc123",
      jid: "<jid>",
      text: "mensagem agendada",
      sendAt: 1234567890000,
      createdBy: "número"
    }
  ]
}
```

**NUNCA** apagar o `data.json` sem backup — contém todos os warns, banidos e configurações dos grupos.

---

## lib/helpers.js — Funções partilhadas

Importar em qualquer plugin que precise:

```javascript
import { isGroupAdmin, isBotAdmin, isStatusForward, getTargets } from "../../lib/helpers.js";
```

- `isGroupAdmin(sock, jid, participantJid)` → boolean
- `isBotAdmin(sock, jid)` → boolean — usa LID + número para compatibilidade total
- `isStatusForward(m)` → boolean — detecta `groupStatusMentionMessage` e outros tipos
- `getTargets(m, args)` → array de JIDs — suporta menção, quoted e argumento numérico

---

## events.js — Eventos automáticos do grupo

Localização: `plugins/admin/events.js`

Não é um plugin (sem `export default`) — é importado directamente pelo `handler.js` e pelo `main.js`.

Funções exportadas:
- `runGroupEvents(client, m, sock)` — chamada em cada mensagem de grupo
- `runMemberEvents(client, event, sock)` — chamada em `group-participants.update`

Ordem de verificação em `runGroupEvents`:
1. Somente admins
2. Anti-status
3. Anti-link
4. Anti-flood
5. Anti-áudio, anti-vídeo, anti-imagem, anti-documento, anti-sticker, anti-evento, anti-produto

Admins e donos estão isentos de todas as verificações.

A função `enforceViolation()` é central — recebe `banMode` (boolean):
- `false` → apaga + adverte (3 advertências = kick)
- `true` → apaga + remove imediatamente

---

## config.js — Configurações

```javascript
export const config = {
  prefix: ".",
  owners: ["244935483240"],       // números dos donos (sem @s.whatsapp.net)
  ownerLids: ["260606401740838@lid"], // LIDs dos donos
  botName: "ZIN BØT",
  botNumber: "260606401740838@lid",
  sessionDir: "./sessions",
  pluginsDir: "./plugins",
  antiDelete: { enabled: true, logToOwner: true, logToGroup: false },
  antiViewOnce: { enabled: true, logToOwner: true, logToGroup: true },
  keepAlive: { enabled: true, intervalMs: 25000 },
};
```

**NUNCA** partilhar o `config.js` publicamente — contém o número do dono.

---

## Template visual padrão (v2.0)

Todos os comandos usam este formato:

```
╭─── 『 emoji *TÍTULO* 』 ───
│
│ 👤 *CAMPO:* valor
│ 📜 *CAMPO:* valor
│
╰─────────────────────
```

A função `tpl(emoji, title, lines[])` no `admin.js` gera este template automaticamente.

Menus usam:
```
╭─── 『 *TÍTULO* 』 ───
│
├─〔 *SECÇÃO* 〕
│
│ ✧ .comando ────╼ Descrição
│
╰───────────────────────────
```
