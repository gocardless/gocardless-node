var sinon = require('sinon');
var expect = require('expect.js');
var mockery = require('mockery');

var Client = require('../lib/client');

describe('Client', function() {
  var config;

  beforeEach(function() {
    config = { token: 'DATA', baseUrl: 'http://example.com' };

    mockery.enable({
      warnOnUnregistered: false,
      warnOnReplace: false,
      useCleanCache: true
    });
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.disable();
  });

  it('stores config', function() {
    var client = new Client(config)
    expect(client.config).to.be(config);
  });

  function itRegistersAResource(propName, fileName) {
    fileName = (fileName || propName);

    var resourceStub;
    var resource = { resource: 'stub' };

    beforeEach(function() {
      resourceStub = sinon.stub().returns(resource);
      mockery.registerMock('./resources/' + fileName, resourceStub);
    });

    it('initializes the resource with the client instance', function() {
      var client = new Client(config);
      expect(resourceStub.args[0][0]).to.be(client);
    });

    it('exposes the resource to the client', function() {
      var client = new Client(config);
      expect(client[propName]).to.be(resource);
    });
  }

  itRegistersAResource('bill');
  itRegistersAResource('payout');
  itRegistersAResource('preAuthorization', 'pre-authorization');
  itRegistersAResource('subscription');
  itRegistersAResource('user');

  describe('#request', function() {
    var client;
    var requestMock;

    beforeEach(function() {
      requestMock = sinon.spy();
      mockery.registerMock('request', requestMock);
      client = new (require('../lib/client'))(config);
    });

    it('delegates to request library', function() {
      var opts = { some: 'options' };
      client.request(opts);
      expect(requestMock.withArgs(opts).calledOnce).to.be.ok();
    });

    it('adds Authorization header', function() {
      var opts = { some: 'options'};
      client.request(opts);
      var authHeader = 'bearer ' + config.token;

      expect(requestMock.args[0][0].headers['Authorization']).to.be(authHeader);
    });
  });

  function itDelegatesToRequest(httpMethod, clientMethod) {
    var client;
    var requestMock;
    var opts = { some: 'options' };

    beforeEach(function() {
      requestMock = sinon.spy(function() { return requestMock });
      mockery.registerMock('request', requestMock);
      client = new (require('../lib/client'))(config);
    });

    it('returns a request', function() {
      expect(client[clientMethod](opts)).to.be(requestMock)
    });

    it('delegates to request library', function() {
      client[clientMethod](opts);
      expect(requestMock.withArgs(opts).calledOnce).to.be.ok();
    });

    it('adds a method option', function() {
      client[clientMethod](opts);
      expect(requestMock.args[0][0].method).to.be(httpMethod);
    });
  }

  describe('#get', function() {
    itDelegatesToRequest('GET', 'get');
  });

  describe('#put', function() {
    itDelegatesToRequest('PUT', 'put');
  });

  describe('#post', function() {
    itDelegatesToRequest('POST', 'post');
  });

  describe('#delete', function() {
    itDelegatesToRequest('DELETE', 'delete');
  });
});
