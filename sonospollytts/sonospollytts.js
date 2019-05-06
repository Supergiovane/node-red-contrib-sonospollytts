module.exports = function(RED) {
    'use strict';

    var AWS = require('aws-sdk');
    var slug = require('slug');
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var MD5 = require('crypto-js').MD5;
    var util = require('util');
    var path = require('path');
    var pathExists = require('path-exists');
    var _ = require('lodash');
    var os = require('os'); // Retrieve the local IP
    const sonos = require('sonos');

   
    AWS.config.update({
        region: 'us-east-1'
    });

    slug.charmap['.'] = '_stop_';
    slug.charmap['?'] = '_qm_';
    slug.charmap['!'] = '_em_';
    slug.charmap[','] = '_pause_';
    slug.charmap[':'] = '_colon_';
    slug.charmap[';'] = '_semicolon_';
    slug.charmap['<'] = '_less_';
    slug.charmap['>'] = '_greater_';

    function setupDirectory(aPath) {
        try {
            return fs.statSync(aPath).isDirectory();
        } catch (e) {

            // Path does not exist
            if (e.code === 'ENOENT') {
                // Try and create it
                try {
                    mkdirp.sync(aPath);
                    RED.log.info('Created directory path: ' + aPath);
                    return true;
                } catch (e) {
                    RED.log.error('Failed to create path: ' + aPath);
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
        }
    };


    // Configuration Node Register
    function PollyConfigNode(config) {
        RED.nodes.createNode(this, config);

        RED.log.info('ConfigNode:' + config);

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
        node.sPollyState="done";
        node.iTimeoutPollyState=0;
        node.aMessageQueue=[]; // Array of incoming TTS messages
        node.SonosClient;
        node.iVoice;
        node.sNoderedURL; // Stores the node.red URL and port
        node.oTimer;
        node.sSonosVolume; // Sonos Volume
        node.sSonosPlayState="stopped"; // Play state
        node.sSonosTrackTitle=""; // Track title
        node.sSonosIPAddress="";
        node.sHailingFile=""; // Hailing file
        node.bNoHailing=false; // Dont't play Hailing music temporarely (from msg node ommand "nohailing="true")

        // Fixed temp dir
        config.dir="/tmp";
        if (!setupDirectory(config.dir)) {
            RED.log.info('Unable to set up cache directory: ' + config.dir + ". Revert to default " + __dirname);
            // Error, revert to the node path
            config.dir = __dirname;         
        }else{
            RED.log.info('Temp dir set to ' + config.dir);
        }
        this.dir = config.dir;
        
        // Set ssml
        this.ssml = config.ssml;

        this.Pollyconfig = RED.nodes.getNode(config.config);

        node.sSonosIPAddress=config.sonosipaddress.trim();
        
        if (!this.Pollyconfig) {
            RED.log.error('Missing Polly config');
            return;
        }

        // Set the voice
        node.iVoice = voices[config.voice].Id;

        // Store Noder-Red complete URL
        if (RED.settings.httpRoot=="/") {
            // Standard root path, do not add the / otherwise we'll have an error because of double "//"" in the sonos url
            node.sNoderedURL="http://"+ config.noderedipaddress.trim() + ":" + config.noderedport.trim(); // RED.settings.uiPort
        }else
        {
            // Add the httpRoot
            node.sNoderedURL="http://"+ config.noderedipaddress.trim() + ":" + config.noderedport.trim() + RED.settings.httpRoot;
        }
        
        RED.log.info('Node-Red URL: ' + node.sNoderedURL);
       
        // Create sonos client
        node.SonosClient = new sonos.Sonos(node.sSonosIPAddress);

        // Start the TTS queue timer
        node.oTimer=setTimeout(function(){HandleQueue(node);},5000);

        // Get default sonos volume
        node.sSonosVolume=config.sonosvolume;
        node.SonosClient.setVolume(node.sSonosVolume).then(volume => {}).catch(err => { 
             node.error(JSON.stringify(err));
             node.status({fill:"red", shape:"dot", text:"Error: failed to set volume"});
            });

        // Hook the Playstate event
        /* node.SonosClient.on('PlayState', state => {
            node.sSonosPlayState=state;
            RED.log.info('node.SonosClient.on Paystate: ' + node.sSonosPlayState);
        }); */

        // Hook the current track
        /* node.SonosClient.on('CurrentTrack', track => {
            node.sSonosTrackTitle=track.uri;//track.title;
            //RED.log.info('node.SonosClient.on CurrentTrack: ' + JSON.stringify(track));
            //RED.log.info('node.SonosClient.on CurrentTrack: ' + node.sSonosTrackTitle);
          });
 */
          // Downloads hailing.mp3
          // Check if the file already exist
        node.sHailingFile=config.sonoshailing;
        if (node.sHailingFile=="0") {
            // Remove the hailing.mp3 default file
           RED.log.info('Hailing disabled');
             /* pathExists(path.join(config.dir, "hailing.mp3")).then(res => {
                if (res) {fs.unlinkSync(path.join(config.dir, "hailing.mp3"));}
                }); */
            node.sHailingFile="";
        }else if (node.sHailingFile=="1") {
            node.sHailingFile="hailing.mp3";
        }else if (node.sHailingFile=="2") {
            node.sHailingFile="2.mp3";
        }else if (node.sHailingFile=="3") {
            node.sHailingFile="3.mp3";
        }else{
            node.sHailingFile="hailing.mp3";
        }
        
        if(node.sHailingFile!=""){
                RED.log.info("Moving hailing file " + node.sHailingFile + " to temp dir " + this.dir);
                // Is the temp dir the same as node dir?
                if (__dirname!=config.dir) {
                    // This line opens the file as a readable stream
                    var readStream = fs.createReadStream(__dirname +"/"+node.sHailingFile);

                    // This will wait until we know the readable stream is actually valid before piping
                    readStream.on('open', function () {
                        // This just pipes the read stream to the response object (which goes to the client)
                        readStream.pipe(fs.createWriteStream(path.join(config.dir, node.sHailingFile)));
                    });

                    // This catches any errors that happen while creating the readable stream (usually invalid names)
                    readStream.on('error', function(err) {
                        RED.log.info('Error moving hailing.mp3 to temp dir : ' + err);
                    });
                }
          }
          
          

        this.on('input', function(msg) {
            // 12/06/2018 Controllo se il payload è un'impostazione del volume
            if (_.isString(msg.volume)) {
                node.sSonosVolume=msg.volume;
            }  
            
            // 17/04/2019 Verifico se possso mandare in play l'hailing
            if (_.isString(msg.nohailing)) {
                if (msg.nohailing=="1" || msg.nohailing.toLowerCase()=="true")
                {
                    node.bNoHailing=true;
                }else
                {
                    node.bNoHailing=false;
                }                
            } else
            {
                node.bNoHailing=false;
            } 
            
            if(!_.isString(msg.payload)){
                notifyError(node, msg, 'msg.payload must be of type String');
                return;
            }


           // If the queue is empty and if i can play the Haniling, add the hailing file first
            if (node.aMessageQueue.length==0 && node.bNoHailing==false) {
                // If the field sonoshailing is not empty, add the hailing to the queue
                if (node.sHailingFile!="") {
                    node.aMessageQueue.push(node.sHailingFile);
                }
            }
             // Add the message to the array
            node.aMessageQueue.push(msg.payload);
 

        });

        this.on('close', function () {
            clearTimeout(node.oTimer);
        });
    }
    RED.nodes.registerType('sonospollytts', PollyNode);

    

    // Handle the queue
    function HandleQueue(node){
        // RED.log.info('node.sPollyState : ' + node.sPollyState);
        // RED.log.info('node.iTimeoutPollyState : ' + node.iTimeoutPollyState);
        // Check if Polly is downloading the file (in case the phrase is very long)

        // 06/05/2019 check if the SonosClient is already instantiate (an error can occur if a very slow PC is used)
        if (node.SonosClient==null) {
            RED.log.info('InfoHandleQueue0 SonosClient not instantiate. Retry later...');
            node.oTimer=setTimeout(function(){HandleQueue(node);},5000);
            return;
        } 

        if(node.sPollyState=="transitioning")
        {
            node.iTimeoutPollyState+=1; // Increase Timeout
            if (node.iTimeoutPollyState>15) {
                node.iTimeoutPollyState=0;
                node.sPollyState="idle";
                RED.log.info('HandleQueue - Polly is in downloading Timeout');
            } 

            // Not cached
            node.status({
                fill: 'yellow',
                shape: 'dot',
                text: 'downloading'});
            RED.log.info('HandleQueue - Polly is downloading the file, exit');
            node.oTimer=setTimeout(function(){HandleQueue(node);},1000);
            return;
        }else{
            node.iTimeoutPollyState=0; // Reset Timer
        }

        // 06/05/2019 moved the code into the "try" 
        try {

            node.SonosClient.getCurrentState().then(state=>{
                node.sSonosPlayState=state;
    
                //RED.log.info('DEBUG HandleQueue - node.sSonosPlayState=' + node.sSonosPlayState);
    
                node.SonosClient.currentTrack().then(track=>{
                    node.sSonosTrackTitle=track.uri;
                    HandleQueue2(node);
                }).catch(err=>{
                    node.status({fill:"red", shape:"dot", text:"err currtrack"});
                    node.sSonosTrackTitle="stopped"; // force stopped
                    HandleQueue2(node);
                }); // node.SonosClient.currentTrack().then(track=>{
                    
                
            }).catch(err=>{
                node.status({fill:"red", shape:"dot", text:"err currstate"});
                node.sSonosTrackTitle="stopped"; // force stopped
                //HandleQueue2(node);
    
                // 10/04/2018 Remove the TTS message from the queue
                if(node.aMessageQueue.length>0){
                    node.aMessageQueue=[];
                    RED.log.info('HandleQueue2 - error, flushed queue');
                }
                // Set  timeout
                node.oTimer=setTimeout(function(){HandleQueue(node);},500);
            
            }); // node.SonosClient.getCurrentState().then(state=>{
        } catch (error) {

            // 06/05/2019 restart timer. To be removed if the try catch is removed as well.
            // Set  timeout
            node.oTimer=setTimeout(function(){HandleQueue(node);},500);
            RED.log.info('errHandleQueue1 ' + error.toString());
       
        }
        
        
    }

    // Handle queue 2 
    function HandleQueue2(node){

        //RED.log.info('DEBUG HandleQueue2 - CheckState: ' + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);


        // Play next msg
        if (node.aMessageQueue.length>0) {
                
            // It's playing something. Check what's playing.
            // If Music, then stop the music and play the TTS message
            // If playing TTS message, waits until it's finished.
            if (node.sSonosPlayState=="stopped" || node.sSonosPlayState=="paused")
            {
                //RED.log.info('DEBUG HandleQueue2 - Punto 1 - CheckState: ' + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);

                var sMsg=node.aMessageQueue[0];
                //RED.log.info('DEBUG HandleQueue2 - Punto 2 - sMsg: ' + sMsg + " node.aMessageQueue.lenght:" + node.aMessageQueue.length);

                // Remove the TTS message from the queue
                node.aMessageQueue.splice(0,1);
                
                //RED.log.info('DEBUG HandleQueue2 - Punto 3 - sMsg: ' + sMsg + " node.aMessageQueue.lenght:" + node.aMessageQueue.length);

                node.sPollyState="transitioning"; 
                node.sSonosPlayState="transitioning";
                node.status({
                fill: 'yellow',
                shape: 'dot',
                text: 'preparing...'});
                // Create the TTS mp3 with Polly
                Leggi(sMsg,node);
                // Set  timeout
                node.oTimer=setTimeout(function(){HandleQueue(node);},500);
            
            
            
            }else if(node.sSonosPlayState=="playing" && node.sSonosTrackTitle.toLocaleLowerCase().indexOf(".mp3")==-1) {
                RED.log.info('HandleQueue2 - stopping: ' + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);
                
                // It's playing something. Stop
                node.SonosClient.pause().then(success=>{
                    RED.log.info('HandleQueue2 - stopped: ' + success + " " + node.sSonosPlayState + " Track:" + node.sSonosTrackTitle);

                    var sMsg=node.aMessageQueue[0];
                
                    // Remove the TTS message from the queue
                    node.aMessageQueue.splice(0,1);
                    
                    node.sPollyState="transitioning"; 
                    node.sSonosPlayState="transitioning";
                    // Create the TTS mp3 with Polly
                    Leggi(sMsg,node);
                    //node.SonosClient.flush().then(success=>{
                    // Start the TTS queue timer
                    node.oTimer=setTimeout(function(){HandleQueue(node);},500);
                    //});
                
                }).catch(err => { 
                    node.status({fill:"red", shape:"dot", text:"error pausing"});
                    // Set  timeout
                    node.oTimer=setTimeout(function(){HandleQueue(node);},500);
                });

            }else
            {
                // Reset status
                node.status({fill:"green", shape:"dot", text:"" + node.sSonosPlayState});
                // Start the TTS queue timer
                node.oTimer=setTimeout(function(){HandleQueue(node);},500);
                
            }
            
        }else{
            // Start the TTS queue timer
            node.oTimer=setTimeout(function(){HandleQueue(node);},500);
            node.status({fill:"green", shape:"dot", text:"ready"});
        }
    }



    // Reas the text via Polly
    function Leggi(msg,node)
    {
        
        // Play directly files starting with http://
        if (msg.toLowerCase().startsWith("http://")) {
            RED.log.info('Leggi HTTP filename: ' + msg);
            PlaySonos(msg,node); 
            return;
        }

        // If the msg contains a string .mp3, skip polly and go to Playsonos
        if(msg.indexOf(".mp3")!==-1){
            RED.log.info('Leggi .MP3 diretto e skip polly, filename: ' + msg);
            PlaySonos(path.join(node.dir, node.sHailingFile),node); 
            return;
        }
    
        
        // Otherwise, it's a TTS
        //RED.log.info('DEBUG - Leggi Punto 1 - TTS : ' + msg);
        var polly = node.Pollyconfig.polly;
        var outputFormat="mp3";
        var filename = getFilename(msg, node.iVoice, node.ssml, outputFormat);
        //RED.log.info('DEBUG - Leggi Punto 2 - filename : ' + filename);
        
        // Store it
        filename = path.join(node.dir, filename);
        //RED.log.info('DEBUG - Leggi Punto 3 - filename : ' + filename);

        // Check if cached
            pathExists(filename).then(res => {
            if (res) {
                // Cached
                // Play
                PlaySonos(filename,node);
                return;
                //return node.send([msg, null]);
            };

            // Not cached
            node.status({
            fill: 'yellow',
            shape: 'dot',
            text: 'requesting'});

        
        var params = {
            OutputFormat: outputFormat,
            SampleRate: '22050',
            Text: msg,
            TextType: node.ssml ? 'ssml' : 'text',
            VoiceId: node.iVoice
        };

        synthesizeSpeech([polly, params])
            .then(data => {
            return [filename, data.AudioStream];
        }).then(cacheSpeech).then(function() {
                // Success
                node.status({});
                //node.send([msg, null]);

                // Play
                PlaySonos(filename,node);


            }).catch(error => {
            notifyError(node, filename, error);
                });
         });
    }

    function synthesizeSpeech([polly, params]){
        return new Promise((resolve, reject) => {
            polly.synthesizeSpeech(params, function(err, data) {
            if (err !== null) {
                return reject(err);
            }

            resolve(data);
        });
    });
    }

    function cacheSpeech([path, data]){
        return new Promise((resolve, reject) => {
            //RED.log.info("cacheSpeech path " + path);
            fs.writeFile(path, data, function(err) {
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
        var errorMessage = _.isString(err) ? err : err.message;
        // Output error to console
        RED.log.error(errorMessage);
        // Mark node as errounous
        node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Error: ' + errorMessage
        });

        // Set error in message
        msg.error = errorMessage;

    }



   

// ---------------------- SONOS ----------------------------
function PlaySonos(_songuri,node){
    
    var sUrl="";

    // Play directly files starting with http://
    if (_songuri.toLowerCase().startsWith("http://")) {
        sUrl=_songuri;
    }else{
        sUrl= node.sNoderedURL + "/tts/tts.mp3?f=" + encodeURIComponent(_songuri);
    }

    node.SonosClient.setVolume(node.sSonosVolume).then(success => {
        node.SonosClient.setAVTransportURI(sUrl).then(playing => {
      
            // Polly has ended downloading file
            node.sPollyState="done";
             // Signalling
             node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Playing'
                });
    
            }).catch(err => { 
                // Polly has ended downloading file
                node.sPollyState="done";  
                 // Signalling
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Error Transport'
                });
        });
    });
    

}

    // 25/03/2019 Create the endpoint to listen to the tts. tts.mp3 is a dummy endpoint. Please see query.f
    // query.f contains the filename to be played.
    RED.httpAdmin.get("/tts/tts.mp3", function(req, res) {
        try {
            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;
            //res.download(query.f);
            
            //RED.log.info("Playsonos RED.httpAdmin search " + query.f);
            
            res.setHeader('Content-Disposition', 'attachment; filename=tts.mp3')
            if (fs.existsSync(query.f)) {
                var readStream = fs.createReadStream(query.f);
                readStream.pipe(res);
                res.end;
            }else
            {
                RED.log.info("Playsonos RED.httpAdmin file not found: " + query.f);
                res.write("File not found");
                res.end();
            }
            
        } catch (error) {
            RED.log.info("Playsonos RED.httpAdmin error: " + error + " on: " + query.f);
        }
        
    });

}
