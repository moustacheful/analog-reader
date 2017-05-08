EventEmitter = require('events').EventEmitter
_ = require('lodash')
GPIO = require('onoff').Gpio

module.exports = class AnalogReader extends EventEmitter
	constructor: (clockpin, mosipin, misopin, cspin, @_mockFn)->
		unless @_mockFn
			@mosipin = new GPIO(mosipin, 'out')
			@misopin = new GPIO(misopin, 'in')
			@clockpin = new GPIO(clockpin, 'out')
			@cspin = new GPIO(cspin, 'out')

		@watched = []
		@sampleSize = 50
		@_watchHandle = null
		@readDelay = 2
		process.on 'SIGINT', @close

	read: (adcnum)->
		if @_mockFn 
			return @_mockFn(adcnum)

		return -1 if ! (0 <= adcnum < 7)

		@cspin.writeSync(1)

		@clockpin.writeSync(0)
		@cspin.writeSync(0)

		commandout = adcnum
		commandout |= 0x18
		commandout <<= 3

		for i in [0..4]
			if commandout & 0x80
				@mosipin.writeSync(1)
			else
				@mosipin.writeSync(0)

			commandout <<= 1
			@clockpin.writeSync(1)
			@clockpin.writeSync(0)

		adcout = 0

		for i in [0..11]
			@clockpin.writeSync(1)
			@clockpin.writeSync(0)
			adcout <<= 1

			if @misopin.readSync()
				adcout |= 0x1

		@cspin.writeSync(1)
		adcout >>= 1
		return adcout

	watch: (adcnum)=>
		return false if ! (0 <= adcnum < 7)
		@watched.push
			num:adcnum
			buffer: []
			value: @read(adcnum)

	unwatch: (adcnum)->
		foundIndex = _.findIndex(@watched,{ num: adcnum })
		if (foundIndex > 0)
			@watched.splice(foundIndex,1)

	readWatched: =>
		@_watchHandle = _.delay =>
			_.each @watched, (input)=>
				val = @read(input.num)
				input.buffer.push(val)
				if input.buffer.length >= @sampleSize
					input.buffer.sort( (a,b) => (a-b) )
					input.value = input.buffer[ Math.round(@sampleSize / 2) ]
					@emit('value',_.clone(input))
					input.buffer = []

			@readWatched()
		, @readDelay

	start: =>
		if ! @_watchHandle
			@readWatched()

	stop: =>
		if @_watchHandle
			clearTimeout(@_watchHandle)
			@_watchHandle = null

	close: =>
		unless @_mockFn
			@mosipin.unexport()
			@misopin.unexport()
			@clockpin.unexport()
			@cspin.unexport()
	
		@stop()