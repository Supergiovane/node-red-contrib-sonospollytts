# Node-Red
Quality Node-Red nodes
<p>
        This node uses <a href="https://aws.amazon.com/polly/">Polly</a> TTS api and Node Sonos api.
    </p>
    <p>
        This is a very early alpha, so use at your own risk!<br/>
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
    <br/>
    <p>
    Known issues:<br/>
    If the Sonos device is set to LineIn, TVin or other physical input, the node doesn't work. You need to play something via Sonos App, then stop the play. Then the node will work again
        <br/>
        If some music is playing, the node will wait for the music to stop, before playing the TTS message.
    </p>
<br/>
<p>
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
    
