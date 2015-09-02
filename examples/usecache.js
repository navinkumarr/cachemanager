//var cache = require("./cachemanager")().getDriver("syncfile");

//Require the cachemanager module
var CacheManager = require("../");

//Instantiate it
var cacheManager = new CacheManager();

// For syncfile driver you can change the location of the cache directory
// by setting it in the dependency
// cacheManager.dependency("directory", "/path/to/cache");

//Get the syncfile driver
//All options are ["syncfile", "array", "null"]
var cache = cacheManager.getDriver("syncfile");

//A common function to log the result
var logResult = function(err , res){
    if(err) throw err;
    console.log(res);
};

//Putting the cache
cache.put("greet", "hello world", logResult); // true

//Put cache for 10 minutes
cache.put("again", "welcome", 10, logResult); // true

//Getting the cache
cache.get("greet", logResult ); // hello world

//forever will store cache for forever
//possible in syncfile and array store as they are synchronous
//We are sure that the cache is stored before we get it in synchronous operations
cache.forever("once", "twice").get("once", logResult); // twice

// This will add only when the key is not present already
// returns true when added and false when not added
cache.add("once", "thrice", logResult); // false

cache.add("thrice", "once", logResult); // true

cache.get("thrice", logResult); // once

//Removes the key from cache
cache.forget("thrice", logResult); // true

cache.get("thrice", logResult); // null

//pulling will get the value from cache and remove it from cache
cache.pull("once",logResult); // twice

//getting the same key to check
cache.get("once", logResult); // null

cache.has("greet", logResult); // hello world

cache.has("once", logResult); // null

//flush the entire cache
cache.flush(logResult); // true