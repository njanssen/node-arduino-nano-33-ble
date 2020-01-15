const Nano33BLE = require('../')
const nano33ble = new Nano33BLE()

console.log('Connecting...')

console.log('Connecting...')

nano33ble.connect().then(connected => {
	if (!connected) {
		console.log('Unable to connect to Nano 33 BLE service')
		process.exit(1)
	}
})

nano33ble.on('connected', id => {
	console.log(`Connected to ${id}`)

	nano33ble.on('accelerometer', data => {
		console.log('Accelerometer:', data)
	})

	nano33ble.on('gyroscope', data => {
		console.log('Gyroscope:', data)
	})

	nano33ble.on('magnetometer', data => {
		console.log('Magnetometer:', data)
	})
})

nano33ble.on('error', err => {
	console.error(err.message)
})

nano33ble.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
