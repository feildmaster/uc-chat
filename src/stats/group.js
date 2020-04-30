const Value = require('./value');

// Group of Values
class Group extends Value {
  constructor() {
    super(new Map());
  }

  /* Override, set "value" once */
  set(value) {
    if (!this.val) super.set(value);
    return this;
  }

  has(key) {
    return this.value.has(key);
  }

  add(key, value) {
    if (this.has(key)) {
      console.warn('Duplicate key', key);
    } else {
      this.value.set(key, value);
    }
    return this;
  }

  get(name) {
    if (!name) throw new Error('Name not provided');
    return this.value.get(name);
  }

  all() {
    const ret = [];
    for (const counter of this.value.values()) {
      ret.push(counter);
    }
    return ret;
  }
}

module.exports = Group;
