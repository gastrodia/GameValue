var world = require('./world');
var socketDefine = function (socket) {
    socket.on('outlet.update', function (data) {
        world.outlet = data;
        socket.emit('outlet.update', data);
        console.log('outlet.update success!');
    });
};
module.exports = socketDefine;
