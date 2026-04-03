# ZIN BØT v2.0 — Lista de Comandos

**Prefixo padrão:** `.`  
**Mudar prefixo:** `.setprefix !`

---

## 🛡️ MODERAÇÃO (admin ou dono)

| Comando | Descrição | Permissão |
|---|---|---|
| `.kick` | Remove membro (marcar/responder/número) | Admin |
| `.add <número>` | Adiciona membro ao grupo | Admin |
| `.promote` | Promove a administrador | Admin |
| `.demote` | Rebaixa de administrador | Admin |
| `.mute` | Fecha o grupo (só admins falam) | Admin |
| `.unmute` | Abre o grupo | Admin |
| `.hidetag <texto>` | Marca todos silenciosamente | Admin |
| `.tagall <texto>` | Menciona todos com nome | Admin |
| `.setname <nome>` | Muda nome do grupo | Admin |
| `.setdesc <texto>` | Muda descrição do grupo | Admin |
| `.setpic` | Muda foto do grupo (responder imagem) | Admin |
| `.linkgroup` | Gera link do grupo | Admin |
| `.revokelink` | Revoga link e gera novo | Admin |
| `.groupinfo` | Informações e configurações do grupo | Admin |

---

## ⚠️ ADVERTÊNCIAS (admin ou dono)

| Comando | Descrição |
|---|---|
| `.warn [motivo]` | Adverte membro (3 = kick automático) |
| `.delwarn` | Remove 1 advertência |
| `.warnlist` | Lista todos com advertências |
| `.clearwarn` | Limpa todas as advertências |

---

## 🛡️ PROTECÇÕES (admin ou dono)

| Comando | Opções | Descrição |
|---|---|---|
| `.antilink on/off` | `--ban` para modo ban | Bloqueia links |
| `.antiflood on/off` | — | Bloqueia flood de mensagens |
| `.setmax <N>` | — | Define limite do flood (padrão: 5) |
| `.antiimg on/off` | `--ban` | Bloqueia imagens |
| `.antiaudio on/off` | `--ban` | Bloqueia áudios |
| `.antivideo on/off` | `--ban` | Bloqueia vídeos |
| `.antidoc on/off` | `--ban` | Bloqueia documentos |
| `.antisticker on/off` | `--ban` | Bloqueia stickers |
| `.antistatus on/off` | `--ban` | Bloqueia menções de status |
| `.antievento on/off` | `--ban` | Bloqueia eventos |
| `.antiproduto on/off` | `--ban` | Bloqueia mensagens de produto |
| `.somenteadmins on/off` | — | Só admins falam (via bot) |
| `.welcome on/off [msg]` | `@user` para mencionar | Boas-vindas automáticas |
| `.goodbye on/off [msg]` | — | Despedida automática |

**Modo `--ban`:** apaga + remove imediatamente  
**Sem `--ban`:** apaga + adverte (3 = kick)

---

## 🛠️ FERRAMENTAS DE GRUPO (admin ou dono)

| Comando | Descrição |
|---|---|
| `.aviso <texto>` | Envia aviso mencionando todos |
| `.setaviso <texto>` | Guarda aviso padrão do grupo |
| `.addresp palavra | resposta` | Adiciona auto-responder no grupo |
| `.delresp palavra` | Remove auto-responder |
| `.listresp` | Lista auto-responders do grupo |
| `.agendar 30m mensagem` | Agenda mensagem (relativo) |
| `.agendar 14:30 mensagem` | Agenda mensagem (horário fixo) |
| `.listagendar` | Lista agendamentos activos |
| `.cancelagendar <ID>` | Cancela agendamento |
| `.clearchat <N>` | Apaga últimas N mensagens |
| `.clearchat all` | Apaga todas as mensagens |
| `.del` / `.delete` / `.clear` | Apaga mensagem respondida (silencioso) |

---

## 👑 DONO (só donos do bot)

| Comando | Descrição |
|---|---|
| `.ban` | Bane utilizador do bot |
| `.unban <número>` | Desbane utilizador |
| `.banlist` | Lista de banidos |
| `.broadcast <texto>` | Envia mensagem a todos os grupos |
| `.setprefix <símbolo>` | Muda prefixo do bot |
| `.reload` | Recarrega todos os plugins |
| `.shutdown` | Desliga o bot |
| `.agendar @jid 30m msg` | Agenda para outro grupo |

---

## 🤖 GERAL (todos)

| Comando | Descrição |
|---|---|
| `.menu` | Menu principal com imagem |
| `.menu-adm` | Submenu moderação (só admins) |
| `.menu-fun` | Submenu brincadeiras |
| `.menu-util` | Submenu utilidades |
| `.menu-info` | Submenu informações |
| `.menu-stk` | Submenu figurinhas |
| `.menu-owner` | Submenu dono (só donos) |
| `.ping` | Latência e status da rede |
| `.info` | Informações do bot e hardware |
| `.myid` | Ver os seus IDs (número, JID, LID) |
| `.dono` | Contacto do desenvolvedor |
| `.prefixo` | Ver prefixo actual |
| `.addmeowner` | Adicionar-se como dono (temporário) |

---

## 📋 MENUS — Submenus planeados (v2.0 em desenvolvimento)

| Submenu | Comandos planeados |
|---|---|
| Brincadeiras | .ship, .gay, .gado, .tapa, .beijo, .pvp, .ppt, .dado, .quiz, .velha, .forca, .21, .bet |
| Figurinhas | .s, .toimg, .attp, .ttp, .steal, .meme, .tgif, .getexif |
| Utilidades | .google, .wiki, .clima, .calc, .traduzir, .img, .perfil |
| Economia | .zincoins, .rank-ativo, .rank-ghost, .rank-milionario, .loja |

---

## Como os targets funcionam

Quase todos os comandos de moderação suportam 3 formas de seleccionar o alvo:

1. **Marcar** — `@pessoa` na mensagem
2. **Responder** — responder a mensagem da pessoa com o comando
3. **Número** — `.kick 244922086243`

Exemplo: Responde a mensagem de alguém com `.kick` → a pessoa é removida.
