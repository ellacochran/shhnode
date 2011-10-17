# SHHNode Redirect Handler

## Initialisation

<pre><code>
  var handler = require('shhnode').redirect([
    { match:/^\/old\/(.*)$/, target:'/new/$1', status:301 }
  ], 301, { 'X-Powered-By':'SHHNode-Redirect' });
</code></pre>

## Action
The redirect handler takes the request.url property and does an HTTP-Redirect using the status property as the HTTP-Status-Code.
By default is does a 302 redirect.

The property match is a RegExp that gets matched. The target is the replacement. What basically happens is:
<pre><code>
  var url = request.url;
  redirects.forEach(function(item) {
    url = url.replace(item.match, item.target);
  });
  headers['Location'] = url;
  headers['Content-Length'] = 0;
  response.writeHead(status, 'Please Go To…', headers);
</code></pre>

This is also why the decision by the dispatcher whether the redirect should be called is still relevant. It determines whether
to redirect, the match property decides what/how to redirect.
