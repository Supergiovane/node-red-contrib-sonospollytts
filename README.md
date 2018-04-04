# Node-Red
<p>
        This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS api and Node Sonos api.
    </p>
    <p>
        <b>April 2018: This node entered stable candidate release. Use at your own risk and please tell me if you have issues.</b> Please see the <a href="https://github.com/Supergiovane/node-red-contrib-sonospollytts/blob/master/CHANGELOG.md">Changelog</a><br/><br/>
        Do you want to support this project?<br/><a href="https://www.paypal.me/techtoday/5"><img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"></a><br/>
    </p>
    <p>
    USE: Set the configuration of Polly (you need the free Amazon AWS credentials), then set your Sonos IP Address (Sonos
    doesn't allow to set a fixed IP to the sonos's device, so you need to reserve an IP using the DHCP Reservation function of your
    router/firewall's DHCP Server).
    </p>
    <p>
    Send to the node, a payload with the text you want to speech out. For example <code>{payload:"Hello there!"}</code>.<br/>
    You can send multiple messages at once. The node will handle the queue.<br/>
    </p>
    <p>
    <b>CONFIG:</b><br/>
    Polly Config: create a config with your AWS credentials<br/>
    Polly Voice: select your preferred voice<br/>
    Polly Cache: leave it as is<br/>
    Sonos IP: insert your sonos's IP<br/>
    Sonos Volume: set the preferred TTS volume, from 0 to 100<br/>
    Sonos Hailing: before the first TTS message of the message queues, Sonos will play an "hailing" sound. Leave blank for disabling the hailing. Put again hailing.mp3 to restore the hailing<br/>
    Node-Red IP: set IP of your node-red<br/>
    Node-Red Port: normally 1880. If you've changed the default port, adjust this field consequently<br/>
    </p>
    <p>
    Known issues:<br/>
    - If the Sonos device is set to LineIn, TVin or other physical input, the node doesn't work. You need to play something via Sonos App, then stop the play. Then the node will work again
    </p>
<br/>
<p> SAMPLE FLOW:<br/>
<code>
[
    {
        "id": "2a7223f6.d28e0c",
        "type": "tab",
        "label": "Flow 1",
        "disabled": false,
        "info": ""
    },
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
        "x": 70,
        "y": 120,
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
        "name": "",
        "func": "node.send({payload:\"Hello\"});\nnode.send({payload:\"http://media.ilmeteo.it/audio/2018-03-31.mp3\"});\nnode.send({payload:\"This is a test message\"});\n",
        "outputs": 1,
        "noerr": 0,
        "x": 230,
        "y": 120,
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
        "voice": "17",
        "ssml": false,
        "dir": "/tmp",
        "sonosipaddress": "192.168.1.109",
        "sonosvolume": "30",
        "sonoshailing": "hailing.mp3",
        "noderedipaddress": "192.168.1.114",
        "noderedport": "1880",
        "config": "e9b4b321.0bcb5",
        "x": 390,
        "y": 120,
        "wires": []
    },
    {
        "id": "e9b4b321.0bcb5",
        "type": "sonospollytts-config",
        "z": "",
        "name": "bb"
    }
]
</code>
</p>
    
