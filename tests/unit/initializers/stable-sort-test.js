import Ember from 'ember';
import {
  initialize
}
from '../../../initializers/stable-sort';
import {
  module, test
}
from 'qunit';

var registry, application;

module('Unit | Initializer | stable sort');

test('it works without callback', function (assert) {
  initialize();
  var content = [2, 3, 4, 1];
  assert.deepEqual(content.stableSort(), [1, 2, 3, 4]);
});

test('it works with callback', function (assert) {
  initialize();
  var content = ['a', 'aaaa', 'aaa', 'aa'];
  var result = content.stableSort(function (prev, next) {
    return prev.length - next.length;
  });
  assert.deepEqual(result, ['a', 'aa', 'aaa', 'aaaa']);
});

var generateArray = function (x) {
  return Array.apply(null, new Array(x)).map(function (_, index) {
    return index;
  });
};

test('stable sort', function (assert) {
  initialize();
  var content = generateArray(100).map(function (x) {
    return {id: x, name: 'name' + (x % 2)};
  });

  var zeroArr = generateArray(50).map(function (x) {
    return {id: x * 2, name: 'name0'};
  });
  var oneArr = generateArray(50).map(function (x) {
    return {id: (x * 2 + 1), name: 'name1'};
  });

  var result = content.stableSort(function (prev, next) {
    return prev.name.localeCompare(next.name);
  });
  assert.deepEqual(result, zeroArr.concat(oneArr));
});
