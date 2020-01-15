'use strict'
const EventEmitter = require('events')
const { Bluetooth, BluetoothDevice } = require('webbluetooth')

const SERVICE_UUID = 'e905de3e-0000-44de-92c4-bb6e04fb0212'

const ACCELEROMETER = 'accelerometer'
const GYROSCOPE = 'gyroscope'
const MAGNETOMETER = 'magnetometer'
const ORIENTATION = 'orientation'

const LIGHT = 'light'
const COLOR = 'color'
const PROXIMITY = 'proximity'
const GESTURE = 'gesture'

const PRESSURE = 'pressure'
const TEMPERATURE = 'temperature'
const HUMIDITY = 'humidity'

const MICROPHONE = 'microphone'

const CONNECTED = 'connected'
const DISCONNECTED = 'disconnected'
const ERROR = 'error'
const SUFFIX_MEAN = '_mean'
const SUFFIX_STDDEV = '_stddev'

const OPTION_DEFAULTS = {
	enable: [ACCELEROMETER, GYROSCOPE, MAGNETOMETER],
	pollingInterval: 500,
	mean: false,
	stddev: false,
	windowSize: 64
}

class Nano33BLE extends EventEmitter {
	constructor(options = {}) {
		super()

		const {
			windowSize = OPTION_DEFAULTS.windowSize,
			pollingInterval = OPTION_DEFAULTS.pollingInterval,
			enable = OPTION_DEFAULTS.enable,
			mean = OPTION_DEFAULTS.mean,
			stddev = OPTION_DEFAULTS.stddev
		} = options

		this.windowSize = windowSize
		this.pollingInterval = pollingInterval
		this.enable = enable
		this.mean = mean
		this.stddev = stddev

		this.bluetooth = new Bluetooth()

		this.characteristics = {
			[ACCELEROMETER]: {
				uuid: 'e905de3e-3001-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[GYROSCOPE]: {
				uuid: 'e905de3e-3002-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[MAGNETOMETER]: {
				uuid: 'e905de3e-3003-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[ORIENTATION]: {
				uuid: 'e905de3e-3004-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { heading: [], pitch: [], roll: [] }
			},
			[LIGHT]: {
				uuid: 'e905de3e-2001-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint16'],
				data: { ambient: [] }
			},
			[COLOR]: {
				uuid: 'e905de3e-2002-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint16', 'Uint16', 'Uint16'],
				data: { r: [], g: [], b: [] }
			},
			[PROXIMITY]: {
				uuid: 'e905de3e-2003-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint8'],
				data: { proximity: [] }
			},
			[GESTURE]: {
				uuid: 'e905de3e-2004-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint8'],
				data: { gesture: [] }
			},
			[PRESSURE]: {
				uuid: 'e905de3e-4001-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { pressure: [] }
			},
			[TEMPERATURE]: {
				uuid: 'e905de3e-4002-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { temperature: [] }
			},
			[HUMIDITY]: {
				uuid: 'e905de3e-4003-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { humidity: [] }
			},
			[MICROPHONE]: {
				uuid: 'e905de3e-5001-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: new Array(32).fill('Uint8'), // an array of 32 'Uint8's
				data: {
					a0: [],
					a1: [],
					a2: [],
					a3: [],
					a4: [],
					a5: [],
					a6: [],
					a7: [],
					a8: [],
					a9: [],
					aA: [],
					aB: [],
					aC: [],
					aD: [],
					aE: [],
					aF: [],
					b0: [],
					b1: [],
					b2: [],
					b3: [],
					b4: [],
					b5: [],
					b6: [],
					b7: [],
					b8: [],
					b9: [],
					bA: [],
					bB: [],
					bC: [],
					bD: [],
					bE: [],
					bF: []
				}
			}
		}

		this.sensors = Object.keys(this.characteristics)
	}

	connect = async () => {
		if (!(await this.bluetooth.getAvailability())) {
			throw new Error('No Bluetooth interface available')
		}

		let device
		try {
			device = await this.bluetooth.requestDevice({
				filters: [
					{
						services: [SERVICE_UUID]
					}
				]
			})
		} catch (err) {
			// Requsted device not found
			return false
		}

		device.on(BluetoothDevice.EVENT_DISCONNECTED, event =>
			this.onDisconnected(event)
		)

		this.server = await device.gatt.connect()
		const service = await this.server.getPrimaryService(SERVICE_UUID)

		// Set up the characteristics
		for (const sensor of this.sensors) {
			if (!this.enable.includes(sensor)) continue

			this.characteristics[
				sensor
			].characteristic = await service.getCharacteristic(
				this.characteristics[sensor].uuid
			)

			// Set up notification
			if (this.characteristics[sensor].properties.includes('BLENotify')) {
				this.characteristics[sensor].characteristic.on(
					'characteristicvaluechanged',
					event => {
						this.handleIncoming(sensor, event.target.value)
					}
				)
				await this.characteristics[
					sensor
				].characteristic.startNotifications()
			}

			// Set up polling for read
			if (this.characteristics[sensor].properties.includes('BLERead')) {
				this.characteristics[sensor].polling = setInterval(() => {
					this.characteristics[sensor].characteristic
						.readValue()
						.then(data => {
							this.handleIncoming(sensor, data)
						})
				}, this.pollingInterval)
			}
		}

		this.emit(CONNECTED, device.id)
		return true
	}

	disconnect = () => {
		this.server.disconnect()
	}

	isConnected = () => {
		return !this.server ? false : this.server.connected
	}

	handleIncoming = (sensor, dataReceived) => {
		const characteristic = this.characteristics[sensor]
		const data = characteristic.data
		const columns = Object.keys(data) // column headings for this sensor

		if (sensor === 'color') {
			console.log('color')
		}

		if (sensor === 'light') {
			console.log('light')
		}

		const typeMap = {
			Uint8: { fn: DataView.prototype.getUint8, bytes: 1 },
			Uint16: { fn: DataView.prototype.getUint16, bytes: 2 },
			Float32: { fn: DataView.prototype.getFloat32, bytes: 4 }
		}

		var packetPointer = 0
		var i = 0

		let values = {}
		let means = {}
		let stddevs = {}

		// Read each sensor value in the BLE packet and push into the data array
		characteristic.structure.forEach(dataType => {
			// Lookup function to extract data for given sensor property type
			var dataViewFn = typeMap[dataType].fn.bind(dataReceived)
			// Read sensor ouput value - true => Little Endian
			var unpackedValue = dataViewFn(packetPointer, true)
			// Push sensor reading onto data array
			data[columns[i]].push(unpackedValue)
			// Keep array at buffer size
			if (data[columns[i]].length > this.windowSize) {
				data[columns[i]].shift()
			}
			// move pointer forward in data packet to next value
			packetPointer += typeMap[dataType].bytes
			// Push sensor reading onto values object used for notifying listeners
			values[columns[i]] = unpackedValue
			if (this.mean) means[columns[i]] = mean(data[columns[i]])
			if (this.stddev) stddevs[columns[i]] = stddev(data[columns[i]])
			// Increment column counter
			i++
		})

		// Notify listeners about new data
		this.emit(sensor, values)
		if (this.mean) this.emit(`${sensor}${SUFFIX_MEAN}`, means)
		if (this.stddev) this.emit(`${sensor}${SUFFIX_STDDEV}`, stddevs)
	}

	onDisconnected = event => {
		const device = event.target

		// Clear read polling
		for (const sensor of this.sensors) {
			if (!this.enable.includes(sensor)) continue

			if (typeof this.characteristics[sensor].polling !== 'undefined') {
				clearInterval(this.characteristics[sensor].polling)
			}
		}

		this.emit(DISCONNECTED, device.id)
	}

	static get ACCELEROMETER() {
		return ACCELEROMETER
	}

	static get GYROSCOPE() {
		return GYROSCOPE
	}

	static get MAGNETOMETER() {
		return MAGNETOMETER
	}

	static get ORIENTATION() {
		return ORIENTATION
	}

	static get LIGHT() {
		return LIGHT
	}

	static get COLOR() {
		return COLOR
	}

	static get PROXIMITY() {
		return PROXIMITY
	}

	static get GESTURE() {
		return GESTURE
	}

	static get PRESSURE() {
		return PRESSURE
	}

	static get TEMPERATURE() {
		return TEMPERATURE
	}

	static get HUMIDITY() {
		return HUMIDITY
	}

	static get MICROPHONE() {
		return MICROPHONE
	}

	static get CONNECTED() {
		return CONNECTED
	}

	static get DISCONNECTED() {
		return DISCONNECTED
	}

	static get ERROR() {
		return ERROR
	}
}

// Arithmetic mean
const mean = arr => {
	return (
		arr.reduce(function(a, b) {
			return Number(a) + Number(b)
		}) / arr.length
	)
}

// Standard deviation
const stddev = arr => {
	let m = mean(arr)
	return Math.sqrt(
		arr.reduce(function(sq, n) {
			return sq + Math.pow(n - m, 2)
		}, 0) /
			(arr.length - 1)
	)
}

module.exports = Nano33BLE
