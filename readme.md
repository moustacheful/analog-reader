# Analog Reader

An event based analog input reader with sampling for less jittery values. Currently only tested using a Raspberry Pi 2 along with an MCP3008. Might work with other SPI setups as well. Heavily based on [Ladyada's python code](https://learn.adafruit.com/reading-a-analog-in-and-controlling-audio-volume-with-the-raspberry-pi/script).


## Installing

```
npm i --save analog-reader
```

## Usage

For instructions on wiring the MCP3008 to a Raspberry Pi, see [here](https://learn.adafruit.com/reading-a-analog-in-and-controlling-audio-volume-with-the-raspberry-pi/overview).


After that, configure the pins to be used and initialize the reader

```js
const CLOCKPIN = 18
const MOSIPIN = 24
const MISOPIN = 23
const CSPIN = 25

var reader = new AnalogReader(CLOCKPIN,MOSIPIN,MISOPIN,CSPIN);

```

After initializing you can change some properties, such as the `readDelay`, `sampleSize` and `watch`/`unwatch` inputs.

```js
// Sets how often (milliseconds) should we poll for data, defaults to 2 ms.
// I'm not sure how to get how low can you go, as it will depend on the setup.
reader.readDelay = 2;

// Setting a higher sample size will take longer. It's a tradeoff between accuracy and speed. Defaults to 50.

reader.sampleSize = 50;

```


Watching / unwatching
```js
// Watch input 0, 1 and 2
reader.watch(0);
reader.watch(1);
reader.watch(2);

// Stop watching input 1
reader.unwatch(1)

```

Set up a listener
```js
reader.on('value', function(evt){
	console.log(evt);
	/*
	{
		value: 14, // Sampled value
		buffer: [...], // Values sampled for this reading
		num: 0 // ADC Number
	}
	*/
})

// Starts reading!
reader.start()

```
Finally, to stop reading, try
```js

// Stops reading! Can be resumed later!
reader.stop()

```

To manually destroy the reader, use the following. This will `unexport` and free up the used pins. It should be automatically called when stopping your program (`SIGINT`) as well.

Once done you can't start listening again with the same reader.

```js
reader.close()
```