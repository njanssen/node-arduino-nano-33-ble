# node-arduino-nano-33-ble

Node.js interface for the Arduino [Nano 33 BLE](https://www.arduino.cc/en/Guide/NANO33BLE) and
[Nano 33 BLE Sense](https://www.arduino.cc/en/Guide/NANO33BLESense) microcontroller board.

## What does this library do?

This library makes it easy to listen to data from one or more sensors on a Arduino Nano 33 BLE and Nano 33 BLE Sense. The library utilizes the on-board Bluetooth Low Energy connectivity.

Supported inertial measurement unit (IMU) sensors found on both the Nano 33 BLE and Nano 33 BLE Sense:

-   Accelerometer
-   Gyroscope
-   Magnetometer

Supported sensors found on the Nano 33 BLE Sense only:

-   Digital microphone
-   Temperature
-   Relative humidity
-   Pressure
-   Gesture sensor
-   Ambient light
-   Color
-   Proximity

The library provides the following filters and algorithms:

-   Moving mean and standard deviation for a configurable window size.
-   Arduino's official [Madgwick AHRS sensor fusion algorithm implementation](https://github.com/arduino-libraries/MadgwickAHRS) running on the microcontroller board for orientation (heading, pitch, and roll).

## Prerequisites

This module requires an Arduino Nano 33 BLE or Nano 33 BLE Sense microcontroller board running the Arduino [Nano33BLEService](https://github.com/njanssen/arduino-nano-33-ble) sketch.

## Installation

```
npm install @vliegwerk/arduino-nano-33-ble --save
```

## Basic usage

The following code can be used to start listening to sensor data received from your microcontroller:

```
const Nano33BLE = require('@vliegwerk/arduino-nano-33-ble')
const nano33ble = new Nano33BLE()

nano33ble.connect().then(connected => {
	if (!connected) {
		console.log('Unable to connect to Nano 33 BLE service')
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
```

This will output the following in the console:

```
Connected to c5-29-67-c0-36-ca
Accelerometer: { x: -0.431396484375, y: 0.816650390625, z: 0.302490234375 }
Gyroscope: { x: 2.99072265625, y: 2.99072265625, z: 1.953125 }
Magnetometer: { x: -7.03125, y: -18.29833984375, z: -37.65869140625 }
Accelerometer: { x: -0.439208984375, y: 0.802001953125, z: 0.3203125 }
Gyroscope: { x: -2.5634765625, y: 0.1220703125, z: -1.708984375 }
Magnetometer: { x: -6.982421875, y: -19.3603515625, z: -37.2802734375 }
..
```

For more examples, see the `examples` folder in the [node-arduino-nano-33-ble repository](https://github.com/njanssen/node-arduino-nano-33-ble/tree/master/examples) on GitHub.

## Extras

-   The bluetooth connectivity implementation of this library is based on the Web Dashboard example in the [Arduino and AI](https://github.com/arduino/ArduinoAI) repository by Arduino.
-   See the [License](LICENSE) file for license rights and limitations (GPL).
-   Pull Requests are welcome!
