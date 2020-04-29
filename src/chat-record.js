const record = new Map();
const limit = 200;

exports.add = ({id, user: {id: userid, username}}, room) => {
  record.set(id, {
    room, userid, username,
  });
  
  if (overLimit()) { // Check once to skip creation of iterator
    const itr = record.keys();
    do { // In the off chance theres more than 1 stray
      const key = itr.next().value;
      record.delete(key);
    } while (overLimit());
  }
};

exports.get = (id) => record.get(id);

function overLimit() {
  return record.size > limit;
}
