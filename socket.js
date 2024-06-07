let io;

module.exports = {
  init: (httpServer, cors) => {
    io = require("socket.io")(httpServer, cors);
    return io;
  },
  getio: () => {
    if (!io) {
      const error = new Error("Can't find socket connection");
      throw error;
    }
    return io;
  },
};
