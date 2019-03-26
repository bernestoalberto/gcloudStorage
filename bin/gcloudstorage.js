// Imports the Google Cloud client library.
const {Storage} = require('@google-cloud/storage');
const watch = require('node-watch');
const cron = require('node-cron');
const fs = require('fs-extra');
const directoryExists = require('directory-exists');
const mkdir = require('mkdirp');

// Instantiates a client. If you don't specify credentials when constructing
const config = require('../config/config.js');
const env = ( process.env.COMPUTERNAME == 'ACS-EBONET')? 'development': 'production' ;
console.log(`Running on ${env} mode on ${process.env.OS} OS from ${process.env.COMPUTERNAME}`);
let pathWatcher = (env == 'development') ? config.path.localUpload: config.path.productionUpload ;
let projectId = config.project_id;


// the client, the client library will look for credentials in the
// environment.
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
let d = new Date();
let day = d.getDate();
let backSlash = "\\";
let slash = "/";
let year = d.getFullYear().toString();
let month = d.getMonth() +1;
let fullPath = pathWatcher+backSlash+'thcReports'+backSlash+year+backSlash+month+backSlash+day;
let fullDateFolder = 'thcReports'+backSlash+year+backSlash+month+backSlash+day;
let fullPathU = 'thcReports'+backSlash+year+ backSlash+ month+fullDateFolder;

const storage = new Storage({projectId});

let cloud_storage = {
    init:function(){
        // Makes an authenticated API request.
        cloud_storage.createLocalTodayFolder();
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
    deleteBucket: async function(bucketName){
        await storage.bucket(bucketName).delete().then(()=>{console.log(`Bucket ${bucketName} deleted.`)}).catch(error=>console.error(error));


    },
    folderListener:function(){

        let watcher = new watch(pathWatcher, {recursive: true, filter: /\.(jpg|jpeg|svg|gif)$/i});
        console.info(`Listening on folder ${pathWatcher} for changes`);
        watcher.on('change', function (evt, name) {
            console.info(`Listener triggered. New  image file  ${name} is dropped at ${pathWatcher} by  ${process.env.USERNAME}`);
                // console.time();
                let named = name.replace(pathWatcher+'\\',"");
                cloud_storage.moveFileToUpload(named);
        });
        watcher.on('error', function (error) {
            console.error(error);
        });
    },
    moveFileToUpload(name){
           let source =pathWatcher+backSlash+name, destination = pathWatcher+backSlash+fullDateFolder+backSlash+name;
        fs.copy(source,destination ,{overwrite:true}, err =>{
            if(err)return(err);
            console.log(`File ${name} had moved successfully!!!`);
             cloud_storage.uploadFolder();
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
    moveWithinBucket : async function(bucketName,srcFilename,destFilename){
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
    createRemoteFolder: async  function(name,bucketName='acsit',folder='root'){

        await storage.createFolder(name, bucketName).then(()=> {
            console.log(`The folder ${name} on folder ${folder} at bucket ${bucketName}`);
        }).catch(error=>console.error(error))
    },
    createBucket : async function (bucketName = 'mmj-acs') {
// Creates a new bucket
        await storage.createBucket(bucketName, {
            location: config.location,
            storageClass: config.storageClass,
        }).then(()=>{
            console.log(`Bucket ${bucketName} created.`);
        }).catch(error=>console.error(error));


    },
    emptyFolder: ()=> {
        'use strict';
        cron.schedule('* * 18 * * 0-5',()=>{
            // cron.schedule('* * * * 1,2,3,4,5',()=>{
            console.log(`Attempting to delete the directory content @ ${config.path.localUpload}`);
            fs.emptyDir(pathWatcher, err => {
                if (err) return console.error(err);
                console.log(`The Folder ${pathWatcher}  is empty!`)
            });
        });
    },

    createLocalTodayFolder:  function(){


        let items = ['thcReports','thcReports'+backSlash+year,'thcReports'+backSlash+year+ backSlash+ month,fullDateFolder];

        for (let i = 0 ;i < items.length  ;i++){
            directoryExists(  pathWatcher+backSlash+items[i],(exists)=>{
               if(!exists){
                   mkdir(pathWatcher+backSlash+items[i]);
                   console.log('Folder'+ pathWatcher+backSlash+items[i]  +' created')
               }
            });
        }
        cloud_storage.uploadFolder();
    }
    ,
    uploadObject: async function (filename,destination,bucketName='acsit') {
        // filename = fullPath + slash + filename;
// Uploads a local file to the bucket
let dates = ['thcReport',year,month,day];
     for (let i =0; i < dates.length ;i++){
         await storage.bucket(bucketName).upload(dates[i], {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            resumable: true,
            validation: 'crc32c',
            destination: dates[i],
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                cacheControl: 'public, max-age=31536000',
            }
        }, (err, info) => {
            if (err) err => console.log(err);
            console.log(`The file ${info.name} has successfully upload to bucket ${info.bucket} @ ${info.metadata.mediaLink} `);
        })
    }


    },
        uploadFolder: async function (bucketName='acsit') {
            // filename = fullPath + slash + filename;
// Uploads a local file to the bucket
            let dates = [pathWatcher+backSlash+'thcReports',
                pathWatcher+backSlash+'thcReports'+backSlash+year,
                pathWatcher+backSlash+'thcReports'+backSlash+year+backSlash+month,
                pathWatcher+backSlash+'thcReports'+backSlash+year+backSlash+month+backSlash+day];

            for (let i =0; i < dates.length ;i++){
                await storage.bucket(bucketName).upload(pathWatcher+backSlash+'thcReports', {
                // await storage.bucket(bucketName).upload(pathWatcher+backSlash+dates[i], {
                    // Support for HTTP requests made with `Accept-Encoding: gzip`
                    gzip: true,
                    resumable: true,
                    validation: 'crc32c',
                    destination:pathWatcher+backSlash+'thcReports',
                    metadata: {
                        // Enable long-lived HTTP caching headers
                        // Use only if the contents of the file will never change
                        // (If the contents will change, use cacheControl: 'no-cache')
                        cacheControl: 'public, max-age=31536000',
                    }
                }, (err, info) => {
                    if (err) err => console.log(err);
                    console.log(`The file ${info.name} has successfully upload to bucket ${info.bucket} @ ${info.metadata.mediaLink} `);
                })
            }


        }   ,
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



