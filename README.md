# Node-Red SonosPollyTTS

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

<img src='https://github.com/Supergiovane/node-red-contrib-sonospollytts/raw/master/README.png' width="50%">

## DESCRIPTION
This node transforms a text into a speech audio. It supports many voice languages. You can hear the voice through Sonos.
This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS and Sonos api.

<a href="http://eepurl.com/gJm095" target="_blank">Subscribe to my channel.</a> Only news about my nodes, no spam, no ads. I'm a github developer, not a merchant.

## ---> IMPORTANT - READ THIS <---
MAJOR CHANGE STARTING FROM ***V1.1.0***, IN HANDLING COMMUNICATIONS BETWEEN NODE-RED AND SONOS. Due to added support for HTTPS installation, the node behaviour has been changed. The node will now create his own webserver, instead of using node-red webserver. This permits to overcome SSL certificate problems with Sonos. If your node-red run behind a firewall, REMEMBER TO FORMWARD the node webserver port (default port is 1980). **If your node-red is running behind a firewall and you ran an older version, remember to add a rule in your firewall, to forward the new port. The old configured port 1880 is not valid anymore and the node will default to 1980 instead.**

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-sonospollytts/blob/master/CHANGELOG.md">here the changelog</a>

## FEATURES
* Works with node-red in HTTP and in HTTPS mode.
* TTS queues handling. If you send multiple payloads to the node, it'll handle it in his own queue.
* TTS caching. Amazon AWS charges you if you use Polly for a very high rate of text to speech request. The node caches the TTS, so if you requests the same TTS the second time, the node will take it from the cache instead of asking to the Amazon Polly service.
* Send a simple payload with the text you want to speech out. For example <code>node.send({payload:"Hello there!"});</code>.

## CONFIGURATION
* Polly Config: create a config with your AWS credentials. If you put incorrect credentials, you'll see this error in the node-red's debug window: <b>"The security token included in the request is invalid."</b>
* Polly Voice: select your preferred voice
* Sonos IP: insert your sonos's IP (If your Sonos device doesn't allow you to set a fixed IP, you need to reserve an IP using the DHCP Reservation function of your router/firewall's DHCP Server)
* Sonos Volume: set the preferred TTS volume, from "0" to "100" (can be overridden by passing <code>msg.volume="40";</code> to the node)
* Sonos Hailing: before the first TTS message of the message queues, Sonos will play an "hailing" sound. You can select the hailing or totally disable it.
* Node-Red IP: set IP of your node-red
* Node-Red Port: normally 1880. If you've changed the default port, adjust this field consequently
* Temp folder: you can change the temp folder for storing cached TTS files. Default is "tmp"

## INPUT
* <code>msg.volume</code> set the volume (values between "0" and "100" with quotes)
* <code>msg.nohailing</code> temporarely doesn't play the Hailing sound prior to the message (values "true" or "1" with quotes)
* <code>msg.payload</code> the text to be spoken (for example msg.payload = "Hello World!";)

## OUTPUT
* <code>msg.completed</code> <b>true</b> when the node has finished playing, <b>false</b> if the node is playing

## COPY/PASTE IN YOUR NODE-RED FLOW

```js
[
    {
        "id": "7948293a.159a68",
        "type": "inject",
        "z": "2a7223f6.d28e0c",
        "name": "",
        "topic": "",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 140,
        "wires": [
            [
                "140491c3.4c7e0e"
            ]
        ]
    },
    {
        "id": "140491c3.4c7e0e",
        "type": "function",
        "z": "2a7223f6.d28e0c",
        "name": "Sample function 1",
        "func": "// The simplest way\nmsg.payload=\"Benvenuti,Wilkommen,Wellcome!\";\nreturn msg;\n",
        "outputs": 1,
        "noerr": 0,
        "x": 270,
        "y": 140,
        "wires": [
            [
                "b2f92147.9a31e"
            ]
        ]
    },
    {
        "id": "b2f92147.9a31e",
        "type": "sonospollytts",
        "z": "2a7223f6.d28e0c",
        "name": "",
        "voice": "18",
        "ssml": false,
        "dir": "/tmp",
        "sonosipaddress": "192.168.1.109 ",
        "sonosvolume": "25",
        "sonoshailing": "1",
        "noderedipaddress": "192.168.1.209",
        "noderedport": "1880",
        "config": "e9b4b321.0bcb5",
        "x": 490,
        "y": 100,
        "wires": [],
        "icon": "node-red/leveldb.png"
    },
    {
        "id": "21671071.2c082",
        "type": "inject",
        "z": "2a7223f6.d28e0c",
        "name": "",
        "topic": "",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 180,
        "wires": [
            [
                "f1cff68e.5c6a8"
            ]
        ]
    },
    {
        "id": "f1cff68e.5c6a8",
        "type": "function",
        "z": "2a7223f6.d28e0c",
        "name": "Sample function 2",
        "func": "// Set the Volume\nmsg.volume=\"60\"; // If not set, will take the volume from setting page\nmsg.payload=\"Benvenuti,Wilkommen,Wellcome!\";\nreturn msg;\n\n",
        "outputs": 1,
        "noerr": 0,
        "x": 270,
        "y": 180,
        "wires": [
            [
                "b2f92147.9a31e"
            ]
        ]
    },
    {
        "id": "f42f5c8e.26a728",
        "type": "inject",
        "z": "2a7223f6.d28e0c",
        "name": "",
        "topic": "",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 220,
        "wires": [
            [
                "d6cbb03.bf40c5"
            ]
        ]
    },
    {
        "id": "d6cbb03.bf40c5",
        "type": "function",
        "z": "2a7223f6.d28e0c",
        "name": "Sample function 3",
        "func": "// Create an array of messages\nvar aMessages=[];\n// Add random messages\naMessages.push({volume:\"50\",payload:\"Benvenuti.\"});\n// Wheater in Italy\naMessages.push({volume:\"40\",payload:\"http://media.ilmeteo.it/audio/2018-03-31.mp3\"});\n// Add random messages\naMessages.push({volume:\"30\",payload:\"Cambia la tua voce nei settaggi.\"});\nreturn [aMessages];\n",
        "outputs": 1,
        "noerr": 0,
        "x": 270,
        "y": 220,
        "wires": [
            [
                "b2f92147.9a31e"
            ]
        ]
    },
    {
        "id": "587710a4.938458",
        "type": "inject",
        "z": "2a7223f6.d28e0c",
        "name": "Hello World",
        "topic": "",
        "payload": "Ciao Mondo! Come stai?",
        "payloadType": "str",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 130,
        "y": 100,
        "wires": [
            [
                "b2f92147.9a31e"
            ]
        ]
    },
    {
        "id": "f0e4fb09.e0fd1",
        "type": "comment",
        "z": "2a7223f6.d28e0c",
        "name": "PUSH THE BUTTONS!",
        "info": "",
        "x": 120,
        "y": 60,
        "wires": []
    },
    {
        "id": "e9b4b321.0bcb5",
        "type": "sonospollytts-config",
        "z": "",
        "name": "bb"
    }
]
```

    
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-sonospollytts/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-sonospollytts
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-sonospollytts.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-sonospollytts.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-sonospollytts.svg