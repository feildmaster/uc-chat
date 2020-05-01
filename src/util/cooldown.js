const diviser = 1e6;

function elapsed(now, last) {
  return Number(now - last) / diviser;
}

// TODO: Return cooldown time remaining
function limiter({
  cooldown,
  globalCooldown,
}) {
  const registry = new Map();
  let global; // Only used if globalCooldown

  // TRUE if allowed
  function check(trigger) {
    const now = process.hrtime.bigint();

    if (!cooldown || !registry.has(trigger)) {
      if (!checkGlobal(now)) { // Failed global
        return 'GLOBAL_BLOCKING';
      }
      if (cooldown) registry.set(trigger, now);
      return true;
    }
    
    const diff = elapsed(now, registry.get(trigger));
    if (diff > cooldown) { // Enough personal time has passed, I guess
      if (!checkGlobal(now)) { // Failed Global
        // Don't compute their diff again
        registry.delete(trigger);
        return 'GLOBAL_BLOCKING';
      }
      registry.set(trigger, now);
      return true;
    }
    return false;
  }

  // TRUE if allowed
  function checkGlobal(now) {
    if (!globalCooldown) return true;
    if (!global) {
      global = now;
      return true;
    }
    
    const diff = elapsed(now, global);
    if (diff > globalCooldown) { // Enough time has passed, I guess
      global = now;
      return true;
    }
    return false;
  }

  return { check };
}

module.exports = limiter;
