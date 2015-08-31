module.exports = SyncFileStore;

function time() {
    return Date.now() / 1000 | 0;
}

function SyncFileStore(fs, md5, path, mkdirp, directory) {

    if(!(this instanceof SyncFileStore)){
        return new SyncFileStore(fs, md5, path, mkdirp, directory);
    }

    this.fs = fs;
    this.directory = directory;
    this.md5 = md5;
    this.pathHelper = path;
    this.mkdirp = mkdirp;
}

SyncFileStore.prototype.path = function (key) {
    var hash = this.md5(key);
    var parts = hash.match(/.{1,2}/g).slice(0, 2).join("/");
    return [this.directory, parts, hash].join("/");
};

SyncFileStore.prototype.getPayload = function (key) {
    var path = this.path(key);

    if (!this.fs.existsSync(path)) {
        return {'data': null, 'time': null};
    }

    try {
        var content = this.fs.readFileSync(path, "utf8");
        var expire = content.substr(0, 10);
    }
    catch (e) {
        return {'data': null, 'time': null};
    }

    if (time() >= expire) {
        this.forget(key);

        return {'data': null, 'time': null};
    }

    var data = JSON.parse(content.substr(10));

    var times = Math.ceil((expire - time()) / 60);

    return {data: data, time: times};
};

SyncFileStore.prototype.createCacheDirectory = function (path) {
    try {
        var dir = this.pathHelper.dirname(path);
        if (!this.fs.existsSync(dir)) {
            this.mkdirp.sync(dir);
        }
    } catch (e) {
    }
};

SyncFileStore.prototype.expiration = function (minutes) {
    if (minutes === 0) return 9999999999;
    return time() + (minutes * 60);
};

SyncFileStore.prototype.get = function (key, callback) {
    try{
       var result = this.getPayload(key).data;
       callback(null , result);
    }catch(e){
       callback(e , null);
    }
};

SyncFileStore.prototype.forever = function (key, value, callback) {
    this.put(key, value, 0, callback);
};

SyncFileStore.prototype.put = function (key, value, minutes, callback) {
    try{
        var path = this.path(key);
        var content = this.expiration(minutes) + JSON.stringify(value);
        this.createCacheDirectory(path);
        this.fs.writeFileSync(path, content);
        return callback(null, true);
    }catch(e){
        return callback(e, null);
    }
};

SyncFileStore.prototype.forget = function (key, callback) {
    try{
        var file = this.path(key);
        if (this.fs.existsSync(file)) {
            this.fs.unlinkSync(file);
        }
        return callback(null , true);
    }catch(e){
        return callback(e, null);
    }
};

SyncFileStore.prototype.flush = function(callback) {
    try{
        rmDir(this.directory, this.fs);
        return callback(null, true);
    }catch(e){
        return callback(e, null);
    }
};

//https://gist.github.com/liangzan/807712#gistcomment-337828
function rmDir(dirPath , fs) {
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath, fs);
        }
    fs.rmdirSync(dirPath);
}