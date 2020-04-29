// Incremental counter
const Value = require ('./value');

class Counter extends Value {
  constructor(name, value = 0) {
    super(name, value);
  }
  
  increment(step = 1) {
    this.set(this.value + step);
  }
  
  add() {
    this.increment();
  }
}

module.export = Counter;
