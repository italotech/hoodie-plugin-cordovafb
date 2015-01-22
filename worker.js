/**
 * Hoodie plugin cordovafb
 * Lightweight and easy cordovafb
 */

/**
 * Dependencies
 */
var CordovaFB = require('./lib');

/**
 * CordovaFB worker
 */

module.exports = function (hoodie, callback) {

  var cordovafb = new CordovaFB(hoodie);

  //hoodie.task.on('cordovafbget:add', cordovafb.get);
  hoodie.task.on('cordovafbgetprofilebyfacebookid:add', cordovafb.getProfileByFacebookId);


  callback();

};
