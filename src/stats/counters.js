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
    if (!name) throw new Error('Name not provided');
    if (this.has(name)) {
      return super.get(name);
    }

    const counter = new Counter(name);
    this.add(name, counter);
    return counter;
  }

  top(count = 1) {
    return this.all()
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  }

  last(count = 1) {
    return this.all()
      .sort((a, b) => a.value - b.value)
      .slice(0, count);
  }
}

module.exports = Counters;
