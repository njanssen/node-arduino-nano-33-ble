const Arduino = require('../')
const arduino = new Arduino({
	enable: [
		'colorimeter',
		'microphone',
		'proximity',
		'temperature',
		'humidity',
		'pressure'
	]
})

console.log('Connecting...')
arduino.connect()

arduino.on('connected', id => {
	console.log(`Connected to ${id}`)

	arduino.on('colorimeter', data => {
		console.log('Colorimeter:', data)
	})

	arduino.on('microphone', data => {
		console.log('Microphone:', data)
	})
	
	arduino.on('proximity', data => {
		console.log('Proximity:', data)
	})
	
	arduino.on('temperature', data => {
		console.log('Temperature:', data)
	})
	
	arduino.on('humidity', data => {
		console.log('Humidity:', data)
	})
	
	arduino.on('pressure', data => {
		console.log('Pressure:', data)
	})	
})

arduino.on('error', err => {
	console.error(err.message)
})

arduino.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
