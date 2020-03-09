


module.exports = function (RED) {
    var formidable = require('formidable');
    var fs = require('fs');

    // 27/02/2020 Get list of filenames starting with OwnFile_
    RED.httpAdmin.get("/getOwnFilesList", RED.auth.needsPermission('ownfile.read'), function (req, res) {
        var jListOwnFiles = [];
        var sName = "";
        try {
            fs.readdirSync(__dirname + "/ttspermanentfiles").forEach(file => {
                if (file.indexOf("OwnFile_") > -1) {
                    sName = file.replace("OwnFile_", '').replace(".mp3", '');
                    jListOwnFiles.push({ name: sName, filename: file });
                }
            });

        } catch (error) { }
        res.json(jListOwnFiles)
    });

    // 27/02/2020 Delete OwnFile_
    RED.httpAdmin.get("/deleteOwnFile", RED.auth.needsPermission('ownfile.read'), function (req, res) {
        try {
            if (req.query.FileName == "DELETEallFiles") {
                // Delete all OwnFiles_
                try {
                    fs.readdir(__dirname + "/ttspermanentfiles/", (err, files) => {
                        files.forEach(function (file) {
                            if (file.indexOf("OwnFile_") !== -1) {
                                RED.log.warn("SonospollyTTS: Deleted file " + __dirname + "/ttspermanentfiles/" + file);
                                try {
                                    fs.unlink(__dirname + "/ttspermanentfiles/" + file), err => { };
                                } catch (error) { }
                            }
                        });
                    });

                } catch (error) { }
            } else {
                // Delete only one file
                try {
                    var newPath = __dirname + "/ttspermanentfiles/" + req.query.FileName;
                    try {
                        fs.unlinkSync(newPath)
                    } catch (error) { }

                } catch (error) { }
            }
        } catch (err) {
        }
        res.json({ status: 220 });
    });

    function ownfile(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.selectedFile = config.selectedFile || "";

        // Receive new files from html
        RED.httpAdmin.post("/node-red-contrib-sonospollytts", function (req, res) {
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                if (err) { };
                // Allow only mp3
                if (files.customTTS.name.indexOf(".mp3") !== -1) {
                    var newPath = __dirname + "/ttspermanentfiles/OwnFile_" + files.customTTS.name;
                    fs.rename(files.customTTS.path, newPath, function (err) { });
                }
            });
            res.json({ status: 220 });
            res.end;
        });

        this.on('input', function (msg) {
            if (msg.hasOwnProperty("selectedFile")) {
                if (msg.hasOwnProperty("selectedFile")) msg.payload = "OwnFile_" + msg.selectedFile.replace(".mp3", "") + ".mp3";
                node.send(msg);
            } else {
                if (msg.payload !== undefined && msg.payload === true || msg.payload === false) {
                    msg.payload = node.selectedFile;
                    node.send(msg);
                }
            }
        });
    }
    RED.nodes.registerType("ownfile", ownfile);
};