const Nano33BLE = require('../')
const nano33ble = new Nano33BLE({
	enable: ['orientation']
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

	nano33ble.on('orientation', data => {
		console.log('Orientation:', data)
	})
})

nano33ble.on('error', err => {
	console.error(err.message)
})

nano33ble.on('disconnected', id => {
	console.log(`Disconnected from ${id}`)
})
