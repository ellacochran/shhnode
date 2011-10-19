# SHHnode

SHHnode is a simple framework to facilitate handling HTTP request in node.

## Advantages
The reason this handler abstraction is so useful is because it enables one to quickly put together a small webserver
with a lot of stuff already taken care of. At the same time it doesn't really do a lot and does not remove you(me) the
developer from the raw state of things. You still get the full monty with all the raw power node provides you.

So while it helps a bit in putting things together quickly and keeping them modular, it doesn't interfere. It
doesn't presume to be smarter than you, better than you, or anything of the like. It also does its thing
in a way that anything (as in any handler) you write for use with shhnode can just as easily be used without it in a plain
vanilla http server as done by http.createServer().

**Documentation is included in the docs/ folder of this package!**
