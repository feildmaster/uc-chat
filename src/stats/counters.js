const Group = require('./group');
const Counter = require('./counter');

// Group of Counters
class Counters extends Group {
  /* Override Group */
  add(key, value) {
    if (!(value instanceof Counter)) throw new Error('Trying to add non-counter to group');
    
    return super.add(key, value);
  }

  get(name) {
    if (!name) return this.total();
    if (this.has(name)) {
      return super.get(name);
    }

    const counter = new Counter(0, name);
    this.add(name, counter);
    return counter;
  }

  total() {
    return this.all().reduce((total, counter) => total + counter.get(), 0);
  }

  top(count = 1) {
    return this.all()
      .sort((a, b) => b.get() - a.get())
      .slice(0, count);
  }

  last(count = 1) {
    return this.all()
      .sort((a, b) => a.get() - b.get())
      .slice(0, count);
  }
}

module.exports = Counters;
