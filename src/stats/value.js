// Static value
class Value {
  constructor(name, value) {
    this.n = name;
    this.set(value);
  }  
  
  set(value) {
    this.val = value;
  }
  
  get value() {
    return this.val;
  }
  
  get name() {
    return this.n;
  }
  
  toString() {
    return `${this.name}: ${this.value}`;
  }
}
