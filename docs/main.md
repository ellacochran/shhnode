# SHHnode

SHHnode is a simple framework to facilitate handling HTTP request in node.

Example:

<pre><code>
var http = require('http');
var shhnode = require('shhnode');

var dispatch = shhnode.dispatch([
  { match:/^.*$/, handler:shhnode.redirect(
    [ { match:'^/old/(.*?)$', target:'new/$1', code:302 } ], 
    { 'Cache-Control':'no-cache' }
  )},
  { match:/^.*$/, handler: shhnode.static(
    __dirname+'/htdocs', 
    { 'Cache-Control':'public' },
    function(url) { return [ url, url+'/index.html' ]; }
  )}
]);

http.createServer(function (request, response) {
  dispatch(request, response, function(err, status) {
    if (err) {
      static.sendFile(__dirname+'/500.html', status=500, headers, response, function(err, status) {
        if (err || !status) {
          response.writeHead(500, 'Internal Server Error');
          response.end('500 - Internal Server Error');
        }
      });
    } else if (!status) {
      static.sendFile(__dirname+'/404.html', status=404, headers, response, function(err, status) {
        if (err || !status) {
          response.writeHead(404, 'Not Found');
          response.end('404 - Not Found');
        }
      });
    }
    console.log(status+" - "+request.method+" "+request.url);
  });
}).listen(1234, "127.0.0.1");
</code></pre>

## Advantages
The reason this handler abstraction is so useful is because it enables one to quickly put together a small webserver
with a lot of stuff already taken care of. At the same time it doesn't really do a lot and does not remove you(me) the
developer from the raw state of things. You still get the full monty with all the raw power node provides you.

So while it helps a bit in putting things together quickly and keeping them modular, it doesn't interfere. It
doesn't presume to be smarter than you, better than you, or anything of the like. It also does its thing
in a way that anything (as in any handler) you write for use with shhnode can just as easily be used without it in a plain
vanilla http server as done by http.createServer().

## Dispatch
The core is the dispatch module. It captures the body data, and corrects outgoing headers to be compliant.
To initialize it is simply give a list of handlers that get a shot at handling the request and a regex, which
is mathced against the URL to decide if a handler is appropriate.

A handler that can be given to the dispatch module is simply a function with the following signature:


<code>function(request, response, function callback(err, status) {})</code>


The status of an unhandled request is 0. The handler is responsible for calling the callback with an Error object
(or null/undefined if everything is OK) and the repsonse status code that was sent in response.writeHead().


Handlers are called in the order defined until either an error occurrs or the status is no longer 0.


In order to catch all body data, the dispatcher attaches a body() function to the request which buffers
request data. It is given a handler that takes a single argument (just like request.on('data') ). This handler is called
once for every chunk of data received and once without a chunk to signal the en of body data.


<pre><code>
  Example (ECHO handler):
  var handler = function(request, response, callback) {
    request.body(function(chunk) {
      response.writeHead(200, "OK", { 
        'content-type':request.headers['content-type'],
        'content-length':request.headers['content-length']
      });
      if (chunk) {
        response.write(chunk);
      } else {
        response.end();
        callback(undefined, 200);
      }
    });
  };
</code></pre>

This is also the one bit that actually makes it different from regular http.createServer() handlers. So if you forsee your
code being used directly, you want to do 2 things:
  1. Check if request.body is a function and only if it is use it. Otherwise use the regular request.on('data') and request.on('end') stuff.
  1. Check if callback is actually a function and only if it is call it. If not, then you are not within shnode.
These 2 things will actually always go together. So if you got a request.body() from shhnode then you will always have a callback. But you can
already see that plugging this type of handler into something else, would not be too hard either. (Why you would want to is beyond me though ;) )

## Modules
SHHNode comes with a bunch of predefined handlers that take away some of the drudgery associated with doing raw HTTP servers.
Besides the dispatcher mentioned above, there are a few modules that I use often enough (an assume you will too) to warrant including them
in the default package.

  * [redirect](redirect.md) - Is like mod_rewrite for HTTP redirects
  * [rewrite](rewrite.md) - The mod_rewrite for manipulating URLs before the others get a chance to look.
  * [set-cookie](set-cookie.md) - Set a cookie on a request (Separate logic from other handlers)
  * [static](static.md) - A fast static file server with Last-Modified and ETag support as well as Range support loosely inspired by paperboy.
  