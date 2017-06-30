/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

const Request = require('../lib/request');
const should = require('should');

describe('Request unit tests', () => {
	describe('matching', () => {
		it('should work with defined headers in the incoming request', () => {
			const request = new Request({}, {
				method: 'GET',
				url: '/lowercasetest',
				headers: { 'foo-type': 'artischocke' }
			});

			request.isMatch({
				method: 'GET',
				url: '/lowercasetest',
				headers: { 'foo-type': 'artischocke' }
			}).should.equal(true);
		});

		it('should work with defined headers in the incoming request', () => {
			const request = new Request({}, {
				method: 'GET',
				url: '/lowercasetest',
				headers: { 'foo-type': 'artischocke' }
			});

			request.isMatch({
				method: 'GET',
				url: '/lowercasetest',
				headers: {}
			}).should.equal(false);
		});

		it('should work for a post with same body', () => {
			const request = new Request({}, {
				method: 'POST',
				url: '/postEmpty',
				headers: { 'foo-type': 'artischocke' },
				body: '*'
			});

			request.isMatch({
				method: 'POST',
				url: '/postEmpty',
				headers: { 'foo-type': 'artischocke' },
				body: {
					hello: 'world'
				}
			}).should.equal(true);
		});
	});
});
