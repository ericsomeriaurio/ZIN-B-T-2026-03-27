const lidMap = new Map();

export function registerMapping(lid, phoneNumber) {
  if (!lid || !phoneNumber) return;
  if (lid.endsWith("@lid")) {
    lidMap.set(lid, phoneNumber);
  }
}

export function resolveNumber(jid) {
  if (!jid) return "";
  if (jid.endsWith("@s.whatsapp.net")) {
    return jid.split("@")[0].replace(/[^0-9]/g, "");
  }
  if (jid.endsWith("@lid")) {
    const resolved = lidMap.get(jid);
    if (resolved) return resolved;
    return jid.split("@")[0].replace(/[^0-9]/g, "");
  }
  return jid.replace(/[^0-9]/g, "");
}

export function isOwner(jid, owners, ownerLids = []) {
  if (!jid) return false;
  if (ownerLids.includes(jid)) return true;
  const num = resolveNumber(jid);
  return owners.includes(num);
}

export function buildMappingFromGroup(participants) {
  for (const p of participants) {
    if (p.lid && p.id) {
      const phone = p.id.split("@")[0].replace(/[^0-9]/g, "");
      registerMapping(p.lid, phone);
    }
    if (p.id && p.lid) {
      const phone = p.id.split("@")[0].replace(/[^0-9]/g, "");
      registerMapping(p.lid, phone);
    }
  }
}

export function getLidMap() {
  return lidMap;
}
