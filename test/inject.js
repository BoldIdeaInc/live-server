var request = require('supertest');
var assert = require('assert');
var path = require('path');
var INJECTED_CODE = '<!-- custom injected code -->';
var es = require('event-stream');
var liveServer1 = require('..').start({
	root: path.join(__dirname, 'data'),
	port: 0,
	open: false,
	inject: function(res, stream, injectTag) {
		// We need to modify the length given to browser
		var len = INJECTED_CODE.length + res.getHeader('Content-Length');
		res.setHeader('Content-Length', len);
		var originalPipe = stream.pipe;
		stream.pipe = function(resp) {
			originalPipe.call(stream, es.replace(new RegExp(injectTag, "i"), INJECTED_CODE + injectTag)).pipe(resp);
		};
	}
});

describe('custom injection tests', function() {
	it("should respond with custom injected code", function(done) {
		request(liveServer1)
			.get('/')
			.end(function(err, res) {
				assert(res.text.indexOf(INJECTED_CODE) !== -1);
				done();
			});
	});
});
