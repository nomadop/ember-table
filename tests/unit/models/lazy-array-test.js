import Ember from "ember";
import { module, test } from 'qunit';
import LazyArray from 'ember-table/models/lazy-array';

var loadedCount = 0;
var pendingPromises = [];
var chunkSize = 100;
var lazyArray;

function getChunk(chunkIndex) {
  var promise = new Ember.RSVP.Promise(function (resolve) {
    Ember.run.later(function () {
      var chunk = [];
      for (var i = 0; i < chunkSize; i++) {
        chunk.push({
          id: i + chunkIndex * chunkSize,
          state: 10000 - chunkSize * chunkIndex - i
        });
      }
      loadedCount += chunkSize;
      resolve(chunk);
    }, 1);
  });
  pendingPromises.push(promise);
  return promise;
}

function accessObject(idx) {
  return lazyArray.objectAt(idx - 1);
}

function asyncAssert(callback) {
  return Ember.RSVP.all(pendingPromises).then(callback);
}

module('Lazy Array TotalCount Of 200, Chunk size is 100', {
  beforeEach: function () {
    loadedCount = 0;
    chunkSize = 100;
    lazyArray = LazyArray.create({
      totalCount: 200,
      chunkSize: chunkSize,
      callback: getChunk
    });
  },

  afterEach: function () {
    lazyArray = null;
    pendingPromises = [];
  }
});

test('Should return object immediately', function (assert) {
  var obj = accessObject(1);

  assert.ok(obj, 'Should return an object');
  assert.ok(!obj.get('isLoaded'), 'Flag for unloaded object should be false');

  return asyncAssert(function () {
  });
});

test('Should load first chunk when accessing the 1th loans', function (assert) {
  accessObject(1);

  return asyncAssert(function () {
    assert.ok(loadedCount === chunkSize);
  });
});

test('Should load 1 chunks When accessing the 1th then 89th loans', function (assert) {
  accessObject(1);
  accessObject(89);

  return asyncAssert(function () {
    assert.equal(loadedCount, 1 * chunkSize);
  });
});

test('Should load 2 chunks When accessing the 1th then 90th loans', function (assert) {
  accessObject(1);
  accessObject(90);

  return asyncAssert(function () {
    assert.equal(loadedCount, 2 * chunkSize);
  });
});

test('Should load 2 chunks When accessing the 90th loans', function (assert) {
  accessObject(90);

  return asyncAssert(function () {
    assert.equal(loadedCount, 2 * chunkSize);
  });
});

test('Should load second chunk When accessing the 199th loans', function (assert) {
  accessObject(199);

  return asyncAssert(function () {
    assert.equal(loadedCount, 1 * chunkSize);
    assert.equal(accessObject(199).get('id'), 198);
  });
});

test('Should set object property to isLoaded when 5th loan loaded', function (assert) {
  var obj = accessObject(5);

  assert.ok(!obj.get('isLoaded'), 'Load flag for unloaded object should be false');

  return asyncAssert(function () {
    assert.ok(accessObject(5).get('isLoaded'), 'Load flag should be set');
  });
});

test('Should return the 5th loan When accessing the 5th loan ', function (assert) {
  accessObject(5);

  return asyncAssert(function () {
    assert.equal(accessObject(5).get('id'), 4);
  });
});

test('Should return the 101th loan When accessing the 101th loan ', function (assert) {
  accessObject(101);

  return asyncAssert(function () {
    assert.equal(accessObject(101).get('id'), 100);
  });
});

test('Should return length of 200 on init', function (assert) {
  return asyncAssert(function () {
    assert.equal(lazyArray.get('length'), 200);
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

  return asyncAssert(function () {
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

  return asyncAssert(function () {
    assert.ok(!notified, 'Should not be notified after load next chunk');
  });
});

test('Should load first chunk only one time When access object 1 then 2', function (assert) {
  accessObject(1);
  accessObject(2);

  return asyncAssert(function () {
    assert.ok(loadedCount === 100, 'only load first chunk');
  });
});

module('Lazy Array TotalCount Of 300 And chunk size 100', {
  beforeEach: function () {
    loadedCount = 0;
    chunkSize = 100;
    lazyArray = LazyArray.create({
      totalCount: 300,
      chunkSize: chunkSize,
      callback: getChunk
    });
  },

  afterEach: function () {
    lazyArray = null;
  }
});

test('Should load the 289th when access 190th', function (assert) {
  accessObject(190);

  return asyncAssert(function () {
    assert.ok(accessObject(289).get('isLoaded'), '289th should be loaded');
  });
});

module('Lazy Array TotalCount Of 51 And chunk size 50', {
  beforeEach: function () {
    loadedCount = 0;
    chunkSize = 50;
    lazyArray = LazyArray.create({
      totalCount: 51,
      chunkSize: chunkSize,
      callback: getChunk
    });
  },

  afterEach: function () {
    lazyArray = null;
  }
});

test('Should return 51th When access 51th', function (assert) {
  accessObject(51);

  return asyncAssert(function () {
    assert.ok(accessObject(51).get('id') === 50, 'should be id of 51th');
  });
});

module('Lazy Array TotalCount in String', {
  beforeEach: function () {
    loadedCount = 0;
    chunkSize = 50;
    lazyArray = LazyArray.create({
      totalCount: "50",
      chunkSize: chunkSize,
      callback: getChunk
    });
  },

  afterEach: function () {
    lazyArray = null;
  }
});

test('Should allow String type for parameter totalCount', function(assert) {
  accessObject(1);

  return asyncAssert(function () {
    assert.ok(accessObject(1).get('id') === 0, 'should be id of 1st');
  });
});
