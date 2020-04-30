// Static value
class Value {
  constructor(value) {
    this.set(value);
  }  
  
  set(value) {
    this.val = value;
    return this;
  }

  get() {
    return this.val;
  }
  
  toString() {
    return `[${this.name}] ${this.value}`;
  }
}

module.exports = Value;
