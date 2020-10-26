module.exports = function (RED) {
    'use strict';

    var AWS = require('aws-sdk');
    var fs = require('fs');
    var MD5 = require('crypto-js').MD5;
    var util = require('util');
    var path = require('path');
    const sonos = require('sonos');
 

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
        sRet = sRet.toString().replace(/\//g, "_sl_");
        sRet = sRet.toString().replace(/\'/g, "_ap_");
        sRet = sRet.toString().replace(/\=/g, "_ug_");
        sRet = sRet.toString().replace(/\\/g, "_bs_");
        sRet = sRet.toString().replace(/\(/g, "_pa_");
        sRet = sRet.toString().replace(/\)/g, "_pc_");
        sRet = sRet.toString().replace(/\*/g, "_as_");
        sRet = sRet.toString().replace(/\[/g, "_qa_");
        sRet = sRet.toString().replace(/\]/g, "_qc_");
        sRet = sRet.toString().replace(/\^/g, "_fu_");
        sRet = sRet.toString().replace(/\|/g, "_pi_");
        sRet = sRet.toString().replace(/\"/g, "_dc_");
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


    // 26/10/2020 Check for path and create it if doens't exists
    function setupDirectory(_aPath) {

        if (!fs.existsSync(_aPath)) {
            // Create the path
            try {
                fs.mkdirSync(_aPath);
                return true;
            } catch (error) { return false; }
        } else {
            return true;
        }
    }


    // Node Register
    function PollyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.server = RED.nodes.getNode(config.config)
        node.sPollyState = "done";
        node.iTimeoutPollyState = 0;
        node.aMessageQueue = []; // Array of incoming TTS messages
        node.SonosClient;
        node.voiceId;
        node.oTimer;
        node.oTimerSonosConnectionCheck;
        node.sSonosVolume; // Sonos Volume
        node.sSonosPlayState = "stopped"; // Play state
        node.sSonosTrackTitle = ""; // Track title
        node.sSonosIPAddress = "";
        node.sSonosCoordinatorGroupName = "";
        node.sonoshailing = "0"; // Hailing file
        node.msg = {}; // 08/05/2019 Node message
        node.msg.completed = true;
        node.msg.connectionerror = true;
        node.userDir = path.join(RED.settings.userDir, "sonospollyttsstorage"); // 09/03/2020 Storage of sonospollytts (otherwise, at each upgrade to a newer version, the node path is wiped out and recreated, loosing all custom files)
        node.oAdditionalSonosPlayers = []; // 20/03/2020 Contains other players to be grouped
        node.rules = config.rules || [{}];
        node.sNoderedURL = "";
        if (typeof node.server !== "undefined" && node.server !== null) {
            node.sNoderedURL = node.server.sNoderedURL || "";
        }

        // 20/11/2019 Used to call the status update
        node.setNodeStatus = ({ fill, shape, text }) => {
            try {
                var dDate = new Date();
                node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" });
            } catch (error) { }

        }

        // 27/11/2019 Check Sonos connection healt
        node.CheckSonosConnection = () => {

            node.SonosClient.getCurrentState().then(state => {
                node.SonosClient.currentTrack().then(track => {
                    // 27/11/2019 Set node output to signal connectio error
                    if (node.msg.connectionerror == true) {
                        node.setNodeStatus({ fill: "green", shape: "ring", text: "Sonos is connected." });
                        node.msg.connectionerror = false;
                        node.send({ "connectionerror": node.msg.connectionerror });
                    }
                    node.oTimerSonosConnectionCheck = setTimeout(function () { node.CheckSonosConnection(); }, 2000);

                }).catch(err => {
                    node.flushQueue();
                    // 27/11/2019 Set node output to signal connectio error
                    if (node.msg.connectionerror == false) {
                        node.setNodeStatus({ fill: "red", shape: "dot", text: "Sonos connection is DOWN: " + err });
                        node.msg.connectionerror = true;
                        node.send({ "connectionerror": node.msg.connectionerror });
                    }
                    node.oTimerSonosConnectionCheck = setTimeout(function () { node.CheckSonosConnection(); }, 2000);

                });


            }).catch(err => {
                node.flushQueue();
                // 27/11/2019 Set node output to signal connectio error
                if (node.msg.connectionerror == false) {
                    node.setNodeStatus({ fill: "red", shape: "dot", text: "Sonos connection is DOWN: " + err });
                    node.msg.connectionerror = true;
                    node.send({ "connectionerror": node.msg.connectionerror });
                }
                node.oTimerSonosConnectionCheck = setTimeout(function () { node.CheckSonosConnection(); }, 2000);

            });

        }

        // 03/06/2019 you can select the temp dir
        if (!setupDirectory(node.userDir)) {
            RED.log.error('SonosPollyTTS: Unable to set up MAIN directory: ' + node.userDir);
        }
        if (!setupDirectory(path.join(node.userDir, "ttsfiles"))) {
            RED.log.error('SonosPollyTTS: Unable to set up cache directory: ' + path.join(node.userDir, "ttsfiles"));
        } else {
            RED.log.info('SonosPollyTTS: TTS cache set to ' + path.join(node.userDir, "ttsfiles"));
        }
        if (!setupDirectory(path.join(node.userDir, "hailingpermanentfiles"))) {
            RED.log.error('SonosPollyTTS: Unable to set up hailing directory: ' + path.join(node.userDir, "hailingpermanentfiles"));
        } else {
            RED.log.info('SonosPollyTTS: hailing path set to ' + path.join(node.userDir, "hailingpermanentfiles"));
            // 09/03/2020 Copy defaults to the userDir
            fs.readdirSync(path.join(__dirname, "hailingpermanentfiles")).forEach(file => {
                try {
                    fs.copyFileSync(path.join(__dirname, "hailingpermanentfiles", file), path.join(node.userDir, "hailingpermanentfiles", file));
                } catch (error) { }
            });
        }
        if (!setupDirectory(path.join(node.userDir, "ttspermanentfiles"))) {
            RED.log.error('SonosPollyTTS: Unable to set up permanent files directory: ' + path.join(node.userDir, "ttspermanentfiles"));
        } else {
            RED.log.info('SonosPollyTTS: permanent files path set to ' + path.join(node.userDir, "ttspermanentfiles"));
            // 09/03/2020 // Copy the samples of permanent files into the userDir
            fs.readdirSync(path.join(__dirname, "ttspermanentfiles")).forEach(file => {
                try {
                    fs.copyFileSync(path.join(__dirname, "ttspermanentfiles", file), path.join(node.userDir, "ttspermanentfiles", file));
                } catch (error) { }
            });
        }


        // Set ssml
        node.ssml = config.ssml;

        node.Pollyconfig = RED.nodes.getNode(config.config);

        node.sSonosIPAddress = config.sonosipaddress.trim();

        if (!node.Pollyconfig) {
            RED.log.error('Missing Polly config');
            return;
        }

        // 26/10/2020 Set the voice
        // Backward compatibility, to remove in the future
        // °°°°°°°°°°°°°
        var voices = {
            '0': {
                Gender: 'Female',
                Id: 'Joanna',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Joanna',
                Engine: 'standard'
            },
            '1': {
                Gender: 'Female',
                Id: 'Mizuki',
                LanguageCode: 'ja-JP',
                LanguageName: 'Japanese',
                Name: 'Mizuki',
                Engine: 'standard'
            },
            '2': {
                Gender: 'Female',
                Id: 'Filiz',
                LanguageCode: 'tr-TR',
                LanguageName: 'Turkish',
                Name: 'Filiz',
                Engine: 'standard'
            },
            '3': {
                Gender: 'Female',
                Id: 'Astrid',
                LanguageCode: 'sv-SE',
                LanguageName: 'Swedish',
                Name: 'Astrid',
                Engine: 'standard'
            },
            '4': {
                Gender: 'Male',
                Id: 'Maxim',
                LanguageCode: 'ru-RU',
                LanguageName: 'Russian',
                Name: 'Maxim',
                Engine: 'standard'
            },
            '5': {
                Gender: 'Female',
                Id: 'Tatyana',
                LanguageCode: 'ru-RU',
                LanguageName: 'Russian',
                Name: 'Tatyana',
                Engine: 'standard'
            },
            '6': {
                Gender: 'Female',
                Id: 'Carmen',
                LanguageCode: 'ro-RO',
                LanguageName: 'Romanian',
                Name: 'Carmen',
                Engine: 'standard'
            },
            '7': {
                Gender: 'Female',
                Id: 'Ines',
                LanguageCode: 'pt-PT',
                LanguageName: 'Portuguese',
                Name: 'Inês',
                Engine: 'standard'
            },
            '8': {
                Gender: 'Male',
                Id: 'Cristiano',
                LanguageCode: 'pt-PT',
                LanguageName: 'Portuguese',
                Name: 'Cristiano',
                Engine: 'standard'
            },
            '9': {
                Gender: 'Female',
                Id: 'Vitoria',
                LanguageCode: 'pt-BR',
                LanguageName: 'Brazilian Portuguese',
                Name: 'Vitória',
                Engine: 'standard'
            },
            '10': {
                Gender: 'Male',
                Id: 'Ricardo',
                LanguageCode: 'pt-BR',
                LanguageName: 'Brazilian Portuguese',
                Name: 'Ricardo',
                Engine: 'standard'
            },
            '11': {
                Gender: 'Female',
                Id: 'Maja',
                LanguageCode: 'pl-PL',
                LanguageName: 'Polish',
                Name: 'Maja',
                Engine: 'standard'
            },
            '12': {
                Gender: 'Male',
                Id: 'Jan',
                LanguageCode: 'pl-PL',
                LanguageName: 'Polish',
                Name: 'Jan',
                Engine: 'standard'
            },
            '13': {
                Gender: 'Female',
                Id: 'Ewa',
                LanguageCode: 'pl-PL',
                LanguageName: 'Polish',
                Name: 'Ewa',
                Engine: 'standard'
            },
            '14': {
                Gender: 'Male',
                Id: 'Ruben',
                LanguageCode: 'nl-NL',
                LanguageName: 'Dutch',
                Name: 'Ruben',
                Engine: 'standard'
            },
            '15': {
                Gender: 'Female',
                Id: 'Lotte',
                LanguageCode: 'nl-NL',
                LanguageName: 'Dutch',
                Name: 'Lotte',
                Engine: 'standard'
            },
            '16': {
                Gender: 'Female',
                Id: 'Liv',
                LanguageCode: 'nb-NO',
                LanguageName: 'Norwegian',
                Name: 'Liv',
                Engine: 'standard'
            },
            '17': {
                Gender: 'Male',
                Id: 'Giorgio',
                LanguageCode: 'it-IT',
                LanguageName: 'Italian',
                Name: 'Giorgio',
                Engine: 'standard'
            },
            '18': {
                Gender: 'Female',
                Id: 'Carla',
                LanguageCode: 'it-IT',
                LanguageName: 'Italian',
                Name: 'Carla',
                Engine: 'standard'
            },
            '19': {
                Gender: 'Male',
                Id: 'Karl',
                LanguageCode: 'is-IS',
                LanguageName: 'Icelandic',
                Name: 'Karl',
                Engine: 'standard'
            },
            '20': {
                Gender: 'Female',
                Id: 'Dora',
                LanguageCode: 'is-IS',
                LanguageName: 'Icelandic',
                Name: 'Dóra',
                Engine: 'standard'
            },
            '21': {
                Gender: 'Male',
                Id: 'Mathieu',
                LanguageCode: 'fr-FR',
                LanguageName: 'French',
                Name: 'Mathieu',
                Engine: 'standard'
            },
            '22': {
                Gender: 'Female',
                Id: 'Celine',
                LanguageCode: 'fr-FR',
                LanguageName: 'French',
                Name: 'Céline',
                Engine: 'standard'
            },
            '23': {
                Gender: 'Female',
                Id: 'Chantal',
                LanguageCode: 'fr-CA',
                LanguageName: 'Canadian French',
                Name: 'Chantal',
                Engine: 'standard'
            },
            '24': {
                Gender: 'Female',
                Id: 'Penelope',
                LanguageCode: 'es-US',
                LanguageName: 'US Spanish',
                Name: 'Penélope',
                Engine: 'standard'
            },
            '25': {
                Gender: 'Male',
                Id: 'Miguel',
                LanguageCode: 'es-US',
                LanguageName: 'US Spanish',
                Name: 'Miguel',
                Engine: 'standard'
            },
            '26': {
                Gender: 'Male',
                Id: 'Enrique',
                LanguageCode: 'es-ES',
                LanguageName: 'Castilian Spanish',
                Name: 'Enrique',
                Engine: 'standard'
            },
            '27': {
                Gender: 'Female',
                Id: 'Conchita',
                LanguageCode: 'es-ES',
                LanguageName: 'Castilian Spanish',
                Name: 'Conchita',
                Engine: 'standard'
            },
            '28': {
                Gender: 'Male',
                Id: 'Geraint',
                LanguageCode: 'en-GB-WLS',
                LanguageName: 'Welsh English',
                Name: 'Geraint',
                Engine: 'standard'
            },
            '29': {
                Gender: 'Female',
                Id: 'Salli',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Salli',
                Engine: 'standard'
            },
            '30': {
                Gender: 'Female',
                Id: 'Kimberly',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Kimberly',
                Engine: 'standard'
            },
            '31': {
                Gender: 'Female',
                Id: 'Kendra',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Kendra',
                Engine: 'standard'
            },
            '32': {
                Gender: 'Male',
                Id: 'Justin',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Justin',
                Engine: 'standard'
            },
            '33': {
                Gender: 'Male',
                Id: 'Joey',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Joey',
                Engine: 'standard'
            },
            '34': {
                Gender: 'Female',
                Id: 'Ivy',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Ivy',
                Engine: 'standard'
            },
            '35': {
                Gender: 'Female',
                Id: 'Raveena',
                LanguageCode: 'en-IN',
                LanguageName: 'Indian English',
                Name: 'Raveena',
                Engine: 'standard'
            },
            '36': {
                Gender: 'Female',
                Id: 'Emma',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Emma',
                Engine: 'standard'
            },
            '37': {
                Gender: 'Male',
                Id: 'Brian',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Brian',
                Engine: 'standard'
            },
            '38': {
                Gender: 'Female',
                Id: 'Amy',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Amy',
                Engine: 'standard'
            },
            '39': {
                Gender: 'Male',
                Id: 'Russell',
                LanguageCode: 'en-AU',
                LanguageName: 'Australian English',
                Name: 'Russell',
                Engine: 'standard'
            },
            '40': {
                Gender: 'Female',
                Id: 'Nicole',
                LanguageCode: 'en-AU',
                LanguageName: 'Australian English',
                Name: 'Nicole',
                Engine: 'standard'
            },
            '41': {
                Gender: 'Female',
                Id: 'Marlene',
                LanguageCode: 'de-DE',
                LanguageName: 'German',
                Name: 'Marlene',
                Engine: 'standard'
            },
            '42': {
                Gender: 'Male',
                Id: 'Hans',
                LanguageCode: 'de-DE',
                LanguageName: 'German',
                Name: 'Hans',
                Engine: 'standard'
            },
            '43': {
                Gender: 'Female',
                Id: 'Naja',
                LanguageCode: 'da-DK',
                LanguageName: 'Danish',
                Name: 'Naja',
                Engine: 'standard'
            },
            '44': {
                Gender: 'Male',
                Id: 'Mads',
                LanguageCode: 'da-DK',
                LanguageName: 'Danish',
                Name: 'Mads',
                Engine: 'standard'
            },
            '45': {
                Gender: 'Female',
                Id: 'Gwyneth',
                LanguageCode: 'cy-GB',
                LanguageName: 'Welsh',
                Name: 'Gwyneth',
                Engine: 'standard'
            },
            '46': {
                Gender: 'Male',
                Id: 'Jacek',
                LanguageCode: 'pl-PL',
                LanguageName: 'Polish',
                Name: 'Jacek',
                Engine: 'standard'
            },
            '47': {
                Gender: 'Male',
                Id: 'Matthew',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Matthew',
                Engine: 'standard'
            },
            '48': {
                Gender: 'Male',
                Id: 'Matthew',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Matthew (neural)',
                Engine: 'neural'
            },
            '49': {
                Gender: 'Female',
                Id: 'Amy',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Amy (neural)',
                Engine: 'neural'
            },
            '50': {
                Gender: 'Female',
                Id: 'Emma',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Emma (neural)',
                Engine: 'neural'
            },
            '51': {
                Gender: 'Male',
                Id: 'Brian',
                LanguageCode: 'en-GB',
                LanguageName: 'British English',
                Name: 'Brian (neural)',
                Engine: 'neural'
            },
            '52': {
                Gender: 'Female',
                Id: 'Ivy',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Ivy (neural)',
                Engine: 'neural'
            },
            '53': {
                Gender: 'Female',
                Id: 'Joanna',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Joanna (neural)',
                Engine: 'neural'
            },
            '54': {
                Gender: 'Female',
                Id: 'Kendra',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Kendra (neural)',
                Engine: 'neural'
            },
            '55': {
                Gender: 'Female',
                Id: 'Kimberly',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Kimberly (neural)',
                Engine: 'neural'
            },
            '56': {
                Gender: 'Female',
                Id: 'Salli',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Salli (neural)',
                Engine: 'neural'
            },
            '57': {
                Gender: 'Male',
                Id: 'Joey',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Joey (neural)',
                Engine: 'neural'
            },
            '58': {
                Gender: 'Male',
                Id: 'Justin',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Justin (neural)',
                Engine: 'neural'
            },
            '59': {
                Gender: 'Male',
                Id: 'Kevin',
                LanguageCode: 'en-US',
                LanguageName: 'US English',
                Name: 'Kevin (neural)',
                Engine: 'neural'
            },
            '60': {
                Gender: 'Female',
                Id: 'Camila',
                LanguageCode: 'pt-BR',
                LanguageName: 'Brazilian Portuguese',
                Name: 'Camila (neural)',
                Engine: 'neural'
            },
            '61': {
                Gender: 'Female',
                Id: 'Lupe',
                LanguageCode: 'es-US',
                LanguageName: 'US Spanish',
                Name: 'Lupe (neural)',
                Engine: 'neural'
            }
        };
        // °°°°°°°°°°°°°
        node.voiceId = (!isNaN(config.voice) ? voices[config.voice].Id : config.voice); // Transform the old number in a new voice ID, by choiching Ivy as default

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
        node.oTimer = setTimeout(function () { HandleQueue(); }, 5000);

        // 27/11/2019 Start the connection healty check
        node.oTimerSonosConnectionCheck = setTimeout(function () { node.CheckSonosConnection(); }, 5000);

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
                    // 24/09/2020 Set Volume of each device in the group
                    try {
                        element.setVolume(node.sSonosVolume).then(success => {
                            // element.getVolume().then(sVol => {
                            //     RED.log.warn('SonosPollyTTS: get volume of grouped device: ' + JSON.stringify(sVol));
                            // }).catch(err => { });
                        }).catch(err => { });
                    } catch (error) { }
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

            if (!msg.hasOwnProperty("payload")) {
                notifyError(msg, 'msg.payload must be of type String');
                return;
            }

            try {
                node.setNodeStatus({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'Processing ' + msg.payload
                });
            } catch (error) { }

            // 17/04/2019 Verifico se possso mandare in play l'hailing
            if (msg.hasOwnProperty("nohailing") && (msg.nohailing == "1" || msg.nohailing.toLowerCase() == "true")) {
                node.sonoshailing = "0";
            } else {
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
            }


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
                node.setNodeStatus({ fill: 'yellow', shape: 'dot', text: 'Queued Hail' });
            }

            // 26/10/2020 Add the message to the array, as string, otherwise it doe'snt work
            node.aMessageQueue.push(msg.payload.toString());
            node.setNodeStatus({ fill: 'yellow', shape: 'dot', text: 'Queued ' + msg.payload });

        });

        node.on('close', function (done) {
            clearTimeout(node.oTimer);
            clearTimeout(node.oTimerSonosConnectionCheck);
            node.SonosClient.stop().then(() => {
                node.ungroupSpeakers();
            });
            node.msg.completed = true;
            node.send(node.msg);
            node.setNodeStatus({ fill: "green", shape: "ring", text: "Shutdown" });
            node.flushQueue();
            // 11/11/2019 Close the Webserver
            try {
                node.oWebserver.close(function () { RED.log.info("SonosPollyTTS: Webserver UP. Closing down."); });
            } catch (error) {

            }
            setTimeout(function () {
                // Wait some time to allow time to do promises.
                done();
            }, 1000);
        });


        // Handle the queue
        function HandleQueue() {

            // 06/05/2019 check if the SonosClient is already instantiate (an error can occur if a very slow PC is used)
            if (node.SonosClient == null) {
                RED.log.info('SonosPollyTTS: InfoHandleQueue0 SonosClient not instantiate. Retry later...');
                node.oTimer = setTimeout(function () { HandleQueue(); }, 5000);
                return;
            }

            // try {
            //     node.setNodeStatus({ fill: "yellow", shape: "dot", text: "Queue: " + node.sPollyState });
            // } catch (error) { }

            if (node.sPollyState == "transitioning") {
                node.iTimeoutPollyState += 1; // Increase Timeout
                if (node.iTimeoutPollyState > 15) {
                    node.iTimeoutPollyState = 0;
                    node.sPollyState = "done";
                    RED.log.info('SonosPollyTTS: HandleQueue - Polly is in downloading Timeout');
                    node.setNodeStatus({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'SonosPollyTTS: HandleQueue - Polly is in downloading Timeout'
                    });
                    node.sSonosPlayState = "stopped";
                    node.oTimer = setTimeout(function () { HandleQueue(); }, 1000);
                    return;
                }

                // Not cached
                node.setNodeStatus({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'downloading'
                });
                RED.log.info('SonosPollyTTS: HandleQueue - Polly is downloading the file, exit');
                node.oTimer = setTimeout(function () { HandleQueue(); }, 500);
                return;


            } else {
                node.iTimeoutPollyState = 0; // Reset Timer
            }

            // 06/05/2019 moved the code into the "try" 
            try {

                node.SonosClient.getCurrentState().then(state => {
                    node.sSonosPlayState = state;
                    node.SonosClient.currentTrack().then(track => {
                        node.sSonosTrackTitle = track.uri;
                        HandleQueue2();
                        node.oTimer = setTimeout(function () { HandleQueue(); }, 500);
                        return;
                    }).catch(err => {
                        node.flushQueue();
                        node.oTimer = setTimeout(function () { HandleQueue(); }, 2000);
                    }); // node.SonosClient.currentTrack().then(track=>{


                }).catch(err => {
                    node.setNodeStatus({ fill: "red", shape: "dot", text: "err currstate: " + err });
                    node.flushQueue();
                    node.oTimer = setTimeout(function () { HandleQueue(); }, 2000);
                }); // node.SonosClient.getCurrentState().then(state=>{
            } catch (error) {

                // 06/05/2019 restart timer. To be removed if the try catch is removed as well.
                RED.log.info('SonosPollyTTS: errHandleQueue1 ' + error.toString());
                node.flushQueue();
                node.oTimer = setTimeout(function () { HandleQueue(); }, 2000);
            }

        }

        // 22/09/2020 Flush Queue and set to stopped
        node.flushQueue = () => {
            // 10/04/2018 Remove the TTS message from the queue
            if (node.aMessageQueue.length > 0) {
                node.aMessageQueue = [];
            }
            node.sSonosPlayState = "stopped";
            node.sSonosTrackTitle = "stopped";
            node.sPollyState = "done"
        }

        // Handle queue 2 
        function HandleQueue2() {

            // Play next msg
            if (node.aMessageQueue.length > 0) {

                try {
                    node.setNodeStatus({ fill: "yellow", shape: "dot", text: "HandleQueue2: " + node.aMessageQueue.length });
                } catch (error) { }

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
                    Leggi(sMsg);

                } else if (node.sSonosPlayState == "playing" && node.sSonosTrackTitle.toLocaleLowerCase().indexOf(".mp3") == -1) {

                    //RED.log.info('SonosPollyTTS: HandleQueue2 - stopping: ' + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);

                    // It's playing something. Stop
                    node.SonosClient.pause().then(success => {
                        //RED.log.info('SonosPollyTTS: HandleQueue2 - stopped: ' + success + " " + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);
                        try {
                            var sMsg = node.aMessageQueue[0];
                            node.aMessageQueue.splice(0, 1); // Remove the TTS message from the queue
                        } catch (error) {
                        }
                        // Create the TTS mp3 with Polly
                        node.sPollyState = "transitioning";
                        node.sSonosPlayState = "transitioning";
                        Leggi(sMsg);

                    }).catch(err => {
                        try {
                            node.setNodeStatus({ fill: "red", shape: "dot", text: node.sSonosIPAddress + " Error pausing: " + err });
                        } catch (error) { }

                        // 15/11/2019 Workaround for grouping
                        try {
                            var sMsg = node.aMessageQueue[0];
                            node.aMessageQueue.splice(0, 1); // Remove the TTS message from the queue
                        } catch (error) {
                        }
                        // Create the TTS mp3 with Polly
                        node.sPollyState = "transitioning";
                        node.sSonosPlayState = "transitioning";
                        Leggi(sMsg);
                    });

                } else {
                    // Reset status
                    node.setNodeStatus({ fill: "green", shape: "dot", text: "" + node.sSonosPlayState });
                }

            } else {

                // 07/05/2019 Check if i have ended playing the queue as well
                try {
                    if (node.msg.completed == false && node.sSonosPlayState == "stopped") {
                        node.msg.completed = true;
                        node.ungroupSpeakers(); // 20/03/2020 Ungroup Speakers
                        node.send(node.msg);
                        node.setNodeStatus({ fill: "green", shape: "ring", text: "" + node.sSonosPlayState });
                    }
                } catch (error) { }

            }
        }

        // Reas the text via Polly
        function Leggi(msg) {

            try {
                node.setNodeStatus({ fill: "yellow", shape: "dot", text: "Leggi: " + msg });
            } catch (error) { }

            // Play directly files starting with http://
            if (msg.toLowerCase().startsWith("http://") || msg.toLowerCase().startsWith("https://")) {
                RED.log.info('SonosPollyTTS: Leggi HTTP filename: ' + msg);
                PlaySonos(msg, node);
                return;
            }

            // 27/02/2020 Handling OwnFile
            if (msg.indexOf("OwnFile_") !== -1) {
                RED.log.info('SonosPollyTTS: OwnFile .MP3, skip polly, filename: ' + msg);
                var newPath = path.join(node.userDir, "ttspermanentfiles", msg);
                PlaySonos(newPath, node);
                return;
            }

            // 09/03/2020 Handling Hailing_ files
            if (msg.indexOf("Hailing_") !== -1) {
                RED.log.info('SonosPollyTTS: Hailing .MP3, skip polly, filename: ' + msg);
                var newPath = path.join(node.userDir, "hailingpermanentfiles", msg);
                PlaySonos(newPath, node);
                return;
            }

            // Otherwise, it's a TTS
            var outputFormat = "mp3";
            var filename = getFilename(msg, node.voiceId, node.ssml, outputFormat);

            // Get real filename, codified.
            filename = path.join(node.userDir, "ttsfiles", filename);

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
                VoiceId: node.voiceId
            };

            var polly = node.Pollyconfig.polly;
            synthesizeSpeech([polly, params]).then(data => { return [filename, data.AudioStream]; }).then(cacheSpeech).then(function () {
                // Play
                PlaySonos(filename, node);

            }).catch(error => { notifyError(filename, error); });

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

        function notifyError(msg, err) {
            var errorMessage = err.message;
            // Output error to console
            //RED.log.error('SonosPollyTTS synthesizeSpeech: ' + errorMessage);
            // Mark node as errounous
            node.setNodeStatus({
                fill: 'red',
                shape: 'dot',
                text: 'notifyError: ' + errorMessage
            });
            //node.sPollyState == "criticalwriting";
            // RED.log.error('SonosPollyTTS: notifyError - unable to write TTS file. Check user permissions');
            //RED.log.error('SonosPollyTTS: notifyError - msg: ' + msg + ' error: ' + errorMessage);
            // Set error in message
            msg.error = errorMessage;

        }





        // ---------------------- SONOS ----------------------------
        function PlaySonos(_songuri, node) {

            var sUrl = "";

            // Play directly files starting with http://
            if (_songuri.toLowerCase().startsWith("http://") || _songuri.toLowerCase().startsWith("https://")) {
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
                        text: 'Error Transport ' + err
                    });
                    node.sSonosPlayState = "stopped";
                });
            }).catch(err => {
                // Polly has ended downloading file
                node.sPollyState = "done";
                // Signalling
                node.setNodeStatus({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Error SetVolume ' + err
                });
                node.sSonosPlayState = "stopped";
            });



        }






    }
    RED.nodes.registerType('sonospollytts', PollyNode);


}
