var CordovaFBApi = require('./cordovafb');
var Db = require('./db');
var _ = require('lodash');
var utils = require('hoodie-utils-plugins')('cordovafb:db');
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var cordovafb = {};
  var dbPluginName = 'plugins/hoodie-plugin-cordovafb';
  var dbPluginProfile = new ExtendedDatabaseAPI(hoodie, hoodie.database('plugins/hoodie-plugin-profile'));
  var pluginDb = new Db(hoodie, dbPluginProfile, dbPluginName);

  _.extend(cordovafb,  new CordovaFBApi(hoodie, pluginDb, dbPluginProfile));
//  _.extend(cordovafb,  new NetworkApi(hoodie, pluginDb));

  return cordovafb;
};
