var CordovaFBApi = require('./cordovafb');
var Db = require('./db');
var _ = require('lodash');


module.exports = function (hoodie) {
  var cordovafb = {};
  var dbPluginName = 'plugins/hoodie-plugin-cordovafb';
  var pluginDb = new Db(hoodie, dbPluginName);

  _.extend(cordovafb,  new CordovaFBApi(hoodie, pluginDb));
//  _.extend(cordovafb,  new NetworkApi(hoodie, pluginDb));

  return cordovafb;
};
