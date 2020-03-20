module.exports = function (RED) {
    'use strict';

    var AWS = require('aws-sdk');
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var MD5 = require('crypto-js').MD5;
    var util = require('util');
    var path = require('path');
    const sonos = require('sonos');
    var formidable = require('formidable');


    AWS.config.update({
        region: 'us-east-1'
    });

    function slug(_text) {
        var sRet = _text;
        sRet = sRet.toString().replace(/\./g, "_stop_");
        sRet = sRet.toString().replace(/\?/g, "_qm_");
        sRet = sRet.toString().replace(/\!/g, "_em_");
        sRet = sRet.toString().replace(/\,/g, "_pause_");
        sRet = sRet.toString().replace(/\:/g, "_colon_");
        sRet = sRet.toString().replace(/\;/g, "_semicolon_");
        sRet = sRet.toString().replace(/\</g, "_less_");
        sRet = sRet.toString().replace(/\>/g, "_greater_");
        // slug.charmap['.'] = '_stop_';
        // slug.charmap['?'] = '_qm_';
        // slug.charmap['!'] = '_em_';
        // slug.charmap[','] = '_pause_';
        // slug.charmap[':'] = '_colon_';
        // slug.charmap[';'] = '_semicolon_';
        // slug.charmap['<'] = '_less_';
        // slug.charmap['>'] = '_greater_';
        return sRet;
    }


    function setupDirectory(aPath) {
        try {
            return fs.statSync(aPath).isDirectory();
        } catch (e) {

            // Path does not exist
            if (e.code === 'ENOENT') {
                // Try and create it
                try {
                    try {
                        mkdirp.sync(aPath);
                        RED.log.info('SonosPollyTTS: Created directory path: ' + aPath);
                    } catch (error) {
                        RED.log.info('SonosPollyTTS: Failed to access path:: ' + aPath + " : " + error.code);
                        return false;
                    }

                    return true;
                } catch (e) {
                    RED.log.error('Failed to create path: ' + aPath + " : " + e.code);
                }
            }
            // Otherwise failure
            return false;
        }
    }

    var voices = {
        '0': {
            Gender: 'Female',
            Id: 'Joanna',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joanna'
        },
        '1': {
            Gender: 'Female',
            Id: 'Mizuki',
            LanguageCode: 'ja-JP',
            LanguageName: 'Japanese',
            Name: 'Mizuki'
        },
        '2': {
            Gender: 'Female',
            Id: 'Filiz',
            LanguageCode: 'tr-TR',
            LanguageName: 'Turkish',
            Name: 'Filiz'
        },
        '3': {
            Gender: 'Female',
            Id: 'Astrid',
            LanguageCode: 'sv-SE',
            LanguageName: 'Swedish',
            Name: 'Astrid'
        },
        '4': {
            Gender: 'Male',
            Id: 'Maxim',
            LanguageCode: 'ru-RU',
            LanguageName: 'Russian',
            Name: 'Maxim'
        },
        '5': {
            Gender: 'Female',
            Id: 'Tatyana',
            LanguageCode: 'ru-RU',
            LanguageName: 'Russian',
            Name: 'Tatyana'
        },
        '6': {
            Gender: 'Female',
            Id: 'Carmen',
            LanguageCode: 'ro-RO',
            LanguageName: 'Romanian',
            Name: 'Carmen'
        },
        '7': {
            Gender: 'Female',
            Id: 'Ines',
            LanguageCode: 'pt-PT',
            LanguageName: 'Portuguese',
            Name: 'Inês'
        },
        '8': {
            Gender: 'Male',
            Id: 'Cristiano',
            LanguageCode: 'pt-PT',
            LanguageName: 'Portuguese',
            Name: 'Cristiano'
        },
        '9': {
            Gender: 'Female',
            Id: 'Vitoria',
            LanguageCode: 'pt-BR',
            LanguageName: 'Brazilian Portuguese',
            Name: 'Vitória'
        },
        '10': {
            Gender: 'Male',
            Id: 'Ricardo',
            LanguageCode: 'pt-BR',
            LanguageName: 'Brazilian Portuguese',
            Name: 'Ricardo'
        },
        '11': {
            Gender: 'Female',
            Id: 'Maja',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Maja'
        },
        '12': {
            Gender: 'Male',
            Id: 'Jan',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Jan'
        },
        '13': {
            Gender: 'Female',
            Id: 'Ewa',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Ewa'
        },
        '14': {
            Gender: 'Male',
            Id: 'Ruben',
            LanguageCode: 'nl-NL',
            LanguageName: 'Dutch',
            Name: 'Ruben'
        },
        '15': {
            Gender: 'Female',
            Id: 'Lotte',
            LanguageCode: 'nl-NL',
            LanguageName: 'Dutch',
            Name: 'Lotte'
        },
        '16': {
            Gender: 'Female',
            Id: 'Liv',
            LanguageCode: 'nb-NO',
            LanguageName: 'Norwegian',
            Name: 'Liv'
        },
        '17': {
            Gender: 'Male',
            Id: 'Giorgio',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Giorgio'
        },
        '18': {
            Gender: 'Female',
            Id: 'Carla',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Carla'
        },
        '19': {
            Gender: 'Male',
            Id: 'Karl',
            LanguageCode: 'is-IS',
            LanguageName: 'Icelandic',
            Name: 'Karl'
        },
        '20': {
            Gender: 'Female',
            Id: 'Dora',
            LanguageCode: 'is-IS',
            LanguageName: 'Icelandic',
            Name: 'Dóra'
        },
        '21': {
            Gender: 'Male',
            Id: 'Mathieu',
            LanguageCode: 'fr-FR',
            LanguageName: 'French',
            Name: 'Mathieu'
        },
        '22': {
            Gender: 'Female',
            Id: 'Celine',
            LanguageCode: 'fr-FR',
            LanguageName: 'French',
            Name: 'Céline'
        },
        '23': {
            Gender: 'Female',
            Id: 'Chantal',
            LanguageCode: 'fr-CA',
            LanguageName: 'Canadian French',
            Name: 'Chantal'
        },
        '24': {
            Gender: 'Female',
            Id: 'Penelope',
            LanguageCode: 'es-US',
            LanguageName: 'US Spanish',
            Name: 'Penélope'
        },
        '25': {
            Gender: 'Male',
            Id: 'Miguel',
            LanguageCode: 'es-US',
            LanguageName: 'US Spanish',
            Name: 'Miguel'
        },
        '26': {
            Gender: 'Male',
            Id: 'Enrique',
            LanguageCode: 'es-ES',
            LanguageName: 'Castilian Spanish',
            Name: 'Enrique'
        },
        '27': {
            Gender: 'Female',
            Id: 'Conchita',
            LanguageCode: 'es-ES',
            LanguageName: 'Castilian Spanish',
            Name: 'Conchita'
        },
        '28': {
            Gender: 'Male',
            Id: 'Geraint',
            LanguageCode: 'en-GB-WLS',
            LanguageName: 'Welsh English',
            Name: 'Geraint'
        },
        '29': {
            Gender: 'Female',
            Id: 'Salli',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Salli'
        },
        '30': {
            Gender: 'Female',
            Id: 'Kimberly',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kimberly'
        },
        '31': {
            Gender: 'Female',
            Id: 'Kendra',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kendra'
        },
        '32': {
            Gender: 'Male',
            Id: 'Justin',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Justin'
        },
        '33': {
            Gender: 'Male',
            Id: 'Joey',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joey'
        },
        '34': {
            Gender: 'Female',
            Id: 'Ivy',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Ivy'
        },
        '35': {
            Gender: 'Female',
            Id: 'Raveena',
            LanguageCode: 'en-IN',
            LanguageName: 'Indian English',
            Name: 'Raveena'
        },
        '36': {
            Gender: 'Female',
            Id: 'Emma',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Emma'
        },
        '37': {
            Gender: 'Male',
            Id: 'Brian',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Brian'
        },
        '38': {
            Gender: 'Female',
            Id: 'Amy',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Amy'
        },
        '39': {
            Gender: 'Male',
            Id: 'Russell',
            LanguageCode: 'en-AU',
            LanguageName: 'Australian English',
            Name: 'Russell'
        },
        '40': {
            Gender: 'Female',
            Id: 'Nicole',
            LanguageCode: 'en-AU',
            LanguageName: 'Australian English',
            Name: 'Nicole'
        },
        '41': {
            Gender: 'Female',
            Id: 'Marlene',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Marlene'
        },
        '42': {
            Gender: 'Male',
            Id: 'Hans',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Hans'
        },
        '43': {
            Gender: 'Female',
            Id: 'Naja',
            LanguageCode: 'da-DK',
            LanguageName: 'Danish',
            Name: 'Naja'
        },
        '44': {
            Gender: 'Male',
            Id: 'Mads',
            LanguageCode: 'da-DK',
            LanguageName: 'Danish',
            Name: 'Mads'
        },
        '45': {
            Gender: 'Female',
            Id: 'Gwyneth',
            LanguageCode: 'cy-GB',
            LanguageName: 'Welsh',
            Name: 'Gwyneth'
        },
        '46': {
            Gender: 'Male',
            Id: 'Jacek',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Jacek'
        },
        '47': {
            Gender: 'Male',
            Id: 'Matthew',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Matthew'
        },
        '48': {
            Gender: 'Female',
            Id: 'Vicki',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Vicki'
        },
        '49': {
            Gender: 'Female',
            Id: 'Aditi',
            LanguageCode: 'hi-IN',
            LanguageName: 'Hindi',
            Name: 'Aditi'
        },
        '50': {
            Gender: 'Female',
            Id: 'Aditi',
            LanguageCode: 'en-IN',
            LanguageName: 'English',
            Name: 'Aditi'
        },
        '51': {
            Gender: 'Female',
            Id: 'Bianca',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Bianca'
        },
        '52': {
            Gender: 'Female',
            Id: 'Lucia',
            LanguageCode: 'es-ES',
            LanguageName: 'Spanish',
            Name: 'Lucia'
        },
        '53': {
            Gender: 'Female',
            Id: 'Mia',
            LanguageCode: 'es-MX',
            LanguageName: 'Spanish Mexican',
            Name: 'Mia'
        },
        '54': {
            Gender: 'Female',
            Id: 'Seoyeon',
            LanguageCode: 'ko-KR',
            LanguageName: 'Korean',
            Name: 'Seoyeon'
        },
        '55': {
            Gender: 'Male',
            Id: 'Takumi',
            LanguageCode: 'ja-JP',
            LanguageName: 'Japanese',
            Name: 'Takumi'
        },
        '56': {
            Gender: 'Female',
            Id: 'Zeina',
            LanguageCode: 'arb',
            LanguageName: 'Arabic',
            Name: 'Zeina'
        },
        '57': {
            Gender: 'Female',
            Id: 'Zhiyu',
            LanguageCode: 'cmn-CN',
            LanguageName: 'Chinese, Mandarin',
            Name: 'Zhiyu'
        }
    };


    // Configuration Node Register
    function PollyConfigNode(config) {
        RED.nodes.createNode(this, config);
       

        if (this.credentials) {
            this.accessKey = this.credentials.accessKey;
            this.secretKey = this.credentials.secretKey;
        }

        var params = {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secretKey,
            apiVersion: '2016-06-10'
        };

        this.polly = new AWS.Polly(params);

    }
    //RED.nodes.registerType('sonospollytts-config', PollyConfigNode);
    RED.nodes.registerType('sonospollytts-config', PollyConfigNode, {
        credentials: {
            accessKey: {
                type: 'text'
            },
            secretKey: {
                type: 'password'
            }
        }
    });
    


    // Node Register
    function PollyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.sPollyState = "done";
        node.iTimeoutPollyState = 0;
        node.aMessageQueue = []; // Array of incoming TTS messages
        node.SonosClient;
        node.iVoice;
        node.oTimer;
        node.oTimerSonosConnectionCheck;
        node.sSonosVolume; // Sonos Volume
        node.sSonosPlayState = "stopped"; // Play state
        node.sSonosTrackTitle = ""; // Track title
        node.sSonosIPAddress = "";
        node.sSonosCoordinatorGroupName = "";
        node.sonoshailing = "0"; // Hailing file
        node.msg = {}; // 08/05/2019 Node message
        node.oWebserver; // 11/11/2019 Stores the Webserver
        node.msg.completed = true;
        node.msg.connectionerror = true;
        node.purgediratrestart = config.purgediratrestart || "purge"; // 26/02/2020
        node.userDir = RED.settings.userDir + "/sonospollyttsstorage"; // 09/03/2020 Storage of sonospollytts (otherwise, at each upgrade to a newer version, the node path is wiped out and recreated, loosing all custom files)
        node.oAdditionalSonosPlayers = []; // 20/03/2020 Contains other players to be grouped
        node.rules = config.rules || [{}];
        
        // 11/11/2019 NEW in V 1.1.0, changed webserver behaviour. Redirect pre V. 1.1.0 1880 ports to the nde default 1980
        if (config.noderedport.trim() == "1880") {
            RED.log.warn("SonosPollyTTS: The webserver port ist 1880. Please change it to another port, not to conflict with default node-red 1880 port. I've changed this temporarly for you to 1980");
            config.noderedport = "1980";
        }
        node.sNoderedURL = "http://" + config.noderedipaddress.trim() + ":" + config.noderedport.trim(); // 11/11/2019 New Endpoint to overcome https problem.
        RED.log.info('SonosPollyTTS: Node-Red node.js Endpoint will be created here: ' + node.sNoderedURL + "/tts");

        // 20/03/2020 in the middle of coronavirus, get the sonos groups
        RED.httpAdmin.get("/sonosgetAllGroups", RED.auth.needsPermission('PollyNode.read'), function (req, res) {
            var jListGroups = [];
            try {
                const discovery = new sonos.AsyncDeviceDiscovery()
                discovery.discover().then((device, model) => {
                    RED.log.warn('Found one sonos device ' + device.host + ' getting all groups')
                    return device.getAllGroups().then((groups) => {
                        //RED.log.warn('Groups ' + JSON.stringify(groups, null, 2))
                        for (let index = 0; index < groups.length; index++) {
                            const element = groups[index];
                            jListGroups.push({ name: element.Name, host: element.host })
                        }
                        res.json(jListGroups)
                        //return groups[0].CoordinatorDevice().togglePlayback()
                    })
                }).catch(e => {
                    RED.log.warn(' Error in discovery ' + e)
                })
            } catch (error) { }
        });


        // 09/03/2020 Get list of filenames in hailing folder
        RED.httpAdmin.get("/getHailingFilesList", RED.auth.needsPermission('PollyNode.read'), function (req, res) {
            var jListOwnFiles = [];
            var sName = "";
            try {
                fs.readdirSync(node.userDir + "/hailingpermanentfiles").forEach(file => {
                    if (file.indexOf("Hailing_") > -1) {
                        sName = file.replace("Hailing_", "").replace(".mp3", "");
                        jListOwnFiles.push({ name: sName, filename: file });
                    }
                });

            } catch (error) { }
            res.json(jListOwnFiles)
        });

        // 09/03/2020 Delete Hailing
        RED.httpAdmin.get("/deleteHailingFile", RED.auth.needsPermission('PollyNode.read'), function (req, res) {
            // Delete the file
            try {
                var newPath = node.userDir + "/hailingpermanentfiles/" + req.query.FileName;
                fs.unlinkSync(newPath)
            } catch (error) { }
            res.json({ status: 220 });
        });

        // 09/03/2020 Receive new hailing files from html
        RED.httpAdmin.post("/node-red-contrib-sonospollyttsHailing", function (req, res) {
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                if (err) { };
                // Allow only mp3
                if (files.customHailing.name.indexOf(".mp3") !== -1) {
                    var newPath = node.userDir + "/hailingpermanentfiles/Hailing_" + files.customHailing.name;
                    fs.rename(files.customHailing.path, newPath, function (err) { });
                }
            });
            res.json({ status: 220 });
            res.end;
        });

        // 20/11/2019 Used to call the status update
        node.setNodeStatus = ({ fill, shape, text }) => {
            var dDate = new Date();
            node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" });
        }

        // 03/06/2019 you can select the temp dir
        if (!setupDirectory(node.userDir)) {
            RED.log.error('SonosPollyTTS: Unable to set up MAIN directory: ' + node.userDir);
        }
        if (!setupDirectory(node.userDir + "/ttsfiles")) {
            RED.log.error('SonosPollyTTS: Unable to set up cache directory: ' + node.userDir + "/ttsfiles");
        } else {
            RED.log.info('SonosPollyTTS: TTS cache set to ' + node.userDir + "/ttsfiles");
        }
        if (!setupDirectory(node.userDir + "/hailingpermanentfiles")) {
            RED.log.error('SonosPollyTTS: Unable to set up hailing directory: ' + node.userDir + "/hailingpermanentfiles");
        } else {
            RED.log.info('SonosPollyTTS: hailing path set to ' + node.userDir + "/hailingpermanentfiles");
            // 09/03/2020 Copy defaults to the userDir
            fs.readdirSync(__dirname + "/hailingpermanentfiles").forEach(file => {
                try {
                    fs.copyFileSync(__dirname + "/hailingpermanentfiles/" + file, node.userDir + "/hailingpermanentfiles/" + file);
                } catch (error) { }
            });
        }
        if (!setupDirectory(node.userDir + "/ttspermanentfiles")) {
            RED.log.error('SonosPollyTTS: Unable to set up permanent files directory: ' + node.userDir + "/ttspermanentfiles");
        } else {
            RED.log.info('SonosPollyTTS: permanent files path set to ' + node.userDir + "/ttspermanentfiles");
            // 09/03/2020 // Copy the samples of permanent files into the userDir
            fs.readdirSync(__dirname + "/ttspermanentfiles").forEach(file => {
                try {
                    fs.copyFileSync(__dirname + "/ttspermanentfiles/" + file, node.userDir + "/ttspermanentfiles/" + file);
                } catch (error) { }
            });
        }

        // 26/02/2020
        if (node.purgediratrestart === "purge") {
            // Delete all files, that are'nt OwnFiles_
            try {
                fs.readdir(node.userDir + "/ttsfiles/", (err, files) => {
                    if (files.length > 0) {
                        files.forEach(function (file) {
                            RED.log.info("SonospollyTTS: Deleted TTS file " + node.userDir + "/ttsfiles/" + file);
                            try {
                                fs.unlink(node.userDir + "/ttsfiles/" + file), err => { };
                            } catch (error) {
                            }
                        });
                    };
                });
            } catch (error) { }
        };


        // Set ssml
        node.ssml = config.ssml;

        node.Pollyconfig = RED.nodes.getNode(config.config);

        node.sSonosIPAddress = config.sonosipaddress.trim();

        if (!node.Pollyconfig) {
            RED.log.error('Missing Polly config');
            return;
        }

        // Set the voice
        node.iVoice = voices[config.voice].Id;


        // Create sonos client
        node.SonosClient = new sonos.Sonos(node.sSonosIPAddress);

        // 20/03/2020 Set the coorinator's zone name
        node.SonosClient.getName().then(info => {
            node.sSonosCoordinatorGroupName = info;
            RED.log.info("SonosPollyTTS: ZONE COORDINATOR " + info);
        });
        // Fill the node.oAdditionalSonosPlayers with all sonos object in the rules
        for (let index = 0; index < node.rules.length; index++) {
            const element = node.rules[index];
            node.oAdditionalSonosPlayers.push(new sonos.Sonos(element.host));
            RED.log.info("SonosPollyTTS: FOUND ADDITIONAL PLAYER " + element.host);
        }

        // Get default sonos volume
        node.sSonosVolume = config.sonosvolume;

        // Start the TTS queue timer
        node.oTimer = setTimeout(function () { HandleQueue(node); }, 5000);

        // 27/11/2019 Start the connection healty check
        node.oTimerSonosConnectionCheck = setTimeout(function () { CheckSonosConnection(node); }, 5000);

        node.sonoshailing = config.sonoshailing;

        // Backwart compatibiliyy, to remove with the next Version
        // ################
        if (node.sonoshailing == "0") {
            // Remove the hailing.mp3 default file
            RED.log.info('SonosPollyTTS: Hailing disabled');
        } else if (node.sonoshailing == "1") {
            node.sonoshailing = "Hailing_Hailing.mp3";
        } else if (node.sonoshailing == "2") {
            node.sonoshailing = "Hailing_ComputerCall.mp3";
        } else if (node.sonoshailing == "3") {
            node.sonoshailing = "Hailing_VintageSpace.mp3";
        }
        // ################


        node.setNodeStatus({
            fill: 'green',
            shape: 'ring',
            text: 'Ready'
        });


        // 20/03=2020 QUEUINPLAYERS
        // ######################################################
        // 20/03/2020 Join Coordinator queue
        node.groupSpeakers = () => {
            // 30/03/2020 in the middle of coronavirus emergency. Group Speakers
            // You don't have to worry about who is the coordinator.
            for (let index = 0; index < node.oAdditionalSonosPlayers.length; index++) {
                const element = node.oAdditionalSonosPlayers[index];
                element.joinGroup(node.sSonosCoordinatorGroupName).then(success => {
                    //RED.log.warn('SonosPollyTTS: Joining ' + deviceToJoin + " with " + (success ? 'Success' : 'Failure'))
                }).catch(err => {
                    RED.log.warn('SonosPollyTTS: Error joining device ' + err)
                });
            }
        }
        // 20/03/2020 Ungroup Coordinator queue
        node.ungroupSpeakers = () => {
            for (let index = 0; index < node.oAdditionalSonosPlayers.length; index++) {
                const element = node.oAdditionalSonosPlayers[index];
                element.leaveGroup().then(success => {
                    //RED.log.warn('Leaving the group is a ' + (success ? 'Success' : 'Failure'))
                }).catch(err => {
                    RED.log.warn('SonosPollyTTS: Error joining device ' + err)
                })
            }
        }
        // ######################################################


        node.on('input', function (msg) {
            // 12/06/2018 Controllo se il payload è un'impostazione del volume
            if (msg.hasOwnProperty("volume")) {
                node.sSonosVolume = msg.volume;
            }

            try {
                node.setNodeStatus({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'Processing ' + msg.payload
                });
            } catch (error) { }

            if (!msg.hasOwnProperty("payload")) {
                notifyError(node, msg, 'msg.payload must be of type String');
                return;
            }

            // 17/04/2019 Verifico se possso mandare in play l'hailing
            if (msg.hasOwnProperty("nohailing") && (msg.nohailing == "1" || msg.nohailing.toLowerCase() == "true")) node.sonoshailing = "0";

            // 09/03/2020 Change hailing
            if (msg.hasOwnProperty("sonoshailing")) node.sonoshailing = "Hailing_" + msg.sonoshailing + ".mp3";


            // 07/05/2019 Set "completed" to false and send it
            if (node.aMessageQueue.length == 0) {
                node.msg.completed = false;
                node.groupSpeakers(); // 20/03/2020 Group Speakers toghether
                node.send(node.msg);
            }

            // If the queue is empty and if i can play the Haniling, add the hailing file first
            if (node.aMessageQueue.length == 0 && node.sonoshailing !== "0") {
                node.aMessageQueue.push(node.sonoshailing);
            }

            // Add the message to the array
            node.aMessageQueue.push(msg.payload);

        });

        node.on('close', function (done) {
            clearTimeout(node.oTimer);
            node.SonosClient.stop().then(() => {
                node.ungroupSpeakers();
            });
            node.msg.completed = true;
            node.send(node.msg);
            node.setNodeStatus({ fill: "green", shape: "ring", text: "" + node.sSonosPlayState });
            // 11/11/2019 Close the Webserver
            try {
                node.oWebserver.close(function () { RED.log.info("SonosPollyTTS: Webserver UP. Closing down."); });
            } catch (error) {

            }
            setTimeout(function () {
                // Wait some time to allow time to do promises.
                done();
            }, 3000);
        });



        // 11/11/2019 CREATE THE ENDPOINT
        // #################################
        const http = require('http')
        const sWebport = config.noderedport.trim();
        const requestHandler = (req, res) => {
            try {

                var url = require('url');
                var url_parts = url.parse(req.url, true);
                var query = url_parts.query;

                res.setHeader('Content-Disposition', 'attachment; filename=tts.mp3')
                if (fs.existsSync(query.f)) {
                    var readStream = fs.createReadStream(query.f);
                    readStream.on("error", function (err) {
                        fine(err);
                    });
                    readStream.pipe(res);
                    res.end;
                } else {
                    RED.log.error("Playsonos RED.httpAdmin file not found: " + query.f);
                    res.write("File not found");
                    res.end();
                }

            } catch (error) {
                RED.log.error("Playsonos RED.httpAdmin error: " + error + " on: " + query.f);
            }
            function fine(err) {
                RED.log.error("Playsonos error opening stream : " + query.f + ' : ' + error);
                res.end;
            }
        }


        try {
            node.oWebserver = http.createServer(requestHandler);
            node.oWebserver.on('error', function (e) {
                RED.log.error("SonosPollyTTS: " + node.ID + " error starting webserver on port " + sWebport + " " + e);
                node.setNodeStatus({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Error. Port ' + sWebport + " already in use."
                });
            });
        } catch (error) {
            // Already open. Close it and redo.
            RED.log.error("SonosPollyTTS: Webserver creation error: " + error);
        }

        try {
            node.oWebserver.listen(sWebport, (err) => {
                if (err) {
                    RED.log.error("SonosPollyTTS: error listening webserver on port " + sWebport + " " + err);
                }
            });

        } catch (error) {
            // In case oWebserver is null
            RED.log.error("SonosPollyTTS: error listening webserver on port " + sWebport + " " + error);
        }
        // #################################




    }
    RED.nodes.registerType('sonospollytts', PollyNode);



    // Handle the queue
    function HandleQueue(node) {
        // Check if Polly is downloading the file (in case the phrase is very long)

        // 06/05/2019 check if the SonosClient is already instantiate (an error can occur if a very slow PC is used)
        if (node.SonosClient == null) {
            RED.log.info('SonosPollyTTS: InfoHandleQueue0 SonosClient not instantiate. Retry later...');
            node.oTimer = setTimeout(function () { HandleQueue(node); }, 5000);
            return;
        }

        if (node.sPollyState == "transitioning") {
            node.iTimeoutPollyState += 1; // Increase Timeout
            if (node.iTimeoutPollyState > 15) {
                node.iTimeoutPollyState = 0;
                node.sPollyState = "idle";
                RED.log.info('SonosPollyTTS: HandleQueue - Polly is in downloading Timeout');
            }

            // Not cached
            node.setNodeStatus({
                fill: 'yellow',
                shape: 'dot',
                text: 'downloading'
            });
            RED.log.info('SonosPollyTTS: HandleQueue - Polly is downloading the file, exit');
            node.oTimer = setTimeout(function () { HandleQueue(node); }, 1000);
            return;


        } else {
            node.iTimeoutPollyState = 0; // Reset Timer
        }

        // 06/05/2019 moved the code into the "try" 
        try {

            node.SonosClient.getCurrentState().then(state => {
                node.sSonosPlayState = state;

                //RED.log.info('SonosPollyTTS: DEBUG HandleQueue - node.sSonosPlayState=' + node.sSonosPlayState);

                node.SonosClient.currentTrack().then(track => {
                    node.sSonosTrackTitle = track.uri;
                    HandleQueue2(node);
                }).catch(err => {
                    node.setNodeStatus({ fill: "red", shape: "dot", text: "err currtrack: " + err });
                    node.sSonosTrackTitle = "stopped"; // force stopped
                    HandleQueue2(node);
                }); // node.SonosClient.currentTrack().then(track=>{


            }).catch(err => {
                node.setNodeStatus({ fill: "red", shape: "dot", text: "err currstate: " + err });
                node.sSonosTrackTitle = "stopped"; // force stopped

                // 10/04/2018 Remove the TTS message from the queue
                if (node.aMessageQueue.length > 0) {
                    node.aMessageQueue = [];
                    RED.log.info('SonosPollyTTS: HandleQueue2 - error, flushed queue');
                }

                // Set  timeout
                node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);

            }); // node.SonosClient.getCurrentState().then(state=>{
        } catch (error) {

            // 06/05/2019 restart timer. To be removed if the try catch is removed as well.
            // Set  timeout
            node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);
            RED.log.info('SonosPollyTTS: errHandleQueue1 ' + error.toString());

        }


    }

    // Handle queue 2 
    function HandleQueue2(node) {

        // Play next msg
        if (node.aMessageQueue.length > 0) {

            // It's playing something. Check what's playing.
            // If Music, then stop the music and play the TTS message
            // If playing TTS message, waits until it's finished.
            if (node.sSonosPlayState == "stopped" || node.sSonosPlayState == "paused") {
                var sMsg = node.aMessageQueue[0];

                // Remove the TTS message from the queue
                node.aMessageQueue.splice(0, 1);

                node.sPollyState = "transitioning";
                node.sSonosPlayState = "transitioning";
                node.setNodeStatus({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'preparing...'
                });
                // Create the TTS mp3 with Polly
                Leggi(sMsg, node);
                // Set  timeout
                node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);

            } else if (node.sSonosPlayState == "playing" && node.sSonosTrackTitle.toLocaleLowerCase().indexOf(".mp3") == -1) {

                RED.log.info('SonosPollyTTS: HandleQueue2 - stopping: ' + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);

                // It's playing something. Stop
                node.SonosClient.pause().then(success => {
                    RED.log.info('SonosPollyTTS: HandleQueue2 - stopped: ' + success + " " + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);
                    var sMsg = node.aMessageQueue[0];
                    node.aMessageQueue.splice(0, 1); // Remove the TTS message from the queue
                    node.sPollyState = "transitioning";
                    node.sSonosPlayState = "transitioning";
                    // Create the TTS mp3 with Polly
                    Leggi(sMsg, node);
                    // Start the TTS queue timer
                    node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);

                }).catch(err => {
                    node.setNodeStatus({ fill: "red", shape: "dot", text: node.sSonosIPAddress + " Error pausing: " + err });
                    // 15/11/2019 Workaround for grouping
                    var sMsg = node.aMessageQueue[0];
                    node.aMessageQueue.splice(0, 1); // Remove the TTS message from the queue
                    node.sPollyState = "transitioning";
                    node.sSonosPlayState = "transitioning";
                    // Create the TTS mp3 with Polly
                    Leggi(sMsg, node);

                    // Set  timeout
                    node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);
                });

            } else {
                // Reset status
                node.setNodeStatus({ fill: "green", shape: "dot", text: "" + node.sSonosPlayState });
                // Start the TTS queue timer
                node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);

            }

        } else {
            // Start the TTS queue timer
            node.oTimer = setTimeout(function () { HandleQueue(node); }, 500);

            // 07/05/2019 Check if i have ended playing the queue as well
            if (node.msg.completed == false && node.sSonosPlayState == "stopped") {
                node.msg.completed = true;
                node.ungroupSpeakers(); // 20/03/2020 Ungroup Speakers
                node.send(node.msg);
                node.setNodeStatus({ fill: "green", shape: "ring", text: "" + node.sSonosPlayState });
            }

        }
    }



    // Reas the text via Polly
    function Leggi(msg, node) {

        // Play directly files starting with http://
        if (msg.toLowerCase().startsWith("http://")) {
            RED.log.info('SonosPollyTTS: Leggi HTTP filename: ' + msg);
            PlaySonos(msg, node);
            return;
        }

        // 27/02/2020 Handling OwnFile
        if (msg.indexOf("OwnFile_") !== -1) {
            RED.log.info('SonosPollyTTS: OwnFile .MP3, skip polly, filename: ' + msg);
            var newPath = node.userDir + "/ttspermanentfiles/" + msg;
            PlaySonos(newPath, node);
            return;
        }

        // 09/03/2020 Handling Hailing_ files
        if (msg.indexOf("Hailing_") !== -1) {
            RED.log.info('SonosPollyTTS: Hailing .MP3, skip polly, filename: ' + msg);
            var newPath = node.userDir + "/hailingpermanentfiles/" + msg;
            PlaySonos(newPath, node);
            return;
        }

        // Otherwise, it's a TTS
        var outputFormat = "mp3";
        var filename = getFilename(msg, node.iVoice, node.ssml, outputFormat);

        // Get real filename, codified.
        filename = node.userDir + "/ttsfiles/" + filename;

        // Check if cached
        if (fs.existsSync(filename)) {
            node.setNodeStatus({ fill: 'green', shape: 'ring', text: 'from cache' });
            RED.log.info('SonosPollyTTS: DEBUG - fromcache : ' + filename);
            PlaySonos(filename, node);
            return;
        }

        // Not cached
        node.setNodeStatus({ fill: 'yellow', shape: 'dot', text: 'asking online' });

        var params = {
            OutputFormat: outputFormat,
            SampleRate: '22050',
            Text: msg,
            TextType: node.ssml ? 'ssml' : 'text',
            VoiceId: node.iVoice
        };

        var polly = node.Pollyconfig.polly;
        synthesizeSpeech([polly, params]).then(data => { return [filename, data.AudioStream]; }).then(cacheSpeech).then(function () {
            // Play
            PlaySonos(filename, node);

        }).catch(error => { notifyError(node, filename, error); });

    }

    function synthesizeSpeech([polly, params]) {
        return new Promise((resolve, reject) => {
            polly.synthesizeSpeech(params, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    function cacheSpeech([path, data]) {
        return new Promise((resolve, reject) => {
            //RED.log.info("cacheSpeech path " + path);
            fs.writeFile(path, data, function (err) {
                if (err !== null) return reject(err);
                resolve();
            });
        });
    }

    function getFilename(text, _iVoice, isSSML, extension) {
        // Slug the text.
        var basename = slug(text);

        var ssml_text = isSSML ? '_ssml' : '';

        // Filename format: "text_voice.mp3"
        var filename = util.format('%s_%s%s.%s', basename, _iVoice, ssml_text, extension);

        // If filename is too long, cut it and add hash
        if (filename.length > 250) {
            var hash = MD5(basename);

            // Filename format: "text_hash_voice.mp3"
            var ending = util.format('_%s_%s%s.%s', hash, _iVoice, ssml_text, extension);
            var beginning = basename.slice(0, 250 - ending.length);

            filename = beginning + ending;
        }

        return filename;
    }

    function notifyError(node, msg, err) {
        var errorMessage = err.message;
        // Output error to console
        //RED.log.error('SonosPollyTTS synthesizeSpeech: ' + errorMessage);
        // Mark node as errounous
        node.setNodeStatus({
            fill: 'red',
            shape: 'dot',
            text: 'Error: ' + errorMessage
        });
        node.sPollyState == "criticalwriting";
        // RED.log.error('SonosPollyTTS: notifyError - unable to write TTS file. Check user permissions');
        RED.log.error('SonosPollyTTS: notifyError - msg: ' + msg + ' error: ' + errorMessage);
        // Set error in message
        msg.error = errorMessage;

    }





    // ---------------------- SONOS ----------------------------
    function PlaySonos(_songuri, node) {

        var sUrl = "";

        // Play directly files starting with http://
        if (_songuri.toLowerCase().startsWith("http://")) {
            sUrl = _songuri;
        } else {
            sUrl = node.sNoderedURL + "/tts/tts.mp3?f=" + encodeURIComponent(_songuri);
        }

        node.SonosClient.setVolume(node.sSonosVolume).then(success => {
            node.SonosClient.setAVTransportURI(sUrl).then(playing => {

                // Polly has ended downloading file
                node.sPollyState = "done";
                // Signalling
                node.setNodeStatus({
                    fill: 'green',
                    shape: 'dot',
                    text: 'Playing'
                });

            }).catch(err => {
                // Polly has ended downloading file
                node.sPollyState = "done";
                // Signalling
                node.setNodeStatus({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Error Transport'
                });
            });
        });



    }

    // 27/11/2019 Check Sonos connection healt
    function CheckSonosConnection(node) {

        node.SonosClient.getCurrentState().then(state => {

            node.SonosClient.currentTrack().then(track => {

                // 27/11/2019 Set node output to signal connectio error
                if (node.msg.connectionerror == true) {
                    node.setNodeStatus({ fill: "green", shape: "ring", text: "Sonos is connected." });
                    node.msg.connectionerror = false;
                    node.send({ "connectionerror": node.msg.connectionerror });
                }
                node.oTimerSonosConnectionCheck = setTimeout(function () { CheckSonosConnection(node); }, 2000);

            }).catch(err => {

                // 27/11/2019 Set node output to signal connectio error
                if (node.msg.connectionerror == false) {
                    node.setNodeStatus({ fill: "red", shape: "dot", text: "Sonos connection is DOWN: " + err });
                    node.msg.connectionerror = true;
                    node.send({ "connectionerror": node.msg.connectionerror });
                }
                node.oTimerSonosConnectionCheck = setTimeout(function () { CheckSonosConnection(node); }, 2000);

            });


        }).catch(err => {

            // 27/11/2019 Set node output to signal connectio error
            if (node.msg.connectionerror == false) {
                node.setNodeStatus({ fill: "red", shape: "dot", text: "Sonos connection is DOWN: " + err });
                node.msg.connectionerror = true;
                node.send({ "connectionerror": node.msg.connectionerror });
            }
            node.oTimerSonosConnectionCheck = setTimeout(function () { CheckSonosConnection(node); }, 2000);

        });

    }



}
