// Manager for stats
const Group = require('./group');
const Value = require('./value');
const Counter = require('./counter');
const Counters = require('./counters');

const registry = new Group();

// Should these just be a part of group?
registry.value = function(name, value) {
  if (this.has(name)) return this.get(name);
  const ret = new Value(value);
  this.add(name, ret)
  return ret;
};

registry.counter = function(name, value) {
  if (this.has(name)) return this.get(name);
  const ret = new Counter(value);
  this.add(name, ret)
  return ret;
};

registry.group = function(name) {
  if (this.has(name)) return this.get(name);
  const value = new Group();
  this.add(name, value)
  return value;
};

registry.counters = function(name) {
  if (this.has(name)) return this.get(name);
  const value = new Counters();
  this.add(name, value)
  return value;
};

module.exports = registry;
