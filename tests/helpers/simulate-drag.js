/* global MouseEvent */

var simulate = function(elem, type, ops) {

  var options, body, doc, eventDoc;

  options = $.extend({
    bubbles: true,
    cancelable: (type !== "mousemove"),
    view: window,
    detail: 0,
    screenX: 0,
    pageX: 0,
    pageY: 0,
    screenY: 0,
    clientX: 1,
    clientY: 1,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  }, ops);

  var event = new MouseEvent(type, options);

  if (event.pageX === 0 && event.pageY === 0 && Object.defineProperty) {
    eventDoc = event.relatedTarget.ownerDocument || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;

    Object.defineProperty(event, "pageX", {
      get: function() {
        return options.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
      }
    });
    Object.defineProperty(event, "pageY", {
      get: function() {
        return options.clientY +
          (doc && doc.scrollTop || body && body.scrollTop || 0) -
          (doc && doc.clientTop || body && body.clientTop || 0);
      }
    });
  }

  if (elem[type]) {
    elem[type]();
  } else if (elem.dispatchEvent) {
    elem.dispatchEvent(event);
  } else if (elem.fireEvent) {
    elem.fireEvent("on" + type, event);
  }
};

var simulateDrag = function(ele, options) {
  simulate(ele, 'mousedown');
  simulate(ele, 'mousemove', options);
};

export default simulateDrag;
