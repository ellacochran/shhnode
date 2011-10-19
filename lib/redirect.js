/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT OpenSource License
** LICENSE should have been included in this package
*/

var async = require("async");
var makeHeaders = require('./util-resolve.js');

module.exports = function(redirects, status, headers) {
  status = (isNaN(status) || (status < 300) || (status > 399)) ? 302 : status;
  redirects = (('object' == typeof redirects) && (Array == redirects.constructor)) ? redirects : [ redirects ];
  redirects = redirects.map(function(item) {
    if ('object' != typeof item) return undefined;
    if (!item.match || !item.target) return undefined;
    var match = (('object' == typeof item.match) && (item.match.constructor == RegExp)) ? item.match : new RegExp(String(item.match),'i');
    var target = item.target;
    return function(url, callback) {
      callback(undefined, url.replace(match, target));
    };
  }).filter(function(item) { return item ? true : false; });
  headers = headers || {};
  return function(request, response, callback) {
    var actions = redirects.map(function(item) { return item; });
    actions.unshift(function(callback) {
      callback(undefined, request.url);
    });
    async.waterfall(actions, function(err, url) {
      if (err) return callback(err, 0);
      if (!url.length) url = '/';
      var resheaders = makeHeaders(headers);
      resheaders['Location'] = dest;
      resheaders['Content-Length'] = 0;
      response.writeHead(status, 'Please See', resheaders);
      response.end();
      callback(undefined, status);
    });
  };
};
