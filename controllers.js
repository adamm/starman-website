const storage = require('./storage.js');


exports.get_stable = function (req, res) {
    storage.sendFile("stable.bin", req, res);
};


exports.get_testing = function (req, res) {
    storage.sendFile("testing.bin", req, res);
};


exports.get_unstable = function (req, res) {
    storage.sendFile("unstable.bin", req, res);
};

