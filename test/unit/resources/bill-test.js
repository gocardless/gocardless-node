var sinon = require('sinon');
var expect = require('expect.js');

expect = require('sinon-expect').enhance(expect, sinon, 'was');

var indexBehaviour = require('./shared/index-behaviour-test');

var billFactory = require('../../../lib/resources/bill');
var Resource = require('../../../lib/resources/resource');

describe('Bill resource', function() {
  var bill, id, cb;

  beforeEach(function() {
    cb = function() {};
    id = '123';
    bill = billFactory(null, id);
  });

  it('is a Resource', function() {
    expect(billFactory()).to.be.a(Resource);
  });

  indexBehaviour(billFactory);

  describe('#create', function() {
    beforeEach(function() {
      sinon.stub(bill, 'post');
    });

    it('delegates to #post with nested params and callback', function() {
      var params = {
        amount: '10.00',
        pre_authorization_id: '123ABC'
      };

      bill.create(params, cb);
      expect(bill.post).was.calledWith({ json: { bill: params } }, cb);
    });
  });

  describe('#createOneOff', function() {
    var billParams;

    beforeEach(function() {
      sinon.stub(bill, 'get');

      billParams = {
        merchant_id: id,
        amount: '10.00'
      };
    });

    it('delegates to #get with correct query params and callback', function() {
      var expectedQuery = { bill: billParams };

      bill.createOneOff(billParams, cb);

      expect(bill.get).was.calledWith({
        qs: expectedQuery,
        path: '/connect/bills/new'
      }, cb);
    });

    it('signs the request');
  });

  describe('#retry', function() {
    beforeEach(function() {
      sinon.stub(bill, 'post');
    });

    it('delegates to #post with the correct path and callback', function() {
      var retryPath = '/api/v1/bills/' + id + '/retry';
      bill.retry({ id: id }, cb);
      expect(bill.post).was.calledWith({ path: retryPath }, cb);
    });
  });
});
