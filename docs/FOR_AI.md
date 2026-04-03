# ZIN BØT v2.0 — Contexto para IA

> Este ficheiro existe para que outra IA possa continuar o desenvolvimento do bot sem cometer erros. Lê tudo antes de fazer qualquer alteração.

---

## Resumo do projecto

Bot de WhatsApp chamado **ZIN BØT**, desenvolvido por **Erik (Tobizin)** de Angola.  
Stack: **Node.js + Baileys (ESModules)**  
Localização no Termux: `~/meubot-v2/`  
Repositório: `https://github.com/ericsomeriaurio/ZIN-B-T-2026-03-27`

---

## Regras absolutas — NUNCA violar

1. **Sempre usar ESModules** — `import/export`, NUNCA `require()`
2. **Imports relativos correctos:**
   - Plugin em `plugins/` → `../config.js`, `../lib/store.js`
   - Plugin em `plugins/admin/` → `../../config.js`, `../../lib/store.js`
3. **NUNCA apagar** `sessions/` sem aviso — é a sessão do WhatsApp
4. **NUNCA apagar** `data.json` sem backup — contém warns, banidos e configs
5. **Sempre usar `export default { commands, run }`** nos plugins
6. **O bot responde à mensagem** com `{ quoted: m.key ? { key: m.key, message: m.message } : undefined }`
7. **Template visual obrigatório** em todas as respostas — ver secção abaixo
8. **`global._startTime`** — NUNCA mudar a lógica. É `Infinity` até `connection === "open"`

---

## Template visual padrão (OBRIGATÓRIO)

```javascript
// Respostas de comandos
const text = [
  `╭─── 『 emoji *TÍTULO* 』 ───`,
  `│`,
  `│ 👤 *CAMPO:* valor`,
  `│ 📜 *CAMPO:* valor`,
  `│`,
  `╰─────────────────────`,
].join("\n");

// Envio com quoted (responde à mensagem)
await sock.sendMessage(m.jid, { text }, {
  quoted: m.key ? { key: m.key, message: m.message } : undefined,
});
```

```javascript
// Menus
const text = [
  `╭─── 『 *TÍTULO* 』 ───`,
  `│`,
  `├─〔 *SECÇÃO* 〕`,
  `│`,
  `│ ✧ .comando ────╼ Descrição`,
  `│`,
  `╰───────────────────────────`,
].join("\n");
```

---

## Objecto `m` disponível nos plugins

```javascript
m.key          // chave da mensagem Baileys
m.message      // conteúdo raw
m.jid          // JID do chat
m.sender       // JID do remetente (pode ser LID)
m.senderNum    // número resolvido
m.pushName     // nome de exibição (usar este para mostrar nome)
m.mentionJid   // JID para menções (@s.whatsapp.net)
m.isGroup      // boolean
m.fromMe       // boolean
m.type         // tipo da mensagem
m.body         // texto
m.isCommand    // boolean
m.isOwner      // boolean
m.sock         // socket Baileys
m.quoted       // mensagem citada ou null
m.reply(text)  // responde com quoted
m.react(emoji) // reage à mensagem
```

---

## Funções disponíveis em helpers.js

```javascript
import { isGroupAdmin, isBotAdmin, isStatusForward, getTargets } from "../../lib/helpers.js";
```

---

## Funções disponíveis em store.js

```javascript
import {
  getGroup, setGroup,           // configs por grupo
  getWarnings, addWarning, clearWarnings,  // advertências
  isBlocked, blockUser, unblockUser, getBlocklist,  // banidos
  addResponse, deleteResponse, listResponses,       // auto-responder
  addSchedule, removeSchedule, getSchedules, getPendingSchedules,  // agendamentos
} from "../../lib/store.js";
```

---

## Funções disponíveis em jid.js

```javascript
import {
  resolveNumber,   // LID → número
  resolveName,     // LID/JID → pushName
  isOwner,         // verificar dono
  buildMappingFromGroup,  // popular lidMap com participants
  toMentionJid,    // LID → @s.whatsapp.net para mentions
  registerPushName,
} from "../../lib/jid.js";
```

---

## Campos do data.json (não alterar a estrutura)

```
groups: configs por grupo (antilink, antiflood, warns, welcome, etc.)
warnings: advertências por grupo e número
blocklist: números banidos do bot
responses: auto-responders por grupo
schedules: agendamentos pendentes
```

---

## Problemas conhecidos e soluções

| Problema | Solução |
|---|---|
| Bot demora após reinício | `global._startTime = Infinity` no topo, `Date.now()` só em `connection === "open"` |
| LID aparece em vez de nome | Usar `m.pushName` e `toMentionJid()` |
| Bot não é admin | Usar `isBotAdmin()` do `helpers.js` |
| Anti-status não detecta | Verificar `msg.groupStatusMentionMessage` no `isStatusForward()` |
| Plugin não carrega | Verificar `export default` e caminhos de import |
| Template quebrado | Usar array com `.join("\n")` — NUNCA template literals multiline com \n literal |

---

## Próximas funcionalidades planeadas

- Plugins de brincadeiras (`fun/`): ship, gay, gado, tapa, beijo, pvp, ppt, dado, quiz, velha, forca, 21, bet
- Plugins de figurinhas (`sticker/`): s, toimg, attp, ttp, steal, meme, tgif
- Plugins de utilidades (`util/`): google, wiki, clima, calc, traduzir, perfil
- Sistema de economia: ZinCoins, check-in diário, loja de personagens
- Perfil do utilizador com estatísticas
- Ranks: Milionário, Ativo, Ghost
- Comando inválido com sugestão inteligente (Levenshtein distance)
