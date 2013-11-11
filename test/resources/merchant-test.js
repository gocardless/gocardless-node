var sinon = require('sinon');
var expect = require('expect.js');
var mockery = require('mockery');

expect = require('sinon-expect').enhance(expect, sinon, 'was');

var merchantFactory = require('../../lib/resources/merchant');
var Resource = require('../../lib/resources/resource');

describe('Merchant resource', function() {
  it('is a Resource', function() {
    expect(merchantFactory()).to.be.a(Resource);
  });

  describe('#getSelf', function() {
    var id, merchant, cb;

    beforeEach(function() {
      id = '123';
      cb = function() {};
      merchant = merchantFactory(null, id);
      sinon.stub(merchant, 'get');
    });

    it('delegates to #get with ownId and callback', function() {
      merchant.getSelf(cb);
      expect(merchant.get).was.calledWith({ id: id }, cb);
    });
  });
});
