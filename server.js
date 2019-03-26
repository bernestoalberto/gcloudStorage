let storage = require('./bin/gcloudstorage');


storage.init();
storage.folderListener();
// storage.uploadFolder();
storage.listByBucket();
// storage.createRemoteFolder('thcReports');
// storage.createBucket();
storage.emptyFolder();
storage.listAllBuckets();
