
module.exports = ArrayStore;

function time() {
    return Date.now() / 1000 | 0;
}

function ArrayStore(){
    if(!(this instanceof ArrayStore)){
        return new ArrayStore();
    }
    this._storage = [];
}

ArrayStore.prototype.get = function(key, callback){
    callback(null,this.getPayload(key).data);
};

ArrayStore.prototype.forever = function(key, value, callback){
    this.put(key, value, 0, callback);
};

ArrayStore.prototype.put = function(key , value, minutes, callback){
    this._storage[key] = {data: value, time : this.expiration(minutes)};
    callback(null, true);
};

ArrayStore.prototype.forget = function(key, callback){
    try{
        delete this._storage[key];
        callback(null, true);
    }catch(e){
        callback(e, null);
    }
};

ArrayStore.prototype.flush = function(callback){
    this._storage = [];
    callback(null, true);
};

ArrayStore.prototype.expiration = function (minutes) {
    if (minutes === 0) return 9999999999;
    return time() + (minutes * 60);
};

ArrayStore.prototype.getPayload = function (key) {

    if (typeof this._storage[key] === "undefined") {
        return {'data': null, 'time': null};
    }

    try {
        var content = this._storage[key].data;
        var expire = this._storage[key].time;
    }
    catch (e) {
        return {'data': null, 'time': null};
    }

    if (time() >= expire) {
        this.forget(key, function(err, res){

        });

        return {'data': null, 'time': null};
    }

    var times = Math.ceil((expire - time()) / 60);

    return {data: content, time: times};
};