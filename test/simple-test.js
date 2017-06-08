/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

const http = require('http');
const should = require('should');
const shouldHttp = require('should-http');
const request = require('request');
const hock = require('../');

const PORT = 5678;

describe('Hock HTTP Tests', () => {
	let hockInstance;
	let httpServer;

	describe('with available ports', () => {
		before((done) => {
			hockInstance = hock.createHock();
			httpServer = http.createServer(hockInstance.handler).listen(PORT, (err) => {
				should.not.exist(err);
				should.exist(hockInstance);

				done();
			});
		});

		it('should correctly respond to an HTTP GET request', (done) => {
			hockInstance
        .get('/url')
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });
				done();
			});
		});

		it('should correctly respond to an HTTP POST request', (done) => {
			hockInstance
        .post('/post', { hock: 'post' })
        .reply(201, { hock: 'created' });

			request({
				uri: `http://localhost:${PORT}/post`,
				method: 'POST',
				json: {
					hock: 'post'
				}
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(201);
				body.should.eql({ hock: 'created' });
				done();
			});
		});

		it('should correctly respond to an HTTP PUT request', (done) => {
			hockInstance
        .put('/put', { hock: 'put' })
        .reply(204, { hock: 'updated' });

			request({
				uri: `http://localhost:${PORT}/put`,
				method: 'PUT',
				json: {
					hock: 'put'
				}
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(204);
				should.not.exist(body);
				done();
			});
		});

		it('should correctly respond to an HTTP PATCH request', (done) => {
			hockInstance
        .patch('/patch', { hock: 'patch' })
        .reply(204, { hock: 'updated' });

			request({
				uri: `http://localhost:${PORT}/patch`,
				method: 'PATCH',
				json: {
					hock: 'patch'
				}
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(204);
				should.not.exist(body);
				done();
			});
		});

		it('should correctly respond to an HTTP DELETE request', (done) => {
			hockInstance
        .delete('/delete')
        .reply(202, { hock: 'deleted' });

			request({
				uri: `http://localhost:${PORT}/delete`,
				method: 'DELETE'
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(202);
				should.exist(body);
				JSON.parse(body).should.eql({ hock: 'deleted' });
				done();
			});
		});

		it('should correctly respond to an HTTP HEAD request', (done) => {
			hockInstance
        .head('/head')
        .reply(200, '', { 'Content-Type': 'plain/text' });

			request({
				uri: `http://localhost:${PORT}/head`,
				method: 'HEAD'
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				should.exist(body);
				body.should.equal('');
				res.should.have.header('content-type', 'plain/text');
				done();
			});
		});

		it('should correctly respond to an HTTP COPY request', (done) => {
			hockInstance
        .copy('/copysrc')
        .reply(204);

			request({
				uri: `http://localhost:${PORT}/copysrc`,
				method: 'COPY'
			}, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(204);
				body.should.equal('');
				done();
			});
		});

		it('unmatched requests should throw', () => {
			hockInstance
        .head('/head')
        .reply(200, '', { 'Content-Type': 'plain/text' });

			(function getOut() {
				hockInstance.done();
			}).should.throw();
		});

		it('unmatched requests should call done callback with err', (done) => {
			hockInstance
        .head('/head')
        .reply(200, '', { 'Content-Type': 'plain/text' })
        .done((err) => {
	should.exist(err);
	done();
});
		});

		after((done) => {
			httpServer.close(done);
		});
	});

	describe('dynamic path replacing / filtering', () => {
		before((done) => {
			hockInstance = hock.createHock();
			httpServer = http.createServer(hockInstance.handler).listen(PORT, (err) => {
				should.not.exist(err);
				should.exist(hockInstance);

				done();
			});
		});

		it('should correctly use regex', (done) => {
			hockInstance
        .filteringPathRegEx(/password=[^&]*/g, 'password=XXX')
        .get('/url?password=XXX')
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url?password=artischocko`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });
				done();
			});
		});

		it('should correctly use functions', (done) => {
			hockInstance
        .filteringPath((p) => {
	p.should.equal('/url?password=artischocko');
	return '/url?password=XXX';
})
        .get('/url?password=XXX')
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url?password=artischocko`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });
				done();
			});
		});

		after((done) => {
			httpServer.close(done);
		});
	});

	describe('test if route exists', () => {
		before((done) => {
			hockInstance = hock.createHock();
			httpServer = http.createServer(hockInstance.handler).listen(PORT, (err) => {
				should.not.exist(err);
				should.exist(hockInstance);

				done();
			});
		});

		it('should allow testing for url', (done) => {
			hockInstance
        .get('/url?password=foo')
        .reply(200, { hock: 'ok' })
        .get('/arti')
        .reply(200, { hock: 'ok' });

			hockInstance.hasRoute('GET', '/url?password=foo').should.equal(true);
			hockInstance.hasRoute('GET', '/arti').should.equal(true);
			hockInstance.hasRoute('GET', '/notexist').should.equal(false);
			done();
		});

		it('matches the header', (done) => {
			hockInstance
        .get('/url?password=foo')
        .reply(200, { hock: 'ok' })
        .get('/artischocko', { 'foo-type': 'artischocke' })
        .reply(200, { hock: 'ok' });

			hockInstance
        .hasRoute('GET', '/bla?password=foo', null, { 'content-type': 'plain/text' })
        .should.equal(false);
			hockInstance
        .hasRoute('GET', '/artischocko', null, { 'foo-type': 'artischocke' })
        .should.equal(true);

			done();
		});

		it('matches the body', (done) => {
			hockInstance
        .get('/url?password=foo')
        .reply(200, { hock: 'ok' })
        .post('/artischocko', 'enteente')
        .reply(200, { hock: 'ok' });

			hockInstance.hasRoute('GET', '/bla?password=foo', 'testing').should.equal(false);
			hockInstance.hasRoute('POST', '/artischocko', 'enteente').should.equal(true);

			done();
		});

		after((done) => {
			httpServer.close(done);
		});
	});
});
