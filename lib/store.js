import fs from "fs";
import path from "path";

const DB_FILE = path.resolve("./data.json");

let data = {
  groups: {},
  warnings: {},
  blocklist: [],
};

export function loadStore() {
  if (fs.existsSync(DB_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      data.groups = data.groups ?? {};
      data.warnings = data.warnings ?? {};
      data.blocklist = data.blocklist ?? [];
    } catch {
      console.warn("[Store] Arquivo corrompido, resetando...");
    }
  }
}

export function saveStore() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getGroup(jid) {
  if (!data.groups[jid]) {
    data.groups[jid] = {
      antilink: false,
      antiflood: false,
      welcome: false,
      goodbye: false,
      welcomeMsg: "Bem-vindo(a), @user! 👋",
      goodbyeMsg: "Tchau, @user! 👋",
      muted: false,
      maxflood: 5,
    };
  }
  return data.groups[jid];
}

export function setGroup(jid, key, value) {
  getGroup(jid);
  data.groups[jid][key] = value;
  saveStore();
}

export function getWarnings(jid, num) {
  if (!data.warnings[jid]) data.warnings[jid] = {};
  if (!data.warnings[jid][num]) data.warnings[jid][num] = 0;
  return data.warnings[jid][num];
}

export function addWarning(jid, num) {
  getWarnings(jid, num);
  data.warnings[jid][num]++;
  saveStore();
  return data.warnings[jid][num];
}

export function clearWarnings(jid, num) {
  if (data.warnings[jid]) {
    data.warnings[jid][num] = 0;
    saveStore();
  }
}

export function isBlocked(num) {
  return data.blocklist.includes(num);
}

export function blockUser(num) {
  if (!data.blocklist.includes(num)) {
    data.blocklist.push(num);
    saveStore();
  }
}

export function unblockUser(num) {
  data.blocklist = data.blocklist.filter((n) => n !== num);
  saveStore();
}

export function getAllGroups() {
  return data.groups;
}

export function getBlocklist() {
  return data.blocklist;
}

loadStore();
