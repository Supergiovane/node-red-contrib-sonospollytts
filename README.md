# Node-Red SonosPollyTTS


![Sample Node](img/logo.png) 

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-sonospollytts/master/img/Readme.png' width="80%">

<details><summary> VIEW SAMPLE CODE </summary>

> Adjust the nodes according to your setup

```js
[{"id":"ce10dd92.7ccb4","type":"inject","z":"6cf31700.e19548","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":250,"y":240,"wires":[["8db04a6b.aa2458"]]},{"id":"8db04a6b.aa2458","type":"function","z":"6cf31700.e19548","name":"Via function","func":"// The simplest way\nmsg.payload=\"Benvenuti,Wilkommen,Wellcome!\";\nreturn msg;\n","outputs":1,"noerr":0,"x":390,"y":240,"wires":[["dcf2a25.b27346"]]},{"id":"dcf2a25.b27346","type":"sonospollytts","z":"6cf31700.e19548","name":"","voice":"18","ssml":false,"sonosipaddress":"192.168.1.109","sonosvolume":"25","sonoshailing":"Hailing_Hailing.mp3","config":"7182770d.79d208","propertyType":{},"rules":[],"x":630,"y":200,"wires":[[]],"icon":"node-red/leveldb.png"},{"id":"1c281b05.68270d","type":"inject","z":"6cf31700.e19548","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":250,"y":280,"wires":[["59ff5539.fbf224"]]},{"id":"59ff5539.fbf224","type":"function","z":"6cf31700.e19548","name":"Set volume","func":"// Set the Volume\nmsg.volume=\"60\"; // If not set, will take the volume from setting page\nmsg.payload=\"Benvenuti,Wilkommen,Wellcome!\";\nreturn msg;\n\n","outputs":1,"noerr":0,"x":390,"y":280,"wires":[["dcf2a25.b27346"]]},{"id":"bc42af4c.7eab3","type":"inject","z":"6cf31700.e19548","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":250,"y":320,"wires":[["b5e7507e.0adef"]]},{"id":"b5e7507e.0adef","type":"function","z":"6cf31700.e19548","name":"Array of messages","func":"// Create an array of messages\nvar aMessages=[];\n// Add random messages\naMessages.push({volume:\"50\",payload:\"Benvenuti.\"});\n// Wheater in Italy\naMessages.push({volume:\"40\",payload:\"http://media.ilmeteo.it/audio/2018-03-31.mp3\"});\n// Add random messages\naMessages.push({volume:\"30\",payload:\"Cambia la tua voce nei settaggi.\"});\nreturn [aMessages];\n","outputs":1,"noerr":0,"x":410,"y":320,"wires":[["dcf2a25.b27346"]]},{"id":"15120425.9bcc3c","type":"inject","z":"6cf31700.e19548","name":"Hello World","topic":"","payload":"Ciao Mondo! Come stai?","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":200,"wires":[["dcf2a25.b27346"]]},{"id":"9f4872f4.12a4d8","type":"comment","z":"6cf31700.e19548","name":"Play text on Sonos. Single player or Group of players","info":"","x":380,"y":160,"wires":[]},{"id":"7182770d.79d208","type":"sonospollytts-config","z":"","name":"Config","noderedipaddress":"192.168.1.236","noderedport":"1980","accessKey":"","secretKey":"","purgediratrestart":"leave"}]
```
</details>

  
  

## DESCRIPTION
This node transforms a text into spoken audio. It supports many languages. You can hear the voice through Sonos.
This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS and Sonos api. It supports SONOS PLAYER GROUPING.  
You can use it with your own audio files as well and it can be used offline, without internet connection.

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday)  and [subscribe to my channel](http://eepurl.com/gJm095) for the latest news, if you enjoy my node.

## CHANGELOG
* See [the changelog here](https://github.com/Supergiovane/node-red-contrib-sonospollytts/blob/master/CHANGELOG.md)

## FEATURES
* **Automatic grouping** is supported. You can group all players you want to play your announcements.
* **Automatic discovery** of your players.
* **TTS caching**. Amazon AWS charges you if you use Polly for a very high rate of Text To Speech request. The node caches the TTS, so if you requests the same TTS the second time, the node will take it from the cache instead of asking to the Amazon Polly service.
* **UPLOAD your own audio files**. You can upload your own audio files with OwnFile node.
* **Can work offline**. You can use your own audio files to make the node works offline. If you use the node with the integrated TTS Polly, thank to the **offline cache**, once you played the TTS only one time, the node will cache this TTS and you can use it **even without internet connection**. 
* Send a simple payload with the text you want to speech out. For example <code>node.send({payload:"Hello there!"});</code>.
* Works with node-red in HTTP and in HTTPS mode.
  
    
    
# SONOSPOLLYTTS-CONFIG NODE

**Node-Red IP**  
set IP of your node-red machine

**Host Port**  
normally 1980. This is the IP of your machine, running node-red

**TTS Cache**  
Purge and delete the TTS cache folder at deploy or restart(default): on each deploy or node-red restart, delete all tts files in the cache. This helps to not run out of disk space, in case you've a lot of TTS speech files.<br/>
Leave the TTS cache folder untouched (not suggested if you have less disk space): don't delete any tts file. Useful if you wish to keep the tts files, even in case of internet outages.



# SONOSPOLLYTTS NODE

**Polly Config**  
Create a config with your AWS credentials. If you put incorrect credentials, you'll see this error in the node-red's debug window: *"The security token included in the request is invalid."*

**Polly Voice**  
Select your preferred voice

**Sonos Volume**  
set the preferred TTS volume, from "0" to "100" (can be overridden by passing <code>msg.volume="40";</code> to the node)

**Sonos Hailing**  
before the first TTS message of the message queues, Sonos will play an "hailing" sound. You can select the hailing or totally disable it.

**Main Sonos Player**  
Select your Sonos primary player. (It's strongly suggested to set a fixed IP for this player; you can reserve an IP using the DHCP Reservation function of your router/firewall's DHCP Server).

Starting from Version 1.1.16, it's possibile to group players, so your announcement can be played on all selected players. For this to happen, you need to select your primary coordinator player. All other players will be then controlled by this coordinator.

**Additional Players**  
Here you can add all additional players that will be grouped toghether to the *Main Sonos Player* coordinator group. You can add a player using the "ADD" button, below the list.


# INPUT MESSAGES TO THE NODE

**msg.volume** set the volume (values between "0" and "100" with quotes)  
**msg.nohailing** temporarely doesn't play the Hailing sound prior to the message (values "true" or "1" with quotes)  
**msg.payload** the text to be spoken (for example msg.payload = "Hello World!";). You can also play an mp3 stored on an http server, by passing the URL to the payload ( <code>msg.payload = "http://www.myserver.com/alarm.mp3"</code>). 
**msg.sonoshailing** Overrides the selected hailing and plays the filename you passed in. Please double check the spelling of the filename (must be the same as you can see in the dropdown list of your hailing files, in the sonospollytts config window) and do not include the <b>.mp3</b> extenson. For example *node.sonoshailing="ComputerCall"*  

*Example of using http mp3 in a function node*

```js
node.send({sonoshailing:"ComputerCall"};
node.send({payload:"http://192.125.22.44/intruderalarm.mp3"};
node.send({payload:"Warning. Intruder in the dinning room."};
```

# OUTPUT MESSAGES FROM THE NODE

**msg.completed** "true" when the node has finished playing, **false** if the node is playing<br/>
**msg.connectionerror** "true" when the node cannot connect to the Sonos device, **false** if the connection is restored.  
  
  
  

# OWNFILE NODE CONFIGURATION

<img src='https://github.com/Supergiovane/node-red-contrib-sonospollytts/raw/master/img/sampleOwnFile.png' width="80%">



<details><summary> VIEW SAMPLE CODE</summary>

> Adjust the nodes according to your setup

```js
[{"id":"9389863f.c9e44","type":"sonospollytts","z":"2e6a2c30.383f64","name":"","voice":"51","ssml":false,"sonosipaddress":"192.168.1.109","sonosvolume":"25","sonoshailing":"Hailing_Hailing.mp3","config":"7182770d.79d208","propertyType":{},"rules":[],"x":660,"y":340,"wires":[[]]},{"id":"90a05585.bc514","type":"ownfile","z":"2e6a2c30.383f64","name":"","selectedFile":"OwnFile_Tur geoeffnet.mp3","x":310,"y":340,"wires":[["9389863f.c9e44"]]},{"id":"d416ac1c.e5c8b","type":"inject","z":"2e6a2c30.383f64","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":150,"y":340,"wires":[["90a05585.bc514"]]},{"id":"3b08c36d.aba304","type":"comment","z":"2e6a2c30.383f64","name":"You can upload your own voice messages and use it with SonosPollyTTS","info":"","x":340,"y":300,"wires":[]},{"id":"b6061743.7f9ce","type":"ownfile","z":"2e6a2c30.383f64","name":"","selectedFile":"OwnFile_Tur geoeffnet.mp3","x":410,"y":400,"wires":[["9389863f.c9e44"]]},{"id":"6cac28fd.4088a8","type":"inject","z":"2e6a2c30.383f64","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":150,"y":400,"wires":[["fc569484.6604a8"]]},{"id":"fc569484.6604a8","type":"function","z":"2e6a2c30.383f64","name":"","func":"// Override the selected file.\nmsg.selectedFile=\"Porta aperta\"\nreturn msg;","outputs":1,"noerr":0,"x":270,"y":400,"wires":[["b6061743.7f9ce"]]},{"id":"7182770d.79d208","type":"sonospollytts-config","z":"","name":"Config","noderedipaddress":"192.168.1.236","noderedport":"1980","accessKey":"","secretKey":"","purgediratrestart":"leave"}]
```
</details>

This node allow you to upload your custom message and play it via SonosPollyTTS without the need of an internet connection. You can use it, for example, with your alarm panel, to annuce a zone breach, a doorbell or so.

**Name**  
Node name

**File to be played**  
Select a file to be played. You can upload one or multiple files at the same time via the "upload" button.

## INPUT MESSAGE 

**msg.payload = true** Begin play of the message  
**msg.selectedFile = "Garage door open"** Overrides the selected message and plays the filename you passed in. Please double check the spelling of the filename (must be the same as you can see in the dropdown list of your own files, in the node config window) and do not include the **.mp3** extenson.

    
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-sonospollytts/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-sonospollytts
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-sonospollytts.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-sonospollytts.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-sonospollytts.svg
