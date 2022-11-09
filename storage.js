const fs = require('fs');
const path = require('path');
const { Storage } = require("@google-cloud/storage");
const storage = new Storage;
const bucketName = 'starman-firmware';

const useLocalCache = 1;



exports.testAuth = async () => {
    try {
        const results = await storage.getBuckets();
        const [buckets] = results;
        let goodAccess = 0;
        buckets.forEach(bucket => {
            if (bucket.name == bucketName)
                goodAccess = 1;
        });

        if (!goodAccess)
            throw new Error(`No access to ${bucketName}`);
    }
    catch (err) {
        console.error('ERROR:', err);
        console.error("If running in devel environment, run `gcloud auth application-default login` or point GOOGLE_APPLICATION_CREDENTIALS to a service account json file");
    }
}


exports.sendFile = function (filename, req, res) {
    storage.bucket(bucketName).file(filename).get().then(metadata => {
        let gsAttrs = metadata[1];
        let data = sendFromLocalCache(filename, gsAttrs, req, res);

        if (data == null) {
            sendFromGoogleStorage(filename, req, res).catch(err => {
                console.error(err);
                res.send(500);
            });
        }
    }).catch(err => {
        console.error(err);
        res.send(500);
    });

}


function sendFromLocalCache (filename, gsAttrs, req, res) {
    if (!useLocalCache)
        return null;

    if (fs.existsSync(`cache/${filename}`)) {
        let attrs = {};
        let stats = fs.statSync(`cache/${filename}`);
        let data = Buffer.alloc(stats.size);
        let offset = 0;

        if (fs.existsSync(`cache/${filename}.attrs`))
            attrs = JSON.parse(fs.readFileSync(`cache/${filename}.attrs`));

        if (!attrs || (gsAttrs && gsAttrs.etag != attrs.etag)) {
            console.log(`Local cache of ${filename} is out of date.`);
            return null;
        }

        console.log(`Loading ${filename} from local cache.`);

        if (req.headers
            && req.headers['if-none-match']
            && req.headers['if-none-match'] == attrs.etag) {

            res.sendStatus(304);
            return null;
        }

        res.set('Cache-Control', 'max-age=0, private, must-revalidate');
        res.set('Content-Type', attrs.contentType);
        res.set('etag', attrs.etag);

        let stream = fs.createReadStream(`cache/${filename}`);
        stream.on('data', content => {
            res.write(content);
            content.copy(data, 0, offset);
            offset += content.length;
        });
        stream.on('end', () => {
            res.end();
        });

        return data;
    }
    console.log(`${filename} not in local cache.`);
    return null;
}


async function sendFromGoogleStorage (filename, req, res) {
    let metadata = await storage.bucket(bucketName).file(filename).get();

    let file  = metadata[0];
    let attrs = metadata[1];

    console.log(`Loading ${filename} from Google Storage.`);
    if (req.headers
        && req.headers['if-none-match']
        && req.headers['if-none-match'] == attrs.etag) {
        res.sendStatus(304);

        return null;
    }

    function readDataFromStream() {
        let data = Buffer.alloc(Number(attrs.size));

        return new Promise((resolve, reject) => {
            let stream = file.createReadStream();
            let cache = {};
            let offset = 0;

            if (useLocalCache) {
                console.log(`Writing ${filename} to local cache`);

                let dir = path.dirname(filename);
                fs.mkdirSync(`cache/${dir}`, { recursive: true });
                cache = fs.createWriteStream(`cache/${filename}`);
                fs.writeFileSync(`cache/${filename}.attrs`, JSON.stringify(attrs));
            }
            else {
                cache.write = () => {};
                cache.end   = () => {};
            }

            res.set('Content-Type', attrs.contentType);
            res.set('Cache-Control', 'max-age=0, private, must-revalidate');
            res.set('etag', attrs.etag);

            stream.on('data', content => {
                content.copy(data, 0, offset);
                res.write(content);
                cache.write(content);
                offset += content.length;
            });
            stream.on('end', () => {
                res.send();
                resolve(data);
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    }

    return await readDataFromStream();
}
