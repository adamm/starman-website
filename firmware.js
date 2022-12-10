const crypto = require('crypto');
const storage = require('./storage.js');


exports.get_firmware_index = function (req, res) {
    let binaries = [
        storage.getFile("stable.bin"), 
        storage.getFile("testing.bin"), 
        storage.getFile("unstable.bin")
    ];
    Promise.all(binaries).then(results => {
        let stable_binary = results[0];
        let testing_binary = results[1];
        let unstable_binary = results[2];
        let stable_version = Buffer.alloc(32);
        let testing_version = Buffer.alloc(32);
        let unstable_version = Buffer.alloc(32);

        stable_binary.copy(stable_version, 0, 0x30, 0x4F);
        testing_binary.copy(testing_version, 0, 0x30, 0x4F);
        unstable_binary.copy(unstable_version, 0, 0x30, 0x4F);
        
        res.set('Content-type', 'text/html');
        res.write(stable_version.toString() + "\n");
        res.write(testing_version.toString() + "\n");
        res.write(unstable_version.toString() + "\n");
        res.end();
    });
};


exports.get_stable_firmware_binary = function (req, res) {
    storage.sendFile("stable.bin", req, res);
};


exports.get_testing_firmware_binary = function (req, res) {
    storage.sendFile("testing.bin", req, res);
};


exports.get_unstable_firmware_binary = function (req, res) {
    storage.sendFile("unstable.bin", req, res);
};

