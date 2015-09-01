//File Drivers
var SyncFileStore = require("./syncfilestore");
var ArrayStore = require("./arraystore");
var NullStore = require("./nullstore");
var Repository = require("./repository");

//Dependencies
var argsList = require('args-list');
var md5 = require('js-md5');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require("fs");

function CacheManager() {

    if (!(this instanceof CacheManager)) {
        return new CacheManager();
    }

    var _self = this;
    var _dependencies = {};
    var _factories = {};

    this.driver = function (name, factory) {
        _factories[name] = factory;
    };
    this.dependency = function (name, dep) {
        _dependencies[name] = dep;
    };

    function get(name) {
        if (!_dependencies[name]) {
            var factory = _factories[name];
            _dependencies[name] = factory && _self.inject(factory);
            if (!_dependencies[name]) {
                throw new Error('Cannot find module: ' + name);
            }
        }
        return _dependencies[name];
    }

    this.getDriver = function (name) {
        return repository(get(name));
    };

    this.inject = function (factory) {
        var args = argsList(factory)
            .map(function (dependency) {
                return get(dependency);
            });
        return factory.apply(null, args);
    };

    initDefaultDrivers();

    function initDefaultDrivers() {
        _self.dependency("directory", path.dirname(__dirname) + path.sep +"cache");
        _self.dependency("fs", fs);
        _self.dependency("argslist", argsList);
        _self.dependency("md5", md5);
        _self.dependency("path", path);
        _self.dependency("mkdirp", mkdirp);

        _self.driver("syncfile", SyncFileStore);
        _self.driver("array", ArrayStore);
        _self.driver("null", NullStore);
    }

    function repository(store) {
        return new Repository(store);
    }
}

module.exports = CacheManager;