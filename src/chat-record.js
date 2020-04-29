const record = new Map();
const limit = 200;

exports.add = ({id, user}, room) => {
  const {id: userid, username} = user;
  record.set(id, {
    room, userid, username,
  });
  
  if (record.size > limit) {
    const itr = record.keys();
    do { // In the off chance theres more than 1 stray
      const key = itr.next();
      record.delete(key);
    } while (record.size > limit);
  }
};
exports.get = (id) => record.get(id);