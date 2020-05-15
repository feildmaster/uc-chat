function Throttle({
  throttle = 0,
  limit = 1,
  size = 0,
  wait = 0, // TODO
}) {
  const options = {
    throttle: throttle,
  };

  const status = {
    last: 0,
    left: -1,
    throttled: false,
  };

  const pending = [];

  function reset() {
    // status.left = -1; // Resetting this gives an invalid state
    status.throttled = false;
  }

  function delay(time) {
    // reset();
    status.throttled = setTimeout(run, time);
  }

  async function run(count = 0) {
    const now = Date.now();
    
    if (!!~status.left ? status.left === 0 : count >= limit) { // Why isn't this done *after* sending a message?
      delay(options.throttle);
      return;
    } else if (status.last && options.throttle) {
      const diff = now - status.last;
      if (diff < options.throttle) {
        delay(options.throttle - diff);
        return;
      }
    }

    const fn = pending.shift();
    if (!fn) { // Nothing left
      reset();
      return;
    }
    
    status.last = now;

    const data = await fn();
    if (data) {
      status.left = data.left >= 0 ? data.left : status.left;
      options.throttle = data.delay || options.throttle;
    }

    run(count + 1); // TODO: Do a loop, you fool
  }

  function queue(fn) {
    pending.push(fn); // TODO: Safe wrapper

    if (size && pending.length > size) { // Limited queue size? Trim it
      pending.splice(0, pending.length - size);
    }

    if (!status.throttled) { // Not currently waiting? Run it
      run();
    }
  }

  // TODO: eventemitter

  return {
    queue,
  };
}

module.exports = Throttle;
