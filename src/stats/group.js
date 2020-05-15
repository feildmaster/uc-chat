const Value = require('./value');

// Group of Values
class Group extends Value {
  constructor(name) {
    super(new Map(), name);
  }

  get size() {
    return super.get().size;
  }

  /* Can not change interal map */
  set(key, value) {
    if (key && value) {
      super.get().set(key, value);
    }
    return this;
  }

  has(key) {
    return super.get().has(key);
  }

  add(key, value) {
    if (this.has(key)) {
      console.warn('Duplicate key:', key);
    }
    return this.set(key, value);
  }

  remove(key) {
    if (this.has(key)) {
      super.get().delete(key);
    }
    return this;
  }

  get(name) {
    if (!name) throw new Error('Name not provided');
    return super.get().get(name);
  }

  all() {
    const ret = [];
    for (const counter of super.get().values()) { // You lose keys here
      ret.push(counter);
    }
    return ret;
  }

  clear() {
    super.get().clear();
    return this;
  }
}

module.exports = Group;
