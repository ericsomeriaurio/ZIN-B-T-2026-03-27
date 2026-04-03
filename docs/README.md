# ZIN BØT v2.0 — Documentação Completa

**Desenvolvedor:** Erik (Tobizin) — Angola 🇦🇴  
**Contacto:** wa.me/244935483240  
**Tecnologia:** Node.js + Baileys (WhatsApp Multi-Device)  
**Conexão:** Pairing Code (sem QR Code)

---

## O que é o ZIN BØT?

Bot de WhatsApp Multi-Device construído com a biblioteca **Baileys**, rodando em **Node.js** directamente no **Termux (Android)** ou em qualquer servidor Linux. A conexão é feita via **Pairing Code de 8 dígitos** digitado directamente no WhatsApp — sem necessidade de QR Code.

---

## Como funciona (Pipeline de mensagens)

```
Mensagem recebida
  → Filtro de tempo (ignora mensagens antigas do período offline)
  → Filtro de banidos (blocklist)
  → Captura de pushName e LID mapping
  → É comando? → Verifica permissão → Executa plugin
  → Não é comando? → Verifica auto-responder → Verifica eventos de grupo
  → Está em grupo? → Verifica anti-link, anti-flood, anti-mídia, somente-admins
```

---

## Estrutura de ficheiros

```
meubot-v2/
├── main.js              → Inicia o bot, conexão, reconexão, workers
├── handler.js           → Processa todas as mensagens recebidas
├── config.js            → Configurações (donos, prefixo, features)
├── data.json            → Banco de dados local (grupos, warns, banidos, agendamentos)
├── sessions/            → Sessão do WhatsApp — NÃO APAGAR
├── lib/
│   ├── simple.js        → Funções de envio (texto, imagem, vídeo, áudio, sticker)
│   ├── plugins.js       → Carrega e monitora plugins recursivamente
│   ├── keepalive.js     → Mantém o bot activo em hospedagens gratuitas
│   ├── logger.js        → Sistema de logs com pino
│   ├── store.js         → Leitura e escrita do data.json
│   ├── jid.js           → Resolve LID ↔ número (3 camadas)
│   └── helpers.js       → Funções partilhadas (isGroupAdmin, isBotAdmin, getTargets)
└── plugins/
    ├── menu.js          → Menu principal (com imagem)
    ├── menu-adm.js      → Submenu moderação (só admins/donos)
    ├── menu-fun.js      → Submenu brincadeiras (todos)
    ├── menu-util.js     → Submenu utilidades (todos)
    ├── menu-info.js     → Submenu informações (todos)
    ├── menu-stk.js      → Submenu figurinhas (todos)
    ├── menu-owner.js    → Submenu dono (só donos)
    ├── ping.js          → Latência e uptime
    ├── info.js          → Info do bot, myid, dono, prefixo
    ├── debug.js         → Diagnóstico (whoami, botjid)
    ├── owner.js         → Comandos de dono (broadcast, ban, reload, etc.)
    └── admin/
        ├── admin.js     → Todos os comandos de gestão de grupo
        ├── events.js    → Anti-link, anti-flood, anti-mídia, boas-vindas, saída
        ├── anti-audio.js
        ├── anti-video.js
        ├── anti-img.js
        ├── anti-doc.js
        ├── anti-sticker.js
        ├── anti-status.js
        ├── anti-evento.js
        ├── anti-produto.js
        ├── somente-admins.js
        ├── aviso.js
        ├── responder.js  → Gestão do auto-responder por grupo
        ├── agendador.js  → Agendamento de mensagens
        └── clearchat.js  → Limpar mensagens do grupo
```

---

## Como iniciar o bot

```bash
cd ~/meubot-v2
node main.js
```

Na primeira execução, pede o número de telefone e gera um **Pairing Code de 8 dígitos**.  
No WhatsApp: **Configurações → Dispositivos Conectados → Conectar com número de telefone → Digite o código**.

---

## Como actualizar plugins sem reiniciar

O bot tem **hot-reload** — qualquer ficheiro `.js` adicionado ou modificado na pasta `plugins/` (incluindo subpastas) é recarregado automaticamente em até 300ms.

Para forçar o reload de todos os plugins: `.reload`

---

## Repositório GitHub

```
https://github.com/ericsomeriaurio/ZIN-B-T-2026-03-27
```

Para guardar progresso:
```bash
cd ~/meubot-v2
git add .
git commit -m "descrição da alteração"
git push
```
