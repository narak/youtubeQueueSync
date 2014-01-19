
/**
 * Module dependencies.
 */
var config = require('./config'),
    http = require('http'),
    connect = require('connect'),
    sockio = require('socket.io'),
    sock = require('./socket'),
    router = require('./router'),
    fs = require('fs'),

    logPath = 'connectjs_log.log',
    logFile = fs.createWriteStream(logPath, {flags: 'a'});

/**
 * Create server with middle wares.
 */
var app = connect()
    .use(connect.favicon())
    .use(connect.logger({
        format: 'default',
        stream: logFile,
        buffer: true
    }))
    .use(connect.json())
    .use(connect.urlencoded())
    .use(connect.static('static'))
    .use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    })
    .use(router.router);

var server = http.createServer(app).listen(config.port);
console.log('Server running on port ' + config.port);

/*
 * Socket IO
 */
/*var socket = sockio.listen(server);
socket.configure(function () {
    socket.set("transports", config.transports);
    socket.set("polling duration", config.poll_duration);
    socket.set('log level', config.log_level);
});
socket.on('connection', sock.doSocket);
console.log('Socket setup.');*/

router.get('/', function(req, res) {
    res.sendView('index.template', {
        roomName: 'Idvc Music'
    });
});

router.get('/{roomName}', function(req, res) {
    res.sendView('index.template', {
        roomName: req.params.roomName
    });
});