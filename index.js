'use strict'
const EventEmitter = require('events')
const { Bluetooth, BluetoothRemoteGATTService } = require('webbluetooth')

const SERVICE_UUID = '6fbe1da7-0000-44de-92c4-bb6e04fb0212'

const ACCELEROMETER = 'accelerometer'
const GYROSCOPE = 'gyroscope'
const MAGNETOMETER = 'magnetometer'
const COLORIMETER = 'colorimeter'
const MICROPHONE = 'microphone'
const PROXIMITY = 'proximity'
const TEMPERATURE = 'temperature'
const HUMIDITY = 'humidity'
const PRESSURE = 'pressure'

const CONNECTED = 'connected'
const DISCONNECTED = 'disconnected'
const ERROR = 'error'

const OPTION_DEFAULTS = {
	maxRecords: 64,
	pollingInterval: 500,
	enable: [ACCELEROMETER, GYROSCOPE, MAGNETOMETER]
}

class Arduino extends EventEmitter {
	constructor(options = {}) {
		super()

		const {
			maxRecords = OPTION_DEFAULTS.maxRecords,
			pollingInterval = OPTION_DEFAULTS.pollingInterval,
			enable = OPTION_DEFAULTS.enable
		} = options

		this.maxRecords = maxRecords
		this.pollingInterval = pollingInterval
		this.enable = enable

		this.bluetooth = new Bluetooth()

		this.bluetooth.on(Bluetooth.EVENT_AVAILABILITY, () => {
			// TODO
		})

		this.characteristics = {
			[ACCELEROMETER]: {
				uuid: '6fbe1da7-3001-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[GYROSCOPE]: {
				uuid: '6fbe1da7-3002-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[MAGNETOMETER]: {
				uuid: '6fbe1da7-3003-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Float32', 'Float32', 'Float32'],
				data: { x: [], y: [], z: [] }
			},
			[COLORIMETER]: {
				uuid: '6fbe1da7-2002-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint16', 'Uint16', 'Uint16'],
				data: { r: [], g: [], b: [] }
			},
			[MICROPHONE]: {
				uuid: '6fbe1da7-5001-44de-92c4-bb6e04fb0212',
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
			},
			[PROXIMITY]: {
				uuid: '6fbe1da7-2003-44de-92c4-bb6e04fb0212',
				properties: ['BLENotify'],
				structure: ['Uint8'],
				data: { proximity: [] }
			},
			[TEMPERATURE]: {
				uuid: '6fbe1da7-4002-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { temperature: [] }
			},
			[HUMIDITY]: {
				uuid: '6fbe1da7-4003-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { humidity: [] }
			},
			[PRESSURE]: {
				uuid: '6fbe1da7-4001-44de-92c4-bb6e04fb0212',
				properties: ['BLERead'],
				structure: ['Float32'],
				data: { pressure: [] }
			}
		}

		this.sensors = Object.keys(this.characteristics)
	}

	connect = async () => {
		if (!await this.bluetooth.getAvailability()) {
			throw new Error('No Bluetooth interface available')
		}

		const device = await this.bluetooth.requestDevice({
			filters: [
				{
					services: [SERVICE_UUID]
				}
			]
		})

		device.addEventListener('gattserverdisconnected', event =>
			this.onDisconnected(event)
		)

		const server = await device.gatt.connect()
		const service = await server.getPrimaryService(SERVICE_UUID)

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
				this.characteristics[sensor].characteristic.addEventListener(
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

		this.emit(CONNECTED, device.name)
	}

	handleIncoming = (sensor, dataReceived) => {
		const characteristic = this.characteristics[sensor]
		const data = characteristic.data
		const columns = Object.keys(data) // column headings for this sensor

		const typeMap = {
			Uint8: { fn: DataView.prototype.getUint8, bytes: 1 },
			Uint16: { fn: DataView.prototype.getUint16, bytes: 2 },
			Float32: { fn: DataView.prototype.getFloat32, bytes: 4 }
		}

		var packetPointer = 0
		var i = 0

		let values = {}

		// Read each sensor value in the BLE packet and push into the data array
		characteristic.structure.forEach(dataType => {
			// Lookup function to extract data for given sensor property type
			var dataViewFn = typeMap[dataType].fn.bind(dataReceived)
			// Read sensor ouput value - true => Little Endian
			var unpackedValue = dataViewFn(packetPointer, true)
			// Push sensor reading onto data array
			data[columns[i]].push(unpackedValue)
			// Push sensor reading onto values object used for notifying listeners
			values[columns[i]] = unpackedValue
			// Keep array at buffer size
			if (data[columns[i]].length > this.maxRecords) {
				data[columns[i]].shift()
			}
			// move pointer forward in data packet to next value
			packetPointer += typeMap[dataType].bytes
			i++
		})

		// Notify listeners about new data
		this.emit(sensor, values)
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

		console.log(`Device ${device.name} is disconnected.`)
		this.emit(DISCONNECTED)
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

	static get COLORIMETER() {
		return COLORIMETER
	}

	static get MICROPHONE() {
		return MICROPHONE
	}

	static get PROXIMITY() {
		return PROXIMITY
	}

	static get TEMPERATURE() {
		return TEMPERATURE
	}

	static get HUMIDITY() {
		return HUMIDITY
	}

	static get PRESSURE() {
		return PRESSURE
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

module.exports = Arduino
