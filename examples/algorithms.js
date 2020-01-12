const Arduino = require('../')
const arduino = new Arduino({
	enable: ['accelerometer'],
	mean: true,
	stddev: true
})

console.log('Connecting...')
arduino.connect()

arduino.on('connected', id => {
	console.log(`Connected to ${id}`)

	arduino.on('accelerometer', data => {
		console.log('Accelerometer (raw):', data)
	})

	arduino.on('accelerometer_mean', data => {
		console.log('Accelerometer (mean):', data)
	})

	arduino.on('accelerometer_stddev', data => {
		console.log('Accelerometer (stddev):', data)
	})
})

arduino.on('error', err => {
	console.error(err.message)
})

arduino.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
