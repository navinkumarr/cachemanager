
module.exports = NullStore;

function NullStore(){
    if(!(this instanceof NullStore)){
        return new NullStore();
    }
}

NullStore.prototype.get = function(key, callback){
};

NullStore.prototype.forever = function(key, value, callback){
};

NullStore.prototype.put = function(key , value, minutes, callback){
};

NullStore.prototype.forget = function(key, callback){
};

NullStore.prototype.flush = function(callback){
};