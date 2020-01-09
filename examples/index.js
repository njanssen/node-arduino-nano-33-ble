const Arduino = require('../')

const arduino = new Arduino({})
arduino.connect()

arduino.on(Arduino.CONNECTED, (name) => {
	console.log(`Connected to ${device}`)

	arduino.on(Arduino.ACCELEROMETER, data => {
		console.log(`${Arduino.ACCELEROMETER}:`, data)
	})

	arduino.on(Arduino.GYROSCOPE, data => {
		console.log(`${Arduino.GYROSCOPE}:`, data)
	})

	arduino.on(Arduino.MAGNETOMETER, data => {
		console.log(`${Arduino.MAGNETOMETER}:`, data)
	})
})

arduino.on(Arduino.ERROR, err => {
	console.error(err.message)
})
