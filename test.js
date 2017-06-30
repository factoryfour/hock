const hock = require('./lib/hock');
const http = require('http');

const mock = hock.createHock();

mock
	.get('/relationships')
	.max(Infinity)
	.reply(200, {
		hello: 'hello'
	});

mock
	.get('/messaging')
	.max(Infinity)
	.reply(200, {
		data: { hello: true
		}
	});

mock
	.post('/messaging', '*')
	.max(Infinity)
	.reply(200, {
		data: { hello: true
		}
	});


const server = http.createServer(mock.handler); server.listen(7000);
