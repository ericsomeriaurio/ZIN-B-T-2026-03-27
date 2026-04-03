# ZIN BØT v2.0 — Resolução de Problemas

## Bot não arranca

**Erro: `ERR_MODULE_NOT_FOUND`**
```
Cannot find module '/path/to/file.js'
```
Causa: Import com caminho errado num plugin.  
Solução: Verificar se o plugin usa `../` (raiz) ou `../../` (subpasta).

**Erro: `SyntaxError`**  
Causa: Erro de sintaxe num plugin.  
Solução: O log indica o ficheiro e a linha. Corrigir antes de reiniciar.

**Erro: `Plugin has no default export object, skipping`**  
Não é erro — significa que o ficheiro não tem `export default { ... }`. Normal para `events.js` que exporta funções nomeadas.

---

## Bot demora a responder após reinício

**Causa:** `global._startTime` incorrectamente definido.  
**Solução:** Verificar se no `main.js`:
- `global._startTime = Infinity` está no topo (não `Date.now()`)
- `global._startTime = Date.now()` está **dentro** do bloco `connection === "open"`
- `global._startTime = Infinity` está **dentro** do bloco `connection === "close"`

---

## Bot desconecta frequentemente

**Causa 1:** Keep-alive não está activo.  
Verificar em `config.js`: `keepAlive: { enabled: true, intervalMs: 25000 }`

**Causa 2:** Hospedagem gratuita com timeout.  
Solução: Usar o Termux com ecrã activo ou PM2 para manter o processo.

**Causa 3:** Sessão corrompida.  
Solução: Apagar a pasta `sessions/` e fazer novo Pairing Code.  
⚠️ Apagar sessions = logout. Fazer backup antes.

---

## Bot não se reconhece como admin

**Causa:** O bot usa LID mas `isBotAdmin()` antiga comparava só por número.  
**Solução:** Garantir que está a usar o `isBotAdmin()` do `lib/helpers.js` (não uma versão local antiga nos plugins). A versão correcta verifica: número, LID, rawId, e formato normalizado.

---

## Menções aparecem como @LID em vez do nome

**Causa:** Array `mentionedJid` contém LIDs em vez de JIDs de telefone.  
**Solução:** Usar `toMentionJid(jid)` do `lib/jid.js` antes de adicionar ao array.  
O texto deve ter `@<número>` e o array deve ter `<número>@s.whatsapp.net`.

---

## Anti-status não funciona

**Causa:** O status mencionado vem como `groupStatusMentionMessage` — tipo especial.  
**Solução:** Garantir que `events.js` está actualizado — a função `isStatusForward()` deve verificar `msg.groupStatusMentionMessage` como primeiro caso.

---

## Plugin novo não carrega

1. Verificar que tem `export default { commands: [], run() {} }`
2. Verificar que o ficheiro está na pasta `plugins/` ou subpasta
3. Verificar imports (caminhos relativos correctos)
4. Usar `.reload` para forçar recarregamento
5. Ver o terminal — o logger mostra erros de carregamento

---

## data.json corrompido

**Sintoma:** `[Store] Arquivo corrompido, resetando...` no terminal.  
**Causa:** Escrita interrompida (bot desligado a meio de uma escrita).  
**Solução:** O store.js repõe os valores padrão automaticamente. Perde os dados anteriores.  
**Prevenção:** Fazer backup regular do `data.json`.

```bash
cp ~/meubot-v2/data.json ~/meubot-v2/data.json.bak
```

---

## Erro ao gerar Pairing Code

**Erro:** `Erro ao gerar pairing code`  
**Causa:** Tentativa demasiado rápida ou número inválido.  
**Solução:** O bot tenta automaticamente de novo após 5 segundos. Se persistir:
1. Apagar `sessions/`
2. Reiniciar e tentar com número no formato: `DDI + número` (ex: `244935483240`)

---

## Como fazer backup completo

```bash
# Backup completo
cp -r ~/meubot-v2 ~/meubot-v2-backup-$(date +%Y%m%d)

# Só dados importantes
cp ~/meubot-v2/data.json ~/data-backup.json
cp -r ~/meubot-v2/sessions ~/sessions-backup
```

---

## Como restaurar sessão em outro dispositivo

1. Copiar a pasta `sessions/` para o novo dispositivo
2. Copiar `data.json`
3. Copiar `config.js`
4. Instalar dependências: `npm install`
5. Iniciar: `node main.js`

Se a sessão for reconhecida, o bot conecta sem Pairing Code. Caso contrário, apagar `sessions/` e fazer novo pareamento.

---

## Comandos de manutenção no terminal

```bash
# Iniciar o bot
cd ~/meubot-v2 && node main.js

# Ver logs em tempo real (se usar PM2)
pm2 logs zinbot

# Forçar reinício
pm2 restart zinbot

# Ver uso de memória e CPU
top

# Verificar ficheiros da sessão
ls ~/meubot-v2/sessions/

# Ver tamanho do data.json
du -sh ~/meubot-v2/data.json

# Guardar no GitHub
cd ~/meubot-v2
git add .
git commit -m "backup $(date +%Y-%m-%d)"
git push
```
