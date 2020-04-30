// Manager for stats
const Group = require('./group');
const Value = require('./value');
const Counter = require('./counter');
const Counters = require('./counters');

const registry = new Group();

exports.has = (name) => registry.has(name);

exports.get = (name) => registry.get(name);

exports.value = (name, value) => {
  if (this.has(name)) return this.get(name);
  const value = new Value(value);
  registry.add(name, value)
  return value;
};

exports.counter = (name, value) => {
  if (this.has(name)) return this.get(name);
  const value = new Counter(value);
  registry.add(name, value)
  return value;
};

exports.group = (name) => {
  if (this.has(name)) return this.get(name);
  const value = new Group();
  registry.add(name, value)
  return value;
};

exports.counters = (name) =>  {
  if (this.has(name)) return this.get(name);
  const value = new Counters();
  registry.add(name, value)
  return value;
};
