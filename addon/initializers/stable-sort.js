export function initialize( /* container, application */ ) {
  Array.prototype.stableSort = function (fn) {
    if (!fn) {
      return this.sort();
    }
    var newArr = this.map(function (item, index) {
      return {
        item: item,
        index: index
      };
    });
    return newArr.sort(function (prev, next) {
      var result = fn(prev.item, next.item);
      if (result === 0) {
        return prev.index - next.index;
      }
      return result;
    }).map(function (i) {
      return i.item;
    });
  };
}

export default {
  name: 'stable-sort',
  initialize: initialize
};
