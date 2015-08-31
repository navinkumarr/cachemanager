# cachemanager
A nodejs cache management library for caching data . Default implementations include synchronous file caching, in memory caching etc

### usage

```
//Require the cachemanager module
var CacheManager = require("./cachemanager");

//Instantiate it
var cacheManager = new CacheManager();

//For syncfile driver you can change the location of the cache directory by setting it in the dependency
cacheManager.dependency("directory", "/path/to/cache");

//Get the syncfile driver
//All options are ["syncfile", "array", "null"]
var cache = cacheManager.getDriver("syncfile");

//Putting the cache 
cache.put("greet", "hello world", function(err, res){
    console.log(res);
});

//Getting the cache
cache.get("greet", function(err , res){
    console.log(res);
});
```
### Available Drivers

* syncfile - Stores cache in file . Is synchronous file cache driver .
* array    - Stores cache in simple array . In memory driver .
* null     - Acts as null driver .

### Available Functions

#### Get
```
cache.get(key, defaultVal, function(err , res){
    console.log(res);
});

cache.get(key, function(err , res){
    console.log(res);
});
```

#### Put
```
cache.put(key, value, minutes, function(err, res){
    console.log(res);
});

cache.put(key, value,function(err, res){
    console.log(res);
});
```

#### Add

Result returns true of false . If key is already present the result will return false and it will 
not override the existing value .

```
cache.add(key , value, minutes , function(err, res){
    console.log(res);
});

cache.add(key , value, function(err, res){
    console.log(res);
});
```

#### Forget

Removes the cache

```
cache.forget(key , function(err, res){
  console.log(res);
});
```

#### Pull

Gets the key value and removes it from cache

````
cache.pull(key, defaultValue, function(err , res){
    console.log(res);
});

cache.pull(key,function(err , res){
    console.log(res);
});
````

#### Flush

removes entire cache

````
cache.flush(function(err , res){
  console.log(res);
})
````

### Adding your own driver

CacheManager acts as a simple DI container which injects the dependency for the driver dynamically
based on the argument parameters

#### Example
````

// Consider below function which needs 5 dependency to initialize
function SyncFileStore(fs, md5, path, mkdirp, directory) {
}

//Require the cachemanager module
var CacheManager = require("./cachemanager");

//Instantiate it
var cacheManager = new CacheManager();

//Register dependencies
//The key for dependency should be same as the parameter name
cacheManager.dependency("directory", __dirname + "/cache");
cacheManager.dependency("fs", fs);
cacheManager.dependency("md5", md5);
cacheManager.dependency("path", path);
cacheManager.dependency("mkdirp", mkdirp);

//Register the driver
cacheManager.driver("syncfile", SyncFileStore);

//Get the syncfile driver
//Cache manager injects the dependcies at runtime to create the driver instance
var cache = cacheManager.getDriver("syncfile");

````

NOTE : Following methods has to be present in the custom driver ["get","forever","put","forget","flush"]
