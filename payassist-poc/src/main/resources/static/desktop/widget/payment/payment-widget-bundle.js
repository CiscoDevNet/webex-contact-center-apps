(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseGlobal = void 0;
var promise_polyfill_1 = __importDefault(require("promise-polyfill"));
var PromiseGlobal = 
// eslint-disable-next-line no-undef
typeof Promise !== "undefined" ? Promise : promise_polyfill_1.default;
exports.PromiseGlobal = PromiseGlobal;

},{"promise-polyfill":131}],5:[function(require,module,exports){
"use strict";
var promise_1 = require("./lib/promise");
var scriptPromiseCache = {};
function loadScript(options) {
    var scriptLoadPromise;
    var stringifiedOptions = JSON.stringify(options);
    if (!options.forceScriptReload) {
        scriptLoadPromise = scriptPromiseCache[stringifiedOptions];
        if (scriptLoadPromise) {
            return scriptLoadPromise;
        }
    }
    var script = document.createElement("script");
    var attrs = options.dataAttributes || {};
    var container = options.container || document.head;
    script.src = options.src;
    script.id = options.id || "";
    script.async = true;
    if (options.crossorigin) {
        script.setAttribute("crossorigin", "" + options.crossorigin);
    }
    Object.keys(attrs).forEach(function (key) {
        script.setAttribute("data-" + key, "" + attrs[key]);
    });
    scriptLoadPromise = new promise_1.PromiseGlobal(function (resolve, reject) {
        script.addEventListener("load", function () {
            resolve(script);
        });
        script.addEventListener("error", function () {
            reject(new Error(options.src + " failed to load."));
        });
        script.addEventListener("abort", function () {
            reject(new Error(options.src + " has aborted."));
        });
        container.appendChild(script);
    });
    scriptPromiseCache[stringifiedOptions] = scriptLoadPromise;
    return scriptLoadPromise;
}
loadScript.clearCache = function () {
    scriptPromiseCache = {};
};
module.exports = loadScript;

},{"./lib/promise":4}],6:[function(require,module,exports){
module.exports = require("./dist/load-script");

},{"./dist/load-script":5}],7:[function(require,module,exports){
"use strict";
module.exports = function isAndroid(ua) {
    ua = ua || window.navigator.userAgent;
    return /Android/.test(ua);
};

},{}],8:[function(require,module,exports){
"use strict";
module.exports = function isChromeOS(ua) {
    ua = ua || window.navigator.userAgent;
    return /CrOS/i.test(ua);
};

},{}],9:[function(require,module,exports){
"use strict";
var isEdge = require("./is-edge");
var isSamsung = require("./is-samsung");
var isDuckDuckGo = require("./is-duckduckgo");
var isOpera = require("./is-opera");
var isSilk = require("./is-silk");
module.exports = function isChrome(ua) {
    ua = ua || window.navigator.userAgent;
    return ((ua.indexOf("Chrome") !== -1 || ua.indexOf("CriOS") !== -1) &&
        !isEdge(ua) &&
        !isSamsung(ua) &&
        !isDuckDuckGo(ua) &&
        !isOpera(ua) &&
        !isSilk(ua));
};

},{"./is-duckduckgo":10,"./is-edge":11,"./is-opera":20,"./is-samsung":21,"./is-silk":22}],10:[function(require,module,exports){
"use strict";
module.exports = function isDuckDuckGo(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("DuckDuckGo/") !== -1;
};

},{}],11:[function(require,module,exports){
"use strict";
module.exports = function isEdge(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("Edge/") !== -1;
};

},{}],12:[function(require,module,exports){
"use strict";
module.exports = function isFirefox(ua) {
    ua = ua || window.navigator.userAgent;
    return /Firefox/i.test(ua);
};

},{}],13:[function(require,module,exports){
"use strict";
var isIE11 = require("./is-ie11");
module.exports = function isIE(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("MSIE") !== -1 || isIE11(ua);
};

},{"./is-ie11":15}],14:[function(require,module,exports){
"use strict";
module.exports = function isIe10(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("MSIE 10") !== -1;
};

},{}],15:[function(require,module,exports){
"use strict";
module.exports = function isIe11(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("Trident/7") !== -1;
};

},{}],16:[function(require,module,exports){
"use strict";
module.exports = function isIe9(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("MSIE 9") !== -1;
};

},{}],17:[function(require,module,exports){
"use strict";
var isIos = require("./is-ios");
function isGoogleSearchApp(ua) {
    return /\bGSA\b/.test(ua);
}
module.exports = function isIosGoogleSearchApp(ua) {
    ua = ua || window.navigator.userAgent;
    return isIos(ua) && isGoogleSearchApp(ua);
};

},{"./is-ios":19}],18:[function(require,module,exports){
"use strict";
var isIos = require("./is-ios");
var isIosGoogleSearchApp = require("./is-ios-google-search-app");
module.exports = function isIosWebview(ua) {
    ua = ua || window.navigator.userAgent;
    if (isIos(ua)) {
        // The Google Search iOS app is technically a webview and doesn't support popups.
        if (isIosGoogleSearchApp(ua)) {
            return true;
        }
        return /.+AppleWebKit(?!.*Safari)/.test(ua);
    }
    return false;
};

},{"./is-ios":19,"./is-ios-google-search-app":17}],19:[function(require,module,exports){
"use strict";
module.exports = function isIos(ua) {
    ua = ua || window.navigator.userAgent;
    return /iPhone|iPod|iPad/i.test(ua);
};

},{}],20:[function(require,module,exports){
"use strict";
module.exports = function isOpera(ua) {
    ua = ua || window.navigator.userAgent;
    return (ua.indexOf("OPR/") !== -1 ||
        ua.indexOf("Opera/") !== -1 ||
        ua.indexOf("OPT/") !== -1);
};

},{}],21:[function(require,module,exports){
"use strict";
module.exports = function isSamsungBrowser(ua) {
    ua = ua || window.navigator.userAgent;
    return /SamsungBrowser/i.test(ua);
};

},{}],22:[function(require,module,exports){
"use strict";
module.exports = function isSilk(ua) {
    ua = ua || window.navigator.userAgent;
    return ua.indexOf("Silk/") !== -1;
};

},{}],23:[function(require,module,exports){
module.exports = require("./dist/is-android");

},{"./dist/is-android":7}],24:[function(require,module,exports){
module.exports = require("./dist/is-chrome-os");

},{"./dist/is-chrome-os":8}],25:[function(require,module,exports){
module.exports = require("./dist/is-chrome");

},{"./dist/is-chrome":9}],26:[function(require,module,exports){
module.exports = require("./dist/is-edge");

},{"./dist/is-edge":11}],27:[function(require,module,exports){
module.exports = require("./dist/is-firefox");

},{"./dist/is-firefox":12}],28:[function(require,module,exports){
module.exports = require("./dist/is-ie");

},{"./dist/is-ie":13}],29:[function(require,module,exports){
module.exports = require("./dist/is-ie10");

},{"./dist/is-ie10":14}],30:[function(require,module,exports){
module.exports = require("./dist/is-ie9");

},{"./dist/is-ie9":16}],31:[function(require,module,exports){
module.exports = require("./dist/is-ios-webview");

},{"./dist/is-ios-webview":18}],32:[function(require,module,exports){
module.exports = require("./dist/is-ios");

},{"./dist/is-ios":19}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle = exports.remove = exports.add = void 0;
function _classesOf(element) {
    return element.className.trim().split(/\s+/);
}
function add(element) {
    var toAdd = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toAdd[_i - 1] = arguments[_i];
    }
    element.className = _classesOf(element)
        .filter(function (classname) { return toAdd.indexOf(classname) === -1; })
        .concat(toAdd)
        .join(" ");
}
exports.add = add;
function remove(element) {
    var toRemove = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toRemove[_i - 1] = arguments[_i];
    }
    element.className = _classesOf(element)
        .filter(function (classname) { return toRemove.indexOf(classname) === -1; })
        .join(" ");
}
exports.remove = remove;
function toggle(element, classname, adding) {
    if (adding) {
        add(element, classname);
    }
    else {
        remove(element, classname);
    }
}
exports.toggle = toggle;

},{}],34:[function(require,module,exports){
"use strict";
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this._events = {};
    }
    EventEmitter.prototype.on = function (event, callback) {
        if (this._events[event]) {
            this._events[event].push(callback);
        }
        else {
            this._events[event] = [callback];
        }
    };
    EventEmitter.prototype.off = function (event, callback) {
        var eventCallbacks = this._events[event];
        if (!eventCallbacks) {
            return;
        }
        var indexOfCallback = eventCallbacks.indexOf(callback);
        eventCallbacks.splice(indexOfCallback, 1);
    };
    EventEmitter.prototype._emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var eventCallbacks = this._events[event];
        if (!eventCallbacks) {
            return;
        }
        eventCallbacks.forEach(function (callback) {
            callback.apply(void 0, args);
        });
    };
    EventEmitter.prototype.hasListener = function (event) {
        var eventCallbacks = this._events[event];
        if (!eventCallbacks) {
            return false;
        }
        return eventCallbacks.length > 0;
    };
    EventEmitter.createChild = function (ChildObject) {
        ChildObject.prototype = Object.create(EventEmitter.prototype, {
            constructor: ChildObject,
        });
    };
    return EventEmitter;
}());
module.exports = EventEmitter;

},{}],35:[function(require,module,exports){
"use strict";
var GlobalPromise = (typeof Promise !== "undefined"
    ? Promise // eslint-disable-line no-undef
    : null);
var ExtendedPromise = /** @class */ (function () {
    function ExtendedPromise(options) {
        var _this = this;
        if (typeof options === "function") {
            this._promise = new ExtendedPromise.Promise(options);
            return;
        }
        this._promise = new ExtendedPromise.Promise(function (resolve, reject) {
            _this._resolveFunction = resolve;
            _this._rejectFunction = reject;
        });
        options = options || {};
        this._onResolve = options.onResolve || ExtendedPromise.defaultOnResolve;
        this._onReject = options.onReject || ExtendedPromise.defaultOnReject;
        if (ExtendedPromise.shouldCatchExceptions(options)) {
            this._promise.catch(function () {
                // prevents unhandled promise rejection warning
                // in the console for extended promises that
                // that catch the error in an asynchronous manner
            });
        }
        this._resetState();
    }
    ExtendedPromise.defaultOnResolve = function (result) {
        return ExtendedPromise.Promise.resolve(result);
    };
    ExtendedPromise.defaultOnReject = function (err) {
        return ExtendedPromise.Promise.reject(err);
    };
    ExtendedPromise.setPromise = function (PromiseClass) {
        ExtendedPromise.Promise = PromiseClass;
    };
    ExtendedPromise.shouldCatchExceptions = function (options) {
        if (options.hasOwnProperty("suppressUnhandledPromiseMessage")) {
            return Boolean(options.suppressUnhandledPromiseMessage);
        }
        return Boolean(ExtendedPromise.suppressUnhandledPromiseMessage);
    };
    // start Promise methods documented in:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Methods
    ExtendedPromise.all = function (args) {
        return ExtendedPromise.Promise.all(args);
    };
    ExtendedPromise.allSettled = function (args) {
        return ExtendedPromise.Promise.allSettled(args);
    };
    ExtendedPromise.race = function (args) {
        return ExtendedPromise.Promise.race(args);
    };
    ExtendedPromise.reject = function (arg) {
        return ExtendedPromise.Promise.reject(arg);
    };
    ExtendedPromise.resolve = function (arg) {
        return ExtendedPromise.Promise.resolve(arg);
    };
    ExtendedPromise.prototype.then = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this._promise).then.apply(_a, args);
    };
    ExtendedPromise.prototype.catch = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this._promise).catch.apply(_a, args);
    };
    ExtendedPromise.prototype.resolve = function (arg) {
        var _this = this;
        if (this.isFulfilled) {
            return this;
        }
        this._setResolved();
        ExtendedPromise.Promise.resolve()
            .then(function () {
            return _this._onResolve(arg);
        })
            .then(function (argForResolveFunction) {
            _this._resolveFunction(argForResolveFunction);
        })
            .catch(function (err) {
            _this._resetState();
            _this.reject(err);
        });
        return this;
    };
    ExtendedPromise.prototype.reject = function (arg) {
        var _this = this;
        if (this.isFulfilled) {
            return this;
        }
        this._setRejected();
        ExtendedPromise.Promise.resolve()
            .then(function () {
            return _this._onReject(arg);
        })
            .then(function (result) {
            _this._setResolved();
            _this._resolveFunction(result);
        })
            .catch(function (err) {
            return _this._rejectFunction(err);
        });
        return this;
    };
    ExtendedPromise.prototype._resetState = function () {
        this.isFulfilled = false;
        this.isResolved = false;
        this.isRejected = false;
    };
    ExtendedPromise.prototype._setResolved = function () {
        this.isFulfilled = true;
        this.isResolved = true;
        this.isRejected = false;
    };
    ExtendedPromise.prototype._setRejected = function () {
        this.isFulfilled = true;
        this.isResolved = false;
        this.isRejected = true;
    };
    ExtendedPromise.Promise = GlobalPromise;
    return ExtendedPromise;
}());
module.exports = ExtendedPromise;

},{}],36:[function(require,module,exports){
"use strict";
var set_attributes_1 = require("./lib/set-attributes");
var default_attributes_1 = require("./lib/default-attributes");
var assign_1 = require("./lib/assign");
module.exports = function createFrame(options) {
    if (options === void 0) { options = {}; }
    var iframe = document.createElement("iframe");
    var config = assign_1.assign({}, default_attributes_1.defaultAttributes, options);
    if (config.style && typeof config.style !== "string") {
        assign_1.assign(iframe.style, config.style);
        delete config.style;
    }
    set_attributes_1.setAttributes(iframe, config);
    if (!iframe.getAttribute("id")) {
        iframe.id = iframe.name;
    }
    return iframe;
};

},{"./lib/assign":37,"./lib/default-attributes":38,"./lib/set-attributes":39}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = void 0;
function assign(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
target) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    objs.forEach(function (obj) {
        if (typeof obj !== "object") {
            return;
        }
        Object.keys(obj).forEach(function (key) {
            target[key] = obj[key];
        });
    });
    return target;
}
exports.assign = assign;

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAttributes = void 0;
exports.defaultAttributes = {
    src: "about:blank",
    frameBorder: 0,
    allowtransparency: true,
    scrolling: "no",
};

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAttributes = void 0;
function setAttributes(element, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
attributes) {
    for (var key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            var value = attributes[key];
            if (value == null) {
                element.removeAttribute(key);
            }
            else {
                element.setAttribute(key, value);
            }
        }
    }
}
exports.setAttributes = setAttributes;

},{}],40:[function(require,module,exports){
'use strict';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;

    return v.toString(16);
  });
}

module.exports = uuid;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deferred(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        setTimeout(function () {
            try {
                fn.apply(void 0, args);
            }
            catch (err) {
                /* eslint-disable no-console */
                console.log("Error in callback function");
                console.log(err);
                /* eslint-enable no-console */
            }
        }, 1);
    };
}
exports.deferred = deferred;

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function once(fn) {
    var called = false;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!called) {
            called = true;
            fn.apply(void 0, args);
        }
    };
}
exports.once = once;

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable consistent-return */
function promiseOrCallback(promise, callback) {
    if (!callback) {
        return promise;
    }
    promise.then(function (data) { return callback(null, data); }).catch(function (err) { return callback(err); });
}
exports.promiseOrCallback = promiseOrCallback;

},{}],44:[function(require,module,exports){
"use strict";
var deferred_1 = require("./lib/deferred");
var once_1 = require("./lib/once");
var promise_or_callback_1 = require("./lib/promise-or-callback");
function wrapPromise(fn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var callback;
        var lastArg = args[args.length - 1];
        if (typeof lastArg === "function") {
            callback = args.pop();
            callback = once_1.once(deferred_1.deferred(callback));
        }
        // I know, I know, this looks bad. But it's a quirk of the library that
        // we need to allow passing the this context to the original function
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore: this has an implicit any
        return promise_or_callback_1.promiseOrCallback(fn.apply(this, args), callback); // eslint-disable-line no-invalid-this
    };
}
wrapPromise.wrapPrototype = function (target, options) {
    if (options === void 0) { options = {}; }
    var ignoreMethods = options.ignoreMethods || [];
    var includePrivateMethods = options.transformPrivateMethods === true;
    var methods = Object.getOwnPropertyNames(target.prototype).filter(function (method) {
        var isNotPrivateMethod;
        var isNonConstructorFunction = method !== "constructor" &&
            typeof target.prototype[method] === "function";
        var isNotAnIgnoredMethod = ignoreMethods.indexOf(method) === -1;
        if (includePrivateMethods) {
            isNotPrivateMethod = true;
        }
        else {
            isNotPrivateMethod = method.charAt(0) !== "_";
        }
        return (isNonConstructorFunction && isNotPrivateMethod && isNotAnIgnoredMethod);
    });
    methods.forEach(function (method) {
        var original = target.prototype[method];
        target.prototype[method] = wrapPromise(original);
    });
    return target;
};
module.exports = wrapPromise;

},{"./lib/deferred":41,"./lib/once":42,"./lib/promise-or-callback":43}],45:[function(require,module,exports){
!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var i in n)("object"==typeof exports?exports:e)[i]=n[i]}}(window,(function(){return function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=62)}([function(e,t,n){window,e.exports=function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=8)}([function(e,t){e.exports=n(4)},function(e,t){e.exports=n(38)},function(e,t){e.exports=n(8)},function(e,t){e.exports=n(41)},function(e,t){e.exports=n(63)},function(e,t){e.exports=n(64)},function(e,t){e.exports=n(59)},function(e,t){e.exports=n(61)},function(e,t,n){"use strict";n.r(t),n.d(t,"createBrowserNotifications",(function(){return f})),n.d(t,"BrowserNotification",(function(){return l})),n.d(t,"Decorator",(function(){return p})),n.d(t,"Err",(function(){return d})),n.d(t,"Evt",(function(){return m})),n.d(t,"createHttp",(function(){return b})),n.d(t,"createLogger",(function(){return u})),n.d(t,"Logger",(function(){return a})),n.d(t,"createNotifications",(function(){return C})),n.d(t,"Notifications",(function(){return E})),n.d(t,"Signal",(function(){return k})),n.d(t,"I18N",(function(){return T}));var i=n(0),r=n.n(i),o=n(1);const s=(...e)=>e.map(e=>"string"==typeof e?e:JSON.stringify(e));var a;function u(e){const t=new a.Service(e);return a.POOL.addLogger(t),t}!function(e){e.MAX_LOGS_SIZE=1048576,e.LS_LOGS_KEY="uuip-logs";const t=/[\u0100-\uFFFF]/g;let n;!function(e){e[e.Trace=1]="Trace",e[e.Debug=2]="Debug",e[e.Warn=3]="Warn",e[e.Error=4]="Error",e[e.Fatal=5]="Fatal"}(n=e.Level||(e.Level={})),e.Service=class{constructor(e){this.loggerEmitter=r()(),this.prefix=e}log(t,...n){const i=s(this.prefix?[""+this.prefix,...n]:n),r=Date.now(),a=o.DateTime.fromMillis(r).toFormat("yyyy-LL-dd HH:mm:ss:SSS");switch(t){case e.Level.Trace:console.info(a,...i);break;case e.Level.Debug:console.log(a,...i);break;case e.Level.Warn:console.warn(a,...i);break;case e.Level.Error:case e.Level.Fatal:console.error(a,...i);break;default:console.log(...i)}const u={pfx:this.prefix,msgs:[...n],ts:r,lvl:t};this.emit("add",u)}info(...e){this.log(n.Trace,...e)}warn(...e){this.log(n.Warn,...e)}error(...e){this.log(n.Error,...e)}emit(e,...t){this.loggerEmitter.emit(e,...t)}addEventListener(e,t){return this.loggerEmitter.on(e,t),()=>{this.removeEventListener(e,t)}}removeEventListener(e,t){this.loggerEmitter.off(e,t)}};class i{constructor(){this.loggers=new Map,this.logsCollection=[],this.prefixedLogsCollections={},this.logRecordsSerializedLength=0,this.onLoggerAddRecord=e=>{this.addLogRecord(e),this.save()},this.restore()}static getSerializedJsonLogRecordBytesSize(e=""){const n=e.length;if(n){const i=e.replace(t,"").length;return 1*i+2*(n-i)}return n}get serializedJsonLogsBytesSize(){const e=this.logsCollection.length;return 2+this.logRecordsSerializedLength+1*(e-1)}save(){window.localStorage.setItem(e.LS_LOGS_KEY,JSON.stringify(this.logsCollection))}restore(){try{(JSON.parse(window.localStorage.getItem(e.LS_LOGS_KEY)||"[]")||[]).forEach(e=>this.addLogRecord(e))}catch(e){console.warn("Logger failed read logs from localStorage: ",e)}}addLogRecord(t){for(this.logsCollection.push(t),this.logRecordsSerializedLength+=i.getSerializedJsonLogRecordBytesSize(JSON.stringify(t)),this.prefixedLogsCollections[t.pfx]=this.prefixedLogsCollections[t.pfx]||new Set,this.prefixedLogsCollections[t.pfx].add(t);this.serializedJsonLogsBytesSize>e.MAX_LOGS_SIZE;)this.logsCollection.length&&this.removeLogRecord(this.logsCollection[0])}removeLogRecord(e){if(e){const t=this.logsCollection.indexOf(e);-1!==t&&(this.logsCollection.splice(t,1),this.logRecordsSerializedLength-=i.getSerializedJsonLogRecordBytesSize(JSON.stringify(e)),this.prefixedLogsCollections[e.pfx]&&this.prefixedLogsCollections[e.pfx].has(e)&&this.prefixedLogsCollections[e.pfx].delete(e))}}static getLogRecordReadable(e){return{prefix:e.pfx,messages:e.msgs,timestamp:o.DateTime.fromMillis(e.ts).toFormat("yyyy-LL-dd HH:mm:ss:SSS"),level:n[e.lvl]}}static getLogsReadableJson(e){const t=e=>e.map(e=>i.getLogRecordReadable(e));return JSON.stringify(Array.isArray(e)?t(e):Object.keys(e).reduce((n,i)=>(n[i]=t(e[i]),n),{}),null,2)}static getLogsReadableText(e){const t=e=>e.reduce((e,t)=>{const n=i.getLogRecordReadable(t);return e+(n.timestamp+" ")+n.prefix+" "+n.level+" "+s(n.messages).join(" ")+" \r\n"},"");return Array.isArray(e)?t(e):Object.keys(e).reduce((n,i)=>(n+=`[SERVICE "${i}" LOGS]: `)+t(e[i]),"")}static getLogsUrl(e){return"data:text/plain;charset=utf-8,"+encodeURIComponent(e)}static browserDownload(e,t){try{if(document&&document.createElement){const n=document.createElement("a");n.setAttribute("href",e),n.setAttribute("download",t),n.style.display="none",document.body.appendChild(n),n.click(),document.body.removeChild(n)}else console.warn("Browser is not supported to download logs")}catch(e){}}addLogger(e){this.loggers.set(e.prefix,e),e.removeEventListener("add",this.onLoggerAddRecord),e.addEventListener("add",this.onLoggerAddRecord)}getAllLogsJsonUrl(){return i.getLogsUrl(i.getLogsReadableJson(this.logsCollection))}getAllPrefixedLogsJsonUrl(){return i.getLogsUrl(i.getLogsReadableJson(this.getAllPrefixedLogsCollections()))}getPrefixedLogsJsonUrl(e){return i.getLogsUrl(i.getLogsReadableJson(this.getPrefixedLogsCollection(e)))}getAllLogsTextUrl(){return i.getLogsUrl(i.getLogsReadableText(this.logsCollection))}getPrefixedLogsTextUrl(e){return i.getLogsUrl(i.getLogsReadableText(this.getPrefixedLogsCollection(e)))}browserDownloadAllLogsJson(){i.browserDownload(this.getAllLogsJsonUrl(),new Date+"_all_logs.json")}browserDownloadAllPrefixedLogsJson(){i.browserDownload(this.getAllPrefixedLogsJsonUrl(),new Date+"_all_prefixed_logs.json")}browserDownloadPrefixedLogsJson(e){i.browserDownload(this.getPrefixedLogsJsonUrl(e),`${new Date}_${e}_logs.json`)}browserDownloadAllLogsText(){i.browserDownload(this.getAllLogsTextUrl(),new Date+"_all_logs.log")}browserDownloadPrefixedLogsText(e){i.browserDownload(this.getPrefixedLogsTextUrl(e),`${new Date}_${e}_logs.log`)}cleanupAllLogs(){this.logsCollection.length=0,this.logRecordsSerializedLength=0,Object.keys(this.prefixedLogsCollections).forEach(e=>this.prefixedLogsCollections[e]=new Set),this.save()}cleanupPrefixedLogs(e){this.getPrefixedLogsCollection(e).forEach(e=>this.removeLogRecord(e)),this.prefixedLogsCollections[e]=new Set,this.save()}getAllLogsCollection(){return[...this.logsCollection]}getAllPrefixedLogsCollections(){return Object.keys(this.prefixedLogsCollections).reduce((e,t)=>(e[t]=this.getPrefixedLogsCollection(t),e),{})}getPrefixedLogsCollection(e){return Array.from(this.prefixedLogsCollections[e]||new Set)}}e.ServicesPool=i,e.POOL=new e.ServicesPool}(a||(a={}));const c=u("unified-ui-platform-sdk");var l,d;function f(e){return new l.Service(e)}function h(e,t){if(e.descriptor=e.descriptor||Object.getOwnPropertyDescriptor(e.target,e.key),"function"!=typeof e.descriptor.value)return console.warn(e.key,"Decorator must be used on function"),e.descriptor;const n=e.descriptor.value,i=e.target.constructor.name;return e.descriptor.value=function(){const e=[];for(let t=0;t<arguments.length;t++)e[t]=arguments[t];return t.call(this,n,e,i)},e.descriptor}!function(e){class t{constructor(e){this.defaultOptions=e||{}}static get isBrowserNotificationPromiseSupported(){try{window.Notification.requestPermission().then()}catch(e){return!1}return!0}get isBrowserNotificationSupported(){return!!("Notification"in window)}get isBrowserNotificationIconSupported(){return this.isBrowserNotificationSupported&&"icon"in window.Notification.prototype}get isBrowserNotificationImageSupported(){return this.isBrowserNotificationSupported&&"image"in window.Notification.prototype}get isBrowserNotificationBadgeSupported(){return this.isBrowserNotificationSupported&&"badge"in window.Notification.prototype}get isPermissionGranted(){return"granted"===window.Notification.permission}get isPermissionDenied(){return"denied"===window.Notification.permission}get isPermissionUnknown(){return!this.isPermissionGranted&&!this.isPermissionDenied}requestNotificationUserPermission(){return function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))}(this,void 0,void 0,(function*(){this.isBrowserNotificationSupported?t.isBrowserNotificationPromiseSupported?yield window.Notification.requestPermission():yield new Promise(e=>window.Notification.requestPermission(t=>e(t))):c.warn("Browser notification is not supported...")}))}fire(e,t){return new window.Notification(e,Object.assign(Object.assign({},this.defaultOptions),t||{}))}}e.Service=t}(l||(l={})),function(e){class t extends Error{constructor(e,t){super(),this.isErr="yes",this.id=e,this.stack=(new Error).stack,"string"==typeof t?this.message=t:t instanceof Error?(this.message=t.message,this.name=t.name):this.message=""}}e.Message=t;class n extends Error{constructor(e,t){super(),this.isErr="yes",this.id=e,this.stack=(new Error).stack,this.details=t,this.message="{err.details}"}}e.Details=n,e.Create=class{}}(d||(d={}));var p,v,g=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};(v=p||(p={})).Debounce=function(e=250){return function(t,n,i){let r;return h({target:t,key:n,descriptor:i},(function(t,n){clearTimeout(r),r=window.setTimeout(()=>{clearTimeout(r),t.apply(this,n)},e)}))}},v.Evt=function(){return(e,t)=>{const n={get(){return new m(this,void 0!==t?t:e.key)},enumerable:!0,configurable:!0};return void 0!==t?Object.defineProperty(e,t,n):{kind:"method",placement:"prototype",key:e.key,descriptor:n}}},v.Exec=function(e,t=!0){return function(n,i,r){return h({target:n,key:i,descriptor:r},(function(n,r){return function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))}(this,void 0,void 0,(function*(){const o="_"+i+"_exec_flag";if(t&&this[o])return void console.log("PREVENTING DOUBLE EXECUTION");const s=t=>{if(this[o]=t,"function"==typeof e)e.call(this,{isExec:t,ctx:this});else{const n=e;t?n.before&&n.before.call(this,this):n.after&&n.after.call(this,this)}};s(!0);const a=n.apply(this,r);return a instanceof Promise?a.then(()=>s(!1)).catch(()=>s(!1)):(console.warn("Must be async function to use [@Executing] decorator"),s(!1)),a}))}))}},v.Handle=function(e){return function(t,n,i){return h({target:t,key:n,descriptor:i},(function(t,i,r){return g(this,void 0,void 0,(function*(){const o=this,s=t=>g(this,void 0,void 0,(function*(){t.id&&"string"==typeof t.id&&"yes"===t.isErr||("string"==typeof t||t instanceof Error?t=new d.Message("system",t):(console.warn("Err must be 'string' or 'new Error()' instance"),t=new d.Message("system","")));const i=t;i.ctx=o;const s=`Error] ${r}.${n} [${i.id}]: ${i.message}`;if("function"==typeof e){const t=e;console.log("[Handled"+s);const n=t.call(o,i);n instanceof Promise&&(yield n)}else{const t=e;if(t[i.id]){console.log("[Handled"+s);const e=t[i.id].call(o,i);e instanceof Promise&&(yield e)}else if(t.handle){console.log("[Handled"+s);const e=t.handle.call(o,i);e instanceof Promise&&(yield e)}else console.warn("[Unhandled "+s);if(t.fallback){const e=t.fallback.call(o,i);e instanceof Promise&&(yield e)}}}));try{const e=t.apply(o,i);return e instanceof Promise?new Promise(t=>{e.then(t).catch(e=>g(this,void 0,void 0,(function*(){yield s(e),t(void 0)})))}):e}catch(e){return void(yield s(e))}}))}))}},v.Once=function(){return function(e,t,n){return h({target:e,key:t,descriptor:n},(function(e,n){const i="_"+t+"_once_flag";if(!this[i])return this[i]=!0,e.call(this,n)}))}},v.Throttle=function(e=1e3/60){return function(t,n,i){let r=void 0,o=Date.now();return h({target:t,key:n,descriptor:i},(function(t,n){const i=(...n)=>{const s=Date.now();window.clearTimeout(r),!o||s-o>=e?(o=s,t.apply(this,n)):r=window.setTimeout(()=>i(...n),e-(s-o))};i(...n)}))}};class m{constructor(e,t){this.target=e,this.eventName=t}emit(e,t={bubbles:!0,composed:!0,cancelable:!1}){this.target.dispatchEvent(new CustomEvent(this.eventName,Object.assign({detail:e},t)))}}var y=n(3),S=n.n(y),w=n(4);function b(e){const t=S.a.create();return t.accessToken=e,t.interceptors.request.use(e=>{if(!e.headers.Authorization&&t.accessToken&&(e.headers.Authorization="Bearer "+t.accessToken),!e.headers.TrackingID){const t=Object(w.v1)();e.headers.TrackingID=`uuip_${t}_1.0:1.0`}return e.headers["Content-Type"]||(e.headers["Content-Type"]="application/json"),e}),t}var E,k,O=n(2),L=n.n(O);function C(e={}){const t=new E.Service;return t.updateConfig(e),t}!function(e){let t,n;!function(e){let t,n,i,r,o,s,a,u;!function(e){e.Info="info",e.Warn="warn",e.Error="error",e.Success="success",e.Chat="chat",e.Default="default"}(t=e.Type||(e.Type={})),e.TYPES=Object.values(t),function(e){e.Silent="silent",e.AutoDismiss="autodismiss",e.Acknowledge="acknowledge"}(n=e.Mode||(e.Mode={})),e.MODES=Object.values(n),function(e){e.Added="added",e.Pended="pended",e.Activated="activated",e.Deactivated="deactivated",e.Removed="removed"}(i=e.Status||(e.Status={})),e.StatusWeight={[i.Added]:0,[i.Pended]:1,[i.Activated]:2,[i.Deactivated]:3,[i.Removed]:4},e.STATUSES=Object.values(i),function(e){e.User="user_add"}(r=e.AddEventReason||(e.AddEventReason={})),function(e){e.ServiceAutoPropagate="service_auto_propagate_pending",e.ServiceAutoDismiss="service_autodismiss_pending",e.UserSilent="user_silent_pending"}(o=e.PendingEventReason||(e.PendingEventReason={})),function(e){e.ServiceAutoPropagate="service_auto_propagate_activate"}(s=e.ActivateEventReason||(e.ActivateEventReason={})),function(e){e.UserNegative="user_negative_deactivate",e.UserPositive="user_positive_deactivate",e.UserNeutral="user_neutral_deactivate"}(a=e.DeactivateEventReason||(e.DeactivateEventReason={})),function(e){e.User="user_remove"}(u=e.RemoveEventReason||(e.RemoveEventReason={}))}(t=e.ItemMeta||(e.ItemMeta={})),function(e){e.STATUS_EVENTS=["add","pending","activate","deactivate","remove"],e.STATUS_EVENT_MAP={add:t.Status.Added,pending:t.Status.Pended,activate:t.Status.Activated,deactivate:t.Status.Deactivated,remove:t.Status.Removed},e.DISABLED_ITEM_MODE={[t.Mode.Silent]:!1,[t.Mode.AutoDismiss]:!1,[t.Mode.Acknowledge]:!1},e.ACTIVATED_ITEM_MODE_LIMIT={[t.Mode.Silent]:0,[t.Mode.AutoDismiss]:10,[t.Mode.Acknowledge]:1},e.AUTO_DISMISS_TIMEOUT=5e3}(n=e.ServiceMeta||(e.ServiceMeta={}));class i{constructor(){this.hubEmitter=r()()}emit(e,...t){this.hubEmitter.emit(e,...t)}addEventListener(e,t){this.hubEmitter.on(e,t)}addOnceEventListener(e,t){this.hubEmitter.once(e,t)}removeEventListener(e,t){this.hubEmitter.off(e,t)}removeAllEventListeners(){L()(this.hubEmitter)}}e.Item=class{constructor(e,n){this._serviceHubSubscriptions=[],this._itemEmitter=r()();const{type:i,mode:s,title:a,data:u,timestamp:c}=e.data;this.type=i,this.title=a,this.data=u,this._mode=s,this.timestamp=c||(new Date).toISOString(),this.datetime=o.DateTime.fromISO(this.timestamp).toLocaleString(o.DateTime.DATETIME_SHORT_WITH_SECONDS),this.options=Object.freeze(this.validateAuxOptions(e.options||{})),n&&(this._serviceHubAdapter=n,this._status=t.Status.Added,this._reason=t.AddEventReason.User,this.bindItemHubListeners())}get status(){return this._status}get reason(){return this._reason}get mode(){return this._mode}validateAuxOptions(e){let n={};return e&&void 0!==e.AUTO_DISMISS_TIMEOUT&&this.mode===t.Mode.AutoDismiss&&(n=Object.assign(Object.assign({},n),{AUTO_DISMISS_TIMEOUT:e.AUTO_DISMISS_TIMEOUT})),n}bindItemHubListeners(){if(this._serviceHubAdapter){{const e=(e,n,i)=>{this.timestamp in e&&(this._status=n,this._reason=i,n===t.Status.Removed&&(this.unbindItemHubListeners(),this.removeAllEventListeners()),this.emit("statusUpdate",n,i))};this._serviceHubAdapter.addEventListener("statusServiceUpdateResponse",e);const n=()=>{var t;null===(t=this._serviceHubAdapter)||void 0===t||t.removeEventListener("statusServiceUpdateResponse",e)};this._serviceHubSubscriptions.push(n)}{const e=(e,t)=>{this.timestamp in e&&(this._mode=t,this.emit("modeUpdate",t))};this._serviceHubAdapter.addEventListener("modeStatusUpdateResponse",e);const t=()=>{var t;null===(t=this._serviceHubAdapter)||void 0===t||t.removeEventListener("modeStatusUpdateResponse",e)};this._serviceHubSubscriptions.push(t)}}}unbindItemHubListeners(){this._serviceHubSubscriptions&&(this._serviceHubSubscriptions.forEach(e=>e()),this._serviceHubSubscriptions.length=0)}deactivate(e){this._status&&t.StatusWeight[this._status]<t.StatusWeight[t.Status.Deactivated]?this._serviceHubAdapter?this._serviceHubAdapter.emit("statusServiceUpdateRequest",this,t.Status.Deactivated,e):c.warn("Service hub adapter is not initialized for this notification item instance: ",this):c.warn(`Notification should have "${t.Status.Pended}" or "${t.Status.Activated}" status to be able change status to "${t.Status.Deactivated}".Current notification status is "${this._status}". Ignoring this change`)}pending(){this._status===t.Status.Activated||this.mode!==t.Mode.Silent?this._serviceHubAdapter?this._serviceHubAdapter.emit("statusServiceUpdateRequest",this,t.Status.Pended,t.PendingEventReason.UserSilent):c.warn("Service hub adapter is not initialized for this notification item instance: ",this):c.warn(`Notification should have "${t.Status.Activated}" status or not "${t.Mode.Silent}" mode, to be able change status to "${t.Status.Pended}" and mode to "${t.Mode.Silent}".Current notification status is "${this._status}" and mode is "${this.mode}". Ignoring this change`)}emit(e,...t){this._itemEmitter.emit(e,...t)}addEventListener(e,t){this._itemEmitter.on(e,t)}addOnceEventListener(e,t){this._itemEmitter.once(e,t)}removeEventListener(e,t){this._itemEmitter.off(e,t)}removeAllEventListeners(){L()(this._itemEmitter)}};const s=(e,t,n=(()=>0))=>[...e,...t].sort(n),a=(e,t)=>e.reduce((e,n)=>(-1===t.indexOf(n)&&e.push(n),e),[]);class u{constructor(){this.emitter=r()(),this.map={},this.status=u.createStatus(),this.serviceConfig={DISABLED_ITEM_MODE:Object.assign({},n.DISABLED_ITEM_MODE),ACTIVATED_ITEM_MODE_LIMIT:Object.assign({},n.ACTIVATED_ITEM_MODE_LIMIT),AUTO_DISMISS_TIMEOUT:n.AUTO_DISMISS_TIMEOUT},this.activeAutoDismissTimeoutRefs={},this.serviceHubAdapter=new i,this.bindServiceHubEvents()}static mergeConfig(e,...t){if(!t.length)return e;const n=t.shift(),i=e=>e&&"object"==typeof e&&!Array.isArray(e);if(i(e)&&i(n))for(const t in n)i(n[t])?(e[t]||Object.assign(e,{[t]:{}}),this.mergeConfig(e[t],n[t])):Object.assign(e,{[t]:n[t]});return this.mergeConfig(e,...t)}static createStatus(){return{[t.Status.Added]:this.createStatusHolderCollection(),[t.Status.Pended]:this.createStatusHolderCollection(),[t.Status.Activated]:this.createStatusHolderCollection(),[t.Status.Deactivated]:this.createStatusHolderCollection(),[t.Status.Removed]:this.createStatusHolderCollection()}}static createStatusHolderCollection(){return Object.assign([],Object.assign(Object.assign({ids:[]},this.createStatusHolderSubCollections(t.MODES)),this.createStatusHolderSubCollections(t.TYPES)))}static createStatusHolderSubCollections(e){return Object.assign({},e.reduce((e,t)=>(e[t]=[],e),{}))}updateNotificationsCollections(){const e=u.createStatus();this.status.added.ids.forEach(n=>{const i=this.map[n];t.STATUSES.forEach(t=>{-1!==this.status[t].ids.indexOf(i.timestamp)&&(e[t].push(i),e[t].ids.push(n),e[t][i.mode].push(i),e[t][i.type].push(i))})}),this.status=e}setAutoDismiss(e,n=(()=>{})){this.prepareUpdateNotifications(e).forEach(e=>{var i;if(e.mode===t.Mode.AutoDismiss){const t=()=>n(e);this.activeAutoDismissTimeoutRefs[e.timestamp]=window.setTimeout(t,null!==(i=e.options.AUTO_DISMISS_TIMEOUT)&&void 0!==i?i:this.serviceConfig.AUTO_DISMISS_TIMEOUT)}})}removeAutoDismiss(e,t=(()=>{})){this.prepareUpdateNotifications(e).forEach(e=>{e.timestamp in this.activeAutoDismissTimeoutRefs&&(t(e),window.clearTimeout(this.activeAutoDismissTimeoutRefs[e.timestamp]),delete this.activeAutoDismissTimeoutRefs[e.timestamp])})}update(e,t,n){const i=Array.isArray(n)?n:[n];if(i.length){const n=i.map(e=>e.timestamp);switch(e){case"add":i.forEach(e=>this.map[e.timestamp]=e),this.status.added.ids=s(this.status.added.ids,n,u.sortTimestampsFn);break;case"pending":this.status.pended.ids=s(this.status.pended.ids,n,u.sortTimestampsFn),this.status.activated.ids=a(this.status.activated.ids,n),this.status.deactivated.ids=a(this.status.deactivated.ids,n);break;case"activate":this.status.pended.ids=a(this.status.pended.ids,n),this.status.activated.ids=s(this.status.activated.ids,n,u.sortTimestampsFn),this.status.deactivated.ids=a(this.status.deactivated.ids,n);break;case"deactivate":this.status.pended.ids=a(this.status.pended.ids,n),this.status.activated.ids=a(this.status.activated.ids,n),this.status.deactivated.ids=s(this.status.deactivated.ids,n,u.sortTimestampsFn);break;case"remove":this.status.pended.ids=a(this.status.pended.ids,n),this.status.activated.ids=a(this.status.activated.ids,n),this.status.deactivated.ids=a(this.status.deactivated.ids,n),this.status.added.ids=a(this.status.added.ids,n),this.status.removed.ids=s(this.status.removed.ids,n,u.sortTimestampsFn),n.forEach(e=>delete this.map[e])}this.updateNotificationsCollections(),this.emit(e,i,t),this.propagate(e,t,i)}}propagate(e,n,i){const r=Array.isArray(i)?i:[i];if(r.length)switch(e){case"add":this.update("pending",t.PendingEventReason.ServiceAutoPropagate,r);break;case"pending":r.forEach(e=>{this.removeAutoDismiss(e)}),this.update("activate",t.ActivateEventReason.ServiceAutoPropagate,this.prepareActiveCandidatesNotifications(this.status.pended));break;case"activate":r.forEach(e=>{this.setAutoDismiss(e,e=>{e.mode===t.Mode.AutoDismiss&&this.serviceHubAdapter.emit("statusServiceUpdateRequest",e,t.Status.Pended,t.PendingEventReason.ServiceAutoDismiss)})});break;case"deactivate":r.forEach(e=>{this.removeAutoDismiss(e)}),this.update("activate",t.ActivateEventReason.ServiceAutoPropagate,this.prepareActiveCandidatesNotifications(this.status.pended));break;case"remove":this.update("deactivate",t.DeactivateEventReason.UserNegative,r)}}prepareAddNotifications(t){const n=Object.keys(this.serviceConfig.DISABLED_ITEM_MODE).reduce((e,t)=>(this.serviceConfig.DISABLED_ITEM_MODE[t]||e.push(t),e),[]).map(e=>`"${e}"`).join(", ");return(Array.isArray(t)?t:[t]).filter(e=>!this.serviceConfig.DISABLED_ITEM_MODE[e.data.mode]||(c.error(`Trying to .add(...) notification mode "${e.data.mode}" that is disabled in this notifications service instance by configuration.Current configuration is: "${JSON.stringify(this.config)}"Only ${n} allowed. Ignoring .add(${JSON.stringify(e)}) notification...`),!1)).map(t=>new e.Item(t,this.serviceHubAdapter))}prepareUpdateNotifications(e){return(Array.isArray(e)?e:[e]).reduce((e,t)=>(t.timestamp in this.map?e.push(t):c.error("Trying to handle untracked notification. Call .add(...) first...",JSON.stringify(t)),e),[])}prepareActiveCandidatesNotifications(e){const n=(Array.isArray(e)?e:[e]).reduce((e,t)=>(this.status.activated[t.mode].length+e[t.mode].length<this.serviceConfig.ACTIVATED_ITEM_MODE_LIMIT[t.mode]&&e[t.mode].push(t),e),u.createStatusHolderSubCollections(t.MODES));return Object.values(n).reduce((e,t)=>e.concat(t),[])}static sortByTimestampsFn(e,t){return u.sortTimestampsFn(e.timestamp,t.timestamp)}get added(){return this.status.added}get pended(){return this.status.pended}get activated(){return this.status.activated}get deactivated(){return this.status.deactivated}getNotificationStatus(e){return Object.keys(this.status).filter(e=>e!==t.Status.Added).find(t=>-1!==this.status[t].ids.indexOf(e.timestamp))}get config(){return Object.freeze(this.serviceConfig)}static validateUpdateConfig(e){const i=e;if(i.ACTIVATED_ITEM_MODE_LIMIT&&i.ACTIVATED_ITEM_MODE_LIMIT.acknowledge>n.ACTIVATED_ITEM_MODE_LIMIT.acknowledge)throw new Error(`\n          Max ${t.Mode.Acknowledge} limit is ${n.ACTIVATED_ITEM_MODE_LIMIT.acknowledge}\n        `);if(i.DISABLED_ITEM_MODE){if(!Object.keys(i.DISABLED_ITEM_MODE).reduce((e,t)=>(i.DISABLED_ITEM_MODE[t]&&e++,e),0))throw new Error("At least one notifications mode should be allowed in service instance");Object.keys(i.ACTIVATED_ITEM_MODE_LIMIT).forEach(e=>{e in i.DISABLED_ITEM_MODE&&i.DISABLED_ITEM_MODE[e]&&c.warn(`Changing configuration limit count for mode "${e}" won't have any effect, because this mode is disabled in notifications service instance`)}),"AUTO_DISMISS_TIMEOUT"in i&&i.DISABLED_ITEM_MODE[t.Mode.AutoDismiss]&&c.warn(`Changing "AUTO_DISMISS_TIMEOUT" configuration option won't have any effect,because "${t.Mode.AutoDismiss}" mode is disabled in notifications service instance`)}return!0}updateConfig(e){u.validateUpdateConfig(e)&&(this.serviceConfig=u.mergeConfig({},this.serviceConfig,e),c.info("Updated notifications service configuration: ",this.config))}add(e){const n=this.prepareAddNotifications(e);return this.update("add",t.AddEventReason.User,n),n}pending(e){const n=this.prepareUpdateNotifications(e);return this.serviceHubAdapter.emit("statusServiceUpdateRequest",n,t.Status.Pended,t.PendingEventReason.UserSilent),n}deactivate(e,n){const i=this.prepareUpdateNotifications(e);return this.serviceHubAdapter.emit("statusServiceUpdateRequest",i,t.Status.Deactivated,n),i}remove(e){const n=this.prepareUpdateNotifications(e);return this.serviceHubAdapter.emit("statusServiceUpdateRequest",n,t.Status.Removed,t.RemoveEventReason.User),n}pendingAllActivated(){return this.pending(this.status.activated)}pendingAll(){return this.pending([...this.status.pended,...this.status.activated])}deactivateAllActivated(e){return this.deactivate(this.status.activated,e)}deactivateAll(e){return this.deactivate([...this.status.pended,...this.status.activated],e)}removeAllDeactivated(){return this.remove(this.status.deactivated)}removeAll(){return this.remove(this.status.added)}addEventListener(e,t){this.emitter.on(e,t)}removeEventListener(e,t){this.emitter.off(e,t)}addOnceEventListener(e,t){this.emitter.once(e,t)}removeAllEventListeners(){L()(this.emitter)}emit(e,...t){this.emitter.emit(e,...t)}bindServiceHubEvents(){this.serviceHubAdapter.addEventListener("statusServiceUpdateRequest",(e,n,i)=>{const r=Array.isArray(e)?e:[e],o=r.reduce((e,t)=>(e[t.timestamp]=this.getNotificationStatus(t),e),{});{const e=r.filter(e=>(o[e.timestamp]===t.Status.Activated||e.mode!==t.Mode.Silent)&&n===t.Status.Pended);{const n=e.filter(e=>e.mode!==t.Mode.Silent);n.length&&this.serviceHubAdapter.emit("modeStatusUpdateResponse",n.reduce((e,t)=>(e[t.timestamp]=t,e),{}),t.Mode.Silent)}e.length&&this.update("pending",i,e)}{const e=r.filter(e=>{const i=o[e.timestamp];return(i===t.Status.Pended||i===t.Status.Activated)&&n===t.Status.Deactivated});e.length&&this.update("deactivate",i,e)}r.filter(e=>{const i=o[e.timestamp];return(i===t.Status.Pended||i===t.Status.Activated||i===t.Status.Deactivated)&&n===t.Status.Removed}).length&&this.update("remove",i,e)}),n.STATUS_EVENTS.forEach(e=>{this.addEventListener(e,(t,i)=>{const r=n.STATUS_EVENT_MAP[e],o=t.reduce((e,t)=>(e[t.timestamp]=t,e),{});this.serviceHubAdapter.emit("statusServiceUpdateResponse",o,r,i)})})}}u.sortTimestampsFn=(e,t)=>e>t?1:e<t?-1:0,e.Service=u}(E||(E={})),function(e){class t{constructor(){this.listeners=[],this.listenersOnce=[],this.listen=e=>(this.listeners.push(e),{stopListen:()=>this.stopListen(e)}),this.listenOnce=e=>(this.listenersOnce.push(e),{stopListenOnce:()=>this.stopListenOnce(e)}),this.stopListen=e=>{const t=this.listeners.indexOf(e,0);return t>-1&&(this.listeners.splice(t,1),!0)},this.stopListenOnce=e=>{const t=this.listenersOnce.indexOf(e,0);return t>-1&&(this.listenersOnce.splice(t,1),!0)},this.stopListenAll=()=>{this.listeners=[],this.listenersOnce=[]},this.send=e=>{this.listeners.forEach(t=>t(e)),this.listenersOnce.forEach(t=>t(e)),this.listenersOnce=[]}}}class n{constructor(){this.listeners=[],this.listenersOnce=[],this.listen=e=>(this.listeners.push(e),{stopListen:()=>this.stopListen(e)}),this.listenOnce=e=>(this.listenersOnce.push(e),{stopListenOnce:()=>this.stopListenOnce(e)}),this.stopListen=e=>{const t=this.listeners.indexOf(e,0);return t>-1&&(this.listeners.splice(t,1),!0)},this.stopListenOnce=e=>{const t=this.listenersOnce.indexOf(e,0);return t>-1&&(this.listenersOnce.splice(t,1),!0)},this.stopListenAll=()=>{this.listeners=[],this.listenersOnce=[]},this.send=()=>{this.listeners.forEach(e=>e()),this.listenersOnce.forEach(e=>e()),this.listenersOnce=[]}}}e.create=new class{withData(){const e=new t;return{signal:e,send:e.send,stopListenAll:e.stopListenAll}}empty(){const e=new n;return{signal:e,send:e.send,stopListenAll:e.stopListenAll}}}}(k||(k={}));var T,x,I=n(5),A=n.n(I),N=n(6),R=n.n(N),D=n(7),M=n.n(D);(x=T||(T={})).createService=e=>{const t=A.a.createInstance();{const n=e&&e.backend?e.backend:new R.a;t.use(n)}{const n=e&&e.languageDetector?e.languageDetector:new M.a;t.use(n)}return e&&e.logger&&t.use({log:"log"in e.logger?e.logger.log:e.logger.info,warn:e.logger.warn,error:e.logger.error,type:"logger"}),t},x.mergeServiceInitOptions=(...e)=>Object.assign.call(null,{},...e),x.createMixin=e=>{const t="i18n"in e?e.i18n:x.createService(),n="i18nInitOptions"in e?e.i18nInitOptions:null;n||c.info("i18n mixin instance waiting service initialization outside...");let i=!1;return e=>class extends e{constructor(){super(...arguments),this.onI18NInitialized=e=>this.requestUpdate(),this.onI18NLanguageChanged=e=>this.requestUpdate()}connectedCallback(){super.connectedCallback&&super.connectedCallback(),t.on("initialized",this.onI18NInitialized),t.on("languageChanged",this.onI18NLanguageChanged),t.isInitialized||i||!n||(i=!0,t.init(n).finally(()=>i=!1))}disconnectedCallback(){t.off("initialized",this.onI18NInitialized),t.off("languageChanged",this.onI18NLanguageChanged),super.disconnectedCallback&&super.disconnectedCallback()}t(...e){return t.t(...e)}}}}])},function(e,t,n){"use strict";var i=n(10),r=Object.prototype.toString;function o(e){return"[object Array]"===r.call(e)}function s(e){return void 0===e}function a(e){return null!==e&&"object"==typeof e}function u(e){return"[object Function]"===r.call(e)}function c(e,t){if(null!=e)if("object"!=typeof e&&(e=[e]),o(e))for(var n=0,i=e.length;n<i;n++)t.call(null,e[n],n,e);else for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.call(null,e[r],r,e)}e.exports={isArray:o,isArrayBuffer:function(e){return"[object ArrayBuffer]"===r.call(e)},isBuffer:function(e){return null!==e&&!s(e)&&null!==e.constructor&&!s(e.constructor)&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)},isFormData:function(e){return"undefined"!=typeof FormData&&e instanceof FormData},isArrayBufferView:function(e){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer},isString:function(e){return"string"==typeof e},isNumber:function(e){return"number"==typeof e},isObject:a,isUndefined:s,isDate:function(e){return"[object Date]"===r.call(e)},isFile:function(e){return"[object File]"===r.call(e)},isBlob:function(e){return"[object Blob]"===r.call(e)},isFunction:u,isStream:function(e){return a(e)&&u(e.pipe)},isURLSearchParams:function(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&("undefined"!=typeof window&&"undefined"!=typeof document)},forEach:c,merge:function e(){var t={};function n(n,i){"object"==typeof t[i]&&"object"==typeof n?t[i]=e(t[i],n):t[i]=n}for(var i=0,r=arguments.length;i<r;i++)c(arguments[i],n);return t},deepMerge:function e(){var t={};function n(n,i){"object"==typeof t[i]&&"object"==typeof n?t[i]=e(t[i],n):t[i]="object"==typeof n?e({},n):n}for(var i=0,r=arguments.length;i<r;i++)c(arguments[i],n);return t},extend:function(e,t,n){return c(t,(function(t,r){e[r]=n&&"function"==typeof t?i(t,n):t})),e},trim:function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}}},function(e,t,n){"use strict";function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}n.d(t,"a",(function(){return i}))},function(e,t,n){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function r(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}n.d(t,"a",(function(){return r}))},function(e,t,n){"use strict";var i,r,o,s,a,u,c,l=n(20),d=n(37),f=Function.prototype.apply,h=Function.prototype.call,p=Object.create,v=Object.defineProperty,g=Object.defineProperties,m=Object.prototype.hasOwnProperty,y={configurable:!0,enumerable:!1,writable:!0};r=function(e,t){var n,r;return d(t),r=this,i.call(this,e,n=function(){o.call(r,e,n),f.call(t,this,arguments)}),n.__eeOnceListener__=t,this},a={on:i=function(e,t){var n;return d(t),m.call(this,"__ee__")?n=this.__ee__:(n=y.value=p(null),v(this,"__ee__",y),y.value=null),n[e]?"object"==typeof n[e]?n[e].push(t):n[e]=[n[e],t]:n[e]=t,this},once:r,off:o=function(e,t){var n,i,r,o;if(d(t),!m.call(this,"__ee__"))return this;if(!(n=this.__ee__)[e])return this;if("object"==typeof(i=n[e]))for(o=0;r=i[o];++o)r!==t&&r.__eeOnceListener__!==t||(2===i.length?n[e]=i[o?0:1]:i.splice(o,1));else i!==t&&i.__eeOnceListener__!==t||delete n[e];return this},emit:s=function(e){var t,n,i,r,o;if(m.call(this,"__ee__")&&(r=this.__ee__[e]))if("object"==typeof r){for(n=arguments.length,o=new Array(n-1),t=1;t<n;++t)o[t-1]=arguments[t];for(r=r.slice(),t=0;i=r[t];++t)f.call(i,this,o)}else switch(arguments.length){case 1:h.call(r,this);break;case 2:h.call(r,this,arguments[1]);break;case 3:h.call(r,this,arguments[1],arguments[2]);break;default:for(n=arguments.length,o=new Array(n-1),t=1;t<n;++t)o[t-1]=arguments[t];f.call(r,this,o)}}},u={on:l(i),once:l(r),off:l(o),emit:l(s)},c=g({},u),e.exports=t=function(e){return null==e?p(c):g(Object(e),u)},t.methods=a},function(e,t,n){"use strict";n.d(t,"a",(function(){return s}));var i=[],r=i.forEach,o=i.slice;function s(e){return r.call(o.call(arguments,1),(function(t){if(t)for(var n in t)void 0===e[n]&&(e[n]=t[n])})),e}},function(e,t,n){"use strict";var i=n(31)();e.exports=function(e){return e!==i&&null!==e}},function(e,t,n){(function(i){var r;if("function"==typeof fetch&&(void 0!==i&&i.fetch?r=i.fetch:"undefined"!=typeof window&&window.fetch&&(r=window.fetch)),"undefined"==typeof window||void 0===window.document){var o=r||n(60);o.default&&(o=o.default),t.default=o,e.exports=t.default}}).call(this,n(18))},function(e,t,n){"use strict";var i=n(39),r=Object.prototype.hasOwnProperty;e.exports=function(e){var t,n=arguments[1];if(i(e),void 0===n)r.call(e,"__ee__")&&delete e.__ee__;else{if(!(t=r.call(e,"__ee__")&&e.__ee__))return;t[n]&&delete t[n]}}},function(e,t,n){"use strict";e.exports=function(e){return null!=e}},function(e,t,n){"use strict";e.exports=function(e,t){return function(){for(var n=new Array(arguments.length),i=0;i<n.length;i++)n[i]=arguments[i];return e.apply(t,n)}}},function(e,t,n){"use strict";var i=n(1);function r(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}e.exports=function(e,t,n){if(!t)return e;var o;if(n)o=n(t);else if(i.isURLSearchParams(t))o=t.toString();else{var s=[];i.forEach(t,(function(e,t){null!=e&&(i.isArray(e)?t+="[]":e=[e],i.forEach(e,(function(e){i.isDate(e)?e=e.toISOString():i.isObject(e)&&(e=JSON.stringify(e)),s.push(r(t)+"="+r(e))})))})),o=s.join("&")}if(o){var a=e.indexOf("#");-1!==a&&(e=e.slice(0,a)),e+=(-1===e.indexOf("?")?"?":"&")+o}return e}},function(e,t,n){"use strict";e.exports=function(e){return!(!e||!e.__CANCEL__)}},function(e,t,n){"use strict";(function(t){var i=n(1),r=n(48),o={"Content-Type":"application/x-www-form-urlencoded"};function s(e,t){!i.isUndefined(e)&&i.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}var a,u={adapter:(("undefined"!=typeof XMLHttpRequest||void 0!==t&&"[object process]"===Object.prototype.toString.call(t))&&(a=n(14)),a),transformRequest:[function(e,t){return r(t,"Accept"),r(t,"Content-Type"),i.isFormData(e)||i.isArrayBuffer(e)||i.isBuffer(e)||i.isStream(e)||i.isFile(e)||i.isBlob(e)?e:i.isArrayBufferView(e)?e.buffer:i.isURLSearchParams(e)?(s(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):i.isObject(e)?(s(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300}};u.headers={common:{Accept:"application/json, text/plain, */*"}},i.forEach(["delete","get","head"],(function(e){u.headers[e]={}})),i.forEach(["post","put","patch"],(function(e){u.headers[e]=i.merge(o)})),e.exports=u}).call(this,n(47))},function(e,t,n){"use strict";var i=n(1),r=n(49),o=n(11),s=n(51),a=n(54),u=n(55),c=n(15);e.exports=function(e){return new Promise((function(t,l){var d=e.data,f=e.headers;i.isFormData(d)&&delete f["Content-Type"];var h=new XMLHttpRequest;if(e.auth){var p=e.auth.username||"",v=e.auth.password||"";f.Authorization="Basic "+btoa(p+":"+v)}var g=s(e.baseURL,e.url);if(h.open(e.method.toUpperCase(),o(g,e.params,e.paramsSerializer),!0),h.timeout=e.timeout,h.onreadystatechange=function(){if(h&&4===h.readyState&&(0!==h.status||h.responseURL&&0===h.responseURL.indexOf("file:"))){var n="getAllResponseHeaders"in h?a(h.getAllResponseHeaders()):null,i={data:e.responseType&&"text"!==e.responseType?h.response:h.responseText,status:h.status,statusText:h.statusText,headers:n,config:e,request:h};r(t,l,i),h=null}},h.onabort=function(){h&&(l(c("Request aborted",e,"ECONNABORTED",h)),h=null)},h.onerror=function(){l(c("Network Error",e,null,h)),h=null},h.ontimeout=function(){var t="timeout of "+e.timeout+"ms exceeded";e.timeoutErrorMessage&&(t=e.timeoutErrorMessage),l(c(t,e,"ECONNABORTED",h)),h=null},i.isStandardBrowserEnv()){var m=n(56),y=(e.withCredentials||u(g))&&e.xsrfCookieName?m.read(e.xsrfCookieName):void 0;y&&(f[e.xsrfHeaderName]=y)}if("setRequestHeader"in h&&i.forEach(f,(function(e,t){void 0===d&&"content-type"===t.toLowerCase()?delete f[t]:h.setRequestHeader(t,e)})),i.isUndefined(e.withCredentials)||(h.withCredentials=!!e.withCredentials),e.responseType)try{h.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&h.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&h.upload&&h.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then((function(e){h&&(h.abort(),l(e),h=null)})),void 0===d&&(d=null),h.send(d)}))}},function(e,t,n){"use strict";var i=n(50);e.exports=function(e,t,n,r,o){var s=new Error(e);return i(s,t,n,r,o)}},function(e,t,n){"use strict";var i=n(1);e.exports=function(e,t){t=t||{};var n={},r=["url","method","params","data"],o=["headers","auth","proxy"],s=["baseURL","url","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"];i.forEach(r,(function(e){void 0!==t[e]&&(n[e]=t[e])})),i.forEach(o,(function(r){i.isObject(t[r])?n[r]=i.deepMerge(e[r],t[r]):void 0!==t[r]?n[r]=t[r]:i.isObject(e[r])?n[r]=i.deepMerge(e[r]):void 0!==e[r]&&(n[r]=e[r])})),i.forEach(s,(function(i){void 0!==t[i]?n[i]=t[i]:void 0!==e[i]&&(n[i]=e[i])}));var a=r.concat(o).concat(s),u=Object.keys(t).filter((function(e){return-1===a.indexOf(e)}));return i.forEach(u,(function(i){void 0!==t[i]?n[i]=t[i]:void 0!==e[i]&&(n[i]=e[i])})),n}},function(e,t,n){"use strict";function i(e){this.message=e}i.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},i.prototype.__CANCEL__=!0,e.exports=i},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){"use strict";(function(e){var i,r,o,s=n(5),a=n(7),u=n.n(a);function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}"function"==typeof fetch&&(void 0!==e&&e.fetch?i=e.fetch:"undefined"!=typeof window&&window.fetch&&(i=window.fetch)),"function"==typeof XMLHttpRequest&&(void 0!==e&&e.XMLHttpRequest?r=e.XMLHttpRequest:"undefined"!=typeof window&&window.XMLHttpRequest&&(r=window.XMLHttpRequest)),"function"==typeof ActiveXObject&&(void 0!==e&&e.ActiveXObject?o=e.ActiveXObject:"undefined"!=typeof window&&window.ActiveXObject&&(o=window.ActiveXObject)),i||!a||r||o||(i=u.a||a),"function"!=typeof i&&(i=void 0);var l=function(e,t){if(t&&"object"===c(t)){var n="";for(var i in t)n+="&"+encodeURIComponent(i)+"="+encodeURIComponent(t[i]);if(!n)return e;e=e+(-1!==e.indexOf("?")?"&":"?")+n.slice(1)}return e};t.a=function(e,t,n,a){return"function"==typeof n&&(a=n,n=void 0),a=a||function(){},i?function(e,t,n,r){e.queryStringParams&&(t=l(t,e.queryStringParams));var o=Object(s.a)({},"function"==typeof e.customHeaders?e.customHeaders():e.customHeaders);n&&(o["Content-Type"]="application/json"),i(t,Object(s.a)({method:n?"POST":"GET",body:n?e.stringify(n):void 0,headers:o},"function"==typeof e.requestOptions?e.requestOptions(n):e.requestOptions)).then((function(e){if(!e.ok)return r(e.statusText||"Error",{status:e.status});e.text().then((function(t){r(null,{status:e.status,data:t})})).catch(r)})).catch(r)}(e,t,n,a):"function"==typeof XMLHttpRequest||"function"==typeof ActiveXObject?function(e,t,n,i){n&&"object"===c(n)&&(n=l("",n).slice(1)),e.queryStringParams&&(t=l(t,e.queryStringParams));try{var s;(s=r?new r:new o("MSXML2.XMLHTTP.3.0")).open(n?"POST":"GET",t,1),e.crossDomain||s.setRequestHeader("X-Requested-With","XMLHttpRequest"),s.withCredentials=!!e.withCredentials,n&&s.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s.overrideMimeType&&s.overrideMimeType("application/json");var a=e.customHeaders;if(a="function"==typeof a?a():a)for(var u in a)s.setRequestHeader(u,a[u]);s.onreadystatechange=function(){s.readyState>3&&i(s.status>=400?s.statusText:null,{status:s.status,data:s.responseText})},s.send(n)}catch(e){console&&console.log(e)}}(e,t,n,a):void 0}}).call(this,n(18))},function(e,t,n){"use strict";var i=n(9),r=n(21),o=n(25),s=n(33),a=n(34);(e.exports=function(e,t){var n,r,u,c,l;return arguments.length<2||"string"!=typeof e?(c=t,t=e,e=null):c=arguments[2],i(e)?(n=a.call(e,"c"),r=a.call(e,"e"),u=a.call(e,"w")):(n=u=!0,r=!1),l={value:t,configurable:n,enumerable:r,writable:u},c?o(s(c),l):l}).gs=function(e,t,n){var u,c,l,d;return"string"!=typeof e?(l=n,n=t,t=e,e=null):l=arguments[3],i(t)?r(t)?i(n)?r(n)||(l=n,n=void 0):n=void 0:(l=t,t=n=void 0):t=void 0,i(e)?(u=a.call(e,"c"),c=a.call(e,"e")):(u=!0,c=!1),d={get:t,set:n,configurable:u,enumerable:c},l?o(s(l),d):d}},function(e,t,n){"use strict";var i=n(22),r=/^\s*class[\s{/}]/,o=Function.prototype.toString;e.exports=function(e){return!!i(e)&&!r.test(o.call(e))}},function(e,t,n){"use strict";var i=n(23);e.exports=function(e){if("function"!=typeof e)return!1;if(!hasOwnProperty.call(e,"length"))return!1;try{if("number"!=typeof e.length)return!1;if("function"!=typeof e.call)return!1;if("function"!=typeof e.apply)return!1}catch(e){return!1}return!i(e)}},function(e,t,n){"use strict";var i=n(24);e.exports=function(e){if(!i(e))return!1;try{return!!e.constructor&&e.constructor.prototype===e}catch(e){return!1}}},function(e,t,n){"use strict";var i=n(9),r={object:!0,function:!0,undefined:!0};e.exports=function(e){return!!i(e)&&hasOwnProperty.call(r,typeof e)}},function(e,t,n){"use strict";e.exports=n(26)()?Object.assign:n(27)},function(e,t,n){"use strict";e.exports=function(){var e,t=Object.assign;return"function"==typeof t&&(t(e={foo:"raz"},{bar:"dwa"},{trzy:"trzy"}),e.foo+e.bar+e.trzy==="razdwatrzy")}},function(e,t,n){"use strict";var i=n(28),r=n(32),o=Math.max;e.exports=function(e,t){var n,s,a,u=o(arguments.length,2);for(e=Object(r(e)),a=function(i){try{e[i]=t[i]}catch(e){n||(n=e)}},s=1;s<u;++s)i(t=arguments[s]).forEach(a);if(void 0!==n)throw n;return e}},function(e,t,n){"use strict";e.exports=n(29)()?Object.keys:n(30)},function(e,t,n){"use strict";e.exports=function(){try{return Object.keys("primitive"),!0}catch(e){return!1}}},function(e,t,n){"use strict";var i=n(6),r=Object.keys;e.exports=function(e){return r(i(e)?Object(e):e)}},function(e,t,n){"use strict";e.exports=function(){}},function(e,t,n){"use strict";var i=n(6);e.exports=function(e){if(!i(e))throw new TypeError("Cannot use null or undefined");return e}},function(e,t,n){"use strict";var i=n(6),r=Array.prototype.forEach,o=Object.create,s=function(e,t){var n;for(n in e)t[n]=e[n]};e.exports=function(e){var t=o(null);return r.call(arguments,(function(e){i(e)&&s(Object(e),t)})),t}},function(e,t,n){"use strict";e.exports=n(35)()?String.prototype.contains:n(36)},function(e,t,n){"use strict";var i="razdwatrzy";e.exports=function(){return"function"==typeof i.contains&&(!0===i.contains("dwa")&&!1===i.contains("foo"))}},function(e,t,n){"use strict";var i=String.prototype.indexOf;e.exports=function(e){return i.call(this,e,arguments[1])>-1}},function(e,t,n){"use strict";e.exports=function(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return e}},function(e,t,n){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function r(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}function o(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}function c(e,t,n){return(c=u()?Reflect.construct:function(e,t,n){var i=[null];i.push.apply(i,t);var r=new(Function.bind.apply(e,i));return n&&a(r,n.prototype),r}).apply(null,arguments)}function l(e){var t="function"==typeof Map?new Map:void 0;return(l=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,i)}function i(){return c(e,arguments,s(this).constructor)}return i.prototype=Object.create(e.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),a(i,e)})(e)}function d(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}function f(e){var t=0;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(e){if("string"==typeof e)return d(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?d(e,t):void 0}}(e)))return function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(t=e[Symbol.iterator]()).next.bind(t)}Object.defineProperty(t,"__esModule",{value:!0});var h=function(e){function t(){return e.apply(this,arguments)||this}return o(t,e),t}(l(Error)),p=function(e){function t(t){return e.call(this,"Invalid DateTime: "+t.toMessage())||this}return o(t,e),t}(h),v=function(e){function t(t){return e.call(this,"Invalid Interval: "+t.toMessage())||this}return o(t,e),t}(h),g=function(e){function t(t){return e.call(this,"Invalid Duration: "+t.toMessage())||this}return o(t,e),t}(h),m=function(e){function t(){return e.apply(this,arguments)||this}return o(t,e),t}(h),y=function(e){function t(t){return e.call(this,"Invalid unit "+t)||this}return o(t,e),t}(h),S=function(e){function t(){return e.apply(this,arguments)||this}return o(t,e),t}(h),w=function(e){function t(){return e.call(this,"Zone is an abstract class")||this}return o(t,e),t}(h),b="numeric",E="short",k="long",O={year:b,month:b,day:b},L={year:b,month:E,day:b},C={year:b,month:E,day:b,weekday:E},T={year:b,month:k,day:b},x={year:b,month:k,day:b,weekday:k},I={hour:b,minute:b},A={hour:b,minute:b,second:b},N={hour:b,minute:b,second:b,timeZoneName:E},R={hour:b,minute:b,second:b,timeZoneName:k},D={hour:b,minute:b,hour12:!1},M={hour:b,minute:b,second:b,hour12:!1},_={hour:b,minute:b,second:b,hour12:!1,timeZoneName:E},j={hour:b,minute:b,second:b,hour12:!1,timeZoneName:k},V={year:b,month:b,day:b,hour:b,minute:b},P={year:b,month:b,day:b,hour:b,minute:b,second:b},q={year:b,month:E,day:b,hour:b,minute:b},U={year:b,month:E,day:b,hour:b,minute:b,second:b},F={year:b,month:E,day:b,weekday:E,hour:b,minute:b},H={year:b,month:k,day:b,hour:b,minute:b,timeZoneName:E},z={year:b,month:k,day:b,hour:b,minute:b,second:b,timeZoneName:E},Z={year:b,month:k,day:b,weekday:k,hour:b,minute:b,timeZoneName:k},J={year:b,month:k,day:b,weekday:k,hour:b,minute:b,second:b,timeZoneName:k};function B(e){return void 0===e}function G(e){return"number"==typeof e}function W(e){return"number"==typeof e&&e%1==0}function $(){try{return"undefined"!=typeof Intl&&Intl.DateTimeFormat}catch(e){return!1}}function K(){return!B(Intl.DateTimeFormat.prototype.formatToParts)}function Y(){try{return"undefined"!=typeof Intl&&!!Intl.RelativeTimeFormat}catch(e){return!1}}function X(e,t,n){if(0!==e.length)return e.reduce((function(e,i){var r=[t(i),i];return e&&n(e[0],r[0])===e[0]?e:r}),null)[1]}function Q(e,t){return t.reduce((function(t,n){return t[n]=e[n],t}),{})}function ee(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function te(e,t,n){return W(e)&&e>=t&&e<=n}function ne(e,t){return void 0===t&&(t=2),e.toString().length<t?("0".repeat(t)+e).slice(-t):e.toString()}function ie(e){return B(e)||null===e||""===e?void 0:parseInt(e,10)}function re(e){if(!B(e)&&null!==e&&""!==e){var t=1e3*parseFloat("0."+e);return Math.floor(t)}}function oe(e,t,n){void 0===n&&(n=!1);var i=Math.pow(10,t);return(n?Math.trunc:Math.round)(e*i)/i}function se(e){return e%4==0&&(e%100!=0||e%400==0)}function ae(e){return se(e)?366:365}function ue(e,t){var n=function(e,t){return e-t*Math.floor(e/t)}(t-1,12)+1;return 2===n?se(e+(t-n)/12)?29:28:[31,null,31,30,31,30,31,31,30,31,30,31][n-1]}function ce(e){var t=Date.UTC(e.year,e.month-1,e.day,e.hour,e.minute,e.second,e.millisecond);return e.year<100&&e.year>=0&&(t=new Date(t)).setUTCFullYear(t.getUTCFullYear()-1900),+t}function le(e){var t=(e+Math.floor(e/4)-Math.floor(e/100)+Math.floor(e/400))%7,n=e-1,i=(n+Math.floor(n/4)-Math.floor(n/100)+Math.floor(n/400))%7;return 4===t||3===i?53:52}function de(e){return e>99?e:e>60?1900+e:2e3+e}function fe(e,t,n,i){void 0===i&&(i=null);var r=new Date(e),o={hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"};i&&(o.timeZone=i);var s=Object.assign({timeZoneName:t},o),a=$();if(a&&K()){var u=new Intl.DateTimeFormat(n,s).formatToParts(r).find((function(e){return"timezonename"===e.type.toLowerCase()}));return u?u.value:null}if(a){var c=new Intl.DateTimeFormat(n,o).format(r);return new Intl.DateTimeFormat(n,s).format(r).substring(c.length).replace(/^[, \u200e]+/,"")}return null}function he(e,t){var n=parseInt(e,10);Number.isNaN(n)&&(n=0);var i=parseInt(t,10)||0;return 60*n+(n<0||Object.is(n,-0)?-i:i)}function pe(e){var t=Number(e);if("boolean"==typeof e||""===e||Number.isNaN(t))throw new S("Invalid unit value "+e);return t}function ve(e,t,n){var i={};for(var r in e)if(ee(e,r)){if(n.indexOf(r)>=0)continue;var o=e[r];if(null==o)continue;i[t(r)]=pe(o)}return i}function ge(e,t){var n=Math.trunc(Math.abs(e/60)),i=Math.trunc(Math.abs(e%60)),r=e>=0?"+":"-";switch(t){case"short":return""+r+ne(n,2)+":"+ne(i,2);case"narrow":return""+r+n+(i>0?":"+i:"");case"techie":return""+r+ne(n,2)+ne(i,2);default:throw new RangeError("Value format "+t+" is out of range for property format")}}function me(e){return Q(e,["hour","minute","second","millisecond"])}var ye=/[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;function Se(e){return JSON.stringify(e,Object.keys(e).sort())}var we=["January","February","March","April","May","June","July","August","September","October","November","December"],be=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Ee=["J","F","M","A","M","J","J","A","S","O","N","D"];function ke(e){switch(e){case"narrow":return Ee;case"short":return be;case"long":return we;case"numeric":return["1","2","3","4","5","6","7","8","9","10","11","12"];case"2-digit":return["01","02","03","04","05","06","07","08","09","10","11","12"];default:return null}}var Oe=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],Le=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],Ce=["M","T","W","T","F","S","S"];function Te(e){switch(e){case"narrow":return Ce;case"short":return Le;case"long":return Oe;case"numeric":return["1","2","3","4","5","6","7"];default:return null}}var xe=["AM","PM"],Ie=["Before Christ","Anno Domini"],Ae=["BC","AD"],Ne=["B","A"];function Re(e){switch(e){case"narrow":return Ne;case"short":return Ae;case"long":return Ie;default:return null}}function De(e,t){for(var n,i="",r=f(e);!(n=r()).done;){var o=n.value;o.literal?i+=o.val:i+=t(o.val)}return i}var Me={D:O,DD:L,DDD:T,DDDD:x,t:I,tt:A,ttt:N,tttt:R,T:D,TT:M,TTT:_,TTTT:j,f:V,ff:q,fff:H,ffff:Z,F:P,FF:U,FFF:z,FFFF:J},_e=function(){function e(e,t){this.opts=t,this.loc=e,this.systemLoc=null}e.create=function(t,n){return void 0===n&&(n={}),new e(t,n)},e.parseFormat=function(e){for(var t=null,n="",i=!1,r=[],o=0;o<e.length;o++){var s=e.charAt(o);"'"===s?(n.length>0&&r.push({literal:i,val:n}),t=null,n="",i=!i):i||s===t?n+=s:(n.length>0&&r.push({literal:!1,val:n}),n=s,t=s)}return n.length>0&&r.push({literal:i,val:n}),r},e.macroTokenToFormatOpts=function(e){return Me[e]};var t=e.prototype;return t.formatWithSystemDefault=function(e,t){return null===this.systemLoc&&(this.systemLoc=this.loc.redefaultToSystem()),this.systemLoc.dtFormatter(e,Object.assign({},this.opts,t)).format()},t.formatDateTime=function(e,t){return void 0===t&&(t={}),this.loc.dtFormatter(e,Object.assign({},this.opts,t)).format()},t.formatDateTimeParts=function(e,t){return void 0===t&&(t={}),this.loc.dtFormatter(e,Object.assign({},this.opts,t)).formatToParts()},t.resolvedOptions=function(e,t){return void 0===t&&(t={}),this.loc.dtFormatter(e,Object.assign({},this.opts,t)).resolvedOptions()},t.num=function(e,t){if(void 0===t&&(t=0),this.opts.forceSimple)return ne(e,t);var n=Object.assign({},this.opts);return t>0&&(n.padTo=t),this.loc.numberFormatter(n).format(e)},t.formatDateTimeFromString=function(t,n){var i=this,r="en"===this.loc.listingMode(),o=this.loc.outputCalendar&&"gregory"!==this.loc.outputCalendar&&K(),s=function(e,n){return i.loc.extract(t,e,n)},a=function(e){return t.isOffsetFixed&&0===t.offset&&e.allowZ?"Z":t.isValid?t.zone.formatOffset(t.ts,e.format):""},u=function(){return r?function(e){return xe[e.hour<12?0:1]}(t):s({hour:"numeric",hour12:!0},"dayperiod")},c=function(e,n){return r?function(e,t){return ke(t)[e.month-1]}(t,e):s(n?{month:e}:{month:e,day:"numeric"},"month")},l=function(e,n){return r?function(e,t){return Te(t)[e.weekday-1]}(t,e):s(n?{weekday:e}:{weekday:e,month:"long",day:"numeric"},"weekday")},d=function(e){return r?function(e,t){return Re(t)[e.year<0?0:1]}(t,e):s({era:e},"era")};return De(e.parseFormat(n),(function(n){switch(n){case"S":return i.num(t.millisecond);case"u":case"SSS":return i.num(t.millisecond,3);case"s":return i.num(t.second);case"ss":return i.num(t.second,2);case"m":return i.num(t.minute);case"mm":return i.num(t.minute,2);case"h":return i.num(t.hour%12==0?12:t.hour%12);case"hh":return i.num(t.hour%12==0?12:t.hour%12,2);case"H":return i.num(t.hour);case"HH":return i.num(t.hour,2);case"Z":return a({format:"narrow",allowZ:i.opts.allowZ});case"ZZ":return a({format:"short",allowZ:i.opts.allowZ});case"ZZZ":return a({format:"techie",allowZ:i.opts.allowZ});case"ZZZZ":return t.zone.offsetName(t.ts,{format:"short",locale:i.loc.locale});case"ZZZZZ":return t.zone.offsetName(t.ts,{format:"long",locale:i.loc.locale});case"z":return t.zoneName;case"a":return u();case"d":return o?s({day:"numeric"},"day"):i.num(t.day);case"dd":return o?s({day:"2-digit"},"day"):i.num(t.day,2);case"c":return i.num(t.weekday);case"ccc":return l("short",!0);case"cccc":return l("long",!0);case"ccccc":return l("narrow",!0);case"E":return i.num(t.weekday);case"EEE":return l("short",!1);case"EEEE":return l("long",!1);case"EEEEE":return l("narrow",!1);case"L":return o?s({month:"numeric",day:"numeric"},"month"):i.num(t.month);case"LL":return o?s({month:"2-digit",day:"numeric"},"month"):i.num(t.month,2);case"LLL":return c("short",!0);case"LLLL":return c("long",!0);case"LLLLL":return c("narrow",!0);case"M":return o?s({month:"numeric"},"month"):i.num(t.month);case"MM":return o?s({month:"2-digit"},"month"):i.num(t.month,2);case"MMM":return c("short",!1);case"MMMM":return c("long",!1);case"MMMMM":return c("narrow",!1);case"y":return o?s({year:"numeric"},"year"):i.num(t.year);case"yy":return o?s({year:"2-digit"},"year"):i.num(t.year.toString().slice(-2),2);case"yyyy":return o?s({year:"numeric"},"year"):i.num(t.year,4);case"yyyyyy":return o?s({year:"numeric"},"year"):i.num(t.year,6);case"G":return d("short");case"GG":return d("long");case"GGGGG":return d("narrow");case"kk":return i.num(t.weekYear.toString().slice(-2),2);case"kkkk":return i.num(t.weekYear,4);case"W":return i.num(t.weekNumber);case"WW":return i.num(t.weekNumber,2);case"o":return i.num(t.ordinal);case"ooo":return i.num(t.ordinal,3);case"q":return i.num(t.quarter);case"qq":return i.num(t.quarter,2);case"X":return i.num(Math.floor(t.ts/1e3));case"x":return i.num(t.ts);default:return function(n){var r=e.macroTokenToFormatOpts(n);return r?i.formatWithSystemDefault(t,r):n}(n)}}))},t.formatDurationFromString=function(t,n){var i,r=this,o=function(e){switch(e[0]){case"S":return"millisecond";case"s":return"second";case"m":return"minute";case"h":return"hour";case"d":return"day";case"M":return"month";case"y":return"year";default:return null}},s=e.parseFormat(n),a=s.reduce((function(e,t){var n=t.literal,i=t.val;return n?e:e.concat(i)}),[]),u=t.shiftTo.apply(t,a.map(o).filter((function(e){return e})));return De(s,(i=u,function(e){var t=o(e);return t?r.num(i.get(t),e.length):e}))},e}(),je=function(){function e(e,t){this.reason=e,this.explanation=t}return e.prototype.toMessage=function(){return this.explanation?this.reason+": "+this.explanation:this.reason},e}(),Ve=function(){function e(){}var t=e.prototype;return t.offsetName=function(e,t){throw new w},t.formatOffset=function(e,t){throw new w},t.offset=function(e){throw new w},t.equals=function(e){throw new w},r(e,[{key:"type",get:function(){throw new w}},{key:"name",get:function(){throw new w}},{key:"universal",get:function(){throw new w}},{key:"isValid",get:function(){throw new w}}]),e}(),Pe=null,qe=function(e){function t(){return e.apply(this,arguments)||this}o(t,e);var n=t.prototype;return n.offsetName=function(e,t){return fe(e,t.format,t.locale)},n.formatOffset=function(e,t){return ge(this.offset(e),t)},n.offset=function(e){return-new Date(e).getTimezoneOffset()},n.equals=function(e){return"local"===e.type},r(t,[{key:"type",get:function(){return"local"}},{key:"name",get:function(){return $()?(new Intl.DateTimeFormat).resolvedOptions().timeZone:"local"}},{key:"universal",get:function(){return!1}},{key:"isValid",get:function(){return!0}}],[{key:"instance",get:function(){return null===Pe&&(Pe=new t),Pe}}]),t}(Ve),Ue=RegExp("^"+ye.source+"$"),Fe={};var He={year:0,month:1,day:2,hour:3,minute:4,second:5};var ze={},Ze=function(e){function t(n){var i;return(i=e.call(this)||this).zoneName=n,i.valid=t.isValidZone(n),i}o(t,e),t.create=function(e){return ze[e]||(ze[e]=new t(e)),ze[e]},t.resetCache=function(){ze={},Fe={}},t.isValidSpecifier=function(e){return!(!e||!e.match(Ue))},t.isValidZone=function(e){try{return new Intl.DateTimeFormat("en-US",{timeZone:e}).format(),!0}catch(e){return!1}},t.parseGMTOffset=function(e){if(e){var t=e.match(/^Etc\/GMT([+-]\d{1,2})$/i);if(t)return-60*parseInt(t[1])}return null};var n=t.prototype;return n.offsetName=function(e,t){return fe(e,t.format,t.locale,this.name)},n.formatOffset=function(e,t){return ge(this.offset(e),t)},n.offset=function(e){var t,n=new Date(e),i=(t=this.name,Fe[t]||(Fe[t]=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"})),Fe[t]),r=i.formatToParts?function(e,t){for(var n=e.formatToParts(t),i=[],r=0;r<n.length;r++){var o=n[r],s=o.type,a=o.value,u=He[s];B(u)||(i[u]=parseInt(a,10))}return i}(i,n):function(e,t){var n=e.format(t).replace(/\u200E/g,""),i=/(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(n),r=i[1],o=i[2];return[i[3],r,o,i[4],i[5],i[6]]}(i,n),o=r[0],s=r[1],a=r[2],u=r[3],c=+n,l=c%1e3;return(ce({year:o,month:s,day:a,hour:24===u?0:u,minute:r[4],second:r[5],millisecond:0})-(c-=l>=0?l:1e3+l))/6e4},n.equals=function(e){return"iana"===e.type&&e.name===this.name},r(t,[{key:"type",get:function(){return"iana"}},{key:"name",get:function(){return this.zoneName}},{key:"universal",get:function(){return!1}},{key:"isValid",get:function(){return this.valid}}]),t}(Ve),Je=null,Be=function(e){function t(t){var n;return(n=e.call(this)||this).fixed=t,n}o(t,e),t.instance=function(e){return 0===e?t.utcInstance:new t(e)},t.parseSpecifier=function(e){if(e){var n=e.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);if(n)return new t(he(n[1],n[2]))}return null},r(t,null,[{key:"utcInstance",get:function(){return null===Je&&(Je=new t(0)),Je}}]);var n=t.prototype;return n.offsetName=function(){return this.name},n.formatOffset=function(e,t){return ge(this.fixed,t)},n.offset=function(){return this.fixed},n.equals=function(e){return"fixed"===e.type&&e.fixed===this.fixed},r(t,[{key:"type",get:function(){return"fixed"}},{key:"name",get:function(){return 0===this.fixed?"UTC":"UTC"+ge(this.fixed,"narrow")}},{key:"universal",get:function(){return!0}},{key:"isValid",get:function(){return!0}}]),t}(Ve),Ge=function(e){function t(t){var n;return(n=e.call(this)||this).zoneName=t,n}o(t,e);var n=t.prototype;return n.offsetName=function(){return null},n.formatOffset=function(){return""},n.offset=function(){return NaN},n.equals=function(){return!1},r(t,[{key:"type",get:function(){return"invalid"}},{key:"name",get:function(){return this.zoneName}},{key:"universal",get:function(){return!1}},{key:"isValid",get:function(){return!1}}]),t}(Ve);function We(e,t){var n;if(B(e)||null===e)return t;if(e instanceof Ve)return e;if("string"==typeof e){var i=e.toLowerCase();return"local"===i?t:"utc"===i||"gmt"===i?Be.utcInstance:null!=(n=Ze.parseGMTOffset(e))?Be.instance(n):Ze.isValidSpecifier(i)?Ze.create(e):Be.parseSpecifier(i)||new Ge(e)}return G(e)?Be.instance(e):"object"==typeof e&&e.offset&&"number"==typeof e.offset?e:new Ge(e)}var $e=function(){return Date.now()},Ke=null,Ye=null,Xe=null,Qe=null,et=!1,tt=function(){function e(){}return e.resetCaches=function(){ft.resetCache(),Ze.resetCache()},r(e,null,[{key:"now",get:function(){return $e},set:function(e){$e=e}},{key:"defaultZoneName",get:function(){return e.defaultZone.name},set:function(e){Ke=e?We(e):null}},{key:"defaultZone",get:function(){return Ke||qe.instance}},{key:"defaultLocale",get:function(){return Ye},set:function(e){Ye=e}},{key:"defaultNumberingSystem",get:function(){return Xe},set:function(e){Xe=e}},{key:"defaultOutputCalendar",get:function(){return Qe},set:function(e){Qe=e}},{key:"throwOnInvalid",get:function(){return et},set:function(e){et=e}}]),e}(),nt={};function it(e,t){void 0===t&&(t={});var n=JSON.stringify([e,t]),i=nt[n];return i||(i=new Intl.DateTimeFormat(e,t),nt[n]=i),i}var rt={};var ot={};function st(e,t){void 0===t&&(t={});var n=t,i=(n.base,function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(n,["base"])),r=JSON.stringify([e,i]),o=ot[r];return o||(o=new Intl.RelativeTimeFormat(e,t),ot[r]=o),o}var at=null;function ut(e,t,n,i,r){var o=e.listingMode(n);return"error"===o?null:"en"===o?i(t):r(t)}var ct=function(){function e(e,t,n){if(this.padTo=n.padTo||0,this.floor=n.floor||!1,!t&&$()){var i={useGrouping:!1};n.padTo>0&&(i.minimumIntegerDigits=n.padTo),this.inf=function(e,t){void 0===t&&(t={});var n=JSON.stringify([e,t]),i=rt[n];return i||(i=new Intl.NumberFormat(e,t),rt[n]=i),i}(e,i)}}return e.prototype.format=function(e){if(this.inf){var t=this.floor?Math.floor(e):e;return this.inf.format(t)}return ne(this.floor?Math.floor(e):oe(e,3),this.padTo)},e}(),lt=function(){function e(e,t,n){var i;if(this.opts=n,this.hasIntl=$(),e.zone.universal&&this.hasIntl?(i="UTC",n.timeZoneName?this.dt=e:this.dt=0===e.offset?e:ui.fromMillis(e.ts+60*e.offset*1e3)):"local"===e.zone.type?this.dt=e:(this.dt=e,i=e.zone.name),this.hasIntl){var r=Object.assign({},this.opts);i&&(r.timeZone=i),this.dtf=it(t,r)}}var t=e.prototype;return t.format=function(){if(this.hasIntl)return this.dtf.format(this.dt.toJSDate());var e=function(e){switch(Se(Q(e,["weekday","era","year","month","day","hour","minute","second","timeZoneName","hour12"]))){case Se(O):return"M/d/yyyy";case Se(L):return"LLL d, yyyy";case Se(C):return"EEE, LLL d, yyyy";case Se(T):return"LLLL d, yyyy";case Se(x):return"EEEE, LLLL d, yyyy";case Se(I):return"h:mm a";case Se(A):return"h:mm:ss a";case Se(N):case Se(R):return"h:mm a";case Se(D):return"HH:mm";case Se(M):return"HH:mm:ss";case Se(_):case Se(j):return"HH:mm";case Se(V):return"M/d/yyyy, h:mm a";case Se(q):return"LLL d, yyyy, h:mm a";case Se(H):return"LLLL d, yyyy, h:mm a";case Se(Z):return"EEEE, LLLL d, yyyy, h:mm a";case Se(P):return"M/d/yyyy, h:mm:ss a";case Se(U):return"LLL d, yyyy, h:mm:ss a";case Se(F):return"EEE, d LLL yyyy, h:mm a";case Se(z):return"LLLL d, yyyy, h:mm:ss a";case Se(J):return"EEEE, LLLL d, yyyy, h:mm:ss a";default:return"EEEE, LLLL d, yyyy, h:mm a"}}(this.opts),t=ft.create("en-US");return _e.create(t).formatDateTimeFromString(this.dt,e)},t.formatToParts=function(){return this.hasIntl&&K()?this.dtf.formatToParts(this.dt.toJSDate()):[]},t.resolvedOptions=function(){return this.hasIntl?this.dtf.resolvedOptions():{locale:"en-US",numberingSystem:"latn",outputCalendar:"gregory"}},e}(),dt=function(){function e(e,t,n){this.opts=Object.assign({style:"long"},n),!t&&Y()&&(this.rtf=st(e,n))}var t=e.prototype;return t.format=function(e,t){return this.rtf?this.rtf.format(e,t):function(e,t,n,i){void 0===n&&(n="always"),void 0===i&&(i=!1);var r={years:["year","yr."],quarters:["quarter","qtr."],months:["month","mo."],weeks:["week","wk."],days:["day","day","days"],hours:["hour","hr."],minutes:["minute","min."],seconds:["second","sec."]},o=-1===["hours","minutes","seconds"].indexOf(e);if("auto"===n&&o){var s="days"===e;switch(t){case 1:return s?"tomorrow":"next "+r[e][0];case-1:return s?"yesterday":"last "+r[e][0];case 0:return s?"today":"this "+r[e][0]}}var a=Object.is(t,-0)||t<0,u=Math.abs(t),c=1===u,l=r[e],d=i?c?l[1]:l[2]||l[1]:c?r[e][0]:e;return a?u+" "+d+" ago":"in "+u+" "+d}(t,e,this.opts.numeric,"long"!==this.opts.style)},t.formatToParts=function(e,t){return this.rtf?this.rtf.formatToParts(e,t):[]},e}(),ft=function(){function e(e,t,n,i){var r=function(e){var t=e.indexOf("-u-");if(-1===t)return[e];var n,i=e.substring(0,t);try{n=it(e).resolvedOptions()}catch(e){n=it(i).resolvedOptions()}var r=n;return[i,r.numberingSystem,r.calendar]}(e),o=r[0],s=r[1],a=r[2];this.locale=o,this.numberingSystem=t||s||null,this.outputCalendar=n||a||null,this.intl=function(e,t,n){return $()?n||t?(e+="-u",n&&(e+="-ca-"+n),t&&(e+="-nu-"+t),e):e:[]}(this.locale,this.numberingSystem,this.outputCalendar),this.weekdaysCache={format:{},standalone:{}},this.monthsCache={format:{},standalone:{}},this.meridiemCache=null,this.eraCache={},this.specifiedLocale=i,this.fastNumbersCached=null}e.fromOpts=function(t){return e.create(t.locale,t.numberingSystem,t.outputCalendar,t.defaultToEN)},e.create=function(t,n,i,r){void 0===r&&(r=!1);var o=t||tt.defaultLocale;return new e(o||(r?"en-US":function(){if(at)return at;if($()){var e=(new Intl.DateTimeFormat).resolvedOptions().locale;return at=e&&"und"!==e?e:"en-US"}return at="en-US"}()),n||tt.defaultNumberingSystem,i||tt.defaultOutputCalendar,o)},e.resetCache=function(){at=null,nt={},rt={},ot={}},e.fromObject=function(t){var n=void 0===t?{}:t,i=n.locale,r=n.numberingSystem,o=n.outputCalendar;return e.create(i,r,o)};var t=e.prototype;return t.listingMode=function(e){void 0===e&&(e=!0);var t=$()&&K(),n=this.isEnglish(),i=!(null!==this.numberingSystem&&"latn"!==this.numberingSystem||null!==this.outputCalendar&&"gregory"!==this.outputCalendar);return t||n&&i||e?!t||n&&i?"en":"intl":"error"},t.clone=function(t){return t&&0!==Object.getOwnPropertyNames(t).length?e.create(t.locale||this.specifiedLocale,t.numberingSystem||this.numberingSystem,t.outputCalendar||this.outputCalendar,t.defaultToEN||!1):this},t.redefaultToEN=function(e){return void 0===e&&(e={}),this.clone(Object.assign({},e,{defaultToEN:!0}))},t.redefaultToSystem=function(e){return void 0===e&&(e={}),this.clone(Object.assign({},e,{defaultToEN:!1}))},t.months=function(e,t,n){var i=this;return void 0===t&&(t=!1),void 0===n&&(n=!0),ut(this,e,n,ke,(function(){var n=t?{month:e,day:"numeric"}:{month:e},r=t?"format":"standalone";return i.monthsCache[r][e]||(i.monthsCache[r][e]=function(e){for(var t=[],n=1;n<=12;n++){var i=ui.utc(2016,n,1);t.push(e(i))}return t}((function(e){return i.extract(e,n,"month")}))),i.monthsCache[r][e]}))},t.weekdays=function(e,t,n){var i=this;return void 0===t&&(t=!1),void 0===n&&(n=!0),ut(this,e,n,Te,(function(){var n=t?{weekday:e,year:"numeric",month:"long",day:"numeric"}:{weekday:e},r=t?"format":"standalone";return i.weekdaysCache[r][e]||(i.weekdaysCache[r][e]=function(e){for(var t=[],n=1;n<=7;n++){var i=ui.utc(2016,11,13+n);t.push(e(i))}return t}((function(e){return i.extract(e,n,"weekday")}))),i.weekdaysCache[r][e]}))},t.meridiems=function(e){var t=this;return void 0===e&&(e=!0),ut(this,void 0,e,(function(){return xe}),(function(){if(!t.meridiemCache){var e={hour:"numeric",hour12:!0};t.meridiemCache=[ui.utc(2016,11,13,9),ui.utc(2016,11,13,19)].map((function(n){return t.extract(n,e,"dayperiod")}))}return t.meridiemCache}))},t.eras=function(e,t){var n=this;return void 0===t&&(t=!0),ut(this,e,t,Re,(function(){var t={era:e};return n.eraCache[e]||(n.eraCache[e]=[ui.utc(-40,1,1),ui.utc(2017,1,1)].map((function(e){return n.extract(e,t,"era")}))),n.eraCache[e]}))},t.extract=function(e,t,n){var i=this.dtFormatter(e,t).formatToParts().find((function(e){return e.type.toLowerCase()===n}));return i?i.value:null},t.numberFormatter=function(e){return void 0===e&&(e={}),new ct(this.intl,e.forceSimple||this.fastNumbers,e)},t.dtFormatter=function(e,t){return void 0===t&&(t={}),new lt(e,this.intl,t)},t.relFormatter=function(e){return void 0===e&&(e={}),new dt(this.intl,this.isEnglish(),e)},t.isEnglish=function(){return"en"===this.locale||"en-us"===this.locale.toLowerCase()||$()&&new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us")},t.equals=function(e){return this.locale===e.locale&&this.numberingSystem===e.numberingSystem&&this.outputCalendar===e.outputCalendar},r(e,[{key:"fastNumbers",get:function(){var e;return null==this.fastNumbersCached&&(this.fastNumbersCached=(!(e=this).numberingSystem||"latn"===e.numberingSystem)&&("latn"===e.numberingSystem||!e.locale||e.locale.startsWith("en")||$()&&"latn"===new Intl.DateTimeFormat(e.intl).resolvedOptions().numberingSystem)),this.fastNumbersCached}}]),e}();function ht(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];var i=t.reduce((function(e,t){return e+t.source}),"");return RegExp("^"+i+"$")}function pt(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){return t.reduce((function(t,n){var i=t[0],r=t[1],o=t[2],s=n(e,o),a=s[0],u=s[1],c=s[2];return[Object.assign(i,a),r||u,c]}),[{},null,1]).slice(0,2)}}function vt(e){if(null==e)return[null,null];for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];for(var r=0,o=n;r<o.length;r++){var s=o[r],a=s[0],u=s[1],c=a.exec(e);if(c)return u(c)}return[null,null]}function gt(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e,n){var i,r={};for(i=0;i<t.length;i++)r[t[i]]=ie(e[n+i]);return[r,null,n+i]}}var mt=/(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,yt=/(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,St=RegExp(""+yt.source+mt.source+"?"),wt=RegExp("(?:T"+St.source+")?"),bt=gt("weekYear","weekNumber","weekDay"),Et=gt("year","ordinal"),kt=RegExp(yt.source+" ?(?:"+mt.source+"|("+ye.source+"))?"),Ot=RegExp("(?: "+kt.source+")?");function Lt(e,t,n){var i=e[t];return B(i)?n:ie(i)}function Ct(e,t){return[{year:Lt(e,t),month:Lt(e,t+1,1),day:Lt(e,t+2,1)},null,t+3]}function Tt(e,t){return[{hour:Lt(e,t,0),minute:Lt(e,t+1,0),second:Lt(e,t+2,0),millisecond:re(e[t+3])},null,t+4]}function xt(e,t){var n=!e[t]&&!e[t+1],i=he(e[t+1],e[t+2]);return[{},n?null:Be.instance(i),t+3]}function It(e,t){return[{},e[t]?Ze.create(e[t]):null,t+1]}var At=/^-?P(?:(?:(-?\d{1,9})Y)?(?:(-?\d{1,9})M)?(?:(-?\d{1,9})W)?(?:(-?\d{1,9})D)?(?:T(?:(-?\d{1,9})H)?(?:(-?\d{1,9})M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;function Nt(e){var t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],s=e[5],a=e[6],u=e[7],c=e[8],l="-"===t[0],d=function(e){return e&&l?-e:e};return[{years:d(ie(n)),months:d(ie(i)),weeks:d(ie(r)),days:d(ie(o)),hours:d(ie(s)),minutes:d(ie(a)),seconds:d(ie(u)),milliseconds:d(re(c))}]}var Rt={GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Dt(e,t,n,i,r,o,s){var a={year:2===t.length?de(ie(t)):ie(t),month:be.indexOf(n)+1,day:ie(i),hour:ie(r),minute:ie(o)};return s&&(a.second=ie(s)),e&&(a.weekday=e.length>3?Oe.indexOf(e)+1:Le.indexOf(e)+1),a}var Mt=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;function _t(e){var t,n=e[1],i=e[2],r=e[3],o=e[4],s=e[5],a=e[6],u=e[7],c=e[8],l=e[9],d=e[10],f=e[11],h=Dt(n,o,r,i,s,a,u);return t=c?Rt[c]:l?0:he(d,f),[h,new Be(t)]}var jt=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,Vt=/^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,Pt=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;function qt(e){var t=e[1],n=e[2],i=e[3];return[Dt(t,e[4],i,n,e[5],e[6],e[7]),Be.utcInstance]}function Ut(e){var t=e[1],n=e[2],i=e[3],r=e[4],o=e[5],s=e[6];return[Dt(t,e[7],n,i,r,o,s),Be.utcInstance]}var Ft=ht(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,wt),Ht=ht(/(\d{4})-?W(\d\d)(?:-?(\d))?/,wt),zt=ht(/(\d{4})-?(\d{3})/,wt),Zt=ht(St),Jt=pt(Ct,Tt,xt),Bt=pt(bt,Tt,xt),Gt=pt(Et,Tt),Wt=pt(Tt,xt);var $t=ht(/(\d{4})-(\d\d)-(\d\d)/,Ot),Kt=ht(kt),Yt=pt(Ct,Tt,xt,It),Xt=pt(Tt,xt,It);var Qt={weeks:{days:7,hours:168,minutes:10080,seconds:604800,milliseconds:6048e5},days:{hours:24,minutes:1440,seconds:86400,milliseconds:864e5},hours:{minutes:60,seconds:3600,milliseconds:36e5},minutes:{seconds:60,milliseconds:6e4},seconds:{milliseconds:1e3}},en=Object.assign({years:{quarters:4,months:12,weeks:52,days:365,hours:8760,minutes:525600,seconds:31536e3,milliseconds:31536e6},quarters:{months:3,weeks:13,days:91,hours:2184,minutes:131040,seconds:7862400,milliseconds:78624e5},months:{weeks:4,days:30,hours:720,minutes:43200,seconds:2592e3,milliseconds:2592e6}},Qt),tn=Object.assign({years:{quarters:4,months:12,weeks:52.1775,days:365.2425,hours:8765.82,minutes:525949.2,seconds:525949.2*60,milliseconds:525949.2*60*1e3},quarters:{months:3,weeks:13.044375,days:91.310625,hours:2191.455,minutes:131487.3,seconds:525949.2*60/4,milliseconds:7889237999.999999},months:{weeks:30.436875/7,days:30.436875,hours:730.485,minutes:43829.1,seconds:2629746,milliseconds:2629746e3}},Qt),nn=["years","quarters","months","weeks","days","hours","minutes","seconds","milliseconds"],rn=nn.slice(0).reverse();function on(e,t,n){void 0===n&&(n=!1);var i={values:n?t.values:Object.assign({},e.values,t.values||{}),loc:e.loc.clone(t.loc),conversionAccuracy:t.conversionAccuracy||e.conversionAccuracy};return new an(i)}function sn(e,t,n,i,r){var o=e[r][n],s=t[n]/o,a=!(Math.sign(s)===Math.sign(i[r]))&&0!==i[r]&&Math.abs(s)<=1?function(e){return e<0?Math.floor(e):Math.ceil(e)}(s):Math.trunc(s);i[r]+=a,t[n]-=a*o}var an=function(){function e(e){var t="longterm"===e.conversionAccuracy||!1;this.values=e.values,this.loc=e.loc||ft.create(),this.conversionAccuracy=t?"longterm":"casual",this.invalid=e.invalid||null,this.matrix=t?tn:en,this.isLuxonDuration=!0}e.fromMillis=function(t,n){return e.fromObject(Object.assign({milliseconds:t},n))},e.fromObject=function(t){if(null==t||"object"!=typeof t)throw new S("Duration.fromObject: argument expected to be an object, got "+(null===t?"null":typeof t));return new e({values:ve(t,e.normalizeUnit,["locale","numberingSystem","conversionAccuracy","zone"]),loc:ft.fromObject(t),conversionAccuracy:t.conversionAccuracy})},e.fromISO=function(t,n){var i=function(e){return vt(e,[At,Nt])}(t)[0];if(i){var r=Object.assign(i,n);return e.fromObject(r)}return e.invalid("unparsable",'the input "'+t+"\" can't be parsed as ISO 8601")},e.invalid=function(t,n){if(void 0===n&&(n=null),!t)throw new S("need to specify a reason the Duration is invalid");var i=t instanceof je?t:new je(t,n);if(tt.throwOnInvalid)throw new g(i);return new e({invalid:i})},e.normalizeUnit=function(e){var t={year:"years",years:"years",quarter:"quarters",quarters:"quarters",month:"months",months:"months",week:"weeks",weeks:"weeks",day:"days",days:"days",hour:"hours",hours:"hours",minute:"minutes",minutes:"minutes",second:"seconds",seconds:"seconds",millisecond:"milliseconds",milliseconds:"milliseconds"}[e?e.toLowerCase():e];if(!t)throw new y(e);return t},e.isDuration=function(e){return e&&e.isLuxonDuration||!1};var t=e.prototype;return t.toFormat=function(e,t){void 0===t&&(t={});var n=Object.assign({},t,{floor:!1!==t.round&&!1!==t.floor});return this.isValid?_e.create(this.loc,n).formatDurationFromString(this,e):"Invalid Duration"},t.toObject=function(e){if(void 0===e&&(e={}),!this.isValid)return{};var t=Object.assign({},this.values);return e.includeConfig&&(t.conversionAccuracy=this.conversionAccuracy,t.numberingSystem=this.loc.numberingSystem,t.locale=this.loc.locale),t},t.toISO=function(){if(!this.isValid)return null;var e="P";return 0!==this.years&&(e+=this.years+"Y"),0===this.months&&0===this.quarters||(e+=this.months+3*this.quarters+"M"),0!==this.weeks&&(e+=this.weeks+"W"),0!==this.days&&(e+=this.days+"D"),0===this.hours&&0===this.minutes&&0===this.seconds&&0===this.milliseconds||(e+="T"),0!==this.hours&&(e+=this.hours+"H"),0!==this.minutes&&(e+=this.minutes+"M"),0===this.seconds&&0===this.milliseconds||(e+=oe(this.seconds+this.milliseconds/1e3,3)+"S"),"P"===e&&(e+="T0S"),e},t.toJSON=function(){return this.toISO()},t.toString=function(){return this.toISO()},t.valueOf=function(){return this.as("milliseconds")},t.plus=function(e){if(!this.isValid)return this;for(var t,n=un(e),i={},r=f(nn);!(t=r()).done;){var o=t.value;(ee(n.values,o)||ee(this.values,o))&&(i[o]=n.get(o)+this.get(o))}return on(this,{values:i},!0)},t.minus=function(e){if(!this.isValid)return this;var t=un(e);return this.plus(t.negate())},t.mapUnits=function(e){if(!this.isValid)return this;for(var t={},n=0,i=Object.keys(this.values);n<i.length;n++){var r=i[n];t[r]=pe(e(this.values[r],r))}return on(this,{values:t},!0)},t.get=function(t){return this[e.normalizeUnit(t)]},t.set=function(t){return this.isValid?on(this,{values:Object.assign(this.values,ve(t,e.normalizeUnit,[]))}):this},t.reconfigure=function(e){var t=void 0===e?{}:e,n=t.locale,i=t.numberingSystem,r=t.conversionAccuracy,o={loc:this.loc.clone({locale:n,numberingSystem:i})};return r&&(o.conversionAccuracy=r),on(this,o)},t.as=function(e){return this.isValid?this.shiftTo(e).get(e):NaN},t.normalize=function(){if(!this.isValid)return this;var e=this.toObject();return function(e,t){rn.reduce((function(n,i){return B(t[i])?n:(n&&sn(e,t,n,t,i),i)}),null)}(this.matrix,e),on(this,{values:e},!0)},t.shiftTo=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];if(!this.isValid)return this;if(0===n.length)return this;n=n.map((function(t){return e.normalizeUnit(t)}));for(var r,o,s={},a={},u=this.toObject(),c=f(nn);!(o=c()).done;){var l=o.value;if(n.indexOf(l)>=0){r=l;var d=0;for(var h in a)d+=this.matrix[h][l]*a[h],a[h]=0;G(u[l])&&(d+=u[l]);var p=Math.trunc(d);for(var v in s[l]=p,a[l]=d-p,u)nn.indexOf(v)>nn.indexOf(l)&&sn(this.matrix,u,v,s,l)}else G(u[l])&&(a[l]=u[l])}for(var g in a)0!==a[g]&&(s[r]+=g===r?a[g]:a[g]/this.matrix[r][g]);return on(this,{values:s},!0).normalize()},t.negate=function(){if(!this.isValid)return this;for(var e={},t=0,n=Object.keys(this.values);t<n.length;t++){var i=n[t];e[i]=-this.values[i]}return on(this,{values:e},!0)},t.equals=function(e){if(!this.isValid||!e.isValid)return!1;if(!this.loc.equals(e.loc))return!1;for(var t,n=f(nn);!(t=n()).done;){var i=t.value;if(this.values[i]!==e.values[i])return!1}return!0},r(e,[{key:"locale",get:function(){return this.isValid?this.loc.locale:null}},{key:"numberingSystem",get:function(){return this.isValid?this.loc.numberingSystem:null}},{key:"years",get:function(){return this.isValid?this.values.years||0:NaN}},{key:"quarters",get:function(){return this.isValid?this.values.quarters||0:NaN}},{key:"months",get:function(){return this.isValid?this.values.months||0:NaN}},{key:"weeks",get:function(){return this.isValid?this.values.weeks||0:NaN}},{key:"days",get:function(){return this.isValid?this.values.days||0:NaN}},{key:"hours",get:function(){return this.isValid?this.values.hours||0:NaN}},{key:"minutes",get:function(){return this.isValid?this.values.minutes||0:NaN}},{key:"seconds",get:function(){return this.isValid?this.values.seconds||0:NaN}},{key:"milliseconds",get:function(){return this.isValid?this.values.milliseconds||0:NaN}},{key:"isValid",get:function(){return null===this.invalid}},{key:"invalidReason",get:function(){return this.invalid?this.invalid.reason:null}},{key:"invalidExplanation",get:function(){return this.invalid?this.invalid.explanation:null}}]),e}();function un(e){if(G(e))return an.fromMillis(e);if(an.isDuration(e))return e;if("object"==typeof e)return an.fromObject(e);throw new S("Unknown duration argument "+e+" of type "+typeof e)}var cn="Invalid Interval";function ln(e,t){return e&&e.isValid?t&&t.isValid?t<e?dn.invalid("end before start","The end of an interval must be after its start, but you had start="+e.toISO()+" and end="+t.toISO()):null:dn.invalid("missing or invalid end"):dn.invalid("missing or invalid start")}var dn=function(){function e(e){this.s=e.start,this.e=e.end,this.invalid=e.invalid||null,this.isLuxonInterval=!0}e.invalid=function(t,n){if(void 0===n&&(n=null),!t)throw new S("need to specify a reason the Interval is invalid");var i=t instanceof je?t:new je(t,n);if(tt.throwOnInvalid)throw new v(i);return new e({invalid:i})},e.fromDateTimes=function(t,n){var i=ci(t),r=ci(n),o=ln(i,r);return null==o?new e({start:i,end:r}):o},e.after=function(t,n){var i=un(n),r=ci(t);return e.fromDateTimes(r,r.plus(i))},e.before=function(t,n){var i=un(n),r=ci(t);return e.fromDateTimes(r.minus(i),r)},e.fromISO=function(t,n){var i=(t||"").split("/",2),r=i[0],o=i[1];if(r&&o){var s,a,u,c;try{a=(s=ui.fromISO(r,n)).isValid}catch(o){a=!1}try{c=(u=ui.fromISO(o,n)).isValid}catch(o){c=!1}if(a&&c)return e.fromDateTimes(s,u);if(a){var l=an.fromISO(o,n);if(l.isValid)return e.after(s,l)}else if(c){var d=an.fromISO(r,n);if(d.isValid)return e.before(u,d)}}return e.invalid("unparsable",'the input "'+t+"\" can't be parsed as ISO 8601")},e.isInterval=function(e){return e&&e.isLuxonInterval||!1};var t=e.prototype;return t.length=function(e){return void 0===e&&(e="milliseconds"),this.isValid?this.toDuration.apply(this,[e]).get(e):NaN},t.count=function(e){if(void 0===e&&(e="milliseconds"),!this.isValid)return NaN;var t=this.start.startOf(e),n=this.end.startOf(e);return Math.floor(n.diff(t,e).get(e))+1},t.hasSame=function(e){return!!this.isValid&&(this.isEmpty()||this.e.minus(1).hasSame(this.s,e))},t.isEmpty=function(){return this.s.valueOf()===this.e.valueOf()},t.isAfter=function(e){return!!this.isValid&&this.s>e},t.isBefore=function(e){return!!this.isValid&&this.e<=e},t.contains=function(e){return!!this.isValid&&(this.s<=e&&this.e>e)},t.set=function(t){var n=void 0===t?{}:t,i=n.start,r=n.end;return this.isValid?e.fromDateTimes(i||this.s,r||this.e):this},t.splitAt=function(){var t=this;if(!this.isValid)return[];for(var n=arguments.length,i=new Array(n),r=0;r<n;r++)i[r]=arguments[r];for(var o=i.map(ci).filter((function(e){return t.contains(e)})).sort(),s=[],a=this.s,u=0;a<this.e;){var c=o[u]||this.e,l=+c>+this.e?this.e:c;s.push(e.fromDateTimes(a,l)),a=l,u+=1}return s},t.splitBy=function(t){var n=un(t);if(!this.isValid||!n.isValid||0===n.as("milliseconds"))return[];for(var i,r,o=this.s,s=[];o<this.e;)r=+(i=o.plus(n))>+this.e?this.e:i,s.push(e.fromDateTimes(o,r)),o=r;return s},t.divideEqually=function(e){return this.isValid?this.splitBy(this.length()/e).slice(0,e):[]},t.overlaps=function(e){return this.e>e.s&&this.s<e.e},t.abutsStart=function(e){return!!this.isValid&&+this.e==+e.s},t.abutsEnd=function(e){return!!this.isValid&&+e.e==+this.s},t.engulfs=function(e){return!!this.isValid&&(this.s<=e.s&&this.e>=e.e)},t.equals=function(e){return!(!this.isValid||!e.isValid)&&(this.s.equals(e.s)&&this.e.equals(e.e))},t.intersection=function(t){if(!this.isValid)return this;var n=this.s>t.s?this.s:t.s,i=this.e<t.e?this.e:t.e;return n>i?null:e.fromDateTimes(n,i)},t.union=function(t){if(!this.isValid)return this;var n=this.s<t.s?this.s:t.s,i=this.e>t.e?this.e:t.e;return e.fromDateTimes(n,i)},e.merge=function(e){var t=e.sort((function(e,t){return e.s-t.s})).reduce((function(e,t){var n=e[0],i=e[1];return i?i.overlaps(t)||i.abutsStart(t)?[n,i.union(t)]:[n.concat([i]),t]:[n,t]}),[[],null]),n=t[0],i=t[1];return i&&n.push(i),n},e.xor=function(t){for(var n,i,r=null,o=0,s=[],a=t.map((function(e){return[{time:e.s,type:"s"},{time:e.e,type:"e"}]})),u=f((n=Array.prototype).concat.apply(n,a).sort((function(e,t){return e.time-t.time})));!(i=u()).done;){var c=i.value;1===(o+="s"===c.type?1:-1)?r=c.time:(r&&+r!=+c.time&&s.push(e.fromDateTimes(r,c.time)),r=null)}return e.merge(s)},t.difference=function(){for(var t=this,n=arguments.length,i=new Array(n),r=0;r<n;r++)i[r]=arguments[r];return e.xor([this].concat(i)).map((function(e){return t.intersection(e)})).filter((function(e){return e&&!e.isEmpty()}))},t.toString=function(){return this.isValid?"["+this.s.toISO()+" – "+this.e.toISO()+")":cn},t.toISO=function(e){return this.isValid?this.s.toISO(e)+"/"+this.e.toISO(e):cn},t.toISODate=function(){return this.isValid?this.s.toISODate()+"/"+this.e.toISODate():cn},t.toISOTime=function(e){return this.isValid?this.s.toISOTime(e)+"/"+this.e.toISOTime(e):cn},t.toFormat=function(e,t){var n=(void 0===t?{}:t).separator,i=void 0===n?" – ":n;return this.isValid?""+this.s.toFormat(e)+i+this.e.toFormat(e):cn},t.toDuration=function(e,t){return this.isValid?this.e.diff(this.s,e,t):an.invalid(this.invalidReason)},t.mapEndpoints=function(t){return e.fromDateTimes(t(this.s),t(this.e))},r(e,[{key:"start",get:function(){return this.isValid?this.s:null}},{key:"end",get:function(){return this.isValid?this.e:null}},{key:"isValid",get:function(){return null===this.invalidReason}},{key:"invalidReason",get:function(){return this.invalid?this.invalid.reason:null}},{key:"invalidExplanation",get:function(){return this.invalid?this.invalid.explanation:null}}]),e}(),fn=function(){function e(){}return e.hasDST=function(e){void 0===e&&(e=tt.defaultZone);var t=ui.local().setZone(e).set({month:12});return!e.universal&&t.offset!==t.set({month:6}).offset},e.isValidIANAZone=function(e){return Ze.isValidSpecifier(e)&&Ze.isValidZone(e)},e.normalizeZone=function(e){return We(e,tt.defaultZone)},e.months=function(e,t){void 0===e&&(e="long");var n=void 0===t?{}:t,i=n.locale,r=void 0===i?null:i,o=n.numberingSystem,s=void 0===o?null:o,a=n.outputCalendar,u=void 0===a?"gregory":a;return ft.create(r,s,u).months(e)},e.monthsFormat=function(e,t){void 0===e&&(e="long");var n=void 0===t?{}:t,i=n.locale,r=void 0===i?null:i,o=n.numberingSystem,s=void 0===o?null:o,a=n.outputCalendar,u=void 0===a?"gregory":a;return ft.create(r,s,u).months(e,!0)},e.weekdays=function(e,t){void 0===e&&(e="long");var n=void 0===t?{}:t,i=n.locale,r=void 0===i?null:i,o=n.numberingSystem,s=void 0===o?null:o;return ft.create(r,s,null).weekdays(e)},e.weekdaysFormat=function(e,t){void 0===e&&(e="long");var n=void 0===t?{}:t,i=n.locale,r=void 0===i?null:i,o=n.numberingSystem,s=void 0===o?null:o;return ft.create(r,s,null).weekdays(e,!0)},e.meridiems=function(e){var t=(void 0===e?{}:e).locale,n=void 0===t?null:t;return ft.create(n).meridiems()},e.eras=function(e,t){void 0===e&&(e="short");var n=(void 0===t?{}:t).locale,i=void 0===n?null:n;return ft.create(i,null,"gregory").eras(e)},e.features=function(){var e=!1,t=!1,n=!1,i=!1;if($()){e=!0,t=K(),i=Y();try{n="America/New_York"===new Intl.DateTimeFormat("en",{timeZone:"America/New_York"}).resolvedOptions().timeZone}catch(e){n=!1}}return{intl:e,intlTokens:t,zones:n,relative:i}},e}();function hn(e,t){var n=function(e){return e.toUTC(0,{keepLocalTime:!0}).startOf("day").valueOf()},i=n(t)-n(e);return Math.floor(an.fromMillis(i).as("days"))}function pn(e,t,n,i){var r=function(e,t,n){for(var i,r,o={},s=0,a=[["years",function(e,t){return t.year-e.year}],["months",function(e,t){return t.month-e.month+12*(t.year-e.year)}],["weeks",function(e,t){var n=hn(e,t);return(n-n%7)/7}],["days",hn]];s<a.length;s++){var u=a[s],c=u[0],l=u[1];if(n.indexOf(c)>=0){var d;i=c;var f,h=l(e,t);if((r=e.plus(((d={})[c]=h,d)))>t)e=e.plus(((f={})[c]=h-1,f)),h-=1;else e=r;o[c]=h}}return[e,o,r,i]}(e,t,n),o=r[0],s=r[1],a=r[2],u=r[3],c=t-o,l=n.filter((function(e){return["hours","minutes","seconds","milliseconds"].indexOf(e)>=0}));if(0===l.length){var d;if(a<t)a=o.plus(((d={})[u]=1,d));a!==o&&(s[u]=(s[u]||0)+c/(a-o))}var f,h=an.fromObject(Object.assign(s,i));return l.length>0?(f=an.fromMillis(c,i)).shiftTo.apply(f,l).plus(h):h}var vn={arab:"[٠-٩]",arabext:"[۰-۹]",bali:"[᭐-᭙]",beng:"[০-৯]",deva:"[०-९]",fullwide:"[０-９]",gujr:"[૦-૯]",hanidec:"[〇|一|二|三|四|五|六|七|八|九]",khmr:"[០-៩]",knda:"[೦-೯]",laoo:"[໐-໙]",limb:"[᥆-᥏]",mlym:"[൦-൯]",mong:"[᠐-᠙]",mymr:"[၀-၉]",orya:"[୦-୯]",tamldec:"[௦-௯]",telu:"[౦-౯]",thai:"[๐-๙]",tibt:"[༠-༩]",latn:"\\d"},gn={arab:[1632,1641],arabext:[1776,1785],bali:[6992,7001],beng:[2534,2543],deva:[2406,2415],fullwide:[65296,65303],gujr:[2790,2799],khmr:[6112,6121],knda:[3302,3311],laoo:[3792,3801],limb:[6470,6479],mlym:[3430,3439],mong:[6160,6169],mymr:[4160,4169],orya:[2918,2927],tamldec:[3046,3055],telu:[3174,3183],thai:[3664,3673],tibt:[3872,3881]},mn=vn.hanidec.replace(/[\[|\]]/g,"").split("");function yn(e,t){var n=e.numberingSystem;return void 0===t&&(t=""),new RegExp(""+vn[n||"latn"]+t)}function Sn(e,t){return void 0===t&&(t=function(e){return e}),{regex:e,deser:function(e){var n=e[0];return t(function(e){var t=parseInt(e,10);if(isNaN(t)){t="";for(var n=0;n<e.length;n++){var i=e.charCodeAt(n);if(-1!==e[n].search(vn.hanidec))t+=mn.indexOf(e[n]);else for(var r in gn){var o=gn[r],s=o[0],a=o[1];i>=s&&i<=a&&(t+=i-s)}}return parseInt(t,10)}return t}(n))}}}var wn="( |"+String.fromCharCode(160)+")",bn=new RegExp(wn,"g");function En(e){return e.replace(/\./g,"\\.?").replace(bn,wn)}function kn(e){return e.replace(/\./g,"").replace(bn," ").toLowerCase()}function On(e,t){return null===e?null:{regex:RegExp(e.map(En).join("|")),deser:function(n){var i=n[0];return e.findIndex((function(e){return kn(i)===kn(e)}))+t}}}function Ln(e,t){return{regex:e,deser:function(e){return he(e[1],e[2])},groups:t}}function Cn(e){return{regex:e,deser:function(e){return e[0]}}}var Tn={year:{"2-digit":"yy",numeric:"yyyyy"},month:{numeric:"M","2-digit":"MM",short:"MMM",long:"MMMM"},day:{numeric:"d","2-digit":"dd"},weekday:{short:"EEE",long:"EEEE"},dayperiod:"a",dayPeriod:"a",hour:{numeric:"h","2-digit":"hh"},minute:{numeric:"m","2-digit":"mm"},second:{numeric:"s","2-digit":"ss"}};var xn=null;function In(e,t){if(e.literal)return e;var n=_e.macroTokenToFormatOpts(e.val);if(!n)return e;var i=_e.create(t,n).formatDateTimeParts((xn||(xn=ui.fromMillis(1555555555555)),xn)).map((function(e){return function(e,t,n){var i=e.type,r=e.value;if("literal"===i)return{literal:!0,val:r};var o=n[i],s=Tn[i];return"object"==typeof s&&(s=s[o]),s?{literal:!1,val:s}:void 0}(e,0,n)}));return i.includes(void 0)?e:i}function An(e,t,n){var i=function(e,t){var n;return(n=Array.prototype).concat.apply(n,e.map((function(e){return In(e,t)})))}(_e.parseFormat(n),e),r=i.map((function(t){return n=t,r=yn(i=e),o=yn(i,"{2}"),s=yn(i,"{3}"),a=yn(i,"{4}"),u=yn(i,"{6}"),c=yn(i,"{1,2}"),l=yn(i,"{1,3}"),d=yn(i,"{1,6}"),f=yn(i,"{1,9}"),h=yn(i,"{2,4}"),p=yn(i,"{4,6}"),v=function(e){return{regex:RegExp((t=e.val,t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"))),deser:function(e){return e[0]},literal:!0};var t},(g=function(e){if(n.literal)return v(e);switch(e.val){case"G":return On(i.eras("short",!1),0);case"GG":return On(i.eras("long",!1),0);case"y":return Sn(d);case"yy":return Sn(h,de);case"yyyy":return Sn(a);case"yyyyy":return Sn(p);case"yyyyyy":return Sn(u);case"M":return Sn(c);case"MM":return Sn(o);case"MMM":return On(i.months("short",!0,!1),1);case"MMMM":return On(i.months("long",!0,!1),1);case"L":return Sn(c);case"LL":return Sn(o);case"LLL":return On(i.months("short",!1,!1),1);case"LLLL":return On(i.months("long",!1,!1),1);case"d":return Sn(c);case"dd":return Sn(o);case"o":return Sn(l);case"ooo":return Sn(s);case"HH":return Sn(o);case"H":return Sn(c);case"hh":return Sn(o);case"h":return Sn(c);case"mm":return Sn(o);case"m":case"q":return Sn(c);case"qq":return Sn(o);case"s":return Sn(c);case"ss":return Sn(o);case"S":return Sn(l);case"SSS":return Sn(s);case"u":return Cn(f);case"a":return On(i.meridiems(),0);case"kkkk":return Sn(a);case"kk":return Sn(h,de);case"W":return Sn(c);case"WW":return Sn(o);case"E":case"c":return Sn(r);case"EEE":return On(i.weekdays("short",!1,!1),1);case"EEEE":return On(i.weekdays("long",!1,!1),1);case"ccc":return On(i.weekdays("short",!0,!1),1);case"cccc":return On(i.weekdays("long",!0,!1),1);case"Z":case"ZZ":return Ln(new RegExp("([+-]"+c.source+")(?::("+o.source+"))?"),2);case"ZZZ":return Ln(new RegExp("([+-]"+c.source+")("+o.source+")?"),2);case"z":return Cn(/[a-z_+-/]{1,256}?/i);default:return v(e)}}(n)||{invalidReason:"missing Intl.DateTimeFormat.formatToParts support"}).token=n,g;var n,i,r,o,s,a,u,c,l,d,f,h,p,v,g})),o=r.find((function(e){return e.invalidReason}));if(o)return{input:t,tokens:i,invalidReason:o.invalidReason};var s=function(e){return["^"+e.map((function(e){return e.regex})).reduce((function(e,t){return e+"("+t.source+")"}),"")+"$",e]}(r),a=s[0],u=s[1],c=RegExp(a,"i"),l=function(e,t,n){var i=e.match(t);if(i){var r={},o=1;for(var s in n)if(ee(n,s)){var a=n[s],u=a.groups?a.groups+1:1;!a.literal&&a.token&&(r[a.token.val[0]]=a.deser(i.slice(o,o+u))),o+=u}return[i,r]}return[i,{}]}(t,c,u),d=l[0],f=l[1],h=f?function(e){var t;return t=B(e.Z)?B(e.z)?null:Ze.create(e.z):new Be(e.Z),B(e.q)||(e.M=3*(e.q-1)+1),B(e.h)||(e.h<12&&1===e.a?e.h+=12:12===e.h&&0===e.a&&(e.h=0)),0===e.G&&e.y&&(e.y=-e.y),B(e.u)||(e.S=re(e.u)),[Object.keys(e).reduce((function(t,n){var i=function(e){switch(e){case"S":return"millisecond";case"s":return"second";case"m":return"minute";case"h":case"H":return"hour";case"d":return"day";case"o":return"ordinal";case"L":case"M":return"month";case"y":return"year";case"E":case"c":return"weekday";case"W":return"weekNumber";case"k":return"weekYear";case"q":return"quarter";default:return null}}(n);return i&&(t[i]=e[n]),t}),{}),t]}(f):[null,null],p=h[0],v=h[1];if(ee(f,"a")&&ee(f,"H"))throw new m("Can't include meridiem when specifying 24-hour format");return{input:t,tokens:i,regex:c,rawMatches:d,matches:f,result:p,zone:v}}var Nn=[0,31,59,90,120,151,181,212,243,273,304,334],Rn=[0,31,60,91,121,152,182,213,244,274,305,335];function Dn(e,t){return new je("unit out of range","you specified "+t+" (of type "+typeof t+") as a "+e+", which is invalid")}function Mn(e,t,n){var i=new Date(Date.UTC(e,t-1,n)).getUTCDay();return 0===i?7:i}function _n(e,t,n){return n+(se(e)?Rn:Nn)[t-1]}function jn(e,t){var n=se(e)?Rn:Nn,i=n.findIndex((function(e){return e<t}));return{month:i+1,day:t-n[i]}}function Vn(e){var t,n=e.year,i=e.month,r=e.day,o=_n(n,i,r),s=Mn(n,i,r),a=Math.floor((o-s+10)/7);return a<1?a=le(t=n-1):a>le(n)?(t=n+1,a=1):t=n,Object.assign({weekYear:t,weekNumber:a,weekday:s},me(e))}function Pn(e){var t,n=e.weekYear,i=e.weekNumber,r=e.weekday,o=Mn(n,1,4),s=ae(n),a=7*i+r-o-3;a<1?a+=ae(t=n-1):a>s?(t=n+1,a-=ae(n)):t=n;var u=jn(t,a),c=u.month,l=u.day;return Object.assign({year:t,month:c,day:l},me(e))}function qn(e){var t=e.year,n=_n(t,e.month,e.day);return Object.assign({year:t,ordinal:n},me(e))}function Un(e){var t=e.year,n=jn(t,e.ordinal),i=n.month,r=n.day;return Object.assign({year:t,month:i,day:r},me(e))}function Fn(e){var t=W(e.year),n=te(e.month,1,12),i=te(e.day,1,ue(e.year,e.month));return t?n?!i&&Dn("day",e.day):Dn("month",e.month):Dn("year",e.year)}function Hn(e){var t=e.hour,n=e.minute,i=e.second,r=e.millisecond,o=te(t,0,23)||24===t&&0===n&&0===i&&0===r,s=te(n,0,59),a=te(i,0,59),u=te(r,0,999);return o?s?a?!u&&Dn("millisecond",r):Dn("second",i):Dn("minute",n):Dn("hour",t)}function zn(e){return new je("unsupported zone",'the zone "'+e.name+'" is not supported')}function Zn(e){return null===e.weekData&&(e.weekData=Vn(e.c)),e.weekData}function Jn(e,t){var n={ts:e.ts,zone:e.zone,c:e.c,o:e.o,loc:e.loc,invalid:e.invalid};return new ui(Object.assign({},n,t,{old:n}))}function Bn(e,t,n){var i=e-60*t*1e3,r=n.offset(i);if(t===r)return[i,t];i-=60*(r-t)*1e3;var o=n.offset(i);return r===o?[i,r]:[e-60*Math.min(r,o)*1e3,Math.max(r,o)]}function Gn(e,t){var n=new Date(e+=60*t*1e3);return{year:n.getUTCFullYear(),month:n.getUTCMonth()+1,day:n.getUTCDate(),hour:n.getUTCHours(),minute:n.getUTCMinutes(),second:n.getUTCSeconds(),millisecond:n.getUTCMilliseconds()}}function Wn(e,t,n){return Bn(ce(e),t,n)}function $n(e,t){var n=e.o,i=e.c.year+Math.trunc(t.years),r=e.c.month+Math.trunc(t.months)+3*Math.trunc(t.quarters),o=Object.assign({},e.c,{year:i,month:r,day:Math.min(e.c.day,ue(i,r))+Math.trunc(t.days)+7*Math.trunc(t.weeks)}),s=an.fromObject({years:t.years-Math.trunc(t.years),quarters:t.quarters-Math.trunc(t.quarters),months:t.months-Math.trunc(t.months),weeks:t.weeks-Math.trunc(t.weeks),days:t.days-Math.trunc(t.days),hours:t.hours,minutes:t.minutes,seconds:t.seconds,milliseconds:t.milliseconds}).as("milliseconds"),a=Bn(ce(o),n,e.zone),u=a[0],c=a[1];return 0!==s&&(u+=s,c=e.zone.offset(u)),{ts:u,o:c}}function Kn(e,t,n,i,r){var o=n.setZone,s=n.zone;if(e&&0!==Object.keys(e).length){var a=t||s,u=ui.fromObject(Object.assign(e,n,{zone:a,setZone:void 0}));return o?u:u.setZone(s)}return ui.invalid(new je("unparsable",'the input "'+r+"\" can't be parsed as "+i))}function Yn(e,t,n){return void 0===n&&(n=!0),e.isValid?_e.create(ft.create("en-US"),{allowZ:n,forceSimple:!0}).formatDateTimeFromString(e,t):null}function Xn(e,t){var n=t.suppressSeconds,i=void 0!==n&&n,r=t.suppressMilliseconds,o=void 0!==r&&r,s=t.includeOffset,a=t.includeZone,u=void 0!==a&&a,c=t.spaceZone,l=void 0!==c&&c,d=t.format,f=void 0===d?"extended":d,h="basic"===f?"HHmm":"HH:mm";return i&&0===e.second&&0===e.millisecond||(h+="basic"===f?"ss":":ss",o&&0===e.millisecond||(h+=".SSS")),(u||s)&&l&&(h+=" "),u?h+="z":s&&(h+="basic"===f?"ZZZ":"ZZ"),Yn(e,h)}var Qn={month:1,day:1,hour:0,minute:0,second:0,millisecond:0},ei={weekNumber:1,weekday:1,hour:0,minute:0,second:0,millisecond:0},ti={ordinal:1,hour:0,minute:0,second:0,millisecond:0},ni=["year","month","day","hour","minute","second","millisecond"],ii=["weekYear","weekNumber","weekday","hour","minute","second","millisecond"],ri=["year","ordinal","hour","minute","second","millisecond"];function oi(e){var t={year:"year",years:"year",month:"month",months:"month",day:"day",days:"day",hour:"hour",hours:"hour",minute:"minute",minutes:"minute",quarter:"quarter",quarters:"quarter",second:"second",seconds:"second",millisecond:"millisecond",milliseconds:"millisecond",weekday:"weekday",weekdays:"weekday",weeknumber:"weekNumber",weeksnumber:"weekNumber",weeknumbers:"weekNumber",weekyear:"weekYear",weekyears:"weekYear",ordinal:"ordinal"}[e.toLowerCase()];if(!t)throw new y(e);return t}function si(e,t){for(var n,i=f(ni);!(n=i()).done;){var r=n.value;B(e[r])&&(e[r]=Qn[r])}var o=Fn(e)||Hn(e);if(o)return ui.invalid(o);var s=tt.now(),a=Wn(e,t.offset(s),t),u=a[0],c=a[1];return new ui({ts:u,zone:t,o:c})}function ai(e,t,n){var i=!!B(n.round)||n.round,r=function(e,r){return e=oe(e,i||n.calendary?0:2,!0),t.loc.clone(n).relFormatter(n).format(e,r)},o=function(i){return n.calendary?t.hasSame(e,i)?0:t.startOf(i).diff(e.startOf(i),i).get(i):t.diff(e,i).get(i)};if(n.unit)return r(o(n.unit),n.unit);for(var s,a=f(n.units);!(s=a()).done;){var u=s.value,c=o(u);if(Math.abs(c)>=1)return r(c,u)}return r(0,n.units[n.units.length-1])}var ui=function(){function e(e){var t=e.zone||tt.defaultZone,n=e.invalid||(Number.isNaN(e.ts)?new je("invalid input"):null)||(t.isValid?null:zn(t));this.ts=B(e.ts)?tt.now():e.ts;var i=null,r=null;if(!n)if(e.old&&e.old.ts===this.ts&&e.old.zone.equals(t)){var o=[e.old.c,e.old.o];i=o[0],r=o[1]}else{var s=t.offset(this.ts);i=Gn(this.ts,s),i=(n=Number.isNaN(i.year)?new je("invalid input"):null)?null:i,r=n?null:s}this._zone=t,this.loc=e.loc||ft.create(),this.invalid=n,this.weekData=null,this.c=i,this.o=r,this.isLuxonDateTime=!0}e.local=function(t,n,i,r,o,s,a){return B(t)?new e({ts:tt.now()}):si({year:t,month:n,day:i,hour:r,minute:o,second:s,millisecond:a},tt.defaultZone)},e.utc=function(t,n,i,r,o,s,a){return B(t)?new e({ts:tt.now(),zone:Be.utcInstance}):si({year:t,month:n,day:i,hour:r,minute:o,second:s,millisecond:a},Be.utcInstance)},e.fromJSDate=function(t,n){void 0===n&&(n={});var i,r=(i=t,"[object Date]"===Object.prototype.toString.call(i)?t.valueOf():NaN);if(Number.isNaN(r))return e.invalid("invalid input");var o=We(n.zone,tt.defaultZone);return o.isValid?new e({ts:r,zone:o,loc:ft.fromObject(n)}):e.invalid(zn(o))},e.fromMillis=function(t,n){if(void 0===n&&(n={}),G(t))return t<-864e13||t>864e13?e.invalid("Timestamp out of range"):new e({ts:t,zone:We(n.zone,tt.defaultZone),loc:ft.fromObject(n)});throw new S("fromMillis requires a numerical input, but received a "+typeof t+" with value "+t)},e.fromSeconds=function(t,n){if(void 0===n&&(n={}),G(t))return new e({ts:1e3*t,zone:We(n.zone,tt.defaultZone),loc:ft.fromObject(n)});throw new S("fromSeconds requires a numerical input")},e.fromObject=function(t){var n=We(t.zone,tt.defaultZone);if(!n.isValid)return e.invalid(zn(n));var i=tt.now(),r=n.offset(i),o=ve(t,oi,["zone","locale","outputCalendar","numberingSystem"]),s=!B(o.ordinal),a=!B(o.year),u=!B(o.month)||!B(o.day),c=a||u,l=o.weekYear||o.weekNumber,d=ft.fromObject(t);if((c||s)&&l)throw new m("Can't mix weekYear/weekNumber units with year/month/day or ordinals");if(u&&s)throw new m("Can't mix ordinal dates with month/day");var h,p,v=l||o.weekday&&!c,g=Gn(i,r);v?(h=ii,p=ei,g=Vn(g)):s?(h=ri,p=ti,g=qn(g)):(h=ni,p=Qn);for(var y,S=!1,w=f(h);!(y=w()).done;){var b=y.value;B(o[b])?o[b]=S?p[b]:g[b]:S=!0}var E=(v?function(e){var t=W(e.weekYear),n=te(e.weekNumber,1,le(e.weekYear)),i=te(e.weekday,1,7);return t?n?!i&&Dn("weekday",e.weekday):Dn("week",e.week):Dn("weekYear",e.weekYear)}(o):s?function(e){var t=W(e.year),n=te(e.ordinal,1,ae(e.year));return t?!n&&Dn("ordinal",e.ordinal):Dn("year",e.year)}(o):Fn(o))||Hn(o);if(E)return e.invalid(E);var k=Wn(v?Pn(o):s?Un(o):o,r,n),O=new e({ts:k[0],zone:n,o:k[1],loc:d});return o.weekday&&c&&t.weekday!==O.weekday?e.invalid("mismatched weekday","you can't specify both a weekday of "+o.weekday+" and a date of "+O.toISO()):O},e.fromISO=function(e,t){void 0===t&&(t={});var n=function(e){return vt(e,[Ft,Jt],[Ht,Bt],[zt,Gt],[Zt,Wt])}(e);return Kn(n[0],n[1],t,"ISO 8601",e)},e.fromRFC2822=function(e,t){void 0===t&&(t={});var n=function(e){return vt(function(e){return e.replace(/\([^)]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim()}(e),[Mt,_t])}(e);return Kn(n[0],n[1],t,"RFC 2822",e)},e.fromHTTP=function(e,t){void 0===t&&(t={});var n=function(e){return vt(e,[jt,qt],[Vt,qt],[Pt,Ut])}(e);return Kn(n[0],n[1],t,"HTTP",t)},e.fromFormat=function(t,n,i){if(void 0===i&&(i={}),B(t)||B(n))throw new S("fromFormat requires an input string and a format");var r=i,o=r.locale,s=void 0===o?null:o,a=r.numberingSystem,u=void 0===a?null:a,c=function(e,t,n){var i=An(e,t,n);return[i.result,i.zone,i.invalidReason]}(ft.fromOpts({locale:s,numberingSystem:u,defaultToEN:!0}),t,n),l=c[0],d=c[1],f=c[2];return f?e.invalid(f):Kn(l,d,i,"format "+n,t)},e.fromString=function(t,n,i){return void 0===i&&(i={}),e.fromFormat(t,n,i)},e.fromSQL=function(e,t){void 0===t&&(t={});var n=function(e){return vt(e,[$t,Yt],[Kt,Xt])}(e);return Kn(n[0],n[1],t,"SQL",e)},e.invalid=function(t,n){if(void 0===n&&(n=null),!t)throw new S("need to specify a reason the DateTime is invalid");var i=t instanceof je?t:new je(t,n);if(tt.throwOnInvalid)throw new p(i);return new e({invalid:i})},e.isDateTime=function(e){return e&&e.isLuxonDateTime||!1};var t=e.prototype;return t.get=function(e){return this[e]},t.resolvedLocaleOpts=function(e){void 0===e&&(e={});var t=_e.create(this.loc.clone(e),e).resolvedOptions(this);return{locale:t.locale,numberingSystem:t.numberingSystem,outputCalendar:t.calendar}},t.toUTC=function(e,t){return void 0===e&&(e=0),void 0===t&&(t={}),this.setZone(Be.instance(e),t)},t.toLocal=function(){return this.setZone(tt.defaultZone)},t.setZone=function(t,n){var i=void 0===n?{}:n,r=i.keepLocalTime,o=void 0!==r&&r,s=i.keepCalendarTime,a=void 0!==s&&s;if((t=We(t,tt.defaultZone)).equals(this.zone))return this;if(t.isValid){var u=this.ts;if(o||a){var c=t.offset(this.ts);u=Wn(this.toObject(),c,t)[0]}return Jn(this,{ts:u,zone:t})}return e.invalid(zn(t))},t.reconfigure=function(e){var t=void 0===e?{}:e,n=t.locale,i=t.numberingSystem,r=t.outputCalendar;return Jn(this,{loc:this.loc.clone({locale:n,numberingSystem:i,outputCalendar:r})})},t.setLocale=function(e){return this.reconfigure({locale:e})},t.set=function(e){if(!this.isValid)return this;var t,n=ve(e,oi,[]);!B(n.weekYear)||!B(n.weekNumber)||!B(n.weekday)?t=Pn(Object.assign(Vn(this.c),n)):B(n.ordinal)?(t=Object.assign(this.toObject(),n),B(n.day)&&(t.day=Math.min(ue(t.year,t.month),t.day))):t=Un(Object.assign(qn(this.c),n));var i=Wn(t,this.o,this.zone);return Jn(this,{ts:i[0],o:i[1]})},t.plus=function(e){return this.isValid?Jn(this,$n(this,un(e))):this},t.minus=function(e){return this.isValid?Jn(this,$n(this,un(e).negate())):this},t.startOf=function(e){if(!this.isValid)return this;var t={},n=an.normalizeUnit(e);switch(n){case"years":t.month=1;case"quarters":case"months":t.day=1;case"weeks":case"days":t.hour=0;case"hours":t.minute=0;case"minutes":t.second=0;case"seconds":t.millisecond=0}if("weeks"===n&&(t.weekday=1),"quarters"===n){var i=Math.ceil(this.month/3);t.month=3*(i-1)+1}return this.set(t)},t.endOf=function(e){var t;return this.isValid?this.plus((t={},t[e]=1,t)).startOf(e).minus(1):this},t.toFormat=function(e,t){return void 0===t&&(t={}),this.isValid?_e.create(this.loc.redefaultToEN(t)).formatDateTimeFromString(this,e):"Invalid DateTime"},t.toLocaleString=function(e){return void 0===e&&(e=O),this.isValid?_e.create(this.loc.clone(e),e).formatDateTime(this):"Invalid DateTime"},t.toLocaleParts=function(e){return void 0===e&&(e={}),this.isValid?_e.create(this.loc.clone(e),e).formatDateTimeParts(this):[]},t.toISO=function(e){return void 0===e&&(e={}),this.isValid?this.toISODate(e)+"T"+this.toISOTime(e):null},t.toISODate=function(e){var t=(void 0===e?{}:e).format,n="basic"===(void 0===t?"extended":t)?"yyyyMMdd":"yyyy-MM-dd";return this.year>9999&&(n="+"+n),Yn(this,n)},t.toISOWeekDate=function(){return Yn(this,"kkkk-'W'WW-c")},t.toISOTime=function(e){var t=void 0===e?{}:e,n=t.suppressMilliseconds,i=void 0!==n&&n,r=t.suppressSeconds,o=void 0!==r&&r,s=t.includeOffset,a=void 0===s||s,u=t.format;return Xn(this,{suppressSeconds:o,suppressMilliseconds:i,includeOffset:a,format:void 0===u?"extended":u})},t.toRFC2822=function(){return Yn(this,"EEE, dd LLL yyyy HH:mm:ss ZZZ",!1)},t.toHTTP=function(){return Yn(this.toUTC(),"EEE, dd LLL yyyy HH:mm:ss 'GMT'")},t.toSQLDate=function(){return Yn(this,"yyyy-MM-dd")},t.toSQLTime=function(e){var t=void 0===e?{}:e,n=t.includeOffset,i=void 0===n||n,r=t.includeZone;return Xn(this,{includeOffset:i,includeZone:void 0!==r&&r,spaceZone:!0})},t.toSQL=function(e){return void 0===e&&(e={}),this.isValid?this.toSQLDate()+" "+this.toSQLTime(e):null},t.toString=function(){return this.isValid?this.toISO():"Invalid DateTime"},t.valueOf=function(){return this.toMillis()},t.toMillis=function(){return this.isValid?this.ts:NaN},t.toSeconds=function(){return this.isValid?this.ts/1e3:NaN},t.toJSON=function(){return this.toISO()},t.toBSON=function(){return this.toJSDate()},t.toObject=function(e){if(void 0===e&&(e={}),!this.isValid)return{};var t=Object.assign({},this.c);return e.includeConfig&&(t.outputCalendar=this.outputCalendar,t.numberingSystem=this.loc.numberingSystem,t.locale=this.loc.locale),t},t.toJSDate=function(){return new Date(this.isValid?this.ts:NaN)},t.diff=function(e,t,n){if(void 0===t&&(t="milliseconds"),void 0===n&&(n={}),!this.isValid||!e.isValid)return an.invalid(this.invalid||e.invalid,"created by diffing an invalid DateTime");var i,r=Object.assign({locale:this.locale,numberingSystem:this.numberingSystem},n),o=(i=t,Array.isArray(i)?i:[i]).map(an.normalizeUnit),s=e.valueOf()>this.valueOf(),a=pn(s?this:e,s?e:this,o,r);return s?a.negate():a},t.diffNow=function(t,n){return void 0===t&&(t="milliseconds"),void 0===n&&(n={}),this.diff(e.local(),t,n)},t.until=function(e){return this.isValid?dn.fromDateTimes(this,e):this},t.hasSame=function(e,t){if(!this.isValid)return!1;if("millisecond"===t)return this.valueOf()===e.valueOf();var n=e.valueOf();return this.startOf(t)<=n&&n<=this.endOf(t)},t.equals=function(e){return this.isValid&&e.isValid&&this.valueOf()===e.valueOf()&&this.zone.equals(e.zone)&&this.loc.equals(e.loc)},t.toRelative=function(t){if(void 0===t&&(t={}),!this.isValid)return null;var n=t.base||e.fromObject({zone:this.zone}),i=t.padding?this<n?-t.padding:t.padding:0;return ai(n,this.plus(i),Object.assign(t,{numeric:"always",units:["years","months","days","hours","minutes","seconds"]}))},t.toRelativeCalendar=function(t){return void 0===t&&(t={}),this.isValid?ai(t.base||e.fromObject({zone:this.zone}),this,Object.assign(t,{numeric:"auto",units:["years","months","days"],calendary:!0})):null},e.min=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];if(!n.every(e.isDateTime))throw new S("min requires all arguments be DateTimes");return X(n,(function(e){return e.valueOf()}),Math.min)},e.max=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];if(!n.every(e.isDateTime))throw new S("max requires all arguments be DateTimes");return X(n,(function(e){return e.valueOf()}),Math.max)},e.fromFormatExplain=function(e,t,n){void 0===n&&(n={});var i=n,r=i.locale,o=void 0===r?null:r,s=i.numberingSystem,a=void 0===s?null:s;return An(ft.fromOpts({locale:o,numberingSystem:a,defaultToEN:!0}),e,t)},e.fromStringExplain=function(t,n,i){return void 0===i&&(i={}),e.fromFormatExplain(t,n,i)},r(e,[{key:"isValid",get:function(){return null===this.invalid}},{key:"invalidReason",get:function(){return this.invalid?this.invalid.reason:null}},{key:"invalidExplanation",get:function(){return this.invalid?this.invalid.explanation:null}},{key:"locale",get:function(){return this.isValid?this.loc.locale:null}},{key:"numberingSystem",get:function(){return this.isValid?this.loc.numberingSystem:null}},{key:"outputCalendar",get:function(){return this.isValid?this.loc.outputCalendar:null}},{key:"zone",get:function(){return this._zone}},{key:"zoneName",get:function(){return this.isValid?this.zone.name:null}},{key:"year",get:function(){return this.isValid?this.c.year:NaN}},{key:"quarter",get:function(){return this.isValid?Math.ceil(this.c.month/3):NaN}},{key:"month",get:function(){return this.isValid?this.c.month:NaN}},{key:"day",get:function(){return this.isValid?this.c.day:NaN}},{key:"hour",get:function(){return this.isValid?this.c.hour:NaN}},{key:"minute",get:function(){return this.isValid?this.c.minute:NaN}},{key:"second",get:function(){return this.isValid?this.c.second:NaN}},{key:"millisecond",get:function(){return this.isValid?this.c.millisecond:NaN}},{key:"weekYear",get:function(){return this.isValid?Zn(this).weekYear:NaN}},{key:"weekNumber",get:function(){return this.isValid?Zn(this).weekNumber:NaN}},{key:"weekday",get:function(){return this.isValid?Zn(this).weekday:NaN}},{key:"ordinal",get:function(){return this.isValid?qn(this.c).ordinal:NaN}},{key:"monthShort",get:function(){return this.isValid?fn.months("short",{locale:this.locale})[this.month-1]:null}},{key:"monthLong",get:function(){return this.isValid?fn.months("long",{locale:this.locale})[this.month-1]:null}},{key:"weekdayShort",get:function(){return this.isValid?fn.weekdays("short",{locale:this.locale})[this.weekday-1]:null}},{key:"weekdayLong",get:function(){return this.isValid?fn.weekdays("long",{locale:this.locale})[this.weekday-1]:null}},{key:"offset",get:function(){return this.isValid?+this.o:NaN}},{key:"offsetNameShort",get:function(){return this.isValid?this.zone.offsetName(this.ts,{format:"short",locale:this.locale}):null}},{key:"offsetNameLong",get:function(){return this.isValid?this.zone.offsetName(this.ts,{format:"long",locale:this.locale}):null}},{key:"isOffsetFixed",get:function(){return this.isValid?this.zone.universal:null}},{key:"isInDST",get:function(){return!this.isOffsetFixed&&(this.offset>this.set({month:1}).offset||this.offset>this.set({month:5}).offset)}},{key:"isInLeapYear",get:function(){return se(this.year)}},{key:"daysInMonth",get:function(){return ue(this.year,this.month)}},{key:"daysInYear",get:function(){return this.isValid?ae(this.year):NaN}},{key:"weeksInWeekYear",get:function(){return this.isValid?le(this.weekYear):NaN}}],[{key:"DATE_SHORT",get:function(){return O}},{key:"DATE_MED",get:function(){return L}},{key:"DATE_MED_WITH_WEEKDAY",get:function(){return C}},{key:"DATE_FULL",get:function(){return T}},{key:"DATE_HUGE",get:function(){return x}},{key:"TIME_SIMPLE",get:function(){return I}},{key:"TIME_WITH_SECONDS",get:function(){return A}},{key:"TIME_WITH_SHORT_OFFSET",get:function(){return N}},{key:"TIME_WITH_LONG_OFFSET",get:function(){return R}},{key:"TIME_24_SIMPLE",get:function(){return D}},{key:"TIME_24_WITH_SECONDS",get:function(){return M}},{key:"TIME_24_WITH_SHORT_OFFSET",get:function(){return _}},{key:"TIME_24_WITH_LONG_OFFSET",get:function(){return j}},{key:"DATETIME_SHORT",get:function(){return V}},{key:"DATETIME_SHORT_WITH_SECONDS",get:function(){return P}},{key:"DATETIME_MED",get:function(){return q}},{key:"DATETIME_MED_WITH_SECONDS",get:function(){return U}},{key:"DATETIME_MED_WITH_WEEKDAY",get:function(){return F}},{key:"DATETIME_FULL",get:function(){return H}},{key:"DATETIME_FULL_WITH_SECONDS",get:function(){return z}},{key:"DATETIME_HUGE",get:function(){return Z}},{key:"DATETIME_HUGE_WITH_SECONDS",get:function(){return J}}]),e}();function ci(e){if(ui.isDateTime(e))return e;if(e&&e.valueOf&&G(e.valueOf()))return ui.fromJSDate(e);if(e&&"object"==typeof e)return ui.fromObject(e);throw new S("Unknown datetime argument: "+e+", of type "+typeof e)}t.DateTime=ui,t.Duration=an,t.FixedOffsetZone=Be,t.IANAZone=Ze,t.Info=fn,t.Interval=dn,t.InvalidZone=Ge,t.LocalZone=qe,t.Settings=tt,t.Zone=Ve},function(e,t,n){"use strict";var i=n(40);e.exports=function(e){if(!i(e))throw new TypeError(e+" is not an Object");return e}},function(e,t,n){"use strict";var i=n(6),r={function:!0,object:!0};e.exports=function(e){return i(e)&&r[typeof e]||!1}},function(e,t,n){e.exports=n(42)},function(e,t,n){"use strict";var i=n(1),r=n(10),o=n(43),s=n(16);function a(e){var t=new o(e),n=r(o.prototype.request,t);return i.extend(n,o.prototype,t),i.extend(n,t),n}var u=a(n(13));u.Axios=o,u.create=function(e){return a(s(u.defaults,e))},u.Cancel=n(17),u.CancelToken=n(57),u.isCancel=n(12),u.all=function(e){return Promise.all(e)},u.spread=n(58),e.exports=u,e.exports.default=u},function(e,t,n){"use strict";var i=n(1),r=n(11),o=n(44),s=n(45),a=n(16);function u(e){this.defaults=e,this.interceptors={request:new o,response:new o}}u.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{}).url=arguments[0]:e=e||{},(e=a(this.defaults,e)).method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[s,void 0],n=Promise.resolve(e);for(this.interceptors.request.forEach((function(e){t.unshift(e.fulfilled,e.rejected)})),this.interceptors.response.forEach((function(e){t.push(e.fulfilled,e.rejected)}));t.length;)n=n.then(t.shift(),t.shift());return n},u.prototype.getUri=function(e){return e=a(this.defaults,e),r(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},i.forEach(["delete","get","head","options"],(function(e){u.prototype[e]=function(t,n){return this.request(i.merge(n||{},{method:e,url:t}))}})),i.forEach(["post","put","patch"],(function(e){u.prototype[e]=function(t,n,r){return this.request(i.merge(r||{},{method:e,url:t,data:n}))}})),e.exports=u},function(e,t,n){"use strict";var i=n(1);function r(){this.handlers=[]}r.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},r.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},r.prototype.forEach=function(e){i.forEach(this.handlers,(function(t){null!==t&&e(t)}))},e.exports=r},function(e,t,n){"use strict";var i=n(1),r=n(46),o=n(12),s=n(13);function a(e){e.cancelToken&&e.cancelToken.throwIfRequested()}e.exports=function(e){return a(e),e.headers=e.headers||{},e.data=r(e.data,e.headers,e.transformRequest),e.headers=i.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),i.forEach(["delete","get","head","post","put","patch","common"],(function(t){delete e.headers[t]})),(e.adapter||s.adapter)(e).then((function(t){return a(e),t.data=r(t.data,t.headers,e.transformResponse),t}),(function(t){return o(t)||(a(e),t&&t.response&&(t.response.data=r(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)}))}},function(e,t,n){"use strict";var i=n(1);e.exports=function(e,t,n){return i.forEach(n,(function(n){e=n(e,t)})),e}},function(e,t){var n,i,r=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(e){n=o}try{i="function"==typeof clearTimeout?clearTimeout:s}catch(e){i=s}}();var u,c=[],l=!1,d=-1;function f(){l&&u&&(l=!1,u.length?c=u.concat(c):d=-1,c.length&&h())}function h(){if(!l){var e=a(f);l=!0;for(var t=c.length;t;){for(u=c,c=[];++d<t;)u&&u[d].run();d=-1,t=c.length}u=null,l=!1,function(e){if(i===clearTimeout)return clearTimeout(e);if((i===s||!i)&&clearTimeout)return i=clearTimeout,clearTimeout(e);try{i(e)}catch(t){try{return i.call(null,e)}catch(t){return i.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function v(){}r.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new p(e,t)),1!==c.length||l||a(h)},p.prototype.run=function(){this.fun.apply(null,this.array)},r.title="browser",r.browser=!0,r.env={},r.argv=[],r.version="",r.versions={},r.on=v,r.addListener=v,r.once=v,r.off=v,r.removeListener=v,r.removeAllListeners=v,r.emit=v,r.prependListener=v,r.prependOnceListener=v,r.listeners=function(e){return[]},r.binding=function(e){throw new Error("process.binding is not supported")},r.cwd=function(){return"/"},r.chdir=function(e){throw new Error("process.chdir is not supported")},r.umask=function(){return 0}},function(e,t,n){"use strict";var i=n(1);e.exports=function(e,t){i.forEach(e,(function(n,i){i!==t&&i.toUpperCase()===t.toUpperCase()&&(e[t]=n,delete e[i])}))}},function(e,t,n){"use strict";var i=n(15);e.exports=function(e,t,n){var r=n.config.validateStatus;!r||r(n.status)?e(n):t(i("Request failed with status code "+n.status,n.config,null,n.request,n))}},function(e,t,n){"use strict";e.exports=function(e,t,n,i,r){return e.config=t,n&&(e.code=n),e.request=i,e.response=r,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e}},function(e,t,n){"use strict";var i=n(52),r=n(53);e.exports=function(e,t){return e&&!i(t)?r(e,t):t}},function(e,t,n){"use strict";e.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},function(e,t,n){"use strict";e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},function(e,t,n){"use strict";var i=n(1),r=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];e.exports=function(e){var t,n,o,s={};return e?(i.forEach(e.split("\n"),(function(e){if(o=e.indexOf(":"),t=i.trim(e.substr(0,o)).toLowerCase(),n=i.trim(e.substr(o+1)),t){if(s[t]&&r.indexOf(t)>=0)return;s[t]="set-cookie"===t?(s[t]?s[t]:[]).concat([n]):s[t]?s[t]+", "+n:n}})),s):s}},function(e,t,n){"use strict";var i=n(1);e.exports=i.isStandardBrowserEnv()?function(){var e,t=/(msie|trident)/i.test(navigator.userAgent),n=document.createElement("a");function r(e){var i=e;return t&&(n.setAttribute("href",i),i=n.href),n.setAttribute("href",i),{href:n.href,protocol:n.protocol?n.protocol.replace(/:$/,""):"",host:n.host,search:n.search?n.search.replace(/^\?/,""):"",hash:n.hash?n.hash.replace(/^#/,""):"",hostname:n.hostname,port:n.port,pathname:"/"===n.pathname.charAt(0)?n.pathname:"/"+n.pathname}}return e=r(window.location.href),function(t){var n=i.isString(t)?r(t):t;return n.protocol===e.protocol&&n.host===e.host}}():function(){return!0}},function(e,t,n){"use strict";var i=n(1);e.exports=i.isStandardBrowserEnv()?{write:function(e,t,n,r,o,s){var a=[];a.push(e+"="+encodeURIComponent(t)),i.isNumber(n)&&a.push("expires="+new Date(n).toGMTString()),i.isString(r)&&a.push("path="+r),i.isString(o)&&a.push("domain="+o),!0===s&&a.push("secure"),document.cookie=a.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},function(e,t,n){"use strict";var i=n(17);function r(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise((function(e){t=e}));var n=this;e((function(e){n.reason||(n.reason=new i(e),t(n.reason))}))}r.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},r.source=function(){var e;return{token:new r((function(t){e=t})),cancel:e}},e.exports=r},function(e,t,n){"use strict";e.exports=function(e){return function(t){return e.apply(null,t)}}},function(e,t,n){"use strict";n.r(t);var i=n(5),r=n(19);function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var a=function(){return{loadPath:"/locales/{{lng}}/{{ns}}.json",addPath:"/locales/add/{{lng}}/{{ns}}",allowMultiLoading:!1,parse:function(e){return JSON.parse(e)},stringify:JSON.stringify,parsePayload:function(e,t,n){return function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}({},t,n||"")},request:r.a,reloadInterval:"undefined"==typeof window&&36e5,customHeaders:{},queryStringParams:{},crossDomain:!1,withCredentials:!1,overrideMimeType:!1,requestOptions:{mode:"cors",credentials:"same-origin",cache:"default"}}},u=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};o(this,e),this.services=t,this.options=n,this.allOptions=i,this.type="backend",this.init(t,n,i)}var t,n,r;return t=e,(n=[{key:"init",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};this.services=e,this.options=Object(i.a)(n,this.options||{},a()),this.allOptions=r,this.options.reloadInterval&&setInterval((function(){return t.reload()}),this.options.reloadInterval)}},{key:"readMulti",value:function(e,t,n){var i=this.options.loadPath;"function"==typeof this.options.loadPath&&(i=this.options.loadPath(e,t));var r=this.services.interpolator.interpolate(i,{lng:e.join("+"),ns:t.join("+")});this.loadUrl(r,n,e,t)}},{key:"read",value:function(e,t,n){var i=this.options.loadPath;"function"==typeof this.options.loadPath&&(i=this.options.loadPath([e],[t]));var r=this.services.interpolator.interpolate(i,{lng:e,ns:t});this.loadUrl(r,n,e,t)}},{key:"loadUrl",value:function(e,t,n,i){var r=this;this.options.request(this.options,e,void 0,(function(o,s){if(s&&(s.status>=500&&s.status<600||!s.status))return t("failed loading "+e,!0);if(s&&s.status>=400&&s.status<500)return t("failed loading "+e,!1);if(!s&&o&&o.message&&o.message.indexOf("Failed to fetch")>-1)return t("failed loading "+e,!0);if(o)return t(o,!1);var a,u;try{a="string"==typeof s.data?r.options.parse(s.data,n,i):s.data}catch(t){u="failed parsing "+e+" to json"}if(u)return t(u,!1);t(null,a)}))}},{key:"create",value:function(e,t,n,i){var r=this;if(this.options.addPath){"string"==typeof e&&(e=[e]);var o=this.options.parsePayload(t,n,i);e.forEach((function(e){var n=r.services.interpolator.interpolate(r.options.addPath,{lng:e,ns:t});r.options.request(r.options,n,o,(function(e,t){}))}))}}},{key:"reload",value:function(){var e=this,t=this.services,n=t.backendConnector,i=t.languageUtils,r=t.logger,o=n.language;if(!o||"cimode"!==o.toLowerCase()){var s=[],a=function(e){i.toResolveHierarchy(e).forEach((function(e){s.indexOf(e)<0&&s.push(e)}))};a(o),this.allOptions.preload&&this.allOptions.preload.forEach((function(e){return a(e)})),s.forEach((function(t){e.allOptions.ns.forEach((function(e){n.read(t,e,"read",null,null,(function(i,o){i&&r.warn("loading namespace ".concat(e," for language ").concat(t," failed"),i),!i&&o&&r.log("loaded namespace ".concat(e," for language ").concat(t),o),n.loaded("".concat(t,"|").concat(e),i,o)}))}))}))}}}])&&s(t.prototype,n),r&&s(t,r),e}();u.type="backend",t.default=u},function(e,t,n){"use strict";var i=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==i)return i;throw new Error("unable to locate global object")}();e.exports=t=i.fetch,i.fetch&&(t.default=i.fetch.bind(i)),t.Headers=i.Headers,t.Request=i.Request,t.Response=i.Response},function(e,t,n){"use strict";n.r(t);var i=n(2),r=n(3),o=[],s=o.forEach,a=o.slice;function u(e){return s.call(a.call(arguments,1),(function(t){if(t)for(var n in t)void 0===e[n]&&(e[n]=t[n])})),e}var c=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/,l=function(e,t,n){var i=n||{};i.path=i.path||"/";var r=e+"="+encodeURIComponent(t);if(i.maxAge>0){var o=i.maxAge-0;if(isNaN(o))throw new Error("maxAge should be a Number");r+="; Max-Age="+Math.floor(o)}if(i.domain){if(!c.test(i.domain))throw new TypeError("option domain is invalid");r+="; Domain="+i.domain}if(i.path){if(!c.test(i.path))throw new TypeError("option path is invalid");r+="; Path="+i.path}if(i.expires){if("function"!=typeof i.expires.toUTCString)throw new TypeError("option expires is invalid");r+="; Expires="+i.expires.toUTCString()}if(i.httpOnly&&(r+="; HttpOnly"),i.secure&&(r+="; Secure"),i.sameSite)switch("string"==typeof i.sameSite?i.sameSite.toLowerCase():i.sameSite){case!0:r+="; SameSite=Strict";break;case"lax":r+="; SameSite=Lax";break;case"strict":r+="; SameSite=Strict";break;case"none":r+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}return r},d=function(e,t,n,i){var r=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{path:"/",sameSite:"strict"};n&&(r.expires=new Date,r.expires.setTime(r.expires.getTime()+60*n*1e3)),i&&(r.domain=i),document.cookie=l(e,encodeURIComponent(t),r)},f=function(e){for(var t=e+"=",n=document.cookie.split(";"),i=0;i<n.length;i++){for(var r=n[i];" "===r.charAt(0);)r=r.substring(1,r.length);if(0===r.indexOf(t))return r.substring(t.length,r.length)}return null},h={name:"cookie",lookup:function(e){var t;if(e.lookupCookie&&"undefined"!=typeof document){var n=f(e.lookupCookie);n&&(t=n)}return t},cacheUserLanguage:function(e,t){t.lookupCookie&&"undefined"!=typeof document&&d(t.lookupCookie,e,t.cookieMinutes,t.cookieDomain,t.cookieOptions)}},p={name:"querystring",lookup:function(e){var t;if("undefined"!=typeof window)for(var n=window.location.search.substring(1).split("&"),i=0;i<n.length;i++){var r=n[i].indexOf("=");if(r>0)n[i].substring(0,r)===e.lookupQuerystring&&(t=n[i].substring(r+1))}return t}},v=null,g=function(){if(null!==v)return v;try{v="undefined"!==window&&null!==window.localStorage;window.localStorage.setItem("i18next.translate.boo","foo"),window.localStorage.removeItem("i18next.translate.boo")}catch(e){v=!1}return v},m={name:"localStorage",lookup:function(e){var t;if(e.lookupLocalStorage&&g()){var n=window.localStorage.getItem(e.lookupLocalStorage);n&&(t=n)}return t},cacheUserLanguage:function(e,t){t.lookupLocalStorage&&g()&&window.localStorage.setItem(t.lookupLocalStorage,e)}},y=null,S=function(){if(null!==y)return y;try{y="undefined"!==window&&null!==window.sessionStorage;window.sessionStorage.setItem("i18next.translate.boo","foo"),window.sessionStorage.removeItem("i18next.translate.boo")}catch(e){y=!1}return y},w={name:"sessionStorage",lookup:function(e){var t;if(e.lookupSessionStorage&&S()){var n=window.sessionStorage.getItem(e.lookupSessionStorage);n&&(t=n)}return t},cacheUserLanguage:function(e,t){t.lookupSessionStorage&&S()&&window.sessionStorage.setItem(t.lookupSessionStorage,e)}},b={name:"navigator",lookup:function(e){var t=[];if("undefined"!=typeof navigator){if(navigator.languages)for(var n=0;n<navigator.languages.length;n++)t.push(navigator.languages[n]);navigator.userLanguage&&t.push(navigator.userLanguage),navigator.language&&t.push(navigator.language)}return t.length>0?t:void 0}},E={name:"htmlTag",lookup:function(e){var t,n=e.htmlTag||("undefined"!=typeof document?document.documentElement:null);return n&&"function"==typeof n.getAttribute&&(t=n.getAttribute("lang")),t}},k={name:"path",lookup:function(e){var t;if("undefined"!=typeof window){var n=window.location.pathname.match(/\/([a-zA-Z-]*)/g);if(n instanceof Array)if("number"==typeof e.lookupFromPathIndex){if("string"!=typeof n[e.lookupFromPathIndex])return;t=n[e.lookupFromPathIndex].replace("/","")}else t=n[0].replace("/","")}return t}},O={name:"subdomain",lookup:function(e){var t;if("undefined"!=typeof window){var n=window.location.href.match(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/gi);n instanceof Array&&(t="number"==typeof e.lookupFromSubdomainIndex?n[e.lookupFromSubdomainIndex].replace("http://","").replace("https://","").replace(".",""):n[0].replace("http://","").replace("https://","").replace(".",""))}return t}};var L=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object(i.a)(this,e),this.type="languageDetector",this.detectors={},this.init(t,n)}return Object(r.a)(e,[{key:"init",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};this.services=e,this.options=u(t,this.options||{},{order:["querystring","cookie","localStorage","sessionStorage","navigator","htmlTag"],lookupQuerystring:"lng",lookupCookie:"i18next",lookupLocalStorage:"i18nextLng",lookupSessionStorage:"i18nextLng",caches:["localStorage"],excludeCacheFor:["cimode"]}),this.options.lookupFromUrlIndex&&(this.options.lookupFromPathIndex=this.options.lookupFromUrlIndex),this.i18nOptions=n,this.addDetector(h),this.addDetector(p),this.addDetector(m),this.addDetector(w),this.addDetector(b),this.addDetector(E),this.addDetector(k),this.addDetector(O)}},{key:"addDetector",value:function(e){this.detectors[e.name]=e}},{key:"detect",value:function(e){var t=this;e||(e=this.options.order);var n=[];return e.forEach((function(e){if(t.detectors[e]){var i=t.detectors[e].lookup(t.options);i&&"string"==typeof i&&(i=[i]),i&&(n=n.concat(i))}})),this.services.languageUtils.getBestMatchFromCodes?n:n.length>0?n[0]:null}},{key:"cacheUserLanguage",value:function(e,t){var n=this;t||(t=this.options.caches),t&&(this.options.excludeCacheFor&&this.options.excludeCacheFor.indexOf(e)>-1||t.forEach((function(t){n.detectors[t]&&n.detectors[t].cacheUserLanguage(e,n.options)})))}}]),e}();L.type="languageDetector",t.default=L},function(e,t,n){"use strict";n.r(t),n.d(t,"Desktop",(function(){return se}));var i=n(0);const r=Object(i.createLogger)("agentx-js-api"),o=(e,t)=>({info:(...n)=>e.info(t,...n),warn:(...n)=>e.warn(t,...n),error:(...n)=>e.error(t,...n)});class s{constructor(e){this.logger=e.logger}check(e){return e?!!e.isInited||(this.logger.error("SERVICE still not initialized... Await it's init(...) first."),!1):(this.logger.error("SERVICE is not defined..."),!1)}}const a=e=>new s(e);var u=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};const c={rps:120,tag:"jsapi"},l={rps:0,tag:"jsapi"},d={tag:"jsapi"},f=e=>e.actionsChannels.createSource("fireGeneralSilentNotification/Req",c),h=e=>e.actionsChannels.createSource("fireGeneralAutoDismissNotification/Req",l),p=e=>e.actionsChannels.createDestination("fireGeneralAutoDismissNotification/Res",l),v=e=>e.actionsChannels.createSource("fireGeneralAcknowledgeNotification/Req",l),g=e=>e.actionsChannels.createDestination("fireGeneralAcknowledgeNotification/Res",l),m=e=>e.actionsChannels.createSource("addCustomTask",c),y=e=>e.actionsChannels.createSource("getToken/Req",l),S=e=>e.actionsChannels.createDestination("getToken/Res",d),w=e=>e.actionsChannels.createSource("getTaskMap/Req",l),b=e=>e.actionsChannels.createDestination("getTaskMap/Res",d),E=e=>e.actionsChannels.createSource("getMediaTypeQueue/Req",l),k=e=>e.actionsChannels.createDestination("getMediaTypeQueue/Res",d),O=e=>e.actionsChannels.createSource("getIdleCodes/Req",l),L=e=>e.actionsChannels.createDestination("getIdleCodes/Res",d),C=e=>e.actionsChannels.createSource("getWrapUpCodes/Req",l),T=e=>e.actionsChannels.createDestination("getWrapUpCodes/Res",d);class x{constructor(e){this.lastReqTs=Date.now(),this.lastReqN=0,this.logger=e.logger,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}getNextReqId(){const e=Date.now();return this.lastReqTs!==e?(this.lastReqTs=e,this.lastReqN=0):this.lastReqN++,`${this.lastReqTs}_${this.lastReqN}`}init(e){e&&(this.SERVICE=e),this.checkService()&&(this.sourceActionsChannels={fireGeneralSilentNotification:f(this.SERVICE),fireGeneralAutoDismissNotification:h(this.SERVICE),fireGeneralAcknowledgeNotification:v(this.SERVICE),addCustomTask:m(this.SERVICE),getToken:y(this.SERVICE),getTaskMap:w(this.SERVICE),getMediaTypeQueue:E(this.SERVICE),getIdleCodes:O(this.SERVICE),getWrapUpCodes:C(this.SERVICE)},this.destinationActionsChannels={fireGeneralAutoDismissNotification:p(this.SERVICE),fireGeneralAcknowledgeNotification:g(this.SERVICE),getToken:S(this.SERVICE),getTaskMap:b(this.SERVICE),getMediaTypeQueue:k(this.SERVICE),getIdleCodes:L(this.SERVICE),getWrapUpCodes:T(this.SERVICE)},this.logger.info("Inited"))}cleanup(){this.SERVICE=void 0,this.logger.info("Cleaned")}fireGeneralSilentNotification(...e){this.checkService()&&this.sourceActionsChannels.fireGeneralSilentNotification.send(...e)}fireGeneralAutoDismissNotification(...e){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(t=>{const n=this.getNextReqId(),r=({args:[e,o,s,a]})=>{a===n&&(s!==i.Notifications.ItemMeta.Mode.AutoDismiss&&s!==i.Notifications.ItemMeta.Mode.Silent||e===i.Notifications.ItemMeta.Status.Deactivated&&(t([e,o,s]),this.destinationActionsChannels.fireGeneralAutoDismissNotification.removeListener(r)))};this.destinationActionsChannels.fireGeneralAutoDismissNotification.addListener(r),this.sourceActionsChannels.fireGeneralAutoDismissNotification.send(...e)})}))}fireGeneralAcknowledgeNotification(...e){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(t=>{const n=this.getNextReqId(),r=({args:[e,o,s,a]})=>{a===n&&(s!==i.Notifications.ItemMeta.Mode.Acknowledge&&s!==i.Notifications.ItemMeta.Mode.Silent||e===i.Notifications.ItemMeta.Status.Deactivated&&(t([e,o,s]),this.destinationActionsChannels.fireGeneralAcknowledgeNotification.removeListener(r)))};this.destinationActionsChannels.fireGeneralAcknowledgeNotification.addListener(r),this.sourceActionsChannels.fireGeneralAcknowledgeNotification.send(...e)})}))}addCustomTask(...e){this.checkService()&&this.sourceActionsChannels.addCustomTask.send(...e)}getTaskMap(){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(e=>{const t=this.getNextReqId(),n=({args:[i,r]})=>{r===t&&(e(i),this.destinationActionsChannels.getTaskMap.removeListener(n))};this.destinationActionsChannels.getTaskMap.addListener(n),this.sourceActionsChannels.getTaskMap.send(t)})}))}getMediaTypeQueue(e){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(t=>{const n=this.getNextReqId(),i=({args:[e,r]})=>{r===n&&(t(e),this.destinationActionsChannels.getMediaTypeQueue.removeListener(i))};this.destinationActionsChannels.getMediaTypeQueue.addListener(i),this.sourceActionsChannels.getMediaTypeQueue.send(e,n)})}))}getToken(){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(e=>{const t=this.getNextReqId(),n=({args:[i,r]})=>{r===t&&(e(i),this.destinationActionsChannels.getToken.removeListener(n))};this.destinationActionsChannels.getToken.addListener(n),this.sourceActionsChannels.getToken.send(t)})}))}getIdleCodes(){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(e=>{const t=this.getNextReqId(),n=({args:[i,r]})=>{r===t&&(e(i),this.destinationActionsChannels.getIdleCodes.removeListener(n))};this.destinationActionsChannels.getIdleCodes.addListener(n),this.sourceActionsChannels.getIdleCodes.send(t)})}))}getWrapUpCodes(){return u(this,void 0,void 0,(function*(){if(this.checkService())return yield new Promise(e=>{const t=this.getNextReqId(),n=({args:[i,r]})=>{r===t&&(e(i),this.destinationActionsChannels.getWrapUpCodes.removeListener(n))};this.destinationActionsChannels.getWrapUpCodes.addListener(n),this.sourceActionsChannels.getWrapUpCodes.send(t)})}))}}const I=o(r,"[Actions JSAPI] =>");class A{constructor(e){this.isInited=!1,this.listeners=new Map,this.listenersOnce=new Map,this.logger=e.logger}init(e){this.aqmServiceEntity=e.aqmServiceEntity,this.aqmServiceEntityString=e.aqmServiceEntityString,this.isInited=!0}cleanup(){this.removeAllEventListeners(),this.aqmServiceEntity=void 0,this.aqmServiceEntityString=void 0,this.isInited=!1}_addEventListener(e,t,n){var i,r,o;const s=n?"listenersOnce":"listeners";this[s].has(e)||this[s].set(e,new Map);const a=this[s].get(e),u=n?"listenOnce":"listen",c=i=>{let r=null;return n&&(r=this.aqmServiceEntity[e].listenOnce(()=>this.removeOnceEventListener(e,t))),()=>{var t;if(i){n?(i.stopListenOnce(),r&&r.stopListenOnce()):i.stopListen();const o=[];o.push(`UnBound "${e}"`),n&&o.push("Once"),this.aqmServiceEntityString&&o.push(`from "${this.aqmServiceEntityString}"`),null===(t=this.logger)||void 0===t||t.info(o.join(" "))}}};if(this.aqmServiceEntity)if(e in this.aqmServiceEntity&&u in this.aqmServiceEntity[e]){const r=this.aqmServiceEntity[e][u](t);a.set(t,c(r));const o=[];o.push(`Bound "${e}"`),n&&o.push("Once"),this.aqmServiceEntityString&&o.push(`to "${this.aqmServiceEntityString}"`),null===(i=this.logger)||void 0===i||i.info(o.join(" "))}else null===(r=this.logger)||void 0===r||r.warn(`EventName "${e}" is not recognized, so won't be subscribed...`);else null===(o=this.logger)||void 0===o||o.error(`"${this.aqmServiceEntityString}" is not ready yet. .init(...) first...`)}_removeEventListener(e,t,n){const i=n?"listenersOnce":"listeners";if(this[i].has(e)){const n=this[i].get(e);if(n){if(n.has(t)){n.get(t)(),n.delete(t)}n.size<1&&this[i].delete(e)}}}addEventListener(e,t){this._addEventListener(e,t,!1)}addOnceEventListener(e,t){this._addEventListener(e,t,!0)}removeEventListener(e,t){this._removeEventListener(e,t,!1)}removeOnceEventListener(e,t){this._removeEventListener(e,t,!0)}removeAllEventListeners(){["listeners","listenersOnce"].forEach(e=>{this[e].forEach((e,t)=>{e.forEach((e,t)=>e()),e.clear()}),this[e].clear()})}}const N=e=>new A(e);var R=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};class D{constructor(e){this.logger=e.logger,this.aqmEvents=e.aqmEvents,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}init(e){e&&(this.SERVICE=e),this.checkService()&&(this.aqmEvents.init({aqmServiceEntity:this.SERVICE.aqm.contact,aqmServiceEntityString:"SERVICE.aqm.contact"}),this.logger.info("Inited"))}cleanup(){this.aqmEvents.cleanup(),this.SERVICE=void 0,this.logger.info("Cleaned")}accept(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.accept(e)}))}consultAccept(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.consultAccept(e)}))}buddyAgents(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.buddyAgents(e)}))}end(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.end(e)}))}consultEnd(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.consultEnd(e)}))}cancelCtq(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.cancelCtq(e)}))}wrapup(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.wrapup(e)}))}vteamTransfer(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.vteamTransfer(e)}))}blindTransfer(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.blindTransfer(e)}))}hold(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.hold(e)}))}unHold(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.unHold(e)}))}consult(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.consult(e)}))}consultConference(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.consultConference(e)}))}decline(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.decline(e)}))}consultTransfer(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.consultTransfer(e)}))}vteamList(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.vteamList(e)}))}pauseRecording(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.pauseRecording(e)}))}resumeRecording(e){var t;return R(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.contact.resumeRecording(e)}))}addEventListener(e,t){this.checkService()&&this.aqmEvents.addEventListener(e,t)}addOnceEventListener(e,t){this.checkService()&&this.aqmEvents.addOnceEventListener(e,t)}removeEventListener(e,t){this.aqmEvents.removeEventListener(e,t)}removeOnceEventListener(e,t){this.aqmEvents.removeOnceEventListener(e,t)}removeAllEventListeners(){this.aqmEvents.removeAllEventListeners()}}const M=o(r,"[AgentContact JSAPI] =>"),_=o(M,"[AqmServiceEvents: Contact] => ");var j=n(4),V=n.n(j),P=n(8),q=n.n(P),U=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};const F={agentName:void 0,agentProfileID:void 0,agentSessionId:void 0,teamId:void 0,teamName:void 0,dn:void 0,status:void 0,subStatus:void 0,idleCodes:void 0,wrapupCodes:void 0,outDialRegex:void 0,isOutboundEnabledForTenant:void 0,isOutboundEnabledForAgent:void 0};class H{constructor(e){this.emitter=V()(),this.listeners=new Set,this.teams=[],this.latestData=JSON.parse(JSON.stringify(F)),this.logger=e.logger,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}emit(e,...t){this.emitter.emit(e,...t)}update(e){const t=Object.keys(e).reduce((t,n)=>{const i=e[n],r=this.latestData[n];return JSON.stringify(i)!==JSON.stringify(r)&&t.push({name:n,value:i,oldValue:r}),t},[]);t.length&&(t.forEach(e=>this.latestData[e.name]=e.value),this.emit("updated",t))}static getOutdialRegex(e){if(e&&e.dialPlanEntity){const t=e.dialPlanEntity.find(e=>"Any Format"===e.name);if(t)return t.regex}return""}static findTeamName(e,t){const n=e.find(e=>e.teamId===t);return(null==n?void 0:n.teamName)||""}init(e){return U(this,void 0,void 0,(function*(){e&&(this.SERVICE=e),this.checkService()&&(yield this.fetchLatestData(),this.subscribeSelfDataEvents(),this.logger.info("Inited"))}))}cleanup(){this.unsubscribeSelfDataEvents(),this.removeAllEventListeners(),this.SERVICE=void 0,this.update(JSON.parse(JSON.stringify(F))),this.logger.info("Cleaned")}fetchLatestData(){var e,t,n;return U(this,void 0,void 0,(function*(){const i=(null===(e=this.SERVICE)||void 0===e?void 0:e.conf.profile)?null===(t=this.SERVICE)||void 0===t?void 0:t.conf.profile:yield null===(n=this.SERVICE)||void 0===n?void 0:n.conf.fetchProfile();if(i){const{teams:e,agentName:t,agentProfileID:n,defaultDn:r,defaultIdleName:o,agentSubStatus:s,idleCodes:a,wrapupCodes:u,dialPlan:c,isOutboundEnabledForTenant:l,isOutboundEnabledForAgent:d}=i;this.teams=e;const f=r,h=o,p=s,v=H.getOutdialRegex(c);this.update({agentName:t,agentProfileID:n,dn:f,status:h,subStatus:p,idleCodes:a,wrapupCodes:u,outDialRegex:v,isOutboundEnabledForTenant:l,isOutboundEnabledForAgent:d})}}))}subscribeSelfDataEvents(){var e,t,n,i;if(this.checkService()){{const t=null===(e=this.SERVICE)||void 0===e?void 0:e.aqm.agent.eAgentReloginSuccess.listen(({data:e})=>{const{agentSessionId:t,teamId:n,dn:i,status:r,subStatus:o}=e,s=H.findTeamName(this.teams,n);this.update({agentSessionId:t,teamId:n,teamName:s,dn:i,status:r,subStatus:o})});this.listeners.add(()=>null==t?void 0:t.stopListen())}{const e=null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.agent.eAgentStationLoginSuccess.listen(({data:e})=>{const{agentSessionId:t,teamId:n,status:i,subStatus:r}=e,o=H.findTeamName(this.teams,n);this.update({agentSessionId:t,teamId:n,teamName:o,status:i,subStatus:r})});this.listeners.add(()=>null==e?void 0:e.stopListen())}{const e=null===(n=this.SERVICE)||void 0===n?void 0:n.aqm.agent.eAgentStateChangeSuccess.listen(({data:e})=>{const{agentSessionId:t,status:n,subStatus:i}=e;this.update({agentSessionId:t,status:n,subStatus:i})});this.listeners.add(()=>null==e?void 0:e.stopListen())}{const e=null===(i=this.SERVICE)||void 0===i?void 0:i.aqm.agent.eAgentDNRegistered.listen(({data:e})=>{const{dn:t}=e;this.update({dn:t})});this.listeners.add(()=>null==e?void 0:e.stopListen())}}}unsubscribeSelfDataEvents(){this.listeners.forEach(e=>e()),this.listeners.clear()}stateChange(e){var t;return U(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.agent.stateChange({data:e})}))}mockOutdialAniList(){var e;return U(this,void 0,void 0,(function*(){if(this.checkService())return null===(e=this.SERVICE)||void 0===e?void 0:e.aqm.agent.mockOutdialAniList({p:null})}))}fetchAddressBooks(){var e;return U(this,void 0,void 0,(function*(){if(this.checkService())return null===(e=this.SERVICE)||void 0===e?void 0:e.aqm.agent.fetchAddressBooks({p:null})}))}addEventListener(e,t){this.checkService()&&this.emitter.on(e,t)}removeEventListener(e,t){this.checkService()&&this.emitter.off(e,t)}removeAllEventListeners(){q()(this.emitter)}}const z=o(r,"[AgentInfo JSAPI] =>");var Z=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};class J{constructor(e){this.emitter=V()(),this.logger=e.logger,this.agentxSERVICE=e.SERVICE}waitUntil(e){return Z(this,void 0,void 0,(function*(){if("function"==typeof e){yield new Promise(e=>setTimeout(e,1e3/30));!e()&&(yield this.waitUntil(e))}}))}checkService(e){return Z(this,void 0,void 0,(function*(){e?(e.isInited||(this.logger.warn("SERVICE is not inited. Awaiting it's initAgentxServices(...)..."),yield this.waitUntil(()=>e.isInited)),this.logger.info("SERVICE is inited. Continuing..."),this.emit("inited")):this.logger.error("SERVICE is not defiend...")}))}emit(e,...t){this.emitter.emit(e,...t)}init(){return Z(this,void 0,void 0,(function*(){this.agentxSERVICE?yield this.checkService(this.agentxSERVICE):this.logger.error("SERVICE is not defined...")}))}cleanup(){this.agentxSERVICE=void 0,this.emit("cleaned"),this.logger.info("Cleaned")}get clientLocale(){return null!=window.navigator.languages?window.navigator.languages[0]:window.navigator.language}addEventListener(e,t){this.emitter.on(e,t)}removeEventListener(e,t){this.emitter.off(e,t)}}const B=o(r,"[Config JSAPI] =>");var G=function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{u(i.next(e))}catch(e){o(e)}}function a(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((i=i.apply(e,t||[])).next())}))};class W{constructor(e){this.logger=e.logger,this.aqmEvents=e.aqmEvents,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}init(e){e&&(this.SERVICE=e),this.checkService()&&(this.aqmEvents.init({aqmServiceEntity:this.SERVICE.aqm.dialer,aqmServiceEntityString:"SERVICE.aqm.dialer"}),this.logger.info("Inited"))}cleanup(){this.aqmEvents.cleanup(),this.SERVICE=void 0,this.logger.info("Cleaned")}startOutdial(e){var t;return G(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.dialer.startOutdial(e)}))}updateCadVariables(e){var t;return G(this,void 0,void 0,(function*(){if(this.checkService())return null===(t=this.SERVICE)||void 0===t?void 0:t.aqm.dialer.updateCadVariables(e)}))}addEventListener(e,t){this.checkService()&&this.aqmEvents.addEventListener(e,t)}addOnceEventListener(e,t){this.checkService()&&this.aqmEvents.addOnceEventListener(e,t)}removeEventListener(e,t){this.aqmEvents.removeEventListener(e,t)}removeOnceEventListener(e,t){this.aqmEvents.removeOnceEventListener(e,t)}removeAllEventListeners(){this.aqmEvents.removeAllEventListeners()}}const $=o(r,"[Dialer JSAPI] =>"),K=o($,"[AqmServiceEvents: Dialer] =>");class Y{constructor(e){this.logger=e.logger,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}init(e){e&&(this.SERVICE=e),this.checkService()&&this.logger.info("Inited")}cleanup(){this.SERVICE=void 0,this.logger.info("Cleaned")}createInstance(e){return i.I18N.createService(e)}createMixin(e){return i.I18N.createMixin(e)}get DEFAULT_INIT_OPTIONS(){var e;if(this.checkService())return null===(e=this.SERVICE)||void 0===e?void 0:e.i18n.DEFAULT_INIT_OPTIONS}getMergedInitOptions(...e){return i.I18N.mergeServiceInitOptions(...e)}}const X=o(r,"[I18N JSAPI] =>");class Q{constructor(e){this.clientLoggers=new Map,this.logger=e.logger}createLogger(e){const t=Object(i.createLogger)(e);return this.clientLoggers.set(e,t),this.logger.info(`Client logger created: "${e}"`),t}cleanupLogs(e){this.clientLoggers.has(e)&&i.Logger.POOL.cleanupPrefixedLogs(e)}browserDownloadLogsJson(e){this.clientLoggers.has(e)&&i.Logger.POOL.browserDownloadPrefixedLogsJson(e)}browserDownloadLogsText(e){this.clientLoggers.has(e)&&i.Logger.POOL.browserDownloadPrefixedLogsText(e)}getLogsCollection(e){if(this.clientLoggers.has(e))return i.Logger.POOL.getPrefixedLogsCollection(e)}getLogsJsonUrl(e){if(this.clientLoggers.has(e))return i.Logger.POOL.getPrefixedLogsJsonUrl(e)}getLogsTextUrl(e){if(this.clientLoggers.has(e))return i.Logger.POOL.getPrefixedLogsTextUrl(e)}}const ee=o(r,"[Logger JSAPI] =>");class te{constructor(e){this.logger=e.logger,this.aqmEvents=e.aqmEvents,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}init(e){e&&(this.SERVICE=e),this.checkService()&&(this.aqmEvents.init({aqmServiceEntity:this.SERVICE.aqm.screenpop,aqmServiceEntityString:"SERVICE.aqm.screenpop"}),this.logger.info("Inited"))}cleanup(){this.aqmEvents.cleanup(),this.SERVICE=void 0,this.logger.info("Cleaned")}addEventListener(e,t){this.checkService()&&this.aqmEvents.addEventListener(e,t)}addOnceEventListener(e,t){this.checkService()&&this.aqmEvents.addOnceEventListener(e,t)}removeEventListener(e,t){this.aqmEvents.removeEventListener(e,t)}removeOnceEventListener(e,t){this.aqmEvents.removeOnceEventListener(e,t)}removeAllEventListeners(){this.aqmEvents.removeAllEventListeners()}}const ne=o(r,"[ScreenPop JSAPI] =>"),ie=o(ne,"[AqmServiceEvents: ScreenPop] =>");class re{constructor(e){this.logger=e.logger,this.serviceChecker=e.serviceChecker}checkService(){return this.serviceChecker.check(this.SERVICE)}init(e){e&&(this.SERVICE=e),this.checkService()&&this.logger.info("Inited")}cleanup(){this.SERVICE=void 0,this.logger.info("Cleaned")}listenKeyPress(...e){var t;this.checkService()&&(null===(t=this.SERVICE)||void 0===t||t.shortcut.event.listenKeyPress(...e))}listenKeyConflict(...e){var t;this.checkService()&&(null===(t=this.SERVICE)||void 0===t||t.shortcut.event.listenKeyConflict(...e))}listenConflictResolved(...e){var t;this.checkService()&&(null===(t=this.SERVICE)||void 0===t||t.shortcut.event.listenConflictResolved(...e))}register(...e){var t;this.checkService()&&(null===(t=this.SERVICE)||void 0===t||t.shortcut.register(...e))}unregisterKeys(...e){var t;this.checkService()&&(null===(t=this.SERVICE)||void 0===t||t.shortcut.unregisterKeys(...e))}getRegisteredKeys(){var e;if(this.checkService())return null===(e=this.SERVICE)||void 0===e?void 0:e.shortcut.getRegisteredKeys()}get DEFAULT_SHORTCUT_KEYS(){var e;return null===(e=this.SERVICE)||void 0===e?void 0:e.shortcut.DEFAULT_SHORTCUT_KEYS}get MODIFIERS(){var e;return null===(e=this.SERVICE)||void 0===e?void 0:e.shortcut.MODIFIERS}get REGISTERED_KEYS(){var e;return null===(e=this.SERVICE)||void 0===e?void 0:e.shortcut.REGISTERED_KEYS}}const oe=o(r,"[ShortcutKey JSAPI] =>"),se=(()=>{AGENTX_SERVICE?r.info('Found global "AGENTX_SERVICE"!'):r.error('Missed global "AGENTX_SERVICE"...');const e=(t=AGENTX_SERVICE,new J({logger:B,SERVICE:t}));var t;const n=new Q({logger:ee}),i=new re({logger:oe,serviceChecker:a({logger:oe})}),o=new x({logger:I,serviceChecker:a({logger:I})}),s=new H({logger:z,serviceChecker:a({logger:z})}),u=new D({logger:M,serviceChecker:a({logger:M}),aqmEvents:N({logger:_})}),c=new W({logger:$,aqmEvents:N({logger:K}),serviceChecker:a({logger:$})}),l=new te({logger:ne,aqmEvents:N({logger:ie}),serviceChecker:a({logger:ne})}),d=new Y({logger:X,serviceChecker:a({logger:X})});return e.addEventListener("inited",()=>{u.init(AGENTX_SERVICE),s.init(AGENTX_SERVICE),c.init(AGENTX_SERVICE),l.init(AGENTX_SERVICE),i.init(AGENTX_SERVICE),o.init(AGENTX_SERVICE),d.init(AGENTX_SERVICE)}),e.addEventListener("cleaned",()=>{u.cleanup(),s.cleanup(),c.cleanup(),l.cleanup(),i.cleanup(),d.cleanup(),o.cleanup()}),{config:e,logger:n,shortcutKey:i,actions:o,agentContact:u,agentStateInfo:s,dialer:c,screenpop:l,i18n:d}})()},function(e,t,n){"use strict";n.r(t),n.d(t,"v1",(function(){return h})),n.d(t,"v3",(function(){return b})),n.d(t,"v4",(function(){return E})),n.d(t,"v5",(function(){return L}));var i="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),r=new Uint8Array(16);function o(){if(!i)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return i(r)}for(var s=[],a=0;a<256;++a)s[a]=(a+256).toString(16).substr(1);var u,c,l=function(e,t){var n=t||0,i=s;return[i[e[n++]],i[e[n++]],i[e[n++]],i[e[n++]],"-",i[e[n++]],i[e[n++]],"-",i[e[n++]],i[e[n++]],"-",i[e[n++]],i[e[n++]],"-",i[e[n++]],i[e[n++]],i[e[n++]],i[e[n++]],i[e[n++]],i[e[n++]]].join("")},d=0,f=0;var h=function(e,t,n){var i=t&&n||0,r=t||[],s=(e=e||{}).node||u,a=void 0!==e.clockseq?e.clockseq:c;if(null==s||null==a){var h=e.random||(e.rng||o)();null==s&&(s=u=[1|h[0],h[1],h[2],h[3],h[4],h[5]]),null==a&&(a=c=16383&(h[6]<<8|h[7]))}var p=void 0!==e.msecs?e.msecs:(new Date).getTime(),v=void 0!==e.nsecs?e.nsecs:f+1,g=p-d+(v-f)/1e4;if(g<0&&void 0===e.clockseq&&(a=a+1&16383),(g<0||p>d)&&void 0===e.nsecs&&(v=0),v>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");d=p,f=v,c=a;var m=(1e4*(268435455&(p+=122192928e5))+v)%4294967296;r[i++]=m>>>24&255,r[i++]=m>>>16&255,r[i++]=m>>>8&255,r[i++]=255&m;var y=p/4294967296*1e4&268435455;r[i++]=y>>>8&255,r[i++]=255&y,r[i++]=y>>>24&15|16,r[i++]=y>>>16&255,r[i++]=a>>>8|128,r[i++]=255&a;for(var S=0;S<6;++S)r[i+S]=s[S];return t||l(r)};var p=function(e,t,n){var i=function(e,i,r,o){var s=r&&o||0;if("string"==typeof e&&(e=function(e){e=unescape(encodeURIComponent(e));for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(e)),"string"==typeof i&&(i=function(e){var t=[];return e.replace(/[a-fA-F0-9]{2}/g,(function(e){t.push(parseInt(e,16))})),t}(i)),!Array.isArray(e))throw TypeError("value must be an array of bytes");if(!Array.isArray(i)||16!==i.length)throw TypeError("namespace must be uuid string or an Array of 16 byte values");var a=n(i.concat(e));if(a[6]=15&a[6]|t,a[8]=63&a[8]|128,r)for(var u=0;u<16;++u)r[s+u]=a[u];return r||l(a)};try{i.name=e}catch(e){}return i.DNS="6ba7b810-9dad-11d1-80b4-00c04fd430c8",i.URL="6ba7b811-9dad-11d1-80b4-00c04fd430c8",i};function v(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}function g(e,t,n,i,r,o){return v((s=v(v(t,e),v(i,o)))<<(a=r)|s>>>32-a,n);var s,a}function m(e,t,n,i,r,o,s){return g(t&n|~t&i,e,t,r,o,s)}function y(e,t,n,i,r,o,s){return g(t&i|n&~i,e,t,r,o,s)}function S(e,t,n,i,r,o,s){return g(t^n^i,e,t,r,o,s)}function w(e,t,n,i,r,o,s){return g(n^(t|~i),e,t,r,o,s)}var b=p("v3",48,(function(e){if("string"==typeof e){var t=unescape(encodeURIComponent(e));e=new Array(t.length);for(var n=0;n<t.length;n++)e[n]=t.charCodeAt(n)}return function(e){var t,n,i,r=[],o=32*e.length;for(t=0;t<o;t+=8)n=e[t>>5]>>>t%32&255,i=parseInt("0123456789abcdef".charAt(n>>>4&15)+"0123456789abcdef".charAt(15&n),16),r.push(i);return r}(function(e,t){var n,i,r,o,s;e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;var a=1732584193,u=-271733879,c=-1732584194,l=271733878;for(n=0;n<e.length;n+=16)i=a,r=u,o=c,s=l,a=m(a,u,c,l,e[n],7,-680876936),l=m(l,a,u,c,e[n+1],12,-389564586),c=m(c,l,a,u,e[n+2],17,606105819),u=m(u,c,l,a,e[n+3],22,-1044525330),a=m(a,u,c,l,e[n+4],7,-176418897),l=m(l,a,u,c,e[n+5],12,1200080426),c=m(c,l,a,u,e[n+6],17,-1473231341),u=m(u,c,l,a,e[n+7],22,-45705983),a=m(a,u,c,l,e[n+8],7,1770035416),l=m(l,a,u,c,e[n+9],12,-1958414417),c=m(c,l,a,u,e[n+10],17,-42063),u=m(u,c,l,a,e[n+11],22,-1990404162),a=m(a,u,c,l,e[n+12],7,1804603682),l=m(l,a,u,c,e[n+13],12,-40341101),c=m(c,l,a,u,e[n+14],17,-1502002290),u=m(u,c,l,a,e[n+15],22,1236535329),a=y(a,u,c,l,e[n+1],5,-165796510),l=y(l,a,u,c,e[n+6],9,-1069501632),c=y(c,l,a,u,e[n+11],14,643717713),u=y(u,c,l,a,e[n],20,-373897302),a=y(a,u,c,l,e[n+5],5,-701558691),l=y(l,a,u,c,e[n+10],9,38016083),c=y(c,l,a,u,e[n+15],14,-660478335),u=y(u,c,l,a,e[n+4],20,-405537848),a=y(a,u,c,l,e[n+9],5,568446438),l=y(l,a,u,c,e[n+14],9,-1019803690),c=y(c,l,a,u,e[n+3],14,-187363961),u=y(u,c,l,a,e[n+8],20,1163531501),a=y(a,u,c,l,e[n+13],5,-1444681467),l=y(l,a,u,c,e[n+2],9,-51403784),c=y(c,l,a,u,e[n+7],14,1735328473),u=y(u,c,l,a,e[n+12],20,-1926607734),a=S(a,u,c,l,e[n+5],4,-378558),l=S(l,a,u,c,e[n+8],11,-2022574463),c=S(c,l,a,u,e[n+11],16,1839030562),u=S(u,c,l,a,e[n+14],23,-35309556),a=S(a,u,c,l,e[n+1],4,-1530992060),l=S(l,a,u,c,e[n+4],11,1272893353),c=S(c,l,a,u,e[n+7],16,-155497632),u=S(u,c,l,a,e[n+10],23,-1094730640),a=S(a,u,c,l,e[n+13],4,681279174),l=S(l,a,u,c,e[n],11,-358537222),c=S(c,l,a,u,e[n+3],16,-722521979),u=S(u,c,l,a,e[n+6],23,76029189),a=S(a,u,c,l,e[n+9],4,-640364487),l=S(l,a,u,c,e[n+12],11,-421815835),c=S(c,l,a,u,e[n+15],16,530742520),u=S(u,c,l,a,e[n+2],23,-995338651),a=w(a,u,c,l,e[n],6,-198630844),l=w(l,a,u,c,e[n+7],10,1126891415),c=w(c,l,a,u,e[n+14],15,-1416354905),u=w(u,c,l,a,e[n+5],21,-57434055),a=w(a,u,c,l,e[n+12],6,1700485571),l=w(l,a,u,c,e[n+3],10,-1894986606),c=w(c,l,a,u,e[n+10],15,-1051523),u=w(u,c,l,a,e[n+1],21,-2054922799),a=w(a,u,c,l,e[n+8],6,1873313359),l=w(l,a,u,c,e[n+15],10,-30611744),c=w(c,l,a,u,e[n+6],15,-1560198380),u=w(u,c,l,a,e[n+13],21,1309151649),a=w(a,u,c,l,e[n+4],6,-145523070),l=w(l,a,u,c,e[n+11],10,-1120210379),c=w(c,l,a,u,e[n+2],15,718787259),u=w(u,c,l,a,e[n+9],21,-343485551),a=v(a,i),u=v(u,r),c=v(c,o),l=v(l,s);return[a,u,c,l]}(function(e){var t,n=[];for(n[(e.length>>2)-1]=void 0,t=0;t<n.length;t+=1)n[t]=0;var i=8*e.length;for(t=0;t<i;t+=8)n[t>>5]|=(255&e[t/8])<<t%32;return n}(e),8*e.length))}));var E=function(e,t,n){var i=t&&n||0;"string"==typeof e&&(t="binary"===e?new Array(16):null,e=null);var r=(e=e||{}).random||(e.rng||o)();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t)for(var s=0;s<16;++s)t[i+s]=r[s];return t||l(r)};function k(e,t,n,i){switch(e){case 0:return t&n^~t&i;case 1:return t^n^i;case 2:return t&n^t&i^n&i;case 3:return t^n^i}}function O(e,t){return e<<t|e>>>32-t}var L=p("v5",80,(function(e){var t=[1518500249,1859775393,2400959708,3395469782],n=[1732584193,4023233417,2562383102,271733878,3285377520];if("string"==typeof e){var i=unescape(encodeURIComponent(e));e=new Array(i.length);for(var r=0;r<i.length;r++)e[r]=i.charCodeAt(r)}e.push(128);var o=e.length/4+2,s=Math.ceil(o/16),a=new Array(s);for(r=0;r<s;r++){a[r]=new Array(16);for(var u=0;u<16;u++)a[r][u]=e[64*r+4*u]<<24|e[64*r+4*u+1]<<16|e[64*r+4*u+2]<<8|e[64*r+4*u+3]}for(a[s-1][14]=8*(e.length-1)/Math.pow(2,32),a[s-1][14]=Math.floor(a[s-1][14]),a[s-1][15]=8*(e.length-1)&4294967295,r=0;r<s;r++){for(var c=new Array(80),l=0;l<16;l++)c[l]=a[r][l];for(l=16;l<80;l++)c[l]=O(c[l-3]^c[l-8]^c[l-14]^c[l-16],1);var d=n[0],f=n[1],h=n[2],p=n[3],v=n[4];for(l=0;l<80;l++){var g=Math.floor(l/20),m=O(d,5)+k(g,f,h,p)+v+t[g]+c[l]>>>0;v=p,p=h,h=O(f,30)>>>0,f=d,d=m}n[0]=n[0]+d>>>0,n[1]=n[1]+f>>>0,n[2]=n[2]+h>>>0,n[3]=n[3]+p>>>0,n[4]=n[4]+v>>>0}return[n[0]>>24&255,n[0]>>16&255,n[0]>>8&255,255&n[0],n[1]>>24&255,n[1]>>16&255,n[1]>>8&255,255&n[1],n[2]>>24&255,n[2]>>16&255,n[2]>>8&255,255&n[2],n[3]>>24&255,n[3]>>16&255,n[3]>>8&255,255&n[3],n[4]>>24&255,n[4]>>16&255,n[4]>>8&255,255&n[4]]}))},function(e,t,n){"use strict";function i(e){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?Object(arguments[t]):{},i=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(n).filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})))),i.forEach((function(t){r(e,t,n[t])}))}return e}n.r(t);var s=n(2),a=n(3);function u(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function c(e,t){return!t||"object"!==i(t)&&"function"!=typeof t?u(e):t}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function d(e,t){return(d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t)}var h={type:"logger",log:function(e){this.output("log",e)},warn:function(e){this.output("warn",e)},error:function(e){this.output("error",e)},output:function(e,t){console&&console[e]&&console[e].apply(console,t)}},p=new(function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object(s.a)(this,e),this.init(t,n)}return Object(a.a)(e,[{key:"init",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.prefix=t.prefix||"i18next:",this.logger=e||h,this.options=t,this.debug=t.debug}},{key:"setDebug",value:function(e){this.debug=e}},{key:"log",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return this.forward(t,"log","",!0)}},{key:"warn",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return this.forward(t,"warn","",!0)}},{key:"error",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return this.forward(t,"error","")}},{key:"deprecate",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return this.forward(t,"warn","WARNING DEPRECATED: ",!0)}},{key:"forward",value:function(e,t,n,i){return i&&!this.debug?null:("string"==typeof e[0]&&(e[0]="".concat(n).concat(this.prefix," ").concat(e[0])),this.logger[t](e))}},{key:"create",value:function(t){return new e(this.logger,o({},{prefix:"".concat(this.prefix,":").concat(t,":")},this.options))}}]),e}()),v=function(){function e(){Object(s.a)(this,e),this.observers={}}return Object(a.a)(e,[{key:"on",value:function(e,t){var n=this;return e.split(" ").forEach((function(e){n.observers[e]=n.observers[e]||[],n.observers[e].push(t)})),this}},{key:"off",value:function(e,t){this.observers[e]&&(t?this.observers[e]=this.observers[e].filter((function(e){return e!==t})):delete this.observers[e])}},{key:"emit",value:function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];if(this.observers[e]){var r=[].concat(this.observers[e]);r.forEach((function(e){e.apply(void 0,n)}))}if(this.observers["*"]){var o=[].concat(this.observers["*"]);o.forEach((function(t){t.apply(t,[e].concat(n))}))}}}]),e}();function g(){var e,t,n=new Promise((function(n,i){e=n,t=i}));return n.resolve=e,n.reject=t,n}function m(e){return null==e?"":""+e}function y(e,t,n){e.forEach((function(e){t[e]&&(n[e]=t[e])}))}function S(e,t,n){function i(e){return e&&e.indexOf("###")>-1?e.replace(/###/g,"."):e}function r(){return!e||"string"==typeof e}for(var o="string"!=typeof t?[].concat(t):t.split(".");o.length>1;){if(r())return{};var s=i(o.shift());!e[s]&&n&&(e[s]=new n),e=e[s]}return r()?{}:{obj:e,k:i(o.shift())}}function w(e,t,n){var i=S(e,t,Object);i.obj[i.k]=n}function b(e,t){var n=S(e,t),i=n.obj,r=n.k;if(i)return i[r]}function E(e,t,n){var i=b(e,n);return void 0!==i?i:b(t,n)}function k(e,t,n){for(var i in t)"__proto__"!==i&&"constructor"!==i&&(i in e?"string"==typeof e[i]||e[i]instanceof String||"string"==typeof t[i]||t[i]instanceof String?n&&(e[i]=t[i]):k(e[i],t[i],n):e[i]=t[i]);return e}function O(e){return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}var L={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};function C(e){return"string"==typeof e?e.replace(/[&<>"'\/]/g,(function(e){return L[e]})):e}var T="undefined"!=typeof window&&window.navigator&&window.navigator.userAgent&&window.navigator.userAgent.indexOf("MSIE")>-1,x=function(e){function t(e){var n,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{ns:["translation"],defaultNS:"translation"};return Object(s.a)(this,t),n=c(this,l(t).call(this)),T&&v.call(u(n)),n.data=e||{},n.options=i,void 0===n.options.keySeparator&&(n.options.keySeparator="."),n}return f(t,e),Object(a.a)(t,[{key:"addNamespaces",value:function(e){this.options.ns.indexOf(e)<0&&this.options.ns.push(e)}},{key:"removeNamespaces",value:function(e){var t=this.options.ns.indexOf(e);t>-1&&this.options.ns.splice(t,1)}},{key:"getResource",value:function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},r=void 0!==i.keySeparator?i.keySeparator:this.options.keySeparator,o=[e,t];return n&&"string"!=typeof n&&(o=o.concat(n)),n&&"string"==typeof n&&(o=o.concat(r?n.split(r):n)),e.indexOf(".")>-1&&(o=e.split(".")),b(this.data,o)}},{key:"addResource",value:function(e,t,n,i){var r=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{silent:!1},o=this.options.keySeparator;void 0===o&&(o=".");var s=[e,t];n&&(s=s.concat(o?n.split(o):n)),e.indexOf(".")>-1&&(i=t,t=(s=e.split("."))[1]),this.addNamespaces(t),w(this.data,s,i),r.silent||this.emit("added",e,t,n,i)}},{key:"addResources",value:function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{silent:!1};for(var r in n)"string"!=typeof n[r]&&"[object Array]"!==Object.prototype.toString.apply(n[r])||this.addResource(e,t,r,n[r],{silent:!0});i.silent||this.emit("added",e,t,n)}},{key:"addResourceBundle",value:function(e,t,n,i,r){var s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{silent:!1},a=[e,t];e.indexOf(".")>-1&&(i=n,n=t,t=(a=e.split("."))[1]),this.addNamespaces(t);var u=b(this.data,a)||{};i?k(u,n,r):u=o({},u,n),w(this.data,a,u),s.silent||this.emit("added",e,t,n)}},{key:"removeResourceBundle",value:function(e,t){this.hasResourceBundle(e,t)&&delete this.data[e][t],this.removeNamespaces(t),this.emit("removed",e,t)}},{key:"hasResourceBundle",value:function(e,t){return void 0!==this.getResource(e,t)}},{key:"getResourceBundle",value:function(e,t){return t||(t=this.options.defaultNS),"v1"===this.options.compatibilityAPI?o({},{},this.getResource(e,t)):this.getResource(e,t)}},{key:"getDataByLanguage",value:function(e){return this.data[e]}},{key:"toJSON",value:function(){return this.data}}]),t}(v),I={processors:{},addPostProcessor:function(e){this.processors[e.name]=e},handle:function(e,t,n,i,r){var o=this;return e.forEach((function(e){o.processors[e]&&(t=o.processors[e].process(t,n,i,r))})),t}},A={},N=function(e){function t(e){var n,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object(s.a)(this,t),n=c(this,l(t).call(this)),T&&v.call(u(n)),y(["resourceStore","languageUtils","pluralResolver","interpolator","backendConnector","i18nFormat","utils"],e,u(n)),n.options=i,void 0===n.options.keySeparator&&(n.options.keySeparator="."),n.logger=p.create("translator"),n}return f(t,e),Object(a.a)(t,[{key:"changeLanguage",value:function(e){e&&(this.language=e)}},{key:"exists",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{interpolation:{}},n=this.resolve(e,t);return n&&void 0!==n.res}},{key:"extractFromKey",value:function(e,t){var n=void 0!==t.nsSeparator?t.nsSeparator:this.options.nsSeparator;void 0===n&&(n=":");var i=void 0!==t.keySeparator?t.keySeparator:this.options.keySeparator,r=t.ns||this.options.defaultNS;if(n&&e.indexOf(n)>-1){var o=e.match(this.interpolator.nestingRegexp);if(o&&o.length>0)return{key:e,namespaces:r};var s=e.split(n);(n!==i||n===i&&this.options.ns.indexOf(s[0])>-1)&&(r=s.shift()),e=s.join(i)}return"string"==typeof r&&(r=[r]),{key:e,namespaces:r}}},{key:"translate",value:function(e,t,n){var r=this;if("object"!==i(t)&&this.options.overloadTranslationOptionHandler&&(t=this.options.overloadTranslationOptionHandler(arguments)),t||(t={}),null==e)return"";Array.isArray(e)||(e=[String(e)]);var s=void 0!==t.keySeparator?t.keySeparator:this.options.keySeparator,a=this.extractFromKey(e[e.length-1],t),u=a.key,c=a.namespaces,l=c[c.length-1],d=t.lng||this.language,f=t.appendNamespaceToCIMode||this.options.appendNamespaceToCIMode;if(d&&"cimode"===d.toLowerCase()){if(f){var h=t.nsSeparator||this.options.nsSeparator;return l+h+u}return u}var p=this.resolve(e,t),v=p&&p.res,g=p&&p.usedKey||u,m=p&&p.exactUsedKey||u,y=Object.prototype.toString.apply(v),S=["[object Number]","[object Function]","[object RegExp]"],w=void 0!==t.joinArrays?t.joinArrays:this.options.joinArrays,b=!this.i18nFormat||this.i18nFormat.handleAsObject,E="string"!=typeof v&&"boolean"!=typeof v&&"number"!=typeof v;if(b&&v&&E&&S.indexOf(y)<0&&("string"!=typeof w||"[object Array]"!==y)){if(!t.returnObjects&&!this.options.returnObjects)return this.logger.warn("accessing an object - but returnObjects options is not enabled!"),this.options.returnedObjectHandler?this.options.returnedObjectHandler(g,v,t):"key '".concat(u," (").concat(this.language,")' returned an object instead of string.");if(s){var k="[object Array]"===y,O=k?[]:{},L=k?m:g;for(var C in v)if(Object.prototype.hasOwnProperty.call(v,C)){var T="".concat(L).concat(s).concat(C);O[C]=this.translate(T,o({},t,{joinArrays:!1,ns:c})),O[C]===T&&(O[C]=v[C])}v=O}}else if(b&&"string"==typeof w&&"[object Array]"===y)(v=v.join(w))&&(v=this.extendTranslation(v,e,t,n));else{var x=!1,I=!1;if(!this.isValidLookup(v)&&void 0!==t.defaultValue){if(x=!0,void 0!==t.count){var A=this.pluralResolver.getSuffix(d,t.count);v=t["defaultValue".concat(A)]}v||(v=t.defaultValue)}this.isValidLookup(v)||(I=!0,v=u);var N=t.defaultValue&&t.defaultValue!==v&&this.options.updateMissing;if(I||x||N){if(this.logger.log(N?"updateKey":"missingKey",d,l,u,N?t.defaultValue:v),s){var R=this.resolve(u,o({},t,{keySeparator:!1}));R&&R.res&&this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")}var D=[],M=this.languageUtils.getFallbackCodes(this.options.fallbackLng,t.lng||this.language);if("fallback"===this.options.saveMissingTo&&M&&M[0])for(var _=0;_<M.length;_++)D.push(M[_]);else"all"===this.options.saveMissingTo?D=this.languageUtils.toResolveHierarchy(t.lng||this.language):D.push(t.lng||this.language);var j=function(e,n){r.options.missingKeyHandler?r.options.missingKeyHandler(e,l,n,N?t.defaultValue:v,N,t):r.backendConnector&&r.backendConnector.saveMissing&&r.backendConnector.saveMissing(e,l,n,N?t.defaultValue:v,N,t),r.emit("missingKey",e,l,n,v)};if(this.options.saveMissing){var V=void 0!==t.count&&"string"!=typeof t.count;this.options.saveMissingPlurals&&V?D.forEach((function(e){r.pluralResolver.getPluralFormsOfKey(e,u).forEach((function(t){return j([e],t)}))})):j(D,u)}}v=this.extendTranslation(v,e,t,p,n),I&&v===u&&this.options.appendNamespaceToMissingKey&&(v="".concat(l,":").concat(u)),I&&this.options.parseMissingKeyHandler&&(v=this.options.parseMissingKeyHandler(v))}return v}},{key:"extendTranslation",value:function(e,t,n,i,r){var s=this;if(this.i18nFormat&&this.i18nFormat.parse)e=this.i18nFormat.parse(e,n,i.usedLng,i.usedNS,i.usedKey,{resolved:i});else if(!n.skipInterpolation){n.interpolation&&this.interpolator.init(o({},n,{interpolation:o({},this.options.interpolation,n.interpolation)}));var a,u=n.interpolation&&n.interpolation.skipOnVariables||this.options.interpolation.skipOnVariables;if(u){var c=e.match(this.interpolator.nestingRegexp);a=c&&c.length}var l=n.replace&&"string"!=typeof n.replace?n.replace:n;if(this.options.interpolation.defaultVariables&&(l=o({},this.options.interpolation.defaultVariables,l)),e=this.interpolator.interpolate(e,l,n.lng||this.language,n),u){var d=e.match(this.interpolator.nestingRegexp);a<(d&&d.length)&&(n.nest=!1)}!1!==n.nest&&(e=this.interpolator.nest(e,(function(){for(var e=arguments.length,i=new Array(e),o=0;o<e;o++)i[o]=arguments[o];return r&&r[0]===i[0]&&!n.context?(s.logger.warn("It seems you are nesting recursively key: ".concat(i[0]," in key: ").concat(t[0])),null):s.translate.apply(s,i.concat([t]))}),n)),n.interpolation&&this.interpolator.reset()}var f=n.postProcess||this.options.postProcess,h="string"==typeof f?[f]:f;return null!=e&&h&&h.length&&!1!==n.applyPostProcessor&&(e=I.handle(h,e,t,this.options&&this.options.postProcessPassResolved?o({i18nResolved:i},n):n,this)),e}},{key:"resolve",value:function(e){var t,n,i,r,o,s=this,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return"string"==typeof e&&(e=[e]),e.forEach((function(e){if(!s.isValidLookup(t)){var u=s.extractFromKey(e,a),c=u.key;n=c;var l=u.namespaces;s.options.fallbackNS&&(l=l.concat(s.options.fallbackNS));var d=void 0!==a.count&&"string"!=typeof a.count,f=void 0!==a.context&&"string"==typeof a.context&&""!==a.context,h=a.lngs?a.lngs:s.languageUtils.toResolveHierarchy(a.lng||s.language,a.fallbackLng);l.forEach((function(e){s.isValidLookup(t)||(o=e,!A["".concat(h[0],"-").concat(e)]&&s.utils&&s.utils.hasLoadedNamespace&&!s.utils.hasLoadedNamespace(o)&&(A["".concat(h[0],"-").concat(e)]=!0,s.logger.warn('key "'.concat(n,'" for languages "').concat(h.join(", "),'" won\'t get resolved as namespace "').concat(o,'" was not yet loaded'),"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),h.forEach((function(n){if(!s.isValidLookup(t)){r=n;var o,u,l=c,h=[l];if(s.i18nFormat&&s.i18nFormat.addLookupKeys)s.i18nFormat.addLookupKeys(h,c,n,e,a);else d&&(o=s.pluralResolver.getSuffix(n,a.count)),d&&f&&h.push(l+o),f&&h.push(l+="".concat(s.options.contextSeparator).concat(a.context)),d&&h.push(l+=o);for(;u=h.pop();)s.isValidLookup(t)||(i=u,t=s.getResource(n,e,u,a))}})))}))}})),{res:t,usedKey:n,exactUsedKey:i,usedLng:r,usedNS:o}}},{key:"isValidLookup",value:function(e){return!(void 0===e||!this.options.returnNull&&null===e||!this.options.returnEmptyString&&""===e)}},{key:"getResource",value:function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};return this.i18nFormat&&this.i18nFormat.getResource?this.i18nFormat.getResource(e,t,n,i):this.resourceStore.getResource(e,t,n,i)}}]),t}(v);function R(e){return e.charAt(0).toUpperCase()+e.slice(1)}var D=function(){function e(t){Object(s.a)(this,e),this.options=t,this.whitelist=this.options.supportedLngs||!1,this.supportedLngs=this.options.supportedLngs||!1,this.logger=p.create("languageUtils")}return Object(a.a)(e,[{key:"getScriptPartFromCode",value:function(e){if(!e||e.indexOf("-")<0)return null;var t=e.split("-");return 2===t.length?null:(t.pop(),"x"===t[t.length-1].toLowerCase()?null:this.formatLanguageCode(t.join("-")))}},{key:"getLanguagePartFromCode",value:function(e){if(!e||e.indexOf("-")<0)return e;var t=e.split("-");return this.formatLanguageCode(t[0])}},{key:"formatLanguageCode",value:function(e){if("string"==typeof e&&e.indexOf("-")>-1){var t=["hans","hant","latn","cyrl","cans","mong","arab"],n=e.split("-");return this.options.lowerCaseLng?n=n.map((function(e){return e.toLowerCase()})):2===n.length?(n[0]=n[0].toLowerCase(),n[1]=n[1].toUpperCase(),t.indexOf(n[1].toLowerCase())>-1&&(n[1]=R(n[1].toLowerCase()))):3===n.length&&(n[0]=n[0].toLowerCase(),2===n[1].length&&(n[1]=n[1].toUpperCase()),"sgn"!==n[0]&&2===n[2].length&&(n[2]=n[2].toUpperCase()),t.indexOf(n[1].toLowerCase())>-1&&(n[1]=R(n[1].toLowerCase())),t.indexOf(n[2].toLowerCase())>-1&&(n[2]=R(n[2].toLowerCase()))),n.join("-")}return this.options.cleanCode||this.options.lowerCaseLng?e.toLowerCase():e}},{key:"isWhitelisted",value:function(e){return this.logger.deprecate("languageUtils.isWhitelisted",'function "isWhitelisted" will be renamed to "isSupportedCode" in the next major - please make sure to rename it\'s usage asap.'),this.isSupportedCode(e)}},{key:"isSupportedCode",value:function(e){return("languageOnly"===this.options.load||this.options.nonExplicitSupportedLngs)&&(e=this.getLanguagePartFromCode(e)),!this.supportedLngs||!this.supportedLngs.length||this.supportedLngs.indexOf(e)>-1}},{key:"getBestMatchFromCodes",value:function(e){var t,n=this;return e?(e.forEach((function(e){if(!t){var i=n.formatLanguageCode(e);n.options.supportedLngs&&!n.isSupportedCode(i)||(t=i)}})),!t&&this.options.supportedLngs&&e.forEach((function(e){if(!t){var i=n.getLanguagePartFromCode(e);if(n.isSupportedCode(i))return t=i;t=n.options.supportedLngs.find((function(e){if(0===e.indexOf(i))return e}))}})),t||(t=this.getFallbackCodes(this.options.fallbackLng)[0]),t):null}},{key:"getFallbackCodes",value:function(e,t){if(!e)return[];if("function"==typeof e&&(e=e(t)),"string"==typeof e&&(e=[e]),"[object Array]"===Object.prototype.toString.apply(e))return e;if(!t)return e.default||[];var n=e[t];return n||(n=e[this.getScriptPartFromCode(t)]),n||(n=e[this.formatLanguageCode(t)]),n||(n=e[this.getLanguagePartFromCode(t)]),n||(n=e.default),n||[]}},{key:"toResolveHierarchy",value:function(e,t){var n=this,i=this.getFallbackCodes(t||this.options.fallbackLng||[],e),r=[],o=function(e){e&&(n.isSupportedCode(e)?r.push(e):n.logger.warn("rejecting language code not found in supportedLngs: ".concat(e)))};return"string"==typeof e&&e.indexOf("-")>-1?("languageOnly"!==this.options.load&&o(this.formatLanguageCode(e)),"languageOnly"!==this.options.load&&"currentOnly"!==this.options.load&&o(this.getScriptPartFromCode(e)),"currentOnly"!==this.options.load&&o(this.getLanguagePartFromCode(e))):"string"==typeof e&&o(this.formatLanguageCode(e)),i.forEach((function(e){r.indexOf(e)<0&&o(n.formatLanguageCode(e))})),r}}]),e}(),M=[{lngs:["ach","ak","am","arn","br","fil","gun","ln","mfe","mg","mi","oc","pt","pt-BR","tg","ti","tr","uz","wa"],nr:[1,2],fc:1},{lngs:["af","an","ast","az","bg","bn","ca","da","de","dev","el","en","eo","es","et","eu","fi","fo","fur","fy","gl","gu","ha","hi","hu","hy","ia","it","kn","ku","lb","mai","ml","mn","mr","nah","nap","nb","ne","nl","nn","no","nso","pa","pap","pms","ps","pt-PT","rm","sco","se","si","so","son","sq","sv","sw","ta","te","tk","ur","yo"],nr:[1,2],fc:2},{lngs:["ay","bo","cgg","fa","ht","id","ja","jbo","ka","kk","km","ko","ky","lo","ms","sah","su","th","tt","ug","vi","wo","zh"],nr:[1],fc:3},{lngs:["be","bs","cnr","dz","hr","ru","sr","uk"],nr:[1,2,5],fc:4},{lngs:["ar"],nr:[0,1,2,3,11,100],fc:5},{lngs:["cs","sk"],nr:[1,2,5],fc:6},{lngs:["csb","pl"],nr:[1,2,5],fc:7},{lngs:["cy"],nr:[1,2,3,8],fc:8},{lngs:["fr"],nr:[1,2],fc:9},{lngs:["ga"],nr:[1,2,3,7,11],fc:10},{lngs:["gd"],nr:[1,2,3,20],fc:11},{lngs:["is"],nr:[1,2],fc:12},{lngs:["jv"],nr:[0,1],fc:13},{lngs:["kw"],nr:[1,2,3,4],fc:14},{lngs:["lt"],nr:[1,2,10],fc:15},{lngs:["lv"],nr:[1,2,0],fc:16},{lngs:["mk"],nr:[1,2],fc:17},{lngs:["mnk"],nr:[0,1,2],fc:18},{lngs:["mt"],nr:[1,2,11,20],fc:19},{lngs:["or"],nr:[2,1],fc:2},{lngs:["ro"],nr:[1,2,20],fc:20},{lngs:["sl"],nr:[5,1,2,3],fc:21},{lngs:["he","iw"],nr:[1,2,20,21],fc:22}],_={1:function(e){return Number(e>1)},2:function(e){return Number(1!=e)},3:function(e){return 0},4:function(e){return Number(e%10==1&&e%100!=11?0:e%10>=2&&e%10<=4&&(e%100<10||e%100>=20)?1:2)},5:function(e){return Number(0==e?0:1==e?1:2==e?2:e%100>=3&&e%100<=10?3:e%100>=11?4:5)},6:function(e){return Number(1==e?0:e>=2&&e<=4?1:2)},7:function(e){return Number(1==e?0:e%10>=2&&e%10<=4&&(e%100<10||e%100>=20)?1:2)},8:function(e){return Number(1==e?0:2==e?1:8!=e&&11!=e?2:3)},9:function(e){return Number(e>=2)},10:function(e){return Number(1==e?0:2==e?1:e<7?2:e<11?3:4)},11:function(e){return Number(1==e||11==e?0:2==e||12==e?1:e>2&&e<20?2:3)},12:function(e){return Number(e%10!=1||e%100==11)},13:function(e){return Number(0!==e)},14:function(e){return Number(1==e?0:2==e?1:3==e?2:3)},15:function(e){return Number(e%10==1&&e%100!=11?0:e%10>=2&&(e%100<10||e%100>=20)?1:2)},16:function(e){return Number(e%10==1&&e%100!=11?0:0!==e?1:2)},17:function(e){return Number(1==e||e%10==1&&e%100!=11?0:1)},18:function(e){return Number(0==e?0:1==e?1:2)},19:function(e){return Number(1==e?0:0==e||e%100>1&&e%100<11?1:e%100>10&&e%100<20?2:3)},20:function(e){return Number(1==e?0:0==e||e%100>0&&e%100<20?1:2)},21:function(e){return Number(e%100==1?1:e%100==2?2:e%100==3||e%100==4?3:0)},22:function(e){return Number(1==e?0:2==e?1:(e<0||e>10)&&e%10==0?2:3)}};function j(){var e={};return M.forEach((function(t){t.lngs.forEach((function(n){e[n]={numbers:t.nr,plurals:_[t.fc]}}))})),e}var V=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Object(s.a)(this,e),this.languageUtils=t,this.options=n,this.logger=p.create("pluralResolver"),this.rules=j()}return Object(a.a)(e,[{key:"addRule",value:function(e,t){this.rules[e]=t}},{key:"getRule",value:function(e){return this.rules[e]||this.rules[this.languageUtils.getLanguagePartFromCode(e)]}},{key:"needsPlural",value:function(e){var t=this.getRule(e);return t&&t.numbers.length>1}},{key:"getPluralFormsOfKey",value:function(e,t){var n=this,i=[],r=this.getRule(e);return r?(r.numbers.forEach((function(r){var o=n.getSuffix(e,r);i.push("".concat(t).concat(o))})),i):i}},{key:"getSuffix",value:function(e,t){var n=this,i=this.getRule(e);if(i){var r=i.noAbs?i.plurals(t):i.plurals(Math.abs(t)),o=i.numbers[r];this.options.simplifyPluralSuffix&&2===i.numbers.length&&1===i.numbers[0]&&(2===o?o="plural":1===o&&(o=""));var s=function(){return n.options.prepend&&o.toString()?n.options.prepend+o.toString():o.toString()};return"v1"===this.options.compatibilityJSON?1===o?"":"number"==typeof o?"_plural_".concat(o.toString()):s():"v2"===this.options.compatibilityJSON||this.options.simplifyPluralSuffix&&2===i.numbers.length&&1===i.numbers[0]?s():this.options.prepend&&r.toString()?this.options.prepend+r.toString():r.toString()}return this.logger.warn("no plural rule found for: ".concat(e)),""}}]),e}(),P=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};Object(s.a)(this,e),this.logger=p.create("interpolator"),this.options=t,this.format=t.interpolation&&t.interpolation.format||function(e){return e},this.init(t)}return Object(a.a)(e,[{key:"init",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e.interpolation||(e.interpolation={escapeValue:!0});var t=e.interpolation;this.escape=void 0!==t.escape?t.escape:C,this.escapeValue=void 0===t.escapeValue||t.escapeValue,this.useRawValueToEscape=void 0!==t.useRawValueToEscape&&t.useRawValueToEscape,this.prefix=t.prefix?O(t.prefix):t.prefixEscaped||"{{",this.suffix=t.suffix?O(t.suffix):t.suffixEscaped||"}}",this.formatSeparator=t.formatSeparator?t.formatSeparator:t.formatSeparator||",",this.unescapePrefix=t.unescapeSuffix?"":t.unescapePrefix||"-",this.unescapeSuffix=this.unescapePrefix?"":t.unescapeSuffix||"",this.nestingPrefix=t.nestingPrefix?O(t.nestingPrefix):t.nestingPrefixEscaped||O("$t("),this.nestingSuffix=t.nestingSuffix?O(t.nestingSuffix):t.nestingSuffixEscaped||O(")"),this.nestingOptionsSeparator=t.nestingOptionsSeparator?t.nestingOptionsSeparator:t.nestingOptionsSeparator||",",this.maxReplaces=t.maxReplaces?t.maxReplaces:1e3,this.alwaysFormat=void 0!==t.alwaysFormat&&t.alwaysFormat,this.resetRegExp()}},{key:"reset",value:function(){this.options&&this.init(this.options)}},{key:"resetRegExp",value:function(){var e="".concat(this.prefix,"(.+?)").concat(this.suffix);this.regexp=new RegExp(e,"g");var t="".concat(this.prefix).concat(this.unescapePrefix,"(.+?)").concat(this.unescapeSuffix).concat(this.suffix);this.regexpUnescape=new RegExp(t,"g");var n="".concat(this.nestingPrefix,"(.+?)").concat(this.nestingSuffix);this.nestingRegexp=new RegExp(n,"g")}},{key:"interpolate",value:function(e,t,n,i){var r,o,s,a=this,u=this.options&&this.options.interpolation&&this.options.interpolation.defaultVariables||{};function c(e){return e.replace(/\$/g,"$$$$")}var l=function(e){if(e.indexOf(a.formatSeparator)<0){var r=E(t,u,e);return a.alwaysFormat?a.format(r,void 0,n):r}var o=e.split(a.formatSeparator),s=o.shift().trim(),c=o.join(a.formatSeparator).trim();return a.format(E(t,u,s),c,n,i)};this.resetRegExp();var d=i&&i.missingInterpolationHandler||this.options.missingInterpolationHandler,f=i&&i.interpolation&&i.interpolation.skipOnVariables||this.options.interpolation.skipOnVariables;return[{regex:this.regexpUnescape,safeValue:function(e){return c(e)}},{regex:this.regexp,safeValue:function(e){return a.escapeValue?c(a.escape(e)):c(e)}}].forEach((function(t){for(s=0;r=t.regex.exec(e);){if(void 0===(o=l(r[1].trim())))if("function"==typeof d){var n=d(e,r,i);o="string"==typeof n?n:""}else{if(f){o=r[0];continue}a.logger.warn("missed to pass in variable ".concat(r[1]," for interpolating ").concat(e)),o=""}else"string"==typeof o||a.useRawValueToEscape||(o=m(o));if(e=e.replace(r[0],t.safeValue(o)),t.regex.lastIndex=0,++s>=a.maxReplaces)break}})),e}},{key:"nest",value:function(e,t){var n,i,r=this,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=o({},s);function u(e,t){var n=this.nestingOptionsSeparator;if(e.indexOf(n)<0)return e;var i=e.split(new RegExp("".concat(n,"[ ]*{"))),r="{".concat(i[1]);e=i[0],r=(r=this.interpolate(r,a)).replace(/'/g,'"');try{a=JSON.parse(r),t&&(a=o({},t,a))}catch(t){return this.logger.warn("failed parsing options string in nesting for key ".concat(e),t),"".concat(e).concat(n).concat(r)}return delete a.defaultValue,e}for(a.applyPostProcessor=!1,delete a.defaultValue;n=this.nestingRegexp.exec(e);){var c=[],l=!1;if(n[0].includes(this.formatSeparator)&&!/{.*}/.test(n[1])){var d=n[1].split(this.formatSeparator).map((function(e){return e.trim()}));n[1]=d.shift(),c=d,l=!0}if((i=t(u.call(this,n[1].trim(),a),a))&&n[0]===e&&"string"!=typeof i)return i;"string"!=typeof i&&(i=m(i)),i||(this.logger.warn("missed to resolve ".concat(n[1]," for nesting ").concat(e)),i=""),l&&(i=c.reduce((function(e,t){return r.format(e,t,s.lng,s)}),i.trim())),e=e.replace(n[0],i),this.regexp.lastIndex=0}return e}}]),e}();var q=function(e){function t(e,n,i){var r,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};return Object(s.a)(this,t),r=c(this,l(t).call(this)),T&&v.call(u(r)),r.backend=e,r.store=n,r.services=i,r.languageUtils=i.languageUtils,r.options=o,r.logger=p.create("backendConnector"),r.state={},r.queue=[],r.backend&&r.backend.init&&r.backend.init(i,o.backend,o),r}return f(t,e),Object(a.a)(t,[{key:"queueLoad",value:function(e,t,n,i){var r=this,o=[],s=[],a=[],u=[];return e.forEach((function(e){var i=!0;t.forEach((function(t){var a="".concat(e,"|").concat(t);!n.reload&&r.store.hasResourceBundle(e,t)?r.state[a]=2:r.state[a]<0||(1===r.state[a]?s.indexOf(a)<0&&s.push(a):(r.state[a]=1,i=!1,s.indexOf(a)<0&&s.push(a),o.indexOf(a)<0&&o.push(a),u.indexOf(t)<0&&u.push(t)))})),i||a.push(e)})),(o.length||s.length)&&this.queue.push({pending:s,loaded:{},errors:[],callback:i}),{toLoad:o,pending:s,toLoadLanguages:a,toLoadNamespaces:u}}},{key:"loaded",value:function(e,t,n){var i=e.split("|"),r=i[0],o=i[1];t&&this.emit("failedLoading",r,o,t),n&&this.store.addResourceBundle(r,o,n),this.state[e]=t?-1:2;var s={};this.queue.forEach((function(n){var i,a,u,c,l,d;i=n.loaded,a=o,c=S(i,[r],Object),l=c.obj,d=c.k,l[d]=l[d]||[],u&&(l[d]=l[d].concat(a)),u||l[d].push(a),function(e,t){for(var n=e.indexOf(t);-1!==n;)e.splice(n,1),n=e.indexOf(t)}(n.pending,e),t&&n.errors.push(t),0!==n.pending.length||n.done||(Object.keys(n.loaded).forEach((function(e){s[e]||(s[e]=[]),n.loaded[e].length&&n.loaded[e].forEach((function(t){s[e].indexOf(t)<0&&s[e].push(t)}))})),n.done=!0,n.errors.length?n.callback(n.errors):n.callback())})),this.emit("loaded",s),this.queue=this.queue.filter((function(e){return!e.done}))}},{key:"read",value:function(e,t,n){var i=this,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:350,s=arguments.length>5?arguments[5]:void 0;return e.length?this.backend[n](e,t,(function(a,u){a&&u&&r<5?setTimeout((function(){i.read.call(i,e,t,n,r+1,2*o,s)}),o):s(a,u)})):s(null,{})}},{key:"prepareLoading",value:function(e,t){var n=this,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=arguments.length>3?arguments[3]:void 0;if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),r&&r();"string"==typeof e&&(e=this.languageUtils.toResolveHierarchy(e)),"string"==typeof t&&(t=[t]);var o=this.queueLoad(e,t,i,r);if(!o.toLoad.length)return o.pending.length||r(),null;o.toLoad.forEach((function(e){n.loadOne(e)}))}},{key:"load",value:function(e,t,n){this.prepareLoading(e,t,{},n)}},{key:"reload",value:function(e,t,n){this.prepareLoading(e,t,{reload:!0},n)}},{key:"loadOne",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=e.split("|"),r=i[0],o=i[1];this.read(r,o,"read",void 0,void 0,(function(i,s){i&&t.logger.warn("".concat(n,"loading namespace ").concat(o," for language ").concat(r," failed"),i),!i&&s&&t.logger.log("".concat(n,"loaded namespace ").concat(o," for language ").concat(r),s),t.loaded(e,i,s)}))}},{key:"saveMissing",value:function(e,t,n,i,r){var s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{};this.services.utils&&this.services.utils.hasLoadedNamespace&&!this.services.utils.hasLoadedNamespace(t)?this.logger.warn('did not save key "'.concat(n,'" as the namespace "').concat(t,'" was not yet loaded'),"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!"):null!=n&&""!==n&&(this.backend&&this.backend.create&&this.backend.create(e,t,n,i,null,o({},s,{isUpdate:r})),e&&e[0]&&this.store.addResource(e[0],t,n,i))}}]),t}(v);function U(){return{debug:!1,initImmediate:!0,ns:["translation"],defaultNS:["translation"],fallbackLng:["dev"],fallbackNS:!1,whitelist:!1,nonExplicitWhitelist:!1,supportedLngs:!1,nonExplicitSupportedLngs:!1,load:"all",preload:!1,simplifyPluralSuffix:!0,keySeparator:".",nsSeparator:":",pluralSeparator:"_",contextSeparator:"_",partialBundledLanguages:!1,saveMissing:!1,updateMissing:!1,saveMissingTo:"fallback",saveMissingPlurals:!0,missingKeyHandler:!1,missingInterpolationHandler:!1,postProcess:!1,postProcessPassResolved:!1,returnNull:!0,returnEmptyString:!0,returnObjects:!1,joinArrays:!1,returnedObjectHandler:!1,parseMissingKeyHandler:!1,appendNamespaceToMissingKey:!1,appendNamespaceToCIMode:!1,overloadTranslationOptionHandler:function(e){var t={};if("object"===i(e[1])&&(t=e[1]),"string"==typeof e[1]&&(t.defaultValue=e[1]),"string"==typeof e[2]&&(t.tDescription=e[2]),"object"===i(e[2])||"object"===i(e[3])){var n=e[3]||e[2];Object.keys(n).forEach((function(e){t[e]=n[e]}))}return t},interpolation:{escapeValue:!0,format:function(e,t,n,i){return e},prefix:"{{",suffix:"}}",formatSeparator:",",unescapePrefix:"-",nestingPrefix:"$t(",nestingSuffix:")",nestingOptionsSeparator:",",maxReplaces:1e3,skipOnVariables:!1}}}function F(e){return"string"==typeof e.ns&&(e.ns=[e.ns]),"string"==typeof e.fallbackLng&&(e.fallbackLng=[e.fallbackLng]),"string"==typeof e.fallbackNS&&(e.fallbackNS=[e.fallbackNS]),e.whitelist&&(e.whitelist&&e.whitelist.indexOf("cimode")<0&&(e.whitelist=e.whitelist.concat(["cimode"])),e.supportedLngs=e.whitelist),e.nonExplicitWhitelist&&(e.nonExplicitSupportedLngs=e.nonExplicitWhitelist),e.supportedLngs&&e.supportedLngs.indexOf("cimode")<0&&(e.supportedLngs=e.supportedLngs.concat(["cimode"])),e}function H(){}var z=new(function(e){function t(){var e,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=arguments.length>1?arguments[1]:void 0;if(Object(s.a)(this,t),e=c(this,l(t).call(this)),T&&v.call(u(e)),e.options=F(n),e.services={},e.logger=p,e.modules={external:[]},i&&!e.isInitialized&&!n.isClone){if(!e.options.initImmediate)return e.init(n,i),c(e,u(e));setTimeout((function(){e.init(n,i)}),0)}return e}return f(t,e),Object(a.a)(t,[{key:"init",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;function i(e){return e?"function"==typeof e?new e:e:null}if("function"==typeof t&&(n=t,t={}),t.whitelist&&!t.supportedLngs&&this.logger.deprecate("whitelist",'option "whitelist" will be renamed to "supportedLngs" in the next major - please make sure to rename this option asap.'),t.nonExplicitWhitelist&&!t.nonExplicitSupportedLngs&&this.logger.deprecate("whitelist",'options "nonExplicitWhitelist" will be renamed to "nonExplicitSupportedLngs" in the next major - please make sure to rename this option asap.'),this.options=o({},U(),this.options,F(t)),this.format=this.options.interpolation.format,n||(n=H),!this.options.isClone){this.modules.logger?p.init(i(this.modules.logger),this.options):p.init(null,this.options);var r=new D(this.options);this.store=new x(this.options.resources,this.options);var s=this.services;s.logger=p,s.resourceStore=this.store,s.languageUtils=r,s.pluralResolver=new V(r,{prepend:this.options.pluralSeparator,compatibilityJSON:this.options.compatibilityJSON,simplifyPluralSuffix:this.options.simplifyPluralSuffix}),s.interpolator=new P(this.options),s.utils={hasLoadedNamespace:this.hasLoadedNamespace.bind(this)},s.backendConnector=new q(i(this.modules.backend),s.resourceStore,s,this.options),s.backendConnector.on("*",(function(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];e.emit.apply(e,[t].concat(i))})),this.modules.languageDetector&&(s.languageDetector=i(this.modules.languageDetector),s.languageDetector.init(s,this.options.detection,this.options)),this.modules.i18nFormat&&(s.i18nFormat=i(this.modules.i18nFormat),s.i18nFormat.init&&s.i18nFormat.init(this)),this.translator=new N(this.services,this.options),this.translator.on("*",(function(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];e.emit.apply(e,[t].concat(i))})),this.modules.external.forEach((function(t){t.init&&t.init(e)}))}this.services.languageDetector||this.options.lng||this.logger.warn("init: no languageDetector is used and no lng is defined");var a=["getResource","hasResourceBundle","getResourceBundle","getDataByLanguage"];a.forEach((function(t){e[t]=function(){var n;return(n=e.store)[t].apply(n,arguments)}}));var u=["addResource","addResources","addResourceBundle","removeResourceBundle"];u.forEach((function(t){e[t]=function(){var n;return(n=e.store)[t].apply(n,arguments),e}}));var c=g(),l=function(){e.changeLanguage(e.options.lng,(function(t,i){e.isInitialized=!0,e.options.isClone||e.logger.log("initialized",e.options),e.emit("initialized",e.options),c.resolve(i),n(t,i)}))};return this.options.resources||!this.options.initImmediate?l():setTimeout(l,0),c}},{key:"loadResources",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:H,i=n,r="string"==typeof e?e:this.language;if("function"==typeof e&&(i=e),!this.options.resources||this.options.partialBundledLanguages){if(r&&"cimode"===r.toLowerCase())return i();var o=[],s=function(e){e&&t.services.languageUtils.toResolveHierarchy(e).forEach((function(e){o.indexOf(e)<0&&o.push(e)}))};if(r)s(r);else{var a=this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);a.forEach((function(e){return s(e)}))}this.options.preload&&this.options.preload.forEach((function(e){return s(e)})),this.services.backendConnector.load(o,this.options.ns,i)}else i(null)}},{key:"reloadResources",value:function(e,t,n){var i=g();return e||(e=this.languages),t||(t=this.options.ns),n||(n=H),this.services.backendConnector.reload(e,t,(function(e){i.resolve(),n(e)})),i}},{key:"use",value:function(e){if(!e)throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");if(!e.type)throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");return"backend"===e.type&&(this.modules.backend=e),("logger"===e.type||e.log&&e.warn&&e.error)&&(this.modules.logger=e),"languageDetector"===e.type&&(this.modules.languageDetector=e),"i18nFormat"===e.type&&(this.modules.i18nFormat=e),"postProcessor"===e.type&&I.addPostProcessor(e),"3rdParty"===e.type&&this.modules.external.push(e),this}},{key:"changeLanguage",value:function(e,t){var n=this;this.isLanguageChangingTo=e;var i=g();this.emit("languageChanging",e);var r=function(e){var r="string"==typeof e?e:n.services.languageUtils.getBestMatchFromCodes(e);r&&(n.language||(n.language=r,n.languages=n.services.languageUtils.toResolveHierarchy(r)),n.translator.language||n.translator.changeLanguage(r),n.services.languageDetector&&n.services.languageDetector.cacheUserLanguage(r)),n.loadResources(r,(function(e){!function(e,r){r?(n.language=r,n.languages=n.services.languageUtils.toResolveHierarchy(r),n.translator.changeLanguage(r),n.isLanguageChangingTo=void 0,n.emit("languageChanged",r),n.logger.log("languageChanged",r)):n.isLanguageChangingTo=void 0,i.resolve((function(){return n.t.apply(n,arguments)})),t&&t(e,(function(){return n.t.apply(n,arguments)}))}(e,r)}))};return e||!this.services.languageDetector||this.services.languageDetector.async?!e&&this.services.languageDetector&&this.services.languageDetector.async?this.services.languageDetector.detect(r):r(e):r(this.services.languageDetector.detect()),i}},{key:"getFixedT",value:function(e,t){var n=this,r=function e(t,r){var s;if("object"!==i(r)){for(var a=arguments.length,u=new Array(a>2?a-2:0),c=2;c<a;c++)u[c-2]=arguments[c];s=n.options.overloadTranslationOptionHandler([t,r].concat(u))}else s=o({},r);return s.lng=s.lng||e.lng,s.lngs=s.lngs||e.lngs,s.ns=s.ns||e.ns,n.t(t,s)};return"string"==typeof e?r.lng=e:r.lngs=e,r.ns=t,r}},{key:"t",value:function(){var e;return this.translator&&(e=this.translator).translate.apply(e,arguments)}},{key:"exists",value:function(){var e;return this.translator&&(e=this.translator).exists.apply(e,arguments)}},{key:"setDefaultNamespace",value:function(e){this.options.defaultNS=e}},{key:"hasLoadedNamespace",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!this.isInitialized)return this.logger.warn("hasLoadedNamespace: i18next was not initialized",this.languages),!1;if(!this.languages||!this.languages.length)return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty",this.languages),!1;var i=this.languages[0],r=!!this.options&&this.options.fallbackLng,o=this.languages[this.languages.length-1];if("cimode"===i.toLowerCase())return!0;var s=function(e,n){var i=t.services.backendConnector.state["".concat(e,"|").concat(n)];return-1===i||2===i};if(n.precheck){var a=n.precheck(this,s);if(void 0!==a)return a}return!!this.hasResourceBundle(i,e)||(!this.services.backendConnector.backend||!(!s(i,e)||r&&!s(o,e)))}},{key:"loadNamespaces",value:function(e,t){var n=this,i=g();return this.options.ns?("string"==typeof e&&(e=[e]),e.forEach((function(e){n.options.ns.indexOf(e)<0&&n.options.ns.push(e)})),this.loadResources((function(e){i.resolve(),t&&t(e)})),i):(t&&t(),Promise.resolve())}},{key:"loadLanguages",value:function(e,t){var n=g();"string"==typeof e&&(e=[e]);var i=this.options.preload||[],r=e.filter((function(e){return i.indexOf(e)<0}));return r.length?(this.options.preload=i.concat(r),this.loadResources((function(e){n.resolve(),t&&t(e)})),n):(t&&t(),Promise.resolve())}},{key:"dir",value:function(e){if(e||(e=this.languages&&this.languages.length>0?this.languages[0]:this.language),!e)return"rtl";return["ar","shu","sqr","ssh","xaa","yhd","yud","aao","abh","abv","acm","acq","acw","acx","acy","adf","ads","aeb","aec","afb","ajp","apc","apd","arb","arq","ars","ary","arz","auz","avl","ayh","ayl","ayn","ayp","bbz","pga","he","iw","ps","pbt","pbu","pst","prp","prd","ug","ur","ydd","yds","yih","ji","yi","hbo","men","xmn","fa","jpr","peo","pes","prs","dv","sam"].indexOf(this.services.languageUtils.getLanguagePartFromCode(e))>=0?"rtl":"ltr"}},{key:"createInstance",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0;return new t(e,n)}},{key:"cloneInstance",value:function(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:H,r=o({},this.options,n,{isClone:!0}),s=new t(r),a=["store","services","language"];return a.forEach((function(t){s[t]=e[t]})),s.services=o({},this.services),s.services.utils={hasLoadedNamespace:s.hasLoadedNamespace.bind(s)},s.translator=new N(s.services,s.options),s.translator.on("*",(function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];s.emit.apply(s,[e].concat(n))})),s.init(r,i),s.translator.options=s.options,s.translator.backendConnector.services.utils={hasLoadedNamespace:s.hasLoadedNamespace.bind(s)},s}}]),t}(v));t.default=z}])}));
},{}],46:[function(require,module,exports){
'use strict';

var isIe = require('@braintree/browser-detection/is-ie');
var isIe9 = require('@braintree/browser-detection/is-ie9');

module.exports = {
  isIe: isIe,
  isIe9: isIe9
};

},{"@braintree/browser-detection/is-ie":28,"@braintree/browser-detection/is-ie9":30}],47:[function(require,module,exports){
'use strict';

var BRAINTREE_VERSION = require('./constants').BRAINTREE_VERSION;

var GraphQL = require('./request/graphql');
var request = require('./request');
var isVerifiedDomain = require('../lib/is-verified-domain');
var BraintreeError = require('../lib/braintree-error');
var convertToBraintreeError = require('../lib/convert-to-braintree-error');
var getGatewayConfiguration = require('./get-configuration').getConfiguration;
var createAuthorizationData = require('../lib/create-authorization-data');
var addMetadata = require('../lib/add-metadata');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var once = require('../lib/once');
var deferred = require('../lib/deferred');
var assign = require('../lib/assign').assign;
var analytics = require('../lib/analytics');
var errors = require('./errors');
var VERSION = require('../lib/constants').VERSION;
var GRAPHQL_URLS = require('../lib/constants').GRAPHQL_URLS;
var methods = require('../lib/methods');
var convertMethodsToError = require('../lib/convert-methods-to-error');
var assets = require('../lib/assets');
var FRAUDNET_FNCLS = require('../lib/constants').FRAUDNET_FNCLS;
var FRAUDNET_SOURCE = require('../lib/constants').FRAUDNET_SOURCE;
var FRAUDNET_URL = require('../lib/constants').FRAUDNET_URL;

var cachedClients = {};

/**
 * This object is returned by {@link Client#getConfiguration|getConfiguration}. This information is used extensively by other Braintree modules to properly configure themselves.
 * @typedef {object} Client~configuration
 * @property {object} client The braintree-web/client parameters.
 * @property {string} client.authorization A tokenizationKey or clientToken.
 * @property {object} gatewayConfiguration Gateway-supplied configuration.
 * @property {object} analyticsMetadata Analytics-specific data.
 * @property {string} analyticsMetadata.sessionId Uniquely identifies a browsing session.
 * @property {string} analyticsMetadata.sdkVersion The braintree.js version.
 * @property {string} analyticsMetadata.merchantAppId Identifies the merchant's web app.
 */

/**
 * @class
 * @param {Client~configuration} configuration Options
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/client.create|braintree.client.create} instead.</strong>
 * @classdesc This class is required by many other Braintree components. It serves as the base API layer that communicates with our servers. It is also capable of being used to formulate direct calls to our servers, such as direct credit card tokenization. See {@link Client#request}.
 */
function Client(configuration) {
  var configurationJSON, gatewayConfiguration;

  configuration = configuration || {};

  configurationJSON = JSON.stringify(configuration);
  gatewayConfiguration = configuration.gatewayConfiguration;

  if (!gatewayConfiguration) {
    throw new BraintreeError(errors.CLIENT_MISSING_GATEWAY_CONFIGURATION);
  }

  [
    'assetsUrl',
    'clientApiUrl',
    'configUrl'
  ].forEach(function (property) {
    if (property in gatewayConfiguration && !isVerifiedDomain(gatewayConfiguration[property])) {
      throw new BraintreeError({
        type: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.type,
        code: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.code,
        message: property + ' property is on an invalid domain.'
      });
    }
  });

  /**
   * Returns a copy of the configuration values.
   * @public
   * @returns {Client~configuration} configuration
   */
  this.getConfiguration = function () {
    return JSON.parse(configurationJSON);
  };

  this._request = request;
  this._configuration = this.getConfiguration();

  this._clientApiBaseUrl = gatewayConfiguration.clientApiUrl + '/v1/';

  if (gatewayConfiguration.graphQL) {
    this._graphQL = new GraphQL({
      graphQL: gatewayConfiguration.graphQL
    });
  }
}

Client.initialize = function (options) {
  var clientInstance, authData;
  var promise = cachedClients[options.authorization];

  if (promise) {
    analytics.sendEvent(promise, 'custom.client.load.cached');

    return promise;
  }

  try {
    authData = createAuthorizationData(options.authorization);
  } catch (err) {
    return Promise.reject(new BraintreeError(errors.CLIENT_INVALID_AUTHORIZATION));
  }

  promise = getGatewayConfiguration(authData).then(function (configuration) {
    if (options.debug) {
      configuration.isDebug = true;
    }

    configuration.authorization = options.authorization;

    clientInstance = new Client(configuration);

    return clientInstance;
  });

  cachedClients[options.authorization] = promise;

  analytics.sendEvent(promise, 'custom.client.load.initialized');

  return promise.then(function (client) {
    analytics.sendEvent(clientInstance, 'custom.client.load.succeeded');

    return client;
  }).catch(function (err) {
    delete cachedClients[options.authorization];

    return Promise.reject(err);
  });
};

// Primarily used for testing the client initalization call
Client.clearCache = function () {
  cachedClients = {};
};

Client.prototype._findOrCreateFraudnetJSON = function (clientMetadataId) {
  var el = document.querySelector('script[fncls="' + FRAUDNET_FNCLS + '"]');
  var config, additionalData, authorizationFingerprint, parameters;

  if (!el) {
    el = document.body.appendChild(document.createElement('script'));
    el.type = 'application/json';
    el.setAttribute('fncls', FRAUDNET_FNCLS);
  }

  config = this.getConfiguration();
  additionalData = {
    rda_tenant: 'bt_card', // eslint-disable-line camelcase
    mid: config.gatewayConfiguration.merchantId
  };
  authorizationFingerprint = config.authorizationFingerprint;

  if (authorizationFingerprint) {
    authorizationFingerprint.split('&').forEach(function (pieces) {
      var component = pieces.split('=');

      if (component[0] === 'customer_id' && component.length > 1) {
        additionalData.cid = component[1];
      }
    });
  }

  parameters = {
    f: clientMetadataId.substr(0, 32),
    fp: additionalData,
    bu: false,
    s: FRAUDNET_SOURCE
  };
  el.text = JSON.stringify(parameters);
};

/**
 * Used by other modules to formulate all network requests to the Braintree gateway. It is also capable of being used directly from your own form to tokenize credit card information. However, be sure to satisfy PCI compliance if you use direct card tokenization.
 * @public
 * @param {object} options Request options:
 * @param {string} options.method HTTP method, e.g. "get" or "post".
 * @param {string} options.endpoint Endpoint path, e.g. "payment_methods".
 * @param {object} options.data Data to send with the request.
 * @param {number} [options.timeout=60000] Set a timeout (in milliseconds) for the request.
 * @param {callback} [callback] The second argument, <code>data</code>, is the returned server data.
 * @example
 * <caption>Direct Credit Card Tokenization</caption>
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   var form = document.getElementById('my-form-id');
 *   var data = {
 *     creditCard: {
 *       number: form['cc-number'].value,
 *       cvv: form['cc-cvv'].value,
 *       expirationDate: form['cc-expiration-date'].value,
 *       billingAddress: {
 *         postalCode: form['cc-postal-code'].value
 *       },
 *       options: {
 *         validate: false
 *       }
 *     }
 *   };
 *
 *   // Warning: For a merchant to be eligible for the easiest level of PCI compliance (SAQ A),
 *   // payment fields cannot be hosted on your checkout page.
 *   // For an alternative to the following, use Hosted Fields.
 *   clientInstance.request({
 *     endpoint: 'payment_methods/credit_cards',
 *     method: 'post',
 *     data: data
 *   }, function (requestErr, response) {
 *     // More detailed example of handling API errors: https://codepen.io/braintree/pen/MbwjdM
 *     if (requestErr) { throw new Error(requestErr); }
 *
 *     console.log('Got nonce:', response.creditCards[0].nonce);
 *   });
 * });
 * @example
 * <caption>Tokenizing Fields for AVS Checks</caption>
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   var form = document.getElementById('my-form-id');
 *   var data = {
 *     creditCard: {
 *       number: form['cc-number'].value,
 *       cvv: form['cc-cvv'].value,
 *       expirationDate: form['cc-date'].value,
 *       // The billing address can be checked with AVS rules.
 *       // See: https://articles.braintreepayments.com/support/guides/fraud-tools/basic/avs-cvv-rules
 *       billingAddress: {
 *         postalCode: form['cc-postal-code'].value,
 *         streetAddress: form['cc-street-address'].value,
 *         countryName: form['cc-country-name'].value,
 *         countryCodeAlpha2: form['cc-country-alpha2'].value,
 *         countryCodeAlpha3: form['cc-country-alpha3'].value,
 *         countryCodeNumeric: form['cc-country-numeric'].value
 *       },
 *       options: {
 *         validate: false
 *       }
 *     }
 *   };
 *
 *   // Warning: For a merchant to be eligible for the easiest level of PCI compliance (SAQ A),
 *   // payment fields cannot be hosted on your checkout page.
 *   // For an alternative to the following, use Hosted Fields.
 *   clientInstance.request({
 *     endpoint: 'payment_methods/credit_cards',
 *     method: 'post',
 *     data: data
 *   }, function (requestErr, response) {
 *     // More detailed example of handling API errors: https://codepen.io/braintree/pen/MbwjdM
 *     if (requestErr) { throw new Error(requestErr); }
 *
 *     console.log('Got nonce:', response.creditCards[0].nonce);
 *   });
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
Client.prototype.request = function (options, callback) {
  var self = this; // eslint-disable-line no-invalid-this
  var requestPromise = new Promise(function (resolve, reject) {
    var optionName, api, baseUrl, requestOptions;
    var shouldCollectData = Boolean(options.endpoint === 'payment_methods/credit_cards' && self.getConfiguration().gatewayConfiguration.creditCards.collectDeviceData);

    if (options.api !== 'graphQLApi') {
      if (!options.method) {
        optionName = 'options.method';
      } else if (!options.endpoint) {
        optionName = 'options.endpoint';
      }
    }

    if (optionName) {
      throw new BraintreeError({
        type: errors.CLIENT_OPTION_REQUIRED.type,
        code: errors.CLIENT_OPTION_REQUIRED.code,
        message: optionName + ' is required when making a request.'
      });
    }

    if ('api' in options) {
      api = options.api;
    } else {
      api = 'clientApi';
    }

    requestOptions = {
      method: options.method,
      graphQL: self._graphQL,
      timeout: options.timeout,
      metadata: self._configuration.analyticsMetadata
    };

    if (api === 'clientApi') {
      baseUrl = self._clientApiBaseUrl;

      requestOptions.data = addMetadata(self._configuration, options.data);
    } else if (api === 'graphQLApi') {
      baseUrl = GRAPHQL_URLS[self._configuration.gatewayConfiguration.environment];
      options.endpoint = '';
      requestOptions.method = 'post';
      requestOptions.data = assign({
        clientSdkMetadata: {
          platform: self._configuration.analyticsMetadata.platform,
          source: self._configuration.analyticsMetadata.source,
          integration: self._configuration.analyticsMetadata.integration,
          sessionId: self._configuration.analyticsMetadata.sessionId,
          version: VERSION
        }
      }, options.data);

      requestOptions.headers = getAuthorizationHeadersForGraphQL(self._configuration);
    } else {
      throw new BraintreeError({
        type: errors.CLIENT_OPTION_INVALID.type,
        code: errors.CLIENT_OPTION_INVALID.code,
        message: 'options.api is invalid.'
      });
    }

    requestOptions.url = baseUrl + options.endpoint;
    requestOptions.sendAnalyticsEvent = function (kind) {
      analytics.sendEvent(self, kind);
    };

    self._request(requestOptions, function (err, data, status) {
      var resolvedData, requestError;

      requestError = formatRequestError(status, err);

      if (requestError) {
        reject(requestError);

        return;
      }

      if (api === 'graphQLApi' && data.errors) {
        reject(convertToBraintreeError(data.errors, {
          type: errors.CLIENT_GRAPHQL_REQUEST_ERROR.type,
          code: errors.CLIENT_GRAPHQL_REQUEST_ERROR.code,
          message: errors.CLIENT_GRAPHQL_REQUEST_ERROR.message
        }));

        return;
      }

      resolvedData = assign({_httpStatus: status}, data);

      if (shouldCollectData && resolvedData.creditCards && resolvedData.creditCards.length > 0) {
        self._findOrCreateFraudnetJSON(resolvedData.creditCards[0].nonce);

        assets.loadScript({
          src: FRAUDNET_URL,
          forceScriptReload: true
        });
      }
      resolve(resolvedData);
    });
  });

  if (typeof callback === 'function') {
    callback = once(deferred(callback));

    requestPromise.then(function (response) {
      callback(null, response, response._httpStatus);
    }).catch(function (err) {
      var status = err && err.details && err.details.httpStatus;

      callback(err, null, status);
    });

    return;
  }

  return requestPromise; // eslint-disable-line consistent-return
};

function formatRequestError(status, err) { // eslint-disable-line consistent-return
  var requestError;

  if (status === -1) {
    requestError = new BraintreeError(errors.CLIENT_REQUEST_TIMEOUT);
  } else if (status === 401) {
    requestError = new BraintreeError(errors.CLIENT_AUTHORIZATION_INVALID);
  } else if (status === 403) {
    requestError = new BraintreeError(errors.CLIENT_AUTHORIZATION_INSUFFICIENT);
  } else if (status === 429) {
    requestError = new BraintreeError(errors.CLIENT_RATE_LIMITED);
  } else if (status >= 500) {
    requestError = new BraintreeError(errors.CLIENT_GATEWAY_NETWORK);
  } else if (status < 200 || status >= 400) {
    requestError = convertToBraintreeError(err, {
      type: errors.CLIENT_REQUEST_ERROR.type,
      code: errors.CLIENT_REQUEST_ERROR.code,
      message: errors.CLIENT_REQUEST_ERROR.message
    });
  }

  if (requestError) {
    requestError.details = requestError.details || {};
    requestError.details.httpStatus = status;

    return requestError;
  }
}

Client.prototype.toJSON = function () {
  return this.getConfiguration();
};

/**
 * Returns the Client version.
 * @public
 * @returns {String} The created client's version.
 * @example
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   console.log(clientInstance.getVersion()); // Ex: 1.0.0
 * });
 * @returns {void}
 */
Client.prototype.getVersion = function () {
  return VERSION;
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/client.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * clientInstance.teardown();
 * @example <caption>With callback</caption>
 * clientInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
Client.prototype.teardown = wrapPromise(function () {
  var self = this; // eslint-disable-line no-invalid-this

  delete cachedClients[self.getConfiguration().authorization];
  convertMethodsToError(self, methods(Client.prototype));

  return Promise.resolve();
});

function getAuthorizationHeadersForGraphQL(configuration) {
  var token = configuration.authorizationFingerprint || configuration.authorization;

  return {
    Authorization: 'Bearer ' + token,
    'Braintree-Version': BRAINTREE_VERSION
  };
}

module.exports = Client;

},{"../lib/add-metadata":81,"../lib/analytics":82,"../lib/assets":83,"../lib/assign":84,"../lib/braintree-error":87,"../lib/constants":88,"../lib/convert-methods-to-error":89,"../lib/convert-to-braintree-error":90,"../lib/create-authorization-data":92,"../lib/deferred":94,"../lib/is-verified-domain":100,"../lib/methods":102,"../lib/once":103,"../lib/promise":104,"./constants":48,"./errors":49,"./get-configuration":50,"./request":62,"./request/graphql":60,"@braintree/wrap-promise":44}],48:[function(require,module,exports){
'use strict';

module.exports = {
  BRAINTREE_VERSION: '2018-05-10'
};

},{}],49:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Client - Internal Error Codes
 * @ignore
 * @description These codes should never be experienced by the merchant directly.
 * @property {MERCHANT} CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN An error to prevent client creation for domains that are not allowed in the JS.
 * @property {INTERNAL} CLIENT_MISSING_GATEWAY_CONFIGURATION Occurs when the client is created without a gateway configuration. Should never happen.
 */

/**
 * @name BraintreeError.Client - Create Error Codes
 * @description Errors that may occur when [creating the client](./module-braintree-web_client.html#.create)
 * @property {MERCHANT} CLIENT_INVALID_AUTHORIZATION Occurs when client token cannot be parsed.
 */

/**
 * @name BraintreeError.Client - Request Error Codes
 * @description Errors that may occur when [using the request method](./Client.html#request)
 * @property {MERCHANT} CLIENT_OPTION_REQUIRED An option required in the request method was not provided. Usually `options.method` or `options.endpoint`
 * @property {MERCHANT} CLIENT_OPTION_INVALID The request option provided is invalid.
 * @property {MERCHANT} CLIENT_GATEWAY_NETWORK The Braintree gateway could not be contacted.
 * @property {NETWORK} CLIENT_REQUEST_TIMEOUT The request took too long to complete and timed out.
 * @property {NETWORK} CLIENT_REQUEST_ERROR The response from a request had status 400 or greater.
 * @property {NETWORK} CLIENT_GRAPHQL_REQUEST_ERROR The response from a request to GraphQL contained an error.
 * @property {MERCHANT} CLIENT_RATE_LIMITED The response from a request had a status of 429, indicating rate limiting.
 * @property {MERCHANT} CLIENT_AUTHORIZATION_INSUFFICIENT The user associated with the client token or tokenization key does not have permissions to make the request.
 * @property {MERCHANT} CLIENT_AUTHORIZATION_INVALID The provided authorization could not be found. Either the client token has expired and a new client token must be generated or the tokenization key used is set to be inactive or has been deleted.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN'
  },
  CLIENT_OPTION_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_OPTION_REQUIRED'
  },
  CLIENT_OPTION_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_OPTION_INVALID'
  },
  CLIENT_MISSING_GATEWAY_CONFIGURATION: {
    type: BraintreeError.types.INTERNAL,
    code: 'CLIENT_MISSING_GATEWAY_CONFIGURATION',
    message: 'Missing gatewayConfiguration.'
  },
  CLIENT_INVALID_AUTHORIZATION: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_INVALID_AUTHORIZATION',
    message: 'Authorization is invalid. Make sure your client token or tokenization key is valid.'
  },
  CLIENT_GATEWAY_NETWORK: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_GATEWAY_NETWORK',
    message: 'Cannot contact the gateway at this time.'
  },
  CLIENT_REQUEST_TIMEOUT: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_REQUEST_TIMEOUT',
    message: 'Request timed out waiting for a reply.'
  },
  CLIENT_REQUEST_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_REQUEST_ERROR',
    message: 'There was a problem with your request.'
  },
  CLIENT_GRAPHQL_REQUEST_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_GRAPHQL_REQUEST_ERROR',
    message: 'There was a problem with your request.'
  },
  CLIENT_RATE_LIMITED: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_RATE_LIMITED',
    message: 'You are being rate-limited; please try again in a few minutes.'
  },
  CLIENT_AUTHORIZATION_INSUFFICIENT: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_AUTHORIZATION_INSUFFICIENT',
    message: 'The authorization used has insufficient privileges.'
  },
  CLIENT_AUTHORIZATION_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_AUTHORIZATION_INVALID',
    message: 'Either the client token has expired and a new one should be generated or the tokenization key has been deactivated or deleted.'
  }
};

},{"../lib/braintree-error":87}],50:[function(require,module,exports){
'use strict';

var BraintreeError = require('../lib/braintree-error');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var request = require('./request');
var uuid = require('@braintree/uuid');
var constants = require('../lib/constants');
var errors = require('./errors');
var GraphQL = require('./request/graphql');
var GRAPHQL_URLS = require('../lib/constants').GRAPHQL_URLS;
var isDateStringBeforeOrOn = require('../lib/is-date-string-before-or-on');

var BRAINTREE_VERSION = require('./constants').BRAINTREE_VERSION;

function getConfiguration(authData) {
  return new Promise(function (resolve, reject) {
    var configuration, attrs, configUrl, reqOptions;
    var sessionId = uuid();
    var analyticsMetadata = {
      merchantAppId: window.location.host,
      platform: constants.PLATFORM,
      sdkVersion: constants.VERSION,
      source: constants.SOURCE,
      integration: constants.INTEGRATION,
      integrationType: constants.INTEGRATION,
      sessionId: sessionId
    };

    attrs = authData.attrs;
    configUrl = authData.configUrl;

    attrs._meta = analyticsMetadata;
    attrs.braintreeLibraryVersion = constants.BRAINTREE_LIBRARY_VERSION;
    attrs.configVersion = '3';

    reqOptions = {
      url: configUrl,
      method: 'GET',
      data: attrs
    };

    if (attrs.authorizationFingerprint && authData.graphQL) {
      if (isDateStringBeforeOrOn(authData.graphQL.date, BRAINTREE_VERSION)) {
        reqOptions.graphQL = new GraphQL({
          graphQL: {
            url: authData.graphQL.url,
            features: ['configuration']
          }
        });
      }

      reqOptions.metadata = analyticsMetadata;
    } else if (attrs.tokenizationKey) {
      reqOptions.graphQL = new GraphQL({
        graphQL: {
          url: GRAPHQL_URLS[authData.environment],
          features: ['configuration']
        }
      });

      reqOptions.metadata = analyticsMetadata;
    }

    // NEXT_MAJOR_VERSION
    // there are various issues with the config endpoint where the values returned
    // do not match the values from the merchant account id passed into a client token
    // we need to update the configuration request endpoint to be able to pass the
    // correct values. The following ones are incorrect
    // * applePayWeb - definitely supportedNetworks, which compiles all the card
    //    networks from all the merchant accounts instead of providing just the
    //    ones from the specified one. The same is probably true for ios apple pay
    //    Also the merchantidentifier
    // NEXT_MAJOR_VERSION Allow passing in merchant account id when creating the component
    // to fetch the config for that merchant account id (particularly helpful when using
    // a tokenization key for authorization)
    request(reqOptions, function (err, response, status) {
      var errorTemplate;

      if (err) {
        if (status === 403) {
          errorTemplate = errors.CLIENT_AUTHORIZATION_INSUFFICIENT;
        } else if (status === 401) {
          errorTemplate = errors.CLIENT_AUTHORIZATION_INVALID;
        } else {
          errorTemplate = errors.CLIENT_GATEWAY_NETWORK;
        }

        reject(new BraintreeError({
          type: errorTemplate.type,
          code: errorTemplate.code,
          message: errorTemplate.message,
          details: {
            originalError: err
          }
        }));

        return;
      }

      configuration = {
        authorizationType: attrs.tokenizationKey ? 'TOKENIZATION_KEY' : 'CLIENT_TOKEN',
        authorizationFingerprint: attrs.authorizationFingerprint,
        analyticsMetadata: analyticsMetadata,
        gatewayConfiguration: response
      };

      resolve(configuration);
    });
  });
}

module.exports = {
  getConfiguration: wrapPromise(getConfiguration)
};

},{"../lib/braintree-error":87,"../lib/constants":88,"../lib/is-date-string-before-or-on":99,"../lib/promise":104,"./constants":48,"./errors":49,"./request":62,"./request/graphql":60,"@braintree/uuid":40,"@braintree/wrap-promise":44}],51:[function(require,module,exports){
'use strict';

var BraintreeError = require('../lib/braintree-error');
var Client = require('./client');
var VERSION = "3.78.3";
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var sharedErrors = require('../lib/errors');

/** @module braintree-web/client */

/**
 * @function create
 * @description This function is the entry point for the <code>braintree.client</code> module. It is used for creating {@link Client} instances that service communication to Braintree servers.
 * @param {object} options Object containing all {@link Client} options:
 * @param {string} options.authorization A tokenizationKey or clientToken.
 * @param {callback} [callback] The second argument, <code>data</code>, is the {@link Client} instance.
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 * @example
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   if (createErr) {
 *     if (createErr.code === 'CLIENT_AUTHORIZATION_INVALID') {
 *       // either the client token has expired, and a new one should be generated
 *       // or the tokenization key was deactivated or deleted
 *     } else {
 *       console.log('something went wrong creating the client instance', createErr);
 *     }
 *     return;
 *   }
 *
 *  // set up other components
 * });
 * @static
 */
function create(options) {
  if (!options.authorization) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.authorization is required when instantiating a client.'
    }));
  }

  return Client.initialize(options);
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/braintree-error":87,"../lib/errors":97,"../lib/promise":104,"./client":47,"@braintree/wrap-promise":44}],52:[function(require,module,exports){
'use strict';

var querystring = require('../../lib/querystring');
var assign = require('../../lib/assign').assign;
var prepBody = require('./prep-body');
var parseBody = require('./parse-body');
var xhr = require('./xhr');
var isXHRAvailable = xhr.isAvailable;
var GraphQLRequest = require('./graphql/request');
var DefaultRequest = require('./default-request');

var MAX_TCP_RETRYCOUNT = 1;
var TCP_PRECONNECT_BUG_STATUS_CODE = 408;

function requestShouldRetry(status) {
  return !status || status === TCP_PRECONNECT_BUG_STATUS_CODE;
}

function graphQLRequestShouldRetryWithClientApi(body) {
  var errorClass = !body.data && body.errors &&
      body.errors[0] &&
      body.errors[0].extensions &&
      body.errors[0].extensions.errorClass;

  return errorClass === 'UNKNOWN' || errorClass === 'INTERNAL';
}

function _requestWithRetry(options, tcpRetryCount, cb) {
  var status, resBody, ajaxRequest, body, method, headers, parsedBody;
  var url = options.url;
  var graphQL = options.graphQL;
  var timeout = options.timeout;
  var req = xhr.getRequestObject();
  var callback = cb;
  var isGraphQLRequest = Boolean(graphQL && graphQL.isGraphQLRequest(url, options.data));

  options.headers = assign({'Content-Type': 'application/json'}, options.headers);

  if (isGraphQLRequest) {
    ajaxRequest = new GraphQLRequest(options);
  } else {
    ajaxRequest = new DefaultRequest(options);
  }

  url = ajaxRequest.getUrl();
  body = ajaxRequest.getBody();
  method = ajaxRequest.getMethod();
  headers = ajaxRequest.getHeaders();

  if (method === 'GET') {
    url = querystring.queryify(url, body);
    body = null;
  }

  if (isXHRAvailable) {
    req.onreadystatechange = function () {
      if (req.readyState !== 4) { return; }

      if (req.status === 0 && isGraphQLRequest) {
        // If a merchant experiences a connection
        // issue to the GraphQL endpoint (possibly
        // due to a Content Security Policy), retry
        // the request against the old client API.
        delete options.graphQL;
        _requestWithRetry(options, tcpRetryCount, cb);

        return;
      }

      parsedBody = parseBody(req.responseText);
      resBody = ajaxRequest.adaptResponseBody(parsedBody);
      status = ajaxRequest.determineStatus(req.status, parsedBody);

      if (status >= 400 || status < 200) {
        if (isGraphQLRequest && graphQLRequestShouldRetryWithClientApi(parsedBody)) {
          delete options.graphQL;
          _requestWithRetry(options, tcpRetryCount, cb);

          return;
        }

        if (tcpRetryCount < MAX_TCP_RETRYCOUNT && requestShouldRetry(status)) {
          tcpRetryCount++;
          _requestWithRetry(options, tcpRetryCount, cb);

          return;
        }
        callback(resBody || 'error', null, status || 500);
      } else {
        callback(null, resBody, status);
      }
    };
  } else {
    if (options.headers) {
      url = querystring.queryify(url, headers);
    }

    req.onload = function () {
      callback(null, parseBody(req.responseText), req.status);
    };

    req.onerror = function () {
      // XDomainRequest does not report a body or status for errors, so
      // hardcode to 'error' and 500, respectively
      callback('error', null, 500);
    };

    // This must remain for IE9 to work
    req.onprogress = function () {};

    req.ontimeout = function () {
      callback('timeout', null, -1);
    };
  }

  try {
    req.open(method, url, true);
  } catch (requestOpenError) {
    // If a merchant has a Content Security Policy and they have
    // not allowed our endpoints, some browsers may
    // synchronously throw an error. If it is not a GraphQL
    // request, we throw the error. If it is a GraphQL request
    // we remove the GraphQL option and try the request against
    // the old client API.
    if (!isGraphQLRequest) {
      throw requestOpenError;
    }

    delete options.graphQL;

    _requestWithRetry(options, tcpRetryCount, cb);

    return;
  }

  req.timeout = timeout;

  if (isXHRAvailable) {
    Object.keys(headers).forEach(function (headerKey) {
      req.setRequestHeader(headerKey, headers[headerKey]);
    });
  }

  try {
    req.send(prepBody(method, body));
  } catch (e) { /* ignored */ }
}

function request(options, cb) {
  _requestWithRetry(options, 0, cb);
}

module.exports = {
  request: request
};

},{"../../lib/assign":84,"../../lib/querystring":105,"./default-request":53,"./graphql/request":61,"./parse-body":65,"./prep-body":66,"./xhr":67}],53:[function(require,module,exports){
'use strict';

function DefaultRequest(options) {
  this._url = options.url;
  this._data = options.data;
  this._method = options.method;
  this._headers = options.headers;
}

DefaultRequest.prototype.getUrl = function () {
  return this._url;
};

DefaultRequest.prototype.getBody = function () {
  return this._data;
};

DefaultRequest.prototype.getMethod = function () {
  return this._method;
};

DefaultRequest.prototype.getHeaders = function () {
  return this._headers;
};

DefaultRequest.prototype.adaptResponseBody = function (parsedBody) {
  return parsedBody;
};

DefaultRequest.prototype.determineStatus = function (status) {
  return status;
};

module.exports = DefaultRequest;

},{}],54:[function(require,module,exports){
'use strict';

module.exports = function getUserAgent() {
  return window.navigator.userAgent;
};

},{}],55:[function(require,module,exports){
'use strict';

var errorResponseAdapter = require('./error');
var assign = require('../../../../lib/assign').assign;

/* eslint-disable camelcase */
var cardTypeTransforms = {
  creditCard: {
    AMERICAN_EXPRESS: 'American Express',
    DISCOVER: 'Discover',
    INTERNATIONAL_MAESTRO: 'Maestro',
    JCB: 'JCB',
    MASTERCARD: 'MasterCard',
    SOLO: 'Solo',
    UK_MAESTRO: 'UK Maestro',
    UNION_PAY: 'UnionPay',
    VISA: 'Visa'
  },
  applePayWeb: {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex',
    INTERNATIONAL_MAESTRO: 'maestro',
    ELO: 'elo'
  },
  visaCheckout: {
    VISA: 'Visa',
    MASTERCARD: 'MasterCard',
    DISCOVER: 'Discover',
    AMERICAN_EXPRESS: 'American Express'
  },
  googlePay: {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex',
    ELO: 'elo'
  },
  masterpass: {
    VISA: 'visa',
    MASTERCARD: 'master',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex',
    DINERS: 'diners',
    INTERNATIONAL_MAESTRO: 'maestro',
    JCB: 'jcb'
  }
};
/* eslint-enable camelcase */

function configurationResponseAdapter(responseBody, ctx) {
  var adaptedResponse;

  if (responseBody.data && !responseBody.errors) {
    adaptedResponse = adaptConfigurationResponseBody(responseBody, ctx);
  } else {
    adaptedResponse = errorResponseAdapter(responseBody);
  }

  return adaptedResponse;
}

function adaptConfigurationResponseBody(body, ctx) {
  var configuration = body.data.clientConfiguration;
  var response;

  response = {
    environment: configuration.environment.toLowerCase(),
    clientApiUrl: configuration.clientApiUrl,
    assetsUrl: configuration.assetsUrl,
    analytics: {
      url: configuration.analyticsUrl
    },
    merchantId: configuration.merchantId,
    venmo: 'off'
  };

  if (configuration.supportedFeatures) {
    response.graphQL = {
      url: ctx._graphQL._config.url,
      features: configuration.supportedFeatures.map(function (feature) {
        return feature.toLowerCase();
      })
    };
  }

  if (configuration.braintreeApi) {
    response.braintreeApi = configuration.braintreeApi;
  }

  if (configuration.applePayWeb) {
    response.applePayWeb = configuration.applePayWeb;
    response.applePayWeb.supportedNetworks = mapCardTypes(configuration.applePayWeb.supportedCardBrands, cardTypeTransforms.applePayWeb);

    delete response.applePayWeb.supportedCardBrands;
  }

  if (configuration.ideal) {
    response.ideal = configuration.ideal;
  }

  if (configuration.kount) {
    response.kount = {
      kountMerchantId: configuration.kount.merchantId
    };
  }

  if (configuration.creditCard) {
    response.challenges = configuration.creditCard.challenges.map(function (challenge) {
      return challenge.toLowerCase();
    });

    response.creditCards = {
      supportedCardTypes: mapCardTypes(configuration.creditCard.supportedCardBrands, cardTypeTransforms.creditCard)
    };
    response.threeDSecureEnabled = configuration.creditCard.threeDSecureEnabled;
    response.threeDSecure = configuration.creditCard.threeDSecure;
  } else {
    response.challenges = [];
    response.creditCards = {
      supportedCardTypes: []
    };
    response.threeDSecureEnabled = false;
  }

  if (configuration.googlePay) {
    response.androidPay = {
      displayName: configuration.googlePay.displayName,
      enabled: true,
      environment: configuration.googlePay.environment.toLowerCase(),
      googleAuthorizationFingerprint: configuration.googlePay.googleAuthorization,
      paypalClientId: configuration.googlePay.paypalClientId,
      supportedNetworks: mapCardTypes(configuration.googlePay.supportedCardBrands, cardTypeTransforms.googlePay)
    };
  }

  if (configuration.venmo) {
    response.payWithVenmo = {
      merchantId: configuration.venmo.merchantId,
      accessToken: configuration.venmo.accessToken,
      environment: configuration.venmo.environment.toLowerCase()
    };
  }

  if (configuration.paypal) {
    response.paypalEnabled = true;
    response.paypal = assign({}, configuration.paypal);
    response.paypal.currencyIsoCode = response.paypal.currencyCode;
    response.paypal.environment = response.paypal.environment.toLowerCase();

    delete response.paypal.currencyCode;
  } else {
    response.paypalEnabled = false;
  }

  if (configuration.unionPay) {
    response.unionPay = {
      enabled: true,
      merchantAccountId: configuration.unionPay.merchantAccountId
    };
  }

  if (configuration.visaCheckout) {
    response.visaCheckout = {
      apikey: configuration.visaCheckout.apiKey,
      externalClientId: configuration.visaCheckout.externalClientId,
      supportedCardTypes: mapCardTypes(configuration.visaCheckout.supportedCardBrands, cardTypeTransforms.visaCheckout)
    };
  }

  if (configuration.masterpass) {
    response.masterpass = {
      merchantCheckoutId: configuration.masterpass.merchantCheckoutId,
      supportedNetworks: mapCardTypes(configuration.masterpass.supportedCardBrands, cardTypeTransforms.masterpass)
    };
  }

  if (configuration.usBankAccount) {
    response.usBankAccount = {
      routeId: configuration.usBankAccount.routeId,
      plaid: {
        publicKey: configuration.usBankAccount.plaidPublicKey
      }
    };
  }

  return response;
}

function mapCardTypes(cardTypes, cardTypeTransformMap) {
  return cardTypes.reduce(function (acc, type) {
    if (cardTypeTransformMap.hasOwnProperty(type)) {
      return acc.concat(cardTypeTransformMap[type]);
    }

    return acc;
  }, []);
}

module.exports = configurationResponseAdapter;

},{"../../../../lib/assign":84,"./error":57}],56:[function(require,module,exports){
'use strict';

var errorResponseAdapter = require('./error');

var CARD_BRAND_MAP = {
  /* eslint-disable camelcase */
  AMERICAN_EXPRESS: 'American Express',
  DINERS: 'Discover',
  DISCOVER: 'Discover',
  INTERNATIONAL_MAESTRO: 'Maestro',
  JCB: 'JCB',
  MASTERCARD: 'MasterCard',
  UK_MAESTRO: 'Maestro',
  UNION_PAY: 'Union Pay',
  VISA: 'Visa'
  /* eslint-enable camelcase */
};

var BIN_DATA_MAP = {
  YES: 'Yes',
  NO: 'No',
  UNKNOWN: 'Unknown'
};

var AUTHENTICATION_INSIGHT_MAP = {
  PSDTWO: 'psd2'
};

function creditCardTokenizationResponseAdapter(responseBody) {
  var adaptedResponse;

  if (responseBody.data && !responseBody.errors) {
    adaptedResponse = adaptTokenizeCreditCardResponseBody(responseBody);
  } else {
    adaptedResponse = errorResponseAdapter(responseBody);
  }

  return adaptedResponse;
}

function adaptTokenizeCreditCardResponseBody(body) {
  var data = body.data.tokenizeCreditCard;
  var creditCard = data.creditCard;
  var lastTwo = creditCard.last4 ? creditCard.last4.substr(2, 4) : '';
  var binData = creditCard.binData;
  var response, regulationEnvironment;

  if (binData) {
    ['commercial', 'debit', 'durbinRegulated', 'healthcare', 'payroll', 'prepaid'].forEach(function (key) {
      if (binData[key]) {
        binData[key] = BIN_DATA_MAP[binData[key]];
      } else {
        binData[key] = 'Unknown';
      }
    });

    ['issuingBank', 'countryOfIssuance', 'productId'].forEach(function (key) {
      if (!binData[key]) { binData[key] = 'Unknown'; }
    });
  }

  response = {
    creditCards: [
      {
        binData: binData,
        consumed: false,
        description: lastTwo ? 'ending in ' + lastTwo : '',
        nonce: data.token,
        details: {
          cardholderName: creditCard.cardholderName,
          expirationMonth: creditCard.expirationMonth,
          expirationYear: creditCard.expirationYear,
          bin: creditCard.bin || '',
          cardType: CARD_BRAND_MAP[creditCard.brandCode] || 'Unknown',
          lastFour: creditCard.last4 || '',
          lastTwo: lastTwo
        },
        type: 'CreditCard',
        threeDSecureInfo: null
      }
    ]
  };

  if (data.authenticationInsight) {
    regulationEnvironment = data.authenticationInsight.customerAuthenticationRegulationEnvironment;
    response.creditCards[0].authenticationInsight = {
      regulationEnvironment: AUTHENTICATION_INSIGHT_MAP[regulationEnvironment] || regulationEnvironment.toLowerCase()
    };
  }

  return response;
}

module.exports = creditCardTokenizationResponseAdapter;

},{"./error":57}],57:[function(require,module,exports){
'use strict';

function errorResponseAdapter(responseBody) {
  var response;
  var errorClass = responseBody.errors &&
    responseBody.errors[0] &&
    responseBody.errors[0].extensions &&
    responseBody.errors[0].extensions.errorClass;

  if (errorClass === 'VALIDATION') {
    response = userErrorResponseAdapter(responseBody);
  } else if (errorClass) {
    response = errorWithClassResponseAdapter(responseBody);
  } else {
    response = {error: {message: 'There was a problem serving your request'}, fieldErrors: []};
  }

  return response;
}

function errorWithClassResponseAdapter(responseBody) {
  return {error: {message: responseBody.errors[0].message}, fieldErrors: []};
}

function userErrorResponseAdapter(responseBody) {
  var fieldErrors = buildFieldErrors(responseBody.errors);

  if (fieldErrors.length === 0) {
    return {error: {message: responseBody.errors[0].message}};
  }

  return {error: {message: getLegacyMessage(fieldErrors)}, fieldErrors: fieldErrors};
}

function buildFieldErrors(errors) {
  var fieldErrors = [];

  errors.forEach(function (error) {
    if (!(error.extensions && error.extensions.inputPath)) {
      return;
    }
    addFieldError(error.extensions.inputPath.slice(1), error, fieldErrors);
  });

  return fieldErrors;
}

function addFieldError(inputPath, errorDetail, fieldErrors) {
  var fieldError;
  var legacyCode = errorDetail.extensions.legacyCode;
  var inputField = inputPath[0];

  if (inputPath.length === 1) {
    fieldErrors.push({
      code: legacyCode,
      field: inputField,
      message: errorDetail.message
    });

    return;
  }

  fieldErrors.forEach(function (candidate) {
    if (candidate.field === inputField) {
      fieldError = candidate;
    }
  });

  if (!fieldError) {
    fieldError = {field: inputField, fieldErrors: []};
    fieldErrors.push(fieldError);
  }

  addFieldError(inputPath.slice(1), errorDetail, fieldError.fieldErrors);
}

function getLegacyMessage(errors) {
  var legacyMessages = {
    creditCard: 'Credit card is invalid'
  };

  var field = errors[0].field;

  return legacyMessages[field];
}

module.exports = errorResponseAdapter;

},{}],58:[function(require,module,exports){
'use strict';

var CONFIGURATION_QUERY = 'query ClientConfiguration { ' +
'  clientConfiguration { ' +
'    analyticsUrl ' +
'    environment ' +
'    merchantId ' +
'    assetsUrl ' +
'    clientApiUrl ' +
'    creditCard { ' +
'      supportedCardBrands ' +
'      challenges ' +
'      threeDSecureEnabled ' +
'      threeDSecure { ' +
'        cardinalAuthenticationJWT ' +
'      } ' +
'    } ' +
'    applePayWeb { ' +
'      countryCode ' +
'      currencyCode ' +
'      merchantIdentifier ' +
'      supportedCardBrands ' +
'    } ' +
'    googlePay { ' +
'      displayName ' +
'      supportedCardBrands ' +
'      environment ' +
'      googleAuthorization ' +
'      paypalClientId ' +
'    } ' +
'    ideal { ' +
'      routeId ' +
'      assetsUrl ' +
'    } ' +
'    kount { ' +
'      merchantId ' +
'    } ' +
'    masterpass { ' +
'      merchantCheckoutId ' +
'      supportedCardBrands ' +
'    } ' +
'    paypal { ' +
'      displayName ' +
'      clientId ' +
'      privacyUrl ' +
'      userAgreementUrl ' +
'      assetsUrl ' +
'      environment ' +
'      environmentNoNetwork ' +
'      unvettedMerchant ' +
'      braintreeClientId ' +
'      billingAgreementsEnabled ' +
'      merchantAccountId ' +
'      currencyCode ' +
'      payeeEmail ' +
'    } ' +
'    unionPay { ' +
'      merchantAccountId ' +
'    } ' +
'    usBankAccount { ' +
'      routeId ' +
'      plaidPublicKey ' +
'    } ' +
'    venmo { ' +
'      merchantId ' +
'      accessToken ' +
'      environment ' +
'    } ' +
'    visaCheckout { ' +
'      apiKey ' +
'      externalClientId ' +
'      supportedCardBrands ' +
'    } ' +
'    braintreeApi { ' +
'      accessToken ' +
'      url ' +
'    } ' +
'    supportedFeatures ' +
'  } ' +
'}';

function configuration() {
  return {
    query: CONFIGURATION_QUERY,
    operationName: 'ClientConfiguration'
  };
}

module.exports = configuration;

},{}],59:[function(require,module,exports){
'use strict';

var assign = require('../../../../lib/assign').assign;

function createMutation(config) {
  var hasAuthenticationInsight = config.hasAuthenticationInsight;
  var mutation = 'mutation TokenizeCreditCard($input: TokenizeCreditCardInput!';

  if (hasAuthenticationInsight) {
    mutation += ', $authenticationInsightInput: AuthenticationInsightInput!';
  }

  mutation += ') { ' +
    '  tokenizeCreditCard(input: $input) { ' +
    '    token ' +
    '    creditCard { ' +
    '      bin ' +
    '      brandCode ' +
    '      last4 ' +
    '      cardholderName ' +
    '      expirationMonth' +
    '      expirationYear' +
    '      binData { ' +
    '        prepaid ' +
    '        healthcare ' +
    '        debit ' +
    '        durbinRegulated ' +
    '        commercial ' +
    '        payroll ' +
    '        issuingBank ' +
    '        countryOfIssuance ' +
    '        productId ' +
    '      } ' +
    '    } ';

  if (hasAuthenticationInsight) {
    mutation += '    authenticationInsight(input: $authenticationInsightInput) {' +
      '      customerAuthenticationRegulationEnvironment' +
      '    }';
  }

  mutation += '  } ' +
    '}';

  return mutation;
}

function createCreditCardTokenizationBody(body, options) {
  var cc = body.creditCard;
  var billingAddress = cc && cc.billingAddress;
  var expDate = cc && cc.expirationDate;
  var expirationMonth = cc && (cc.expirationMonth || (expDate && expDate.split('/')[0].trim()));
  var expirationYear = cc && (cc.expirationYear || (expDate && expDate.split('/')[1].trim()));
  var variables = {
    input: {
      creditCard: {
        number: cc && cc.number,
        expirationMonth: expirationMonth,
        expirationYear: expirationYear,
        cvv: cc && cc.cvv,
        cardholderName: cc && cc.cardholderName
      },
      options: {}
    }
  };

  if (options.hasAuthenticationInsight) {
    variables.authenticationInsightInput = {
      merchantAccountId: body.merchantAccountId
    };
  }

  if (billingAddress) {
    variables.input.creditCard.billingAddress = billingAddress;
  }

  variables.input = addValidationRule(body, variables.input);

  return variables;
}

function addValidationRule(body, input) {
  var validate;

  if (body.creditCard && body.creditCard.options && typeof body.creditCard.options.validate === 'boolean') {
    validate = body.creditCard.options.validate;
  } else if ((body.authorizationFingerprint && body.tokenizationKey) || body.authorizationFingerprint) {
    validate = true;
  } else if (body.tokenizationKey) {
    validate = false;
  }

  if (typeof validate === 'boolean') {
    input.options = assign({
      validate: validate
    }, input.options);
  }

  return input;
}

function creditCardTokenization(body) {
  var options = {
    hasAuthenticationInsight: Boolean(body.authenticationInsight && body.merchantAccountId)
  };

  return {
    query: createMutation(options),
    variables: createCreditCardTokenizationBody(body, options),
    operationName: 'TokenizeCreditCard'
  };
}

module.exports = creditCardTokenization;

},{"../../../../lib/assign":84}],60:[function(require,module,exports){
'use strict';

var browserDetection = require('../../browser-detection');

var features = {
  tokenize_credit_cards: 'payment_methods/credit_cards', // eslint-disable-line camelcase
  configuration: 'configuration'
};

var disallowedInputPaths = [
  'creditCard.options.unionPayEnrollment'
];

function GraphQL(config) {
  this._config = config.graphQL;
}

GraphQL.prototype.getGraphQLEndpoint = function () {
  return this._config.url;
};

GraphQL.prototype.isGraphQLRequest = function (url, body) {
  var featureEnabled;
  var path = this.getClientApiPath(url);

  if (!this._isGraphQLEnabled() || !path || browserDetection.isIe9()) {
    return false;
  }

  featureEnabled = this._config.features.some(function (feature) {
    return features[feature] === path;
  });

  if (containsDisallowedlistedKeys(body)) {
    return false;
  }

  return featureEnabled;
};

GraphQL.prototype.getClientApiPath = function (url) {
  var path;
  var clientApiPrefix = '/client_api/v1/';
  var pathParts = url.split(clientApiPrefix);

  if (pathParts.length > 1) {
    path = pathParts[1].split('?')[0];
  }

  return path;
};

GraphQL.prototype._isGraphQLEnabled = function () {
  return Boolean(this._config);
};

function containsDisallowedlistedKeys(body) {
  return disallowedInputPaths.some(function (keys) {
    var value = keys.split('.').reduce(function (accumulator, key) {
      return accumulator && accumulator[key];
    }, body);

    return value !== undefined; // eslint-disable-line no-undefined
  });
}

module.exports = GraphQL;

},{"../../browser-detection":46}],61:[function(require,module,exports){
'use strict';

var BRAINTREE_VERSION = require('../../constants').BRAINTREE_VERSION;

var assign = require('../../../lib/assign').assign;

var creditCardTokenizationBodyGenerator = require('./generators/credit-card-tokenization');
var creditCardTokenizationResponseAdapter = require('./adapters/credit-card-tokenization');

var configurationBodyGenerator = require('./generators/configuration');
var configurationResponseAdapter = require('./adapters/configuration');

var generators = {
  'payment_methods/credit_cards': creditCardTokenizationBodyGenerator,
  configuration: configurationBodyGenerator
};
var adapters = {
  'payment_methods/credit_cards': creditCardTokenizationResponseAdapter,
  configuration: configurationResponseAdapter
};

function GraphQLRequest(options) {
  var clientApiPath = options.graphQL.getClientApiPath(options.url);

  this._graphQL = options.graphQL;
  this._data = options.data;
  this._method = options.method;
  this._headers = options.headers;
  this._clientSdkMetadata = {
    source: options.metadata.source,
    integration: options.metadata.integration,
    sessionId: options.metadata.sessionId
  };
  this._sendAnalyticsEvent = options.sendAnalyticsEvent || Function.prototype;

  this._generator = generators[clientApiPath];
  this._adapter = adapters[clientApiPath];

  this._sendAnalyticsEvent('graphql.init');
}

GraphQLRequest.prototype.getUrl = function () {
  return this._graphQL.getGraphQLEndpoint();
};

GraphQLRequest.prototype.getBody = function () {
  var formattedBody = formatBodyKeys(this._data);
  var generatedBody = this._generator(formattedBody);
  var body = assign({clientSdkMetadata: this._clientSdkMetadata}, generatedBody);

  return JSON.stringify(body);
};

GraphQLRequest.prototype.getMethod = function () {
  return 'POST';
};

GraphQLRequest.prototype.getHeaders = function () {
  var authorization, headers;

  if (this._data.authorizationFingerprint) {
    this._sendAnalyticsEvent('graphql.authorization-fingerprint');
    authorization = this._data.authorizationFingerprint;
  } else {
    this._sendAnalyticsEvent('graphql.tokenization-key');
    authorization = this._data.tokenizationKey;
  }

  headers = {
    Authorization: 'Bearer ' + authorization,
    'Braintree-Version': BRAINTREE_VERSION
  };

  return assign({}, this._headers, headers);
};

GraphQLRequest.prototype.adaptResponseBody = function (parsedBody) {
  return this._adapter(parsedBody, this);
};

GraphQLRequest.prototype.determineStatus = function (httpStatus, parsedResponse) {
  var status, errorClass;

  if (httpStatus === 200) {
    errorClass = parsedResponse.errors &&
      parsedResponse.errors[0] &&
      parsedResponse.errors[0].extensions &&
      parsedResponse.errors[0].extensions.errorClass;

    if (parsedResponse.data && !parsedResponse.errors) {
      status = 200;
    } else if (errorClass === 'VALIDATION') {
      status = 422;
    } else if (errorClass === 'AUTHORIZATION') {
      status = 403;
    } else if (errorClass === 'AUTHENTICATION') {
      status = 401;
    } else if (isGraphQLError(errorClass, parsedResponse)) {
      status = 403;
    } else {
      status = 500;
    }
  } else if (!httpStatus) {
    status = 500;
  } else {
    status = httpStatus;
  }

  this._sendAnalyticsEvent('graphql.status.' + httpStatus);
  this._sendAnalyticsEvent('graphql.determinedStatus.' + status);

  return status;
};

function isGraphQLError(errorClass, parsedResponse) {
  return !errorClass && parsedResponse.errors[0].message;
}

function snakeCaseToCamelCase(snakeString) {
  if (snakeString.indexOf('_') === -1) {
    return snakeString;
  }

  return snakeString.toLowerCase().replace(/(\_\w)/g, function (match) {
    return match[1].toUpperCase();
  });
}

function formatBodyKeys(originalBody) {
  var body = {};

  Object.keys(originalBody).forEach(function (key) {
    var camelCaseKey = snakeCaseToCamelCase(key);

    if (typeof originalBody[key] === 'object') {
      body[camelCaseKey] = formatBodyKeys(originalBody[key]);
    } else if (typeof originalBody[key] === 'number') {
      body[camelCaseKey] = String(originalBody[key]);
    } else {
      body[camelCaseKey] = originalBody[key];
    }
  });

  return body;
}

module.exports = GraphQLRequest;

},{"../../../lib/assign":84,"../../constants":48,"./adapters/configuration":55,"./adapters/credit-card-tokenization":56,"./generators/configuration":58,"./generators/credit-card-tokenization":59}],62:[function(require,module,exports){
'use strict';

var ajaxIsAvaliable;
var once = require('../../lib/once');
var JSONPDriver = require('./jsonp-driver');
var AJAXDriver = require('./ajax-driver');
var getUserAgent = require('./get-user-agent');
var isHTTP = require('./is-http');

function isAjaxAvailable() {
  if (ajaxIsAvaliable == null) {
    ajaxIsAvaliable = !(isHTTP() && /MSIE\s(8|9)/.test(getUserAgent()));
  }

  return ajaxIsAvaliable;
}

module.exports = function (options, cb) {
  cb = once(cb || Function.prototype);
  options.method = (options.method || 'GET').toUpperCase();
  options.timeout = options.timeout == null ? 60000 : options.timeout;
  options.data = options.data || {};

  if (isAjaxAvailable()) {
    AJAXDriver.request(options, cb);
  } else {
    JSONPDriver.request(options, cb);
  }
};

},{"../../lib/once":103,"./ajax-driver":52,"./get-user-agent":54,"./is-http":63,"./jsonp-driver":64}],63:[function(require,module,exports){
'use strict';

module.exports = function () {
  return window.location.protocol === 'http:';
};

},{}],64:[function(require,module,exports){
'use strict';

var head;
var uuid = require('@braintree/uuid');
var querystring = require('../../lib/querystring');
var timeouts = {};

function _removeScript(script) {
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

function _createScriptTag(url, callbackName) {
  var script = document.createElement('script');
  var done = false;

  script.src = url;
  script.async = true;
  script.onerror = function () {
    window[callbackName]({message: 'error', status: 500});
  };

  script.onload = script.onreadystatechange = function () {
    if (done) { return; }

    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      done = true;
      script.onload = script.onreadystatechange = null;
    }
  };

  return script;
}

function _cleanupGlobal(callbackName) {
  try {
    delete window[callbackName];
  } catch (_) {
    window[callbackName] = null;
  }
}

function _setupTimeout(timeout, callbackName) {
  timeouts[callbackName] = setTimeout(function () {
    timeouts[callbackName] = null;

    window[callbackName]({
      error: 'timeout',
      status: -1
    });

    window[callbackName] = function () {
      _cleanupGlobal(callbackName);
    };
  }, timeout);
}

function _setupGlobalCallback(script, callback, callbackName) {
  window[callbackName] = function (response) {
    var status = response.status || 500;
    var err = null;
    var data = null;

    delete response.status;

    if (status >= 400 || status < 200) {
      err = response;
    } else {
      data = response;
    }

    _cleanupGlobal(callbackName);
    _removeScript(script);

    clearTimeout(timeouts[callbackName]);
    callback(err, data, status);
  };
}

function request(options, callback) {
  var script;
  var callbackName = 'callback_json_' + uuid().replace(/-/g, '');
  var url = options.url;
  var attrs = options.data;
  var method = options.method;
  var timeout = options.timeout;

  url = querystring.queryify(url, attrs);
  url = querystring.queryify(url, {
    _method: method,
    callback: callbackName
  });

  script = _createScriptTag(url, callbackName);
  _setupGlobalCallback(script, callback, callbackName);
  _setupTimeout(timeout, callbackName);

  if (!head) {
    head = document.getElementsByTagName('head')[0];
  }

  head.appendChild(script);
}

module.exports = {
  request: request
};

},{"../../lib/querystring":105,"@braintree/uuid":40}],65:[function(require,module,exports){
'use strict';

module.exports = function (body) {
  try {
    body = JSON.parse(body);
  } catch (e) { /* ignored */ }

  return body;
};

},{}],66:[function(require,module,exports){
'use strict';

module.exports = function (method, body) {
  if (typeof method !== 'string') {
    throw new Error('Method must be a string');
  }

  if (method.toLowerCase() !== 'get' && body != null) {
    body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return body;
};

},{}],67:[function(require,module,exports){
'use strict';

var isXHRAvailable = typeof window !== 'undefined' && window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest();

function getRequestObject() {
  return isXHRAvailable ? new window.XMLHttpRequest() : new window.XDomainRequest();
}

module.exports = {
  isAvailable: isXHRAvailable,
  getRequestObject: getRequestObject
};

},{}],68:[function(require,module,exports){
'use strict';

var BraintreeError = require('../../lib/braintree-error');
var errors = require('../shared/errors');
var allowedAttributes = require('../shared/constants').allowedAttributes;

function attributeValidationError(attribute, value) {
  var err;

  if (!allowedAttributes.hasOwnProperty(attribute)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED.type,
      code: errors.HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED.code,
      message: 'The "' + attribute + '" attribute is not supported in Hosted Fields.'
    });
  } else if (value != null && !_isValid(attribute, value)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED.type,
      code: errors.HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED.code,
      message: 'Value "' + value + '" is not allowed for "' + attribute + '" attribute.'
    });
  }

  return err;
}

function _isValid(attribute, value) {
  if (allowedAttributes[attribute] === 'string') {
    return typeof value === 'string' || typeof value === 'number';
  } else if (allowedAttributes[attribute] === 'boolean') {
    return String(value) === 'true' || String(value) === 'false';
  }

  return false;
}

module.exports = attributeValidationError;

},{"../../lib/braintree-error":87,"../shared/constants":76,"../shared/errors":77}],69:[function(require,module,exports){
'use strict';

var constants = require('../shared/constants');
var useMin = require('../../lib/use-min');

module.exports = function composeUrl(assetsUrl, componentId, isDebug) {
  return assetsUrl +
    '/web/' +
    constants.VERSION +
    '/html/hosted-fields-frame' + useMin(isDebug) + '.html#' +
    componentId;
};

},{"../../lib/use-min":107,"../shared/constants":76}],70:[function(require,module,exports){
'use strict';

var directions = require('../shared/constants').navigationDirections;
var browserDetection = require('../shared/browser-detection');
var focusIntercept = require('../shared/focus-intercept');
var findParentTags = require('../shared/find-parent-tags');
var userFocusableTagNames = [
  'INPUT', 'SELECT', 'TEXTAREA'
];
// Devices with software keyboards do not or cannot focus on input types
// that do not require keyboard-based interaction.
var unfocusedInputTypes = [
  'hidden', 'button', 'reset', 'submit', 'checkbox', 'radio', 'file'
];

function _isUserFocusableElement(element) {
  if (!browserDetection.hasSoftwareKeyboard()) {
    // on desktop browsers, the only input type that isn't focusable
    // is the hidden input
    return element.type !== 'hidden';
  }

  return userFocusableTagNames.indexOf(element.tagName) > -1 &&
    unfocusedInputTypes.indexOf(element.type) < 0;
}

function _createNavigationHelper(direction, numberOfElementsInForm) {
  switch (direction) {
    case directions.BACK:
      return {
        checkIndexBounds: function (index) {
          return index < 0;
        },
        indexChange: -1
      };
    case directions.FORWARD:
      return {
        checkIndexBounds: function (index) {
          return index > numberOfElementsInForm - 1;
        },
        indexChange: 1
      };
    default:
  }

  return {};
}

function _findFirstFocusableElement(elementsInForm) {
  var elementsIndex, element;

  for (elementsIndex = 0; elementsIndex < elementsInForm.length; elementsIndex++) {
    element = elementsInForm[elementsIndex];

    if (_isUserFocusableElement(element)) {
      return element;
    }
  }

  return null;
}

module.exports = {
  removeExtraFocusElements: function (checkoutForm, onRemoveFocusIntercepts) {
    var elements = Array.prototype.slice.call(checkoutForm.elements);
    var firstFocusableInput = _findFirstFocusableElement(elements);
    var lastFocusableInput = _findFirstFocusableElement(elements.reverse());

    // these should never be identical, because there will at least be the
    // before and the after input
    [
      firstFocusableInput,
      lastFocusableInput
    ].forEach(function (input) {
      if (!input) {
        return;
      }

      if (focusIntercept.matchFocusElement(input.getAttribute('id'))) {
        onRemoveFocusIntercepts(input.getAttribute('id'));
      }
    });
  },

  createFocusChangeHandler: function (hostedFieldsId, callbacks) {
    return function (data) {
      var currentIndex, targetElement, checkoutForm, navHelper;
      var sourceElement = document.getElementById('bt-' + data.field + '-' + data.direction + '-' + hostedFieldsId);

      if (!sourceElement) {
        return;
      }

      checkoutForm = findParentTags(sourceElement, 'form')[0];

      if (document.forms.length < 1 || !checkoutForm) {
        callbacks.onRemoveFocusIntercepts();

        return;
      }

      checkoutForm = [].slice.call(checkoutForm.elements);
      currentIndex = checkoutForm.indexOf(sourceElement);
      navHelper = _createNavigationHelper(data.direction, checkoutForm.length);

      do {
        currentIndex += navHelper.indexChange;
        if (navHelper.checkIndexBounds(currentIndex)) {
          return;
        }
        targetElement = checkoutForm[currentIndex];
      } while (!_isUserFocusableElement(targetElement));

      if (focusIntercept.matchFocusElement(targetElement.getAttribute('id'))) {
        callbacks.onTriggerInputFocus(targetElement.getAttribute('data-braintree-type'));
      } else {
        targetElement.focus();
      }
    };
  }
};

},{"../shared/browser-detection":75,"../shared/constants":76,"../shared/find-parent-tags":78,"../shared/focus-intercept":79}],71:[function(require,module,exports){
'use strict';

var allowedStyles = require('../shared/constants').allowedStyles;

module.exports = function getStylesFromClass(cssClass) {
  var element = document.createElement('input');
  var styles = {};
  var computedStyles;

  if (cssClass[0] === '.') {
    cssClass = cssClass.substring(1);
  }

  element.className = cssClass;
  element.style.display = 'none !important';
  element.style.position = 'fixed !important';
  element.style.left = '-99999px !important';
  element.style.top = '-99999px !important';
  document.body.appendChild(element);

  computedStyles = window.getComputedStyle(element);

  allowedStyles.forEach(function (style) {
    var value = computedStyles[style];

    if (value) {
      styles[style] = value;
    }
  });

  document.body.removeChild(element);

  return styles;
};

},{"../shared/constants":76}],72:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;
var createAssetsUrl = require('../../lib/create-assets-url');
var isVerifiedDomain = require('../../lib/is-verified-domain');
var Destructor = require('../../lib/destructor');
var classList = require('@braintree/class-list');
var iFramer = require('@braintree/iframer');
var Bus = require('framebus');
var createDeferredClient = require('../../lib/create-deferred-client');
var BraintreeError = require('../../lib/braintree-error');
var composeUrl = require('./compose-url');
var getStylesFromClass = require('./get-styles-from-class');
var constants = require('../shared/constants');
var errors = require('../shared/errors');
var INTEGRATION_TIMEOUT_MS = require('../../lib/constants').INTEGRATION_TIMEOUT_MS;
var uuid = require('@braintree/uuid');
var findParentTags = require('../shared/find-parent-tags');
var browserDetection = require('../shared/browser-detection');
var events = constants.events;
var EventEmitter = require('@braintree/event-emitter');
var injectFrame = require('./inject-frame');
var analytics = require('../../lib/analytics');
var allowedFields = constants.allowedFields;
var methods = require('../../lib/methods');
var shadow = require('../../lib/shadow');
var findRootNode = require('../../lib/find-root-node');
var convertMethodsToError = require('../../lib/convert-methods-to-error');
var sharedErrors = require('../../lib/errors');
var getCardTypes = require('../shared/get-card-types');
var attributeValidationError = require('./attribute-validation-error');
var Promise = require('../../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var focusChange = require('./focus-change');
var destroyFocusIntercept = require('../shared/focus-intercept').destroy;

var SAFARI_FOCUS_TIMEOUT = 5;

/**
 * @typedef {object} HostedFields~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {object} authenticationInsight Info about the [regulatory environment](https://developers.braintreepayments.com/guides/3d-secure/advanced-options/javascript/v3#authentication-insight) of the tokenized card. Only available if `authenticationInsight.merchantAccountId` is passed in the `tokenize` method options.
 * @property {string} authenticationInsight.regulationEnvironment The [regulation environment](https://developers.braintreepayments.com/guides/3d-secure/advanced-options/javascript/v3#authentication-insight) for the tokenized card.
 * @property {object} details Additional account details.
 * @property {string} details.bin The BIN number of the card.
 * @property {string} details.cardType Type of card, ex: Visa, MasterCard.
 * @property {string} details.expirationMonth The expiration month of the card.
 * @property {string} details.expirationYear The expiration year of the card.
 * @property {string} details.cardholderName The cardholder name tokenized with the card.
 * @property {string} details.lastFour Last four digits of card number.
 * @property {string} details.lastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, always `CreditCard`.
 * @property {object} binData Information about the card based on the bin.
 * @property {string} binData.commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.countryOfIssuance The country of issuance.
 * @property {string} binData.debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.issuingBank The issuing bank.
 * @property {string} binData.payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.productId The product id.
 */

/**
 * @typedef {object} HostedFields~stateObject
 * @description The event payload sent from {@link HostedFields#on|on} or {@link HostedFields#getState|getState}.
 * @property {HostedFields~hostedFieldsCard[]} cards
 * This will return an array of potential {@link HostedFields~hostedFieldsCard|cards}. If the card type has been determined, the array will contain only one card.
 * Internally, Hosted Fields uses <a href="https://github.com/braintree/credit-card-type">credit-card-type</a>,
 * an open-source card detection library.
 * @property {string} emittedBy
 * The name of the field associated with an event. This will not be included if returned by {@link HostedFields#getState|getState}. It will be one of the following strings:<br>
 * - `"number"`
 * - `"cvv"`
 * - `"expirationDate"`
 * - `"expirationMonth"`
 * - `"expirationYear"`
 * - `"postalCode"`
 * - `"cardholderName"`
 * @property {object} fields
 * @property {?HostedFields~hostedFieldsFieldData} fields.number {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the number field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.cvv {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the CVV field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationDate {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration date field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationMonth {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration month field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationYear {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration year field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.postalCode {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the postal code field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.cardholderName {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the cardholder name field, if it is present.
 */

/**
 * @typedef {object} HostedFields~binPayload
 * @description The event payload sent from {@link HostedFields#on|on} when the {@link HostedFields#event:binAvailable|binAvailable} event is emitted.
 * @property {string} bin The first 6 digits of the card number.
 */

/**
 * @typedef {object} HostedFields~hostedFieldsFieldData
 * @description Data about Hosted Fields fields, sent in {@link HostedFields~stateObject|stateObjects}.
 * @property {HTMLElement} container Reference to the container DOM element on your page associated with the current event.
 * @property {boolean} isFocused Whether or not the input is currently focused.
 * @property {boolean} isEmpty Whether or not the user has entered a value in the input.
 * @property {boolean} isPotentiallyValid
 * A determination based on the future validity of the input value.
 * This is helpful when a user is entering a card number and types <code>"41"</code>.
 * While that value is not valid for submission, it is still possible for
 * it to become a fully qualified entry. However, if the user enters <code>"4x"</code>
 * it is clear that the card number can never become valid and isPotentiallyValid will
 * return false.
 * @property {boolean} isValid Whether or not the value of the associated input is <i>fully</i> qualified for submission.
 */

/**
 * @typedef {object} HostedFields~hostedFieldsCard
 * @description Information about the card type, sent in {@link HostedFields~stateObject|stateObjects}.
 * @property {string} type The code-friendly representation of the card type. It will be one of the following strings:
 * - `american-express`
 * - `diners-club`
 * - `discover`
 * - `jcb`
 * - `maestro`
 * - `master-card`
 * - `unionpay`
 * - `visa`
 * @property {string} niceType The pretty-printed card type. It will be one of the following strings:
 * - `American Express`
 * - `Diners Club`
 * - `Discover`
 * - `JCB`
 * - `Maestro`
 * - `MasterCard`
 * - `UnionPay`
 * - `Visa`
 * @property {object} code
 * This object contains data relevant to the security code requirements of the card brand.
 * For example, on a Visa card there will be a <code>CVV</code> of 3 digits, whereas an
 * American Express card requires a 4-digit <code>CID</code>.
 * @property {string} code.name <code>"CVV"</code> <code>"CID"</code> <code>"CVC"</code>
 * @property {number} code.size The expected length of the security code. Typically, this is 3 or 4.
 */

/**
 * @name HostedFields#on
 * @function
 * @param {string} event The name of the event to which you are subscribing.
 * @param {function} handler A callback to handle the event.
 * @description Subscribes a handler function to a named event.
 *
 * **Events that emit a {@link HostedFields~stateObject|stateObject}.**
 * * {@link HostedFields#event:blur|blur}
 * * {@link HostedFields#event:focus|focus}
 * * {@link HostedFields#event:empty|empty}
 * * {@link HostedFields#event:notEmpty|notEmpty}
 * * {@link HostedFields#event:cardTypeChange|cardTypeChange}
 * * {@link HostedFields#event:validityChange|validityChange}
 * * {@link HostedFields#event:inputSubmitRequest|inputSubmitRequest}
 *
 * **Other Events**
 * * {@link HostedFields#event:binAvailable|binAvailable} - emits a {@link HostedFields~binPayload|bin payload}
 * @example
 * <caption>Listening to a Hosted Field event, in this case 'focus'</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('focus', function (event) {
 *     console.log(event.emittedBy, 'has been focused');
 *   });
 * });
 * @returns {void}
 */

/**
 * @name HostedFields#off
 * @function
 * @param {string} event The name of the event to which you are unsubscribing.
 * @param {function} handler The callback for the event you are unsubscribing from.
 * @description Unsubscribes the handler function to a named event.
 * @example
 * <caption>Subscribing and then unsubscribing from a Hosted Field event, in this case 'focus'</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   var callback = function (event) {
 *     console.log(event.emittedBy, 'has been focused');
 *   };
 *   hostedFieldsInstance.on('focus', callback);
 *
 *   // later on
 *   hostedFieldsInstance.off('focus', callback);
 * });
 * @returns {void}
 */

/**
 * This event is emitted when the user requests submission of an input field, such as by pressing the Enter or Return key on their keyboard, or mobile equivalent.
 * @event HostedFields#inputSubmitRequest
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Clicking a submit button upon hitting Enter (or equivalent) within a Hosted Field</caption>
 * var hostedFields = require('braintree-web/hosted-fields');
 * var submitButton = document.querySelector('input[type="submit"]');
 *
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('inputSubmitRequest', function () {
 *     // User requested submission, e.g. by pressing Enter or equivalent
 *     submitButton.click();
 *   });
 * });
 */

/**
 * This event is emitted when a field transitions from having data to being empty.
 * @event HostedFields#empty
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to an empty event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('empty', function (event) {
 *     console.log(event.emittedBy, 'is now empty');
 *   });
 * });
 */

/**
 * This event is emitted when a field transitions from being empty to having data.
 * @event HostedFields#notEmpty
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to an notEmpty event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('notEmpty', function (event) {
 *     console.log(event.emittedBy, 'is now not empty');
 *   });
 * });
 */

/**
 * This event is emitted when a field loses focus.
 * @event HostedFields#blur
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a blur event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('blur', function (event) {
 *     console.log(event.emittedBy, 'lost focus');
 *   });
 * });
 */

/**
 * This event is emitted when a field gains focus.
 * @event HostedFields#focus
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a focus event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('focus', function (event) {
 *     console.log(event.emittedBy, 'gained focus');
 *   });
 * });
 */

/**
 * This event is emitted when activity within the number field has changed such that the possible card type has changed.
 * @event HostedFields#cardTypeChange
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a cardTypeChange event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('cardTypeChange', function (event) {
 *     if (event.cards.length === 1) {
 *       console.log(event.cards[0].type);
 *     } else {
 *       console.log('Type of card not yet known');
 *     }
 *   });
 * });
 */

/**
 * This event is emitted when the validity of a field has changed. Validity is represented in the {@link HostedFields~stateObject|stateObject} as two booleans: `isValid` and `isPotentiallyValid`.
 * @event HostedFields#validityChange
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a validityChange event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('validityChange', function (event) {
 *     var field = event.fields[event.emittedBy];
 *
 *     if (field.isValid) {
 *       console.log(event.emittedBy, 'is fully valid');
 *     } else if (field.isPotentiallyValid) {
 *       console.log(event.emittedBy, 'is potentially valid');
 *     } else {
 *       console.log(event.emittedBy, 'is not valid');
 *     }
 *   });
 * });
 */

/**
 * This event is emitted when the first 6 digits of the card number have been entered by the customer.
 * @event HostedFields#binAvailable
 * @type {string}
 * @example
 * <caption>Listening to a `binAvailable` event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('binAvailable', function (event) {
 *     event.bin // send bin to 3rd party bin service
 *   });
 * });
 */

function createInputEventHandler(fields) {
  return function (eventData) {
    var field;
    var merchantPayload = eventData.merchantPayload;
    var emittedBy = merchantPayload.emittedBy;
    var container = fields[emittedBy].containerElement;

    Object.keys(merchantPayload.fields).forEach(function (key) {
      merchantPayload.fields[key].container = fields[key].containerElement;
    });

    field = merchantPayload.fields[emittedBy];

    if (eventData.type === 'blur') {
      performBlurFixForIos(container);
    }

    classList.toggle(container, constants.externalClasses.FOCUSED, field.isFocused);
    classList.toggle(container, constants.externalClasses.VALID, field.isValid);
    classList.toggle(container, constants.externalClasses.INVALID, !field.isPotentiallyValid);

    this._state = {// eslint-disable-line no-invalid-this
      cards: merchantPayload.cards,
      fields: merchantPayload.fields
    };

    this._emit(eventData.type, merchantPayload); // eslint-disable-line no-invalid-this
  };
}

// iOS Safari has a bug where inputs in iframes
// will not dismiss the keyboard when they lose
// focus. We create a hidden button input that we
// can focus on and blur to force the keyboard to
// dismiss. See #229
function performBlurFixForIos(container) {
  var hiddenInput;

  if (!browserDetection.isIos()) {
    return;
  }

  if (document.activeElement === document.body) {
    hiddenInput = container.querySelector('input');

    if (!hiddenInput) {
      hiddenInput = document.createElement('input');

      hiddenInput.type = 'button';
      hiddenInput.style.height = '0px';
      hiddenInput.style.width = '0px';
      hiddenInput.style.opacity = '0';
      hiddenInput.style.padding = '0';
      hiddenInput.style.position = 'absolute';
      hiddenInput.style.left = '-200%';
      hiddenInput.style.top = '0px';

      container.insertBefore(hiddenInput, container.firstChild);
    }

    hiddenInput.focus();
    hiddenInput.blur();
  }
}

function isVisibleEnough(node) {
  var boundingBox = node.getBoundingClientRect();
  var verticalMidpoint = Math.floor(boundingBox.height / 2);
  var horizontalMidpoint = Math.floor(boundingBox.width / 2);

  return (
    boundingBox.top < (window.innerHeight - verticalMidpoint || document.documentElement.clientHeight - verticalMidpoint) &&
    boundingBox.right > horizontalMidpoint &&
    boundingBox.bottom > verticalMidpoint &&
    boundingBox.left < (window.innerWidth - horizontalMidpoint || document.documentElement.clientWidth - horizontalMidpoint)
  );
}

/**
 * @class HostedFields
 * @param {object} options The Hosted Fields {@link module:braintree-web/hosted-fields.create create} options.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/hosted-fields.create|braintree-web.hosted-fields.create} instead.</strong>
 * @classdesc This class represents a Hosted Fields component produced by {@link module:braintree-web/hosted-fields.create|braintree-web/hosted-fields.create}. Instances of this class have methods for interacting with the input fields within Hosted Fields' iframes.
 */
function HostedFields(options) {
  var failureTimeout, clientConfig, assetsUrl, isDebug, hostedFieldsUrl;
  var self = this;
  var fields = {};
  var frameReadyPromiseResolveFunctions = {};
  var frameReadyPromises = [];
  var componentId = uuid();

  this._merchantConfigurationOptions = assign({}, options);

  if (options.client) {
    clientConfig = options.client.getConfiguration();
    assetsUrl = clientConfig.gatewayConfiguration.assetsUrl;
    isDebug = clientConfig.isDebug;
  } else {
    assetsUrl = createAssetsUrl.create(options.authorization);
    isDebug = Boolean(options.isDebug);
  }

  this._clientPromise = createDeferredClient.create({
    client: options.client,
    authorization: options.authorization,
    debug: isDebug,
    assetsUrl: assetsUrl,
    name: 'Hosted Fields'
  });

  hostedFieldsUrl = composeUrl(assetsUrl, componentId, isDebug);

  if (!options.fields || Object.keys(options.fields).length === 0) {
    throw new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.fields is required when instantiating Hosted Fields.'
    });
  }

  EventEmitter.call(this);

  this._injectedNodes = [];
  this._destructor = new Destructor();
  this._fields = fields;
  this._state = {
    fields: {},
    cards: getCardTypes('')
  };

  this._bus = new Bus({
    channel: componentId,
    verifyDomain: isVerifiedDomain
  });

  this._destructor.registerFunctionForTeardown(function () {
    self._bus.teardown();
  });

  // NEXT_MAJOR_VERSION analytics events should have present tense verbs
  if (!options.client) {
    analytics.sendEvent(this._clientPromise, 'custom.hosted-fields.initialized.deferred-client');
  } else {
    analytics.sendEvent(this._clientPromise, 'custom.hosted-fields.initialized');
  }

  Object.keys(options.fields).forEach(function (key) {
    var field, externalContainer, internalContainer, frame, frameReadyPromise;

    if (!constants.allowedFields.hasOwnProperty(key)) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_INVALID_FIELD_KEY.type,
        code: errors.HOSTED_FIELDS_INVALID_FIELD_KEY.code,
        message: '"' + key + '" is not a valid field.'
      });
    }

    field = options.fields[key];
    // NEXT_MAJOR_VERSION remove selector as an option
    // and simply make the API take a container
    externalContainer = field.container || field.selector;

    if (typeof externalContainer === 'string') {
      externalContainer = document.querySelector(externalContainer);
    }

    if (!externalContainer || externalContainer.nodeType !== 1) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.type,
        code: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.code,
        message: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.message,
        details: {
          fieldSelector: field.selector,
          fieldContainer: field.container,
          fieldKey: key
        }
      });
    } else if (externalContainer.querySelector('iframe[name^="braintree-"]')) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.type,
        code: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.code,
        message: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.message,
        details: {
          fieldSelector: field.selector,
          fieldContainer: field.container,
          fieldKey: key
        }
      });
    }

    internalContainer = externalContainer;

    if (shadow.isShadowElement(internalContainer)) {
      internalContainer = shadow.transformToSlot(internalContainer, 'height: 100%');
    }

    if (field.maxlength && typeof field.maxlength !== 'number') {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.type,
        code: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.code,
        message: 'The value for maxlength must be a number.',
        details: {
          fieldKey: key
        }
      });
    }

    if (field.minlength && typeof field.minlength !== 'number') {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.type,
        code: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.code,
        message: 'The value for minlength must be a number.',
        details: {
          fieldKey: key
        }
      });
    }

    frame = iFramer({
      type: key,
      name: 'braintree-hosted-field-' + key,
      style: constants.defaultIFrameStyle,
      title: 'Secure Credit Card Frame - ' + constants.allowedFields[key].label
    });

    this._injectedNodes.push.apply(this._injectedNodes, injectFrame(componentId, frame, internalContainer, function () {
      self.focus(key);
    }));

    this._setupLabelFocus(key, externalContainer);
    fields[key] = {
      frameElement: frame,
      containerElement: externalContainer
    };
    frameReadyPromise = new Promise(function (resolve) {
      frameReadyPromiseResolveFunctions[key] = resolve;
    });
    frameReadyPromises.push(frameReadyPromise);

    this._state.fields[key] = {
      isEmpty: true,
      isValid: false,
      isPotentiallyValid: true,
      isFocused: false,
      container: externalContainer
    };

    setTimeout(function () {
      // Edge has an intermittent issue where
      // the iframes load, but the JavaScript
      // can't message out to the parent page.
      // We can fix this by setting the src
      // to about:blank first followed by
      // the actual source. Both instances
      // of setting the src need to be in a
      // setTimeout to work.
      if (browserDetection.isIE() || browserDetection.isEdge()) {
        frame.src = 'about:blank';
        setTimeout(function () {
          frame.src = hostedFieldsUrl;
        }, 0);
      } else {
        frame.src = hostedFieldsUrl;
      }
    }, 0);
  }.bind(this));

  if (this._merchantConfigurationOptions.styles) {
    Object.keys(this._merchantConfigurationOptions.styles).forEach(function (selector) {
      var className = self._merchantConfigurationOptions.styles[selector];

      if (typeof className === 'string') {
        self._merchantConfigurationOptions.styles[selector] = getStylesFromClass(className);
      }
    });
  }

  this._bus.on(events.REMOVE_FOCUS_INTERCEPTS, function (data) {
    destroyFocusIntercept(data && data.id);
  });

  this._bus.on(events.TRIGGER_FOCUS_CHANGE, focusChange.createFocusChangeHandler(componentId, {
    onRemoveFocusIntercepts: function (element) {
      self._bus.emit(events.REMOVE_FOCUS_INTERCEPTS, {
        id: element
      });
    },
    onTriggerInputFocus: function (targetType) {
      self.focus(targetType);
    }
  }));

  this._bus.on(events.READY_FOR_CLIENT, function (reply) {
    self._clientPromise.then(function (client) {
      reply(client);
    });
  });

  this._bus.on(events.CARD_FORM_ENTRY_HAS_BEGUN, function () {
    analytics.sendEvent(self._clientPromise, 'hosted-fields.input.started');
  });

  this._bus.on(events.BIN_AVAILABLE, function (bin) {
    self._emit('binAvailable', {
      bin: bin
    });
  });

  failureTimeout = setTimeout(function () {
    analytics.sendEvent(self._clientPromise, 'custom.hosted-fields.load.timed-out');
    self._emit('timeout');
  }, INTEGRATION_TIMEOUT_MS);

  Promise.all(frameReadyPromises).then(function (results) {
    var reply = results[0];

    clearTimeout(failureTimeout);
    reply(formatMerchantConfigurationForIframes(self._merchantConfigurationOptions));

    self._cleanUpFocusIntercepts();

    self._emit('ready');
  });

  this._bus.on(events.FRAME_READY, function (data, reply) {
    frameReadyPromiseResolveFunctions[data.field](reply);
  });

  this._bus.on(
    events.INPUT_EVENT,
    createInputEventHandler(fields).bind(this)
  );

  this._destructor.registerFunctionForTeardown(function () {
    var j, node, parent;

    for (j = 0; j < self._injectedNodes.length; j++) {
      node = self._injectedNodes[j];
      parent = node.parentNode;

      parent.removeChild(node);

      classList.remove(
        parent,
        constants.externalClasses.FOCUSED,
        constants.externalClasses.INVALID,
        constants.externalClasses.VALID
      );
    }
  });

  this._destructor.registerFunctionForTeardown(function () {
    destroyFocusIntercept();
  });

  this._destructor.registerFunctionForTeardown(function () {
    var methodNames = methods(HostedFields.prototype).concat(methods(EventEmitter.prototype));

    convertMethodsToError(self, methodNames);
  });
}

EventEmitter.createChild(HostedFields);

HostedFields.prototype._setupLabelFocus = function (type, container) {
  var labels, i;
  var self = this;
  var rootNode = findRootNode(container);

  if (container.id == null) { return; }

  function triggerFocus() {
    self.focus(type);
  }

  // find any labels in the normal DOM
  labels = Array.prototype.slice.call(document.querySelectorAll('label[for="' + container.id + '"]'));
  if (rootNode !== document) {
    // find any labels within the shadow dom
    labels = labels.concat(Array.prototype.slice.call(rootNode.querySelectorAll('label[for="' + container.id + '"]')));
  }
  // find any labels surrounding the container that don't also have the `for` attribute
  labels = labels.concat(findParentTags(container, 'label'));
  // filter out any accidental duplicates
  labels = labels.filter(function (label, index, arr) {
    return arr.indexOf(label) === index;
  });

  for (i = 0; i < labels.length; i++) {
    labels[i].addEventListener('click', triggerFocus, false);
  }

  this._destructor.registerFunctionForTeardown(function () {
    for (i = 0; i < labels.length; i++) {
      labels[i].removeEventListener('click', triggerFocus, false);
    }
  });
};

HostedFields.prototype._getAnyFieldContainer = function () {
  var self = this;

  return Object.keys(this._fields).reduce(function (found, field) {
    return found || self._fields[field].containerElement;
  }, null);
};

HostedFields.prototype._cleanUpFocusIntercepts = function () {
  var iframeContainer, checkoutForm;

  if (document.forms.length < 1) {
    this._bus.emit(events.REMOVE_FOCUS_INTERCEPTS);
  } else {
    iframeContainer = this._getAnyFieldContainer();
    checkoutForm = findParentTags(iframeContainer, 'form')[0];

    if (checkoutForm) {
      focusChange.removeExtraFocusElements(checkoutForm, function (id) {
        this._bus.emit(events.REMOVE_FOCUS_INTERCEPTS, {
          id: id
        });
      }.bind(this));
    } else {
      this._bus.emit(events.REMOVE_FOCUS_INTERCEPTS);
    }
  }
};

HostedFields.prototype._attachInvalidFieldContainersToError = function (err) {
  if (!(err.details && err.details.invalidFieldKeys && err.details.invalidFieldKeys.length > 0)) {
    return;
  }
  err.details.invalidFields = {};
  err.details.invalidFieldKeys.forEach(function (field) {
    err.details.invalidFields[field] = this._fields[field].containerElement;
  }.bind(this));
};

/**
 * Get card verification challenges, such as requirements for cvv and postal code.
 * @public
 * @param {callback} [callback] Called on completion, containing an error if one occurred. If no callback is provided, `getChallenges` returns a promise.
 * @example
 * hostedFieldsInstance.getChallenges().then(function (challenges) {
 *   challenges // ['cvv', 'postal_code']
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.getChallenges = function () {
  return this._clientPromise.then(function (client) {
    return client.getConfiguration().gatewayConfiguration.challenges;
  });
};

/**
 * Get supported card types configured in the Braintree Control Panel
 * @public
 * @param {callback} [callback] Called on completion, containing an error if one occurred. If no callback is provided, `getSupportedCardTypes` returns a promise.
 * @example
 * hostedFieldsInstance.getSupportedCardTypes().then(function (cardTypes) {
 *   cardTypes // ['Visa', 'American Express', 'Mastercard']
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.getSupportedCardTypes = function () {
  return this._clientPromise.then(function (client) {
    var cards = client.getConfiguration().gatewayConfiguration.creditCards.supportedCardTypes.map(function (cardType) {
      if (cardType === 'MasterCard') {
        // Mastercard changed their branding. We can't update our
        // config without creating a breaking change, so we just
        // hard code the change here
        return 'Mastercard';
      }

      return cardType;
    });

    return cards;
  });
};

/**
 * Cleanly remove anything set up by {@link module:braintree-web/hosted-fields.create|create}.
 * @public
 * @param {callback} [callback] Called on completion, containing an error if one occurred. No data is returned if teardown completes successfully. If no callback is provided, `teardown` returns a promise.
 * @example
 * hostedFieldsInstance.teardown(function (teardownErr) {
 *   if (teardownErr) {
 *     console.error('Could not tear down Hosted Fields!');
 *   } else {
 *     console.info('Hosted Fields has been torn down!');
 *   }
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.teardown = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    self._destructor.teardown(function (err) {
      analytics.sendEvent(self._clientPromise, 'custom.hosted-fields.teardown-completed');

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Tokenizes fields and returns a nonce payload.
 * @public
 * @param {object} [options] All tokenization options for the Hosted Fields component.
 * @param {boolean} [options.vault=false] When true, will vault the tokenized card. Cards will only be vaulted when using a client created with a client token that includes a customer ID. Note: merchants using Advanced Fraud Tools should not use this option, as device data will not be included.
 * @param {object} [options.authenticationInsight] Options for checking authentication insight - the [regulatory environment](https://developers.braintreepayments.com/guides/3d-secure/advanced-options/javascript/v3#authentication-insight) of the tokenized card.
 * @param {string} options.authenticationInsight.merchantAccountId The Braintree merchant account id to use to look up the authentication insight information.
 * @param {array} [options.fieldsToTokenize] By default, all fields will be tokenized. You may specify which fields specifically you wish to tokenize with this property. Valid options are `'number'`, `'cvv'`, `'expirationDate'`, `'expirationMonth'`, `'expirationYear'`, `'postalCode'`, `'cardholderName'`.
 * @param {string} [options.cardholderName] When supplied, the cardholder name to be tokenized with the contents of the fields.
 * @param {string} [options.billingAddress.postalCode] When supplied, this postal code will be tokenized along with the contents of the fields. If a postal code is provided as part of the Hosted Fields configuration, the value of the field will be tokenized and this value will be ignored.
 * @param {string} [options.billingAddress.firstName] When supplied, this customer first name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.lastName] When supplied, this customer last name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.company] When supplied, this company name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.streetAddress] When supplied, this street address will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.extendedAddress] When supplied, this extended address will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.locality] When supplied, this locality (the city) will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.region] When supplied, this region (the state) will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeNumeric] When supplied, this numeric country code will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeAlpha2] When supplied, this alpha 2 representation of a country will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeAlpha3] When supplied, this alpha 3 representation of a country will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryName] When supplied, this country name will be tokenized along with the contents of the fields.
 *
 * @param {callback} [callback] May be used as the only parameter of the function if no options are passed in. The second argument, <code>data</code>, is a {@link HostedFields~tokenizePayload|tokenizePayload}. If no callback is provided, `tokenize` returns a function that resolves with a {@link HostedFields~tokenizePayload|tokenizePayload}.
 * @example <caption>Tokenize a card</caption>
 * hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     switch (tokenizeErr.code) {
 *       case 'HOSTED_FIELDS_FIELDS_EMPTY':
 *         // occurs when none of the fields are filled in
 *         console.error('All fields are empty! Please fill out the form.');
 *         break;
 *       case 'HOSTED_FIELDS_FIELDS_INVALID':
 *         // occurs when certain fields do not pass client side validation
 *         console.error('Some fields are invalid:', tokenizeErr.details.invalidFieldKeys);
 *
 *         // you can also programmatically access the field containers for the invalid fields
 *         tokenizeErr.details.invalidFields.forEach(function (fieldContainer) {
 *           fieldContainer.className = 'invalid';
 *         });
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE':
 *         // occurs when:
 *         //   * the client token used for client authorization was generated
 *         //     with a customer ID and the fail on duplicate payment method
 *         //     option is set to true
 *         //   * the card being tokenized has previously been vaulted (with any customer)
 *         // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.fail_on_duplicate_payment_method
 *         console.error('This payment method already exists in your vault.');
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED':
 *         // occurs when:
 *         //   * the client token used for client authorization was generated
 *         //     with a customer ID and the verify card option is set to true
 *         //     and you have credit card verification turned on in the Braintree
 *         //     control panel
 *         //   * the cvv does not pass verification (https://developers.braintreepayments.com/reference/general/testing/#avs-and-cvv/cid-responses)
 *         // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.verify_card
 *         console.error('CVV did not pass verification');
 *         break;
 *       case 'HOSTED_FIELDS_FAILED_TOKENIZATION':
 *         // occurs for any other tokenization error on the server
 *         console.error('Tokenization failed server side. Is the card valid?');
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR':
 *         // occurs when the Braintree gateway cannot be contacted
 *         console.error('Network error occurred when tokenizing.');
 *         break;
 *       default:
 *         console.error('Something bad happened!', tokenizeErr);
 *     }
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize and vault a card</caption>
 * hostedFieldsInstance.tokenize({
 *   vault: true
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with non-Hosted Fields cardholder name</caption>
 * hostedFieldsInstance.tokenize({
 *   cardholderName: 'First Last'
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with non-Hosted Fields postal code option</caption>
 * hostedFieldsInstance.tokenize({
 *   billingAddress: {
 *     postalCode: '11111'
 *   }
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with additional billing address options</caption>
 * hostedFieldsInstance.tokenize({
 *   billingAddress: {
 *     firstName: 'First',
 *     lastName: 'Last',
 *     company: 'Company',
 *     streetAddress: '123 Street',
 *     extendedAddress: 'Unit 1',
 *     // passing just one of the country options is sufficient to
 *     // associate the card details with a particular country
 *     // valid country names and codes can be found here:
 *     // https://developers.braintreepayments.com/reference/general/countries/ruby#list-of-countries
 *     countryName: 'United States',
 *     countryCodeAlpha2: 'US',
 *     countryCodeAlpha3: 'USA',
 *     countryCodeNumeric: '840'
 *   }
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Allow tokenization with empty cardholder name field</caption>
 * var state = hostedFieldsInstance.getState();
 * var fields = Object.keys(state.fields);
 *
 * // normally, if you tried to tokenize an empty cardholder name field
 * // you would get an error, to allow making this field optional,
 * // tokenize all the fields except for the cardholder name field
 * // when the cardholder name field is empty. Otherwise, tokenize
 * // all the fields
 * if (state.fields.cardholderName.isEmpty) {
 *  fields = fields.filter(function (field) {
 *    return field !== 'cardholderName';
 *  });
 * }
 *
 * hostedFieldsInstance.tokenize({
 *  fieldsToTokenize: fields
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.tokenize = function (options) {
  var self = this;

  if (!options) {
    options = {};
  }

  return new Promise(function (resolve, reject) {
    self._bus.emit(events.TOKENIZATION_REQUEST, options, function (response) {
      var err = response[0];
      var payload = response[1];

      if (err) {
        self._attachInvalidFieldContainersToError(err);
        reject(new BraintreeError(err));
      } else {
        resolve(payload);
      }
    });
  });
};

/**
 * Add a class to a {@link module:braintree-web/hosted-fields~field field}. Useful for updating field styles when events occur elsewhere in your checkout.
 * @public
 * @param {string} field The field you wish to add a class to. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} classname The class to be added.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the class is added successfully.
 *
 * @example
 * hostedFieldsInstance.addClass('number', 'custom-class', function (addClassErr) {
 *   if (addClassErr) {
 *     console.error(addClassErr);
 *   }
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.addClass = function (field, classname) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when adding a class.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot add class to "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.ADD_CLASS, {
      field: field,
      classname: classname
    });
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Removes a class to a {@link module:braintree-web/hosted-fields~field field}. Useful for updating field styles when events occur elsewhere in your checkout.
 * @public
 * @param {string} field The field you wish to remove a class from. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} classname The class to be removed.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the class is removed successfully.
 *
 * @example
 * hostedFieldsInstance.addClass('number', 'custom-class', function (addClassErr) {
 *   if (addClassErr) {
 *     console.error(addClassErr);
 *     return;
 *   }
 *
 *   // some time later...
 *   hostedFieldsInstance.removeClass('number', 'custom-class');
 * });
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.removeClass = function (field, classname) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when removing a class.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot remove class from "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.REMOVE_CLASS, {
      field: field,
      classname: classname
    });
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Sets an attribute of a {@link module:braintree-web/hosted-fields~field field}.
 * Supported attributes are `aria-invalid`, `aria-required`, `disabled`, and `placeholder`.
 *
 * @public
 * @param {object} options The options for the attribute you wish to set.
 * @param {string} options.field The field to which you wish to add an attribute. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} options.attribute The name of the attribute you wish to add to the field.
 * @param {string} options.value The value for the attribute.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the attribute is set successfully.
 *
 * @example <caption>Set the placeholder attribute of a field</caption>
 * hostedFieldsInstance.setAttribute({
 *   field: 'number',
 *   attribute: 'placeholder',
 *   value: '1111 1111 1111 1111'
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @example <caption>Set the aria-required attribute of a field</caption>
 * hostedFieldsInstance.setAttribute({
 *   field: 'number',
 *   attribute: 'aria-required',
 *   value: true
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.setAttribute = function (options) {
  var attributeErr, err;

  if (!allowedFields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + options.field + '" is not a valid field. You must use a valid field option when setting an attribute.'
    });
  } else if (!this._fields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot set attribute for "' + options.field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    attributeErr = attributeValidationError(options.attribute, options.value);

    if (attributeErr) {
      err = attributeErr;
    } else {
      this._bus.emit(events.SET_ATTRIBUTE, {
        field: options.field,
        attribute: options.attribute,
        value: options.value
      });
    }
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Sets the month options for the expiration month field when presented as a select element.
 *
 * @public
 * @param {array} options An array of 12 entries corresponding to the 12 months.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the options are updated successfully. Errors if expirationMonth is not configured on the Hosted Fields instance or if the expirationMonth field is not configured to be a select input.
 *
 * @example <caption>Update the month options to spanish</caption>
 * hostedFieldsInstance.setMonthOptions([
 *   '01 - enero',
 *   '02 - febrero',
 *   '03 - marzo',
 *   '04 - abril',
 *   '05 - mayo',
 *   '06 - junio',
 *   '07 - julio',
 *   '08 - agosto',
 *   '09 - septiembre',
 *   '10 - octubre',
 *   '11 - noviembre',
 *   '12 - diciembre'
 * ]);
 *
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.setMonthOptions = function (options) {
  var self = this;
  var merchantOptions = this._merchantConfigurationOptions.fields;
  var errorMessage;

  if (!merchantOptions.expirationMonth) {
    errorMessage = 'Expiration month field must exist to use setMonthOptions.';
  } else if (!merchantOptions.expirationMonth.select) {
    errorMessage = 'Expiration month field must be a select element.';
  }

  if (errorMessage) {
    return Promise.reject(new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.code,
      message: errorMessage
    }));
  }

  return new Promise(function (resolve) {
    self._bus.emit(events.SET_MONTH_OPTIONS, options, resolve);
  });
};

/**
 * Sets a visually hidden message (for screen readers) on a {@link module:braintree-web/hosted-fields~field field}.
 *
 * @public
 * @param {object} options The options for the attribute you wish to set.
 * @param {string} options.field The field to which you wish to add an attribute. Must be a valid {@link module:braintree-web/hosted-fields~field field}.
 * @param {string} options.message The message to set.
 *
 * @example <caption>Set an error message on a field</caption>
 * hostedFieldsInstance.setMessage({
 *   field: 'number',
 *   message: 'Invalid card number'
 * });
 *
 * @example <caption>Remove the message on a field</caption>
 * hostedFieldsInstance.setMessage({
 *   field: 'number',
 *   message: ''
 * });
 *
 * @returns {void}
 */
HostedFields.prototype.setMessage = function (options) {
  this._bus.emit(events.SET_MESSAGE, {
    field: options.field,
    message: options.message
  });
};

/**
 * Removes a supported attribute from a {@link module:braintree-web/hosted-fields~field field}.
 *
 * @public
 * @param {object} options The options for the attribute you wish to remove.
 * @param {string} options.field The field from which you wish to remove an attribute. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} options.attribute The name of the attribute you wish to remove from the field.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the attribute is removed successfully.
 *
 * @example <caption>Remove the placeholder attribute of a field</caption>
 * hostedFieldsInstance.removeAttribute({
 *   field: 'number',
 *   attribute: 'placeholder'
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.removeAttribute = function (options) {
  var attributeErr, err;

  if (!allowedFields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + options.field + '" is not a valid field. You must use a valid field option when removing an attribute.'
    });
  } else if (!this._fields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot remove attribute for "' + options.field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    attributeErr = attributeValidationError(options.attribute);

    if (attributeErr) {
      err = attributeErr;
    } else {
      this._bus.emit(events.REMOVE_ATTRIBUTE, {
        field: options.field,
        attribute: options.attribute
      });
    }
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * @deprecated since version 3.8.0. Use {@link HostedFields#setAttribute|setAttribute} instead.
 *
 * @public
 * @param {string} field The field whose placeholder you wish to change. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} placeholder Will be used as the `placeholder` attribute of the input.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the placeholder updated successfully.
 *
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 */
HostedFields.prototype.setPlaceholder = function (field, placeholder) {
  return this.setAttribute({
    field: field,
    attribute: 'placeholder',
    value: placeholder
  });
};

/**
 * Clear the value of a {@link module:braintree-web/hosted-fields~field field}.
 * @public
 * @param {string} field The field you wish to clear. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the field cleared successfully.
 * @returns {(Promise|void)} Returns a promise if no callback is provided.
 * @example
 * hostedFieldsInstance.clear('number', function (clearErr) {
 *   if (clearErr) {
 *     console.error(clearErr);
 *   }
 * });
 *
 * @example <caption>Clear several fields</caption>
 * hostedFieldsInstance.clear('number');
 * hostedFieldsInstance.clear('cvv');
 * hostedFieldsInstance.clear('expirationDate');
 */
HostedFields.prototype.clear = function (field) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when clearing a field.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot clear "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.CLEAR_FIELD, {
      field: field
    });
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Programmatically focus a {@link module:braintree-web/hosted-fields~field field}.
 * @public
 * @param {string} field The field you want to focus. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the field focused successfully.
 * @returns {void}
 * @example
 * hostedFieldsInstance.focus('number', function (focusErr) {
 *   if (focusErr) {
 *     console.error(focusErr);
 *   }
 * });
 * @example <caption>Using an event listener</caption>
 * myElement.addEventListener('click', function (e) {
 *   // In Firefox, the focus method can be suppressed
 *   //   if the element has a tabindex property or the element
 *   //   is an anchor link with an href property.
 *   e.preventDefault();
 *   hostedFieldsInstance.focus('number');
 * });
 */
HostedFields.prototype.focus = function (field) {
  var err;
  var fieldConfig = this._fields[field];

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when focusing a field.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot focus "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    fieldConfig.frameElement.focus();

    this._bus.emit(events.TRIGGER_INPUT_FOCUS, {
      field: field
    });

    if (browserDetection.isIos()) {
      // Inputs outside of the viewport don't always scroll into view on
      // focus in iOS Safari. 5ms timeout gives the browser a chance to
      // do the right thing and prevents stuttering.
      setTimeout(function () {
        if (!isVisibleEnough(fieldConfig.containerElement)) {
          fieldConfig.containerElement.scrollIntoView();
        }
      }, SAFARI_FOCUS_TIMEOUT);
    }
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Returns an {@link HostedFields~stateObject|object} that includes the state of all fields and possible card types.
 * @public
 * @returns {object} {@link HostedFields~stateObject|stateObject}
 * @example <caption>Check if all fields are valid</caption>
 * var state = hostedFieldsInstance.getState();
 *
 * var formValid = Object.keys(state.fields).every(function (key) {
 *   return state.fields[key].isValid;
 * });
 */
HostedFields.prototype.getState = function () {
  return this._state;
};

// React adds decorations to DOM nodes that cause
// circular dependencies, so we remove them from the
// config before sending it to the iframes. However,
// we don't want to mutate the original object that
// was passed in, so we create fresh objects via assign
function formatMerchantConfigurationForIframes(config) {
  var formattedConfig = assign({}, config);

  formattedConfig.fields = assign({}, formattedConfig.fields);
  Object.keys(formattedConfig.fields).forEach(function (field) {
    formattedConfig.fields[field] = assign({}, formattedConfig.fields[field]);
    delete formattedConfig.fields[field].container;
  });

  return formattedConfig;
}

module.exports = wrapPromise.wrapPrototype(HostedFields);

},{"../../lib/analytics":82,"../../lib/assign":84,"../../lib/braintree-error":87,"../../lib/constants":88,"../../lib/convert-methods-to-error":89,"../../lib/create-assets-url":91,"../../lib/create-deferred-client":93,"../../lib/destructor":95,"../../lib/errors":97,"../../lib/find-root-node":98,"../../lib/is-verified-domain":100,"../../lib/methods":102,"../../lib/promise":104,"../../lib/shadow":106,"../shared/browser-detection":75,"../shared/constants":76,"../shared/errors":77,"../shared/find-parent-tags":78,"../shared/focus-intercept":79,"../shared/get-card-types":80,"./attribute-validation-error":68,"./compose-url":69,"./focus-change":70,"./get-styles-from-class":71,"./inject-frame":73,"@braintree/class-list":33,"@braintree/event-emitter":34,"@braintree/iframer":36,"@braintree/uuid":40,"@braintree/wrap-promise":44,"framebus":118}],73:[function(require,module,exports){
'use strict';

var focusIntercept = require('../shared/focus-intercept');
var directions = require('../shared/constants').navigationDirections;

module.exports = function injectFrame(id, frame, container, focusHandler) {
  var frameType = frame.getAttribute('type');
  var clearboth = document.createElement('div');
  var fragment = document.createDocumentFragment();
  var focusInterceptBefore = focusIntercept.generate(id, frameType, directions.BACK, focusHandler);
  var focusInterceptAfter = focusIntercept.generate(id, frameType, directions.FORWARD, focusHandler);

  clearboth.style.clear = 'both';

  fragment.appendChild(focusInterceptBefore);
  fragment.appendChild(frame);
  fragment.appendChild(focusInterceptAfter);
  fragment.appendChild(clearboth);

  container.appendChild(fragment);

  return [frame, clearboth];
};

},{"../shared/constants":76,"../shared/focus-intercept":79}],74:[function(require,module,exports){
'use strict';
/** @module braintree-web/hosted-fields */

var HostedFields = require('./external/hosted-fields');
var basicComponentVerification = require('../lib/basic-component-verification');
var errors = require('./shared/errors');
var supportsInputFormatting = require('restricted-input/supports-input-formatting');
var wrapPromise = require('@braintree/wrap-promise');
var BraintreeError = require('../lib/braintree-error');
var Promise = require('../lib/promise');
var VERSION = "3.78.3";

/**
 * Fields used in {@link module:braintree-web/hosted-fields~fieldOptions fields options}
 * @typedef {object} field
 * @property {string} selector Deprecated: Now an alias for `options.container`.
 * @property {(string|HTMLElement)} container A DOM node or CSS selector to find the container where the hosted field will be inserted.
 * @property {string} [placeholder] Will be used as the `placeholder` attribute of the input. If `placeholder` is not natively supported by the browser, it will be polyfilled.
 * @property {string} [type] Will be used as the `type` attribute of the input. To mask `cvv` input, for instance, `type: "password"` can be used.
 * @property {string} [internalLabel] Each Hosted Field iframe has a hidden label that is used by screen readers to identify the input. The `internalLabel` property can be used to customize the field for localization purposes. The default values are:
 * * number: Credit Card Number
 * * cvv: CVV
 * * expirationDate: Expiration Date
 * * expirationMonth: Expiration Month
 * * expirationYear: Expiration Year
 * * postalCode: Postal Code
 * * cardholderName: Cardholder Name
 * @property {boolean} [formatInput=true] Enable or disable automatic formatting on this field.
 * @property {(object|boolean)} [maskInput=false] Enable or disable input masking when input is not focused. If set to `true` instead of an object, the defaults for the `maskInput` parameters will be used.
 * @property {string} [maskInput.character=•] The character to use when masking the input. The default character ('•') uses a unicode symbol, so the webpage must support UTF-8 characters when using the default.
 * @property {Boolean} [maskInput.showLastFour=false] Only applicable for the credit card field. Whether or not to show the last 4 digits of the card when masking.
 * @property {(object|boolean)} [select] If truthy, this field becomes a `<select>` dropdown list. This can only be used for `expirationMonth` and `expirationYear` fields. If you do not use a `placeholder` property for the field, the current month/year will be the default selected value.
 * @property {string[]} [select.options] An array of 12 strings, one per month. This can only be used for the `expirationMonth` field. For example, the array can look like `['01 - January', '02 - February', ...]`.
 * @property {number} [maxCardLength] This option applies only to the number field. Allows a limit to the length of the card number, even if the card brand may support numbers of a greater length. If the value passed is greater than the max length for a card brand, the smaller number of the 2 values will be used. For example, is `maxCardLength` is set to 16, but an American Express card is entered (which has a max card length of 15), a max card length of 15 will be used.
 * @property {number} [maxlength] This option applies only to the CVV and postal code fields. Will be used as the `maxlength` attribute of the input. The primary use cases for the `maxlength` option are: limiting the length of the CVV input for CVV-only verifications when the card type is known and setting the length of the postal code input when cards are coming from a known region. The default `maxlength` for the postal code input is `10`.
 * @property {number} [minlength=3] This option applies only to the cvv and postal code fields. Will be used as the `minlength` attribute of the input.
 * For postal code fields, the default value is 3, representing the Icelandic postal code length. This option's primary use case is to increase the `minlength`, e.g. for US customers, the postal code `minlength` can be set to 5.
 * For cvv fields, the default value is 3. The `minlength` attribute only applies to integrations capturing a cvv without a number field.
 * @property {string} [prefill] A value to prefill the field with. For example, when creating an update card form, you can prefill the expiration date fields with the old expiration date data.
 * @property {boolean} [rejectUnsupportedCards=false] Deprecated since version 3.46.0, use `supportedCardBrands` instead. Only allow card types that your merchant account is able to process. Unsupported card types will invalidate the card form. e.g. if you only process Visa cards, a customer entering a American Express card would get an invalid card field. This can only be used for the `number` field.
 * @property {object} [supportedCardBrands] Override card brands that are supported by the card form. Pass `'card-brand-id': true` to override the default in the merchant configuration and enable a card brand. Pass `'card-brand-id': false` to disable a card brand. Unsupported card types will invalidate the card form. e.g. if you only process Visa cards, a customer entering an American Express card would get an invalid card field. This can only be used for the  `number` field. (Note: only allow card types that your merchant account is actually able to process.)
 *
 * Valid card brand ids are:
 * * visa
 * * mastercard
 * * american-express
 * * diners-club
 * * discover
 * * jcb
 * * union-pay
 * * maestro
 * * elo
 * * mir
 * * hiper
 * * hipercard
 */

/**
 * An object that has {@link module:braintree-web/hosted-fields~field field objects} for each field. Used in {@link module:braintree-web/hosted-fields~create create}.
 * @typedef {object} fieldOptions
 * @property {field} [number] A field for card number.
 * @property {field} [expirationDate] A field for expiration date in `MM/YYYY` or `MM/YY` format. This should not be used with the `expirationMonth` and `expirationYear` properties.
 * @property {field} [expirationMonth] A field for expiration month in `MM` format. This should be used with the `expirationYear` property.
 * @property {field} [expirationYear] A field for expiration year in `YYYY` or `YY` format. This should be used with the `expirationMonth` property.
 * @property {field} [cvv] A field for 3 or 4 digit card verification code (like CVV or CID). If you wish to create a CVV-only payment method nonce to verify a card already stored in your Vault, omit all other fields to only collect CVV.
 * @property {field} [postalCode] A field for postal or region code.
 * @property {field} [cardholderName] A field for the cardholder name on the customer's credit card.
 */

/**
 * An object that represents CSS that will be applied in each hosted field. This object looks similar to CSS. Typically, these styles involve fonts (such as `font-family` or `color`).
 *
 * You may also pass the name of a class on your site that contains the styles you would like to apply. The style properties will be automatically pulled off the class and applied to the Hosted Fields inputs. Note: this is recommended for `input` elements only. If using a `select` for the expiration date, unexpected styling may occur.
 *
 * These are the CSS properties that Hosted Fields supports. Any other CSS should be specified on your page and outside of any Braintree configuration. Trying to set unsupported properties will fail and put a warning in the console.
 *
 * Supported CSS properties are:
 * `appearance`
 * `box-shadow`
 * `color`
 * `direction`
 * `font-family`
 * `font-size-adjust`
 * `font-size`
 * `font-stretch`
 * `font-style`
 * `font-variant-alternates`
 * `font-variant-caps`
 * `font-variant-east-asian`
 * `font-variant-ligatures`
 * `font-variant-numeric`
 * `font-variant`
 * `font-weight`
 * `font`
 * `letter-spacing`
 * `line-height`
 * `opacity`
 * `outline`
 * `margin`
 * `margin-top`
 * `margin-right`
 * `margin-bottom`
 * `margin-left`
 * `padding`
 * `padding-top`
 * `padding-right`
 * `padding-bottom`
 * `padding-left`
 * `text-align`
 * `text-shadow`
 * `transition`
 * `-moz-appearance`
 * `-moz-box-shadow`
 * `-moz-osx-font-smoothing`
 * `-moz-tap-highlight-color`
 * `-moz-transition`
 * `-webkit-appearance`
 * `-webkit-box-shadow`
 * `-webkit-font-smoothing`
 * `-webkit-tap-highlight-color`
 * `-webkit-transition`
 * @typedef {object} styleOptions
 */

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} [options.client] A {@link Client} instance.
 * @param {string} [options.authorization] A tokenizationKey or clientToken. Can be used in place of `options.client`.
 * @param {fieldOptions} options.fields A {@link module:braintree-web/hosted-fields~fieldOptions set of options for each field}.
 * @param {styleOptions} [options.styles] {@link module:braintree-web/hosted-fields~styleOptions Styles} applied to each field.
 * @param {boolean} [options.preventAutofill=false] When true, browsers will not try to prompt the customer to autofill their credit card information.
 * @param {callback} [callback] The second argument, `data`, is the {@link HostedFields} instance. If no callback is provided, `create` returns a promise that resolves with the {@link HostedFields} instance.
 * @returns {void}
 * @example
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': {
 *       'font-size': '16pt',
 *       'color': '#3A3A3A'
 *     },
 *     '.number': {
 *       'font-family': 'monospace'
 *     },
 *     '.valid': {
 *       'color': 'green'
 *     }
 *   },
 *   fields: {
 *     number: {
 *       container: '#card-number'
 *     },
 *     cvv: {
 *       container: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       container: '#expiration-date'
 *     }
 *   }
 * }, callback);
 * @example <caption>With cardholder name</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     number: {
 *       container: '#card-number'
 *     },
 *     cardholderName: {
 *       container: '#cardholder-name'
 *     },
 *     cvv: {
 *       container: '#cvv',
 *     },
 *     expirationDate: {
 *       container: '#expiration-date'
 *     }
 *   }
 * }, callback);
 * @example <caption>Applying styles with a class name</caption>
 * // in document head
 * <style>
 *   .braintree-input-class {
 *     color: black;
 *   }
 *   .braintree-valid-class {
 *     color: green;
 *   }
 *   .braintree-invalid-class {
 *     color: red;
 *   }
 * </style>
 * // in a script tag
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': 'braintree-input-class',
 *     '.invalid': 'braintree-invalid-class',
 *     '.valid': {
 *       // you can also use the object syntax alongside
 *       // the class name syntax
 *       color: green;
 *     }
 *   },
 *   fields: {
 *     number: {
 *       container: '#card-number'
 *     },
 *     // etc...
 *   }
 * }, callback);
 * @example <caption>Right to Left Language Support</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': {
 *       // other styles
 *       direction: 'rtl'
 *     },
 *   },
 *   fields: {
 *     number: {
 *       container: '#card-number',
 *       // Credit card formatting is not currently supported
 *       // with RTL languages, so we need to turn it off for the number input
 *       formatInput: false
 *     },
 *     cvv: {
 *       container: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       container: '#expiration-date',
 *       type: 'month'
 *     }
 *   }
 * }, callback);
 * @example <caption>Setting up Hosted Fields to tokenize CVV only</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     // Only add the `cvv` option.
 *     cvv: {
 *       container: '#cvv',
 *       placeholder: '•••'
 *     }
 *   }
 * }, callback);
 * @example <caption>Creating an expiration date update form with prefilled data</caption>
 * var storedCreditCardInformation = {
 *   // get this info from your server
 *   // with a payment method lookup
 *   month: '09',
 *   year: '2017'
 * };
 *
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     expirationMonth: {
 *       container: '#expiration-month',
 *       prefill: storedCreditCardInformation.month
 *     },
 *     expirationYear: {
 *       container: '#expiration-year',
 *       prefill: storedCreditCardInformation.year
 *     }
 *   }
 * }, callback);
 * @example <caption>Validate the card form for supported card types</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     number: {
 *       container: '#card-number',
 *       supportedCardBrands: {
 *         visa: false, // prevents Visas from showing up as valid even when the Braintree control panel is configured to allow them
 *         'diners-club': true // allow Diners Club cards to be valid (processed as Discover cards on the Braintree backend)
 *       }
 *     },
 *     cvv: {
 *       container: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       container: '#expiration-date',
 *       type: 'month'
 *     }
 *   },
 * }, callback);
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Hosted Fields',
    authorization: options.authorization,
    client: options.client
  }).then(function () {
    var integration = new HostedFields(options);

    return new Promise(function (resolve, reject) {
      integration.on('ready', function () {
        resolve(integration);
      });
      integration.on('timeout', function () {
        reject(new BraintreeError(errors.HOSTED_FIELDS_TIMEOUT));
      });
    });
  });
}

module.exports = {
  /**
   * @static
   * @function supportsInputFormatting
   * @description Returns false if input formatting will be automatically disabled due to browser incompatibility. Otherwise, returns true. For a list of unsupported browsers, [go here](https://github.com/braintree/restricted-input/blob/main/README.md#browsers-where-formatting-is-turned-off-automatically).
   * @returns {Boolean} Returns false if input formatting will be automatically disabled due to browser incompatibility. Otherwise, returns true.
   * @example
   * <caption>Conditionally choosing split expiration date inputs if formatting is unavailable</caption>
   * var canFormat = braintree.hostedFields.supportsInputFormatting();
   * var fields = {
   *   number: {
   *     container: '#card-number'
   *   },
   *   cvv: {
   *     container: '#cvv'
   *   }
   * };
   *
   * if (canFormat) {
   *   fields.expirationDate = {
   *     selection: '#expiration-date'
   *   };
   *   functionToCreateAndInsertExpirationDateDivToForm();
   * } else {
   *   fields.expirationMonth = {
   *     selection: '#expiration-month'
   *   };
   *   fields.expirationYear = {
   *     selection: '#expiration-year'
   *   };
   *   functionToCreateAndInsertExpirationMonthAndYearDivsToForm();
   * }
   *
   * braintree.hostedFields.create({
   *   client: clientInstance,
   *   styles: {
   *     // Styles
   *   },
   *   fields: fields
   * }, callback);
   */
  supportsInputFormatting: supportsInputFormatting,
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/basic-component-verification":85,"../lib/braintree-error":87,"../lib/promise":104,"./external/hosted-fields":72,"./shared/errors":77,"@braintree/wrap-promise":44,"restricted-input/supports-input-formatting":134}],75:[function(require,module,exports){
'use strict';

var isAndroid = require('@braintree/browser-detection/is-android');
var isChromeOS = require('@braintree/browser-detection/is-chrome-os');
var isIos = require('@braintree/browser-detection/is-ios');
var isChrome = require('@braintree/browser-detection/is-chrome');

function hasSoftwareKeyboard() {
  return isAndroid() || isChromeOS() || isIos();
}

function isChromeIos() {
  return isChrome() && isIos();
}

module.exports = {
  isIE: require('@braintree/browser-detection/is-ie'),
  isEdge: require('@braintree/browser-detection/is-edge'),
  isIe9: require('@braintree/browser-detection/is-ie9'),
  isIe10: require('@braintree/browser-detection/is-ie10'),
  isAndroid: isAndroid,
  isChromeOS: isChromeOS,
  isChromeIos: isChromeIos,
  isFirefox: require('@braintree/browser-detection/is-firefox'),
  isIos: isIos,
  isIosWebview: require('@braintree/browser-detection/is-ios-webview'),
  hasSoftwareKeyboard: hasSoftwareKeyboard
};

},{"@braintree/browser-detection/is-android":23,"@braintree/browser-detection/is-chrome":25,"@braintree/browser-detection/is-chrome-os":24,"@braintree/browser-detection/is-edge":26,"@braintree/browser-detection/is-firefox":27,"@braintree/browser-detection/is-ie":28,"@braintree/browser-detection/is-ie10":29,"@braintree/browser-detection/is-ie9":30,"@braintree/browser-detection/is-ios":32,"@braintree/browser-detection/is-ios-webview":31}],76:[function(require,module,exports){
'use strict';

var enumerate = require('../../lib/enumerate');
var errors = require('./errors');
var VERSION = "3.78.3";

var constants = {
  VERSION: VERSION,
  maxExpirationYearAge: 19,
  externalEvents: {
    FOCUS: 'focus',
    BLUR: 'blur',
    EMPTY: 'empty',
    NOT_EMPTY: 'notEmpty',
    VALIDITY_CHANGE: 'validityChange',
    CARD_TYPE_CHANGE: 'cardTypeChange'
  },
  defaultMaxLengths: {
    number: 19,
    postalCode: 8,
    expirationDate: 7,
    expirationMonth: 2,
    expirationYear: 4,
    cvv: 3
  },
  externalClasses: {
    FOCUSED: 'braintree-hosted-fields-focused',
    INVALID: 'braintree-hosted-fields-invalid',
    VALID: 'braintree-hosted-fields-valid'
  },
  navigationDirections: {
    BACK: 'before',
    FORWARD: 'after'
  },
  defaultIFrameStyle: {
    border: 'none',
    width: '100%',
    height: '100%',
    'float': 'left'
  },
  tokenizationErrorCodes: {
    81724: errors.HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE,
    // NEXT_MAJOR_VERSION this error triggers for both AVS and CVV errors
    // but the code name implies that it would only trigger for CVV verification
    // failures
    81736: errors.HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED
  },
  allowedStyles: [
    '-moz-appearance',
    '-moz-box-shadow',
    '-moz-osx-font-smoothing',
    '-moz-tap-highlight-color',
    '-moz-transition',
    '-webkit-appearance',
    '-webkit-box-shadow',
    '-webkit-font-smoothing',
    '-webkit-tap-highlight-color',
    '-webkit-transition',
    'appearance',
    'box-shadow',
    'color',
    'direction',
    'font',
    'font-family',
    'font-size',
    'font-size-adjust',
    'font-stretch',
    'font-style',
    'font-variant',
    'font-variant-alternates',
    'font-variant-caps',
    'font-variant-east-asian',
    'font-variant-ligatures',
    'font-variant-numeric',
    'font-weight',
    'letter-spacing',
    'line-height',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'opacity',
    'outline',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'text-align',
    'text-shadow',
    'transition'
  ],
  allowedFields: {
    cardholderName: {
      name: 'cardholder-name',
      label: 'Cardholder Name'
    },
    number: {
      name: 'credit-card-number',
      label: 'Credit Card Number'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV'
    },
    expirationDate: {
      name: 'expiration',
      label: 'Expiration Date'
    },
    expirationMonth: {
      name: 'expiration-month',
      label: 'Expiration Month'
    },
    expirationYear: {
      name: 'expiration-year',
      label: 'Expiration Year'
    },
    postalCode: {
      name: 'postal-code',
      label: 'Postal Code'
    }
  },
  allowedAttributes: {
    'aria-invalid': 'boolean',
    'aria-required': 'boolean',
    disabled: 'boolean',
    placeholder: 'string'
  },
  autocompleteMappings: {
    'cardholder-name': 'cc-name',
    'credit-card-number': 'cc-number',
    expiration: 'cc-exp',
    'expiration-month': 'cc-exp-month',
    'expiration-year': 'cc-exp-year',
    cvv: 'cc-csc',
    'postal-code': 'billing postal-code'
  }
};

constants.events = enumerate([
  'ADD_CLASS',
  'AUTOFILL_DATA_AVAILABLE',
  'BIN_AVAILABLE',
  'CARD_FORM_ENTRY_HAS_BEGUN',
  'CLEAR_FIELD',
  'CONFIGURATION',
  'FRAME_READY',
  'INPUT_EVENT',
  'READY_FOR_CLIENT',
  'REMOVE_ATTRIBUTE',
  'REMOVE_CLASS',
  'REMOVE_FOCUS_INTERCEPTS',
  'SET_ATTRIBUTE',
  'SET_MESSAGE',
  'SET_MONTH_OPTIONS',
  'TOKENIZATION_REQUEST',
  'TRIGGER_FOCUS_CHANGE',
  'TRIGGER_INPUT_FOCUS',
  'VALIDATE_STRICT'
], 'hosted-fields:');

module.exports = constants;

},{"../../lib/enumerate":96,"./errors":77}],77:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Hosted Fields - Creation Error Codes
 * @description Errors that occur when [creating the Hosted Fields component](./module-braintree-web_hosted-fields.html#.create).
 * @property {UNKNOWN} HOSTED_FIELDS_TIMEOUT Occurs when Hosted Fields does not finish setting up within 60 seconds.
 * @property {MERCHANT} HOSTED_FIELDS_INVALID_FIELD_KEY Occurs when Hosted Fields is instantiated with an invalid Field option.
 * @property {MERCHANT} HOSTED_FIELDS_INVALID_FIELD_SELECTOR Occurs when Hosted Fields given a field selector that is not valid.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME Occurs when Hosted Fields given a field selector that already contains an iframe.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_PROPERTY_INVALID Occurs when a field configuration option is not valid.
 */

/**
 * @name BraintreeError.Hosted Fields - Field Manipulation Error Codes
 * @description Errors that occur when modifying fields through [`addClass`](./HostedFields.html#addClass), [`removeClass`](./HostedFields.html#removeClass), [`setAttribute`](./HostedFields.html#setAttribute), [`removeAttribute`](./HostedFields.html#removeAttribute), [`clear`](./HostedFields.html#clear), [`focus`](./HostedFields.html#focus), and [`setMonthOptions`](./HostedFields.html#setMonthOptions).
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_INVALID Occurs when attempting to modify a field that is not a valid Hosted Fields option.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_NOT_PRESENT Occurs when attempting to modify a field that is not configured with Hosted Fields.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_PROPERTY_INVALID Occurs when a field configuration option is not valid.
 */

/**
 * @name BraintreeError.Hosted Fields - Set Attribute Error Codes
 * @description Errors that occur when using the [`setAttribute` method](./HostedFields.html#setAttribute)
 * @property {MERCHANT} HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED Occurs when trying to set an attribute that is not supported to be set.
 * @property {MERCHANT} HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED Occurs when the type of value for an attribute is not allowed to be set.
 */

/**
 * @name BraintreeError.Hosted Fields - Tokenize Error Codes
 * @description Errors that occur when [tokenizing the card details with Hosted Fields](./HostedFields.html#tokenize).
 * @property {NETWORK} HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR Occurs when the Braintree gateway cannot be contacted.
 * @property {CUSTOMER} HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE Occurs when attempting to vault a card, but the client token being used is configured to fail if the card already exists in the vault.
 * @property {CUSTOMER} HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED Occurs when cvv verification is turned on in the Braintree control panel.
 * @property {CUSTOMER} HOSTED_FIELDS_FAILED_TOKENIZATION Occurs when the credit card details were sent to Braintree, but failed to tokenize.
 * @property {CUSTOMER} HOSTED_FIELDS_FIELDS_EMPTY Occurs when all the Hosted Fields inputs are empty.
 * @property {CUSTOMER} HOSTED_FIELDS_FIELDS_INVALID Occurs when one ore more fields are invalid.
 */

var BraintreeError = require('../../lib/braintree-error');

module.exports = {
  HOSTED_FIELDS_TIMEOUT: {
    type: BraintreeError.types.UNKNOWN,
    code: 'HOSTED_FIELDS_TIMEOUT',
    message: 'Hosted Fields timed out when attempting to set up.'
  },
  HOSTED_FIELDS_INVALID_FIELD_KEY: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_INVALID_FIELD_KEY'
  },
  HOSTED_FIELDS_INVALID_FIELD_SELECTOR: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_INVALID_FIELD_SELECTOR',
    message: 'Selector does not reference a valid DOM node.'
  },
  HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME',
    message: 'Element already contains a Braintree iframe.'
  },
  HOSTED_FIELDS_FIELD_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_INVALID'
  },
  HOSTED_FIELDS_FIELD_NOT_PRESENT: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_NOT_PRESENT'
  },
  HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR',
    message: 'A tokenization network error occurred.'
  },
  HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE',
    message: 'This credit card already exists in the merchant\'s vault.'
  },
  HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED',
    message: 'CVV verification failed during tokenization.'
  },
  HOSTED_FIELDS_FAILED_TOKENIZATION: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FAILED_TOKENIZATION',
    message: 'The supplied card data failed tokenization.'
  },
  HOSTED_FIELDS_FIELDS_EMPTY: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FIELDS_EMPTY',
    message: 'All fields are empty. Cannot tokenize empty card fields.'
  },
  HOSTED_FIELDS_FIELDS_INVALID: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FIELDS_INVALID',
    message: 'Some payment input fields are invalid. Cannot tokenize invalid card fields.'
  },
  HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED'
  },
  HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED'
  },
  HOSTED_FIELDS_FIELD_PROPERTY_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_PROPERTY_INVALID'
  }
};

},{"../../lib/braintree-error":87}],78:[function(require,module,exports){
'use strict';

function findParentTags(element, tag) {
  var parent = element.parentNode;
  var parents = [];

  while (parent != null) {
    if (parent.tagName != null && parent.tagName.toLowerCase() === tag) {
      parents.push(parent);
    }

    parent = parent.parentNode;
  }

  return parents;
}

module.exports = findParentTags;

},{}],79:[function(require,module,exports){
'use strict';

var browserDetection = require('./browser-detection');
var classList = require('@braintree/class-list');
var constants = require('./constants');
var allowedFields = Object.keys(constants.allowedFields);
var directions = constants.navigationDirections;

var focusIntercept = {
  generate: function (hostedFieldsId, type, direction, handler) {
    var input = document.createElement('input');
    var focusInterceptStyles = {
      border: 'none !important',
      display: 'block !important',
      height: '1px !important',
      left: '-1px !important',
      opacity: '0 !important',
      position: 'absolute !important',
      top: '-1px !important',
      width: '1px !important'
    };
    var shouldCreateFocusIntercept = browserDetection.hasSoftwareKeyboard() ||
      browserDetection.isFirefox() || browserDetection.isIE();

    if (!shouldCreateFocusIntercept) { return document.createDocumentFragment(); }

    input.setAttribute('aria-hidden', 'true');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('data-braintree-direction', direction);
    input.setAttribute('data-braintree-type', type);
    input.setAttribute('id', 'bt-' + type + '-' + direction + '-' + hostedFieldsId);
    input.setAttribute('style',
      JSON.stringify(focusInterceptStyles)
        .replace(/[{}"]/g, '')
        .replace(/,/g, ';'));

    classList.add(input, 'focus-intercept');

    input.addEventListener('focus', function (event) {
      handler(event);

      /*
        Certain browsers without software keyboards (Firefox, Internet
        Explorer) need the focus intercept inputs that get inserted
        around the actual input to blur themselves, otherwise the
        browser gets confused about what should have focus. Can't
        apply this to browsers with software keyboards however,
        because it blurs everything, and focus on the actual input is
        also lost.
      */
      if (!browserDetection.hasSoftwareKeyboard()) {
        input.blur();
      }
    });

    return input;
  },
  destroy: function (idString) {
    var focusInputs;

    if (!idString) {
      focusInputs = document.querySelectorAll('[data-braintree-direction]');
      focusInputs = [].slice.call(focusInputs);
    } else {
      focusInputs = [document.getElementById(idString)];
    }

    focusInputs.forEach(function (node) {
      if (node && node.nodeType === 1 && focusIntercept.matchFocusElement(node.getAttribute('id'))) {
        node.parentNode.removeChild(node);
      }
    });
  },
  matchFocusElement: function (idString) {
    var idComponents, hasBTPrefix, isAllowedType, isValidDirection;

    if (!idString) { return false; }

    idComponents = idString.split('-');

    if (idComponents.length < 4) { return false; }

    hasBTPrefix = idComponents[0] === 'bt';
    isAllowedType = allowedFields.indexOf(idComponents[1]) > -1;
    isValidDirection = idComponents[2] === directions.BACK || idComponents[2] === directions.FORWARD;

    return Boolean(
      hasBTPrefix &&
      isAllowedType &&
      isValidDirection
    );
  }
};

module.exports = focusIntercept;

},{"./browser-detection":75,"./constants":76,"@braintree/class-list":33}],80:[function(require,module,exports){
'use strict';

var creditCardType = require('credit-card-type');

module.exports = function (number) {
  var results = creditCardType(number);

  results.forEach(function (card) {
    // NEXT_MAJOR_VERSION credit-card-type fixed the mastercard enum
    // but we still pass master-card in the braintree API
    // in a major version bump, we can remove this and
    // this will be mastercard instead of master-card
    if (card.type === 'mastercard') {
      card.type = 'master-card';
    }
  });

  return results;
};

},{"credit-card-type":109}],81:[function(require,module,exports){
'use strict';

var createAuthorizationData = require('./create-authorization-data');
var jsonClone = require('./json-clone');
var constants = require('./constants');

function addMetadata(configuration, data) {
  var key;
  var attrs = data ? jsonClone(data) : {};
  var authAttrs = createAuthorizationData(configuration.authorization).attrs;
  var _meta = jsonClone(configuration.analyticsMetadata);

  attrs.braintreeLibraryVersion = constants.BRAINTREE_LIBRARY_VERSION;

  for (key in attrs._meta) {
    if (attrs._meta.hasOwnProperty(key)) {
      _meta[key] = attrs._meta[key];
    }
  }

  attrs._meta = _meta;

  if (authAttrs.tokenizationKey) {
    attrs.tokenizationKey = authAttrs.tokenizationKey;
  } else {
    attrs.authorizationFingerprint = authAttrs.authorizationFingerprint;
  }

  return attrs;
}

module.exports = addMetadata;

},{"./constants":88,"./create-authorization-data":92,"./json-clone":101}],82:[function(require,module,exports){
'use strict';

var Promise = require('./promise');
var constants = require('./constants');
var addMetadata = require('./add-metadata');

function sendAnalyticsEvent(clientInstanceOrPromise, kind, callback) {
  var timestamp = Date.now(); // milliseconds

  return Promise.resolve(clientInstanceOrPromise).then(function (client) {
    var timestampInPromise = Date.now();
    var configuration = client.getConfiguration();
    var request = client._request;
    var url = configuration.gatewayConfiguration.analytics.url;
    var data = {
      analytics: [{
        kind: constants.ANALYTICS_PREFIX + kind,
        isAsync: Math.floor(timestampInPromise / 1000) !== Math.floor(timestamp / 1000),
        timestamp: timestamp
      }]
    };

    request({
      url: url,
      method: 'post',
      data: addMetadata(configuration, data),
      timeout: constants.ANALYTICS_REQUEST_TIMEOUT_MS
    }, callback);
  });
}

module.exports = {
  sendEvent: sendAnalyticsEvent
};

},{"./add-metadata":81,"./constants":88,"./promise":104}],83:[function(require,module,exports){
'use strict';

var loadScript = require('@braintree/asset-loader/load-script');

module.exports = {
  loadScript: loadScript
};

},{"@braintree/asset-loader/load-script":6}],84:[function(require,module,exports){
'use strict';

var assignNormalized = typeof Object.assign === 'function' ? Object.assign : assignPolyfill;

function assignPolyfill(destination) {
  var i, source, key;

  for (i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        destination[key] = source[key];
      }
    }
  }

  return destination;
}

module.exports = {
  assign: assignNormalized,
  _assign: assignPolyfill
};

},{}],85:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');
var Promise = require('./promise');
var sharedErrors = require('./errors');
var VERSION = "3.78.3";

function basicComponentVerification(options) {
  var client, authorization, name;

  if (!options) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INVALID_USE_OF_INTERNAL_FUNCTION.type,
      code: sharedErrors.INVALID_USE_OF_INTERNAL_FUNCTION.code,
      message: 'Options must be passed to basicComponentVerification function.'
    }));
  }

  name = options.name;
  client = options.client;
  authorization = options.authorization;

  if (!client && !authorization) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      // NEXT_MAJOR_VERSION in major version, we expose passing in authorization for all components
      // instead of passing in a client instance. Leave this a silent feature for now.
      message: 'options.client is required when instantiating ' + name + '.'
    }));
  }

  if (!authorization && client.getVersion() !== VERSION) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INCOMPATIBLE_VERSIONS.type,
      code: sharedErrors.INCOMPATIBLE_VERSIONS.code,
      message: 'Client (version ' + client.getVersion() + ') and ' + name + ' (version ' + VERSION + ') components must be from the same SDK version.'
    }));
  }

  return Promise.resolve();
}

module.exports = {
  verify: basicComponentVerification
};

},{"./braintree-error":87,"./errors":97,"./promise":104}],86:[function(require,module,exports){
'use strict';

var once = require('./once');

function call(fn, callback) {
  var isSync = fn.length === 0;

  if (isSync) {
    fn();
    callback(null);
  } else {
    fn(callback);
  }
}

module.exports = function (functions, cb) {
  var i;
  var length = functions.length;
  var remaining = length;
  var callback = once(cb);

  if (length === 0) {
    callback(null);

    return;
  }

  function finish(err) {
    if (err) {
      callback(err);

      return;
    }

    remaining -= 1;
    if (remaining === 0) {
      callback(null);
    }
  }

  for (i = 0; i < length; i++) {
    call(functions[i], finish);
  }
};

},{"./once":103}],87:[function(require,module,exports){
'use strict';

var enumerate = require('./enumerate');

/**
 * @class
 * @global
 * @param {object} options Construction options
 * @classdesc This class is used to report error conditions, frequently as the first parameter to callbacks throughout the Braintree SDK.
 * @description <strong>You cannot use this constructor directly. Interact with instances of this class through {@link callback callbacks}.</strong>
 */
function BraintreeError(options) {
  if (!BraintreeError.types.hasOwnProperty(options.type)) {
    throw new Error(options.type + ' is not a valid type.');
  }

  if (!options.code) {
    throw new Error('Error code required.');
  }

  if (!options.message) {
    throw new Error('Error message required.');
  }

  this.name = 'BraintreeError';

  /**
   * @type {string}
   * @description A code that corresponds to specific errors.
   */
  this.code = options.code;

  /**
   * @type {string}
   * @description A short description of the error.
   */
  this.message = options.message;

  /**
   * @type {BraintreeError.types}
   * @description The type of error.
   */
  this.type = options.type;

  /**
   * @type {object=}
   * @description Additional information about the error, such as an underlying network error response.
   */
  this.details = options.details;
}

BraintreeError.prototype = Object.create(Error.prototype);
BraintreeError.prototype.constructor = BraintreeError;

/**
 * Enum for {@link BraintreeError} types.
 * @name BraintreeError.types
 * @enum
 * @readonly
 * @memberof BraintreeError
 * @property {string} CUSTOMER An error caused by the customer.
 * @property {string} MERCHANT An error that is actionable by the merchant.
 * @property {string} NETWORK An error due to a network problem.
 * @property {string} INTERNAL An error caused by Braintree code.
 * @property {string} UNKNOWN An error where the origin is unknown.
 */
BraintreeError.types = enumerate([
  'CUSTOMER',
  'MERCHANT',
  'NETWORK',
  'INTERNAL',
  'UNKNOWN'
]);

BraintreeError.findRootError = function (err) {
  if (err instanceof BraintreeError && err.details && err.details.originalError) {
    return BraintreeError.findRootError(err.details.originalError);
  }

  return err;
};

module.exports = BraintreeError;

},{"./enumerate":96}],88:[function(require,module,exports){
'use strict';

var VERSION = "3.78.3";
var PLATFORM = 'web';

var CLIENT_API_URLS = {
  production: 'https://api.braintreegateway.com:443',
  sandbox: 'https://api.sandbox.braintreegateway.com:443'
};

var ASSETS_URLS = {
  production: 'https://assets.braintreegateway.com',
  sandbox: 'https://assets.braintreegateway.com'
};

var GRAPHQL_URLS = {
  production: 'https://payments.braintree-api.com/graphql',
  sandbox: 'https://payments.sandbox.braintree-api.com/graphql'
};

module.exports = {
  ANALYTICS_PREFIX: PLATFORM + '.',
  ANALYTICS_REQUEST_TIMEOUT_MS: 2000,
  ASSETS_URLS: ASSETS_URLS,
  CLIENT_API_URLS: CLIENT_API_URLS,
  FRAUDNET_SOURCE: 'BRAINTREE_SIGNIN',
  FRAUDNET_FNCLS: 'fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99',
  FRAUDNET_URL: 'https://c.paypal.com/da/r/fb.js',
  BUS_CONFIGURATION_REQUEST_EVENT: 'BUS_CONFIGURATION_REQUEST',
  GRAPHQL_URLS: GRAPHQL_URLS,
  INTEGRATION_TIMEOUT_MS: 60000,
  VERSION: VERSION,
  INTEGRATION: 'custom',
  SOURCE: 'client',
  PLATFORM: PLATFORM,
  BRAINTREE_LIBRARY_VERSION: 'braintree/' + PLATFORM + '/' + VERSION
};

},{}],89:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');
var sharedErrors = require('./errors');

module.exports = function (instance, methodNames) {
  methodNames.forEach(function (methodName) {
    instance[methodName] = function () {
      throw new BraintreeError({
        type: sharedErrors.METHOD_CALLED_AFTER_TEARDOWN.type,
        code: sharedErrors.METHOD_CALLED_AFTER_TEARDOWN.code,
        message: methodName + ' cannot be called after teardown.'
      });
    };
  });
};

},{"./braintree-error":87,"./errors":97}],90:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');

function convertToBraintreeError(originalErr, btErrorObject) {
  if (originalErr instanceof BraintreeError) {
    return originalErr;
  }

  return new BraintreeError({
    type: btErrorObject.type,
    code: btErrorObject.code,
    message: btErrorObject.message,
    details: {
      originalError: originalErr
    }
  });
}

module.exports = convertToBraintreeError;

},{"./braintree-error":87}],91:[function(require,module,exports){
'use strict';

var ASSETS_URLS = require('./constants').ASSETS_URLS;

function createAssetsUrl(authorization) {

  return ASSETS_URLS.production;
}
/* eslint-enable */

module.exports = {
  create: createAssetsUrl
};

},{"./constants":88}],92:[function(require,module,exports){
'use strict';

var atob = require('../lib/vendor/polyfill').atob;
var CLIENT_API_URLS = require('../lib/constants').CLIENT_API_URLS;

function _isTokenizationKey(str) {
  return /^[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9_]+$/.test(str);
}

function _parseTokenizationKey(tokenizationKey) {
  var tokens = tokenizationKey.split('_');
  var environment = tokens[0];
  var merchantId = tokens.slice(2).join('_');

  return {
    merchantId: merchantId,
    environment: environment
  };
}

function createAuthorizationData(authorization) {
  var parsedClientToken, parsedTokenizationKey;
  var data = {
    attrs: {},
    configUrl: ''
  };

  if (_isTokenizationKey(authorization)) {
    parsedTokenizationKey = _parseTokenizationKey(authorization);
    data.environment = parsedTokenizationKey.environment;
    data.attrs.tokenizationKey = authorization;
    data.configUrl = CLIENT_API_URLS[parsedTokenizationKey.environment] + '/merchants/' + parsedTokenizationKey.merchantId + '/client_api/v1/configuration';
  } else {
    parsedClientToken = JSON.parse(atob(authorization));
    data.environment = parsedClientToken.environment;
    data.attrs.authorizationFingerprint = parsedClientToken.authorizationFingerprint;
    data.configUrl = parsedClientToken.configUrl;
    data.graphQL = parsedClientToken.graphQL;
  }

  return data;
}

module.exports = createAuthorizationData;

},{"../lib/constants":88,"../lib/vendor/polyfill":108}],93:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');
var Promise = require('./promise');
var assets = require('./assets');
var sharedErrors = require('./errors');

var VERSION = "3.78.3";

function createDeferredClient(options) {
  var promise = Promise.resolve();

  if (options.client) {
    return Promise.resolve(options.client);
  }

  if (!(window.braintree && window.braintree.client)) {
    promise = assets.loadScript({
      src: options.assetsUrl + '/web/' + VERSION + '/js/client.min.js'
    }).catch(function (err) {
      return Promise.reject(new BraintreeError({
        type: sharedErrors.CLIENT_SCRIPT_FAILED_TO_LOAD.type,
        code: sharedErrors.CLIENT_SCRIPT_FAILED_TO_LOAD.code,
        message: sharedErrors.CLIENT_SCRIPT_FAILED_TO_LOAD.message,
        details: {
          originalError: err
        }
      }));
    });
  }

  return promise.then(function () {
    if (window.braintree.client.VERSION !== VERSION) {
      return Promise.reject(new BraintreeError({
        type: sharedErrors.INCOMPATIBLE_VERSIONS.type,
        code: sharedErrors.INCOMPATIBLE_VERSIONS.code,
        message: 'Client (version ' + window.braintree.client.VERSION + ') and ' + options.name + ' (version ' + VERSION + ') components must be from the same SDK version.'
      }));
    }

    return window.braintree.client.create({
      authorization: options.authorization,
      debug: options.debug
    });
  });
}

module.exports = {
  create: createDeferredClient
};

},{"./assets":83,"./braintree-error":87,"./errors":97,"./promise":104}],94:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
  return function () {
    // IE9 doesn't support passing arguments to setTimeout so we have to emulate it.
    var args = arguments;

    setTimeout(function () {
      fn.apply(null, args);
    }, 1);
  };
};

},{}],95:[function(require,module,exports){
'use strict';

var batchExecuteFunctions = require('./batch-execute-functions');

function Destructor() {
  this._teardownRegistry = [];

  this._isTearingDown = false;
}

Destructor.prototype.registerFunctionForTeardown = function (fn) {
  if (typeof fn === 'function') {
    this._teardownRegistry.push(fn);
  }
};

Destructor.prototype.teardown = function (callback) {
  if (this._isTearingDown) {
    callback(new Error('Destructor is already tearing down'));

    return;
  }

  this._isTearingDown = true;

  batchExecuteFunctions(this._teardownRegistry, function (err) {
    this._teardownRegistry = [];
    this._isTearingDown = false;

    if (typeof callback === 'function') {
      callback(err);
    }
  }.bind(this));
};

module.exports = Destructor;

},{"./batch-execute-functions":86}],96:[function(require,module,exports){
'use strict';

function enumerate(values, prefix) {
  prefix = prefix == null ? '' : prefix;

  return values.reduce(function (enumeration, value) {
    enumeration[value] = prefix + value;

    return enumeration;
  }, {});
}

module.exports = enumerate;

},{}],97:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Shared Internal Error Codes
 * @ignore
 * @description These codes should never be experienced by the merchant directly.
 * @property {INTERNAL} INVALID_USE_OF_INTERNAL_FUNCTION Occurs when the client is created without a gateway configuration. Should never happen.
 */

/**
 * @name BraintreeError.Shared Errors - Component Creation Error Codes
 * @description Errors that occur when creating components.
 * @property {MERCHANT} INSTANTIATION_OPTION_REQUIRED Occurs when a component is created that is missing a required option.
 * @property {MERCHANT} INCOMPATIBLE_VERSIONS Occurs when a component is created with a client with a different version than the component.
 * @property {NETWORK} CLIENT_SCRIPT_FAILED_TO_LOAD Occurs when a component attempts to load the Braintree client script, but the request fails.
 */

/**
 * @name BraintreeError.Shared Errors - Component Instance Error Codes
 * @description Errors that occur when using instances of components.
 * @property {MERCHANT} METHOD_CALLED_AFTER_TEARDOWN Occurs when a method is called on a component instance after it has been torn down.
 */

var BraintreeError = require('./braintree-error');

module.exports = {
  INVALID_USE_OF_INTERNAL_FUNCTION: {
    type: BraintreeError.types.INTERNAL,
    code: 'INVALID_USE_OF_INTERNAL_FUNCTION'
  },
  INSTANTIATION_OPTION_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'INSTANTIATION_OPTION_REQUIRED'
  },
  INCOMPATIBLE_VERSIONS: {
    type: BraintreeError.types.MERCHANT,
    code: 'INCOMPATIBLE_VERSIONS'
  },
  CLIENT_SCRIPT_FAILED_TO_LOAD: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_SCRIPT_FAILED_TO_LOAD',
    message: 'Braintree client script could not be loaded.'
  },
  METHOD_CALLED_AFTER_TEARDOWN: {
    type: BraintreeError.types.MERCHANT,
    code: 'METHOD_CALLED_AFTER_TEARDOWN'
  }
};

},{"./braintree-error":87}],98:[function(require,module,exports){
'use strict';

module.exports = function findRootNode(element) {
  while (element.parentNode) {
    element = element.parentNode;
  }

  return element;
};

},{}],99:[function(require,module,exports){
'use strict';

function convertDateStringToDate(dateString) {
  var splitDate = dateString.split('-');

  return new Date(splitDate[0], splitDate[1], splitDate[2]);
}

function isDateStringBeforeOrOn(firstDate, secondDate) {
  return convertDateStringToDate(firstDate) <= convertDateStringToDate(secondDate);
}

module.exports = isDateStringBeforeOrOn;

},{}],100:[function(require,module,exports){
'use strict';

var parser;
var legalHosts = {
  'paypal.com': 1,
  'braintreepayments.com': 1,
  'braintreegateway.com': 1,
  'braintree-api.com': 1
};

function stripSubdomains(domain) {
  return domain.split('.').slice(-2).join('.');
}

function isVerifiedDomain(url) {
  var mainDomain;

  url = url.toLowerCase();

  if (!/^https:/.test(url)) {
    return false;
  }

  parser = parser || document.createElement('a');
  parser.href = url;
  mainDomain = stripSubdomains(parser.hostname);

  return legalHosts.hasOwnProperty(mainDomain);
}

module.exports = isVerifiedDomain;

},{}],101:[function(require,module,exports){
'use strict';

module.exports = function (value) {
  return JSON.parse(JSON.stringify(value));
};

},{}],102:[function(require,module,exports){
'use strict';

module.exports = function (obj) {
  return Object.keys(obj).filter(function (key) {
    return typeof obj[key] === 'function';
  });
};

},{}],103:[function(require,module,exports){
'use strict';

function once(fn) {
  var called = false;

  return function () {
    if (!called) {
      called = true;
      fn.apply(null, arguments);
    }
  };
}

module.exports = once;

},{}],104:[function(require,module,exports){
'use strict';

var PromisePolyfill = require('promise-polyfill');
var ExtendedPromise = require('@braintree/extended-promise');

// eslint-disable-next-line no-undef
var PromiseGlobal = typeof Promise !== 'undefined' ? Promise : PromisePolyfill;

ExtendedPromise.suppressUnhandledPromiseMessage = true;
ExtendedPromise.setPromise(PromiseGlobal);

module.exports = PromiseGlobal;

},{"@braintree/extended-promise":35,"promise-polyfill":131}],105:[function(require,module,exports){
'use strict';

function _notEmpty(obj) {
  var key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) { return true; }
  }

  return false;
}

/* eslint-disable no-mixed-operators */
function _isArray(value) {
  return value && typeof value === 'object' && typeof value.length === 'number' &&
    Object.prototype.toString.call(value) === '[object Array]' || false;
}
/* eslint-enable no-mixed-operators */

function hasQueryParams(url) {
  url = url || window.location.href;

  return /\?/.test(url);
}

function parse(url) {
  var query, params;

  url = url || window.location.href;

  if (!hasQueryParams(url)) {
    return {};
  }

  query = url.replace(/#.*$/, '').replace(/^.*\?/, '').split('&');

  params = query.reduce(function (toReturn, keyValue) {
    var parts = keyValue.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts[1]);

    toReturn[key] = value;

    return toReturn;
  }, {});

  return params;
}

function stringify(params, namespace) {
  var k, v, p;
  var query = [];

  for (p in params) {
    if (!params.hasOwnProperty(p)) {
      continue;
    }

    v = params[p];

    if (namespace) {
      if (_isArray(params)) {
        k = namespace + '[]';
      } else {
        k = namespace + '[' + p + ']';
      }
    } else {
      k = p;
    }
    if (typeof v === 'object') {
      query.push(stringify(v, k));
    } else {
      query.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }

  return query.join('&');
}

function queryify(url, params) {
  url = url || '';

  if (params != null && typeof params === 'object' && _notEmpty(params)) {
    url += url.indexOf('?') === -1 ? '?' : '';
    url += url.indexOf('=') !== -1 ? '&' : '';
    url += stringify(params);
  }

  return url;
}

module.exports = {
  parse: parse,
  stringify: stringify,
  queryify: queryify,
  hasQueryParams: hasQueryParams
};

},{}],106:[function(require,module,exports){
'use strict';

var uuid = require('@braintree/uuid');
var findRootNode = require('./find-root-node');

// based on https://github.com/krakenjs/belter/blob/cdddc4f8ddb172d29db9e7e1ad1eeeacfb93e215/src/dom.js#L981-L1031
// thanks @bluepnume

function isShadowElement(element) {
  element = findRootNode(element);

  return element.toString() === '[object ShadowRoot]';
}

function getShadowHost(element) {
  element = findRootNode(element);

  if (!isShadowElement(element)) {
    return null;
  }

  return element.host;
}

function transformToSlot(element, styles) {
  var styleNode = findRootNode(element).querySelector('style');
  var shadowHost = getShadowHost(element);
  var slotName = 'shadow-slot-' + uuid();
  var slot = document.createElement('slot');
  var slotProvider = document.createElement('div');

  slot.setAttribute('name', slotName);
  element.appendChild(slot);

  slotProvider.setAttribute('slot', slotName);
  shadowHost.appendChild(slotProvider);

  if (styles) {
    if (!styleNode) {
      styleNode = document.createElement('style');
      element.appendChild(styleNode);
    }

    styleNode.sheet.insertRule('::slotted([slot="' + slotName + '"]) { ' + styles + ' }');
  }

  if (isShadowElement(shadowHost)) {
    return transformToSlot(slotProvider, styles);
  }

  return slotProvider;
}

module.exports = {
  isShadowElement: isShadowElement,
  getShadowHost: getShadowHost,
  transformToSlot: transformToSlot
};

},{"./find-root-node":98,"@braintree/uuid":40}],107:[function(require,module,exports){
'use strict';

function useMin(isDebug) {
  return isDebug ? '' : '.min';
}

module.exports = useMin;

},{}],108:[function(require,module,exports){
'use strict';

var atobNormalized = typeof atob === 'function' ? window.atob : atobPolyfill;

function atobPolyfill(base64String) {
  var a, b, c, b1, b2, b3, b4, i;
  var base64Matcher = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$');
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var result = '';

  if (!base64Matcher.test(base64String)) {
    throw new Error('Non base64 encoded input passed to window.atob polyfill');
  }

  i = 0;
  do {
    b1 = characters.indexOf(base64String.charAt(i++));
    b2 = characters.indexOf(base64String.charAt(i++));
    b3 = characters.indexOf(base64String.charAt(i++));
    b4 = characters.indexOf(base64String.charAt(i++));

    a = (b1 & 0x3F) << 2 | b2 >> 4 & 0x3;
    b = (b2 & 0xF) << 4 | b3 >> 2 & 0xF;
    c = (b3 & 0x3) << 6 | b4 & 0x3F;

    result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');
  } while (i < base64String.length);

  return result;
}

module.exports = {
  atob: function (base64String) {
    return atobNormalized.call(window, base64String);
  },
  _atob: atobPolyfill
};

},{}],109:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var cardTypes = require("./lib/card-types");
var add_matching_cards_to_results_1 = require("./lib/add-matching-cards-to-results");
var is_valid_input_type_1 = require("./lib/is-valid-input-type");
var find_best_match_1 = require("./lib/find-best-match");
var clone_1 = require("./lib/clone");
var customCards = {};
var cardNames = {
    VISA: "visa",
    MASTERCARD: "mastercard",
    AMERICAN_EXPRESS: "american-express",
    DINERS_CLUB: "diners-club",
    DISCOVER: "discover",
    JCB: "jcb",
    UNIONPAY: "unionpay",
    MAESTRO: "maestro",
    ELO: "elo",
    MIR: "mir",
    HIPER: "hiper",
    HIPERCARD: "hipercard",
};
var ORIGINAL_TEST_ORDER = [
    cardNames.VISA,
    cardNames.MASTERCARD,
    cardNames.AMERICAN_EXPRESS,
    cardNames.DINERS_CLUB,
    cardNames.DISCOVER,
    cardNames.JCB,
    cardNames.UNIONPAY,
    cardNames.MAESTRO,
    cardNames.ELO,
    cardNames.MIR,
    cardNames.HIPER,
    cardNames.HIPERCARD,
];
var testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
function findType(cardType) {
    return customCards[cardType] || cardTypes[cardType];
}
function getAllCardTypes() {
    return testOrder.map(function (cardType) { return clone_1.clone(findType(cardType)); });
}
function getCardPosition(name, ignoreErrorForNotExisting) {
    if (ignoreErrorForNotExisting === void 0) { ignoreErrorForNotExisting = false; }
    var position = testOrder.indexOf(name);
    if (!ignoreErrorForNotExisting && position === -1) {
        throw new Error('"' + name + '" is not a supported card type.');
    }
    return position;
}
function creditCardType(cardNumber) {
    var results = [];
    if (!is_valid_input_type_1.isValidInputType(cardNumber)) {
        return results;
    }
    if (cardNumber.length === 0) {
        return getAllCardTypes();
    }
    testOrder.forEach(function (cardType) {
        var cardConfiguration = findType(cardType);
        add_matching_cards_to_results_1.addMatchingCardsToResults(cardNumber, cardConfiguration, results);
    });
    var bestMatch = find_best_match_1.findBestMatch(results);
    if (bestMatch) {
        return [bestMatch];
    }
    return results;
}
creditCardType.getTypeInfo = function (cardType) {
    return clone_1.clone(findType(cardType));
};
creditCardType.removeCard = function (name) {
    var position = getCardPosition(name);
    testOrder.splice(position, 1);
};
creditCardType.addCard = function (config) {
    var existingCardPosition = getCardPosition(config.type, true);
    customCards[config.type] = config;
    if (existingCardPosition === -1) {
        testOrder.push(config.type);
    }
};
creditCardType.updateCard = function (cardType, updates) {
    var originalObject = customCards[cardType] || cardTypes[cardType];
    if (!originalObject) {
        throw new Error("\"" + cardType + "\" is not a recognized type. Use `addCard` instead.'");
    }
    if (updates.type && originalObject.type !== updates.type) {
        throw new Error("Cannot overwrite type parameter.");
    }
    var clonedCard = clone_1.clone(originalObject);
    clonedCard = __assign(__assign({}, clonedCard), updates);
    customCards[clonedCard.type] = clonedCard;
};
creditCardType.changeOrder = function (name, position) {
    var currentPosition = getCardPosition(name);
    testOrder.splice(currentPosition, 1);
    testOrder.splice(position, 0, name);
};
creditCardType.resetModifications = function () {
    testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
    customCards = {};
};
creditCardType.types = cardNames;
module.exports = creditCardType;

},{"./lib/add-matching-cards-to-results":110,"./lib/card-types":111,"./lib/clone":112,"./lib/find-best-match":113,"./lib/is-valid-input-type":114}],110:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMatchingCardsToResults = void 0;
var clone_1 = require("./clone");
var matches_1 = require("./matches");
function addMatchingCardsToResults(cardNumber, cardConfiguration, results) {
    var i, patternLength;
    for (i = 0; i < cardConfiguration.patterns.length; i++) {
        var pattern = cardConfiguration.patterns[i];
        if (!matches_1.matches(cardNumber, pattern)) {
            continue;
        }
        var clonedCardConfiguration = clone_1.clone(cardConfiguration);
        if (Array.isArray(pattern)) {
            patternLength = String(pattern[0]).length;
        }
        else {
            patternLength = String(pattern).length;
        }
        if (cardNumber.length >= patternLength) {
            clonedCardConfiguration.matchStrength = patternLength;
        }
        results.push(clonedCardConfiguration);
        break;
    }
}
exports.addMatchingCardsToResults = addMatchingCardsToResults;

},{"./clone":112,"./matches":115}],111:[function(require,module,exports){
"use strict";
var cardTypes = {
    visa: {
        niceType: "Visa",
        type: "visa",
        patterns: [4],
        gaps: [4, 8, 12],
        lengths: [16, 18, 19],
        code: {
            name: "CVV",
            size: 3,
        },
    },
    mastercard: {
        niceType: "Mastercard",
        type: "mastercard",
        patterns: [[51, 55], [2221, 2229], [223, 229], [23, 26], [270, 271], 2720],
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVC",
            size: 3,
        },
    },
    "american-express": {
        niceType: "American Express",
        type: "american-express",
        patterns: [34, 37],
        gaps: [4, 10],
        lengths: [15],
        code: {
            name: "CID",
            size: 4,
        },
    },
    "diners-club": {
        niceType: "Diners Club",
        type: "diners-club",
        patterns: [[300, 305], 36, 38, 39],
        gaps: [4, 10],
        lengths: [14, 16, 19],
        code: {
            name: "CVV",
            size: 3,
        },
    },
    discover: {
        niceType: "Discover",
        type: "discover",
        patterns: [6011, [644, 649], 65],
        gaps: [4, 8, 12],
        lengths: [16, 19],
        code: {
            name: "CID",
            size: 3,
        },
    },
    jcb: {
        niceType: "JCB",
        type: "jcb",
        patterns: [2131, 1800, [3528, 3589]],
        gaps: [4, 8, 12],
        lengths: [16, 17, 18, 19],
        code: {
            name: "CVV",
            size: 3,
        },
    },
    unionpay: {
        niceType: "UnionPay",
        type: "unionpay",
        patterns: [
            620,
            [624, 626],
            [62100, 62182],
            [62184, 62187],
            [62185, 62197],
            [62200, 62205],
            [622010, 622999],
            622018,
            [622019, 622999],
            [62207, 62209],
            [622126, 622925],
            [623, 626],
            6270,
            6272,
            6276,
            [627700, 627779],
            [627781, 627799],
            [6282, 6289],
            6291,
            6292,
            810,
            [8110, 8131],
            [8132, 8151],
            [8152, 8163],
            [8164, 8171],
        ],
        gaps: [4, 8, 12],
        lengths: [14, 15, 16, 17, 18, 19],
        code: {
            name: "CVN",
            size: 3,
        },
    },
    maestro: {
        niceType: "Maestro",
        type: "maestro",
        patterns: [
            493698,
            [500000, 504174],
            [504176, 506698],
            [506779, 508999],
            [56, 59],
            63,
            67,
            6,
        ],
        gaps: [4, 8, 12],
        lengths: [12, 13, 14, 15, 16, 17, 18, 19],
        code: {
            name: "CVC",
            size: 3,
        },
    },
    elo: {
        niceType: "Elo",
        type: "elo",
        patterns: [
            401178,
            401179,
            438935,
            457631,
            457632,
            431274,
            451416,
            457393,
            504175,
            [506699, 506778],
            [509000, 509999],
            627780,
            636297,
            636368,
            [650031, 650033],
            [650035, 650051],
            [650405, 650439],
            [650485, 650538],
            [650541, 650598],
            [650700, 650718],
            [650720, 650727],
            [650901, 650978],
            [651652, 651679],
            [655000, 655019],
            [655021, 655058],
        ],
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVE",
            size: 3,
        },
    },
    mir: {
        niceType: "Mir",
        type: "mir",
        patterns: [[2200, 2204]],
        gaps: [4, 8, 12],
        lengths: [16, 17, 18, 19],
        code: {
            name: "CVP2",
            size: 3,
        },
    },
    hiper: {
        niceType: "Hiper",
        type: "hiper",
        patterns: [637095, 63737423, 63743358, 637568, 637599, 637609, 637612],
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVC",
            size: 3,
        },
    },
    hipercard: {
        niceType: "Hipercard",
        type: "hipercard",
        patterns: [606282],
        gaps: [4, 8, 12],
        lengths: [16],
        code: {
            name: "CVC",
            size: 3,
        },
    },
};
module.exports = cardTypes;

},{}],112:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
function clone(originalObject) {
    if (!originalObject) {
        return null;
    }
    return JSON.parse(JSON.stringify(originalObject));
}
exports.clone = clone;

},{}],113:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBestMatch = void 0;
function hasEnoughResultsToDetermineBestMatch(results) {
    var numberOfResultsWithMaxStrengthProperty = results.filter(function (result) { return result.matchStrength; }).length;
    /*
     * if all possible results have a maxStrength property that means the card
     * number is sufficiently long enough to determine conclusively what the card
     * type is
     * */
    return (numberOfResultsWithMaxStrengthProperty > 0 &&
        numberOfResultsWithMaxStrengthProperty === results.length);
}
function findBestMatch(results) {
    if (!hasEnoughResultsToDetermineBestMatch(results)) {
        return null;
    }
    return results.reduce(function (bestMatch, result) {
        if (!bestMatch) {
            return result;
        }
        /*
         * If the current best match pattern is less specific than this result, set
         * the result as the new best match
         * */
        if (Number(bestMatch.matchStrength) < Number(result.matchStrength)) {
            return result;
        }
        return bestMatch;
    });
}
exports.findBestMatch = findBestMatch;

},{}],114:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidInputType = void 0;
function isValidInputType(cardNumber) {
    return typeof cardNumber === "string" || cardNumber instanceof String;
}
exports.isValidInputType = isValidInputType;

},{}],115:[function(require,module,exports){
"use strict";
/*
 * Adapted from https://github.com/polvo-labs/card-type/blob/aaab11f80fa1939bccc8f24905a06ae3cd864356/src/cardType.js#L37-L42
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matches = void 0;
function matchesRange(cardNumber, min, max) {
    var maxLengthToCheck = String(min).length;
    var substr = cardNumber.substr(0, maxLengthToCheck);
    var integerRepresentationOfCardNumber = parseInt(substr, 10);
    min = parseInt(String(min).substr(0, substr.length), 10);
    max = parseInt(String(max).substr(0, substr.length), 10);
    return (integerRepresentationOfCardNumber >= min &&
        integerRepresentationOfCardNumber <= max);
}
function matchesPattern(cardNumber, pattern) {
    pattern = String(pattern);
    return (pattern.substring(0, cardNumber.length) ===
        cardNumber.substring(0, pattern.length));
}
function matches(cardNumber, pattern) {
    if (Array.isArray(pattern)) {
        return matchesRange(cardNumber, pattern[0], pattern[1]);
    }
    return matchesPattern(cardNumber, pattern);
}
exports.matches = matches;

},{}],116:[function(require,module,exports){
var naiveFallback = function () {
	if (typeof self === "object" && self) return self;
	if (typeof window === "object" && window) return window;
	throw new Error("Unable to resolve global `this`");
};

module.exports = (function () {
	if (this) return this;

	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

	// Fallback to standard globalThis if available
	if (typeof globalThis === "object" && globalThis) return globalThis;

	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
	// In all ES5+ engines global object inherits from Object.prototype
	// (if you approached one that doesn't please report)
	try {
		Object.defineProperty(Object.prototype, "__global__", {
			get: function () { return this; },
			configurable: true
		});
	} catch (error) {
		// Unfortunate case of updates to Object.prototype being restricted
		// via preventExtensions, seal or freeze
		return naiveFallback();
	}
	try {
		// Safari case (window.__global__ works, but __global__ does not)
		if (!__global__) return naiveFallback();
		return __global__;
	} finally {
		delete Object.prototype.__global__;
	}
})();

},{}],117:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Framebus = void 0;
var is_not_string_1 = require("./lib/is-not-string");
var subscription_args_invalid_1 = require("./lib/subscription-args-invalid");
var broadcast_1 = require("./lib/broadcast");
var package_payload_1 = require("./lib/package-payload");
var constants_1 = require("./lib/constants");
var DefaultPromise = (typeof window !== "undefined" &&
    window.Promise);
var Framebus = /** @class */ (function () {
    function Framebus(options) {
        if (options === void 0) { options = {}; }
        this.origin = options.origin || "*";
        this.channel = options.channel || "";
        this.verifyDomain = options.verifyDomain;
        this.isDestroyed = false;
        this.listeners = [];
    }
    Framebus.setPromise = function (PromiseGlobal) {
        Framebus.Promise = PromiseGlobal;
    };
    Framebus.target = function (options) {
        return new Framebus(options);
    };
    Framebus.prototype.include = function (childWindow) {
        if (childWindow == null) {
            return false;
        }
        if (childWindow.Window == null) {
            return false;
        }
        if (childWindow.constructor !== childWindow.Window) {
            return false;
        }
        constants_1.childWindows.push(childWindow);
        return true;
    };
    Framebus.prototype.target = function (options) {
        return Framebus.target(options);
    };
    Framebus.prototype.emit = function (eventName, data, reply) {
        if (this.isDestroyed) {
            return false;
        }
        var origin = this.origin;
        eventName = this.namespaceEvent(eventName);
        if (is_not_string_1.isntString(eventName)) {
            return false;
        }
        if (is_not_string_1.isntString(origin)) {
            return false;
        }
        if (typeof data === "function") {
            reply = data;
            data = undefined; // eslint-disable-line no-undefined
        }
        var payload = package_payload_1.packagePayload(eventName, origin, data, reply);
        if (!payload) {
            return false;
        }
        broadcast_1.broadcast(window.top || window.self, payload, origin);
        return true;
    };
    Framebus.prototype.emitAsPromise = function (eventName, data) {
        var _this = this;
        return new Framebus.Promise(function (resolve, reject) {
            var didAttachListener = _this.emit(eventName, data, function (payload) {
                resolve(payload);
            });
            if (!didAttachListener) {
                reject(new Error("Listener not added for \"" + eventName + "\""));
            }
        });
    };
    Framebus.prototype.on = function (eventName, originalHandler) {
        if (this.isDestroyed) {
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var self = this;
        var origin = this.origin;
        var handler = originalHandler;
        eventName = this.namespaceEvent(eventName);
        if (subscription_args_invalid_1.subscriptionArgsInvalid(eventName, handler, origin)) {
            return false;
        }
        if (this.verifyDomain) {
            /* eslint-disable no-invalid-this, @typescript-eslint/ban-ts-comment */
            handler = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // @ts-ignore
                if (self.checkOrigin(this && this.origin)) {
                    originalHandler.apply(void 0, args);
                }
            };
            /* eslint-enable no-invalid-this, @typescript-eslint/ban-ts-comment */
        }
        this.listeners.push({
            eventName: eventName,
            handler: handler,
            originalHandler: originalHandler,
        });
        constants_1.subscribers[origin] = constants_1.subscribers[origin] || {};
        constants_1.subscribers[origin][eventName] = constants_1.subscribers[origin][eventName] || [];
        constants_1.subscribers[origin][eventName].push(handler);
        return true;
    };
    Framebus.prototype.off = function (eventName, originalHandler) {
        var handler = originalHandler;
        if (this.isDestroyed) {
            return false;
        }
        if (this.verifyDomain) {
            for (var i = 0; i < this.listeners.length; i++) {
                var listener = this.listeners[i];
                if (listener.originalHandler === originalHandler) {
                    handler = listener.handler;
                }
            }
        }
        eventName = this.namespaceEvent(eventName);
        var origin = this.origin;
        if (subscription_args_invalid_1.subscriptionArgsInvalid(eventName, handler, origin)) {
            return false;
        }
        var subscriberList = constants_1.subscribers[origin] && constants_1.subscribers[origin][eventName];
        if (!subscriberList) {
            return false;
        }
        for (var i = 0; i < subscriberList.length; i++) {
            if (subscriberList[i] === handler) {
                subscriberList.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Framebus.prototype.teardown = function () {
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;
        for (var i = 0; i < this.listeners.length; i++) {
            var listener = this.listeners[i];
            this.off(listener.eventName, listener.handler);
        }
        this.listeners.length = 0;
    };
    Framebus.prototype.checkOrigin = function (postMessageOrigin) {
        var merchantHost;
        var a = document.createElement("a");
        a.href = location.href;
        if (a.protocol === "https:") {
            merchantHost = a.host.replace(/:443$/, "");
        }
        else if (a.protocol === "http:") {
            merchantHost = a.host.replace(/:80$/, "");
        }
        else {
            merchantHost = a.host;
        }
        var merchantOrigin = a.protocol + "//" + merchantHost;
        if (merchantOrigin === postMessageOrigin) {
            return true;
        }
        if (this.verifyDomain) {
            return this.verifyDomain(postMessageOrigin);
        }
        return true;
    };
    Framebus.prototype.namespaceEvent = function (eventName) {
        if (!this.channel) {
            return eventName;
        }
        return this.channel + ":" + eventName;
    };
    Framebus.Promise = DefaultPromise;
    return Framebus;
}());
exports.Framebus = Framebus;

},{"./lib/broadcast":121,"./lib/constants":122,"./lib/is-not-string":125,"./lib/package-payload":127,"./lib/subscription-args-invalid":129}],118:[function(require,module,exports){
"use strict";
var attach_1 = require("./lib/attach");
var framebus_1 = require("./framebus");
attach_1.attach();
module.exports = framebus_1.Framebus;

},{"./framebus":117,"./lib/attach":119}],119:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detach = exports.attach = void 0;
var message_1 = require("./message");
var isAttached = false;
function attach() {
    if (isAttached || typeof window === "undefined") {
        return;
    }
    isAttached = true;
    window.addEventListener("message", message_1.onmessage, false);
}
exports.attach = attach;
// removeIf(production)
function detach() {
    isAttached = false;
    window.removeEventListener("message", message_1.onmessage, false);
}
exports.detach = detach;
// endRemoveIf(production)

},{"./message":126}],120:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastToChildWindows = void 0;
var broadcast_1 = require("./broadcast");
var constants_1 = require("./constants");
function broadcastToChildWindows(payload, origin, source) {
    for (var i = constants_1.childWindows.length - 1; i >= 0; i--) {
        var childWindow = constants_1.childWindows[i];
        if (childWindow.closed) {
            constants_1.childWindows.splice(i, 1);
        }
        else if (source !== childWindow) {
            broadcast_1.broadcast(childWindow.top, payload, origin);
        }
    }
}
exports.broadcastToChildWindows = broadcastToChildWindows;

},{"./broadcast":121,"./constants":122}],121:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = void 0;
var has_opener_1 = require("./has-opener");
function broadcast(frame, payload, origin) {
    var i = 0;
    var frameToBroadcastTo;
    try {
        frame.postMessage(payload, origin);
        if (has_opener_1.hasOpener(frame) && frame.opener.top !== window.top) {
            broadcast(frame.opener.top, payload, origin);
        }
        // previously, our max value was frame.frames.length
        // but frames.length inherits from window.length
        // which can be overwritten if a developer does
        // `var length = value;` outside of a function
        // scope, it'll prevent us from looping through
        // all the frames. With this, we loop through
        // until there are no longer any frames
        // eslint-disable-next-line no-cond-assign
        while ((frameToBroadcastTo = frame.frames[i])) {
            broadcast(frameToBroadcastTo, payload, origin);
            i++;
        }
    }
    catch (_) {
        /* ignored */
    }
}
exports.broadcast = broadcast;

},{"./has-opener":124}],122:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribers = exports.childWindows = exports.prefix = void 0;
exports.prefix = "/*framebus*/";
exports.childWindows = [];
exports.subscribers = {};

},{}],123:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatch = void 0;
var constants_1 = require("./constants");
function dispatch(origin, event, data, reply, e) {
    if (!constants_1.subscribers[origin]) {
        return;
    }
    if (!constants_1.subscribers[origin][event]) {
        return;
    }
    var args = [];
    if (data) {
        args.push(data);
    }
    if (reply) {
        args.push(reply);
    }
    for (var i = 0; i < constants_1.subscribers[origin][event].length; i++) {
        constants_1.subscribers[origin][event][i].apply(e, args);
    }
}
exports.dispatch = dispatch;

},{"./constants":122}],124:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOpener = void 0;
function hasOpener(frame) {
    if (frame.top !== frame) {
        return false;
    }
    if (frame.opener == null) {
        return false;
    }
    if (frame.opener === frame) {
        return false;
    }
    if (frame.opener.closed === true) {
        return false;
    }
    return true;
}
exports.hasOpener = hasOpener;

},{}],125:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isntString = void 0;
function isntString(str) {
    return typeof str !== "string";
}
exports.isntString = isntString;

},{}],126:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onmessage = void 0;
var is_not_string_1 = require("./is-not-string");
var unpack_payload_1 = require("./unpack-payload");
var dispatch_1 = require("./dispatch");
var broadcast_to_child_windows_1 = require("./broadcast-to-child-windows");
function onmessage(e) {
    if (is_not_string_1.isntString(e.data)) {
        return;
    }
    var payload = unpack_payload_1.unpackPayload(e);
    if (!payload) {
        return;
    }
    var data = payload.eventData;
    var reply = payload.reply;
    dispatch_1.dispatch("*", payload.event, data, reply, e);
    dispatch_1.dispatch(e.origin, payload.event, data, reply, e);
    broadcast_to_child_windows_1.broadcastToChildWindows(e.data, payload.origin, e.source);
}
exports.onmessage = onmessage;

},{"./broadcast-to-child-windows":120,"./dispatch":123,"./is-not-string":125,"./unpack-payload":130}],127:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packagePayload = void 0;
var subscribe_replier_1 = require("./subscribe-replier");
var constants_1 = require("./constants");
function packagePayload(event, origin, data, reply) {
    var packaged;
    var payload = {
        event: event,
        origin: origin,
    };
    if (typeof reply === "function") {
        payload.reply = subscribe_replier_1.subscribeReplier(reply, origin);
    }
    payload.eventData = data;
    try {
        packaged = constants_1.prefix + JSON.stringify(payload);
    }
    catch (e) {
        throw new Error("Could not stringify event: " + e.message);
    }
    return packaged;
}
exports.packagePayload = packagePayload;

},{"./constants":122,"./subscribe-replier":128}],128:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeReplier = void 0;
var framebus_1 = require("../framebus");
var uuid_1 = __importDefault(require("@braintree/uuid"));
function subscribeReplier(fn, origin) {
    var uuid = uuid_1.default();
    function replier(data, replyOriginHandler) {
        fn(data, replyOriginHandler);
        framebus_1.Framebus.target({
            origin: origin,
        }).off(uuid, replier);
    }
    framebus_1.Framebus.target({
        origin: origin,
    }).on(uuid, replier);
    return uuid;
}
exports.subscribeReplier = subscribeReplier;

},{"../framebus":117,"@braintree/uuid":40}],129:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionArgsInvalid = void 0;
var is_not_string_1 = require("./is-not-string");
function subscriptionArgsInvalid(event, fn, origin) {
    if (is_not_string_1.isntString(event)) {
        return true;
    }
    if (typeof fn !== "function") {
        return true;
    }
    return is_not_string_1.isntString(origin);
}
exports.subscriptionArgsInvalid = subscriptionArgsInvalid;

},{"./is-not-string":125}],130:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackPayload = void 0;
var constants_1 = require("./constants");
var package_payload_1 = require("./package-payload");
function unpackPayload(e) {
    var payload;
    if (e.data.slice(0, constants_1.prefix.length) !== constants_1.prefix) {
        return false;
    }
    try {
        payload = JSON.parse(e.data.slice(constants_1.prefix.length));
    }
    catch (err) {
        return false;
    }
    if (payload.reply) {
        var replyOrigin_1 = e.origin;
        var replySource_1 = e.source;
        var replyEvent_1 = payload.reply;
        payload.reply = function reply(replyData) {
            if (!replySource_1) {
                return;
            }
            var replyPayload = package_payload_1.packagePayload(replyEvent_1, replyOrigin_1, replyData);
            if (!replyPayload) {
                return;
            }
            replySource_1.postMessage(replyPayload, replyOrigin_1);
        };
    }
    return payload;
}
exports.unpackPayload = unpackPayload;

},{"./constants":122,"./package-payload":127}],131:[function(require,module,exports){
(function (setImmediate){(function (){
'use strict';

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

function allSettled(arr) {
  var P = this;
  return new P(function(resolve, reject) {
    if (!(arr && typeof arr.length !== 'undefined')) {
      return reject(
        new TypeError(
          typeof arr +
            ' ' +
            arr +
            ' is not iterable(cannot read property Symbol(Symbol.iterator))'
        )
      );
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then;
        if (typeof then === 'function') {
          then.call(
            val,
            function(val) {
              res(i, val);
            },
            function(e) {
              args[i] = { status: 'rejected', reason: e };
              if (--remaining === 0) {
                resolve(args);
              }
            }
          );
          return;
        }
      }
      args[i] = { status: 'fulfilled', value: val };
      if (--remaining === 0) {
        resolve(args);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.allSettled = allSettled;

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

}).call(this)}).call(this,require("timers").setImmediate)
},{"timers":3}],132:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIos = exports.isIE9 = exports.isSamsungBrowser = exports.isAndroidChrome = exports.isKitKatWebview = void 0;
// server side rendering check
var UA = (typeof window !== "undefined" &&
    window.navigator &&
    window.navigator.userAgent);
// TODO remove this when browser detection is converted to typescript
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
var isAndroid = require("@braintree/browser-detection/is-android");
// @ts-ignore
var isChromeOs = require("@braintree/browser-detection/is-chrome-os");
// @ts-ignore
var isChrome = require("@braintree/browser-detection/is-chrome");
// @ts-ignore
var isIos = require("@braintree/browser-detection/is-ios");
exports.isIos = isIos;
// @ts-ignore
var isIE9 = require("@braintree/browser-detection/is-ie9");
exports.isIE9 = isIE9;
/* eslint-enable @typescript-eslint/ban-ts-comment */
// Old Android Webviews used specific versions of Chrome with 0.0.0 as their version suffix
// https://developer.chrome.com/multidevice/user-agent#webview_user_agent
var KITKAT_WEBVIEW_REGEX = /Version\/\d\.\d* Chrome\/\d*\.0\.0\.0/;
function isOldSamsungBrowserOrSamsungWebview(ua) {
    return !isChrome(ua) && ua.indexOf("Samsung") > -1;
}
function isKitKatWebview(ua) {
    if (ua === void 0) { ua = UA; }
    return isAndroid(ua) && KITKAT_WEBVIEW_REGEX.test(ua);
}
exports.isKitKatWebview = isKitKatWebview;
function isAndroidChrome(ua) {
    if (ua === void 0) { ua = UA; }
    return (isAndroid(ua) || isChromeOs(ua)) && isChrome(ua);
}
exports.isAndroidChrome = isAndroidChrome;
function isSamsungBrowser(ua) {
    if (ua === void 0) { ua = UA; }
    return /SamsungBrowser/.test(ua) || isOldSamsungBrowserOrSamsungWebview(ua);
}
exports.isSamsungBrowser = isSamsungBrowser;

},{"@braintree/browser-detection/is-android":23,"@braintree/browser-detection/is-chrome":25,"@braintree/browser-detection/is-chrome-os":24,"@braintree/browser-detection/is-ie9":30,"@braintree/browser-detection/is-ios":32}],133:[function(require,module,exports){
"use strict";
var device_1 = require("./lib/device");
module.exports = function supportsInputFormatting() {
    // Digits get dropped in samsung browser
    return !device_1.isSamsungBrowser();
};

},{"./lib/device":132}],134:[function(require,module,exports){
module.exports = require("./dist/supports-input-formatting");

},{"./dist/supports-input-formatting":133}],135:[function(require,module,exports){
// Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
//
//   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0
//
// The library can be used in node.js app to connect to STOMP brokers over TCP 
// or Web sockets.

// Root of the `stompjs module`

var Stomp = require('./lib/stomp.js');
var StompNode = require('./lib/stomp-node.js');

module.exports = Stomp.Stomp;
module.exports.overTCP = StompNode.overTCP;
module.exports.overWS = StompNode.overWS;
},{"./lib/stomp-node.js":136,"./lib/stomp.js":137}],136:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
 */

(function() {
  var Stomp, net, overTCP, overWS, wrapTCP, wrapWS;

  Stomp = require('./stomp');

  net = require('net');

  Stomp.Stomp.setInterval = function(interval, f) {
    return setInterval(f, interval);
  };

  Stomp.Stomp.clearInterval = function(id) {
    return clearInterval(id);
  };

  wrapTCP = function(port, host) {
    var socket, ws;
    socket = null;
    ws = {
      url: 'tcp:// ' + host + ':' + port,
      send: function(d) {
        return socket.write(d);
      },
      close: function() {
        return socket.end();
      }
    };
    socket = net.connect(port, host, function(e) {
      return ws.onopen();
    });
    socket.on('error', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('close', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('data', function(data) {
      var event;
      event = {
        'data': data.toString()
      };
      return ws.onmessage(event);
    });
    return ws;
  };

  wrapWS = function(url) {
    var WebSocketClient, connection, socket, ws;
    WebSocketClient = require('websocket').client;
    connection = null;
    ws = {
      url: url,
      send: function(d) {
        return connection.sendUTF(d);
      },
      close: function() {
        return connection.close();
      }
    };
    socket = new WebSocketClient();
    socket.on('connect', function(conn) {
      connection = conn;
      ws.onopen();
      connection.on('error', function(error) {
        return typeof ws.onclose === "function" ? ws.onclose(error) : void 0;
      });
      connection.on('close', function() {
        return typeof ws.onclose === "function" ? ws.onclose() : void 0;
      });
      return connection.on('message', function(message) {
        var event;
        if (message.type === 'utf8') {
          event = {
            'data': message.utf8Data
          };
          return ws.onmessage(event);
        }
      });
    });
    socket.connect(url);
    return ws;
  };

  overTCP = function(host, port) {
    var socket;
    socket = wrapTCP(port, host);
    return Stomp.Stomp.over(socket);
  };

  overWS = function(url) {
    var socket;
    socket = wrapWS(url);
    return Stomp.Stomp.over(socket);
  };

  exports.overTCP = overTCP;

  exports.overWS = overWS;

}).call(this);

},{"./stomp":137,"net":1,"websocket":138}],137:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2010-2013 [Jeff Mesnil](http://jmesnil.net/)
   Copyright (C) 2012 [FuseSource, Inc.](http://fusesource.com)
 */

(function() {
  var Byte, Client, Frame, Stomp,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  Byte = {
    LF: '\x0A',
    NULL: '\x00'
  };

  Frame = (function() {
    var unmarshallSingle;

    function Frame(command, headers, body) {
      this.command = command;
      this.headers = headers != null ? headers : {};
      this.body = body != null ? body : '';
    }

    Frame.prototype.toString = function() {
      var lines, name, skipContentLength, value, _ref;
      lines = [this.command];
      skipContentLength = this.headers['content-length'] === false ? true : false;
      if (skipContentLength) {
        delete this.headers['content-length'];
      }
      _ref = this.headers;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        value = _ref[name];
        lines.push("" + name + ":" + value);
      }
      if (this.body && !skipContentLength) {
        lines.push("content-length:" + (Frame.sizeOfUTF8(this.body)));
      }
      lines.push(Byte.LF + this.body);
      return lines.join(Byte.LF);
    };

    Frame.sizeOfUTF8 = function(s) {
      if (s) {
        return encodeURI(s).match(/%..|./g).length;
      } else {
        return 0;
      }
    };

    unmarshallSingle = function(data) {
      var body, chr, command, divider, headerLines, headers, i, idx, len, line, start, trim, _i, _j, _len, _ref, _ref1;
      divider = data.search(RegExp("" + Byte.LF + Byte.LF));
      headerLines = data.substring(0, divider).split(Byte.LF);
      command = headerLines.shift();
      headers = {};
      trim = function(str) {
        return str.replace(/^\s+|\s+$/g, '');
      };
      _ref = headerLines.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        idx = line.indexOf(':');
        headers[trim(line.substring(0, idx))] = trim(line.substring(idx + 1));
      }
      body = '';
      start = divider + 2;
      if (headers['content-length']) {
        len = parseInt(headers['content-length']);
        body = ('' + data).substring(start, start + len);
      } else {
        chr = null;
        for (i = _j = start, _ref1 = data.length; start <= _ref1 ? _j < _ref1 : _j > _ref1; i = start <= _ref1 ? ++_j : --_j) {
          chr = data.charAt(i);
          if (chr === Byte.NULL) {
            break;
          }
          body += chr;
        }
      }
      return new Frame(command, headers, body);
    };

    Frame.unmarshall = function(datas) {
      var data;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = datas.split(RegExp("" + Byte.NULL + Byte.LF + "*"));
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          if ((data != null ? data.length : void 0) > 0) {
            _results.push(unmarshallSingle(data));
          }
        }
        return _results;
      })();
    };

    Frame.marshall = function(command, headers, body) {
      var frame;
      frame = new Frame(command, headers, body);
      return frame.toString() + Byte.NULL;
    };

    return Frame;

  })();

  Client = (function() {
    var now;

    function Client(ws) {
      this.ws = ws;
      this.ws.binaryType = "arraybuffer";
      this.counter = 0;
      this.connected = false;
      this.heartbeat = {
        outgoing: 10000,
        incoming: 10000
      };
      this.maxWebSocketFrameSize = 16 * 1024;
      this.subscriptions = {};
    }

    Client.prototype.debug = function(message) {
      var _ref;
      return typeof window !== "undefined" && window !== null ? (_ref = window.console) != null ? _ref.log(message) : void 0 : void 0;
    };

    now = function() {
      if (Date.now) {
        return Date.now();
      } else {
        return new Date().valueOf;
      }
    };

    Client.prototype._transmit = function(command, headers, body) {
      var out;
      out = Frame.marshall(command, headers, body);
      if (typeof this.debug === "function") {
        this.debug(">>> " + out);
      }
      while (true) {
        if (out.length > this.maxWebSocketFrameSize) {
          this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
          out = out.substring(this.maxWebSocketFrameSize);
          if (typeof this.debug === "function") {
            this.debug("remaining = " + out.length);
          }
        } else {
          return this.ws.send(out);
        }
      }
    };

    Client.prototype._setupHeartbeat = function(headers) {
      var serverIncoming, serverOutgoing, ttl, v, _ref, _ref1;
      if ((_ref = headers.version) !== Stomp.VERSIONS.V1_1 && _ref !== Stomp.VERSIONS.V1_2) {
        return;
      }
      _ref1 = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = headers['heart-beat'].split(",");
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          _results.push(parseInt(v));
        }
        return _results;
      })(), serverOutgoing = _ref1[0], serverIncoming = _ref1[1];
      if (!(this.heartbeat.outgoing === 0 || serverIncoming === 0)) {
        ttl = Math.max(this.heartbeat.outgoing, serverIncoming);
        if (typeof this.debug === "function") {
          this.debug("send PING every " + ttl + "ms");
        }
        this.pinger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            _this.ws.send(Byte.LF);
            return typeof _this.debug === "function" ? _this.debug(">>> PING") : void 0;
          };
        })(this));
      }
      if (!(this.heartbeat.incoming === 0 || serverOutgoing === 0)) {
        ttl = Math.max(this.heartbeat.incoming, serverOutgoing);
        if (typeof this.debug === "function") {
          this.debug("check PONG every " + ttl + "ms");
        }
        return this.ponger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            var delta;
            delta = now() - _this.serverActivity;
            if (delta > ttl * 2) {
              if (typeof _this.debug === "function") {
                _this.debug("did not receive server activity for the last " + delta + "ms");
              }
              return _this.ws.close();
            }
          };
        })(this));
      }
    };

    Client.prototype._parseConnect = function() {
      var args, connectCallback, errorCallback, headers;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      headers = {};
      switch (args.length) {
        case 2:
          headers = args[0], connectCallback = args[1];
          break;
        case 3:
          if (args[1] instanceof Function) {
            headers = args[0], connectCallback = args[1], errorCallback = args[2];
          } else {
            headers.login = args[0], headers.passcode = args[1], connectCallback = args[2];
          }
          break;
        case 4:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3];
          break;
        default:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3], headers.host = args[4];
      }
      return [headers, connectCallback, errorCallback];
    };

    Client.prototype.connect = function() {
      var args, errorCallback, headers, out;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      out = this._parseConnect.apply(this, args);
      headers = out[0], this.connectCallback = out[1], errorCallback = out[2];
      if (typeof this.debug === "function") {
        this.debug("Opening Web Socket...");
      }
      this.ws.onmessage = (function(_this) {
        return function(evt) {
          var arr, c, client, data, frame, messageID, onreceive, subscription, _i, _len, _ref, _results;
          data = typeof ArrayBuffer !== 'undefined' && evt.data instanceof ArrayBuffer ? (arr = new Uint8Array(evt.data), typeof _this.debug === "function" ? _this.debug("--- got data length: " + arr.length) : void 0, ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = arr.length; _i < _len; _i++) {
              c = arr[_i];
              _results.push(String.fromCharCode(c));
            }
            return _results;
          })()).join('')) : evt.data;
          _this.serverActivity = now();
          if (data === Byte.LF) {
            if (typeof _this.debug === "function") {
              _this.debug("<<< PONG");
            }
            return;
          }
          if (typeof _this.debug === "function") {
            _this.debug("<<< " + data);
          }
          _ref = Frame.unmarshall(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            frame = _ref[_i];
            switch (frame.command) {
              case "CONNECTED":
                if (typeof _this.debug === "function") {
                  _this.debug("connected to server " + frame.headers.server);
                }
                _this.connected = true;
                _this._setupHeartbeat(frame.headers);
                _results.push(typeof _this.connectCallback === "function" ? _this.connectCallback(frame) : void 0);
                break;
              case "MESSAGE":
                subscription = frame.headers.subscription;
                onreceive = _this.subscriptions[subscription] || _this.onreceive;
                if (onreceive) {
                  client = _this;
                  messageID = frame.headers["message-id"];
                  frame.ack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.ack(messageID, subscription, headers);
                  };
                  frame.nack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.nack(messageID, subscription, headers);
                  };
                  _results.push(onreceive(frame));
                } else {
                  _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled received MESSAGE: " + frame) : void 0);
                }
                break;
              case "RECEIPT":
                _results.push(typeof _this.onreceipt === "function" ? _this.onreceipt(frame) : void 0);
                break;
              case "ERROR":
                _results.push(typeof errorCallback === "function" ? errorCallback(frame) : void 0);
                break;
              default:
                _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled frame: " + frame) : void 0);
            }
          }
          return _results;
        };
      })(this);
      this.ws.onclose = (function(_this) {
        return function() {
          var msg;
          msg = "Whoops! Lost connection to " + _this.ws.url;
          if (typeof _this.debug === "function") {
            _this.debug(msg);
          }
          _this._cleanUp();
          return typeof errorCallback === "function" ? errorCallback(msg) : void 0;
        };
      })(this);
      return this.ws.onopen = (function(_this) {
        return function() {
          if (typeof _this.debug === "function") {
            _this.debug('Web Socket Opened...');
          }
          headers["accept-version"] = Stomp.VERSIONS.supportedVersions();
          headers["heart-beat"] = [_this.heartbeat.outgoing, _this.heartbeat.incoming].join(',');
          return _this._transmit("CONNECT", headers);
        };
      })(this);
    };

    Client.prototype.disconnect = function(disconnectCallback, headers) {
      if (headers == null) {
        headers = {};
      }
      this._transmit("DISCONNECT", headers);
      this.ws.onclose = null;
      this.ws.close();
      this._cleanUp();
      return typeof disconnectCallback === "function" ? disconnectCallback() : void 0;
    };

    Client.prototype._cleanUp = function() {
      this.connected = false;
      if (this.pinger) {
        Stomp.clearInterval(this.pinger);
      }
      if (this.ponger) {
        return Stomp.clearInterval(this.ponger);
      }
    };

    Client.prototype.send = function(destination, headers, body) {
      if (headers == null) {
        headers = {};
      }
      if (body == null) {
        body = '';
      }
      headers.destination = destination;
      return this._transmit("SEND", headers, body);
    };

    Client.prototype.subscribe = function(destination, callback, headers) {
      var client;
      if (headers == null) {
        headers = {};
      }
      if (!headers.id) {
        headers.id = "sub-" + this.counter++;
      }
      headers.destination = destination;
      this.subscriptions[headers.id] = callback;
      this._transmit("SUBSCRIBE", headers);
      client = this;
      return {
        id: headers.id,
        unsubscribe: function() {
          return client.unsubscribe(headers.id);
        }
      };
    };

    Client.prototype.unsubscribe = function(id) {
      delete this.subscriptions[id];
      return this._transmit("UNSUBSCRIBE", {
        id: id
      });
    };

    Client.prototype.begin = function(transaction) {
      var client, txid;
      txid = transaction || "tx-" + this.counter++;
      this._transmit("BEGIN", {
        transaction: txid
      });
      client = this;
      return {
        id: txid,
        commit: function() {
          return client.commit(txid);
        },
        abort: function() {
          return client.abort(txid);
        }
      };
    };

    Client.prototype.commit = function(transaction) {
      return this._transmit("COMMIT", {
        transaction: transaction
      });
    };

    Client.prototype.abort = function(transaction) {
      return this._transmit("ABORT", {
        transaction: transaction
      });
    };

    Client.prototype.ack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("ACK", headers);
    };

    Client.prototype.nack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("NACK", headers);
    };

    return Client;

  })();

  Stomp = {
    VERSIONS: {
      V1_0: '1.0',
      V1_1: '1.1',
      V1_2: '1.2',
      supportedVersions: function() {
        return '1.1,1.0';
      }
    },
    client: function(url, protocols) {
      var klass, ws;
      if (protocols == null) {
        protocols = ['v10.stomp', 'v11.stomp'];
      }
      klass = Stomp.WebSocketClass || WebSocket;
      ws = new klass(url, protocols);
      return new Client(ws);
    },
    over: function(ws) {
      return new Client(ws);
    },
    Frame: Frame
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.Stomp = Stomp;
  }

  if (typeof window !== "undefined" && window !== null) {
    Stomp.setInterval = function(interval, f) {
      return window.setInterval(f, interval);
    };
    Stomp.clearInterval = function(id) {
      return window.clearInterval(id);
    };
    window.Stomp = Stomp;
  } else if (!exports) {
    self.Stomp = Stomp;
  }

}).call(this);

},{}],138:[function(require,module,exports){
var _globalThis;
if (typeof globalThis === 'object') {
	_globalThis = globalThis;
} else {
	try {
		_globalThis = require('es5-ext/global');
	} catch (error) {
	} finally {
		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
		if (!_globalThis) { throw new Error('Could not determine global this'); }
	}
}

var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;
var websocket_version = require('./version');


/**
 * Expose a W3C WebSocket class with just one or two arguments.
 */
function W3CWebSocket(uri, protocols) {
	var native_instance;

	if (protocols) {
		native_instance = new NativeWebSocket(uri, protocols);
	}
	else {
		native_instance = new NativeWebSocket(uri);
	}

	/**
	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
	 * class). Since it is an Object it will be returned as it is when creating an
	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
	 *
	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
	 */
	return native_instance;
}
if (NativeWebSocket) {
	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
		Object.defineProperty(W3CWebSocket, prop, {
			get: function() { return NativeWebSocket[prop]; }
		});
	});
}

/**
 * Module exports.
 */
module.exports = {
    'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
    'version'      : websocket_version
};

},{"./version":139,"es5-ext/global":116}],139:[function(require,module,exports){
module.exports = require('../package.json').version;

},{"../package.json":140}],140:[function(require,module,exports){
module.exports={
  "name": "websocket",
  "description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
  "keywords": [
    "websocket",
    "websockets",
    "socket",
    "networking",
    "comet",
    "push",
    "RFC-6455",
    "realtime",
    "server",
    "client"
  ],
  "author": "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)",
  "contributors": [
    "Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
  ],
  "version": "1.0.34",
  "repository": {
    "type": "git",
    "url": "https://github.com/theturtle32/WebSocket-Node.git"
  },
  "homepage": "https://github.com/theturtle32/WebSocket-Node",
  "engines": {
    "node": ">=4.0.0"
  },
  "dependencies": {
    "bufferutil": "^4.0.1",
    "debug": "^2.2.0",
    "es5-ext": "^0.10.50",
    "typedarray-to-buffer": "^3.1.5",
    "utf-8-validate": "^5.0.2",
    "yaeti": "^0.0.6"
  },
  "devDependencies": {
    "buffer-equal": "^1.0.0",
    "gulp": "^4.0.2",
    "gulp-jshint": "^2.0.4",
    "jshint-stylish": "^2.2.1",
    "jshint": "^2.0.0",
    "tape": "^4.9.1"
  },
  "config": {
    "verbose": false
  },
  "scripts": {
    "test": "tape test/unit/*.js",
    "gulp": "gulp"
  },
  "main": "index",
  "directories": {
    "lib": "./lib"
  },
  "browser": "lib/browser.js",
  "license": "Apache-2.0"
}

},{}],141:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _sdk = require("@wxcc-desktop/sdk");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var config = _sdk.Desktop.config,
    i18n = _sdk.Desktop.i18n,
    actions = _sdk.Desktop.actions,
    agentContact = _sdk.Desktop.agentContact,
    agentStateInfo = _sdk.Desktop.agentStateInfo,
    dialer = _sdk.Desktop.dialer,
    logger = _sdk.Desktop.logger,
    screenpop = _sdk.Desktop.screenpop,
    shortcutKey = _sdk.Desktop.shortcutKey;

var braintree = require('braintree-web/client');

var fields = require('braintree-web/hosted-fields');

var CustomerPayment = /*#__PURE__*/function (_HTMLElement) {
  _inherits(CustomerPayment, _HTMLElement);

  var _super = _createSuper(CustomerPayment);

  function CustomerPayment() {
    var _this;

    _classCallCheck(this, CustomerPayment);

    _this = _super.call(this);

    var shadow = _this.attachShadow({
      mode: 'open'
    }); // properties passed from agent desktop


    _this.accessToken = null;
    _this.serviceUrl = null;
    _this.profile = null;
    _this.ani = null;
    _this.interactionId = null;
    _this.isDarkMode = false;
    _this.textColor = '#000000';
    return _this;
  }

  _createClass(CustomerPayment, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var self = this;
      this.enablePaymentOptions(self, this.shadowRoot);
      this.enableProcessPayment(self, this.paymentOptionContainer);
      this.enableSendPaymentLink(self, this.paymentOptionContainer);
      this.enablePaymentResult(self, this.shadowRoot);

      if (this.attributes) {
        if (this.attributes.external && this.attributes.external.value === 'true') {
          console.log('PAYASSIST [Payment]', 'external', this.attributes.external.value);
          this.makePaymentOption.parentElement.hidden = true;
          this.sendLinkOption.parentElement.hidden = true;
        }

        if (this.attributes.accessToken) {
          this.accessToken = this.attributes.accessToken.value;
          console.log('Token', this.accessToken);
        }

        this.serviceUrl = this.attributes.serviceUrl.value;
        this.profile = this.attributes.profile.value;

        if (this.attributes.ani) {
          this.ani = this.attributes.ani.value;
        }

        if (this.attributes.interactionId) {
          this.interactionId = this.attributes.interactionId.value;
        }

        if (this.attributes.isDarkMode) {
          this.isDarkMode = JSON.parse(this.attributes.isDarkMode.value);

          if (this.isDarkMode) {
            this.textColor = '#ffffff';
          }

          console.log('PAYASSIST [Payment]', 'isDarkMode', this.isDarkMode, 'textColor', this.textColor);
        }
      }

      console.log('PAYASSIST [Payment]', 'connectedCallback()', this.serviceUrl, this.profile, this.ani);
      this.initDesktopConfig();
      this.connectStompClient(self);
      this.phoneNumber.firstElementChild.value = this.ani;
    }
  }, {
    key: "connectStompClient",
    value: function connectStompClient(self) {
      var Stomp = require('stompjs');

      var client = new Stomp.client(self.serviceUrl.replace('http', 'ws') + '/message-broker');
      var endpoint = '/desktop/account/' + self.ani;
      client.connect('', '', function (sessionId) {
        console.log('PAYASSIST [Payment]', 'client connected', sessionId);
        client.subscribe(endpoint, function (message) {
          console.log('PAYASSIST [Payment]', 'Headers', message.headers);
          console.log('PAYASSIST [Payment]', 'Body', message.body);
          self.account = JSON.parse(message.body);
          self.accountIdElement.firstElementChild.value = self.account.id;
          self.payAmountElement.firstElementChild.value = self.account.currentBalance.toFixed(2);
        });

        if (self.ani) {
          setTimeout(function () {
            fetch(self.serviceUrl + '/desktop/account/async/ani/' + self.ani, {
              method: 'get',
              headers: {
                'authorization': self.accessToken
              }
            }).then(function (response) {
              return response.text();
            }).then(function (data) {
              console.log('PAYASSIST [Payment]', 'async data', data);
            })["catch"](function (error) {
              return console.log('PAYASSIST [Payment]', 'error', error);
            });
          }, 3000);
        }
      }, function (error) {
        console.log('PAYASSIST [Payment]', 'client error', error);
        self.connectStompClient(self);
      });
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(name, oldVal, newVal) {
      console.log('PAYASSIST [Payment]', 'attributeChangeCallback()', name, oldVal, newVal);
    }
  }, {
    key: "disconnectedCallback",
    value: function disconnectedCallback() {
      console.log('PAYASSIST [Payment]', 'disconnectedCallback()');
    }
  }, {
    key: "initDesktopConfig",
    value: function initDesktopConfig() {
      if (AGENTX_SERVICE) {
        console.log('PAYASSIST [Payment]', 'initDesktopConfig()');

        _sdk.Desktop.config.init();
      }
    }
  }, {
    key: "pauseRecording",
    value: function pauseRecording(interactionId) {
      if (AGENTX_SERVICE) {
        console.log('PAYASSIST [Payment]', 'pauseRecording()', interactionId);
        AGENTX_SERVICE.aqm.contact.pauseRecording({
          interactionId: interactionId
        });
      }
    }
  }, {
    key: "resumeRecording",
    value: function resumeRecording(interactionId) {
      if (AGENTX_SERVICE) {
        console.log('PAYASSIST [Payment]', 'resumeRecording()', interactionId);
        AGENTX_SERVICE.aqm.contact.resumeRecording({
          interactionId: interactionId,
          data: {
            autoResumed: false
          }
        });
      }
    }
    /*
    async initDesktopConfig() {
    	console.log('PAYASSIST [Payment]', 'initDesktopConfig()');
    	if(Desktop) {
    		await Desktop.config.init();
    	}
       }
    
    async pauseRecording(interactionId) {
    	console.log('PAYASSIST [Payment]', 'pauseRecording()', interactionId);
    	//await Desktop.agentContact.pauseRecording({
    	//    interactionId: interactionId
    	//});		
    	if(AGENTX_SERVICE) {			
    		AGENTX_SERVICE.aqm.contact.pauseRecording({
    			interactionId: interactionId
    		});
    	}
    }
    
    async resumeRecording(interactionId) {
    	console.log('PAYASSIST [Payment]', 'resumeRecording()', interactionId);
    	//await Desktop.agentContact.resumeRecording({
    	//    interactionId: interactionId,
    	//    data: {
    	//        autoResumed: true
    	//    }
    	//});
    	if(AGENTX_SERVICE) {				
    		AGENTX_SERVICE.aqm.contact.resumeRecording({
    			interactionId: interactionId, 
    			data: {
    				autoResumed: false
    			}
    		});
    	}
    }
    */

  }, {
    key: "enablePaymentOptions",
    value: function enablePaymentOptions(self, parent) {
      self.paymentOptionContainer = document.createElement('div');
      var table = document.createElement('table');
      table.style.width = '100%';
      table.style.paddingTop = '20px';
      table.style.paddingBottom = '10px';
      self.paymentOptionContainer.appendChild(table);
      var tr = document.createElement('tr');
      table.appendChild(tr);
      var td = document.createElement('td');
      td.style.width = '25%';
      tr.appendChild(td);
      self.makePaymentOption = self.createInputOption(self, 'make-payment', 'Process Payment', 'payment-option', td);
      self.makePaymentOption.checked = true;
      td = document.createElement('td');
      td.style.width = '25%';
      tr.appendChild(td);
      self.sendLinkOption = self.createInputOption(self, 'send-payment', 'Send Payment Link', 'payment-option', td);
      parent.appendChild(self.paymentOptionContainer);
      tr.appendChild(document.createElement('td'));
      tr.appendChild(document.createElement('td'));

      self.makePaymentOption.onclick = function () {
        console.log('PAYASSIST [Payment]', 'makePaymentOption click');
        self.sendLinkContainer.hidden = true;
        self.paymentStatusContainer.hidden = true;
        self.makePaymentContainer.hidden = false;
      };

      self.sendLinkOption.onclick = function () {
        console.log('PAYASSIST [Payment]', 'sendLinkOption click');
        self.makePaymentContainer.hidden = true;
        self.paymentStatusContainer.hidden = true;
        self.sendLinkContainer.hidden = false;
      };
    }
  }, {
    key: "enableProcessPayment",
    value: function enableProcessPayment(self, parent) {
      self.makePaymentContainer = document.createElement('div');
      self.makePaymentContainer.id = 'payment-container';
      parent.appendChild(self.makePaymentContainer);
      self.paymentForm = document.createElement('form');
      self.paymentForm.id = 'payment-form';
      self.paymentForm.method = 'post';
      self.paymentForm.action = '/';
      self.paymentForm.hidden = true;
      self.makePaymentContainer.appendChild(self.paymentForm);
      var table = document.createElement('table');
      table.style.width = '100%';
      self.paymentForm.appendChild(table);
      var tr = document.createElement('tr');

      if (self.isMobileDevice()) {
        tr.style.display = 'grid';
      }

      table.appendChild(tr);
      self.cardNumElement = self.createInputField(self, 'card-number', 'Card Number', 'text', tr);
      self.cvvCodeElement = self.createInputField(self, 'cvv-code', 'CVV', 'number', tr);
      self.expDateElement = self.createInputField(self, 'expiration-date', 'Expiration Date', 'text', tr);
      self.postalCodeElement = self.createInputField(self, 'postal-code', 'Postal Code', 'number', tr);
      tr = document.createElement('tr');

      if (self.isMobileDevice()) {
        tr.style.display = 'grid';
      }

      table.appendChild(tr);
      self.accountIdElement = self.createInputField(self, 'account-id', 'Account ID', 'number', tr);
      self.payAmountElement = self.createInputField(self, 'pay-amount', 'Amount', 'text', tr, '00.00');
      tr = document.createElement('tr');
      table.appendChild(tr);
      self.payButton = self.createFormButton('make-payment', 'Pay', 'submit', tr);
      self.payButton.style.cursor = 'pointer';
      self.startButton = self.createFormButton('start-payment', 'Start', 'button');
      self.startButton.disabled = false;
      self.startButton.style.cursor = 'pointer';
      self.makePaymentContainer.appendChild(self.startButton);
      self.startButton.addEventListener('click', function () {
        console.log('PAYASSIST [Payment]', 'start payment', self.ani);

        if (self.attributes.external) {
          var accountId = self.getParam('acct');
          console.log('PAYASSIST [Payment]', 'accountId', accountId);

          if (accountId) {
            fetch(self.serviceUrl + '/desktop/account/id/' + accountId, {
              method: 'get',
              headers: {
                'authorization': self.accessToken
              }
            }).then(function (response) {
              return response.json();
            }).then(function (data) {
              console.log('PAYASSIST [Payment]', 'async data', data);
              self.account = data;
              self.accountIdElement.firstElementChild.value = self.account.id;
              self.payAmountElement.firstElementChild.value = self.account.currentBalance.toFixed(2);
            })["catch"](function (error) {
              return console.log('PAYASSIST [Payment]', 'error', error);
            });
          }
        }

        self.paymentForm.hidden = false;
        self.startButton.hidden = true;
        self.processPayment(self);
      });
    }
  }, {
    key: "getParam",
    value: function getParam(param) {
      var params = window.location.search.substring(1).split('&');

      for (var i in params) {
        var pair = params[i].split('=');

        if (pair[0] === param) {
          return pair[1];
        }
      }
    }
  }, {
    key: "enableSendPaymentLink",
    value: function enableSendPaymentLink(self, parent) {
      self.sendLinkContainer = document.createElement('div');
      self.sendLinkContainer.hidden = true;
      parent.appendChild(self.sendLinkContainer);
      var table = document.createElement('table');
      table.style.width = '100%';
      self.sendLinkContainer.appendChild(table);
      var tr = document.createElement('tr');
      table.appendChild(tr);
      var td = document.createElement('td');
      td.style.width = '25%';
      tr.appendChild(td);
      self.emailOption = self.createInputOption(self, 'email', 'Email', 'send-option', td);
      self.emailOption.checked = true;
      td = document.createElement('td');
      td.style.width = '25%';
      tr.appendChild(td);
      self.textOption = self.createInputOption(self, 'text', 'Text', 'send-option', td);
      tr.appendChild(document.createElement('td'));
      tr.appendChild(document.createElement('td'));
      tr = document.createElement('tr');
      table.appendChild(tr);
      self.emailAddress = self.createInputField(self, 'email-address', 'Email Address', 'email', tr, 'Email Address');
      self.phoneNumber = self.createInputField(self, 'phone-number', 'Phone Number', 'tel', tr, 'Phone Number');
      self.phoneNumber.firstElementChild.disabled = true;
      tr = document.createElement('tr');
      table.appendChild(tr);
      self.sendButton = self.createFormButton('send-payment', 'Send', 'button', tr);

      if (self.emailAddress.firstElementChild.value) {
        self.sendButton.disabled = false;
      }

      self.emailOption.onclick = function () {
        console.log('PAYASSIST [Payment]', 'emailOption onclick');
        self.emailAddress.firstElementChild.disabled = false;
        self.phoneNumber.firstElementChild.disabled = true;

        if (self.emailAddress.firstElementChild.value) {
          self.sendButton.disabled = false;
        }
      };

      self.emailAddress.firstElementChild.onmouseout = function () {
        console.log('PAYASSIST [Payment]', 'emailAddress onmouseout');

        if (self.emailAddress.firstElementChild.value) {
          self.sendButton.disabled = false;
        }
      };

      self.textOption.onclick = function () {
        console.log('PAYASSIST [Payment]', 'textOption onclick');
        self.phoneNumber.firstElementChild.disabled = false;
        self.emailAddress.firstElementChild.disabled = true;

        if (self.phoneNumber.firstElementChild.value) {
          self.sendButton.disabled = false;
        }
      };

      self.phoneNumber.firstElementChild.onmouseout = function () {
        console.log('PAYASSIST [Payment]', 'phoneNumber onmouseout');

        if (self.phoneNumber.firstElementChild.value) {
          self.sendButton.disabled = false;
        }
      };

      self.sendButton.addEventListener('click', function () {
        console.log('PAYASSIST [Payment]', 'sendButton click');
        self.sendPaymentLink(self);
      });
    }
  }, {
    key: "enablePaymentResult",
    value: function enablePaymentResult(self, parent) {
      self.paymentStatusContainer = document.createElement('div');
      self.paymentStatusContainer.style.paddingLeft = '5px';
      self.paymentStatusContainer.hidden = true;
      parent.appendChild(self.paymentStatusContainer);
    }
  }, {
    key: "showPaymentStatus",
    value: function showPaymentStatus(self, message) {
      self.makePaymentContainer.hidden = true;
      self.sendLinkContainer.hidden = true;
      self.paymentStatusContainer.innerHTML = message;
      self.paymentStatusContainer.hidden = false;
    }
  }, {
    key: "createInputOption",
    value: function createInputOption(self, id, name, group, div) {
      var input = document.createElement('input');
      var label = document.createElement('label');
      input.type = 'radio';
      input.id = id;
      input.value = id;
      input.name = group;
      label.htmlFor = id;
      label.innerText = name;
      label.style.color = self.textColor;
      label.style.paddingRight = '20px';
      div.appendChild(input);
      div.appendChild(label);
      return input;
    }
  }, {
    key: "createInputField",
    value: function createInputField(self, id, name, type, tr, placeholder) {
      var td = document.createElement('td');
      var label = document.createElement('label');
      var div = document.createElement('div');
      var input = document.createElement('input');
      input.type = type;

      if (id === 'pay-amount' || id === 'account-id' || id === 'email-address' || id === 'phone-number') {
        input.placeholder = placeholder;
        input.style.height = '100%';
        input.style.width = '100%';
        input.style.border = 'none';
        input.style.outline = 'none';
        div.appendChild(input);

        if (id === 'pay-amount' || id === 'account-id') {
          if (id === 'pay-amount') {
            input.step = '0.01';
          }

          td.appendChild(label);
        } else {
          td.style.paddingLeft = '5px';
        }
      } else {
        td.appendChild(label);
      }

      label.htmlFor = id;
      label.innerText = name;
      label.style.color = self.textColor;
      label.style.lineHeight = '24px';
      div.id = id;
      div.style.height = '20px';
      div.style.border = '1px solid gray';
      div.style.padding = '5px 5px 5px 5px';
      td.appendChild(div);
      tr.appendChild(td);
      return div;
    }
  }, {
    key: "createFormButton",
    value: function createFormButton(id, name, type, tr) {
      var td = document.createElement('td');
      var input = document.createElement('input');
      input.type = type;
      input.id = id;
      input.value = name;
      input.disabled = true;
      input.style.height = '25px';
      input.style.width = '50px';

      if (tr) {
        td.appendChild(input);
        td.style.paddingTop = '20px';
        tr.appendChild(td);
      }

      return input;
    }
  }, {
    key: "isMobileDevice",
    value: function isMobileDevice() {
      return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i);
    }
  }, {
    key: "sendPaymentLink",
    value: function sendPaymentLink(self) {
      console.log('PAYASSIST [Payment]', 'sendPaymentLink()');
      var requestUrl = self.serviceUrl + '/link';
      var request = {};
      request.paymentUrl = self.serviceUrl + '/' + self.profile + '?acct=' + self.accountIdElement.firstElementChild.value;

      if (self.emailOption.checked) {
        console.log('PAYASSIST [Payment]', 'emailOption selected');
        request.emailAddress = self.emailAddress.firstElementChild.value;
        requestUrl += '/email';
      } else {
        console.log('PAYASSIST [Payment]', 'emailOption selected');
        request.phoneNumber = self.phoneNumber.firstElementChild.value;
        requestUrl += '/sms';
      }

      console.log('PAYASSIST [Payment]', 'request', request);
      fetch(requestUrl, {
        method: 'post',
        headers: {
          'authorization': self.accessToken,
          'content-type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then(function (response) {
        return response.text();
      }).then(function (data) {
        console.log('PAYASSIST [Payment]', 'response data', data);
        self.showPaymentStatus(self, "<p style=\"color:green;\">Payment link has been sent to ".concat(data, "</p>"));
      })["catch"](function (error) {
        return console.log('PAYASSIST [Payment]', 'error', error);
      });
    }
  }, {
    key: "processPayment",
    value: function processPayment(self) {
      var requestUrl = self.serviceUrl + '/' + self.profile;
      fetch(requestUrl + '/token', {
        headers: {
          'authorization': self.accessToken
        }
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log('PAYASSIST [Payment]', 'token', data.clientToken);
        braintree.create({
          authorization: data.clientToken
        }, function (clientError, clientInstance) {
          if (clientError) {
            console.error('PAYASSIST [Payment]', 'client error', clientError);
            return;
          }

          fields.create({
            client: clientInstance,
            styles: {
              'input': {
                'font-size': '14px',
                'color': self.textColor
              },
              'input.invalid': {
                'color': 'red'
              },
              'input.valid': {
                'color': 'green'
              }
            },
            fields: {
              number: {
                container: self.cardNumElement,
                placeholder: '0000 0000 0000 0000'
              },
              cvv: {
                container: self.cvvCodeElement,
                placeholder: '000'
              },
              expirationDate: {
                container: self.expDateElement,
                placeholder: 'MM/YYYY'
              },
              postalCode: {
                container: self.postalCodeElement,
                placeholder: '00000'
              }
            }
          }, function (hostedFieldsError, hostedFieldsInstance) {
            if (hostedFieldsError) {
              console.error('PAYASSIST [Payment]', 'hostfields error', hostedFieldsError);
              return;
            }

            self.payButton.disabled = false;
            hostedFieldsInstance.on('focus', function (e) {
              console.log('PAYASSIST [Payment]', 'hostedField focus', e);

              if (e.emittedBy === 'number') {
                self.pauseRecording(self.interactionId);
              }
            });
            self.paymentForm.addEventListener('submit', function (event) {
              event.preventDefault();
              hostedFieldsInstance.tokenize(function (tokenizeError, payload) {
                if (tokenizeError) {
                  console.error(tokenizeError);
                  self.showPaymentStatus(self, "<p style=\"color:red;\">Error: ".concat(tokenizeError.message, "</p>"));
                  return;
                }

                if (!self.payAmountElement.firstElementChild.value || isNaN(self.payAmountElement.firstElementChild.value)) {
                  console.log('PAYASSIST [Payment]', 'Invalid amount');
                  self.showPaymentStatus(self, "<p style=\"color:red;\">Error: Invalid amount</p>");
                  return;
                }

                console.log('PAYASSIST [Payment]', 'Nonce', payload.nonce);
                self.showPaymentStatus(self, "<p style=\"color:blue;\">Please wait while your payment is being processed...</p>");
                self.payButton.disabled = true;
                var request = {};
                request.methodNonce = payload.nonce;
                request.accountId = self.accountIdElement.firstElementChild.value;
                request.amount = self.payAmountElement.firstElementChild.value;
                fetch(requestUrl + '/checkout/nonce', {
                  method: 'post',
                  headers: {
                    'authorization': self.accessToken,
                    'content-type': 'application/json'
                  },
                  body: JSON.stringify(request)
                }).then(function (response) {
                  return response.json();
                }).then(function (data) {
                  console.log('PAYASSIST [Payment]', 'result', data);

                  if (data.success) {
                    self.showPaymentStatus(self, "<p style=\"color:green;\">Payment transaction completed. Transaction ID: ".concat(data.transactionId, "</p>"));
                  } else {
                    self.showPaymentStatus(self, "<p style=\"color:red;\">Payment transaction failed. Message: ".concat(data.message, "</p>"));
                    self.payButton.disabled = false;
                  }

                  self.resumeRecording(self.interactionId);
                });
              });
            }, false);
          });
        });
      })["catch"](function (error) {
        return console.log('PAYASSIST [Payment]', 'error', error);
      });
    }
  }]);

  return CustomerPayment;
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement));

customElements.define('customer-payment', CustomerPayment);

},{"@wxcc-desktop/sdk":45,"braintree-web/client":51,"braintree-web/hosted-fields":74,"stompjs":135}]},{},[141]);
