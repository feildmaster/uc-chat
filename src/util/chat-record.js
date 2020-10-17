const record = new Map();
const limit = 200;
const rooms = new Map();

exports.add = ({id, user: {id: userid, username}}, room) => {
  record.set(id, {
    room, userid, username,
  });

  if (!rooms.has(room)) {
    rooms.set(room, []);
  }
  const cache = rooms.get(room);
  cache.push(id);
  
  if (cache.size > limit) {
    record.delete(cache.pop());
  }
};

exports.get = (id) => record.get(id);

exports.find = (id) => [record.values()].filter((e) => e.userid === id);
