# Node-Red
Quality Node-Red nodes
<p>
        This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS api and Node Sonos api.
    </p>
    <p>
        <b>This is a very early alpha, so use at your own risk!</b><br/><br/>
        Do you want to support us?<br/><a href="https://www.paypal.me/techtoday/5"><img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"></a><br/><br/>
        Please see the <a href="https://github.com/Supergiovane/node-red-contrib-sonospollytts/blob/master/CHANGELOG.md">Changelog</a>
    </p>
    <p>
    USE: Set the configuration of Polly (you need the free Amazon AWS credentials), then set your Sonos IP Address (Sonos
    doesn't allow to set a fixed IP to the sonos's device, so you need to reserve an IP using the DHCP Reservation function of your
    router/firewall's DHCP Server).
    </p>
    <p>
    Send to the node, a payload with the text you want to speed out. For example <code>{payload:"Hello there!"}</code>.<br/>
    You can send multiple messages at once. The node will handle the queue.
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
        "func": "node.send({payload:\"Ciao, volevo dire una cosa molto importante. Sa, la dico lostesso, vado? Si, vado. Io sono una riga molto lunga e posso avere lo stato playing\"});\nnode.send({payload:\"Riga12\"});\nnode.send({payload:\"Altra riga molto lunga, con stato playing sicuramente trappato. Altrimenti va da via i ciap.\"});",
        "outputs": 1,
        "noerr": 0,
        "x": 210,
        "y": 120,
        "wires": [
            [
                "4e75a6d3.bc73c8"
            ]
        ]
    },
    {
        "id": "4e75a6d3.bc73c8",
        "type": "sonospollytts",
        "z": "2a7223f6.d28e0c",
        "name": "",
        "voice": "0",
        "ssml": false,
        "dir": "/tmp",
        "sonosipaddress": "192.168.1.109",
        "noderedipaddress": "192.168.1.131",
        "noderedport": "1880",
        "config": "ea5ffe92.83e9",
        "x": 420,
        "y": 140,
        "wires": []
    },
    {
        "id": "ea5ffe92.83e9",
        "type": "sonospollytts-config",
        "z": "",
        "name": "bbb"
    }
]
</code>
</p>
    
