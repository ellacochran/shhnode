# SHHNode Rewrite Handler

## Initialisation

<pre><code>
  var handler = require('shhnode').rewrite([
    { match:/^\/old\/(.*)$/, target:'/new/$1' }
  ]);
</code></pre>

## Action
The rewrite handler takes the request.url property and rewrites it.

The property match is a RegExp that gets matched. The target is the replacement. What basically happens is:
<pre><code>
  var url = request.url;
  rewrites.forEach(function(item) {
    url = url.replace(item.match, item.target);
  });
  request.url = url;
</code></pre>

This is also why the decision by the dispatcher whether the rewrite should be called is still relevant. It determines whether
to rewrite, the match property decides what/how to rewrite.
