'use strict';

var assert = require('assert');
var sinon = require('sinon');
var date = require('../lib/date.js');

describe('date', function() {
  var sandbox;
  beforeEach(function(done) {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(new Date(2000, 0, 1, 10, 30).getTime());
    done();
  });

  it('now', function(done) {
    assert.equal(date.now().format('YYYY-MM-DD HH:mm ddd Z'), '2000-01-01 10:30 Sat +09:00');
    done();
  });

  it('createMoment', function(done) {
    var now = date.now();
    assert.equal(date.create(now, '8:45').format('YYYY-MM-DD HH:mm Z'), '2000-01-01 08:45 +09:00');
    assert.equal(date.create(now, '23:00').format('YYYY-MM-DD HH:mm Z'), '2000-01-01 23:00 +09:00');
    assert.equal(date.create(now, '24:00').format('YYYY-MM-DD HH:mm Z'), '2000-01-02 00:00 +09:00');
    assert.equal(date.create(now, '25:00'), '');
    assert.equal(date.create(now, '8:60'), '');
    done();
  });

  it('getWeeks', function() {
    assert.deepStrictEqual(date.getWeeks('3'), [3]);
    assert.deepStrictEqual(date.getWeeks('1,3, 5'), [1, 3, 5]);
    assert.deepStrictEqual(date.getWeeks('1-4'), [1, 2, 3, 4]);
    assert.deepStrictEqual(date.getWeeks(''), []);
  });

  it('inWeeks', function() {
    var now = date.now();
    assert.equal(date.inWeeks(now, [6]), true);
    assert.equal(date.inWeeks(now, [1, 3, 6]), true);
    assert.equal(date.inWeeks(now, [2, 3, 4, 5]), false);
    assert.equal(date.inWeeks(now, []), false);
  });

  afterEach(function(done) {
    sandbox.restore();
    done();
  });
});

