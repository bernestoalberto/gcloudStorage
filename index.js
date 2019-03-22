// Imports the Google Cloud client library.
const {Storage} = require('@google-cloud/storage');

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const bucketName = 'Name of a bucket, e.g. my-bucket';
const srcFilename = 'Remote file to download, e.g. file.txt';
const destFilename = 'Local destination for file, e.g. ./local/path/to/file.txt';

const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
};

// Instantiates a client. If you don't specify credentials when constructing
const config = require('./config/config.js');
let projectId = config.project_id;

const storage = new Storage({projectId});
// the client, the client library will look for credentials in the
// environment.


let cloud_storage = {
    init:function(){
        // Makes an authenticated API request.

        storage
            .getBuckets()
            .then((results) => {
                const buckets = results[0];

                console.log('Connection successfull');
                console.log('Buckets:');
                buckets.forEach((bucket) => {
                    console.log(bucket.name);
                });
            })
            .catch((err) => {
                console.error('ERROR:', err);
            });

    },
    listByBucket: async function (bucketName ='acsit') {

// Lists files in the bucket
        const [files] = await storage.bucket(bucketName).getFiles(options);

        console.log('Files:');
        files.forEach(file => {
            console.log(file.name);
        });
    },
    listAllBuckets: async function () {

// Lists all buckets in the current project
        const [buckets] = await storage.getBuckets();
        console.log('Buckets:');
        buckets.forEach(bucket => {
            console.log(bucket.name);
        });
    },
    copyFilesWithBuckets: async function(){
        // Copies the file to the other bucket
        const srcBucketName = 'Name of the source bucket, e.g. my-bucket';
        const srcFilename = 'Name of the source file, e.g. file.txt';
        const destBucketName = 'Name of the destination bucket, e.g. my-other-bucket';
        const destFilename = 'Destination name of file, e.g. file.txt';
        await storage
            .bucket(srcBucketName)
            .file(srcFilename)
            .copy(storage.bucket(destBucketName).file(destFilename));

        console.log(
            `gs://${srcBucketName}/${srcFilename} copied to gs://${destBucketName}/${destFilename}.`
        );
    }
    ,
    moveWithinBucket : async function(){
        // const bucketName = 'Name of a bucket, e.g. my-bucket';
// const srcFilename = 'File to move, e.g. file.txt';
// const destFilename = 'Destination for file, e.g. moved.txt';

// Moves the file within the bucket
        await storage
            .bucket(bucketName)
            .file(srcFilename)
            .move(destFilename);

        console.log(
            `gs://${bucketName}/${srcFilename} moved to gs://${bucketName}/${destFilename}.`
        );
    },
    createBucket : async function (bucketName = 'mmj-acs') {

// Creates a new bucket
        await storage.createBucket(bucketName, {
            location: config.location,
            storageClass: config.storageClass,
        });

        console.log(`Bucket ${bucketName} created.`);
    }
    ,
    uploads: async function () {

// Uploads a local file to the bucket
        await storage.bucket(bucketName).upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                cacheControl: 'public, max-age=31536000',
            },
        });
    },
    downloads: async function () {
// Downloads the file
        await storage
            .bucket(bucketName)
            .file(srcFilename)
            .download(options);

        console.log(
            `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
        );
    }




} ;
module.exports = cloud_storage;



