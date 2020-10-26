module.exports = function (RED) {
    'use strict';

    var AWS = require('aws-sdk');
    var fs = require('fs');
    var path = require("path");

    AWS.config.update({
        region: 'us-east-1'
    });

    // Configuration Node Register
    function PollyConfigNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.noderedipaddress = typeof config.noderedipaddress === "undefined" ? "" : config.noderedipaddress;
        var params = {
            accessKeyId: node.credentials.accessKey,
            secretAccessKey: node.credentials.secretKey,
            apiVersion: '2016-06-10'
        };
        node.polly = new AWS.Polly(params);
        node.oWebserver; // 11/11/2019 Stores the Webserver
        node.purgediratrestart = config.purgediratrestart || "leave"; // 26/02/2020
        node.userDir = path.join(RED.settings.userDir , "sonospollyttsstorage"); // 09/03/2020 Storage of sonospollytts (otherwise, at each upgrade to a newer version, the node path is wiped out and recreated, loosing all custom files)
        node.noderedport = typeof config.noderedport === "undefined" ? "1980" : config.noderedport;
        // 11/11/2019 NEW in V 1.1.0, changed webserver behaviour. Redirect pre V. 1.1.0 1880 ports to the nde default 1980
        if (node.noderedport.trim() == "1880") {
            RED.log.warn("SonosPollyTTS-config: The webserver port ist 1880. Please change it to another port, not to conflict with default node-red 1880 port. I've changed this temporarly for you to 1980");
            node.noderedport = "1980";
        }
        node.sNoderedURL = "http://" + node.noderedipaddress.trim() + ":" + node.noderedport.trim(); // 11/11/2019 New Endpoint to overcome https problem.
        RED.log.info('SonosPollyTTS-config: Node-Red node.js Endpoint will be created here: ' + node.sNoderedURL + "/tts");

        // 26/02/2020
        if (node.purgediratrestart === "purge") {
            // Delete all files, that are'nt OwnFiles_
            try {
                fs.readdirSync(path.join(node.userDir , "ttsfiles"), (err, files) => {
                    try {
                        if (files.length > 0) {
                            files.forEach(function (file) {
                                RED.log.info("SonospollyTTS-config: Deleted TTS file " + path.join(node.userDir , "ttsfiles" , file));
                                try {
                                    fs.unlink(path.join(node.userDir , "ttsfiles" , file)), err => { };
                                } catch (error) {
                                }
                            });
                        };    
                    } catch (error) {
                        
                    }
                    
                });
            } catch (error) { }
        };
        
     


        // 11/11/2019 CREATE THE ENDPOINT
        // #################################
        const http = require('http')
        const sWebport = node.noderedport.trim();
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
                    RED.log.error("SonosPollyTTS-config: Playsonos RED.httpAdmin file not found: " + query.f);
                    res.write("File not found");
                    res.end();
                }

            } catch (error) {
                RED.log.error("SonosPollyTTS-config: Playsonos RED.httpAdmin error: " + error + " on: " + query.f);
            }
            function fine(err) {
                RED.log.error("SonosPollyTTS-config: Playsonos error opening stream : " + query.f + ' : ' + error);
                res.end;
            }
        }


        try {
            node.oWebserver = http.createServer(requestHandler);
            node.oWebserver.on('error', function (e) {
                RED.log.error("SonosPollyTTS-config: " + node.ID + " error starting webserver on port " + sWebport + " " + e);
            });
        } catch (error) {
            // Already open. Close it and redo.
            RED.log.error("SonosPollyTTS-config: Webserver creation error: " + error);
        }

        try {
            node.oWebserver.listen(sWebport, (err) => {
                if (err) {
                    RED.log.error("SonosPollyTTS-config: error listening webserver on port " + sWebport + " " + err);
                }
            });

        } catch (error) {
            // In case oWebserver is null
            RED.log.error("SonosPollyTTS-config: error listening webserver on port " + sWebport + " " + error);
        }
        // #################################




        node.on('close', function (done) {
            // 11/11/2019 Close the Webserver
            try {
                node.oWebserver.close(function () { RED.log.info("SonosPollyTTS: Webserver UP. Closing down."); });
            } catch (error) {

            }
            done()
        });


    }
    RED.nodes.registerType("sonospollytts-config", PollyConfigNode, {
        credentials: {
            accessKey: { type: "text" },
            secretKey: { type: "password" }
        }
    });

}

