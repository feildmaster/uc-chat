// Static value
class Value {
  constructor(value, name) {
    this.val = value;
    this.name = name;
  }  
  
  set(value) {
    this.val = value;
    return this;
  }

  get() {
    return this.val;
  }
}

module.exports = Value;
