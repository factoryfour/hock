/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]
  no-shadow: "off"
*/

const http = require('http');
const should = require('should');
const request = require('request');
const util = require('util');
const crypto = require('crypto');
const hock = require('../');
const stream = require('stream');

const PORT = 5678;

describe('Hock Multiple Request Tests', () => {
	let hockInstance;
	let httpServer;

	describe('With minimum requests', () => {
		beforeEach((done) => {
			hockInstance = hock.createHock();
			httpServer = http.createServer(hockInstance.handler).listen(PORT, (err) => {
				should.not.exist(err);
				should.exist(hockInstance);

				done();
			});
		});

		it('should succeed with once', (done) => {
			hockInstance
        .get('/url')
        .once()
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });
				hockInstance.done();
				done();
			});
		});

		it('should fail with min: 2 and a single request', (done) => {
			hockInstance
        .get('/url')
        .min(2)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });
				(function getOut() {
					hockInstance.done();
				}).should.throw();
				done();
			});
		});

		it('should succeed with min:2 and 2 requests', (done) => {
			hockInstance
        .get('/url')
        .min(2)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					hockInstance.done();
					done();
				});
			});
		});

		it('should succeed with max:2 and 1 request', (done) => {
			hockInstance
        .get('/url')
        .max(2)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				hockInstance.done();
				done();
			});
		});

		it('should succeed with max:2 and 2 requests', (done) => {
			hockInstance
        .get('/url')
        .max(2)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					hockInstance.done();
					done();
				});
			});
		});

		it('should succeed with min:2, max:3 and 2 requests', (done) => {
			hockInstance
        .get('/url')
        .min(2)
        .max(3)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					hockInstance.done();
					done();
				});
			});
		});

		it('should succeed with min:2, max:Infinity and 2 requests', (done) => {
			hockInstance
        .get('/url')
        .min(2)
        .max(Infinity)
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					hockInstance.done();
					done();
				});
			});
		});

		it('should succeed with 2 different routes with different min, max values', (done) => {
			hockInstance
        .get('/url')
        .min(2)
        .max(3)
        .reply(200, { hock: 'ok' })
        .get('/asdf')
        .once()
        .reply(200, { hock: 'ok' });

			request(`http://localhost:${PORT}/url`, (err, res, body) => {
				should.not.exist(err);
				should.exist(res);
				res.statusCode.should.equal(200);
				JSON.parse(body).should.eql({ hock: 'ok' });

				request(`http://localhost:${PORT}/asdf`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					request(`http://localhost:${PORT}/url`, (err, res, body) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						JSON.parse(body).should.eql({ hock: 'ok' });

						hockInstance.done();
						done();
					});
				});
			});
		});

		describe('min() and max() with replyWithFile', () => {
			it('should succeed with a single call', (done) => {
				hockInstance
          .get('/url')
          .replyWithFile(200, `${process.cwd()}/test/data/hello.txt`);

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					body.should.equal('this\nis\nmy\nsample\n');
					hockInstance.done((err) => {
						should.not.exist(err);
						done();
					});
				});
			});

			it('should succeed with a multiple calls', (done) => {
				hockInstance
          .get('/url')
          .twice()
          .replyWithFile(200, `${process.cwd()}/test/data/hello.txt`);

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					body.should.equal('this\nis\nmy\nsample\n');

					request(`http://localhost:${PORT}/url`, (err, res, body) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						body.should.equal('this\nis\nmy\nsample\n');
						hockInstance.done((err) => {
							should.not.exist(err);
							done();
						});
					});
				});
			});
		});

		describe('min() and max() with reply (with stream)', () => {
			const Readable = stream.Readable;

			function RandomStream(size, opt) {
				Readable.call(this, opt);
				this.lenToGenerate = size;
			}

			util.inherits(RandomStream, Readable);

			RandomStream.prototype._read = function getOut(size) {
				if (!size) {
					size = 1024; // default size
				}
				let ready = true;
				while (ready) { // only cont while push returns true
					if (size > this.lenToGenerate) { // only this left
						size = this.lenToGenerate;
					}
					if (size) {
						ready = this.push(crypto.randomBytes(size));
						this.lenToGenerate -= size;
					}
          // when done, push null and exit loop
					if (!this.lenToGenerate) {
						this.push(null);
						ready = false;
					}
				}
			};

			const streamLen = 10000000; // 10Mb

      // NOTE: We need to specify encoding: null in requests below to ensure that the response is
      // not encoded as a utf8 string (we want the binary contents from the readstream returned.)

			it('should succeed with a single call', (done) => {
				hockInstance
          .get('/url')
          .reply(200, new RandomStream(streamLen));

				request({ url: `http://localhost:${PORT}/url`, encoding: null }, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					body.length.should.equal(streamLen);
					hockInstance.done((err) => {
						should.not.exist(err);
						done();
					});
				});
			});

			it('should succeed with a multiple calls', (done) => {
				hockInstance
          .get('/url')
          .twice()
          .reply(200, new RandomStream(streamLen));

				request({ url: `http://localhost:${PORT}/url`, encoding: null }, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					body.length.should.equal(streamLen);

					request({ url: `http://localhost:${PORT}/url`, encoding: null }, (err, res, body) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						body.length.should.equal(streamLen);
						hockInstance.done((err) => {
							should.not.exist(err);
							done();
						});
					});
				});
			});

			it('should have matching body with multiple calls', (done) => {
				hockInstance
            .get('/url')
            .twice()
            .reply(200, new RandomStream(1000));

				request({ url: `http://localhost:${PORT}/url`, encoding: null }, (err, res, body1) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					body1.length.should.equal(1000);

					request({ url: `http://localhost:${PORT}/url`, encoding: null }, (err, res, body2) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						body2.length.should.equal(1000);
						body1.toString().should.equal(body2.toString());
						hockInstance.done((err) => {
							should.not.exist(err);
							done();
						});
					});
				});
			});
		});

		describe('many()', () => {
			it('should fail with no requests', (done) => {
				hockInstance
          .get('/url')
          .many()
          .reply(200, { hock: 'ok' });

				(function getOut() {
					hockInstance.done();
				}).should.throw();
				done();
			});

			it('should succeed with many requests', (done) => {
				hockInstance
          .get('/url')
          .many()
          .reply(200, { hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					request(`http://localhost:${PORT}/url`, (err, res, body) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						JSON.parse(body).should.eql({ hock: 'ok' });

						request(`http://localhost:${PORT}/url`, (err, res, body) => {
							should.not.exist(err);
							should.exist(res);
							res.statusCode.should.equal(200);
							JSON.parse(body).should.eql({ hock: 'ok' });

							hockInstance.done();
							done();
						});
					});
				});
			});
		});


		describe('any', () => {
			it('should succeed with no requests', (done) => {
				hockInstance
          .get('/url')
          .any()
          .reply(200, { hock: 'ok' })
          .done();
				done();
			});

			it('should succeed with many requests', (done) => {
				hockInstance
          .get('/url')
          .any()
          .reply(200, { hock: 'ok' });

				request(`http://localhost:${PORT}/url`, (err, res, body) => {
					should.not.exist(err);
					should.exist(res);
					res.statusCode.should.equal(200);
					JSON.parse(body).should.eql({ hock: 'ok' });

					request(`http://localhost:${PORT}/url`, (err, res, body) => {
						should.not.exist(err);
						should.exist(res);
						res.statusCode.should.equal(200);
						JSON.parse(body).should.eql({ hock: 'ok' });

						request(`http://localhost:${PORT}/url`, (err, res, body) => {
							should.not.exist(err);
							should.exist(res);
							res.statusCode.should.equal(200);
							JSON.parse(body).should.eql({ hock: 'ok' });

							hockInstance.done();
							done();
						});
					});
				});
			});
		});

		afterEach((done) => {
			httpServer.close(done);
		});
	});
});
