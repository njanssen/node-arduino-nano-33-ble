const Arduino = require('../')

const arduino = new Arduino({
	enable: [
		Arduino.ACCELEROMETER,
		Arduino.GYROSCOPE,
		Arduino.MAGNETOMETER,
		Arduino.ORIENTATION
	]
})
arduino.connect()

arduino.on(Arduino.CONNECTED, name => {
	console.log(`Connected to ${name}`)

	arduino.on(Arduino.ACCELEROMETER, data => {
		console.log(`${Arduino.ACCELEROMETER}:`, data)
	})

	arduino.on(Arduino.GYROSCOPE, data => {
		console.log(`${Arduino.GYROSCOPE}:`, data)
	})

	arduino.on(Arduino.MAGNETOMETER, data => {
		console.log(`${Arduino.MAGNETOMETER}:`, data)
	})

	arduino.on(Arduino.ORIENTATION, data => {
		console.log(`${Arduino.ORIENTATION}:`, data)
	})
})

arduino.on(Arduino.ERROR, err => {
	console.error(err.message)
})
