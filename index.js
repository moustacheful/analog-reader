// Generated by CoffeeScript 1.12.5
var AnalogReader, EventEmitter, GPIO, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

_ = require('lodash');

GPIO = require('onoff').Gpio;

module.exports = AnalogReader = (function(superClass) {
  extend(AnalogReader, superClass);

  function AnalogReader(clockpin, mosipin, misopin, cspin, _mockFn) {
    this._mockFn = _mockFn;
    this.close = bind(this.close, this);
    this.stop = bind(this.stop, this);
    this.start = bind(this.start, this);
    this.readWatched = bind(this.readWatched, this);
    this.watch = bind(this.watch, this);
    if (!this._mockFn) {
      this.mosipin = new GPIO(mosipin, 'out');
      this.misopin = new GPIO(misopin, 'in');
      this.clockpin = new GPIO(clockpin, 'out');
      this.cspin = new GPIO(cspin, 'out');
    }
    this.watched = [];
    this.sampleSize = 50;
    this._watchHandle = null;
    this.readDelay = 2;
    process.on('SIGINT', this.close);
  }

  AnalogReader.prototype.read = function(adcnum) {
    var adcout, commandout, i, j, k;
    if (this._mockFn) {
      return this._mockFn(adcnum);
    }
    if (!((0 <= adcnum && adcnum < 7))) {
      return -1;
    }
    this.cspin.writeSync(1);
    this.clockpin.writeSync(0);
    this.cspin.writeSync(0);
    commandout = adcnum;
    commandout |= 0x18;
    commandout <<= 3;
    for (i = j = 0; j <= 4; i = ++j) {
      if (commandout & 0x80) {
        this.mosipin.writeSync(1);
      } else {
        this.mosipin.writeSync(0);
      }
      commandout <<= 1;
      this.clockpin.writeSync(1);
      this.clockpin.writeSync(0);
    }
    adcout = 0;
    for (i = k = 0; k <= 11; i = ++k) {
      this.clockpin.writeSync(1);
      this.clockpin.writeSync(0);
      adcout <<= 1;
      if (this.misopin.readSync()) {
        adcout |= 0x1;
      }
    }
    this.cspin.writeSync(1);
    adcout >>= 1;
    return adcout;
  };

  AnalogReader.prototype.watch = function(adcnum) {
    if (!((0 <= adcnum && adcnum < 7))) {
      return false;
    }
    return this.watched.push({
      num: adcnum,
      buffer: [],
      value: this.read(adcnum)
    });
  };

  AnalogReader.prototype.unwatch = function(adcnum) {
    var foundIndex;
    foundIndex = _.findIndex(this.watched, {
      num: adcnum
    });
    if (foundIndex > 0) {
      return this.watched.splice(foundIndex, 1);
    }
  };

  AnalogReader.prototype.readWatched = function() {
    return this._watchHandle = _.delay((function(_this) {
      return function() {
        _.each(_this.watched, function(input) {
          var val;
          val = _this.read(input.num);
          input.buffer.push(val);
          if (input.buffer.length >= _this.sampleSize) {
            input.buffer.sort(function(a, b) {
              return a - b;
            });
            input.value = input.buffer[Math.round(_this.sampleSize / 2)];
            _this.emit('value', _.clone(input));
            return input.buffer = [];
          }
        });
        return _this.readWatched();
      };
    })(this), this.readDelay);
  };

  AnalogReader.prototype.start = function() {
    if (!this._watchHandle) {
      return this.readWatched();
    }
  };

  AnalogReader.prototype.stop = function() {
    if (this._watchHandle) {
      clearTimeout(this._watchHandle);
      return this._watchHandle = null;
    }
  };

  AnalogReader.prototype.close = function() {
    if (!this._mockFn) {
      this.mosipin.unexport();
      this.misopin.unexport();
      this.clockpin.unexport();
      this.cspin.unexport();
    }
    return this.stop();
  };

  return AnalogReader;

})(EventEmitter);
