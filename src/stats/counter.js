// Incremental counter
const Value = require ('./value');

class Counter extends Value {
  constructor(value = 0) {
    super(value);
  }
  
  increment(step = 1) {
    return this.set(this.get() + step);
  }
  
  add(count = 1) {
    return this.increment(count);
  }
}

module.exports = Counter;
