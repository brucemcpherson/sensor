const {FileSystem} = require('ftp-srv');
const fs = require('fs');
const mime = require('mime-types');
const Storage = require('@google-cloud/storage').Storage;
const through = require('through')
const path = require('path')

const {createReadStream, createWriteStream, constants} = require('fs');

class GcpFileSystem extends FileSystem {
  
  constructor() {
    super(...arguments);
    const [connection, options] = [...arguments] 
    this.settings = options.settings
    // these wil get fired when storage is uploaded to 
    this.onStorageError = options.onStorageError
    this.onStorageFinished = options.onStorageFinished
    console.log (this.onStorageFinished)
  }

  /**
   * get an authorized storage object to stream to
   */
  getStorage () {
    const {creds } = this.settings.ftp.gcp;
    const { credentials, bucketName, folderName } = creds;
    const { projectId } = credentials;
    return {
      storage: new Storage({
        projectId,
        credentials,
      }),
      bucketName,
      folderName
    };
  };

  /* create the cloud storage stream
  * the credentials/bucket name and filename are in the secrets file
  * @param {string} name the filename to stream from
  */
  storageWriteStream  ({name}) {
    
    const mimeType = mime.lookup(name);
    const fileTarget = this.getFileTarget({name});
    const options = {
      contentType: mimeType
    };

    return {
      stream: fileTarget.file.createWriteStream(options),
      name: fileTarget.file.name,
      bucket: fileTarget.file.bucket.name
    }
  };

/**
 * create the cloud storage file target
 * the credentials/bucket name and filename are in the secrets file
 * @param {string} name the filename to stream from
 */
  getFileTarget  ({name}) {
    // get a storage obect
    let {storage, bucketName, folderName} = this.getStorage();
    // handle gs: type names too
    if (name.slice(0, 5) === 'gs://') {
      bucketName = name.replace(/gs:\/\/([^\/]+).*/, '$1');
      name = name.replace('gs://' + bucketName + '/', '');
    }
    name = folderName + '/' + name;
    const bucket = storage.bucket(bucketName);
    // we'll actually be streaming to/from  this file
    return {
      file: bucket.file(name)
    }

  };


  write(fileName, {append = false, start = undefined} = {}) {

    // for now we'll temporarily write it to a unique path
    // then load to storage from there
    // then delete the file
    // because of this https://github.com/trs/ftp-srv/issues/199

    const {settings, onStorageError, onStorageFinished} = this
    const {pubsub, ftp} = settings
    // get a unique name for the file and add the extension
    const fsPath = ftp.tmp + this.getUniqueName() + path.extname(fileName)

    // and a temp stream
    const stream = createWriteStream(fsPath, {flags: !append ? 'w+' : 'a+', start});

    const removeTemp = (f) => {
      // delete the temp file
      fs.unlink(f, err=> {
        if(err) {
          console.log('failred to remove temp file',f)
        } else {
          console.log('temp file', f, 'removed')
        }
      })
    }
    const storageError = (error) => {
      // delete the temp file
      removeTemp(fsPath)
      console.error('stream failure', error)
      if(onStorageError) {
        onStorageError({error, fileName, settings})
      } 
    }
    
    // if this fails then it wasnt able to write temp file
    stream.once('error', error=> storageError(error))
    
    // temp file was written, now write to storage
    stream.once('close', () => {
      // temp file is created, now stream it to storage
      const ws = this.storageWriteStream ({name:fileName})
      const storageStream = ws.stream
      const readStream = fs.createReadStream(fsPath);
      const storageName = `${ws.bucket}/${ws.name}`
      const before = new Date().getTime()
      console.log(`${before}:started writing ${fileName} to gcp at ${storageName}`)

      // copy file to storage through a pipe so we can catch the data for publishing
      // but only do this if the files are expected to be small
      const streamedData = []
      readStream.pipe(through(
        function write (data) {
          // this is where we'll catch the data
          if (pubsub.includeData) {
            streamedData.push(data)
          }
          this.queue(data) 
        },
        function end (data) {
          this.queue(null) 
        }
      )).pipe(storageStream)


      // This catches any errors that happen while creating the readable stream (usually invalid names)
      readStream.once('error', error => storageError(error))
      storageStream.once('error', error => storageError(error))
      
      // when done, we can resolve the stream
      storageStream.on('finish', function() {
        const now = new Date().getTime()
        console.log(`${now}:finished writing ${fileName} to gcp at ${storageName} (${now-before}ms)`)
        // signal all over
        stream.end()
        // call the thing to do when its over
        if(onStorageFinished) {
          onStorageFinished({storageName, settings, fileName, data: Buffer.concat(streamedData)})
        } 
        // delete the temp file
        removeTemp(fsPath)

      });

    })
    return {
      stream
    };
   
  }



}
module.exports = {
  GcpFileSystem
}