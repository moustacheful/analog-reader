const AnalogReader = require('../index')
const _ = require('lodash');

// Create a new class with the same methods, but with a blank constructor. 
// This is to be able to test without GPIO.
class AnalogReaderTest {
	constructor(){
		this.watched = []
		this.sampleSize = 50
		this.readDelay = 2
		this._watchHandle = null

		this.read = this.read.bind(this)
	}
}

_.assignIn(AnalogReaderTest.prototype,AnalogReader.prototype)


// Override read function to get fluctuating mock values
AnalogReaderTest.prototype.read = function (adcnum){
	let val = 0
	switch(adcnum){
		case 0:
			val =  25 + (Math.random()*25) // 25-50
			break;
		case 1:
			val = 120 + (Math.random()*120) // 120-240
			break;
		case 2:
			val = (Math.random()*240) // 0-240
			break;
	}

	if(Math.random() < 0.3){
		// 30% chance of a value spike
		val += Math.random()*1000
	}
	return val

}


module.exports = AnalogReaderTest