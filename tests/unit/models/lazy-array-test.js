import Ember from "ember";
import { module, test } from 'qunit';
import LazyArray from 'ember-table/models/lazy-array';

module('Lazy Array', {
  beforeEach: function () {
    loadedCount = 0;
    lazyArray = new LazyArray(totalCount, initSize, getNextChunk);
  },

  afterEach: function () {
    lazyArray = null;
  }
});

var loadedCount = 0;
var pendingPromises = [];
function getNextChunk() {
  var promise = new Ember.RSVP.Promise(function (resolve) {
    Ember.run.later(function () {
      var chunk = [];
      for (var i = 0; i < 100; i++) {
        chunk.push({
          id: i + loadedCount
        });
      }
      loadedCount += 100;
      resolve(chunk);
    }, 1);
  });
  pendingPromises.push(promise);
  return promise;
}

var totalCount = 200;
var initSize = 100;

var lazyArray;

function accessObject(idx) {
  return lazyArray.objectAt(idx - 1);
}

function assertLoadCount(assert, count) {
  return Ember.RSVP.all(pendingPromises).then(function () {
    assert.equal(loadedCount, count);
  });
}

function assertValue(assert, index, value) {
  accessObject(index);
  return Ember.RSVP.all(pendingPromises).then(function () {
    assert.equal(accessObject(index).id, value);
  });
}

function asyncAssert(callback) {
  return Ember.RSVP.all(pendingPromises).then(function () {
    callback();
  });
}

test('Should load next 100 loans when accessing the 90th loans', function (assert) {
  accessObject(90);

  return asyncAssert(function () {
    assert.equal(loadedCount, 200);
  });
});

test('Should not load next 100 loans When accessing the 89th loans', function (assert) {
  accessObject(89);

  return asyncAssert(function () {
    assert.equal(loadedCount, 100);
  });
});

test('Should return the 5th loan When accessing the 5th loan ', function (assert) {
  accessObject(5);

  return asyncAssert(function () {
    assert.equal(accessObject(5).id, 4);
  });
});

test('Should return the 101th loan When accessing the 101th loan ', function (assert) {
  accessObject(101);

  return asyncAssert(function () {
    assert.equal(accessObject(101).id, 100);
  });
});

test('Should return length of 200 on init', function (assert) {
  return asyncAssert(function () {
    assert.equal(lazyArray.length, 200);
  });
});

test('Should be instance of Ember.ArrayProxy', function (assert) {
  return asyncAssert(function () {
    assert.ok(lazyArray.toString().indexOf("Ember.ArrayProxy") >= 0);
  });
});

test('Should not create new body content when load next chunk', function (assert) {
  var computedCount = 0;
  var EmberTable = Ember.Object.extend({
    bodyContent: function () {
      computedCount++;
      return Ember.Object.create({});
    }.property('content.[]')
  });

  var table = EmberTable.create({content: lazyArray});
  table.get('bodyContent');
  assert.equal(computedCount, 1);

  accessObject(90);

  return asyncAssert(function() {
    table.get('bodyContent');
    assert.equal(computedCount, 1);
  });
});

test('Should not notify content length observer when load next chunk', function (assert) {
  var notified = false;
  var EmberTable = Ember.Object.extend({
    onBodyContentLengthDidChange: Ember.observer(function () {
      notified = true;
    }, 'content.length')
  });

  var table = EmberTable.create({content: lazyArray});
  assert.ok(!notified);

  accessObject(90);

  return asyncAssert(function() {
    assert.ok(!notified, 'Should not be notified after load next chunk');
  });
});
