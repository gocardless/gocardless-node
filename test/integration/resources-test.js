var path = require('path');

var nock = require('nock');

var gocardlessFactory = require('../../lib/gocardless');

var fixtures = path.resolve('test/fixtures');
var environmentUrls = {
  live: 'https://gocardless.com',
  sandbox: 'https://sandbox.gocardless.com'
};

describe('Resource requests', function() {
  function testResources(env) {
    var server, gocardless, config;

    beforeEach(function() {
      config = {
        token:'9012IJKL',
        app_id: '1234ABCD',
        app_secret: '5678EFGH',
        merchant_id:'3456MNOP',
        sandbox: (env === 'sandbox')
      };

      gocardless = gocardlessFactory(config);
      server = nock(environmentUrls[env])
                 .matchHeader('Accept', 'application/json')
                 .matchHeader('Authorization', 'bearer ' + config.token);
    });

    describe('Bill', function() {
      it('gets one', function(done) {
        var billId = '0ABC123456';
        server
          .get('/api/v1/bills/' + billId)
          .replyWithFile(200, fixtures + '/bill.json');

        gocardless.bill.get({ id: billId }, done);
      });

      it('gets index', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id + '/bills')
          .replyWithFile(200, fixtures + '/bills.json');

        gocardless.bill.index(done);
      });

      it('creates a new bill', function(done) {
        var expectedParams = {
          bill: {
            amount: '10.0',
            pre_authorization_id: '123'
          }
        };

        server
          .post('/api/v1/bills', expectedParams)
          .replyWithFile(201, fixtures + '/bill.json');

        gocardless.bill.create({
          amount: '10.0',
          pre_authorization_id: '123'
        }, done);
      });

      it('retries a failed bill', function(done) {
        var billId = '123ABC';
        server
          .post('/api/v1/bills/' + billId + '/retry')
          .replyWithFile(201, fixtures + '/bill.json');

        gocardless.bill.retry({ id: billId }, done);
      });
    });

    describe('User', function() {
      it('gets index', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id + '/users')
          .replyWithFile(200, fixtures + '/users.json');

        gocardless.user.index(done);
      });
    });

    describe('Merchant', function() {
      it('gets self', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id)
          .replyWithFile(200, fixtures + '/merchant.json');

        gocardless.merchant.getSelf(done);
      });
    });

    describe('Payout', function() {
      it('gets one', function(done) {
        var payoutId = '0ABC123456';
        server
          .get('/api/v1/payouts/' + payoutId)
          .replyWithFile(200, fixtures + '/payout.json');

        gocardless.payout.get({ id: payoutId }, done);
      });

      it('gets index', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id + '/payouts')
          .replyWithFile(200, fixtures + '/payouts.json');

        gocardless.payout.index(done);
      });
    });

    describe('Subscription', function() {
      it('gets one', function(done) {
        server
          .get('/api/v1/subscriptions/123')
          .replyWithFile(200, fixtures + '/subscription.json');

        gocardless.subscription.get({ id: 123 }, done);
      });

      it('gets index', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id + '/subscriptions')
          .replyWithFile(200, fixtures + '/subscriptions.json');

        gocardless.subscription.index(done);
      });

      it('cancels one', function(done) {
        server
          .put('/api/v1/subscriptions/123/cancel')
          .replyWithFile(200, fixtures + '/subscription.json');

        gocardless.subscription.cancel({ id: 123 }, done);
      });
    });

    describe('PreAuthorization', function() {
      it('gets one', function(done) {
        server
          .get('/api/v1/pre_authorizations/123')
          .replyWithFile(200, fixtures + '/pre-authorization.json');

        gocardless.preAuthorization.get({ id: 123 }, done);
      });

      it('gets index', function(done) {
        server
          .get('/api/v1/merchants/' + config.merchant_id + '/pre_authorizations')
          .replyWithFile(200, fixtures + '/pre-authorizations.json');

        gocardless.preAuthorization.index(done);
      });

      it('cancels one', function(done) {
        server
          .put('/api/v1/pre_authorizations/123/cancel')
          .replyWithFile(200, fixtures + '/pre-authorization.json');

        gocardless.preAuthorization.cancel({ id: 123 }, done);
      });
    });
  }

  describe('in live mode', function() {
    testResources('live');
  });

  describe('in sandbox mode', function() {
    testResources('sandbox');
  });
});
