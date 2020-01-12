# node-arduino-nano-33-ble

Node.js interface for the Arduino [Nano 33 BLE](https://www.arduino.cc/en/Guide/NANO33BLE) and
[Nano 33 BLE Sense](https://www.arduino.cc/en/Guide/NANO33BLESense) microcontroller board.

## What does this library do?

This library makes it easy to listen to data from one or more sensors on a Arduino Nano 33 BLE and Nano 33 BLE Sense. The library utilizes the on-board Bluetooth Low Energy connectivity of this microcontroller board.

Supported IMU sensors found on both the Nano 33 BLE and Nano 33 BLE Sense:

-   Accelerometer
-   Gyroscope
-   Magnetometer

Supported sensors found on the Nano 33 BLE Sense only:

-   Colorimeter
-   Microphone
-   Proximity
-   Temperature
-   Humidity
-   Pressure

The library provides the following filters and algorithms related to the IMU sensors:

-   Moving mean and standard deviation for a configurable window size.
-   Arduino's official [Madgwick AHRS sensor fusion algorithm implementation](https://github.com/arduino-libraries/MadgwickAHRS) running on the microcontroller board for orientation (heading, pitch, and roll).

## Prerequisites

This module requires 

- a Bluetooth Low Energy adapter. Connectivity is provided by the 
- an Arduino Nano 33 BLE or Nano 33 BLE Sense board running the companion [Bluetooth service implementation](https://github.com/njanssen/arduino-nano-33-ble) sketch.

## Installation

```
npm install @vliegwerk/arduino-nano-33-ble --save
```

## Basic usage

The following code can be used to start listening to sensor data received from your microcontroller:

```
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
```

This will output the following in the console:

```
Connecting...
Connected to c5-29-67-c0-36-ca
Accelerometer: { x: -0.431396484375, y: 0.816650390625, z: 0.302490234375 }
Gyroscope: { x: 2.99072265625, y: 2.99072265625, z: 1.953125 }
Magnetometer: { x: -7.03125, y: -18.29833984375, z: -37.65869140625 }
Accelerometer: { x: -0.439208984375, y: 0.802001953125, z: 0.3203125 }
Gyroscope: { x: -2.5634765625, y: 0.1220703125, z: -1.708984375 }
Magnetometer: { x: -6.982421875, y: -19.3603515625, z: -37.2802734375 }
..
```

## Extras

-   See the [License](LICENSE) file for license rights and limitations (MIT).
-   Pull Requests are welcome!
