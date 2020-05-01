// Static value
class Value {
  constructor(value) {
    this.val = value;
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
