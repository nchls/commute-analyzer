var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(req, res) {
	console.log((new Date()) + ' Received request for ' + req.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');	
});

var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return true;
}

wsServer.on('request', function(req) {
	if (!originIsAllowed(request.origin)) {
		req.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept('echo-protocol', request.origin);
	console.log((new Date()) + ' Connection accepted.');
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log('Received message: ' + message.utf8Data);
			connection.sendUTF(message.utf8Data);
		} else if (message.type === 'binary') {
			console.log('Received binary message of ' + message.binaryData.length + ' bytes');
			
		}
	});
});
