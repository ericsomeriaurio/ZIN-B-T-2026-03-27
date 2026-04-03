import fs from "fs";
import path from "path";

// ─── MAPS EM MEMÓRIA ───────────────────────────────────────────────────────
const lidMap = new Map();        // LID → phone number
const nameMap = new Map();       // JID/LID → pushName
const contactsMap = new Map();   // JID/LID → { phoneNumber, name }

// ─── CARREGAR LID-MAPPING DO DISCO (STARTUP) ──────────────────────────────
// O Baileys guarda ficheiros lid-mapping-*.json na pasta de sessão
export function loadLidMappingsFromDisk(sessionDir) {
  try {
    const absDir = path.resolve(sessionDir);
    if (!fs.existsSync(absDir)) return;

    const files = fs.readdirSync(absDir).filter(
      (f) => f.startsWith("lid-mapping") && f.endsWith(".json")
    );

    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(absDir, file), "utf-8"));
        // Formato esperado: { "LID": "phoneNumber", ... } ou array de { lid, pn }
        if (Array.isArray(raw)) {
          for (const entry of raw) {
            if (entry.lid && entry.pn) registerMapping(entry.lid, entry.pn);
          }
        } else if (typeof raw === "object") {
          for (const [lid, pn] of Object.entries(raw)) {
            registerMapping(lid, String(pn));
          }
        }
      } catch {}
    }
    console.log(`[JID] ${lidMap.size} mapeamentos LID carregados do disco.`);
  } catch (err) {
    console.warn("[JID] Erro ao carregar lid-mappings:", err.message);
  }
}

// ─── REGISTO DE MAPEAMENTOS ────────────────────────────────────────────────
export function registerMapping(lid, phoneNumber) {
  if (!lid || !phoneNumber) return;
  const cleanLid = lid.endsWith("@lid") ? lid : lid + "@lid";
  const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, "");
  if (cleanPhone) lidMap.set(cleanLid, cleanPhone);
}

export function registerContact(jid, data) {
  if (!jid) return;
  if (data.name || data.notify) {
    nameMap.set(jid, data.name || data.notify);
  }
  if (data.phoneNumber) {
    contactsMap.set(jid, data);
    // Se o JID for LID, registar também no lidMap
    if (jid.endsWith("@lid")) {
      registerMapping(jid, data.phoneNumber);
    }
  }
}

export function registerPushName(jid, pushName) {
  if (!jid || !pushName) return;
  nameMap.set(jid, pushName);
}

// ─── RESOLUÇÃO DE NÚMERO ──────────────────────────────────────────────────
// Camada 1: campos Alt do Baileys (remoteJidAlt / participantAlt)
// Camada 2: lidMap em memória
// Camada 3: contactsMap (contacts.upsert)
export function resolveNumber(jid, msgKey = null) {
  if (!jid) return "";

  // Já é número normal
  if (jid.endsWith("@s.whatsapp.net")) {
    return jid.split("@")[0].replace(/[^0-9]/g, "");
  }

  if (jid.endsWith("@lid")) {
    // Camada 1 — campos Alt do Baileys
    if (msgKey) {
      const alt = msgKey.participantAlt ?? msgKey.remoteJidAlt;
      if (alt?.endsWith("@s.whatsapp.net")) {
        return alt.split("@")[0].replace(/[^0-9]/g, "");
      }
    }

    // Camada 2 — lidMap em memória
    const fromLidMap = lidMap.get(jid);
    if (fromLidMap) return fromLidMap;

    // Camada 3 — contactsMap
    const contact = contactsMap.get(jid);
    if (contact?.phoneNumber) return String(contact.phoneNumber).replace(/[^0-9]/g, "");

    // Fallback — retorna a parte numérica do LID (melhor que mostrar o LID completo)
    return jid.split("@")[0].replace(/[^0-9]/g, "");
  }

  return jid.replace(/[^0-9]/g, "");
}

// ─── RESOLUÇÃO DE NOME ────────────────────────────────────────────────────
export function resolveName(jid, fallback = null) {
  if (!jid) return fallback ?? "Desconhecido";

  // Tenta pelo JID directo
  const direct = nameMap.get(jid);
  if (direct) return direct;

  // Se for LID, tenta pelo número resolvido
  if (jid.endsWith("@lid")) {
    const phone = resolveNumber(jid);
    if (phone) {
      const byPhone = nameMap.get(phone + "@s.whatsapp.net");
      if (byPhone) return byPhone;
    }
  }

  return fallback ?? resolveNumber(jid) ?? "Desconhecido";
}

// ─── VERIFICAÇÃO DE DONO ──────────────────────────────────────────────────
export function isOwner(jid, owners, ownerLids = []) {
  if (!jid) return false;
  if (ownerLids.includes(jid)) return true;
  const num = resolveNumber(jid);
  return owners.includes(num);
}

// ─── CONSTRUIR MAPEAMENTO DE GRUPO ────────────────────────────────────────
export function buildMappingFromGroup(participants) {
  for (const p of participants) {
    // Regista LID ↔ número
    if (p.lid && p.id) {
      const phone = p.id.split("@")[0].replace(/[^0-9]/g, "");
      registerMapping(p.lid, phone);
    }
    // Regista nome se disponível
    if (p.id && p.notify) {
      registerPushName(p.id, p.notify);
    }
    if (p.lid && p.notify) {
      registerPushName(p.lid, p.notify);
    }
  }
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────
export function getLidMap() { return lidMap; }
export function getNameMap() { return nameMap; }

// Formata JID para menção — garante formato @s.whatsapp.net para mentions
export function toMentionJid(jid, msgKey = null) {
  if (!jid) return jid;
  if (jid.endsWith("@s.whatsapp.net")) return jid;
  if (jid.endsWith("@lid")) {
    const phone = resolveNumber(jid, msgKey);
    if (phone) return phone + "@s.whatsapp.net";
  }
  return jid;
}
