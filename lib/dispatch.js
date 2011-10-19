/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT OpenSource License
** LICENSE should have been included in this package
*/

var async=require("async");

var bodycatch = function(request, response) {
  var body=[];
  request.on('data', function(chunk) { 
    if (body) {
      body.push(chunk);
    } else {
      request.emit('body', chunk);
    }
  });
  request.on('end', function() {
    if (body) {
      body.push(null);
    } else {
      request.emit('body', null);
    }
  });
  request.body = function(cb) {
    request.on('body', cb);
    var p = body;
    body = undefined;
    p.forEach(function(chunk) { request.emit('body', chunk); });
  };
};
var headcatch = function(request, response) {
  var writeHead = response.writeHead;
  response.writeHead = function(status, message, headers) {
    headers = headers || {};
    response.contentLength = response.getHeader('content-length') || headers['content-length'] || headers['Content-Length'];
    headers = headers || {};
    if (!response.getHeader('date') && !headers['date'] && !headers['Date']) {
      headers.Date = (new Date()).toUTCString();
    }
    if (!response.getHeader('server') && !headers['server'] && !headers['Server']) {
      headers.Server = "shhnode 0.1.0";
    }
    return writeHead.call(response, status, message, headers);
  };
};
var contcatch = function(request, response) {
  if ((request.httpVersionMajor >= 1) && (request.httpVersionMinor >= 1)) return;
  var caught = false;
  var writeHead = request.writeHead;
  response.writeHead = function(status, message, headers) {
    headers = headers || {};
    if (!response.getHeader('content-length') || !headers['content-length'] || !headers['Content-Length']) {
      return caught = { status:status, message:message, headers:headers, data:[] };
    }
    return writeHead.call(response, status, message, headers);
  };
  
  var write = request.write;
  response.write = function() {
    if (!caught) return write.apply(response, arguments);
    caught.data.push(Array.prototype.slice.call(arguments, 0));
  };
  var end = request.end;
  response.end = function() {
    if (!caught) return end.apply(response, arguments);
    caught.data.push(Array.prototype.slice.call(arguments, 0));
    var contentLength = 0;
    caught.data.map(function(parameters) {
      var buffer = Buffer.isBuffer(parameters[0]) ? parameters[0] : new Buffer(parameters[0], parameters[1]);
      contentLength += buffer.length;
      return buffer;
    });
    caught.headers['content-length'] = contentLength;
    writeHead.call(caught.status, caught.message, caught.headers);
    caught.data.forEach(function(chunk) {
      write.call(response, chunk);
    });
    end.call(response);
  };
};

module.exports = function(dispatches) {
  dispatches = (('object' == typeof dispatches) && (Array == dispatches.constructor)) ? dispatches : [];
  dispatches = dispatches.map(function(dispatch) {
    if (('object' != typeof dispatch) || ('function' != typeof dispatch.match) || (RegExp != dispatch.match.constructor) || ('function' != typeof dispatch.handler)) return undefined;
    return function(request, response, status, callback) {
      if (status) return callback(undefined, request, response, status);
      if (dispatch.match.exec(request.url)) {
        return dispatch.handler(request, response, function(err, status) {
          callback(undefined, request, response, status);
        });
      }
      callback(undefined, request, response, status);
    };
  }).filter(function(item) { return item ? true: false; });
  return function(request, response, callback) {
    bodycatch(request, response);
    headcatch(request, response);
    contcatch(request, response);
    var handlers = dispatches.map(function(item) { return item; });
    handlers.unshift(function(callback) {
      callback(undefined, request, response, 0);
    });
    async.waterfall(handlers, function(err, request, response, status) {
      if ('function' == typeof callback) return callback(err, status);
      if (!status) {
        response.writeHead(404, 'Not Found');
        response.end();
      }
    });
  };
};
