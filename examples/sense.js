const Nano33BLE = require('../')
const nano33ble = new Nano33BLE({
	enable: [
		'light',
		'color',
		'proximity',
		'gesture',
		'pressure',
		'temperature',
		'humidity'
	]
})

console.log('Connecting...')

nano33ble.connect().then(connected => {
	if (!connected) {
		console.log('Unable to connect to Nano 33 BLE service')
		process.exit(1)
	}
})

nano33ble.on('connected', id => {
	console.log(`Connected to ${id}`)

	nano33ble.on('color', data => {
		console.log('Color:', data)
	})

	nano33ble.on('light', data => {
		console.log('Ambient light:', data)
	})

	nano33ble.on('gesture', data => {
		console.log('Gesture:', data)
	})

	nano33ble.on('microphone', data => {
		console.log('Microphone:', data)
	})

	nano33ble.on('proximity', data => {
		console.log('Proximity:', data)
	})

	nano33ble.on('temperature', data => {
		console.log('Temperature:', data)
	})

	nano33ble.on('humidity', data => {
		console.log('Relative humidity:', data)
	})

	nano33ble.on('pressure', data => {
		console.log('Pressure:', data)
	})
})

nano33ble.on('error', err => {
	console.error(err.message)
})

nano33ble.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
