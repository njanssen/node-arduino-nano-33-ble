const Arduino = require('../')
const arduino = new Arduino({
	enable: ['orientation']
})

console.log('Connecting...')
arduino.connect()

arduino.on('connected', id => {
	console.log(`Connected to ${id}`)

	arduino.on('orientation', data => {
		console.log('Orientation:', data)
	})
})

arduino.on('error', err => {
	console.error(err.message)
})

arduino.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
