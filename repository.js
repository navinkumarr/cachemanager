
module.exports = Repository;

function time(date){
    if(date){
        return date.getTime() / 1000 |0;
    }
    return Date.now() / 1000 | 0 ;
}

function isValidStore(store){
    var methods = ["get","forever","put","forget","flush"];
    var errors = [];
    methods.forEach(function(method){
        if(typeof store[method] !== "function"){
            errors.push("Method \"" + method + "\" should be implemented in store ");
        }
    });

    if(errors.length > 0) {
        throw new TypeError(errors.join("\n"));
    }
}

function Repository(store){
    isValidStore(store);
    var _store = store;
    var _defaultCacheTime = 60;

    Object.defineProperty(this, "store" , {
        get : function() { return _store },
        enumerable: false,
        configurable: false
    });

    Object.defineProperty(this, "defaultCacheTime" , {
        set : function(defaultCacheTime) { _defaultCacheTime = defaultCacheTime},
        get : function() { return _defaultCacheTime },
        enumerable: false,
        configurable: false
    });

}

Repository.prototype.getMinutes = function(minutes){
    if(minutes instanceof Date){
        var fromNow = time(minutes) - time();

        return parseInt(fromNow) > 0 ? parseInt(fromNow) : null ;
    }
    if(minutes === undefined) minutes = this.defaultCacheTime;
    return parseInt(minutes);
};

Repository.prototype.get = function(key , defaultVal, callback){

    if(typeof defaultVal === "function"){
        callback = defaultVal;
        defaultVal = undefined;
    }

    this.store.get(key , function(err, result){
        var def = defaultVal || null;
        var res = result ? result : def;
        return callback(err , res);
    });
};

Repository.prototype.put = function(key , value, minutes /*callback*/, callback){

    if(typeof minutes === "function"){
        callback = minutes;
        minutes = undefined;
    }

    minutes = this.getMinutes(minutes);
    if(minutes) {
        this.store.put(key, value, minutes, callback);
    }
};

Repository.prototype.add = function(key , value, minutes /*callback*/, callback){

    if(typeof minutes === "function"){
        callback = minutes;
        minutes = undefined;
    }

    var self = this;
    this.get(key, function(err, res){
        if (err) return callback(err, null);
        if(res === null){
            return self.put(key, value, minutes, callback);
        }
        callback(null, false);
    });
};

Repository.prototype.forget = function(key, callback){
    this.store.forget(key, callback);
};

Repository.prototype.pull = function(key , defaults, callback){

    if(typeof defaults === "function"){
        callback = defaults;
        defaults = undefined;
    }

    var self = this;
    this.get(key, defaults, function(error , result){
        if(error) return callback(error, null);
        var def = defaults || null;
        self.forget(key, function(err, res){
            if(err) return callback(err, null);
            var r = result ? result : def;
            return callback(null, r);
        });
    });
};

Repository.prototype.flush = function(callback){
    this.store.flush(callback);
};