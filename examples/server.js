/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT OpenSource License
** LICENSE should have been included in this package
*/

var http = require('http');
var shhnode = require('../index.js'); // This will usually be: var shhnode = require('shhnode');

var server = http.createServer(shhnode.dispatch([
  { match:/^(.*)\/$/, handler:shhnode.rewrite([ { match:/^(.*)\//, target:'$1/index.html' } ]) },
  { match:/^\//, handler:shhnode.static(__dirname+'/../docs/', { 'Cache-Control':'public', 'Server':'SSHNode-Example' }) }
])).listen(1234);
