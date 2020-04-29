const record = new Map();

exports.add = ({id, user}, room) => {
  const {id: userid, username} = user;
  record.set(id, {
    room, userid, username,
  });
};
exports.get = (id) => record.get(id);