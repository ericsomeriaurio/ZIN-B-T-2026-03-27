let _interval = null;

export function startKeepAlive(sock, intervalMs = 25000) {
  if (_interval) clearInterval(_interval);

  console.log("[KeepAlive] Iniciando loop a cada " + intervalMs + "ms");

  _interval = setInterval(async () => {
    try {
      if (sock?.ws?.readyState === 1) {
        await sock.sendPresenceUpdate("available").catch(() => {});
      }
    } catch (err) {
      console.warn("[KeepAlive] Erro no ping:", err.message);
    }
  }, intervalMs);

  _interval.unref();

  return () => {
    if (_interval) {
      clearInterval(_interval);
      _interval = null;
      console.log("[KeepAlive] Parado.");
    }
  };
}
