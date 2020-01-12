const Arduino = require('../')
const arduino = new Arduino()

console.log('Connecting...')
arduino.connect()

arduino.on('connected', id => {
	console.log(`Connected to ${id}`)

	arduino.on('accelerometer', data => {
		console.log('Accelerometer:', data)
	})

	arduino.on('gyroscope', data => {
		console.log('Gyroscope:', data)
	})

	arduino.on('magnetometer', data => {
		console.log('Magnetometer:', data)
	})
})

arduino.on('error', err => {
	console.error(err.message)
})

arduino.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
