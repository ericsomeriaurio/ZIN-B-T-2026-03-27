# ZIN BØT v2.0 — Guia de Plugins

## Estrutura obrigatória de um plugin

```javascript
export default {
  commands: ["comando1", "alias1"],  // lista de comandos que este plugin responde
  description: "Descrição do plugin",

  async run(client, m, args) {
    // client → makeSimpleClient(sock) — métodos de envio
    // m      → objecto com todos os dados da mensagem
    // args   → array de argumentos após o comando
  },
};
```

---

## Localização dos plugins

```
plugins/
├── menu.js, ping.js, info.js  → raiz (comandos gerais)
└── admin/
    ├── admin.js               → comandos de grupo
    ├── anti-*.js              → protecções
    └── ...
```

**Imports correctos por localização:**

Plugin na raiz `plugins/`:
```javascript
import { config } from "../config.js";
import { getGroup } from "../lib/store.js";
import { isGroupAdmin } from "../lib/helpers.js";
```

Plugin em `plugins/admin/`:
```javascript
import { config } from "../../config.js";
import { getGroup } from "../../lib/store.js";
import { isGroupAdmin } from "../../lib/helpers.js";
```

**NUNCA** usar `../lib/` num plugin dentro de uma subpasta — dará erro `ERR_MODULE_NOT_FOUND`.

---

## Enviar respostas

### Responder com quoted (recomendado — bot responde à mensagem)
```javascript
await sock.sendMessage(m.jid, { text: "Olá!" }, {
  quoted: m.key ? { key: m.key, message: m.message } : undefined,
});
```

### Usando m.reply() (atalho — já faz quoted)
```javascript
await m.reply("Olá!");
```

### Enviar sem quoted
```javascript
await sock.sendMessage(m.jid, { text: "Olá!" });
```

### Enviar com menção
```javascript
await sock.sendMessage(m.jid, {
  text: "Olá @244935483240!",
  mentions: ["244935483240@s.whatsapp.net"],
});
```

### Enviar imagem
```javascript
const buffer = await fetch(url).then(r => r.arrayBuffer()).then(Buffer.from);
await sock.sendMessage(m.jid, { image: buffer, caption: "Legenda" });
```

---

## Template visual padrão

Usar a função `tpl` no `admin.js` ou recriar localmente:

```javascript
function tpl(emoji, title, lines) {
  return [
    `╭─── 『 ${emoji} *${title}* 』 ───`,
    `│`,
    ...lines.map((l) => `│ ${l}`),
    `│`,
    `╰─────────────────────`,
  ].join("\n");
}
```

Exemplo de uso:
```javascript
await send(sock, m, tpl("✅", "SUCESSO", [
  `👤 *USER:* ${m.pushName}`,
  `📜 *ACÇÃO:* Kick`,
  `✅ Concluído.`,
]));
```

---

## Verificações de permissão

```javascript
import { isGroupAdmin, isBotAdmin } from "../../lib/helpers.js";

// Verificar se é grupo
if (!m.isGroup) return m.reply("❌ Apenas em grupos.");

// Verificar se o utilizador é admin do grupo
const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins.");

// Verificar se o bot é admin
const botOk = await isBotAdmin(sock, m.jid);
if (!botOk) return m.reply("❌ Preciso ser admin.");

// Verificar se é dono do bot
if (!m.isOwner) return m.reply("❌ Apenas donos.");
```

---

## Resolver targets (alvo do comando)

```javascript
import { getTargets } from "../../lib/helpers.js";

// Suporta: menção (@pessoa), quoted (resposta), argumento numérico
const targets = getTargets(m, args);
if (!targets.length) return m.reply("❌ Marca ou responde quem deseja afectar.");

for (const t of targets) {
  const num = t.replace("@s.whatsapp.net", "");
  // fazer algo com t (JID) e num (número)
}
```

---

## Ler e escrever na base de dados

```javascript
import { getGroup, setGroup, addWarning, clearWarnings, getWarnings } from "../../lib/store.js";

// Ler configuração do grupo
const cfg = getGroup(m.jid);
console.log(cfg.antilink); // true/false

// Alterar configuração
setGroup(m.jid, "antilink", true);
setGroup(m.jid, "antilinkBan", true);

// Advertências
const count = addWarning(m.jid, senderNum);  // retorna total actual
const total = getWarnings(m.jid, senderNum);
clearWarnings(m.jid, senderNum);
```

---

## Exemplo completo — plugin simples

```javascript
// plugins/admin/meu-comando.js
import { config } from "../../config.js";
import { isGroupAdmin } from "../../lib/helpers.js";

export default {
  commands: ["meucomando", "mc"],
  description: "Exemplo de plugin",

  async run(client, m, args) {
    const sock = m.sock ?? client;

    if (!m.isGroup) return m.reply("❌ Apenas em grupos.");

    const isAdmin = await isGroupAdmin(sock, m.jid, m.sender);
    if (!isAdmin && !m.isOwner) return m.reply("❌ Apenas admins.");

    const texto = args.join(" ");
    if (!texto) return m.reply("❌ Informe um texto. Ex: .meucomando olá mundo");

    const name = m.pushName ?? m.senderNum ?? "—";

    const text = [
      `╭─── 『 ✅ *SISTEMA* 』 ───`,
      `│`,
      `│ 👤 *USER:* ${name}`,
      `│ 💬 *TEXTO:* ${texto}`,
      `│`,
      `╰─────────────────────`,
    ].join("\n");

    await sock.sendMessage(m.jid, { text }, {
      quoted: m.key ? { key: m.key, message: m.message } : undefined,
    });
  },
};
```

---

## Erros comuns e soluções

| Erro | Causa | Solução |
|---|---|---|
| `ERR_MODULE_NOT_FOUND` | Import com caminho errado | Verificar quantos `../` são necessários |
| Plugin não carrega | Sem `export default` | Adicionar `export default { ... }` |
| Bot não responde ao comando | Comando não está no array `commands` | Adicionar ao array |
| LID aparece em vez do número | Não usar `toMentionJid()` | Importar e usar `toMentionJid(jid)` |
| Menção aparece @LID | `mentionedJid` com LID em vez de @s.whatsapp.net | Usar `m.mentionJid` ou `toMentionJid()` |
| Bot não se reconhece como admin | `isBotAdmin()` a falhar | Importar de `helpers.js` — já tem lógica LID |
| Mensagens antigas processadas | `_startTime` errado | Não alterar a lógica do `main.js` |
