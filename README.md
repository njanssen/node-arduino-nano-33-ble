# node-arduino-nano-33-ble

Node.js interface for the [Arduino Nano 33 BLE](https://www.arduino.cc/en/Guide/NANO33BLE) and 
[Arduino Nano 33 BLE Sense](https://www.arduino.cc/en/Guide/NANO33BLESense).

## What does this library do?


- Accelerometer
- Gyroscope
- Magnetometer


## Prerequisites

This module requires an Arduino Nano 33 BLE or Arduino Nano 33 BLE Sense board running the [Bluetooth service implementation](https://github.com/njanssen/arduino-nano-33-ble) sketch.

## Installation

```
npm install @vliegwerk/arduino-nano-33-ble --save
```


## Basic usage

The following code can be used ...:


```
const Arduino = require('@vliegwerk/arduino-nano-33-ble')
const arduino = new Arduino()

arduino.connect()

arduino.on('connected', () => {
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

arduino.on('error, (err) => {
	console.error('Error occured:', err.message)
})
```

This will output the following in the console: 

```
gyroscope: { x: 0.3662109375, y: 0.8544921875, z: 0.18310546875 }
magnetometer: { x: 11.279296875, y: 42.3095703125, z: 8.6181640625 }
accelerometer: { x: 0.4686279296875, y: -0.838623046875, z: 0.3165283203125 }
gyroscope: { x: 0.54931640625, y: 0.79345703125, z: 0.06103515625 }
magnetometer: { x: 11.12060546875, y: 41.95556640625, z: 8.544921875 }
accelerometer: { x: 0.468017578125, y: -0.838134765625, z: 0.3150634765625 }
..
```



## Extras

-   For more information about the Arduino Sketch used by this module, see the official [Arduino and AI](https://github.com/arduino/ArduinoAI) repository.
-   See the [License](LICENSE) file for license rights and limitations (MIT).
-   Pull Requests are welcome!


