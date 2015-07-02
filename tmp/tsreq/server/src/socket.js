var world = require('./world');
var socketDefine = function (socket) {
    socket.on('outlet.update', function (data) {
        console.log('outlet.update');
        console.log(data);
        world.outlet = data;
        socket.emit('data.outletUpdate', data);
    });
    socket.on('outlet.select', function (data) {
        console.log('outlet.select');
        console.log(data);
        socket.emit('data.turnView', data);
    });
    socket.on('data.update', function (data) {
        console.log('data.update');
        console.log(data);
        world.data = data;
    });
};
module.exports = socketDefine;
