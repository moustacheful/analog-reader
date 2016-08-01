'use strict';

const AnalogReaderTest = require('./analog-reader.mock')
const _ = require('lodash');

Chart.defaults.global.animation.duration = 0;

let tests = [
	{
		id:'chart1',
		sampleSize: 50
	},{
		id:'chart2',
		sampleSize: 10
	},{
		id:'chart3',
		sampleSize: 3
	}
];

_.map(tests, function(test){
	var chartData = {
		labels: _.times(100, (i) => i.toString() ),
	    datasets: [
	        {
	            label: "Input 0 (25-50)",
	            data: [],
	            borderColor: 'rgba(250,219,84,1)',
	            backgroundColor: 'rgba(0,0,0,0)',
	            borderWidth: 1
	        },
	        {
	            label: "Input 1 (120-240)",
	            data: [],
	            borderColor: 'rgba(244,122,53,1)',
	            backgroundColor: 'rgba(0,0,0,0)',
	            borderWidth: 1 
	        },
	        {
	            label: "Input 2 (0-240)",
	            data: [],
	            borderColor: 'rgba(72,55,47,1)',
	            backgroundColor: 'rgba(0,0,0,0)' ,
	            borderWidth: 1
	        }
	    ]
	}

	var chart = new Chart(document.getElementById(test.id), {
	    type: 'line',
	    data: chartData,
	    height: 300,
	    options: {
	        title: {
	        	display:true,
	        	text: `${test.sampleSize} samples`
	        },
	        scales: {
	            xAxes: [{
	                display: false
	            }]
	        }
	    }
	});

	var reader = new AnalogReaderTest();
	reader.sampleSize = test.sampleSize;
	reader.readDelay = 2;

	reader.watch(0)
	reader.watch(1)
	reader.watch(2)	
	
	reader.on('value', function(input){
		let data = chartData.datasets[input.num].data
			
		data.push(input.value)

		if(data.length > 99)
			data.shift()

		chart.update()
	})

	reader.start()

})
