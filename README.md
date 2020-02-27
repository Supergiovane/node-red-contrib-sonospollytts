# Node-Red SonosPollyTTS


![Sample Node](img/logo.png) 

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

<img src='https://github.com/Supergiovane/node-red-contrib-sonospollytts/raw/master/README.png' width="80%">

## DESCRIPTION
This node transforms a text into a speech audio. It supports many voice languages. You can hear the voice through Sonos.
This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS and Sonos api.

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday)  and <a href="http://eepurl.com/gJm095" target="_blank">subscribe to my channel</a> for the latest news, if you enjoy my node.

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-sonospollytts/blob/master/CHANGELOG.md">here the changelog</a>

## FEATURES
* Works with node-red in HTTP and in HTTPS mode.
* TTS queues handling. If you send multiple payloads to the node, it'll handle it in his own queue.
* TTS caching. Amazon AWS charges you if you use Polly for a very high rate of text to speech request. The node caches the TTS, so if you requests the same TTS the second time, the node will take it from the cache instead of asking to the Amazon Polly service.
* Send a simple payload with the text you want to speech out. For example <code>node.send({payload:"Hello there!"});</code>.

<br/><br/><br/><br/>

# SONOSPOLLYTTS CONFIGURATION

**Polly Config**<br/>
Create a config with your AWS credentials. If you put incorrect credentials, you'll see this error in the node-red's debug window: *"The security token included in the request is invalid."*

**Polly Voice**<br/>
Select your preferred voice

**Sonos IP** <br/>
Insert your sonos's IP (If your Sonos device doesn't allow you to set a fixed IP, you need to reserve an IP using the DHCP Reservation function of your router/firewall's DHCP Server)

**Sonos Volume** <br/>
set the preferred TTS volume, from "0" to "100" (can be overridden by passing <code>msg.volume="40";</code> to the node)

**Sonos Hailing**<br/>
before the first TTS message of the message queues, Sonos will play an "hailing" sound. You can select the hailing or totally disable it.

**Node-Red IP**<br/>
set IP of your node-red machine

**Host Port**<br/>
normally 1980. This is the IP of your machine, running node-red

**TTS path**<br/>
you can change the temp folder for storing cached TTS files. Default is "tmp". This is valid only if you select to purge the cache folder at each deploy or restart of node-red (see the next option below)

**TTS Cache**
<br/>
Purge and delete the TTS cache folder at deploy or restart(default): on each deploy or node-red restart, delete all tts files in the cache. This is useful not to run out of disk space, in case you've a lot of TTS speech files.<br/>
Leave the TTS cache folder untouched (not suggested if you have less disk space): don't delete any tts file. Useful if you wish to keep the tts files, even in case of internet outages.

### INPUT MESSAGES TO THE NODE
* <code>msg.volume</code> set the volume (values between "0" and "100" with quotes)
* <code>msg.nohailing</code> temporarely doesn't play the Hailing sound prior to the message (values "true" or "1" with quotes)
* <code>msg.payload</code> the text to be spoken (for example msg.payload = "Hello World!";). You can also play an mp3 stored on an http server, by passing the URL to the payload ( <code>msg.payload = "http://www.myserver.com/alarm.mp3"</code>)

*Example of using http mp3 in a function node*

```js
node.send({payload:"http://192.125.22.44/intruderalarm.mp3"};
node.send({payload:"Warning. Intruder in the dinning room."};
```

### OUTPUT MESSAGES FROM THE NODE
* <code>msg.completed</code> <b>true</b> when the node has finished playing, <b>false</b> if the node is playing
* <code>msg.connectionerror</code> <b>true</b> when the node cannot connect to the Sonos device, <b>false</b> if the connection is restored.<br/>

<details><summary>View code</summary>

> Adjust the nodes according to your setup

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
</details>

<br/><br/><br/>

# OWNFILE NODE CONFIGURATION

<img src='https://github.com/Supergiovane/node-red-contrib-sonospollytts/raw/master/img/sampleOwnFile.png' width="80%">

This node allow you to upload your custom message and play it via SonosPollyTTS without the need of an internet connection. You can use it, for example, with your alarm panel, to annuce a zone breach, a doorbell or so.

**Name**<br/>
Node name

**File to be player**<br/>
Select a file to be played. You can upload one or multiple files at the same time via the "upload" button.

### INPUT MESSAGE<br/>
**msg.payload = true**<br/>
Begin play of the message<br/>
**msg.selectedFile = "Garage door open"**<br/>
Overrides the selected message and plays the filename you passed in. Please double check the spelling of the filename (must be the same as you can see in the dropdown list of your own files, in the node config window) and do not include the <b>.mp3</b> extenson.<br/>

    
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-sonospollytts/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-sonospollytts
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-sonospollytts.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-sonospollytts.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-sonospollytts.svg