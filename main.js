"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match2) {
        return;
      }
      var n = parseFloat(match2[1]);
      var type = (match2[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module2) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug2(...args) {
          if (!debug2.enabled) {
            return;
          }
          const self2 = debug2;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index2 = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format2) => {
            if (match2 === "%%") {
              return "%";
            }
            index2++;
            const formatter = createDebug.formatters[format2];
            if (typeof formatter === "function") {
              const val = args[index2];
              match2 = formatter.call(self2, val);
              args.splice(index2, 1);
              index2--;
            }
            return match2;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug2.namespace = namespace;
        debug2.useColors = createDebug.useColors();
        debug2.color = createDebug.selectColor(namespace);
        debug2.extend = extend;
        debug2.destroy = createDebug.destroy;
        Object.defineProperty(debug2, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug2);
        }
        return debug2;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module2) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index2 = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match2) => {
        if (match2 === "%%") {
          return;
        }
        index2++;
        if (match2 === "%c") {
          lastC = index2;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports);
    var { formatters: formatters2 } = module2.exports;
    formatters2.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  "node_modules/sax/lib/sax.js"(exports) {
    (function(sax) {
      sax.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
      };
      sax.SAXParser = SAXParser;
      sax.SAXStream = SAXStream;
      sax.createStream = createStream;
      sax.MAX_BUFFER_LENGTH = 64 * 1024;
      var buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      sax.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) {
          return new SAXParser(strict, opt);
        }
        var parser = this;
        clearBuffers(parser);
        parser.q = parser.c = "";
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
        parser.opt = opt || {};
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
        parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser.opt.maxEntityCount = parser.opt.maxEntityCount || 512;
        parser.opt.maxEntityDepth = parser.opt.maxEntityDepth || 4;
        parser.entityCount = parser.entityDepth = 0;
        parser.tags = [];
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.strict = !!strict;
        parser.noscript = !!(strict || parser.opt.noscript);
        parser.state = S.BEGIN;
        parser.strictEntities = parser.opt.strictEntities;
        parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
        parser.attribList = [];
        if (parser.opt.xmlns) {
          parser.ns = Object.create(rootNS);
        }
        if (parser.opt.unquotedAttributeValues === void 0) {
          parser.opt.unquotedAttributeValues = !strict;
        }
        parser.trackPosition = parser.opt.position !== false;
        if (parser.trackPosition) {
          parser.position = parser.line = parser.column = 0;
        }
        emit(parser, "onready");
      }
      if (!Object.create) {
        Object.create = function(o) {
          function F() {
          }
          F.prototype = o;
          var newf = new F();
          return newf;
        };
      }
      if (!Object.keys) {
        Object.keys = function(o) {
          var a = [];
          for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
          return a;
        };
      }
      function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for (var i = 0, l = buffers.length; i < l; i++) {
          var len = parser[buffers[i]].length;
          if (len > maxAllowed) {
            switch (buffers[i]) {
              case "textNode":
                closeText(parser);
                break;
              case "cdata":
                emitNode(parser, "oncdata", parser.cdata);
                parser.cdata = "";
                break;
              case "script":
                emitNode(parser, "onscript", parser.script);
                parser.script = "";
                break;
              default:
                error(parser, "Max buffer length exceeded: " + buffers[i]);
            }
          }
          maxActual = Math.max(maxActual, len);
        }
        var m = sax.MAX_BUFFER_LENGTH - maxActual;
        parser.bufferCheckPosition = m + parser.position;
      }
      function clearBuffers(parser) {
        for (var i = 0, l = buffers.length; i < l; i++) {
          parser[buffers[i]] = "";
        }
      }
      function flushBuffers(parser) {
        closeText(parser);
        if (parser.cdata !== "") {
          emitNode(parser, "oncdata", parser.cdata);
          parser.cdata = "";
        }
        if (parser.script !== "") {
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
      }
      SAXParser.prototype = {
        end: function() {
          end(this);
        },
        write,
        resume: function() {
          this.error = null;
          return this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          flushBuffers(this);
        }
      };
      var Stream;
      try {
        Stream = require("stream").Stream;
      } catch (ex) {
        Stream = function() {
        };
      }
      if (!Stream) Stream = function() {
      };
      var streamWraps = sax.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
      });
      function createStream(strict, opt) {
        return new SAXStream(strict, opt);
      }
      function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) {
          return new SAXStream(strict, opt);
        }
        Stream.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
          me.emit("end");
        };
        this._parser.onerror = function(er) {
          me.emit("error", er);
          me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
          Object.defineProperty(me, "on" + ev, {
            get: function() {
              return me._parser["on" + ev];
            },
            set: function(h) {
              if (!h) {
                me.removeAllListeners(ev);
                me._parser["on" + ev] = h;
                return h;
              }
              me.on(ev, h);
            },
            enumerable: true,
            configurable: false
          });
        });
      }
      SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
          value: SAXStream
        }
      });
      SAXStream.prototype.write = function(data) {
        if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
          if (!this._decoder) {
            this._decoder = new TextDecoder("utf8");
          }
          data = this._decoder.decode(data, { stream: true });
        }
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
      };
      SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) {
          this.write(chunk);
        }
        if (this._decoder) {
          var remaining = this._decoder.decode();
          if (remaining) {
            this._parser.write(remaining);
            this.emit("data", remaining);
          }
        }
        this._parser.end();
        return true;
      };
      SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
          };
        }
        return Stream.prototype.on.call(me, ev, handler);
      };
      var CDATA = "[CDATA[";
      var DOCTYPE = "DOCTYPE";
      var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
      var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
      var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
      var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
      }
      function isQuote(c) {
        return c === '"' || c === "'";
      }
      function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
      }
      function isMatch(regex, c) {
        return regex.test(c);
      }
      function notMatch(regex, c) {
        return !isMatch(regex, c);
      }
      var S = 0;
      sax.STATE = {
        BEGIN: S++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: S++,
        // leading whitespace
        TEXT: S++,
        // general stuff
        TEXT_ENTITY: S++,
        // &amp and such.
        OPEN_WAKA: S++,
        // <
        SGML_DECL: S++,
        // <!BLARG
        SGML_DECL_QUOTED: S++,
        // <!BLARG foo "bar
        DOCTYPE: S++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: S++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: S++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: S++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: S++,
        // <!-
        COMMENT: S++,
        // <!--
        COMMENT_ENDING: S++,
        // <!-- blah -
        COMMENT_ENDED: S++,
        // <!-- blah --
        CDATA: S++,
        // <![CDATA[ something
        CDATA_ENDING: S++,
        // ]
        CDATA_ENDING_2: S++,
        // ]]
        PROC_INST: S++,
        // <?hi
        PROC_INST_BODY: S++,
        // <?hi there
        PROC_INST_ENDING: S++,
        // <?hi "there" ?
        OPEN_TAG: S++,
        // <strong
        OPEN_TAG_SLASH: S++,
        // <strong /
        ATTRIB: S++,
        // <a
        ATTRIB_NAME: S++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: S++,
        // <a foo _
        ATTRIB_VALUE: S++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: S++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: S++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: S++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: S++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: S++,
        // <foo bar=&quot
        CLOSE_TAG: S++,
        // </a
        CLOSE_TAG_SAW_WHITE: S++,
        // </a   >
        SCRIPT: S++,
        // <script> ...
        SCRIPT_ENDING: S++
        // <script> ... <
      };
      sax.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      };
      sax.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      };
      Object.keys(sax.ENTITIES).forEach(function(key) {
        var e = sax.ENTITIES[key];
        var s2 = typeof e === "number" ? String.fromCharCode(e) : e;
        sax.ENTITIES[key] = s2;
      });
      for (var s in sax.STATE) {
        sax.STATE[sax.STATE[s]] = s;
      }
      S = sax.STATE;
      function emit(parser, event, data) {
        parser[event] && parser[event](data);
      }
      function emitNode(parser, nodeType, data) {
        if (parser.textNode) closeText(parser);
        emit(parser, nodeType, data);
      }
      function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode) emit(parser, "ontext", parser.textNode);
        parser.textNode = "";
      }
      function textopts(opt, text) {
        if (opt.trim) text = text.trim();
        if (opt.normalize) text = text.replace(/\s+/g, " ");
        return text;
      }
      function error(parser, er) {
        closeText(parser);
        if (parser.trackPosition) {
          er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        }
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
      }
      function end(parser) {
        if (parser.sawRoot && !parser.closedRoot)
          strictFail(parser, "Unclosed root tag");
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
          error(parser, "Unexpected end");
        }
        closeText(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        SAXParser.call(parser, parser.strict, parser.opt);
        return parser;
      }
      function strictFail(parser, message2) {
        if (typeof parser !== "object" || !(parser instanceof SAXParser)) {
          throw new Error("bad call to strictFail");
        }
        if (parser.strict) {
          error(parser, message2);
        }
      }
      function newTag(parser) {
        if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
        var parent = parser.tags[parser.tags.length - 1] || parser;
        var tag = parser.tag = { name: parser.tagName, attributes: {} };
        if (parser.opt.xmlns) {
          tag.ns = parent.ns;
        }
        parser.attribList.length = 0;
        emitNode(parser, "onopentagstart", tag);
      }
      function qname(name, attribute) {
        var i = name.indexOf(":");
        var qualName = i < 0 ? ["", name] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
          prefix = "xmlns";
          local = "";
        }
        return { prefix, local };
      }
      function attrib(parser) {
        if (!parser.strict) {
          parser.attribName = parser.attribName[parser.looseCase]();
        }
        if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
          parser.attribName = parser.attribValue = "";
          return;
        }
        if (parser.opt.xmlns) {
          var qn = qname(parser.attribName, true);
          var prefix = qn.prefix;
          var local = qn.local;
          if (prefix === "xmlns") {
            if (local === "xml" && parser.attribValue !== XML_NAMESPACE) {
              strictFail(
                parser,
                "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue
              );
            } else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) {
              strictFail(
                parser,
                "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue
              );
            } else {
              var tag = parser.tag;
              var parent = parser.tags[parser.tags.length - 1] || parser;
              if (tag.ns === parent.ns) {
                tag.ns = Object.create(parent.ns);
              }
              tag.ns[local] = parser.attribValue;
            }
          }
          parser.attribList.push([parser.attribName, parser.attribValue]);
        } else {
          parser.tag.attributes[parser.attribName] = parser.attribValue;
          emitNode(parser, "onattribute", {
            name: parser.attribName,
            value: parser.attribValue
          });
        }
        parser.attribName = parser.attribValue = "";
      }
      function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
          var tag = parser.tag;
          var qn = qname(parser.tagName);
          tag.prefix = qn.prefix;
          tag.local = qn.local;
          tag.uri = tag.ns[qn.prefix] || "";
          if (tag.prefix && !tag.uri) {
            strictFail(
              parser,
              "Unbound namespace prefix: " + JSON.stringify(parser.tagName)
            );
            tag.uri = qn.prefix;
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (tag.ns && parent.ns !== tag.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              emitNode(parser, "onopennamespace", {
                prefix: p,
                uri: tag.ns[p]
              });
            });
          }
          for (var i = 0, l = parser.attribList.length; i < l; i++) {
            var nv = parser.attribList[i];
            var name = nv[0];
            var value = nv[1];
            var qualName = qname(name, true);
            var prefix = qualName.prefix;
            var local = qualName.local;
            var uri = prefix === "" ? "" : tag.ns[prefix] || "";
            var a = {
              name,
              value,
              prefix,
              local,
              uri
            };
            if (prefix && prefix !== "xmlns" && !uri) {
              strictFail(
                parser,
                "Unbound namespace prefix: " + JSON.stringify(prefix)
              );
              a.uri = prefix;
            }
            parser.tag.attributes[name] = a;
            emitNode(parser, "onattribute", a);
          }
          parser.attribList.length = 0;
        }
        parser.tag.isSelfClosing = !!selfClosing;
        parser.sawRoot = true;
        parser.tags.push(parser.tag);
        emitNode(parser, "onopentag", parser.tag);
        if (!selfClosing) {
          if (!parser.noscript && parser.tagName.toLowerCase() === "script") {
            parser.state = S.SCRIPT;
          } else {
            parser.state = S.TEXT;
          }
          parser.tag = null;
          parser.tagName = "";
        }
        parser.attribName = parser.attribValue = "";
        parser.attribList.length = 0;
      }
      function closeTag(parser) {
        if (!parser.tagName) {
          strictFail(parser, "Weird empty close tag.");
          parser.textNode += "</>";
          parser.state = S.TEXT;
          return;
        }
        if (parser.script) {
          if (parser.tagName !== "script") {
            parser.script += "</" + parser.tagName + ">";
            parser.tagName = "";
            parser.state = S.SCRIPT;
            return;
          }
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
        var t = parser.tags.length;
        var tagName = parser.tagName;
        if (!parser.strict) {
          tagName = tagName[parser.looseCase]();
        }
        var closeTo = tagName;
        while (t--) {
          var close = parser.tags[t];
          if (close.name !== closeTo) {
            strictFail(parser, "Unexpected close tag");
          } else {
            break;
          }
        }
        if (t < 0) {
          strictFail(parser, "Unmatched closing tag: " + parser.tagName);
          parser.textNode += "</" + parser.tagName + ">";
          parser.state = S.TEXT;
          return;
        }
        parser.tagName = tagName;
        var s2 = parser.tags.length;
        while (s2-- > t) {
          var tag = parser.tag = parser.tags.pop();
          parser.tagName = parser.tag.name;
          emitNode(parser, "onclosetag", parser.tagName);
          var x = {};
          for (var i in tag.ns) {
            x[i] = tag.ns[i];
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (parser.opt.xmlns && tag.ns !== parent.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              var n = tag.ns[p];
              emitNode(parser, "onclosenamespace", { prefix: p, uri: n });
            });
          }
        }
        if (t === 0) parser.closedRoot = true;
        parser.tagName = parser.attribValue = parser.attribName = "";
        parser.attribList.length = 0;
        parser.state = S.TEXT;
      }
      function parseEntity(parser) {
        var entity = parser.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser.ENTITIES[entity]) {
          return parser.ENTITIES[entity];
        }
        if (parser.ENTITIES[entityLC]) {
          return parser.ENTITIES[entityLC];
        }
        entity = entityLC;
        if (entity.charAt(0) === "#") {
          if (entity.charAt(1) === "x") {
            entity = entity.slice(2);
            num = parseInt(entity, 16);
            numStr = num.toString(16);
          } else {
            entity = entity.slice(1);
            num = parseInt(entity, 10);
            numStr = num.toString(10);
          }
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity || num < 0 || num > 1114111) {
          strictFail(parser, "Invalid character entity");
          return "&" + parser.entity + ";";
        }
        return String.fromCodePoint(num);
      }
      function beginWhiteSpace(parser, c) {
        if (c === "<") {
          parser.state = S.OPEN_WAKA;
          parser.startTagPosition = parser.position;
        } else if (!isWhitespace(c)) {
          strictFail(parser, "Non-whitespace before first tag.");
          parser.textNode = c;
          parser.state = S.TEXT;
        }
      }
      function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) {
          result = chunk.charAt(i);
        }
        return result;
      }
      function write(chunk) {
        var parser = this;
        if (this.error) {
          throw this.error;
        }
        if (parser.closed) {
          return error(
            parser,
            "Cannot write after close. Assign an onready handler."
          );
        }
        if (chunk === null) {
          return end(parser);
        }
        if (typeof chunk === "object") {
          chunk = chunk.toString();
        }
        var i = 0;
        var c = "";
        while (true) {
          c = charAt(chunk, i++);
          parser.c = c;
          if (!c) {
            break;
          }
          if (parser.trackPosition) {
            parser.position++;
            if (c === "\n") {
              parser.line++;
              parser.column = 0;
            } else {
              parser.column++;
            }
          }
          switch (parser.state) {
            case S.BEGIN:
              parser.state = S.BEGIN_WHITESPACE;
              if (c === "\uFEFF") {
                continue;
              }
              beginWhiteSpace(parser, c);
              continue;
            case S.BEGIN_WHITESPACE:
              beginWhiteSpace(parser, c);
              continue;
            case S.TEXT:
              if (parser.sawRoot && !parser.closedRoot) {
                var starti = i - 1;
                while (c && c !== "<" && c !== "&") {
                  c = charAt(chunk, i++);
                  if (c && parser.trackPosition) {
                    parser.position++;
                    if (c === "\n") {
                      parser.line++;
                      parser.column = 0;
                    } else {
                      parser.column++;
                    }
                  }
                }
                parser.textNode += chunk.substring(starti, i - 1);
              }
              if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                parser.state = S.OPEN_WAKA;
                parser.startTagPosition = parser.position;
              } else {
                if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                  strictFail(parser, "Text data outside of root node.");
                }
                if (c === "&") {
                  parser.state = S.TEXT_ENTITY;
                } else {
                  parser.textNode += c;
                }
              }
              continue;
            case S.SCRIPT:
              if (c === "<") {
                parser.state = S.SCRIPT_ENDING;
              } else {
                parser.script += c;
              }
              continue;
            case S.SCRIPT_ENDING:
              if (c === "/") {
                parser.state = S.CLOSE_TAG;
              } else {
                parser.script += "<" + c;
                parser.state = S.SCRIPT;
              }
              continue;
            case S.OPEN_WAKA:
              if (c === "!") {
                parser.state = S.SGML_DECL;
                parser.sgmlDecl = "";
              } else if (isWhitespace(c)) {
              } else if (isMatch(nameStart, c)) {
                parser.state = S.OPEN_TAG;
                parser.tagName = c;
              } else if (c === "/") {
                parser.state = S.CLOSE_TAG;
                parser.tagName = "";
              } else if (c === "?") {
                parser.state = S.PROC_INST;
                parser.procInstName = parser.procInstBody = "";
              } else {
                strictFail(parser, "Unencoded <");
                if (parser.startTagPosition + 1 < parser.position) {
                  var pad = parser.position - parser.startTagPosition;
                  c = new Array(pad).join(" ") + c;
                }
                parser.textNode += "<" + c;
                parser.state = S.TEXT;
              }
              continue;
            case S.SGML_DECL:
              if (parser.sgmlDecl + c === "--") {
                parser.state = S.COMMENT;
                parser.comment = "";
                parser.sgmlDecl = "";
                continue;
              }
              if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
                parser.state = S.DOCTYPE_DTD;
                parser.doctype += "<!" + parser.sgmlDecl + c;
                parser.sgmlDecl = "";
              } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                emitNode(parser, "onopencdata");
                parser.state = S.CDATA;
                parser.sgmlDecl = "";
                parser.cdata = "";
              } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                parser.state = S.DOCTYPE;
                if (parser.doctype || parser.sawRoot) {
                  strictFail(
                    parser,
                    "Inappropriately located doctype declaration"
                  );
                }
                parser.doctype = "";
                parser.sgmlDecl = "";
              } else if (c === ">") {
                emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
                parser.sgmlDecl = "";
                parser.state = S.TEXT;
              } else if (isQuote(c)) {
                parser.state = S.SGML_DECL_QUOTED;
                parser.sgmlDecl += c;
              } else {
                parser.sgmlDecl += c;
              }
              continue;
            case S.SGML_DECL_QUOTED:
              if (c === parser.q) {
                parser.state = S.SGML_DECL;
                parser.q = "";
              }
              parser.sgmlDecl += c;
              continue;
            case S.DOCTYPE:
              if (c === ">") {
                parser.state = S.TEXT;
                emitNode(parser, "ondoctype", parser.doctype);
                parser.doctype = true;
              } else {
                parser.doctype += c;
                if (c === "[") {
                  parser.state = S.DOCTYPE_DTD;
                } else if (isQuote(c)) {
                  parser.state = S.DOCTYPE_QUOTED;
                  parser.q = c;
                }
              }
              continue;
            case S.DOCTYPE_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.q = "";
                parser.state = S.DOCTYPE;
              }
              continue;
            case S.DOCTYPE_DTD:
              if (c === "]") {
                parser.doctype += c;
                parser.state = S.DOCTYPE;
              } else if (c === "<") {
                parser.state = S.OPEN_WAKA;
                parser.startTagPosition = parser.position;
              } else if (isQuote(c)) {
                parser.doctype += c;
                parser.state = S.DOCTYPE_DTD_QUOTED;
                parser.q = c;
              } else {
                parser.doctype += c;
              }
              continue;
            case S.DOCTYPE_DTD_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.state = S.DOCTYPE_DTD;
                parser.q = "";
              }
              continue;
            case S.COMMENT:
              if (c === "-") {
                parser.state = S.COMMENT_ENDING;
              } else {
                parser.comment += c;
              }
              continue;
            case S.COMMENT_ENDING:
              if (c === "-") {
                parser.state = S.COMMENT_ENDED;
                parser.comment = textopts(parser.opt, parser.comment);
                if (parser.comment) {
                  emitNode(parser, "oncomment", parser.comment);
                }
                parser.comment = "";
              } else {
                parser.comment += "-" + c;
                parser.state = S.COMMENT;
              }
              continue;
            case S.COMMENT_ENDED:
              if (c !== ">") {
                strictFail(parser, "Malformed comment");
                parser.comment += "--" + c;
                parser.state = S.COMMENT;
              } else if (parser.doctype && parser.doctype !== true) {
                parser.state = S.DOCTYPE_DTD;
              } else {
                parser.state = S.TEXT;
              }
              continue;
            case S.CDATA:
              var starti = i - 1;
              while (c && c !== "]") {
                c = charAt(chunk, i++);
                if (c && parser.trackPosition) {
                  parser.position++;
                  if (c === "\n") {
                    parser.line++;
                    parser.column = 0;
                  } else {
                    parser.column++;
                  }
                }
              }
              parser.cdata += chunk.substring(starti, i - 1);
              if (c === "]") {
                parser.state = S.CDATA_ENDING;
              }
              continue;
            case S.CDATA_ENDING:
              if (c === "]") {
                parser.state = S.CDATA_ENDING_2;
              } else {
                parser.cdata += "]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.CDATA_ENDING_2:
              if (c === ">") {
                if (parser.cdata) {
                  emitNode(parser, "oncdata", parser.cdata);
                }
                emitNode(parser, "onclosecdata");
                parser.cdata = "";
                parser.state = S.TEXT;
              } else if (c === "]") {
                parser.cdata += "]";
              } else {
                parser.cdata += "]]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.PROC_INST:
              if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else if (isWhitespace(c)) {
                parser.state = S.PROC_INST_BODY;
              } else {
                parser.procInstName += c;
              }
              continue;
            case S.PROC_INST_BODY:
              if (!parser.procInstBody && isWhitespace(c)) {
                continue;
              } else if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else {
                parser.procInstBody += c;
              }
              continue;
            case S.PROC_INST_ENDING:
              if (c === ">") {
                emitNode(parser, "onprocessinginstruction", {
                  name: parser.procInstName,
                  body: parser.procInstBody
                });
                parser.procInstName = parser.procInstBody = "";
                parser.state = S.TEXT;
              } else {
                parser.procInstBody += "?" + c;
                parser.state = S.PROC_INST_BODY;
              }
              continue;
            case S.OPEN_TAG:
              if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else {
                newTag(parser);
                if (c === ">") {
                  openTag(parser);
                } else if (c === "/") {
                  parser.state = S.OPEN_TAG_SLASH;
                } else {
                  if (!isWhitespace(c)) {
                    strictFail(parser, "Invalid character in tag name");
                  }
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.OPEN_TAG_SLASH:
              if (c === ">") {
                openTag(parser, true);
                closeTag(parser);
              } else {
                strictFail(
                  parser,
                  "Forward-slash in opening tag not followed by >"
                );
                parser.state = S.ATTRIB;
              }
              continue;
            case S.ATTRIB:
              if (isWhitespace(c)) {
                continue;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (c === ">") {
                strictFail(parser, "Attribute without value");
                parser.attribValue = parser.attribName;
                attrib(parser);
                openTag(parser);
              } else if (isWhitespace(c)) {
                parser.state = S.ATTRIB_NAME_SAW_WHITE;
              } else if (isMatch(nameBody, c)) {
                parser.attribName += c;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME_SAW_WHITE:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (isWhitespace(c)) {
                continue;
              } else {
                strictFail(parser, "Attribute without value");
                parser.tag.attributes[parser.attribName] = "";
                parser.attribValue = "";
                emitNode(parser, "onattribute", {
                  name: parser.attribName,
                  value: ""
                });
                parser.attribName = "";
                if (c === ">") {
                  openTag(parser);
                } else if (isMatch(nameStart, c)) {
                  parser.attribName = c;
                  parser.state = S.ATTRIB_NAME;
                } else {
                  strictFail(parser, "Invalid attribute name");
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.ATTRIB_VALUE:
              if (isWhitespace(c)) {
                continue;
              } else if (isQuote(c)) {
                parser.q = c;
                parser.state = S.ATTRIB_VALUE_QUOTED;
              } else {
                if (!parser.opt.unquotedAttributeValues) {
                  error(parser, "Unquoted attribute value");
                }
                parser.state = S.ATTRIB_VALUE_UNQUOTED;
                parser.attribValue = c;
              }
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (c !== parser.q) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              parser.q = "";
              parser.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              if (isWhitespace(c)) {
                parser.state = S.ATTRIB;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                strictFail(parser, "No whitespace between attributes");
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!isAttribEnd(c)) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_U;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              if (c === ">") {
                openTag(parser);
              } else {
                parser.state = S.ATTRIB;
              }
              continue;
            case S.CLOSE_TAG:
              if (!parser.tagName) {
                if (isWhitespace(c)) {
                  continue;
                } else if (notMatch(nameStart, c)) {
                  if (parser.script) {
                    parser.script += "</" + c;
                    parser.state = S.SCRIPT;
                  } else {
                    strictFail(parser, "Invalid tagname in closing tag.");
                  }
                } else {
                  parser.tagName = c;
                }
              } else if (c === ">") {
                closeTag(parser);
              } else if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else if (parser.script) {
                parser.script += "</" + parser.tagName + c;
                parser.tagName = "";
                parser.state = S.SCRIPT;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, "Invalid tagname in closing tag");
                }
                parser.state = S.CLOSE_TAG_SAW_WHITE;
              }
              continue;
            case S.CLOSE_TAG_SAW_WHITE:
              if (isWhitespace(c)) {
                continue;
              }
              if (c === ">") {
                closeTag(parser);
              } else {
                strictFail(parser, "Invalid characters in closing tag");
              }
              continue;
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var returnState;
              var buffer;
              switch (parser.state) {
                case S.TEXT_ENTITY:
                  returnState = S.TEXT;
                  buffer = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  returnState = S.ATTRIB_VALUE_QUOTED;
                  buffer = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  returnState = S.ATTRIB_VALUE_UNQUOTED;
                  buffer = "attribValue";
                  break;
              }
              if (c === ";") {
                var parsedEntity = parseEntity(parser);
                if (parser.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
                  if ((parser.entityCount += 1) > parser.opt.maxEntityCount) {
                    error(
                      parser,
                      "Parsed entity count exceeds max entity count"
                    );
                  }
                  if ((parser.entityDepth += 1) > parser.opt.maxEntityDepth) {
                    error(
                      parser,
                      "Parsed entity depth exceeds max entity depth"
                    );
                  }
                  parser.entity = "";
                  parser.state = returnState;
                  parser.write(parsedEntity);
                  parser.entityDepth -= 1;
                } else {
                  parser[buffer] += parsedEntity;
                  parser.entity = "";
                  parser.state = returnState;
                }
              } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
                parser.entity += c;
              } else {
                strictFail(parser, "Invalid character in entity name");
                parser[buffer] += "&" + parser.entity + c;
                parser.entity = "";
                parser.state = returnState;
              }
              continue;
            default: {
              throw new Error(parser, "Unknown state: " + parser.state);
            }
          }
        }
        if (parser.position >= parser.bufferCheckPosition) {
          checkBufferLength(parser);
        }
        return parser;
      }
      if (!String.fromCodePoint) {
        ;
        (function() {
          var stringFromCharCode = String.fromCharCode;
          var floor = Math.floor;
          var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index2 = -1;
            var length = arguments.length;
            if (!length) {
              return "";
            }
            var result = "";
            while (++index2 < length) {
              var codePoint = Number(arguments[index2]);
              if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
              codePoint < 0 || // not a valid Unicode code point
              codePoint > 1114111 || // not a valid Unicode code point
              floor(codePoint) !== codePoint) {
                throw RangeError("Invalid code point: " + codePoint);
              }
              if (codePoint <= 65535) {
                codeUnits.push(codePoint);
              } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
              }
              if (index2 + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
              }
            }
            return result;
          };
          if (Object.defineProperty) {
            Object.defineProperty(String, "fromCodePoint", {
              value: fromCodePoint,
              configurable: true,
              writable: true
            });
          } else {
            String.fromCodePoint = fromCodePoint;
          }
        })();
      }
    })(typeof exports === "undefined" ? exports.sax = {} : exports);
  }
});

// node_modules/xml-js/lib/array-helper.js
var require_array_helper = __commonJS({
  "node_modules/xml-js/lib/array-helper.js"(exports, module2) {
    module2.exports = {
      isArray: function(value) {
        if (Array.isArray) {
          return Array.isArray(value);
        }
        return Object.prototype.toString.call(value) === "[object Array]";
      }
    };
  }
});

// node_modules/xml-js/lib/options-helper.js
var require_options_helper = __commonJS({
  "node_modules/xml-js/lib/options-helper.js"(exports, module2) {
    var isArray3 = require_array_helper().isArray;
    module2.exports = {
      copyOptions: function(options) {
        var key, copy = {};
        for (key in options) {
          if (options.hasOwnProperty(key)) {
            copy[key] = options[key];
          }
        }
        return copy;
      },
      ensureFlagExists: function(item, options) {
        if (!(item in options) || typeof options[item] !== "boolean") {
          options[item] = false;
        }
      },
      ensureSpacesExists: function(options) {
        if (!("spaces" in options) || typeof options.spaces !== "number" && typeof options.spaces !== "string") {
          options.spaces = 0;
        }
      },
      ensureAlwaysArrayExists: function(options) {
        if (!("alwaysArray" in options) || typeof options.alwaysArray !== "boolean" && !isArray3(options.alwaysArray)) {
          options.alwaysArray = false;
        }
      },
      ensureKeyExists: function(key, options) {
        if (!(key + "Key" in options) || typeof options[key + "Key"] !== "string") {
          options[key + "Key"] = options.compact ? "_" + key : key;
        }
      },
      checkFnExists: function(key, options) {
        return key + "Fn" in options;
      }
    };
  }
});

// node_modules/xml-js/lib/xml2js.js
var require_xml2js = __commonJS({
  "node_modules/xml-js/lib/xml2js.js"(exports, module2) {
    var sax = require_sax();
    var expat = { on: function() {
    }, parse: function() {
    } };
    var helper = require_options_helper();
    var isArray3 = require_array_helper().isArray;
    var options;
    var pureJsParser = true;
    var currentElement;
    function validateOptions(userOptions) {
      options = helper.copyOptions(userOptions);
      helper.ensureFlagExists("ignoreDeclaration", options);
      helper.ensureFlagExists("ignoreInstruction", options);
      helper.ensureFlagExists("ignoreAttributes", options);
      helper.ensureFlagExists("ignoreText", options);
      helper.ensureFlagExists("ignoreComment", options);
      helper.ensureFlagExists("ignoreCdata", options);
      helper.ensureFlagExists("ignoreDoctype", options);
      helper.ensureFlagExists("compact", options);
      helper.ensureFlagExists("alwaysChildren", options);
      helper.ensureFlagExists("addParent", options);
      helper.ensureFlagExists("trim", options);
      helper.ensureFlagExists("nativeType", options);
      helper.ensureFlagExists("nativeTypeAttributes", options);
      helper.ensureFlagExists("sanitize", options);
      helper.ensureFlagExists("instructionHasAttributes", options);
      helper.ensureFlagExists("captureSpacesBetweenElements", options);
      helper.ensureAlwaysArrayExists(options);
      helper.ensureKeyExists("declaration", options);
      helper.ensureKeyExists("instruction", options);
      helper.ensureKeyExists("attributes", options);
      helper.ensureKeyExists("text", options);
      helper.ensureKeyExists("comment", options);
      helper.ensureKeyExists("cdata", options);
      helper.ensureKeyExists("doctype", options);
      helper.ensureKeyExists("type", options);
      helper.ensureKeyExists("name", options);
      helper.ensureKeyExists("elements", options);
      helper.ensureKeyExists("parent", options);
      helper.checkFnExists("doctype", options);
      helper.checkFnExists("instruction", options);
      helper.checkFnExists("cdata", options);
      helper.checkFnExists("comment", options);
      helper.checkFnExists("text", options);
      helper.checkFnExists("instructionName", options);
      helper.checkFnExists("elementName", options);
      helper.checkFnExists("attributeName", options);
      helper.checkFnExists("attributeValue", options);
      helper.checkFnExists("attributes", options);
      return options;
    }
    function nativeType2(value) {
      var nValue = Number(value);
      if (!isNaN(nValue)) {
        return nValue;
      }
      var bValue = value.toLowerCase();
      if (bValue === "true") {
        return true;
      } else if (bValue === "false") {
        return false;
      }
      return value;
    }
    function addField(type, value) {
      var key;
      if (options.compact) {
        if (!currentElement[options[type + "Key"]] && (isArray3(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + "Key"]) !== -1 : options.alwaysArray)) {
          currentElement[options[type + "Key"]] = [];
        }
        if (currentElement[options[type + "Key"]] && !isArray3(currentElement[options[type + "Key"]])) {
          currentElement[options[type + "Key"]] = [currentElement[options[type + "Key"]]];
        }
        if (type + "Fn" in options && typeof value === "string") {
          value = options[type + "Fn"](value, currentElement);
        }
        if (type === "instruction" && ("instructionFn" in options || "instructionNameFn" in options)) {
          for (key in value) {
            if (value.hasOwnProperty(key)) {
              if ("instructionFn" in options) {
                value[key] = options.instructionFn(value[key], key, currentElement);
              } else {
                var temp = value[key];
                delete value[key];
                value[options.instructionNameFn(key, temp, currentElement)] = temp;
              }
            }
          }
        }
        if (isArray3(currentElement[options[type + "Key"]])) {
          currentElement[options[type + "Key"]].push(value);
        } else {
          currentElement[options[type + "Key"]] = value;
        }
      } else {
        if (!currentElement[options.elementsKey]) {
          currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = type;
        if (type === "instruction") {
          for (key in value) {
            if (value.hasOwnProperty(key)) {
              break;
            }
          }
          element[options.nameKey] = "instructionNameFn" in options ? options.instructionNameFn(key, value, currentElement) : key;
          if (options.instructionHasAttributes) {
            element[options.attributesKey] = value[key][options.attributesKey];
            if ("instructionFn" in options) {
              element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
            }
          } else {
            if ("instructionFn" in options) {
              value[key] = options.instructionFn(value[key], key, currentElement);
            }
            element[options.instructionKey] = value[key];
          }
        } else {
          if (type + "Fn" in options) {
            value = options[type + "Fn"](value, currentElement);
          }
          element[options[type + "Key"]] = value;
        }
        if (options.addParent) {
          element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
      }
    }
    function manipulateAttributes(attributes) {
      if ("attributesFn" in options && attributes) {
        attributes = options.attributesFn(attributes, currentElement);
      }
      if ((options.trim || "attributeValueFn" in options || "attributeNameFn" in options || options.nativeTypeAttributes) && attributes) {
        var key;
        for (key in attributes) {
          if (attributes.hasOwnProperty(key)) {
            if (options.trim) attributes[key] = attributes[key].trim();
            if (options.nativeTypeAttributes) {
              attributes[key] = nativeType2(attributes[key]);
            }
            if ("attributeValueFn" in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);
            if ("attributeNameFn" in options) {
              var temp = attributes[key];
              delete attributes[key];
              attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
            }
          }
        }
      }
      return attributes;
    }
    function onInstruction(instruction) {
      var attributes = {};
      if (instruction.body && (instruction.name.toLowerCase() === "xml" || options.instructionHasAttributes)) {
        var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
        var match2;
        while ((match2 = attrsRegExp.exec(instruction.body)) !== null) {
          attributes[match2[1]] = match2[2] || match2[3] || match2[4];
        }
        attributes = manipulateAttributes(attributes);
      }
      if (instruction.name.toLowerCase() === "xml") {
        if (options.ignoreDeclaration) {
          return;
        }
        currentElement[options.declarationKey] = {};
        if (Object.keys(attributes).length) {
          currentElement[options.declarationKey][options.attributesKey] = attributes;
        }
        if (options.addParent) {
          currentElement[options.declarationKey][options.parentKey] = currentElement;
        }
      } else {
        if (options.ignoreInstruction) {
          return;
        }
        if (options.trim) {
          instruction.body = instruction.body.trim();
        }
        var value = {};
        if (options.instructionHasAttributes && Object.keys(attributes).length) {
          value[instruction.name] = {};
          value[instruction.name][options.attributesKey] = attributes;
        } else {
          value[instruction.name] = instruction.body;
        }
        addField("instruction", value);
      }
    }
    function onStartElement(name, attributes) {
      var element;
      if (typeof name === "object") {
        attributes = name.attributes;
        name = name.name;
      }
      attributes = manipulateAttributes(attributes);
      if ("elementNameFn" in options) {
        name = options.elementNameFn(name, currentElement);
      }
      if (options.compact) {
        element = {};
        if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
          element[options.attributesKey] = {};
          var key;
          for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
              element[options.attributesKey][key] = attributes[key];
            }
          }
        }
        if (!(name in currentElement) && (isArray3(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)) {
          currentElement[name] = [];
        }
        if (currentElement[name] && !isArray3(currentElement[name])) {
          currentElement[name] = [currentElement[name]];
        }
        if (isArray3(currentElement[name])) {
          currentElement[name].push(element);
        } else {
          currentElement[name] = element;
        }
      } else {
        if (!currentElement[options.elementsKey]) {
          currentElement[options.elementsKey] = [];
        }
        element = {};
        element[options.typeKey] = "element";
        element[options.nameKey] = name;
        if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
          element[options.attributesKey] = attributes;
        }
        if (options.alwaysChildren) {
          element[options.elementsKey] = [];
        }
        currentElement[options.elementsKey].push(element);
      }
      element[options.parentKey] = currentElement;
      currentElement = element;
    }
    function onText(text) {
      if (options.ignoreText) {
        return;
      }
      if (!text.trim() && !options.captureSpacesBetweenElements) {
        return;
      }
      if (options.trim) {
        text = text.trim();
      }
      if (options.nativeType) {
        text = nativeType2(text);
      }
      if (options.sanitize) {
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      addField("text", text);
    }
    function onComment(comment) {
      if (options.ignoreComment) {
        return;
      }
      if (options.trim) {
        comment = comment.trim();
      }
      addField("comment", comment);
    }
    function onEndElement(name) {
      var parentElement = currentElement[options.parentKey];
      if (!options.addParent) {
        delete currentElement[options.parentKey];
      }
      currentElement = parentElement;
    }
    function onCdata(cdata) {
      if (options.ignoreCdata) {
        return;
      }
      if (options.trim) {
        cdata = cdata.trim();
      }
      addField("cdata", cdata);
    }
    function onDoctype(doctype) {
      if (options.ignoreDoctype) {
        return;
      }
      doctype = doctype.replace(/^ /, "");
      if (options.trim) {
        doctype = doctype.trim();
      }
      addField("doctype", doctype);
    }
    function onError(error) {
      error.note = error;
    }
    module2.exports = function(xml, userOptions) {
      var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser("UTF-8");
      var result = {};
      currentElement = result;
      options = validateOptions(userOptions);
      if (pureJsParser) {
        parser.opt = { strictEntities: true };
        parser.onopentag = onStartElement;
        parser.ontext = onText;
        parser.oncomment = onComment;
        parser.onclosetag = onEndElement;
        parser.onerror = onError;
        parser.oncdata = onCdata;
        parser.ondoctype = onDoctype;
        parser.onprocessinginstruction = onInstruction;
      } else {
        parser.on("startElement", onStartElement);
        parser.on("text", onText);
        parser.on("comment", onComment);
        parser.on("endElement", onEndElement);
        parser.on("error", onError);
      }
      if (pureJsParser) {
        parser.write(xml).close();
      } else {
        if (!parser.parse(xml)) {
          throw new Error("XML parsing error: " + parser.getError());
        }
      }
      if (result[options.elementsKey]) {
        var temp = result[options.elementsKey];
        delete result[options.elementsKey];
        result[options.elementsKey] = temp;
        delete result.text;
      }
      return result;
    };
  }
});

// node_modules/xml-js/lib/xml2json.js
var require_xml2json = __commonJS({
  "node_modules/xml-js/lib/xml2json.js"(exports, module2) {
    var helper = require_options_helper();
    var xml2js = require_xml2js();
    function validateOptions(userOptions) {
      var options = helper.copyOptions(userOptions);
      helper.ensureSpacesExists(options);
      return options;
    }
    module2.exports = function(xml, userOptions) {
      var options, js, json, parentKey;
      options = validateOptions(userOptions);
      js = xml2js(xml, options);
      parentKey = "compact" in options && options.compact ? "_parent" : "parent";
      if ("addParent" in options && options.addParent) {
        json = JSON.stringify(js, function(k, v) {
          return k === parentKey ? "_" : v;
        }, options.spaces);
      } else {
        json = JSON.stringify(js, null, options.spaces);
      }
      return json.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    };
  }
});

// node_modules/xml-js/lib/js2xml.js
var require_js2xml = __commonJS({
  "node_modules/xml-js/lib/js2xml.js"(exports, module2) {
    var helper = require_options_helper();
    var isArray3 = require_array_helper().isArray;
    var currentElement;
    var currentElementName;
    function validateOptions(userOptions) {
      var options = helper.copyOptions(userOptions);
      helper.ensureFlagExists("ignoreDeclaration", options);
      helper.ensureFlagExists("ignoreInstruction", options);
      helper.ensureFlagExists("ignoreAttributes", options);
      helper.ensureFlagExists("ignoreText", options);
      helper.ensureFlagExists("ignoreComment", options);
      helper.ensureFlagExists("ignoreCdata", options);
      helper.ensureFlagExists("ignoreDoctype", options);
      helper.ensureFlagExists("compact", options);
      helper.ensureFlagExists("indentText", options);
      helper.ensureFlagExists("indentCdata", options);
      helper.ensureFlagExists("indentAttributes", options);
      helper.ensureFlagExists("indentInstruction", options);
      helper.ensureFlagExists("fullTagEmptyElement", options);
      helper.ensureFlagExists("noQuotesForNativeAttributes", options);
      helper.ensureSpacesExists(options);
      if (typeof options.spaces === "number") {
        options.spaces = Array(options.spaces + 1).join(" ");
      }
      helper.ensureKeyExists("declaration", options);
      helper.ensureKeyExists("instruction", options);
      helper.ensureKeyExists("attributes", options);
      helper.ensureKeyExists("text", options);
      helper.ensureKeyExists("comment", options);
      helper.ensureKeyExists("cdata", options);
      helper.ensureKeyExists("doctype", options);
      helper.ensureKeyExists("type", options);
      helper.ensureKeyExists("name", options);
      helper.ensureKeyExists("elements", options);
      helper.checkFnExists("doctype", options);
      helper.checkFnExists("instruction", options);
      helper.checkFnExists("cdata", options);
      helper.checkFnExists("comment", options);
      helper.checkFnExists("text", options);
      helper.checkFnExists("instructionName", options);
      helper.checkFnExists("elementName", options);
      helper.checkFnExists("attributeName", options);
      helper.checkFnExists("attributeValue", options);
      helper.checkFnExists("attributes", options);
      helper.checkFnExists("fullTagEmptyElement", options);
      return options;
    }
    function writeIndentation(options, depth, firstLine) {
      return (!firstLine && options.spaces ? "\n" : "") + Array(depth + 1).join(options.spaces);
    }
    function writeAttributes(attributes, options, depth) {
      if (options.ignoreAttributes) {
        return "";
      }
      if ("attributesFn" in options) {
        attributes = options.attributesFn(attributes, currentElementName, currentElement);
      }
      var key, attr, attrName, quote, result = [];
      for (key in attributes) {
        if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== void 0) {
          quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== "string" ? "" : '"';
          attr = "" + attributes[key];
          attr = attr.replace(/"/g, "&quot;");
          attrName = "attributeNameFn" in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
          result.push(options.spaces && options.indentAttributes ? writeIndentation(options, depth + 1, false) : " ");
          result.push(attrName + "=" + quote + ("attributeValueFn" in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
        }
      }
      if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
        result.push(writeIndentation(options, depth, false));
      }
      return result.join("");
    }
    function writeDeclaration(declaration, options, depth) {
      currentElement = declaration;
      currentElementName = "xml";
      return options.ignoreDeclaration ? "" : "<?xml" + writeAttributes(declaration[options.attributesKey], options, depth) + "?>";
    }
    function writeInstruction(instruction, options, depth) {
      if (options.ignoreInstruction) {
        return "";
      }
      var key;
      for (key in instruction) {
        if (instruction.hasOwnProperty(key)) {
          break;
        }
      }
      var instructionName = "instructionNameFn" in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
      if (typeof instruction[key] === "object") {
        currentElement = instruction;
        currentElementName = instructionName;
        return "<?" + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + "?>";
      } else {
        var instructionValue = instruction[key] ? instruction[key] : "";
        if ("instructionFn" in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
        return "<?" + instructionName + (instructionValue ? " " + instructionValue : "") + "?>";
      }
    }
    function writeComment(comment, options) {
      return options.ignoreComment ? "" : "<!--" + ("commentFn" in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + "-->";
    }
    function writeCdata(cdata, options) {
      return options.ignoreCdata ? "" : "<![CDATA[" + ("cdataFn" in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata.replace("]]>", "]]]]><![CDATA[>")) + "]]>";
    }
    function writeDoctype(doctype, options) {
      return options.ignoreDoctype ? "" : "<!DOCTYPE " + ("doctypeFn" in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + ">";
    }
    function writeText(text, options) {
      if (options.ignoreText) return "";
      text = "" + text;
      text = text.replace(/&amp;/g, "&");
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return "textFn" in options ? options.textFn(text, currentElementName, currentElement) : text;
    }
    function hasContent(element, options) {
      var i;
      if (element.elements && element.elements.length) {
        for (i = 0; i < element.elements.length; ++i) {
          switch (element.elements[i][options.typeKey]) {
            case "text":
              if (options.indentText) {
                return true;
              }
              break;
            // skip to next key
            case "cdata":
              if (options.indentCdata) {
                return true;
              }
              break;
            // skip to next key
            case "instruction":
              if (options.indentInstruction) {
                return true;
              }
              break;
            // skip to next key
            case "doctype":
            case "comment":
            case "element":
              return true;
            default:
              return true;
          }
        }
      }
      return false;
    }
    function writeElement(element, options, depth) {
      currentElement = element;
      currentElementName = element.name;
      var xml = [], elementName = "elementNameFn" in options ? options.elementNameFn(element.name, element) : element.name;
      xml.push("<" + elementName);
      if (element[options.attributesKey]) {
        xml.push(writeAttributes(element[options.attributesKey], options, depth));
      }
      var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]["xml:space"] === "preserve";
      if (!withClosingTag) {
        if ("fullTagEmptyElementFn" in options) {
          withClosingTag = options.fullTagEmptyElementFn(element.name, element);
        } else {
          withClosingTag = options.fullTagEmptyElement;
        }
      }
      if (withClosingTag) {
        xml.push(">");
        if (element[options.elementsKey] && element[options.elementsKey].length) {
          xml.push(writeElements(element[options.elementsKey], options, depth + 1));
          currentElement = element;
          currentElementName = element.name;
        }
        xml.push(options.spaces && hasContent(element, options) ? "\n" + Array(depth + 1).join(options.spaces) : "");
        xml.push("</" + elementName + ">");
      } else {
        xml.push("/>");
      }
      return xml.join("");
    }
    function writeElements(elements, options, depth, firstLine) {
      return elements.reduce(function(xml, element) {
        var indent = writeIndentation(options, depth, firstLine && !xml);
        switch (element.type) {
          case "element":
            return xml + indent + writeElement(element, options, depth);
          case "comment":
            return xml + indent + writeComment(element[options.commentKey], options);
          case "doctype":
            return xml + indent + writeDoctype(element[options.doctypeKey], options);
          case "cdata":
            return xml + (options.indentCdata ? indent : "") + writeCdata(element[options.cdataKey], options);
          case "text":
            return xml + (options.indentText ? indent : "") + writeText(element[options.textKey], options);
          case "instruction":
            var instruction = {};
            instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
            return xml + (options.indentInstruction ? indent : "") + writeInstruction(instruction, options, depth);
        }
      }, "");
    }
    function hasContentCompact(element, options, anyContent) {
      var key;
      for (key in element) {
        if (element.hasOwnProperty(key)) {
          switch (key) {
            case options.parentKey:
            case options.attributesKey:
              break;
            // skip to next key
            case options.textKey:
              if (options.indentText || anyContent) {
                return true;
              }
              break;
            // skip to next key
            case options.cdataKey:
              if (options.indentCdata || anyContent) {
                return true;
              }
              break;
            // skip to next key
            case options.instructionKey:
              if (options.indentInstruction || anyContent) {
                return true;
              }
              break;
            // skip to next key
            case options.doctypeKey:
            case options.commentKey:
              return true;
            default:
              return true;
          }
        }
      }
      return false;
    }
    function writeElementCompact(element, name, options, depth, indent) {
      currentElement = element;
      currentElementName = name;
      var elementName = "elementNameFn" in options ? options.elementNameFn(name, element) : name;
      if (typeof element === "undefined" || element === null || element === "") {
        return "fullTagEmptyElementFn" in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? "<" + elementName + "></" + elementName + ">" : "<" + elementName + "/>";
      }
      var xml = [];
      if (name) {
        xml.push("<" + elementName);
        if (typeof element !== "object") {
          xml.push(">" + writeText(element, options) + "</" + elementName + ">");
          return xml.join("");
        }
        if (element[options.attributesKey]) {
          xml.push(writeAttributes(element[options.attributesKey], options, depth));
        }
        var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]["xml:space"] === "preserve";
        if (!withClosingTag) {
          if ("fullTagEmptyElementFn" in options) {
            withClosingTag = options.fullTagEmptyElementFn(name, element);
          } else {
            withClosingTag = options.fullTagEmptyElement;
          }
        }
        if (withClosingTag) {
          xml.push(">");
        } else {
          xml.push("/>");
          return xml.join("");
        }
      }
      xml.push(writeElementsCompact(element, options, depth + 1, false));
      currentElement = element;
      currentElementName = name;
      if (name) {
        xml.push((indent ? writeIndentation(options, depth, false) : "") + "</" + elementName + ">");
      }
      return xml.join("");
    }
    function writeElementsCompact(element, options, depth, firstLine) {
      var i, key, nodes, xml = [];
      for (key in element) {
        if (element.hasOwnProperty(key)) {
          nodes = isArray3(element[key]) ? element[key] : [element[key]];
          for (i = 0; i < nodes.length; ++i) {
            switch (key) {
              case options.declarationKey:
                xml.push(writeDeclaration(nodes[i], options, depth));
                break;
              case options.instructionKey:
                xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : "") + writeInstruction(nodes[i], options, depth));
                break;
              case options.attributesKey:
              case options.parentKey:
                break;
              // skip
              case options.textKey:
                xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : "") + writeText(nodes[i], options));
                break;
              case options.cdataKey:
                xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : "") + writeCdata(nodes[i], options));
                break;
              case options.doctypeKey:
                xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options));
                break;
              case options.commentKey:
                xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options));
                break;
              default:
                xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
            }
            firstLine = firstLine && !xml.length;
          }
        }
      }
      return xml.join("");
    }
    module2.exports = function(js, options) {
      options = validateOptions(options);
      var xml = [];
      currentElement = js;
      currentElementName = "_root_";
      if (options.compact) {
        xml.push(writeElementsCompact(js, options, 0, true));
      } else {
        if (js[options.declarationKey]) {
          xml.push(writeDeclaration(js[options.declarationKey], options, 0));
        }
        if (js[options.elementsKey] && js[options.elementsKey].length) {
          xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
        }
      }
      return xml.join("");
    };
  }
});

// node_modules/xml-js/lib/json2xml.js
var require_json2xml = __commonJS({
  "node_modules/xml-js/lib/json2xml.js"(exports, module2) {
    var js2xml = require_js2xml();
    module2.exports = function(json, options) {
      if (json instanceof Buffer) {
        json = json.toString();
      }
      var js = null;
      if (typeof json === "string") {
        try {
          js = JSON.parse(json);
        } catch (e) {
          throw new Error("The JSON structure is invalid");
        }
      } else {
        js = json;
      }
      return js2xml(js, options);
    };
  }
});

// node_modules/xml-js/lib/index.js
var require_lib = __commonJS({
  "node_modules/xml-js/lib/index.js"(exports, module2) {
    var xml2js = require_xml2js();
    var xml2json = require_xml2json();
    var js2xml = require_js2xml();
    var json2xml = require_json2xml();
    module2.exports = {
      xml2js,
      xml2json,
      js2xml,
      json2xml
    };
  }
});

// node_modules/cross-fetch/dist/browser-ponyfill.js
var require_browser_ponyfill = __commonJS({
  "node_modules/cross-fetch/dist/browser-ponyfill.js"(exports, module2) {
    var __global__ = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || typeof global !== "undefined" && global;
    var __globalThis__ = (function() {
      function F() {
        this.fetch = false;
        this.DOMException = __global__.DOMException;
      }
      F.prototype = __global__;
      return new F();
    })();
    (function(globalThis2) {
      var irrelevant = (function(exports2) {
        var g = typeof globalThis2 !== "undefined" && globalThis2 || typeof self !== "undefined" && self || // eslint-disable-next-line no-undef
        typeof global !== "undefined" && global || {};
        var support = {
          searchParams: "URLSearchParams" in g,
          iterable: "Symbol" in g && "iterator" in Symbol,
          blob: "FileReader" in g && "Blob" in g && (function() {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          })(),
          formData: "FormData" in g,
          arrayBuffer: "ArrayBuffer" in g
        };
        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }
        if (support.arrayBuffer) {
          var viewClasses = [
            "[object Int8Array]",
            "[object Uint8Array]",
            "[object Uint8ClampedArray]",
            "[object Int16Array]",
            "[object Uint16Array]",
            "[object Int32Array]",
            "[object Uint32Array]",
            "[object Float32Array]",
            "[object Float64Array]"
          ];
          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }
        function normalizeName(name) {
          if (typeof name !== "string") {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
            throw new TypeError('Invalid character in header field name: "' + name + '"');
          }
          return name.toLowerCase();
        }
        function normalizeValue(value) {
          if (typeof value !== "string") {
            value = String(value);
          }
          return value;
        }
        function iteratorFor(items) {
          var iterator2 = {
            next: function() {
              var value = items.shift();
              return { done: value === void 0, value };
            }
          };
          if (support.iterable) {
            iterator2[Symbol.iterator] = function() {
              return iterator2;
            };
          }
          return iterator2;
        }
        function Headers2(headers) {
          this.map = {};
          if (headers instanceof Headers2) {
            headers.forEach(function(value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              if (header.length != 2) {
                throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + header.length);
              }
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name]);
            }, this);
          }
        }
        Headers2.prototype.append = function(name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ", " + value : value;
        };
        Headers2.prototype["delete"] = function(name) {
          delete this.map[normalizeName(name)];
        };
        Headers2.prototype.get = function(name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };
        Headers2.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };
        Headers2.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };
        Headers2.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };
        Headers2.prototype.keys = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };
        Headers2.prototype.values = function() {
          var items = [];
          this.forEach(function(value) {
            items.push(value);
          });
          return iteratorFor(items);
        };
        Headers2.prototype.entries = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };
        if (support.iterable) {
          Headers2.prototype[Symbol.iterator] = Headers2.prototype.entries;
        }
        function consumed(body) {
          if (body._noBody) return;
          if (body.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
          }
          body.bodyUsed = true;
        }
        function fileReaderReady(reader) {
          return new Promise(function(resolve, reject) {
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = function() {
              reject(reader.error);
            };
          });
        }
        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }
        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          var match2 = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
          var encoding = match2 ? match2[1] : "utf-8";
          reader.readAsText(blob, encoding);
          return promise;
        }
        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);
          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
          }
          return chars.join("");
        }
        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }
        function Body() {
          this.bodyUsed = false;
          this._initBody = function(body) {
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;
            if (!body) {
              this._noBody = true;
              this._bodyText = "";
            } else if (typeof body === "string") {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer);
              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get("content-type")) {
              if (typeof body === "string") {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
              }
            }
          };
          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }
              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error("could not read FormData body as blob");
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };
          }
          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              var isConsumed = consumed(this);
              if (isConsumed) {
                return isConsumed;
              } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                return Promise.resolve(
                  this._bodyArrayBuffer.buffer.slice(
                    this._bodyArrayBuffer.byteOffset,
                    this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
                  )
                );
              } else {
                return Promise.resolve(this._bodyArrayBuffer);
              }
            } else if (support.blob) {
              return this.blob().then(readBlobAsArrayBuffer);
            } else {
              throw new Error("could not read as ArrayBuffer");
            }
          };
          this.text = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as text");
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode);
            };
          }
          this.json = function() {
            return this.text().then(JSON.parse);
          };
          return this;
        }
        var methods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }
        function Request2(input, options) {
          if (!(this instanceof Request2)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          options = options || {};
          var body = options.body;
          if (input instanceof Request2) {
            if (input.bodyUsed) {
              throw new TypeError("Already read");
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers2(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }
          this.credentials = options.credentials || this.credentials || "same-origin";
          if (options.headers || !this.headers) {
            this.headers = new Headers2(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || "GET");
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal || (function() {
            if ("AbortController" in g) {
              var ctrl = new AbortController();
              return ctrl.signal;
            }
          })();
          this.referrer = null;
          if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
          }
          this._initBody(body);
          if (this.method === "GET" || this.method === "HEAD") {
            if (options.cache === "no-store" || options.cache === "no-cache") {
              var reParamSearch = /([?&])_=[^&]*/;
              if (reParamSearch.test(this.url)) {
                this.url = this.url.replace(reParamSearch, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
              } else {
                var reQueryString = /\?/;
                this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
              }
            }
          }
        }
        Request2.prototype.clone = function() {
          return new Request2(this, { body: this._bodyInit });
        };
        function decode(body) {
          var form = new FormData();
          body.trim().split("&").forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split("=");
              var name = split.shift().replace(/\+/g, " ");
              var value = split.join("=").replace(/\+/g, " ");
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }
        function parseHeaders(rawHeaders) {
          var headers = new Headers2();
          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
          preProcessedHeaders.split("\r").map(function(header) {
            return header.indexOf("\n") === 0 ? header.substr(1, header.length) : header;
          }).forEach(function(line) {
            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
              var value = parts.join(":").trim();
              try {
                headers.append(key, value);
              } catch (error) {
                console.warn("Response " + error.message);
              }
            }
          });
          return headers;
        }
        Body.call(Request2.prototype);
        function Response2(bodyInit, options) {
          if (!(this instanceof Response2)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          if (!options) {
            options = {};
          }
          this.type = "default";
          this.status = options.status === void 0 ? 200 : options.status;
          if (this.status < 200 || this.status > 599) {
            throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
          }
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = options.statusText === void 0 ? "" : "" + options.statusText;
          this.headers = new Headers2(options.headers);
          this.url = options.url || "";
          this._initBody(bodyInit);
        }
        Body.call(Response2.prototype);
        Response2.prototype.clone = function() {
          return new Response2(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers2(this.headers),
            url: this.url
          });
        };
        Response2.error = function() {
          var response = new Response2(null, { status: 200, statusText: "" });
          response.ok = false;
          response.status = 0;
          response.type = "error";
          return response;
        };
        var redirectStatuses = [301, 302, 303, 307, 308];
        Response2.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
          }
          return new Response2(null, { status, headers: { location: url } });
        };
        exports2.DOMException = g.DOMException;
        try {
          new exports2.DOMException();
        } catch (err) {
          exports2.DOMException = function(message2, name) {
            this.message = message2;
            this.name = name;
            var error = Error(message2);
            this.stack = error.stack;
          };
          exports2.DOMException.prototype = Object.create(Error.prototype);
          exports2.DOMException.prototype.constructor = exports2.DOMException;
        }
        function fetch2(input, init) {
          return new Promise(function(resolve, reject) {
            var request2 = new Request2(input, init);
            if (request2.signal && request2.signal.aborted) {
              return reject(new exports2.DOMException("Aborted", "AbortError"));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
              xhr.abort();
            }
            xhr.onload = function() {
              var options = {
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || "")
              };
              if (request2.url.indexOf("file://") === 0 && (xhr.status < 200 || xhr.status > 599)) {
                options.status = 200;
              } else {
                options.status = xhr.status;
              }
              options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
              var body = "response" in xhr ? xhr.response : xhr.responseText;
              setTimeout(function() {
                resolve(new Response2(body, options));
              }, 0);
            };
            xhr.onerror = function() {
              setTimeout(function() {
                reject(new TypeError("Network request failed"));
              }, 0);
            };
            xhr.ontimeout = function() {
              setTimeout(function() {
                reject(new TypeError("Network request timed out"));
              }, 0);
            };
            xhr.onabort = function() {
              setTimeout(function() {
                reject(new exports2.DOMException("Aborted", "AbortError"));
              }, 0);
            };
            function fixUrl(url) {
              try {
                return url === "" && g.location.href ? g.location.href : url;
              } catch (e) {
                return url;
              }
            }
            xhr.open(request2.method, fixUrl(request2.url), true);
            if (request2.credentials === "include") {
              xhr.withCredentials = true;
            } else if (request2.credentials === "omit") {
              xhr.withCredentials = false;
            }
            if ("responseType" in xhr) {
              if (support.blob) {
                xhr.responseType = "blob";
              } else if (support.arrayBuffer) {
                xhr.responseType = "arraybuffer";
              }
            }
            if (init && typeof init.headers === "object" && !(init.headers instanceof Headers2 || g.Headers && init.headers instanceof g.Headers)) {
              var names = [];
              Object.getOwnPropertyNames(init.headers).forEach(function(name) {
                names.push(normalizeName(name));
                xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
              });
              request2.headers.forEach(function(value, name) {
                if (names.indexOf(name) === -1) {
                  xhr.setRequestHeader(name, value);
                }
              });
            } else {
              request2.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value);
              });
            }
            if (request2.signal) {
              request2.signal.addEventListener("abort", abortXhr);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  request2.signal.removeEventListener("abort", abortXhr);
                }
              };
            }
            xhr.send(typeof request2._bodyInit === "undefined" ? null : request2._bodyInit);
          });
        }
        fetch2.polyfill = true;
        if (!g.fetch) {
          g.fetch = fetch2;
          g.Headers = Headers2;
          g.Request = Request2;
          g.Response = Response2;
        }
        exports2.Headers = Headers2;
        exports2.Request = Request2;
        exports2.Response = Response2;
        exports2.fetch = fetch2;
        return exports2;
      })({});
    })(__globalThis__);
    __globalThis__.fetch.ponyfill = true;
    delete __globalThis__.fetch.polyfill;
    var ctx = __global__.fetch ? __global__ : __globalThis__;
    exports = ctx.fetch;
    exports.default = ctx.fetch;
    exports.fetch = ctx.fetch;
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module2.exports = exports;
  }
});

// node_modules/base-64/base64.js
var require_base64 = __commonJS({
  "node_modules/base-64/base64.js"(exports, module2) {
    (function(root) {
      var freeExports = typeof exports == "object" && exports;
      var freeModule = typeof module2 == "object" && module2 && module2.exports == freeExports && module2;
      var freeGlobal = typeof global == "object" && global;
      if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
      }
      var InvalidCharacterError = function(message2) {
        this.message = message2;
      };
      InvalidCharacterError.prototype = new Error();
      InvalidCharacterError.prototype.name = "InvalidCharacterError";
      var error = function(message2) {
        throw new InvalidCharacterError(message2);
      };
      var TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;
      var decode = function(input) {
        input = String(input).replace(REGEX_SPACE_CHARACTERS, "");
        var length = input.length;
        if (length % 4 == 0) {
          input = input.replace(/==?$/, "");
          length = input.length;
        }
        if (length % 4 == 1 || // http://whatwg.org/C#alphanumeric-ascii-characters
        /[^+a-zA-Z0-9/]/.test(input)) {
          error(
            "Invalid character: the string to be decoded is not correctly encoded."
          );
        }
        var bitCounter = 0;
        var bitStorage;
        var buffer;
        var output = "";
        var position = -1;
        while (++position < length) {
          buffer = TABLE.indexOf(input.charAt(position));
          bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
          if (bitCounter++ % 4) {
            output += String.fromCharCode(
              255 & bitStorage >> (-2 * bitCounter & 6)
            );
          }
        }
        return output;
      };
      var encode2 = function(input) {
        input = String(input);
        if (/[^\0-\xFF]/.test(input)) {
          error(
            "The string to be encoded contains characters outside of the Latin1 range."
          );
        }
        var padding = input.length % 3;
        var output = "";
        var position = -1;
        var a;
        var b;
        var c;
        var buffer;
        var length = input.length - padding;
        while (++position < length) {
          a = input.charCodeAt(position) << 16;
          b = input.charCodeAt(++position) << 8;
          c = input.charCodeAt(++position);
          buffer = a + b + c;
          output += TABLE.charAt(buffer >> 18 & 63) + TABLE.charAt(buffer >> 12 & 63) + TABLE.charAt(buffer >> 6 & 63) + TABLE.charAt(buffer & 63);
        }
        if (padding == 2) {
          a = input.charCodeAt(position) << 8;
          b = input.charCodeAt(++position);
          buffer = a + b;
          output += TABLE.charAt(buffer >> 10) + TABLE.charAt(buffer >> 4 & 63) + TABLE.charAt(buffer << 2 & 63) + "=";
        } else if (padding == 1) {
          buffer = input.charCodeAt(position);
          output += TABLE.charAt(buffer >> 2) + TABLE.charAt(buffer << 4 & 63) + "==";
        }
        return output;
      };
      var base64 = {
        "encode": encode2,
        "decode": decode,
        "version": "1.0.0"
      };
      if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        define(function() {
          return base64;
        });
      } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
          freeModule.exports = base64;
        } else {
          for (var key in base64) {
            base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
          }
        }
      } else {
        root.base64 = base64;
      }
    })(exports);
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WeekCalendartPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian11 = require("obsidian");

// node_modules/tslib/tslib.es6.mjs
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1) throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from2.length, ar; i < l; i++) {
    if (ar || !(i in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
      ar[i] = from2[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}

// node_modules/rxjs/dist/esm5/internal/util/isFunction.js
function isFunction(value) {
  return typeof value === "function";
}

// node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
function createErrorClass(createImpl) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}

// node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js
var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});

// node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
function arrRemove(arr, item) {
  if (arr) {
    var index2 = arr.indexOf(item);
    0 <= index2 && arr.splice(index2, 1);
  }
}

// node_modules/rxjs/dist/esm5/internal/Subscription.js
var Subscription = (function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = (function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  })();
  return Subscription2;
})();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}

// node_modules/rxjs/dist/esm5/internal/config.js
var config = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false
};

// node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js
var timeoutProvider = {
  setTimeout: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = timeoutProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
      return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function(handle) {
    var delegate = timeoutProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
  },
  delegate: void 0
};

// node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    var onUnhandledError = config.onUnhandledError;
    if (onUnhandledError) {
      onUnhandledError(err);
    } else {
      throw err;
    }
  });
}

// node_modules/rxjs/dist/esm5/internal/util/noop.js
function noop() {
}

// node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
var COMPLETE_NOTIFICATION = (function() {
  return createNotification("C", void 0, void 0);
})();
function errorNotification(error) {
  return createNotification("E", void 0, error);
}
function nextNotification(value) {
  return createNotification("N", value, void 0);
}
function createNotification(kind, value, error) {
  return {
    kind,
    value,
    error
  };
}

// node_modules/rxjs/dist/esm5/internal/util/errorContext.js
var context = null;
function errorContext(cb) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    var isRoot = !context;
    if (isRoot) {
      context = { errorThrown: false, error: null };
    }
    cb();
    if (isRoot) {
      var _a = context, errorThrown = _a.errorThrown, error = _a.error;
      context = null;
      if (errorThrown) {
        throw error;
      }
    }
  } else {
    cb();
  }
}
function captureError(err) {
  if (config.useDeprecatedSynchronousErrorHandling && context) {
    context.errorThrown = true;
    context.error = err;
  }
}

// node_modules/rxjs/dist/esm5/internal/Subscriber.js
var Subscriber = (function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) {
      handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) {
      handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) {
      handleStoppedNotification(COMPLETE_NOTIFICATION, this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
})(Subscription);
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
  return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
})();
var SafeSubscriber = (function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      var context_1;
      if (_this && config.useDeprecatedNextContext) {
        context_1 = Object.create(observerOrNext);
        context_1.unsubscribe = function() {
          return _this.unsubscribe();
        };
        partialObserver = {
          next: observerOrNext.next && bind(observerOrNext.next, context_1),
          error: observerOrNext.error && bind(observerOrNext.error, context_1),
          complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
        };
      } else {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
})(Subscriber);
function handleUnhandledError(error) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    captureError(error);
  } else {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
function handleStoppedNotification(notification, subscriber) {
  var onStoppedNotification = config.onStoppedNotification;
  onStoppedNotification && timeoutProvider.setTimeout(function() {
    return onStoppedNotification(notification, subscriber);
  });
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};

// node_modules/rxjs/dist/esm5/internal/symbol/observable.js
var observable = (function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
})();

// node_modules/rxjs/dist/esm5/internal/util/identity.js
function identity(x) {
  return x;
}

// node_modules/rxjs/dist/esm5/internal/util/pipe.js
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}

// node_modules/rxjs/dist/esm5/internal/Observable.js
var Observable = (function() {
  function Observable3(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable3.prototype.lift = function(operator) {
    var observable2 = new Observable3();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable3.prototype.subscribe = function(observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function() {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable3.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable3.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable3.prototype._subscribe = function(subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable3.prototype[observable] = function() {
    return this;
  };
  Observable3.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable3.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable3.create = function(subscribe) {
    return new Observable3(subscribe);
  };
  return Observable3;
})();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}

// node_modules/rxjs/dist/esm5/internal/util/lift.js
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}

// node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = (function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
})(Subscriber);

// node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
  now: function() {
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: void 0
};

// node_modules/rxjs/dist/esm5/internal/scheduler/Action.js
var Action = (function(_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function(state, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return this;
  };
  return Action2;
})(Subscription);

// node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js
var intervalProvider = {
  setInterval: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = intervalProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
      return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearInterval: function(handle) {
    var delegate = intervalProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
  },
  delegate: void 0
};

// node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js
var AsyncAction = (function(_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function(state, delay) {
    var _a;
    if (delay === void 0) {
      delay = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay);
    }
    this.pending = true;
    this.delay = delay;
    this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function(scheduler, _id, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
  };
  AsyncAction2.prototype.recycleAsyncId = function(_scheduler, id, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    if (delay != null && this.delay === delay && this.pending === false) {
      return id;
    }
    if (id != null) {
      intervalProvider.clearInterval(id);
    }
    return void 0;
  };
  AsyncAction2.prototype.execute = function(state, delay) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function(state, _delay) {
    var errored = false;
    var errorValue;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = e ? e : new Error("Scheduled action threw falsy error");
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype.unsubscribe = function() {
    if (!this.closed) {
      var _a = this, id = _a.id, scheduler = _a.scheduler;
      var actions = scheduler.actions;
      this.work = this.state = this.scheduler = null;
      this.pending = false;
      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
      this.delay = null;
      _super.prototype.unsubscribe.call(this);
    }
  };
  return AsyncAction2;
})(Action);

// node_modules/rxjs/dist/esm5/internal/Scheduler.js
var Scheduler = (function() {
  function Scheduler2(schedulerActionCtor, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.schedulerActionCtor = schedulerActionCtor;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function(work, delay, state) {
    if (delay === void 0) {
      delay = 0;
    }
    return new this.schedulerActionCtor(this, work).schedule(state, delay);
  };
  Scheduler2.now = dateTimestampProvider.now;
  return Scheduler2;
})();

// node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js
var AsyncScheduler = (function(_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, now) || this;
    _this.actions = [];
    _this._active = false;
    return _this;
  }
  AsyncScheduler2.prototype.flush = function(action) {
    var actions = this.actions;
    if (this._active) {
      actions.push(action);
      return;
    }
    var error;
    this._active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this._active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
})(Scheduler);

// node_modules/rxjs/dist/esm5/internal/scheduler/async.js
var asyncScheduler = new AsyncScheduler(AsyncAction);
var async = asyncScheduler;

// node_modules/rxjs/dist/esm5/internal/util/isScheduler.js
function isScheduler(value) {
  return value && isFunction(value.schedule);
}

// node_modules/rxjs/dist/esm5/internal/util/args.js
function last(arr) {
  return arr[arr.length - 1];
}
function popScheduler(args) {
  return isScheduler(last(args)) ? args.pop() : void 0;
}

// node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
var isArrayLike = (function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
});

// node_modules/rxjs/dist/esm5/internal/util/isPromise.js
function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}

// node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js
function isInteropObservable(input) {
  return isFunction(input[observable]);
}

// node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js
function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}

// node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}

// node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();

// node_modules/rxjs/dist/esm5/internal/util/isIterable.js
function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}

// node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js
function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          if (false) return [3, 8];
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done) return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}

// node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js
function innerFrom(input) {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable(function(subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable(function(subscriber) {
    for (var i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable(function(subscriber) {
    promise.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable(function(subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable(function(subscriber) {
    process2(asyncIterable, subscriber).catch(function(err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process2(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter(this, void 0, void 0, function() {
    var value, e_2_1;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2) throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}

// node_modules/rxjs/dist/esm5/internal/util/executeSchedule.js
function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
  if (delay === void 0) {
    delay = 0;
  }
  if (repeat === void 0) {
    repeat = false;
  }
  var scheduleSubscription = scheduler.schedule(function() {
    work();
    if (repeat) {
      parentSubscription.add(this.schedule(null, delay));
    } else {
      this.unsubscribe();
    }
  }, delay);
  parentSubscription.add(scheduleSubscription);
  if (!repeat) {
    return scheduleSubscription;
  }
}

// node_modules/rxjs/dist/esm5/internal/operators/observeOn.js
function observeOn(scheduler, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return operate(function(source, subscriber) {
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.next(value);
      }, delay);
    }, function() {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.complete();
      }, delay);
    }, function(err) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.error(err);
      }, delay);
    }));
  });
}

// node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js
function subscribeOn(scheduler, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return operate(function(source, subscriber) {
    subscriber.add(scheduler.schedule(function() {
      return source.subscribe(subscriber);
    }, delay));
  });
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js
function scheduleObservable(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

// node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js
function schedulePromise(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js
function scheduleArray(input, scheduler) {
  return new Observable(function(subscriber) {
    var i = 0;
    return scheduler.schedule(function() {
      if (i === input.length) {
        subscriber.complete();
      } else {
        subscriber.next(input[i++]);
        if (!subscriber.closed) {
          this.schedule();
        }
      }
    });
  });
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js
function scheduleIterable(input, scheduler) {
  return new Observable(function(subscriber) {
    var iterator2;
    executeSchedule(subscriber, scheduler, function() {
      iterator2 = input[iterator]();
      executeSchedule(subscriber, scheduler, function() {
        var _a;
        var value;
        var done;
        try {
          _a = iterator2.next(), value = _a.value, done = _a.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
        }
      }, 0, true);
    });
    return function() {
      return isFunction(iterator2 === null || iterator2 === void 0 ? void 0 : iterator2.return) && iterator2.return();
    };
  });
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js
function scheduleAsyncIterable(input, scheduler) {
  if (!input) {
    throw new Error("Iterable cannot be null");
  }
  return new Observable(function(subscriber) {
    executeSchedule(subscriber, scheduler, function() {
      var iterator2 = input[Symbol.asyncIterator]();
      executeSchedule(subscriber, scheduler, function() {
        iterator2.next().then(function(result) {
          if (result.done) {
            subscriber.complete();
          } else {
            subscriber.next(result.value);
          }
        });
      }, 0, true);
    });
  });
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js
function scheduleReadableStreamLike(input, scheduler) {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}

// node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js
function scheduled(input, scheduler) {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}

// node_modules/rxjs/dist/esm5/internal/observable/from.js
function from(input, scheduler) {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}

// node_modules/rxjs/dist/esm5/internal/observable/of.js
function of() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  return from(args, scheduler);
}

// node_modules/rxjs/dist/esm5/internal/util/isDate.js
function isValidDate(value) {
  return value instanceof Date && !isNaN(value);
}

// node_modules/rxjs/dist/esm5/internal/operators/map.js
function map(project, thisArg) {
  return operate(function(source, subscriber) {
    var index2 = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      subscriber.next(project.call(thisArg, value, index2++));
    }));
  });
}

// node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js
var isArray = Array.isArray;
function callOrApply(fn, args) {
  return isArray(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
  return map(function(args) {
    return callOrApply(fn, args);
  });
}

// node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
  var buffer = [];
  var active = 0;
  var index2 = 0;
  var isComplete = false;
  var checkComplete = function() {
    if (isComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };
  var outerNext = function(value) {
    return active < concurrent ? doInnerSub(value) : buffer.push(value);
  };
  var doInnerSub = function(value) {
    expand && subscriber.next(value);
    active++;
    var innerComplete = false;
    innerFrom(project(value, index2++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
      onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
      if (expand) {
        outerNext(innerValue);
      } else {
        subscriber.next(innerValue);
      }
    }, function() {
      innerComplete = true;
    }, void 0, function() {
      if (innerComplete) {
        try {
          active--;
          var _loop_1 = function() {
            var bufferedValue = buffer.shift();
            if (innerSubScheduler) {
              executeSchedule(subscriber, innerSubScheduler, function() {
                return doInnerSub(bufferedValue);
              });
            } else {
              doInnerSub(bufferedValue);
            }
          };
          while (buffer.length && active < concurrent) {
            _loop_1();
          }
          checkComplete();
        } catch (err) {
          subscriber.error(err);
        }
      }
    }));
  };
  source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
    isComplete = true;
    checkComplete();
  }));
  return function() {
    additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
  };
}

// node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  if (isFunction(resultSelector)) {
    return mergeMap(function(a, i) {
      return map(function(b, ii) {
        return resultSelector(a, b, i, ii);
      })(innerFrom(project(a, i)));
    }, concurrent);
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return operate(function(source, subscriber) {
    return mergeInternals(source, subscriber, project, concurrent);
  });
}

// node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js
var nodeEventEmitterMethods = ["addListener", "removeListener"];
var eventTargetMethods = ["addEventListener", "removeEventListener"];
var jqueryMethods = ["on", "off"];
function fromEvent(target, eventName, options, resultSelector) {
  if (isFunction(options)) {
    resultSelector = options;
    options = void 0;
  }
  if (resultSelector) {
    return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs(resultSelector));
  }
  var _a = __read(isEventTarget(target) ? eventTargetMethods.map(function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler, options);
    };
  }) : isNodeStyleEventEmitter(target) ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName)) : isJQueryStyleEventEmitter(target) ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName)) : [], 2), add = _a[0], remove = _a[1];
  if (!add) {
    if (isArrayLike(target)) {
      return mergeMap(function(subTarget) {
        return fromEvent(subTarget, eventName, options);
      })(innerFrom(target));
    }
  }
  if (!add) {
    throw new TypeError("Invalid event target");
  }
  return new Observable(function(subscriber) {
    var handler = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return subscriber.next(1 < args.length ? args : args[0]);
    };
    add(handler);
    return function() {
      return remove(handler);
    };
  });
}
function toCommonHandlerRegistry(target, eventName) {
  return function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler);
    };
  };
}
function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
  return isFunction(target.on) && isFunction(target.off);
}
function isEventTarget(target) {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}

// node_modules/rxjs/dist/esm5/internal/observable/timer.js
function timer(dueTime, intervalOrScheduler, scheduler) {
  if (dueTime === void 0) {
    dueTime = 0;
  }
  if (scheduler === void 0) {
    scheduler = async;
  }
  var intervalDuration = -1;
  if (intervalOrScheduler != null) {
    if (isScheduler(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      intervalDuration = intervalOrScheduler;
    }
  }
  return new Observable(function(subscriber) {
    var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
    if (due < 0) {
      due = 0;
    }
    var n = 0;
    return scheduler.schedule(function() {
      if (!subscriber.closed) {
        subscriber.next(n++);
        if (0 <= intervalDuration) {
          this.schedule(void 0, intervalDuration);
        } else {
          subscriber.complete();
        }
      }
    }, due);
  });
}

// node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js
var isArray2 = Array.isArray;
function argsOrArgArray(args) {
  return args.length === 1 && isArray2(args[0]) ? args[0] : args;
}

// node_modules/rxjs/dist/esm5/internal/operators/filter.js
function filter(predicate, thisArg) {
  return operate(function(source, subscriber) {
    var index2 = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return predicate.call(thisArg, value, index2++) && subscriber.next(value);
    }));
  });
}

// node_modules/rxjs/dist/esm5/internal/observable/race.js
function race() {
  var sources = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    sources[_i] = arguments[_i];
  }
  sources = argsOrArgArray(sources);
  return sources.length === 1 ? innerFrom(sources[0]) : new Observable(raceInit(sources));
}
function raceInit(sources) {
  return function(subscriber) {
    var subscriptions = [];
    var _loop_1 = function(i2) {
      subscriptions.push(innerFrom(sources[i2]).subscribe(createOperatorSubscriber(subscriber, function(value) {
        if (subscriptions) {
          for (var s = 0; s < subscriptions.length; s++) {
            s !== i2 && subscriptions[s].unsubscribe();
          }
          subscriptions = null;
        }
        subscriber.next(value);
      })));
    };
    for (var i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
      _loop_1(i);
    }
  };
}

// node_modules/rxjs/dist/esm5/internal/operators/catchError.js
function catchError(selector) {
  return operate(function(source, subscriber) {
    var innerSub = null;
    var syncUnsub = false;
    var handledResult;
    innerSub = source.subscribe(createOperatorSubscriber(subscriber, void 0, void 0, function(err) {
      handledResult = innerFrom(selector(err, catchError(selector)(source)));
      if (innerSub) {
        innerSub.unsubscribe();
        innerSub = null;
        handledResult.subscribe(subscriber);
      } else {
        syncUnsub = true;
      }
    }));
    if (syncUnsub) {
      innerSub.unsubscribe();
      innerSub = null;
      handledResult.subscribe(subscriber);
    }
  });
}

// node_modules/rxjs/dist/esm5/internal/operators/debounce.js
function debounce(durationSelector) {
  return operate(function(source, subscriber) {
    var hasValue = false;
    var lastValue = null;
    var durationSubscriber = null;
    var emit = function() {
      durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
      durationSubscriber = null;
      if (hasValue) {
        hasValue = false;
        var value = lastValue;
        lastValue = null;
        subscriber.next(value);
      }
    };
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
      hasValue = true;
      lastValue = value;
      durationSubscriber = createOperatorSubscriber(subscriber, emit, noop);
      innerFrom(durationSelector(value)).subscribe(durationSubscriber);
    }, function() {
      emit();
      subscriber.complete();
    }, void 0, function() {
      lastValue = durationSubscriber = null;
    }));
  });
}

// node_modules/rxjs/dist/esm5/internal/operators/switchMap.js
function switchMap(project, resultSelector) {
  return operate(function(source, subscriber) {
    var innerSubscriber = null;
    var index2 = 0;
    var isComplete = false;
    var checkComplete = function() {
      return isComplete && !innerSubscriber && subscriber.complete();
    };
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
      var innerIndex = 0;
      var outerIndex = index2++;
      innerFrom(project(value, outerIndex)).subscribe(innerSubscriber = createOperatorSubscriber(subscriber, function(innerValue) {
        return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue);
      }, function() {
        innerSubscriber = null;
        checkComplete();
      }));
    }, function() {
      isComplete = true;
      checkComplete();
    }));
  });
}

// src/lib/commands/create-year/create-year.ts
var import_obsidian4 = require("obsidian");

// src/lib/ui/create-year-prompt.ts
var import_obsidian = require("obsidian");
var CreateYearPrompt = class extends import_obsidian.Modal {
  #value = "";
  #onSubmit;
  #isValid = false;
  constructor(app, onSubmit) {
    super(app);
    this.#onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    let submitButton = null;
    new import_obsidian.Setting(contentEl).setName("Jahr (4-stellig)").addText((text) => {
      text.onChange((value) => {
        this.#value = value;
        this.#isValid = /^\d{4}$/.test(value);
        submitButton?.setDisabled(!this.#isValid);
      });
      text.inputEl.focus();
    });
    new import_obsidian.Setting(contentEl).addButton((btn) => {
      submitButton = btn;
      btn.setButtonText("OK").setCta().setDisabled(true).onClick(() => {
        if (!this.#isValid) {
          return;
        }
        this.#onSubmit(this.#value);
        this.close();
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/lib/commands/create-year/create-year-file.ts
var import_obsidian2 = require("obsidian");

// src/lib/utils/create-folder-if-not-exist.ts
async function createFolderIfNotExist(path, app) {
  const segments = path.split("/");
  const paths = segments.reduce((acc, item) => {
    if (acc.length) {
      return [...acc, `${acc[acc.length - 1]}/${item}`];
    }
    return [item];
  }, []);
  for (const folderPath of paths) {
    if (!app.vault.getAbstractFileByPath(folderPath)) {
      await app.vault.createFolder(folderPath);
    }
  }
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function buildLocalizeFn(args) {
  return (value, options) => {
    const context2 = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context2 === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index2 = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index2];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // [TODO] -- I challenge you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index2) => index2 + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.js
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// node_modules/date-fns/toDate.js
function toDate(argument, context2) {
  return constructFrom(context2 || argument, argument);
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context2, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context2 || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.js
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.js
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.js
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.js
var lightFormatters = {
  // Year
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date, token, localize2) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize2.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize2.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date, token, localize2) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  // Local week-numbering year
  Y: function(date, token, localize2, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize2.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize2.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date, token, localize2, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date, token, localize2) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  // Day of year
  D: function(date, token, localize2) {
    const dayOfYear = getDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date, token, localize2) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date, token, localize2) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  // Hour [0-23]
  H: function(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  // Hour [0-11]
  K: function(date, token, localize2) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date, token, localize2) {
    let hours = date.getHours();
    if (hours === 0) hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  // Second
  s: function(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  // Fraction of second
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date, token, _localize) {
    const timestamp = Math.trunc(+date / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function(date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.js
var dateLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "P":
      return formatLong2.date({ width: "short" });
    case "PP":
      return formatLong2.date({ width: "medium" });
    case "PPP":
      return formatLong2.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong2.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "p":
      return formatLong2.time({ width: "short" });
    case "pp":
      return formatLong2.time({ width: "medium" });
    case "ppp":
      return formatLong2.time({ width: "long" });
    case "pppp":
    default:
      return formatLong2.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong2) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format2, input) {
  const _message = message(token, format2, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format2, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}

// node_modules/date-fns/format.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date, options?.in);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken) return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/date-fns/subDays.js
function subDays(date, amount, options) {
  return addDays(date, -amount, options);
}

// src/lib/utils/util.ts
var createLocalId = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};
var getIsoWeek1Monday = (year) => {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1));
  return monday;
};
var inAWeek = (date) => {
  const result = new Date(date);
  result.setDate(result.getDate() + 7);
  return result;
};
var beforeAWeek = (date) => {
  const result = new Date(date);
  result.setDate(result.getDate() - 7);
  return result;
};
function getLastMonday(date) {
  const day = date.getDay() || 7;
  return subDays(date, day - 1);
}
function getWeekFileName(monday, weekNo) {
  const week = weekNo.toString().padStart(2, "0");
  const mondayString = format(monday, "dd.MM.yy");
  return `W${week} ${mondayString}`;
}

// src/lib/commands/create-year/create-year-file.ts
async function createYearFile(yyyy, weeks, settings, app) {
  const path = settings.paths.weekFolder;
  const yearPath = `${path}/${yyyy.toString()}`;
  const weekPath = `${yearPath}/weeks`;
  const weekStrings = weeks.map((week) => {
    const fileName = getWeekFileName(week.monday, week.week);
    return `<b>[[${weekPath}/${fileName}\\|${fileName.substring(0, 3)}]]</b><br>${fileName.substring(4, 9)}`;
  });
  const weekArray = weekStrings.reduce((acc, week, i) => {
    const x = i % 7;
    const row = x ? acc[acc.length - 1] ?? [] : [];
    const newRow = [...row, week];
    if (x === 0) {
      return [...acc, newRow];
    } else {
      return [...acc.toSpliced(-1), newRow];
    }
  }, []).reverse();
  const header = makeRow(Array(7).fill(" "));
  const headerLine = makeRow(Array(7).fill("---"));
  const body = weekArray.map((week) => makeRow(week)).join("\n");
  const fileContent = `# ${yyyy.toString()}

${header}
${headerLine}
${body}`;
  const filePath = `${yearPath}/${settings.paths.overviewFileName}.md`;
  await createFolderIfNotExist(weekPath, app);
  const file = app.vault.getAbstractFileByPath(filePath);
  if (file instanceof import_obsidian2.TFile) {
    await app.vault.modify(file, fileContent);
    new import_obsidian2.Notice(`${filePath} wurde angepasst`);
    return;
  }
  if (file) {
    new import_obsidian2.Notice(`Der Pfad ${filePath} ist ein Ordner und keine Datei`);
    return;
  }
  await app.vault.create(filePath, fileContent);
  new import_obsidian2.Notice(`${filePath} wurde erstellt`);
}
var makeRow = (line) => {
  const strLine = line.join("|");
  return `|${strLine}|`;
};

// src/lib/commands/create-year/prepare-data.ts
function prepareData(yyyy) {
  const firstDay = getIsoWeek1Monday(yyyy);
  const firstDayNextYear = getIsoWeek1Monday(yyyy + 1);
  const weeks = [];
  let week = 0;
  for (let monday = firstDay; monday < firstDayNextYear; monday = inAWeek(monday)) {
    weeks.push({
      monday,
      lastMonday: beforeAWeek(monday),
      nextMonday: inAWeek(monday),
      week: week += 1,
      yyyy
    });
  }
  return weeks;
}

// src/lib/types.ts
var woFileTitleStructure = [
  "start",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "links"
];

// src/lib/utils/format-day-heading.ts
var weekdayOffsets = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};
function formatDayHeading(monday, weekday, name) {
  const date = new Date(monday);
  date.setDate(date.getDate() + weekdayOffsets[weekday]);
  return `# ${name} (${date.getDate()})`;
}

// src/lib/commands/create-year/prepare-element-structure.ts
function prepareElementStructure(settings, monday) {
  return woFileTitleStructure.reduce(
    (acc, key) => {
      const name = settings.weekdays[key];
      const text = key === "start" ? "" : key === "links" ? `# ${name}` : formatDayHeading(monday, key, name);
      return {
        ...acc,
        [key]: key !== "start" ? [{ type: "text", content: [text, ""] }] : []
      };
    },
    {}
  );
}

// src/lib/commands/create-year/prepare-weeks.ts
function prepareWeeks(yyyy, weeks, settings) {
  const dirPath = settings.paths.weekFolder;
  return weeks.map((week, index2) => {
    if (week.yyyy !== yyyy) {
      return null;
    }
    const template = prepareElementStructure(settings, week.monday);
    const lastWeekNo = weeks[index2 - 1].week.toString().padStart(2, "0");
    const weekNo = index2.toString().padStart(2, "0");
    const nextWeekNo = weeks[index2 + 1].week.toString().padStart(2, "0");
    const backLink = `${dirPath}/${weeks[index2 - 1].yyyy}/weeks/W${lastWeekNo} ${format(week.lastMonday, "dd.MM.yy")}.md`;
    const fileName = `W${weekNo} ${format(week.monday, "dd.MM.yy")}.md`;
    const nextLink = `${dirPath}/${weeks[index2 + 1].yyyy}/weeks/W${nextWeekNo} ${format(week.nextMonday, "dd.MM.yy")}.md`;
    const linkText = `[[${backLink}|W${lastWeekNo}]] [[${nextLink}|W${nextWeekNo}]]`;
    return [fileName, { ...template, links: [{ type: "text", content: [linkText] }] }];
  });
}

// src/lib/parseWeekFile/stringify-wo.ts
function stringifyWo(elements) {
  const lines = woFileTitleStructure.flatMap((key) => [
    ...elements[key].map((element) => element.content.join("\n"))
  ]);
  return lines.join("\n");
}

// src/lib/commands/create-year/write-week-files.ts
async function writeWeekFiles(yyyy, weeks, settings, app) {
  const path = settings.paths.weekFolder;
  const yearPath = `${path}/${yyyy.toString()}`;
  const weekPath = `${yearPath}/weeks`;
  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }
  await createFolderIfNotExist(weekPath, app);
  let numbExists = 0;
  for (const item of weeks) {
    if (!item) {
      continue;
    }
    const [fileName, week] = item;
    const filePath = `${weekPath}/${fileName}`;
    if (app.vault.getAbstractFileByPath(filePath)) {
      numbExists++;
      continue;
    }
    await app.vault.create(filePath, stringifyWo(week));
  }
  return numbExists;
}

// src/lib/settings/constants.ts
var RECURRENCE_PATTERNS = {
  field: /^\s*Wiederholung:\s*(.+)$/i,
  endField: /^\s*WiederholungEnde:\s*(.+)$/i,
  recurrenceId: /\^woev-rec-([a-zA-Z0-9]+)/,
  exceptionTag: /^\s*AusnahmeVon:\s*\^woev-([a-zA-Z0-9]+)/i
};
var WEEKDAY_MAP = {
  mo: "Mo",
  montag: "Mo",
  di: "Di",
  dienstag: "Di",
  mi: "Mi",
  mittwoch: "Mi",
  do: "Do",
  donnerstag: "Do",
  fr: "Fr",
  freitag: "Fr",
  sa: "Sa",
  samstag: "Sa",
  so: "So",
  sonntag: "So"
};
var WEEKDAY_KEYS = Object.keys(WEEKDAY_MAP);
var FREQUENCY_MAP = {
  t\u00E4glich: "daily",
  taeglich: "daily",
  w\u00F6chentlich: "weekly",
  wochentlich: "weekly",
  w\u00F6chentl: "weekly",
  monatlich: "monthly-date",
  "mntl": "monthly-date",
  "mntl.": "monthly-date",
  j\u00E4hrlich: "yearly",
  jaehrlich: "yearly",
  jaehrl: "yearly"
};
var FREQUENCY_KEYS = Object.keys(FREQUENCY_MAP);
function normalizeShortcut(input) {
  return input.toLowerCase().trim();
}
function parseWeekday(input) {
  const normalized = normalizeShortcut(input);
  return WEEKDAY_MAP[normalized] || null;
}
function parseWeekdays(input) {
  const result = [];
  const parts = input.split(/[,\s]+/);
  for (const part of parts) {
    const wd = parseWeekday(part);
    if (wd && !result.includes(wd)) {
      result.push(wd);
    }
  }
  return result;
}
function normalizeFrequency(input) {
  const normalized = normalizeShortcut(input);
  return FREQUENCY_MAP[normalized] || normalized;
}
var DEFAULT_SETTINGS = {
  paths: {
    weekFolder: "week-calendar",
    eventFolder: "week-calendar/events",
    overviewFileName: "\xDCbersicht"
  },
  weekdays: {
    start: "Start",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    links: "Links"
  },
  prefixes: {
    event: "Termin",
    time: "Zeit",
    location: "Ort",
    reminder: "Erinnerung",
    repeat: "Wiederholung"
  },
  caldav: {
    url: "",
    username: "",
    password: "",
    calendar: "",
    managedCalendarConfirmed: false
  }
};

// src/lib/recurrence/parse-recurrence.ts
var WEEKDAY_SHORTCUT_MAP = {
  "j2. mo": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mo" },
  "j2.mo": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mo" },
  "j2 mo": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mo" },
  "jeden 2. montag": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mo" },
  "j2. di": { frequency: "monthly-weekday", ordinal: 2, weekday: "Di" },
  "j2.di": { frequency: "monthly-weekday", ordinal: 2, weekday: "Di" },
  "j2 di": { frequency: "monthly-weekday", ordinal: 2, weekday: "Di" },
  "jeden 2. dienstag": { frequency: "monthly-weekday", ordinal: 2, weekday: "Di" },
  "j2. mi": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mi" },
  "jeden 2. mittwoch": { frequency: "monthly-weekday", ordinal: 2, weekday: "Mi" },
  "j2. do": { frequency: "monthly-weekday", ordinal: 2, weekday: "Do" },
  "jeden 2. donnerstag": { frequency: "monthly-weekday", ordinal: 2, weekday: "Do" },
  "j2. fr": { frequency: "monthly-weekday", ordinal: 2, weekday: "Fr" },
  "jeden 2. freitag": { frequency: "monthly-weekday", ordinal: 2, weekday: "Fr" },
  "j2. sa": { frequency: "monthly-weekday", ordinal: 2, weekday: "Sa" },
  "jeden 2. samstag": { frequency: "monthly-weekday", ordinal: 2, weekday: "Sa" },
  "j2. so": { frequency: "monthly-weekday", ordinal: 2, weekday: "So" },
  "jeden 2. sonntag": { frequency: "monthly-weekday", ordinal: 2, weekday: "So" }
};
var WEEKDAY_SHORTCUT_KEYS = Object.keys(WEEKDAY_SHORTCUT_MAP);
function parseRecurrenceRule(fieldValue) {
  const normalized = normalizeShortcut(fieldValue);
  const matchedKey = WEEKDAY_SHORTCUT_KEYS.find(
    (key) => normalized.startsWith(key) || normalized === key
  );
  if (matchedKey) {
    const shortcut = WEEKDAY_SHORTCUT_MAP[matchedKey];
    const rule2 = {
      frequency: shortcut.frequency,
      interval: 1
    };
    if (shortcut.ordinal !== void 0 && shortcut.weekday !== void 0) {
      rule2.byWeekday = { ordinal: shortcut.ordinal, weekday: shortcut.weekday };
    }
    return rule2;
  }
  const parts = fieldValue.split(",").map((p) => p.trim());
  if (parts.length === 0) return null;
  const frequencyInput = parts[0];
  const frequency = normalizeFrequency(frequencyInput);
  if (!["daily", "weekly", "monthly-date", "monthly-weekday", "yearly"].includes(frequency)) {
    return null;
  }
  const rule = {
    frequency,
    interval: 1
  };
  switch (frequency) {
    case "daily":
      break;
    case "weekly":
      if (parts.length > 1) {
        const days = parseWeekdays(parts.slice(1).join(","));
        if (days.length > 0) {
          rule.byDay = days;
        }
      }
      break;
    case "monthly-date":
      if (parts.length > 1) {
        const day = parseInt(parts[1], 10);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          rule.byMonthDay = day;
        }
      }
      break;
    case "monthly-weekday": {
      if (parts.length >= 2) {
        const second = parts[1].toLowerCase().trim();
        const ordinalMatch = second.match(/^(\d+)\.?\s*(.+)$/);
        if (ordinalMatch) {
          rule.byWeekday = {
            ordinal: parseInt(ordinalMatch[1], 10),
            weekday: parseWeekday(ordinalMatch[2]) || "Mo"
          };
        } else {
          const day = parseWeekday(second);
          if (day) {
            rule.byWeekday = { ordinal: 1, weekday: day };
          }
        }
      }
      if (parts.length >= 3) {
        const day = parseWeekday(parts[2]);
        if (day) {
          rule.byWeekday = rule.byWeekday || { ordinal: 1, weekday: day };
          rule.byWeekday.weekday = day;
        }
      }
      break;
    }
    case "yearly":
      if (parts.length > 1) {
        const month = parseInt(parts[1], 10);
        if (!isNaN(month) && month >= 1 && month <= 12) {
          rule.byMonth = month;
        }
      }
      break;
  }
  return rule;
}
function parseEndDate(fieldValue) {
  const trimmed = fieldValue.trim();
  const europeanMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (europeanMatch) {
    return new Date(
      parseInt(europeanMatch[3], 10),
      parseInt(europeanMatch[2], 10) - 1,
      parseInt(europeanMatch[1], 10)
    );
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10)
    );
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}
function findRecurrenceField(content) {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.field));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.field)?.[1].trim() ?? null : null;
}
function findEndDateField(content) {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.endField));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.endField)?.[1].trim() ?? null : null;
}
function parseRecurrence(content, originalEventId, recurrenceId) {
  const ruleValue = findRecurrenceField(content);
  if (!ruleValue) return null;
  const rule = parseRecurrenceRule(ruleValue);
  if (!rule) return null;
  const endValue = findEndDateField(content);
  const endDate = endValue ? parseEndDate(endValue) : null;
  return {
    rule,
    end: {
      type: "enddate",
      endDate: endDate || /* @__PURE__ */ new Date("2099-12-31")
    },
    originalEventId,
    recurrenceId
  };
}

// src/lib/recurrence/occurrence-calculation.ts
var WEEKDAY_TO_NUMBER = {
  Mo: 1,
  Di: 2,
  Mi: 3,
  Do: 4,
  Fr: 5,
  Sa: 6,
  So: 0
};
var NUMBER_TO_WEEKDAY = {
  0: "So",
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa"
};
function calculateNextOccurrence(from2, rule) {
  const result = new Date(from2);
  result.setHours(0, 0, 0, 0);
  switch (rule.frequency) {
    case "daily":
      result.setDate(result.getDate() + rule.interval);
      return result;
    case "weekly":
      return calculateNextWeekly(from2, rule);
    case "monthly-date":
      return calculateNextMonthlyDate(from2, rule);
    case "monthly-weekday":
      return calculateNextMonthlyWeekday(from2, rule);
    case "yearly":
      return calculateNextYearly(from2, rule);
    default:
      return null;
  }
}
function calculateNextWeekly(from2, rule) {
  const result = new Date(from2);
  result.setHours(0, 0, 0, 0);
  if (!rule.byDay || rule.byDay.length === 0) {
    result.setDate(result.getDate() + 7 * rule.interval);
    return result;
  }
  const currentDay = result.getDay();
  const sortedDays = rule.byDay.map((d) => WEEKDAY_TO_NUMBER[d]).sort((a, b) => a - b);
  for (const targetDay of sortedDays) {
    if (targetDay > currentDay) {
      result.setDate(result.getDate() + (targetDay - currentDay));
      return result;
    }
  }
  const weeksToAdd = 7 * rule.interval;
  const daysToAdd = weeksToAdd - (currentDay - sortedDays[sortedDays.length - 1] + 7) % 7;
  result.setDate(result.getDate() + daysToAdd);
  return result;
}
function calculateNextMonthlyDate(from2, rule) {
  const result = new Date(from2);
  result.setHours(0, 0, 0, 0);
  const currentDay = result.getDate();
  const targetDay = rule.byMonthDay ?? currentDay;
  if (currentDay < targetDay) {
    result.setDate(targetDay);
    return result;
  }
  result.setMonth(result.getMonth() + rule.interval);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(targetDay, daysInMonth));
  return result;
}
function calculateNextMonthlyWeekday(from2, rule) {
  if (!rule.byWeekday) return null;
  const result = new Date(from2);
  result.setHours(0, 0, 0, 0);
  const { ordinal, weekday } = rule.byWeekday;
  const targetWeekday = WEEKDAY_TO_NUMBER[weekday];
  result.setDate(1);
  let currentMonth = result.getMonth();
  let targetDate = findNthWeekdayOfMonth(
    result.getFullYear(),
    currentMonth,
    targetWeekday,
    ordinal
  );
  if (targetDate && targetDate > result.getDate()) {
    result.setDate(targetDate);
    return result;
  }
  currentMonth = currentMonth + rule.interval;
  if (currentMonth >= 12) {
    result.setFullYear(result.getFullYear() + Math.floor(currentMonth / 12));
    currentMonth = currentMonth % 12;
  }
  targetDate = findNthWeekdayOfMonth(result.getFullYear(), currentMonth, targetWeekday, ordinal);
  if (targetDate) {
    result.setMonth(currentMonth);
    result.setDate(targetDate);
    return result;
  }
  return null;
}
function findNthWeekdayOfMonth(year, month, weekday, ordinal) {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  let daysToAdd = weekday - firstWeekday;
  if (daysToAdd < 0) daysToAdd += 7;
  const firstOccurrence = 1 + daysToAdd;
  const nthOccurrence = firstOccurrence + (ordinal - 1) * 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (nthOccurrence > daysInMonth) return null;
  return nthOccurrence;
}
function calculateNextYearly(from2, rule) {
  const result = new Date(from2);
  result.setHours(0, 0, 0, 0);
  const targetMonth = rule.byMonth !== void 0 ? rule.byMonth - 1 : result.getMonth();
  const targetDay = rule.byMonthDay ?? result.getDate();
  if (result.getMonth() < targetMonth || result.getMonth() === targetMonth && result.getDate() < targetDay) {
    result.setMonth(targetMonth);
    const daysInMonth2 = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(targetDay, daysInMonth2));
    return result;
  }
  result.setFullYear(result.getFullYear() + rule.interval);
  result.setMonth(targetMonth);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(targetDay, daysInMonth));
  return result;
}
function generateOccurrences(startDate, endDate, recurrence) {
  const occurrences = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const maxIterations = 1e3;
  let iterations = 0;
  while (current <= endDate && current <= recurrence.end.endDate && iterations < maxIterations) {
    occurrences.push(new Date(current));
    const next = calculateNextOccurrence(current, recurrence.rule);
    if (!next) break;
    current = next;
    iterations++;
  }
  return occurrences;
}
function getWeekdayFromDate(date) {
  return NUMBER_TO_WEEKDAY[date.getDay()];
}

// src/lib/recurrence/file-operations.ts
var import_obsidian3 = require("obsidian");

// src/lib/parseWeekFile/parse-wo.ts
var EVENT_ID_PATTERN = /^\s+\^woev-([a-zA-Z0-9]+)\s*$/;
function extractEventId(content) {
  return content.flatMap((line) => {
    const match2 = line.match(EVENT_ID_PATTERN);
    return match2 ? [match2[1]] : [];
  })[0] ?? null;
}
function extractRecurrenceId(content) {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.recurrenceId));
  return matchLine ? matchLine.match(RECURRENCE_PATTERNS.recurrenceId)?.[1] ?? null : null;
}
function extractExceptionInfo(content) {
  const matchLine = content.find((line) => line.match(RECURRENCE_PATTERNS.exceptionTag));
  if (matchLine) {
    const match2 = matchLine.match(RECURRENCE_PATTERNS.exceptionTag);
    return { isException: true, exceptionOfRecurrenceId: match2?.[1] ?? null };
  }
  return { isException: false, exceptionOfRecurrenceId: null };
}
function parseWo(wochenFile, settings = DEFAULT_SETTINGS) {
  return parseWoWithDiagnostics(wochenFile, settings).elements;
}
function parseWoWithDiagnostics(wochenFile, settings = DEFAULT_SETTINGS) {
  const state = elementStructure(settings);
  const events = [];
  const headings = [];
  const diagnostics = [];
  const lines = wochenFile.replace(/\r\n/g, "\n").split("\n");
  let section = "start";
  let activeEvent;
  let frontmatter = lines[0] === "---";
  let fence = null;
  const eventPrefix = settings.prefixes.event.trim().toLowerCase();
  const appendText = (line) => {
    const elements = state.elements[state.key];
    const previous = elements[elements.length - 1];
    if (previous?.type === "text") previous.content.push(line);
    else elements.push(createElement("text", line));
    activeEvent = void 0;
  };
  for (let index2 = 0; index2 < lines.length; index2++) {
    const line = lines[index2].trimEnd();
    const lineNumber = index2 + 1;
    if (frontmatter) {
      appendText(line);
      if (index2 > 0 && /^(---|\.\.\.)\s*$/.test(line)) frontmatter = false;
      continue;
    }
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      appendText(line);
      if (fenceMatch && fenceMatch[1][0] === fence.marker && fenceMatch[1].length >= fence.length && !fenceMatch[2].trim()) fence = null;
      continue;
    }
    if (fenceMatch) {
      fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length, line: lineNumber };
      appendText(line);
      continue;
    }
    const [lineType, key] = getLineType(line, settings);
    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      section = key;
      headings.push({ section, line: lineNumber, dayOfMonth: heading[2] ? Number(heading[2]) : void 0 });
    }
    if (lineType === "key") {
      state.key = key;
      state.elements[state.key].push(createElement("text", line));
      activeEvent = void 0;
      continue;
    }
    const candidate = line.match(/^\s*[-*+]\s*([^:]+):/);
    if (candidate?.[1].trim().toLowerCase() === eventPrefix && lineType !== "event") {
      diagnostics.push({ line: lineNumber, message: "Termin muss ohne Einr\xFCckung mit \u201E- Terminpr\xE4fix: Titel\u201C beginnen." });
    }
    if (lineType === "event") {
      const titleMatch = line.match(eventPattern(settings, true));
      if (!titleMatch) diagnostics.push({ line: lineNumber, message: "Terminpr\xE4fix muss von einem Doppelpunkt gefolgt werden." });
      const element = createElement("event", line);
      state.elements[state.key].push(element);
      activeEvent = { element, section, line: lineNumber, title: titleMatch?.[1].trim() ?? null, eventIds: [] };
      events.push(activeEvent);
    } else if (lineType === "followUp" && activeEvent) {
      const elements = state.elements[state.key];
      activeEvent.element = createElement("event", line, activeEvent.element);
      elements[elements.length - 1] = activeEvent.element;
    } else {
      appendText(line);
    }
  }
  for (const event of events) {
    event.eventIds = event.element.content.flatMap((line, index2) => {
      const match2 = line.match(EVENT_ID_PATTERN);
      if (/^\s+\^woev-(?!rec-)/.test(line) && !match2) {
        diagnostics.push({ line: event.line + index2, message: "Ung\xFCltige ^woev-ID." });
      }
      return match2 ? [match2[1]] : [];
    });
  }
  if (frontmatter) diagnostics.push({ line: 1, message: "YAML-Frontmatter ist nicht abgeschlossen." });
  if (fence) diagnostics.push({ line: fence.line, message: "Codeblock ist nicht abgeschlossen." });
  return { elements: state.elements, events, headings, diagnostics };
}
function getLineType(line, settings = DEFAULT_SETTINGS) {
  const heading = line.match(HEADING_PATTERN);
  if (heading) {
    const text = heading[1].trim().toLowerCase();
    const [key] = typedEntries(settings.weekdays).find(
      ([, value]) => text === value.trim().toLowerCase()
    ) ?? [null];
    if (key !== null) return ["key", key];
  }
  if (line.match(eventPattern(settings))) return ["event", null];
  if (/^(?: {2,}|\t)/.test(line)) return ["followUp", null];
  return ["text", null];
}
var HEADING_PATTERN = /^#\s+(.+?)(?:\s+\((\d{1,2})\))?\s*$/;
function eventPattern(settings, withTitle = false) {
  const prefix = settings.prefixes.event.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^-\\s+${prefix}${withTitle ? "\\s*:\\s*(.*)$" : "(?=:|\\s|$)"}`, "i");
}
function createElement(type, content, element) {
  const newContent = element ? [...element.content, content] : [content];
  if (type === "event") {
    const eventId = extractEventId(newContent);
    const recurrenceId = extractRecurrenceId(newContent);
    const exceptionInfo = extractExceptionInfo(newContent);
    const result = {
      type: "event",
      content: newContent,
      eventId: eventId || ""
    };
    if (recurrenceId) {
      result.recurrenceId = recurrenceId;
    }
    if (exceptionInfo.isException && exceptionInfo.exceptionOfRecurrenceId) {
      result.isException = true;
      result.exceptionOfRecurrenceId = exceptionInfo.exceptionOfRecurrenceId;
    }
    return result;
  }
  return { type, content: newContent };
}
function elementStructure(settings) {
  return {
    key: "start",
    elements: Object.entries(settings.weekdays).reduce(
      (acc, [key]) => ({ ...acc, [key]: [] }),
      {}
    )
  };
}
var typedEntries = (obj) => Object.entries(obj);

// src/lib/recurrence/file-operations.ts
var WEEKDAY_MAP2 = {
  Mo: "monday",
  Di: "tuesday",
  Mi: "wednesday",
  Do: "thursday",
  Fr: "friday",
  Sa: "saturday",
  So: "sunday"
};
function getWeekFilePath(date, settings) {
  const year = date.getFullYear();
  const monday = getMondayOfWeek(date);
  const weekNo = getWeekNumber(date);
  const fileName = `W${weekNo.toString().padStart(2, "0")} ${format(monday, "dd.MM.yy")}.md`;
  return `${settings.paths.weekFolder}/${year}/weeks/${fileName}`;
}
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
function getWeekdaySection(date) {
  const wd = getWeekdayFromDate(date);
  return WEEKDAY_MAP2[wd];
}
async function findWeekFilesForRange(startDate, endDate, settings, app) {
  const files = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  while (current <= endDate) {
    const filePath = getWeekFilePath(current, settings);
    const abstractFile = app.vault.getAbstractFileByPath(filePath);
    if (abstractFile instanceof import_obsidian3.TFile) {
      files.push(filePath);
    }
    current.setDate(current.getDate() + 7);
  }
  return files;
}
async function insertRecurringEventIntoFile(filePath, event, date, settings, app) {
  const abstractFile = app.vault.getAbstractFileByPath(filePath);
  if (!(abstractFile instanceof import_obsidian3.TFile)) {
    return;
  }
  const content = await app.vault.read(abstractFile);
  const elements = parseWo(content, settings);
  const section = getWeekdaySection(date);
  const newElements = [...elements[section], event];
  const updatedElements = {
    ...elements,
    [section]: newElements
  };
  await app.vault.modify(abstractFile, stringifyWo(updatedElements));
}
async function readWeekFile(filePath, settings, app) {
  const abstractFile = app.vault.getAbstractFileByPath(filePath);
  if (!(abstractFile instanceof import_obsidian3.TFile)) {
    return { elements: {}, exists: false };
  }
  const content = await app.vault.read(abstractFile);
  const elements = parseWo(content, settings);
  return { elements, exists: true };
}

// src/lib/recurrence/year-integration.ts
async function copyRecurringEventsFromYear(sourceYear, targetYear, settings, app) {
  const sourceStart = new Date(sourceYear, 0, 1);
  const sourceEnd = new Date(sourceYear, 11, 31);
  const targetStart = new Date(targetYear, 0, 1);
  const targetEnd = new Date(targetYear, 11, 31);
  const sourceFiles = await findWeekFilesForRange(sourceStart, sourceEnd, settings, app);
  let eventsCopied = 0;
  let occurrencesCreated = 0;
  for (const filePath of sourceFiles) {
    const { elements, exists } = await readWeekFile(filePath, settings, app);
    if (!exists) continue;
    for (const section of woFileTitleStructure) {
      if (section === "start" || section === "links") continue;
      for (const element of elements[section]) {
        if (element.type !== "event") continue;
        const eventElement = element;
        if (!eventElement.recurrenceId) continue;
        const recurrence = parseRecurrence(
          eventElement.content,
          eventElement.eventId,
          eventElement.recurrenceId
        );
        if (!recurrence) continue;
        if (recurrence.end.endDate < targetStart) continue;
        const effectiveEndDate = recurrence.end.endDate > targetEnd ? targetEnd : recurrence.end.endDate;
        const occurrences = generateOccurrences(targetStart, effectiveEndDate, recurrence);
        for (const date of occurrences) {
          const targetFilePath = getWeekFilePath(date, settings);
          await insertRecurringEventIntoFile(
            targetFilePath,
            eventElement,
            date,
            settings,
            app
          );
          occurrencesCreated++;
        }
        eventsCopied++;
      }
    }
  }
  return { eventsCopied, occurrencesCreated };
}

// src/lib/commands/create-year/create-year.ts
var createYear = (app, settings) => async () => {
  new CreateYearPrompt(app, async (year) => {
    try {
      const yyyy = Number.parseInt(year, 10);
      const lastYear = prepareData(yyyy - 1);
      const nextYear = prepareData(yyyy + 1);
      const weeks = prepareData(yyyy);
      const expandedWeeks = [lastYear[lastYear.length - 1], ...weeks, nextYear[0]];
      const preparedWeeks = prepareWeeks(yyyy, expandedWeeks, settings);
      const numbFiles = await writeWeekFiles(yyyy, preparedWeeks, settings, app);
      createYearFile(yyyy, weeks, settings, app);
      try {
        const { eventsCopied, occurrencesCreated } = await copyRecurringEventsFromYear(
          yyyy - 1,
          yyyy,
          settings,
          app
        );
        new import_obsidian4.Notice(
          `${eventsCopied} Terminserien mit ${occurrencesCreated} Vorkommen kopiert`
        );
      } catch (copyError) {
        new import_obsidian4.Notice(`Kopieren fehlgeschlagen: ${copyError}`);
      }
      new import_obsidian4.Notice(
        `Total ${weeks.length} Wochen, davon ${weeks.length - numbFiles} erstellt, ${numbFiles} existierten schon`
      );
    } catch (error) {
      console.error(error);
      new import_obsidian4.Notice("Fehler beim Erstellen der Wochen-Dateien");
    }
  }).open();
};

// src/lib/commands/goto-current-week.ts
var gotoCurrentWeek = (app, settings) => async () => {
  const monday = getLastMonday(/* @__PURE__ */ new Date());
  const week = getISOWeek(monday);
  const fileName = getWeekFileName(monday, week);
  const year = getISOWeekYear(monday);
  const filePath = `${settings.paths.weekFolder}/${year}/weeks/${fileName}`;
  app.workspace.openLinkText(filePath, "", false);
};

// src/lib/commands/migrate-week-headings.ts
var import_obsidian5 = require("obsidian");

// src/lib/parseWeekFile/migrate-week-headings.ts
function migrateWeekHeadings(content, filePath, settings) {
  const prefix = `${settings.paths.weekFolder}/`;
  if (!filePath.startsWith(prefix)) return content;
  const match2 = filePath.slice(prefix.length).match(/^\d{4}\/weeks\/W(0[1-9]|[1-4]\d|5[0-3]) (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match2) return content;
  const [, , day, month, year] = match2;
  const monday = new Date(2e3 + Number(year), Number(month) - 1, Number(day));
  if (monday.getFullYear() !== 2e3 + Number(year) || monday.getMonth() !== Number(month) - 1 || monday.getDate() !== Number(day) || monday.getDay() !== 1) {
    return content;
  }
  let frontmatter = false;
  let fence = null;
  return content.split("\n").map((line, index2) => {
    const text = line.endsWith("\r") ? line.slice(0, -1) : line;
    if (index2 === 0 && /^\uFEFF?---$/.test(text)) {
      frontmatter = true;
      return line;
    }
    if (frontmatter) {
      if (/^(---|\.\.\.)$/.test(text)) frontmatter = false;
      return line;
    }
    if (fence) {
      const closing = text.match(/^ {0,3}(`+|~+)\s*$/)?.[1];
      if (closing && closing[0] === fence[0] && closing.length >= fence.length) fence = null;
      return line;
    }
    const opening = text.match(/^ {0,3}(`{3,}|~{3,})/);
    if (opening) {
      fence = opening[1];
      return line;
    }
    const [type, key] = getLineType(text, settings);
    if (type !== "key" || key === null || key === "start" || key === "links") return line;
    return formatDayHeading(monday, key, settings.weekdays[key]) + (line.endsWith("\r") ? "\r" : "");
  }).join("\n");
}

// src/lib/commands/migrate-week-headings.ts
var migrateAllWeekHeadings = (app, settings, migratingFiles) => {
  let running = false;
  return async () => {
    if (running) {
      new import_obsidian5.Notice("Die Erg\xE4nzung der Monatstage l\xE4uft bereits.");
      return;
    }
    running = true;
    let changed = 0;
    let failed = 0;
    try {
      const prefix = `${settings.paths.weekFolder}/`;
      const files = app.vault.getMarkdownFiles().filter(
        (file) => file.path.startsWith(prefix) && /^\d{4}\/weeks\/W\d{2} \d{2}\.\d{2}\.\d{2}\.md$/.test(file.path.slice(prefix.length))
      );
      for (const file of files) {
        try {
          const content = await app.vault.read(file);
          if (migrateWeekHeadings(content, file.path, settings) === content) continue;
          migratingFiles.add(file.path);
          let updated = false;
          await app.vault.process(file, (current) => {
            const migrated = migrateWeekHeadings(current, file.path, settings);
            updated = migrated !== current;
            return migrated;
          });
          if (updated) changed++;
        } catch (error) {
          failed++;
          console.error(`Failed to migrate week headings: ${file.path}`, error);
        } finally {
          migratingFiles.delete(file.path);
        }
      }
      new import_obsidian5.Notice(
        `Monatstage: ${files.length} Wochen-Dateien gepr\xFCft, ${changed} angepasst, ${failed} Fehler.`
      );
    } finally {
      running = false;
    }
  };
};

// src/lib/commands/process-active-file.ts
var import_obsidian6 = require("obsidian");

// src/lib/parseWeekFile/set-event-ids.ts
function setEventIds(elements, year, week) {
  return woFileTitleStructure.filter((key) => !["start", "links"].includes(key)).reduce((acc, section) => {
    const elements2 = acc[section].map((element) => {
      if (element.type === "event") {
        const content = element.content;
        if (content.some((line) => /^\s+\^woev-(?!rec-)[a-zA-Z0-9]+/.test(line))) {
          return element;
        }
        const contentString = content.map((item) => item.trim()).join("|");
        const hashValue = `${year}|${week}|${section}|${contentString}`;
        const hash = createLocalId(hashValue);
        return { ...element, content: [...content, `  ^woev-${hash}`] };
      }
      return element;
    });
    return { ...acc, [section]: elements2 };
  }, elements);
}

// src/lib/commands/process-file.ts
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getWeekFileInfo(filePath, weekFolder) {
  const matcher = new RegExp(
    `^${escapeRegExp(weekFolder)}/(\\d{4})/weeks/W(\\d{1,2})(?:\\s|$)`
  );
  const match2 = filePath.match(matcher);
  if (!match2) return null;
  const year = Number(match2[1]);
  const week = Number(match2[2]);
  if (!Number.isInteger(year) || !Number.isInteger(week) || week < 1 || week > 53) {
    return null;
  }
  return { year, week };
}
function processFile(fileContent, file, settings) {
  const weekFileInfo = getWeekFileInfo(file.path, settings.paths.weekFolder);
  if (!weekFileInfo) return "";
  const structuredFile = parseWo(fileContent, settings);
  const originalContent = stringifyWo(structuredFile);
  const changedFileContent = stringifyWo(
    setEventIds(structuredFile, weekFileInfo.year, weekFileInfo.week)
  );
  if (originalContent === changedFileContent) {
    return "";
  }
  return changedFileContent;
}

// src/lib/commands/process-active-file.ts
var processActiveFile = (app, settings) => async () => {
  const file = app.workspace.getActiveFile();
  if (!file) {
    new import_obsidian6.Notice("No active file.");
    return;
  }
  const fileContent = await app.vault.read(file);
  const changedFile = processFile(fileContent, file, settings);
  if (changedFile) {
    await app.vault.modify(file, changedFile);
    new import_obsidian6.Notice("Processed current file.  Filename: " + file.name);
  } else {
    new import_obsidian6.Notice("Es hat keine \xC4nderungen gegeben!");
  }
};

// src/lib/commands/process-all.ts
var import_obsidian7 = require("obsidian");
var processAll = (app, settings) => async () => {
  let numb = 0;
  const files = app.vault.getMarkdownFiles();
  const woFiles = files.filter(
    (file) => getWeekFileInfo(file.path, settings.paths.weekFolder) !== null
  );
  await Promise.all(
    woFiles.map(async (file) => {
      const fileContent = await app.vault.read(file);
      const changedFile = processFile(fileContent, file, settings);
      if (changedFile) {
        ++numb;
        return app.vault.modify(file, changedFile);
      }
    })
  );
  new import_obsidian7.Notice(`Es wurden ${woFiles.length} WochenFiles verarbeitet und davon ${numb} angepasst.`);
};

// src/lib/event-handling/modify-week-file-event.ts
var import_obsidian8 = require("obsidian");
function extractDateFromFilePath(filePath) {
  const match2 = filePath.match(/W\d{2} (\d{2})\.(\d{2})\.(\d{2})\.md$/);
  if (!match2) return null;
  const [, dayStr, monthStr, yearStr] = match2;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = 2e3 + parseInt(yearStr, 10);
  return new Date(year, month, day);
}
function detectRecurringEvents(fileContent, filePath, settings) {
  const elements = parseWo(fileContent, settings);
  const fileDate = extractDateFromFilePath(filePath);
  if (!fileDate) return [];
  const recurring = Object.entries(elements).flatMap(
    ([, sectionElements]) => sectionElements.filter(
      (element) => element.type === "event" && element.recurrenceId !== void 0 && !element.isException
    ).map((eventElement) => {
      const recurrence = parseRecurrence(
        eventElement.content,
        eventElement.eventId,
        eventElement.recurrenceId
      );
      return recurrence ? { event: eventElement, recurrence, eventDate: fileDate } : null;
    })
  ).filter((item) => item !== null);
  return recurring;
}
async function propagateRecurrenceChanges(app, settings, recurringEvents) {
  for (const { event, recurrence, eventDate } of recurringEvents) {
    const endDate = recurrence.end.endDate;
    const files = await findWeekFilesForRange(eventDate, endDate, settings, app);
    for (const filePath of files) {
      const { elements, exists } = await readWeekFile(filePath, settings, app);
      if (!exists) continue;
      let updated = false;
      for (const section of Object.keys(elements)) {
        const sectionElements = elements[section];
        for (let i = 0; i < sectionElements.length; i++) {
          const element = sectionElements[i];
          if (element.type === "event") {
            const eventElement = element;
            if (eventElement.recurrenceId === recurrence.recurrenceId && !eventElement.isException && eventElement.eventId !== event.eventId) {
              sectionElements[i] = {
                ...eventElement,
                content: event.content
              };
              updated = true;
            }
          }
        }
      }
      if (updated) {
        const abstractFile = app.vault.getAbstractFileByPath(filePath);
        if (abstractFile instanceof import_obsidian8.TFile) {
          await app.vault.modify(abstractFile, stringifyWo(elements));
        }
      }
    }
  }
}
var modifyWeekFileEvent = (app, modifyEvents, actualFileChanged$, settings, ignoredFiles = /* @__PURE__ */ new Set()) => modifyEvents.pipe(
  filter((file) => file instanceof import_obsidian8.TFile),
  filter((file) => !ignoredFiles.has(file.path)),
  filter((file) => getWeekFileInfo(file.path, settings.paths.weekFolder) !== null),
  filter((file) => file.extension === "md"),
  switchMap(
    (file) => from(app.vault.read(file)).pipe(map((fileContent) => [file, fileContent]))
  ),
  debounce(() => race(actualFileChanged$, timer(1e4))),
  switchMap(([file, fileContent]) => {
    const changedFile = processFile(fileContent, file, settings);
    if (changedFile) {
      return from(app.vault.modify(file, changedFile)).pipe(
        switchMap(async () => {
          const recurringInFile = detectRecurringEvents(fileContent, file.path, settings);
          if (recurringInFile.length > 0) {
            await propagateRecurrenceChanges(app, settings, recurringInFile);
          }
          return new import_obsidian8.Notice(`File ${file.name} angepasst.`);
        }),
        catchError((err) => {
          const message2 = err instanceof Error ? err.message : String(err);
          return of(new import_obsidian8.Notice(`Fehler bei der Anpassung von ${file.name}: ${message2}`));
        })
      );
    }
    return of("");
  })
).subscribe();

// src/lib/settings/load-settings.ts
function mergeSettings(saved = null) {
  return {
    paths: { ...DEFAULT_SETTINGS.paths, ...saved?.paths },
    weekdays: { ...DEFAULT_SETTINGS.weekdays, ...saved?.weekdays },
    prefixes: { ...DEFAULT_SETTINGS.prefixes, ...saved?.prefixes },
    caldav: { ...DEFAULT_SETTINGS.caldav, ...saved?.caldav }
  };
}

// src/lib/settings/week-calendar-settings-tab.ts
var import_obsidian10 = require("obsidian");

// node_modules/tsdav/dist/tsdav.esm.js
var import_debug = __toESM(require_browser());
var import_xml_js = __toESM(require_lib());
var import_cross_fetch = __toESM(require_browser_ponyfill());
var import_base_64 = __toESM(require_base64());
var DAVNamespace;
(function(DAVNamespace2) {
  DAVNamespace2["CALENDAR_SERVER"] = "http://calendarserver.org/ns/";
  DAVNamespace2["CALDAV_APPLE"] = "http://apple.com/ns/ical/";
  DAVNamespace2["CALDAV"] = "urn:ietf:params:xml:ns:caldav";
  DAVNamespace2["CARDDAV"] = "urn:ietf:params:xml:ns:carddav";
  DAVNamespace2["DAV"] = "DAV:";
})(DAVNamespace || (DAVNamespace = {}));
var DAVAttributeMap = {
  [DAVNamespace.CALDAV]: "xmlns:c",
  [DAVNamespace.CARDDAV]: "xmlns:card",
  [DAVNamespace.CALENDAR_SERVER]: "xmlns:cs",
  [DAVNamespace.CALDAV_APPLE]: "xmlns:ca",
  [DAVNamespace.DAV]: "xmlns:d"
};
var DAVNamespaceShort;
(function(DAVNamespaceShort2) {
  DAVNamespaceShort2["CALDAV"] = "c";
  DAVNamespaceShort2["CARDDAV"] = "card";
  DAVNamespaceShort2["CALENDAR_SERVER"] = "cs";
  DAVNamespaceShort2["CALDAV_APPLE"] = "ca";
  DAVNamespaceShort2["DAV"] = "d";
})(DAVNamespaceShort || (DAVNamespaceShort = {}));
var ICALObjects;
(function(ICALObjects2) {
  ICALObjects2["VEVENT"] = "VEVENT";
  ICALObjects2["VTODO"] = "VTODO";
  ICALObjects2["VJOURNAL"] = "VJOURNAL";
  ICALObjects2["VFREEBUSY"] = "VFREEBUSY";
  ICALObjects2["VTIMEZONE"] = "VTIMEZONE";
  ICALObjects2["VALARM"] = "VALARM";
})(ICALObjects || (ICALObjects = {}));
var camelCase = (str) => str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());
var getFetch = () => {
  if (typeof globalThis !== "undefined" && typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }
  return import_cross_fetch.default;
};
var fetch = getFetch();
var nativeType = (value) => {
  const nValue = Number(value);
  if (!Number.isNaN(nValue)) {
    return nValue;
  }
  const bValue = value.toLowerCase();
  if (bValue === "true") {
    return true;
  }
  if (bValue === "false") {
    return false;
  }
  return value;
};
var urlEquals = (urlA, urlB) => {
  if (!urlA && !urlB) {
    return true;
  }
  if (!urlA || !urlB) {
    return false;
  }
  const trimmedUrlA = urlA.trim();
  const trimmedUrlB = urlB.trim();
  if (Math.abs(trimmedUrlA.length - trimmedUrlB.length) > 1) {
    return false;
  }
  const strippedUrlA = trimmedUrlA.slice(-1) === "/" ? trimmedUrlA.slice(0, -1) : trimmedUrlA;
  const strippedUrlB = trimmedUrlB.slice(-1) === "/" ? trimmedUrlB.slice(0, -1) : trimmedUrlB;
  return urlA.includes(strippedUrlB) || urlB.includes(strippedUrlA);
};
var urlContains = (urlA, urlB) => {
  if (!urlA && !urlB) {
    return true;
  }
  if (!urlA || !urlB) {
    return false;
  }
  const trimmedUrlA = urlA.trim();
  const trimmedUrlB = urlB.trim();
  const strippedUrlA = trimmedUrlA.slice(-1) === "/" ? trimmedUrlA.slice(0, -1) : trimmedUrlA;
  const strippedUrlB = trimmedUrlB.slice(-1) === "/" ? trimmedUrlB.slice(0, -1) : trimmedUrlB;
  return urlA.includes(strippedUrlB) || urlB.includes(strippedUrlA);
};
var getDAVAttribute = (nsArr) => nsArr.reduce((prev, curr) => ({ ...prev, [DAVAttributeMap[curr]]: curr }), {});
var cleanupFalsy = (obj) => Object.entries(obj).reduce((prev, [key, value]) => {
  if (value)
    return { ...prev, [key]: value };
  return prev;
}, {});
var conditionalParam = (key, param) => {
  if (param) {
    return {
      [key]: param
    };
  }
  return {};
};
var excludeHeaders = (headers, headersToExclude) => {
  if (!headers) {
    return {};
  }
  if (!headersToExclude || headersToExclude.length === 0) {
    return headers;
  }
  return Object.fromEntries(Object.entries(headers).filter(([key]) => !headersToExclude.includes(key)));
};
var requestHelpers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  cleanupFalsy,
  conditionalParam,
  excludeHeaders,
  getDAVAttribute,
  urlContains,
  urlEquals
});
var debug$5 = (0, import_debug.default)("tsdav:request");
var davRequest = async (params) => {
  var _a;
  const { url, init, convertIncoming = true, parseOutgoing = true, fetchOptions = {}, fetch: fetchOverride } = params;
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  const { headers = {}, body, namespace, method, attributes } = init;
  const xmlBody = convertIncoming ? import_xml_js.default.js2xml({
    _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
    ...body,
    _attributes: attributes
  }, {
    compact: true,
    spaces: 2,
    elementNameFn: (name) => {
      if (namespace && !/^.+:.+/.test(name)) {
        return `${namespace}:${name}`;
      }
      return name;
    }
  }) : body;
  const fetchOptionsWithoutHeaders = {
    ...fetchOptions
  };
  delete fetchOptionsWithoutHeaders.headers;
  const davResponse = await requestFetch(url, {
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      ...cleanupFalsy(headers),
      ...fetchOptions.headers || {}
    },
    body: xmlBody,
    method,
    ...fetchOptionsWithoutHeaders
  });
  const resText = await davResponse.text();
  if (!davResponse.ok || !((_a = davResponse.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("xml")) || !parseOutgoing || !resText) {
    return [
      {
        href: davResponse.url,
        ok: davResponse.ok,
        status: davResponse.status,
        statusText: davResponse.statusText,
        raw: resText
      }
    ];
  }
  const result = import_xml_js.default.xml2js(resText, {
    compact: true,
    trim: true,
    textFn: (value, parentElement) => {
      try {
        const parentOfParent = parentElement._parent;
        const pOpKeys = Object.keys(parentOfParent);
        const keyNo = pOpKeys.length;
        const keyName = pOpKeys[keyNo - 1];
        const arrOfKey = parentOfParent[keyName];
        const arrOfKeyLen = arrOfKey.length;
        if (arrOfKeyLen > 0) {
          const arr = arrOfKey;
          const arrIndex = arrOfKey.length - 1;
          arr[arrIndex] = nativeType(value);
        } else {
          parentOfParent[keyName] = nativeType(value);
        }
      } catch (e) {
        debug$5(e.stack);
      }
    },
    // remove namespace & camelCase
    elementNameFn: (attributeName) => camelCase(attributeName.replace(/^.+:/, "")),
    attributesFn: (value) => {
      const newVal = { ...value };
      delete newVal.xmlns;
      return newVal;
    },
    ignoreDeclaration: true
  });
  const responseBodies = Array.isArray(result.multistatus.response) ? result.multistatus.response : [result.multistatus.response];
  return responseBodies.map((responseBody) => {
    var _a2, _b;
    const statusRegex = /^\S+\s(?<status>\d+)\s(?<statusText>.+)$/;
    if (!responseBody) {
      return {
        status: davResponse.status,
        statusText: davResponse.statusText,
        ok: davResponse.ok
      };
    }
    const matchArr = statusRegex.exec(responseBody.status);
    return {
      raw: result,
      href: responseBody.href,
      status: (matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups) ? Number.parseInt(matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups.status, 10) : davResponse.status,
      statusText: (_b = (_a2 = matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups) === null || _a2 === void 0 ? void 0 : _a2.statusText) !== null && _b !== void 0 ? _b : davResponse.statusText,
      ok: !responseBody.error,
      error: responseBody.error,
      responsedescription: responseBody.responsedescription,
      props: (Array.isArray(responseBody.propstat) ? responseBody.propstat : [responseBody.propstat]).reduce((prev, curr) => {
        return {
          ...prev,
          ...curr === null || curr === void 0 ? void 0 : curr.prop
        };
      }, {})
    };
  });
};
var propfind = async (params) => {
  const { url, props, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return davRequest({
    url,
    init: {
      method: "PROPFIND",
      headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
      namespace: DAVNamespaceShort.DAV,
      body: {
        propfind: {
          _attributes: getDAVAttribute([
            DAVNamespace.CALDAV,
            DAVNamespace.CALDAV_APPLE,
            DAVNamespace.CALENDAR_SERVER,
            DAVNamespace.CARDDAV,
            DAVNamespace.DAV
          ]),
          prop: props
        }
      }
    },
    fetchOptions,
    fetch: fetchOverride
  });
};
var createObject = async (params) => {
  const { url, data, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  return requestFetch(url, {
    method: "PUT",
    body: data,
    headers: excludeHeaders(headers, headersToExclude),
    ...fetchOptions
  });
};
var updateObject = async (params) => {
  const { url, data, etag, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  return requestFetch(url, {
    method: "PUT",
    body: data,
    headers: excludeHeaders(cleanupFalsy({ "If-Match": etag, ...headers }), headersToExclude),
    ...fetchOptions
  });
};
var deleteObject = async (params) => {
  const { url, headers, etag, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  return requestFetch(url, {
    method: "DELETE",
    headers: excludeHeaders(cleanupFalsy({ "If-Match": etag, ...headers }), headersToExclude),
    ...fetchOptions
  });
};
var request = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  createObject,
  davRequest,
  deleteObject,
  propfind,
  updateObject
});
function hasFields(obj, fields) {
  const inObj = (object) => fields.every((f) => object[f]);
  if (Array.isArray(obj)) {
    return obj.every((o) => inObj(o));
  }
  return inObj(obj);
}
var findMissingFieldNames = (obj, fields) => fields.reduce((prev, curr) => obj[curr] ? prev : `${prev.length ? `${prev},` : ""}${curr.toString()}`, "");
var debug$4 = (0, import_debug.default)("tsdav:collection");
var collectionQuery = async (params) => {
  const { url, body, depth, defaultNamespace = DAVNamespaceShort.DAV, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const queryResults = await davRequest({
    url,
    init: {
      method: "REPORT",
      headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
      namespace: defaultNamespace,
      body
    },
    fetchOptions,
    fetch: fetchOverride
  });
  const errorResponse = queryResults.find((res) => !res.ok || res.status && res.status >= 400);
  if (errorResponse) {
    throw new Error(`Collection query failed: ${errorResponse.status} ${errorResponse.statusText}. ${errorResponse.raw ? `Raw response: ${errorResponse.raw}` : ""}`);
  }
  if (queryResults.length === 1 && !queryResults[0].raw && queryResults[0].status && queryResults[0].status < 300) {
    return [];
  }
  return queryResults;
};
var makeCollection = async (params) => {
  const { url, props, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return davRequest({
    url,
    init: {
      method: "MKCOL",
      headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
      namespace: DAVNamespaceShort.DAV,
      body: props ? {
        mkcol: {
          set: {
            prop: props
          }
        }
      } : void 0
    },
    fetchOptions,
    fetch: fetchOverride
  });
};
var supportedReportSet = async (params) => {
  var _a, _b, _c, _d, _e;
  const { collection: collection2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const res = await propfind({
    url: collection2.url,
    props: {
      [`${DAVNamespaceShort.DAV}:supported-report-set`]: {}
    },
    depth: "0",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  return (_e = (_d = (_c = (_b = (_a = res[0]) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.supportedReportSet) === null || _c === void 0 ? void 0 : _c.supportedReport) === null || _d === void 0 ? void 0 : _d.map((sr) => Object.keys(sr.report)[0])) !== null && _e !== void 0 ? _e : [];
};
var isCollectionDirty = async (params) => {
  var _a, _b, _c;
  const { collection: collection2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const responses = await propfind({
    url: collection2.url,
    props: {
      [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {}
    },
    depth: "0",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  const res = responses.filter((r) => urlContains(collection2.url, r.href))[0];
  if (!res) {
    throw new Error("Collection does not exist on server");
  }
  return {
    isDirty: `${collection2.ctag}` !== `${(_a = res.props) === null || _a === void 0 ? void 0 : _a.getctag}`,
    newCtag: (_c = (_b = res.props) === null || _b === void 0 ? void 0 : _b.getctag) === null || _c === void 0 ? void 0 : _c.toString()
  };
};
var syncCollection = (params) => {
  const { url, props, headers, syncLevel, syncToken, headersToExclude, fetchOptions, fetch: fetchOverride } = params;
  return davRequest({
    url,
    init: {
      method: "REPORT",
      namespace: DAVNamespaceShort.DAV,
      headers: excludeHeaders({ ...headers }, headersToExclude),
      body: {
        "sync-collection": {
          _attributes: getDAVAttribute([
            DAVNamespace.CALDAV,
            DAVNamespace.CARDDAV,
            DAVNamespace.DAV
          ]),
          "sync-level": syncLevel,
          "sync-token": syncToken,
          [`${DAVNamespaceShort.DAV}:prop`]: props
        }
      }
    },
    fetchOptions,
    fetch: fetchOverride
  });
};
var smartCollectionSync = async (params) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
  const { collection: collection2, method, headers, headersToExclude, account: account2, detailedResult, fetchOptions = {}, fetch: fetchOverride } = params;
  const requiredFields = ["accountType", "homeUrl"];
  if (!account2 || !hasFields(account2, requiredFields)) {
    if (!account2) {
      throw new Error("no account for smartCollectionSync");
    }
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before smartCollectionSync`);
  }
  const syncMethod = method !== null && method !== void 0 ? method : ((_a = collection2.reports) === null || _a === void 0 ? void 0 : _a.includes("syncCollection")) ? "webdav" : "basic";
  debug$4(`smart collection sync with type ${account2.accountType} and method ${syncMethod}`);
  if (syncMethod === "webdav") {
    const result = await syncCollection({
      url: collection2.url,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${account2.accountType === "caldav" ? DAVNamespaceShort.CALDAV : DAVNamespaceShort.CARDDAV}:${account2.accountType === "caldav" ? "calendar-data" : "address-data"}`]: {},
        [`${DAVNamespaceShort.DAV}:displayname`]: {}
      },
      syncLevel: 1,
      syncToken: collection2.syncToken,
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    });
    const objectResponses = result.filter((r) => {
      var _a2;
      const extName = account2.accountType === "caldav" ? ".ics" : ".vcf";
      return ((_a2 = r.href) === null || _a2 === void 0 ? void 0 : _a2.slice(-4)) === extName;
    });
    const changedObjectUrls = objectResponses.filter((o) => o.status !== 404).map((r) => r.href);
    const deletedObjectUrls = objectResponses.filter((o) => o.status === 404).map((r) => r.href);
    const multiGetObjectResponse = changedObjectUrls.length ? (_c = await ((_b = collection2 === null || collection2 === void 0 ? void 0 : collection2.objectMultiGet) === null || _b === void 0 ? void 0 : _b.call(collection2, {
      url: collection2.url,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${account2.accountType === "caldav" ? DAVNamespaceShort.CALDAV : DAVNamespaceShort.CARDDAV}:${account2.accountType === "caldav" ? "calendar-data" : "address-data"}`]: {}
      },
      objectUrls: changedObjectUrls,
      depth: "1",
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    }))) !== null && _c !== void 0 ? _c : [] : [];
    const remoteObjects = multiGetObjectResponse.map((res) => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _j2, _k2;
      return {
        url: (_a2 = res.href) !== null && _a2 !== void 0 ? _a2 : "",
        etag: (_b2 = res.props) === null || _b2 === void 0 ? void 0 : _b2.getetag,
        data: (account2 === null || account2 === void 0 ? void 0 : account2.accountType) === "caldav" ? (_e2 = (_d2 = (_c2 = res.props) === null || _c2 === void 0 ? void 0 : _c2.calendarData) === null || _d2 === void 0 ? void 0 : _d2._cdata) !== null && _e2 !== void 0 ? _e2 : (_f2 = res.props) === null || _f2 === void 0 ? void 0 : _f2.calendarData : (_j2 = (_h2 = (_g2 = res.props) === null || _g2 === void 0 ? void 0 : _g2.addressData) === null || _h2 === void 0 ? void 0 : _h2._cdata) !== null && _j2 !== void 0 ? _j2 : (_k2 = res.props) === null || _k2 === void 0 ? void 0 : _k2.addressData
      };
    });
    const localObjects = (_d = collection2.objects) !== null && _d !== void 0 ? _d : [];
    const created = remoteObjects.filter((o) => localObjects.every((lo) => !urlContains(lo.url, o.url)));
    const updated = localObjects.reduce((prev, curr) => {
      const found = remoteObjects.find((ro) => urlContains(ro.url, curr.url));
      if (found && found.etag && found.etag !== curr.etag) {
        return [...prev, found];
      }
      return prev;
    }, []);
    const deleted = deletedObjectUrls.map((o) => ({
      url: o,
      etag: ""
    }));
    const unchanged = localObjects.filter((lo) => remoteObjects.some((ro) => urlContains(lo.url, ro.url) && ro.etag === lo.etag));
    return {
      ...collection2,
      objects: detailedResult ? { created, updated, deleted } : [...unchanged, ...created, ...updated],
      // all syncToken in the results are the same so we use the first one here
      syncToken: (_h = (_g = (_f = (_e = result[0]) === null || _e === void 0 ? void 0 : _e.raw) === null || _f === void 0 ? void 0 : _f.multistatus) === null || _g === void 0 ? void 0 : _g.syncToken) !== null && _h !== void 0 ? _h : collection2.syncToken
    };
  }
  if (syncMethod === "basic") {
    const { isDirty, newCtag } = await isCollectionDirty({
      collection: collection2,
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    });
    const localObjects = (_j = collection2.objects) !== null && _j !== void 0 ? _j : [];
    const remoteObjects = (_m = await ((_l = (_k = collection2).fetchObjects) === null || _l === void 0 ? void 0 : _l.call(_k, {
      collection: collection2,
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    }))) !== null && _m !== void 0 ? _m : [];
    const created = remoteObjects.filter((ro) => localObjects.every((lo) => !urlContains(lo.url, ro.url)));
    const updated = localObjects.reduce((prev, curr) => {
      const found = remoteObjects.find((ro) => urlContains(ro.url, curr.url));
      if (found && found.etag && found.etag !== curr.etag) {
        return [...prev, found];
      }
      return prev;
    }, []);
    const deleted = localObjects.filter((cal) => remoteObjects.every((ro) => !urlContains(ro.url, cal.url)));
    const unchanged = localObjects.filter((lo) => remoteObjects.some((ro) => urlContains(lo.url, ro.url) && ro.etag === lo.etag));
    if (isDirty) {
      return {
        ...collection2,
        objects: detailedResult ? { created, updated, deleted } : [...unchanged, ...created, ...updated],
        ctag: newCtag
      };
    }
  }
  return detailedResult ? {
    ...collection2,
    objects: {
      created: [],
      updated: [],
      deleted: []
    }
  } : collection2;
};
var collection = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  collectionQuery,
  isCollectionDirty,
  makeCollection,
  smartCollectionSync,
  supportedReportSet,
  syncCollection
});
var debug$3 = (0, import_debug.default)("tsdav:addressBook");
var addressBookQuery = async (params) => {
  const { url, props, filters, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return collectionQuery({
    url,
    body: {
      "addressbook-query": cleanupFalsy({
        _attributes: getDAVAttribute([DAVNamespace.CARDDAV, DAVNamespace.DAV]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        filter: filters !== null && filters !== void 0 ? filters : {
          "prop-filter": {
            _attributes: {
              name: "FN"
            }
          }
        }
      })
    },
    defaultNamespace: DAVNamespaceShort.CARDDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var addressBookMultiGet = async (params) => {
  const { url, props, objectUrls, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return collectionQuery({
    url,
    body: {
      "addressbook-multiget": cleanupFalsy({
        _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CARDDAV]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        [`${DAVNamespaceShort.DAV}:href`]: objectUrls
      })
    },
    defaultNamespace: DAVNamespaceShort.CARDDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var fetchAddressBooks = async (params) => {
  const { account: account2, headers, props: customProps, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params !== null && params !== void 0 ? params : {};
  const requiredFields = ["homeUrl", "rootUrl"];
  if (!account2 || !hasFields(account2, requiredFields)) {
    if (!account2) {
      throw new Error("no account for fetchAddressBooks");
    }
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before fetchAddressBooks`);
  }
  const res = await propfind({
    url: account2.homeUrl,
    props: customProps !== null && customProps !== void 0 ? customProps : {
      [`${DAVNamespaceShort.DAV}:displayname`]: {},
      [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
      [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
      [`${DAVNamespaceShort.DAV}:sync-token`]: {}
    },
    depth: "1",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  return Promise.all(res.filter((r) => {
    var _a, _b;
    return Object.keys((_b = (_a = r.props) === null || _a === void 0 ? void 0 : _a.resourcetype) !== null && _b !== void 0 ? _b : {}).includes("addressbook");
  }).map((rs) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const displayName = (_c = (_b = (_a = rs.props) === null || _a === void 0 ? void 0 : _a.displayname) === null || _b === void 0 ? void 0 : _b._cdata) !== null && _c !== void 0 ? _c : (_d = rs.props) === null || _d === void 0 ? void 0 : _d.displayname;
    debug$3(`Found address book named ${typeof displayName === "string" ? displayName : ""},
             props: ${JSON.stringify(rs.props)}`);
    return {
      url: new URL((_e = rs.href) !== null && _e !== void 0 ? _e : "", (_f = account2.rootUrl) !== null && _f !== void 0 ? _f : "").href,
      ctag: (_g = rs.props) === null || _g === void 0 ? void 0 : _g.getctag,
      displayName: typeof displayName === "string" ? displayName : "",
      resourcetype: Object.keys((_h = rs.props) === null || _h === void 0 ? void 0 : _h.resourcetype),
      syncToken: (_j = rs.props) === null || _j === void 0 ? void 0 : _j.syncToken
    };
  }).map(async (addr) => ({
    ...addr,
    reports: await supportedReportSet({
      collection: addr,
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    })
  })));
};
var fetchVCards = async (params) => {
  const { addressBook: addressBook2, headers, objectUrls, headersToExclude, urlFilter = (url) => url, useMultiGet = true, fetchOptions = {}, fetch: fetchOverride } = params;
  debug$3(`Fetching vcards from ${addressBook2 === null || addressBook2 === void 0 ? void 0 : addressBook2.url}`);
  const requiredFields = ["url"];
  if (!addressBook2 || !hasFields(addressBook2, requiredFields)) {
    if (!addressBook2) {
      throw new Error("cannot fetchVCards for undefined addressBook");
    }
    throw new Error(`addressBook must have ${findMissingFieldNames(addressBook2, requiredFields)} before fetchVCards`);
  }
  const vcardUrls = (objectUrls !== null && objectUrls !== void 0 ? objectUrls : (
    // fetch all objects of the calendar
    (await addressBookQuery({
      url: addressBook2.url,
      props: { [`${DAVNamespaceShort.DAV}:getetag`]: {} },
      depth: "1",
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    })).map((res) => {
      var _a;
      return (_a = res.href) !== null && _a !== void 0 ? _a : "";
    })
  )).map((url) => url.startsWith("http") || !url ? url : new URL(url, addressBook2.url).href).filter((url) => url && !urlEquals(url, addressBook2.url)).filter(urlFilter).map((url) => new URL(url).pathname);
  let vCardResults = [];
  if (vcardUrls.length > 0) {
    if (useMultiGet) {
      vCardResults = await addressBookMultiGet({
        url: addressBook2.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CARDDAV}:address-data`]: {}
        },
        objectUrls: vcardUrls,
        depth: "1",
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
        fetch: fetchOverride
      });
    } else {
      vCardResults = await addressBookQuery({
        url: addressBook2.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CARDDAV}:address-data`]: {}
        },
        depth: "1",
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
        fetch: fetchOverride
      });
    }
  }
  return vCardResults.map((res) => {
    var _a, _b, _c, _d, _e, _f;
    return {
      url: new URL((_a = res.href) !== null && _a !== void 0 ? _a : "", addressBook2.url).href,
      etag: (_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag,
      data: (_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.addressData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.addressData
    };
  });
};
var createVCard = async (params) => {
  const { addressBook: addressBook2, vCardString, filename, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return createObject({
    url: new URL(filename, addressBook2.url).href,
    data: vCardString,
    headers: excludeHeaders({
      "content-type": "text/vcard; charset=utf-8",
      "If-None-Match": "*",
      ...headers
    }, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var updateVCard = async (params) => {
  const { vCard, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return updateObject({
    url: vCard.url,
    data: vCard.data,
    etag: vCard.etag,
    headers: excludeHeaders({
      "content-type": "text/vcard; charset=utf-8",
      ...headers
    }, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var deleteVCard = async (params) => {
  const { vCard, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return deleteObject({
    url: vCard.url,
    etag: vCard.etag,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var addressBook = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  addressBookMultiGet,
  addressBookQuery,
  createVCard,
  deleteVCard,
  fetchAddressBooks,
  fetchVCards,
  updateVCard
});
var debug$2 = (0, import_debug.default)("tsdav:calendar");
var fetchCalendarUserAddresses = async (params) => {
  var _a, _b, _c;
  const { account: account2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requiredFields = ["principalUrl", "rootUrl"];
  if (!hasFields(account2, requiredFields)) {
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before fetchUserAddresses`);
  }
  debug$2(`Fetch user addresses from ${account2.principalUrl}`);
  const responses = await propfind({
    url: account2.principalUrl,
    props: { [`${DAVNamespaceShort.CALDAV}:calendar-user-address-set`]: {} },
    depth: "0",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  const matched = responses.find((r) => urlContains(account2.principalUrl, r.href));
  if (!matched || !matched.ok) {
    throw new Error("cannot find calendarUserAddresses");
  }
  const addresses = ((_c = (_b = (_a = matched === null || matched === void 0 ? void 0 : matched.props) === null || _a === void 0 ? void 0 : _a.calendarUserAddressSet) === null || _b === void 0 ? void 0 : _b.href) === null || _c === void 0 ? void 0 : _c.filter(Boolean)) || [];
  debug$2(`Fetched calendar user addresses ${addresses}`);
  return addresses;
};
var calendarQuery = async (params) => {
  const { url, props, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return collectionQuery({
    url,
    body: {
      "calendar-query": cleanupFalsy({
        _attributes: getDAVAttribute([
          DAVNamespace.CALDAV,
          DAVNamespace.CALENDAR_SERVER,
          DAVNamespace.CALDAV_APPLE,
          DAVNamespace.DAV
        ]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        filter: filters,
        timezone
      })
    },
    defaultNamespace: DAVNamespaceShort.CALDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var calendarMultiGet = async (params) => {
  const { url, props, objectUrls, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return collectionQuery({
    url,
    body: {
      "calendar-multiget": cleanupFalsy({
        _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CALDAV]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
        filter: filters,
        timezone
      })
    },
    defaultNamespace: DAVNamespaceShort.CALDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var makeCalendar = async (params) => {
  const { url, props, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return davRequest({
    url,
    init: {
      method: "MKCALENDAR",
      headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
      namespace: DAVNamespaceShort.DAV,
      body: {
        [`${DAVNamespaceShort.CALDAV}:mkcalendar`]: {
          _attributes: getDAVAttribute([
            DAVNamespace.DAV,
            DAVNamespace.CALDAV,
            DAVNamespace.CALDAV_APPLE
          ]),
          set: {
            prop: props
          }
        }
      }
    },
    fetchOptions,
    fetch: fetchOverride
  });
};
var fetchCalendars = async (params) => {
  const { headers, account: account2, props: customProps, projectedProps, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params !== null && params !== void 0 ? params : {};
  const requiredFields = ["homeUrl", "rootUrl"];
  if (!account2 || !hasFields(account2, requiredFields)) {
    if (!account2) {
      throw new Error("no account for fetchCalendars");
    }
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before fetchCalendars`);
  }
  const res = await propfind({
    url: account2.homeUrl,
    props: customProps !== null && customProps !== void 0 ? customProps : {
      [`${DAVNamespaceShort.CALDAV}:calendar-description`]: {},
      [`${DAVNamespaceShort.CALDAV}:calendar-timezone`]: {},
      [`${DAVNamespaceShort.DAV}:displayname`]: {},
      [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: {},
      [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
      [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
      [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]: {},
      [`${DAVNamespaceShort.DAV}:sync-token`]: {}
    },
    depth: "1",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  return Promise.all(res.filter((r) => {
    var _a, _b;
    return Object.keys((_b = (_a = r.props) === null || _a === void 0 ? void 0 : _a.resourcetype) !== null && _b !== void 0 ? _b : {}).includes("calendar");
  }).filter((rc) => {
    var _a, _b, _c, _d, _e, _f;
    const components = Array.isArray((_b = (_a = rc.props) === null || _a === void 0 ? void 0 : _a.supportedCalendarComponentSet) === null || _b === void 0 ? void 0 : _b.comp) ? (_c = rc.props) === null || _c === void 0 ? void 0 : _c.supportedCalendarComponentSet.comp.map((sc) => sc._attributes.name) : [(_f = (_e = (_d = rc.props) === null || _d === void 0 ? void 0 : _d.supportedCalendarComponentSet) === null || _e === void 0 ? void 0 : _e.comp) === null || _f === void 0 ? void 0 : _f._attributes.name];
    return components.some((c) => Object.values(ICALObjects).includes(c));
  }).map((rs) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const description = (_a = rs.props) === null || _a === void 0 ? void 0 : _a.calendarDescription;
    const timezone = (_b = rs.props) === null || _b === void 0 ? void 0 : _b.calendarTimezone;
    return {
      description: typeof description === "string" ? description : "",
      timezone: typeof timezone === "string" ? timezone : "",
      url: new URL((_c = rs.href) !== null && _c !== void 0 ? _c : "", (_d = account2.rootUrl) !== null && _d !== void 0 ? _d : "").href,
      ctag: (_e = rs.props) === null || _e === void 0 ? void 0 : _e.getctag,
      calendarColor: (_f = rs.props) === null || _f === void 0 ? void 0 : _f.calendarColor,
      displayName: (_h = (_g = rs.props) === null || _g === void 0 ? void 0 : _g.displayname._cdata) !== null && _h !== void 0 ? _h : (_j = rs.props) === null || _j === void 0 ? void 0 : _j.displayname,
      components: Array.isArray((_k = rs.props) === null || _k === void 0 ? void 0 : _k.supportedCalendarComponentSet.comp) ? (_l = rs.props) === null || _l === void 0 ? void 0 : _l.supportedCalendarComponentSet.comp.map((sc) => sc._attributes.name) : [(_o = (_m = rs.props) === null || _m === void 0 ? void 0 : _m.supportedCalendarComponentSet.comp) === null || _o === void 0 ? void 0 : _o._attributes.name],
      resourcetype: Object.keys((_p = rs.props) === null || _p === void 0 ? void 0 : _p.resourcetype),
      syncToken: (_q = rs.props) === null || _q === void 0 ? void 0 : _q.syncToken,
      ...conditionalParam("projectedProps", Object.fromEntries(Object.entries((_r = rs.props) !== null && _r !== void 0 ? _r : {}).filter(([key]) => projectedProps === null || projectedProps === void 0 ? void 0 : projectedProps[key])))
    };
  }).map(async (cal) => ({
    ...cal,
    reports: await supportedReportSet({
      collection: cal,
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    })
  })));
};
var fetchCalendarObjects = async (params) => {
  const { calendar: calendar2, objectUrls, filters: customFilters, timeRange, headers, expand, urlFilter = (url) => Boolean(url === null || url === void 0 ? void 0 : url.includes(".ics")), useMultiGet = true, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  if (timeRange) {
    const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
    const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
    if ((!ISO_8601.test(timeRange.start) || !ISO_8601.test(timeRange.end)) && (!ISO_8601_FULL.test(timeRange.start) || !ISO_8601_FULL.test(timeRange.end))) {
      throw new Error("invalid timeRange format, not in ISO8601");
    }
  }
  debug$2(`Fetching calendar objects from ${calendar2 === null || calendar2 === void 0 ? void 0 : calendar2.url}`);
  const requiredFields = ["url"];
  if (!calendar2 || !hasFields(calendar2, requiredFields)) {
    if (!calendar2) {
      throw new Error("cannot fetchCalendarObjects for undefined calendar");
    }
    throw new Error(`calendar must have ${findMissingFieldNames(calendar2, requiredFields)} before fetchCalendarObjects`);
  }
  const filters = customFilters !== null && customFilters !== void 0 ? customFilters : [
    {
      "comp-filter": {
        _attributes: {
          name: "VCALENDAR"
        },
        "comp-filter": {
          _attributes: {
            name: "VEVENT"
          },
          ...timeRange ? {
            "time-range": {
              _attributes: {
                start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`,
                end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`
              }
            }
          } : {}
        }
      }
    }
  ];
  let initialResponses = [];
  const calendarObjectUrls = (objectUrls !== null && objectUrls !== void 0 ? objectUrls : (
    // fetch all objects of the calendar
    (initialResponses = await calendarQuery({
      url: calendar2.url,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        ...expand && timeRange ? {
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            [`${DAVNamespaceShort.CALDAV}:expand`]: {
              _attributes: {
                start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`,
                end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`
              }
            }
          }
        } : {}
      },
      filters,
      depth: "1",
      headers: excludeHeaders(headers, headersToExclude),
      fetchOptions,
      fetch: fetchOverride
    })).map((res) => {
      var _a;
      return (_a = res.href) !== null && _a !== void 0 ? _a : "";
    })
  )).map((url) => url.startsWith("http") || !url ? url : new URL(url, calendar2.url).href).filter(urlFilter).map((url) => new URL(url).pathname);
  let calendarObjectResults = [];
  if (calendarObjectUrls.length > 0) {
    if (expand && !objectUrls) {
      calendarObjectResults = initialResponses.filter((res) => {
        var _a, _b;
        const fullUrl = ((_a = res.href) !== null && _a !== void 0 ? _a : "").startsWith("http") ? res.href : new URL((_b = res.href) !== null && _b !== void 0 ? _b : "", calendar2.url).href;
        return urlFilter(fullUrl !== null && fullUrl !== void 0 ? fullUrl : "");
      });
    } else if (!useMultiGet) {
      calendarObjectResults = await calendarQuery({
        url: calendar2.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            ...expand && timeRange ? {
              [`${DAVNamespaceShort.CALDAV}:expand`]: {
                _attributes: {
                  start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`,
                  end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`
                }
              }
            } : {}
          }
        },
        filters,
        depth: "1",
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
        fetch: fetchOverride
      });
    } else {
      calendarObjectResults = await calendarMultiGet({
        url: calendar2.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            ...expand && timeRange ? {
              [`${DAVNamespaceShort.CALDAV}:expand`]: {
                _attributes: {
                  start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`,
                  end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`
                }
              }
            } : {}
          }
        },
        objectUrls: calendarObjectUrls,
        depth: "1",
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
        fetch: fetchOverride
      });
    }
  }
  return calendarObjectResults.map((res) => {
    var _a, _b, _c, _d, _e, _f;
    return {
      url: new URL((_a = res.href) !== null && _a !== void 0 ? _a : "", calendar2.url).href,
      etag: `${(_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag}`,
      data: (_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.calendarData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.calendarData
    };
  });
};
var createCalendarObject = async (params) => {
  const { calendar: calendar2, iCalString, filename, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return createObject({
    url: new URL(filename, calendar2.url).href,
    data: iCalString,
    headers: excludeHeaders({
      "content-type": "text/calendar; charset=utf-8",
      "If-None-Match": "*",
      ...headers
    }, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var updateCalendarObject = async (params) => {
  const { calendarObject, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return updateObject({
    url: calendarObject.url,
    data: calendarObject.data,
    etag: calendarObject.etag,
    headers: excludeHeaders({
      "content-type": "text/calendar; charset=utf-8",
      ...headers
    }, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var deleteCalendarObject = async (params) => {
  const { calendarObject, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  return deleteObject({
    url: calendarObject.url,
    etag: calendarObject.etag,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
};
var syncCalendars = async (params) => {
  var _a;
  const { oldCalendars, account: account2, detailedResult, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  if (!account2) {
    throw new Error("Must have account before syncCalendars");
  }
  const localCalendars = (_a = oldCalendars !== null && oldCalendars !== void 0 ? oldCalendars : account2.calendars) !== null && _a !== void 0 ? _a : [];
  const remoteCalendars = await fetchCalendars({
    account: account2,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  const created = remoteCalendars.filter((rc) => localCalendars.every((lc) => !urlContains(lc.url, rc.url)));
  debug$2(`new calendars: ${created.map((cc) => cc.displayName)}`);
  const updated = localCalendars.reduce((prev, curr) => {
    const found = remoteCalendars.find((rc) => urlContains(rc.url, curr.url));
    if (found && (found.syncToken && `${found.syncToken}` !== `${curr.syncToken}` || found.ctag && `${found.ctag}` !== `${curr.ctag}`)) {
      return [...prev, found];
    }
    return prev;
  }, []);
  debug$2(`updated calendars: ${updated.map((cc) => cc.displayName)}`);
  const updatedWithObjects = await Promise.all(updated.map(async (u) => {
    const result = await smartCollectionSync({
      collection: { ...u, objectMultiGet: calendarMultiGet },
      method: "webdav",
      headers: excludeHeaders(headers, headersToExclude),
      account: account2,
      fetchOptions,
      fetch: fetchOverride
    });
    return result;
  }));
  const deleted = localCalendars.filter((cal) => remoteCalendars.every((rc) => !urlContains(rc.url, cal.url)));
  debug$2(`deleted calendars: ${deleted.map((cc) => cc.displayName)}`);
  const unchanged = localCalendars.filter((cal) => remoteCalendars.some((rc) => urlContains(rc.url, cal.url) && (rc.syncToken && `${rc.syncToken}` !== `${cal.syncToken}` || rc.ctag && `${rc.ctag}` !== `${cal.ctag}`)));
  return detailedResult ? {
    created,
    updated,
    deleted
  } : [...unchanged, ...created, ...updatedWithObjects];
};
var freeBusyQuery = async (params) => {
  const { url, timeRange, depth, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  if (timeRange) {
    const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
    const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
    if ((!ISO_8601.test(timeRange.start) || !ISO_8601.test(timeRange.end)) && (!ISO_8601_FULL.test(timeRange.start) || !ISO_8601_FULL.test(timeRange.end))) {
      throw new Error("invalid timeRange format, not in ISO8601");
    }
  } else {
    throw new Error("timeRange is required");
  }
  const result = await collectionQuery({
    url,
    body: {
      "free-busy-query": cleanupFalsy({
        _attributes: getDAVAttribute([DAVNamespace.CALDAV]),
        [`${DAVNamespaceShort.CALDAV}:time-range`]: {
          _attributes: {
            start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`,
            end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, "")}Z`
          }
        }
      })
    },
    defaultNamespace: DAVNamespaceShort.CALDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  return result[0];
};
var calendar = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  calendarMultiGet,
  calendarQuery,
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  fetchCalendarUserAddresses,
  fetchCalendars,
  freeBusyQuery,
  makeCalendar,
  syncCalendars,
  updateCalendarObject
});
var debug$1 = (0, import_debug.default)("tsdav:account");
var serviceDiscovery = async (params) => {
  var _a, _b;
  debug$1("Service discovery...");
  const { account: account2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  const endpoint = new URL(account2.serverUrl);
  const uri = new URL(`/.well-known/${account2.accountType}`, endpoint);
  uri.protocol = (_a = endpoint.protocol) !== null && _a !== void 0 ? _a : "http";
  try {
    const response = await requestFetch(uri.href, {
      headers: {
        ...excludeHeaders(headers, headersToExclude),
        "Content-Type": "text/xml;charset=UTF-8"
      },
      method: "PROPFIND",
      body: `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`,
      redirect: "manual",
      ...fetchOptions
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (typeof location === "string" && location.length) {
        debug$1(`Service discovery redirected to ${location}`);
        const serviceURL = new URL(location, endpoint);
        if (serviceURL.hostname === uri.hostname && uri.port && !serviceURL.port) {
          serviceURL.port = uri.port;
        }
        serviceURL.protocol = (_b = endpoint.protocol) !== null && _b !== void 0 ? _b : "http";
        return serviceURL.href;
      }
    }
  } catch (err) {
    debug$1(`Service discovery failed: ${err.stack}`);
  }
  return endpoint.href;
};
var fetchPrincipalUrl = async (params) => {
  var _a, _b, _c, _d, _e;
  const { account: account2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requiredFields = ["rootUrl"];
  if (!hasFields(account2, requiredFields)) {
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before fetchPrincipalUrl`);
  }
  debug$1(`Fetching principal url from path ${account2.rootUrl}`);
  const [response] = await propfind({
    url: account2.rootUrl,
    props: {
      [`${DAVNamespaceShort.DAV}:current-user-principal`]: {}
    },
    depth: "0",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  if (!response.ok) {
    debug$1(`Fetch principal url failed: ${response.statusText}`);
    if (response.status === 401) {
      throw new Error("Invalid credentials");
    }
  }
  debug$1(`Fetched principal url ${(_b = (_a = response.props) === null || _a === void 0 ? void 0 : _a.currentUserPrincipal) === null || _b === void 0 ? void 0 : _b.href}`);
  return new URL((_e = (_d = (_c = response.props) === null || _c === void 0 ? void 0 : _c.currentUserPrincipal) === null || _d === void 0 ? void 0 : _d.href) !== null && _e !== void 0 ? _e : "", account2.rootUrl).href;
};
var fetchHomeUrl = async (params) => {
  var _a, _b;
  const { account: account2, headers, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const requiredFields = ["principalUrl", "rootUrl"];
  if (!hasFields(account2, requiredFields)) {
    throw new Error(`account must have ${findMissingFieldNames(account2, requiredFields)} before fetchHomeUrl`);
  }
  debug$1(`Fetch home url from ${account2.principalUrl}`);
  const responses = await propfind({
    url: account2.principalUrl,
    props: account2.accountType === "caldav" ? { [`${DAVNamespaceShort.CALDAV}:calendar-home-set`]: {} } : { [`${DAVNamespaceShort.CARDDAV}:addressbook-home-set`]: {} },
    depth: "0",
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  const matched = responses.find((r) => urlContains(account2.principalUrl, r.href));
  if (!matched || !matched.ok) {
    debug$1(`Fetch home url failed with status ${matched === null || matched === void 0 ? void 0 : matched.statusText} and error ${JSON.stringify(responses.map((r) => r.error))}`);
    throw new Error("cannot find homeUrl");
  }
  const result = new URL(account2.accountType === "caldav" ? (_a = matched === null || matched === void 0 ? void 0 : matched.props) === null || _a === void 0 ? void 0 : _a.calendarHomeSet.href : (_b = matched === null || matched === void 0 ? void 0 : matched.props) === null || _b === void 0 ? void 0 : _b.addressbookHomeSet.href, account2.rootUrl).href;
  debug$1(`Fetched home url ${result}`);
  return result;
};
var createAccount = async (params) => {
  const { account: account2, headers, loadCollections = false, loadObjects = false, headersToExclude, fetchOptions = {}, fetch: fetchOverride } = params;
  const newAccount = { ...account2 };
  newAccount.rootUrl = await serviceDiscovery({
    account: account2,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  newAccount.principalUrl = await fetchPrincipalUrl({
    account: newAccount,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  newAccount.homeUrl = await fetchHomeUrl({
    account: newAccount,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
    fetch: fetchOverride
  });
  if (loadCollections || loadObjects) {
    if (account2.accountType === "caldav") {
      newAccount.calendars = await fetchCalendars({
        headers: excludeHeaders(headers, headersToExclude),
        account: newAccount,
        fetchOptions,
        fetch: fetchOverride
      });
    } else if (account2.accountType === "carddav") {
      newAccount.addressBooks = await fetchAddressBooks({
        headers: excludeHeaders(headers, headersToExclude),
        account: newAccount,
        fetchOptions,
        fetch: fetchOverride
      });
    }
  }
  if (loadObjects) {
    if (account2.accountType === "caldav" && newAccount.calendars) {
      newAccount.calendars = await Promise.all(newAccount.calendars.map(async (cal) => ({
        ...cal,
        objects: await fetchCalendarObjects({
          calendar: cal,
          headers: excludeHeaders(headers, headersToExclude),
          fetchOptions,
          fetch: fetchOverride
        })
      })));
    } else if (account2.accountType === "carddav" && newAccount.addressBooks) {
      newAccount.addressBooks = await Promise.all(newAccount.addressBooks.map(async (addr) => ({
        ...addr,
        objects: await fetchVCards({
          addressBook: addr,
          headers: excludeHeaders(headers, headersToExclude),
          fetchOptions,
          fetch: fetchOverride
        })
      })));
    }
  }
  return newAccount;
};
var account = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  createAccount,
  fetchHomeUrl,
  fetchPrincipalUrl,
  serviceDiscovery
});
var debug = (0, import_debug.default)("tsdav:authHelper");
var defaultParam = (fn, params) => (...args) => {
  return fn({ ...params, ...args[0] });
};
var getBasicAuthHeaders = (credentials) => {
  debug(`Basic auth token generated: ${(0, import_base_64.encode)(`${credentials.username}:${credentials.password}`)}`);
  return {
    authorization: `Basic ${(0, import_base_64.encode)(`${credentials.username}:${credentials.password}`)}`
  };
};
var getBearerAuthHeaders = (credentials) => {
  return {
    authorization: `Bearer ${credentials.accessToken}`
  };
};
var fetchOauthTokens = async (credentials, fetchOptions, fetchOverride) => {
  const requireFields = [
    "authorizationCode",
    "redirectUrl",
    "clientId",
    "clientSecret",
    "tokenUrl"
  ];
  if (!hasFields(credentials, requireFields)) {
    throw new Error(`Oauth credentials missing: ${findMissingFieldNames(credentials, requireFields)}`);
  }
  const param = new URLSearchParams({
    grant_type: "authorization_code",
    code: credentials.authorizationCode,
    redirect_uri: credentials.redirectUrl,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret
  });
  debug(credentials.tokenUrl);
  debug(param.toString());
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  const response = await requestFetch(credentials.tokenUrl, {
    method: "POST",
    body: param.toString(),
    headers: {
      "content-length": `${param.toString().length}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    ...fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : {}
  });
  if (response.ok) {
    const tokens = await response.json();
    return tokens;
  }
  debug(`Fetch Oauth tokens failed: ${await response.text()}`);
  return {};
};
var refreshAccessToken = async (credentials, fetchOptions, fetchOverride) => {
  const requireFields = [
    "refreshToken",
    "clientId",
    "clientSecret",
    "tokenUrl"
  ];
  if (!hasFields(credentials, requireFields)) {
    throw new Error(`Oauth credentials missing: ${findMissingFieldNames(credentials, requireFields)}`);
  }
  const param = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: credentials.refreshToken,
    grant_type: "refresh_token"
  });
  const requestFetch = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : fetch;
  const response = await requestFetch(credentials.tokenUrl, {
    method: "POST",
    body: param.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    ...fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : {}
  });
  if (response.ok) {
    const tokens = await response.json();
    return tokens;
  }
  debug(`Refresh access token failed: ${await response.text()}`);
  return {};
};
var getOauthHeaders = async (credentials, fetchOptions, fetchOverride) => {
  var _a;
  debug("Fetching oauth headers");
  let tokens = {};
  if (!credentials.refreshToken) {
    tokens = await fetchOauthTokens(credentials, fetchOptions, fetchOverride);
  } else if (credentials.refreshToken && !credentials.accessToken || Date.now() > ((_a = credentials.expiration) !== null && _a !== void 0 ? _a : 0)) {
    tokens = await refreshAccessToken(credentials, fetchOptions, fetchOverride);
  }
  debug(`Oauth tokens fetched: ${tokens.access_token}`);
  return {
    tokens,
    headers: {
      authorization: `Bearer ${tokens.access_token}`
    }
  };
};
var authHelpers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultParam,
  fetchOauthTokens,
  getBasicAuthHeaders,
  getBearerAuthHeaders,
  getOauthHeaders,
  refreshAccessToken
});
var createDAVClient = async (params) => {
  var _a;
  const { serverUrl, credentials, authMethod, defaultAccountType, authFunction, fetch: fetchOverride } = params;
  let authHeaders = {};
  switch (authMethod) {
    case "Basic":
      authHeaders = getBasicAuthHeaders(credentials);
      break;
    case "Bearer":
      authHeaders = getBearerAuthHeaders(credentials);
      break;
    case "Oauth":
      authHeaders = (await getOauthHeaders(credentials, void 0, fetchOverride)).headers;
      break;
    case "Digest":
      authHeaders = {
        Authorization: `Digest ${credentials.digestString}`
      };
      break;
    case "Custom":
      authHeaders = (_a = await (authFunction === null || authFunction === void 0 ? void 0 : authFunction(credentials))) !== null && _a !== void 0 ? _a : {};
      break;
    default:
      throw new Error("Invalid auth method");
  }
  const defaultAccount = defaultAccountType ? await createAccount({
    account: { serverUrl, credentials, accountType: defaultAccountType },
    headers: authHeaders,
    fetch: fetchOverride
  }) : void 0;
  const davRequest$1 = async (params0) => {
    const { init, fetch: fetchOverride2, ...rest } = params0;
    const { headers, ...restInit } = init;
    return davRequest({
      ...rest,
      init: {
        ...restInit,
        headers: {
          ...authHeaders,
          ...headers
        }
      },
      fetch: fetchOverride2 !== null && fetchOverride2 !== void 0 ? fetchOverride2 : fetchOverride
    });
  };
  const createObject$1 = defaultParam(createObject, {
    url: serverUrl,
    headers: authHeaders,
    fetch: fetchOverride
  });
  const updateObject$1 = defaultParam(updateObject, {
    headers: authHeaders,
    url: serverUrl,
    fetch: fetchOverride
  });
  const deleteObject$1 = defaultParam(deleteObject, {
    headers: authHeaders,
    url: serverUrl,
    fetch: fetchOverride
  });
  const propfind$1 = defaultParam(propfind, { headers: authHeaders, fetch: fetchOverride });
  const createAccount$1 = async (params0) => {
    const { account: account2, headers, loadCollections, loadObjects, fetch: fetchOverride2 } = params0;
    return createAccount({
      account: { serverUrl, credentials, ...account2 },
      headers: { ...authHeaders, ...headers },
      loadCollections,
      loadObjects,
      fetch: fetchOverride2 !== null && fetchOverride2 !== void 0 ? fetchOverride2 : fetchOverride
    });
  };
  const collectionQuery$1 = defaultParam(collectionQuery, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const makeCollection$1 = defaultParam(makeCollection, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const syncCollection$1 = defaultParam(syncCollection, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const supportedReportSet$1 = defaultParam(supportedReportSet, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const isCollectionDirty$1 = defaultParam(isCollectionDirty, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const smartCollectionSync$1 = defaultParam(smartCollectionSync, {
    headers: authHeaders,
    account: defaultAccount,
    fetch: fetchOverride
  });
  const calendarQuery$1 = defaultParam(calendarQuery, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const calendarMultiGet$1 = defaultParam(calendarMultiGet, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const makeCalendar$1 = defaultParam(makeCalendar, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const fetchCalendars$1 = defaultParam(fetchCalendars, {
    headers: authHeaders,
    account: defaultAccount,
    fetch: fetchOverride
  });
  const fetchCalendarUserAddresses$1 = defaultParam(fetchCalendarUserAddresses, {
    headers: authHeaders,
    account: defaultAccount,
    fetch: fetchOverride
  });
  const fetchCalendarObjects$1 = defaultParam(fetchCalendarObjects, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const createCalendarObject$1 = defaultParam(createCalendarObject, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const updateCalendarObject$1 = defaultParam(updateCalendarObject, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const deleteCalendarObject$1 = defaultParam(deleteCalendarObject, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const syncCalendars$1 = defaultParam(syncCalendars, {
    account: defaultAccount,
    headers: authHeaders,
    fetch: fetchOverride
  });
  const addressBookQuery$1 = defaultParam(addressBookQuery, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const addressBookMultiGet$1 = defaultParam(addressBookMultiGet, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const fetchAddressBooks$1 = defaultParam(fetchAddressBooks, {
    account: defaultAccount,
    headers: authHeaders,
    fetch: fetchOverride
  });
  const fetchVCards$1 = defaultParam(fetchVCards, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const createVCard$1 = defaultParam(createVCard, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const updateVCard$1 = defaultParam(updateVCard, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  const deleteVCard$1 = defaultParam(deleteVCard, {
    headers: authHeaders,
    fetch: fetchOverride
  });
  return {
    davRequest: davRequest$1,
    propfind: propfind$1,
    createAccount: createAccount$1,
    createObject: createObject$1,
    updateObject: updateObject$1,
    deleteObject: deleteObject$1,
    calendarQuery: calendarQuery$1,
    addressBookQuery: addressBookQuery$1,
    collectionQuery: collectionQuery$1,
    makeCollection: makeCollection$1,
    calendarMultiGet: calendarMultiGet$1,
    makeCalendar: makeCalendar$1,
    syncCollection: syncCollection$1,
    supportedReportSet: supportedReportSet$1,
    isCollectionDirty: isCollectionDirty$1,
    smartCollectionSync: smartCollectionSync$1,
    fetchCalendars: fetchCalendars$1,
    fetchCalendarUserAddresses: fetchCalendarUserAddresses$1,
    fetchCalendarObjects: fetchCalendarObjects$1,
    createCalendarObject: createCalendarObject$1,
    updateCalendarObject: updateCalendarObject$1,
    deleteCalendarObject: deleteCalendarObject$1,
    syncCalendars: syncCalendars$1,
    fetchAddressBooks: fetchAddressBooks$1,
    addressBookMultiGet: addressBookMultiGet$1,
    fetchVCards: fetchVCards$1,
    createVCard: createVCard$1,
    updateVCard: updateVCard$1,
    deleteVCard: deleteVCard$1
  };
};
var DAVClient = class {
  constructor(params) {
    var _a, _b, _c;
    this.serverUrl = params.serverUrl;
    this.credentials = params.credentials;
    this.authMethod = (_a = params.authMethod) !== null && _a !== void 0 ? _a : "Basic";
    this.accountType = (_b = params.defaultAccountType) !== null && _b !== void 0 ? _b : "caldav";
    this.authFunction = params.authFunction;
    this.fetchOptions = (_c = params.fetchOptions) !== null && _c !== void 0 ? _c : {};
    this.fetchOverride = params.fetch;
  }
  async login() {
    var _a;
    switch (this.authMethod) {
      case "Basic":
        this.authHeaders = getBasicAuthHeaders(this.credentials);
        break;
      case "Bearer":
        this.authHeaders = getBearerAuthHeaders(this.credentials);
        break;
      case "Oauth":
        this.authHeaders = (await getOauthHeaders(this.credentials, this.fetchOptions, this.fetchOverride)).headers;
        break;
      case "Digest":
        this.authHeaders = {
          Authorization: `Digest ${this.credentials.digestString}`
        };
        break;
      case "Custom":
        this.authHeaders = await ((_a = this.authFunction) === null || _a === void 0 ? void 0 : _a.call(this, this.credentials));
        break;
      default:
        throw new Error("Invalid auth method");
    }
    this.account = this.accountType ? await createAccount({
      account: {
        serverUrl: this.serverUrl,
        credentials: this.credentials,
        accountType: this.accountType
      },
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    }) : void 0;
  }
  async davRequest(params0) {
    const { init, fetch: fetchOverride2, ...rest } = params0;
    const { headers, ...restInit } = init;
    return davRequest({
      ...rest,
      init: {
        ...restInit,
        headers: {
          ...this.authHeaders,
          ...headers
        }
      },
      fetchOptions: this.fetchOptions,
      fetch: fetchOverride2 !== null && fetchOverride2 !== void 0 ? fetchOverride2 : this.fetchOverride
    });
  }
  async createObject(...params) {
    return defaultParam(createObject, {
      url: this.serverUrl,
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async updateObject(...params) {
    return defaultParam(updateObject, {
      url: this.serverUrl,
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async deleteObject(...params) {
    return defaultParam(deleteObject, {
      url: this.serverUrl,
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async propfind(...params) {
    return defaultParam(propfind, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async createAccount(params0) {
    const { account: account2, headers, loadCollections, loadObjects, fetchOptions, fetch: fetch2 } = params0;
    return createAccount({
      account: { serverUrl: this.serverUrl, credentials: this.credentials, ...account2 },
      headers: { ...this.authHeaders, ...headers },
      loadCollections,
      loadObjects,
      fetchOptions: fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : this.fetchOptions,
      fetch: fetch2 !== null && fetch2 !== void 0 ? fetch2 : this.fetchOverride
    });
  }
  async collectionQuery(...params) {
    return defaultParam(collectionQuery, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async makeCollection(...params) {
    return defaultParam(makeCollection, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async syncCollection(...params) {
    return defaultParam(syncCollection, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async supportedReportSet(...params) {
    return defaultParam(supportedReportSet, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async isCollectionDirty(...params) {
    return defaultParam(isCollectionDirty, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async smartCollectionSync(...params) {
    return defaultParam(smartCollectionSync, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride,
      account: this.account
    })(params[0]);
  }
  async calendarQuery(...params) {
    return defaultParam(calendarQuery, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async makeCalendar(...params) {
    return defaultParam(makeCalendar, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async calendarMultiGet(...params) {
    return defaultParam(calendarMultiGet, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async fetchCalendars(...params) {
    return defaultParam(fetchCalendars, {
      headers: this.authHeaders,
      account: this.account,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params === null || params === void 0 ? void 0 : params[0]);
  }
  async fetchCalendarUserAddresses(...params) {
    return defaultParam(fetchCalendarUserAddresses, {
      headers: this.authHeaders,
      account: this.account,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params === null || params === void 0 ? void 0 : params[0]);
  }
  async fetchCalendarObjects(...params) {
    return defaultParam(fetchCalendarObjects, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async createCalendarObject(...params) {
    return defaultParam(createCalendarObject, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async updateCalendarObject(...params) {
    return defaultParam(updateCalendarObject, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async deleteCalendarObject(...params) {
    return defaultParam(deleteCalendarObject, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async syncCalendars(...params) {
    return defaultParam(syncCalendars, {
      headers: this.authHeaders,
      account: this.account,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async addressBookQuery(...params) {
    return defaultParam(addressBookQuery, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async addressBookMultiGet(...params) {
    return defaultParam(addressBookMultiGet, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async fetchAddressBooks(...params) {
    return defaultParam(fetchAddressBooks, {
      headers: this.authHeaders,
      account: this.account,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params === null || params === void 0 ? void 0 : params[0]);
  }
  async fetchVCards(...params) {
    return defaultParam(fetchVCards, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async createVCard(...params) {
    return defaultParam(createVCard, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async updateVCard(...params) {
    return defaultParam(updateVCard, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
  async deleteVCard(...params) {
    return defaultParam(deleteVCard, {
      headers: this.authHeaders,
      fetchOptions: this.fetchOptions,
      fetch: this.fetchOverride
    })(params[0]);
  }
};
var client = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  DAVClient,
  createDAVClient
});
var index = {
  DAVNamespace,
  DAVNamespaceShort,
  DAVAttributeMap,
  ...client,
  ...request,
  ...collection,
  ...account,
  ...addressBook,
  ...calendar,
  ...authHelpers,
  ...requestHelpers
};

// src/lib/caldav/transport.ts
var import_obsidian9 = require("obsidian");
var CaldavHttpError = class extends Error {
  constructor(status) {
    super(`CalDAV HTTP ${status}`);
    this.status = status;
  }
};
function validateServerUrl(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Bitte eine g\xFCltige HTTPS-Server-URL eingeben.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error("CalDAV ben\xF6tigt eine HTTPS-URL ohne eingebettete Zugangsdaten oder Fragment.");
  }
  return url.href;
}
var caldavReadFetch = async (input, init) => {
  const request2 = input instanceof Request ? input : void 0;
  const url = validateServerUrl(request2?.url ?? String(input));
  const method = (init?.method ?? request2?.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "PROPFIND", "REPORT"].includes(method)) {
    throw new Error("Schreibzugriffe sind bei der Kalenderauswahl nicht erlaubt.");
  }
  const headers = new Headers(init?.headers ?? request2?.headers);
  const requestHeaders = {};
  headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });
  const body = init?.body ?? (request2 ? await request2.text() : void 0);
  if (body !== void 0 && body !== null && typeof body !== "string") {
    throw new Error("Nicht unterst\xFCtzter CalDAV-Anfrageinhalt.");
  }
  const result = await (0, import_obsidian9.requestUrl)({
    url,
    method,
    headers: requestHeaders,
    body: body ?? void 0,
    throw: false
  }).catch(() => {
    throw new Error("CalDAV-Netzwerkanfrage fehlgeschlagen.");
  });
  if (result.status >= 400) throw new CaldavHttpError(result.status);
  const response = new Response([204, 205, 304].includes(result.status) || method === "HEAD" ? null : result.text, {
    status: result.status,
    headers: result.headers
  });
  Object.defineProperty(response, "url", { value: url });
  return response;
};

// src/lib/caldav/discover-calendars.ts
async function discoverCalendars(settings) {
  const serverUrl = validateServerUrl(settings.url);
  if (!settings.username.trim() || !settings.password) {
    throw new Error("Bitte Benutzername und Passwort eingeben.");
  }
  try {
    const client2 = await createDAVClient({
      serverUrl,
      credentials: { username: settings.username.trim(), password: settings.password },
      // tsdav's Basic helper logs the encoded credentials when debug is enabled.
      authMethod: "Custom",
      authFunction: async (credentials) => {
        const bytes = new TextEncoder().encode(`${credentials.username}:${credentials.password}`);
        return { authorization: `Basic ${btoa(String.fromCharCode(...bytes))}` };
      },
      defaultAccountType: "caldav",
      fetch: caldavReadFetch
    });
    const calendars = await client2.fetchCalendars();
    const result = /* @__PURE__ */ new Map();
    for (const calendar2 of calendars) {
      if (!calendar2.components?.includes("VEVENT")) continue;
      const url = validateServerUrl(calendar2.url);
      const name = typeof calendar2.displayName === "string" && calendar2.displayName.trim() ? calendar2.displayName.trim() : url;
      result.set(url, { url, name });
    }
    return [...result.values()].sort((a, b) => a.name.localeCompare(b.name) || a.url.localeCompare(b.url));
  } catch (error) {
    if (error instanceof CaldavHttpError && [401, 403].includes(error.status)) {
      throw new Error("CalDAV-Anmeldung fehlgeschlagen oder Zugriff verweigert. Zugangsdaten und app-spezifisches Passwort pr\xFCfen.");
    }
    throw new Error("CalDAV-Verbindung fehlgeschlagen. Server-URL, Netzwerk und Zugriffsrechte pr\xFCfen.");
  }
}

// src/lib/settings/week-calendar-settings-tab.ts
var WeekCalendartSettingTab = class extends import_obsidian10.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.caldavViewVersion = 0;
    this.plugin = plugin;
  }
  display() {
    const viewVersion = ++this.caldavViewVersion;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Folders" });
    new import_obsidian10.Setting(containerEl).setName("Week Folder").setDesc("Folder for all Week Files").addText(
      (text) => text.setPlaceholder("wochen").setValue(this.plugin.settings.paths.weekFolder).onChange(async (value) => {
        this.plugin.settings.paths.weekFolder = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Event Folder").setDesc("Folder for CalDav Events").addText(
      (text) => text.setPlaceholder("events").setValue(this.plugin.settings.paths.eventFolder).onChange(async (value) => {
        this.plugin.settings.paths.eventFolder = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Overview File Name").setDesc("Name of the File, where the Links to all Week Files are.").addText(
      (text) => text.setPlaceholder("\xDCbersicht").setValue(this.plugin.settings.paths.overviewFileName).onChange(async (value) => {
        this.plugin.settings.paths.overviewFileName = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h2", { text: "Week File Titles" });
    Object.entries(this.plugin.settings.weekdays).filter(([key]) => key !== "start").forEach(([key, value]) => {
      new import_obsidian10.Setting(containerEl).setName(key).addText(
        (text) => text.setValue(value).onChange(async (val) => {
          this.plugin.settings.weekdays[key] = val;
          await this.plugin.saveSettings();
        })
      );
    });
    containerEl.createEl("h2", { text: "Event Fields" });
    Object.entries(this.plugin.settings.prefixes).forEach(([key, value]) => {
      new import_obsidian10.Setting(containerEl).setName(key).addText(
        (text) => text.setValue(value).onChange(async (val) => {
          this.plugin.settings.prefixes[key] = val;
          await this.plugin.saveSettings();
        })
      );
    });
    containerEl.createEl("h2", { text: "CalDAV" });
    let confirmationToggle;
    let calendarDropdown;
    let connectButton;
    let calendars = [];
    let requestVersion = 0;
    let loading = false;
    const connectionSetting = new import_obsidian10.Setting(containerEl).setName("CalDAV-Verbindung").setDesc("Liest die verf\xFCgbaren Kalender. Es werden keine Termine ver\xE4ndert.");
    const invalidateConnection = () => {
      requestVersion++;
      loading = false;
      calendars = [];
      this.plugin.settings.caldav.managedCalendarConfirmed = false;
      confirmationToggle?.setValue(false);
      calendarDropdown?.selectEl.replaceChildren();
      calendarDropdown?.addOption("", "Zuerst Verbindung pr\xFCfen").setValue("").setDisabled(true);
      connectButton?.setDisabled(false).setButtonText("Verbindung pr\xFCfen");
      connectionSetting.setDesc("Zugangsdaten ge\xE4ndert. Bitte Verbindung erneut pr\xFCfen.");
    };
    new import_obsidian10.Setting(containerEl).setName("URL").addText(
      (text) => text.setValue(this.plugin.settings.caldav.url).onChange(async (val) => {
        this.plugin.settings.caldav.url = val;
        invalidateConnection();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Benutzername").addText(
      (text) => text.setValue(this.plugin.settings.caldav.username).onChange(async (val) => {
        this.plugin.settings.caldav.username = val;
        invalidateConnection();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Passwort").setDesc(
      "Wird in der Plugin-Konfiguration unverschl\xFCsselt gespeichert. Bei iCloud ein app-spezifisches Passwort verwenden."
    ).addText((text) => {
      text.inputEl.type = "password";
      text.setValue(this.plugin.settings.caldav.password).onChange(async (val) => {
        this.plugin.settings.caldav.password = val;
        invalidateConnection();
        await this.plugin.saveSettings();
      });
    });
    connectionSetting.addButton((button) => {
      connectButton = button;
      button.setButtonText("Verbindung pr\xFCfen").onClick(async () => {
        if (loading) return;
        loading = true;
        const version = ++requestVersion;
        const connection = { ...this.plugin.settings.caldav };
        button.setDisabled(true).setButtonText("Verbinde \u2026");
        calendarDropdown?.setDisabled(true);
        connectionSetting.setDesc("Verbindung wird gepr\xFCft \u2026");
        try {
          const found = await discoverCalendars(connection);
          if (version !== requestVersion || viewVersion !== this.caldavViewVersion) return;
          calendars = found;
          calendarDropdown.selectEl.replaceChildren();
          calendarDropdown.addOption("", "Bitte einen exklusiven Kalender ausw\xE4hlen");
          for (const calendar2 of calendars) {
            calendarDropdown.addOption(calendar2.url, `${calendar2.name} \u2014 ${calendar2.url}`);
          }
          const selected = calendars.some((calendar2) => calendar2.url === connection.calendar);
          calendarDropdown.setValue(selected ? connection.calendar : "").setDisabled(!calendars.length);
          connectionSetting.setDesc(calendars.length ? `${calendars.length} Kalender gefunden. Es wurden keine Termine ver\xE4ndert.${connection.calendar && !selected ? " Der gespeicherte Zielkalender wurde nicht gefunden; bitte neu ausw\xE4hlen." : ""}` : "Verbindung erfolgreich, aber keine Kalender f\xFCr Termine (VEVENT) gefunden.");
        } catch (error) {
          if (version !== requestVersion || viewVersion !== this.caldavViewVersion) return;
          calendars = [];
          calendarDropdown.selectEl.replaceChildren();
          calendarDropdown.addOption("", "Verbindung fehlgeschlagen").setValue("").setDisabled(true);
          connectionSetting.setDesc(error instanceof Error ? error.message : "CalDAV-Verbindung fehlgeschlagen.");
        } finally {
          if (version === requestVersion && viewVersion === this.caldavViewVersion) {
            loading = false;
            button.setDisabled(false).setButtonText("Verbindung pr\xFCfen");
          }
        }
      });
    });
    const targetSetting = new import_obsidian10.Setting(containerEl).setName("Zielkalender").setDesc(`Nur einen ausschliesslich f\xFCr dieses Plugin vorgesehenen Kalender ausw\xE4hlen. Gespeicherte URL: ${this.plugin.settings.caldav.calendar || "(keine)"}`).addDropdown((dropdown) => {
      calendarDropdown = dropdown;
      dropdown.addOption("", "Zuerst Verbindung pr\xFCfen").setValue("").setDisabled(true).onChange(async (value) => {
        if (loading || !calendars.some((calendar2) => calendar2.url === value)) return;
        this.plugin.settings.caldav.calendar = value;
        this.plugin.settings.caldav.managedCalendarConfirmed = false;
        confirmationToggle?.setValue(false);
        targetSetting.setDesc(`Exklusiver Zielkalender: ${value}`);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian10.Setting(containerEl).setName("Exklusiven Zielkalender freigeben").setDesc(
      "Dieser Kalender wird ausschliesslich vom Plugin verwaltet. Beim sp\xE4teren Sync d\xFCrfen alle Eintr\xE4ge gel\xF6scht werden, die nicht in den Wochen-Dateien vorkommen. Aktuell erfolgt noch keine Synchronisation."
    ).addToggle((toggle) => {
      confirmationToggle = toggle;
      toggle.setValue(this.plugin.settings.caldav.managedCalendarConfirmed === true).onChange(async (value) => {
        this.plugin.settings.caldav.managedCalendarConfirmed = value;
        await this.plugin.saveSettings();
      });
    });
  }
  hide() {
    this.caldavViewVersion++;
  }
};

// src/lib/utils/check-toSpliced-compatibility.ts
function checkToSplicedCompatibility() {
  if (!("toSpliced" in Array.prototype)) {
    return `Deine Obsidian-Version ist zu alt f\xFCr dieses Plugin.
Fehlende Features: toSpliced verlangs ES2023}`;
  }
  return null;
}

// src/main.ts
var WeekCalendartPlugin = class extends import_obsidian11.Plugin {
  constructor() {
    super(...arguments);
    this.actualFileChanded$ = fromEvent(this.app.workspace, "active-leaf-change");
    this.subscription = new Subscription();
    this.settings = mergeSettings();
    this.migratingFiles = /* @__PURE__ */ new Set();
  }
  async onload() {
    const versionCheck = checkToSplicedCompatibility();
    if (versionCheck) {
      new import_obsidian11.Notice(versionCheck, 1e4);
      return;
    }
    await this.loadSettings();
    this.addCommand({
      id: "process-active-wo-file",
      name: "Aktives Wochenfile verarbeiten",
      callback: processActiveFile(this.app, this.settings)
    });
    this.addCommand({
      id: "process-all-wo-file",
      name: "Alle Wochenfile verarbeiten",
      callback: processAll(this.app, this.settings)
    });
    this.addCommand({
      id: "create-new-calendar-year",
      name: "Ein neues Kalenderjahr erstellen",
      callback: createYear(this.app, this.settings)
    });
    this.addCommand({
      id: "migrate-week-day-headings",
      name: "Monatstage in bestehenden Wochen-Dateien erg\xE4nzen",
      callback: migrateAllWeekHeadings(this.app, this.settings, this.migratingFiles)
    });
    this.addCommand({
      id: "get-current-week-file",
      name: "Das aktuelle Wochen-File \xF6ffnen",
      callback: gotoCurrentWeek(this.app, this.settings)
    });
    this.subscription.add(
      modifyWeekFileEvent(
        this.app,
        fromEvent(this.app.vault, "modify"),
        this.actualFileChanded$,
        this.settings,
        this.migratingFiles
      )
    );
    this.addSettingTab(new WeekCalendartSettingTab(this.app, this));
    new import_obsidian11.Notice("Week Calendart loaded.");
  }
  async loadSettings() {
    this.settings = mergeSettings(await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  onunload() {
    new import_obsidian11.Notice("Week Calendart unload.");
    this.subscription.unsubscribe();
  }
};
/*! Bundled license information:

sax/lib/sax.js:
  (*! http://mths.be/fromcodepoint v0.1.0 by @mathias *)

base-64/base64.js:
  (*! https://mths.be/base64 v1.0.0 by @mathias | MIT license *)
*/
