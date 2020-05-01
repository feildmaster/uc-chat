// Manager for stats
const Group = require('./group');
const Value = require('./value');
const Counter = require('./counter');
const Counters = require('./counters');

const registry = new Group();

exports.has = (name) => registry.has(name);

exports.clear = () => registry.clear();

exports.value = (name, value) => {
  if (this.has(name)) return registry.get(name);
  const ret = new Value(value);
  registry.add(name, ret)
  return ret;
};

exports.counter = (name, value) => {
  if (this.has(name)) return registry.get(name);
  const ret = new Counter(value);
  registry.add(name, ret)
  return ret;
};

exports.group = (name) => {
  if (this.has(name)) return registry.get(name);
  const value = new Group();
  registry.add(name, value)
  return value;
};

exports.counters = (name) =>  {
  if (this.has(name)) return registry.get(name);
  const value = new Counters();
  registry.add(name, value)
  return value;
};
