var fs = require("fs");
var path = require("path");
var async = require("async");

var makeHeaders = require('./util-resolve.js');

var resolveURL = function(url, webroot) {
  url = path.join(webroot, url);
  return (url.substr(0, webroot.length) == webroot)?url:undefined;
};
var resolveURLs = function(urls, webroot) {
  if ("string" == typeof urls) urls = [ urls ];
  if (!urls || (urls.constructor != Array) || !urls.length) return [];
  return urls.map(function(url) { 
    return resolveURL(url, webroot); 
  }).filter(function(url) {
    return url ? true : false;
  });
};
var contentType = (function() {
  var types = {
    "aiff": "audio/x-aiff",
    "arj": "application/x-arj-compressed",
    "asf": "video/x-ms-asf",
    "asx": "video/x-ms-asx",
    "au": "audio/ulaw",
    "avi": "video/x-msvideo",
    "bcpio": "application/x-bcpio",
    "ccad": "application/clariscad",
    "cod": "application/vnd.rim.cod",
    "com": "application/x-msdos-program",
    "cpio": "application/x-cpio",
    "cpt": "application/mac-compactpro",
    "csh": "application/x-csh",
    "css": "text/css; charset=utf-8",
    "deb": "application/x-debian-package",
    "dl": "video/dl",
    "doc": "application/msword",
    "drw": "application/drafting",
    "dvi": "application/x-dvi",
    "dwg": "application/acad",
    "dxf": "application/dxf",
    "dxr": "application/x-director",
    "etx": "text/x-setext",
    "ez": "application/andrew-inset",
    "fli": "video/x-fli",
    "flv": "video/x-flv",
    "gif": "image/gif",
    "gl": "video/gl",
    "gtar": "application/x-gtar",
    "gz": "application/x-gzip",
    "hdf": "application/x-hdf",
    "hqx": "application/mac-binhex40",
    "html": "text/html; charset=utf-8",
    "ice": "x-conference/x-cooltalk",
    "ief": "image/ief",
    "igs": "model/iges",
    "ips": "application/x-ipscript",
    "ipx": "application/x-ipix",
    "jad": "text/vnd.sun.j2me.app-descriptor",
    "jar": "application/java-archive",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript; charset=utf-8",
    "json": "application/json; charset=utf-8",
    "latex": "application/x-latex",
    "lsp": "application/x-lisp",
    "lzh": "application/octet-stream",
    "m": "text/plain",
    "m3u": "audio/x-mpegurl",
    "man": "application/x-troff-man",
    "md": "text/x-markdown; charset=utf-8",
    "me": "application/x-troff-me",
    "midi": "audio/midi",
    "mif": "application/x-mif",
    "mime": "www/mime",
    "movie": "video/x-sgi-movie",
    "mp3":"audio/mpeg",
    "mp4": "video/mp4",
    "mpg": "video/mpeg",
    "mpga": "audio/mpeg",
    "ms": "application/x-troff-ms",
    "nc": "application/x-netcdf",
    "oda": "application/oda",
    "ogm": "application/ogg",
    "pbm": "image/x-portable-bitmap",
    "pdf": "application/pdf",
    "pgm": "image/x-portable-graymap",
    "pgn": "application/x-chess-pgn",
    "pgp": "application/pgp",
    "pm": "application/x-perl",
    "png": "image/png",
    "pnm": "image/x-portable-anymap",
    "ppm": "image/x-portable-pixmap",
    "ppz": "application/vnd.ms-powerpoint",
    "pre": "application/x-freelance",
    "prt": "application/pro_eng",
    "ps": "application/postscript",
    "qt": "video/quicktime",
    "ra": "audio/x-realaudio",
    "rar": "application/x-rar-compressed",
    "ras": "image/x-cmu-raster",
    "rgb": "image/x-rgb",
    "rm": "audio/x-pn-realaudio",
    "rpm": "audio/x-pn-realaudio-plugin",
    "rtf": "text/rtf",
    "rtx": "text/richtext",
    "scm": "application/x-lotusscreencam",
    "set": "application/set",
    "sgml": "text/sgml",
    "sh": "application/x-sh",
    "shar": "application/x-shar",
    "silo": "model/mesh",
    "sit": "application/x-stuffit",
    "skt": "application/x-koan",
    "smil": "application/smil",
    "snd": "audio/basic",
    "sol": "application/solids",
    "spl": "application/x-futuresplash",
    "src": "application/x-wais-source",
    "stl": "application/SLA",
    "stp": "application/STEP",
    "sv4cpio": "application/x-sv4cpio",
    "sv4crc": "application/x-sv4crc",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tar": "application/x-tar",
    "tcl": "application/x-tcl",
    "tex": "application/x-tex",
    "texinfo": "application/x-texinfo",
    "tgz": "application/x-tar-gz",
    "tiff": "image/tiff",
    "tr": "application/x-troff",
    "tsi": "audio/TSP-audio",
    "tsp": "application/dsptype",
    "tsv": "text/tab-separated-values",
    "txt": "text/plain; charset=utf-8",
    "unv": "application/i-deas",
    "ustar": "application/x-ustar",
    "vcd": "application/x-cdlink",
    "vda": "application/vda",
    "vivo": "video/vnd.vivo",
    "vrm": "x-world/x-vrml",
    "wav": "audio/x-wav",
    "wax": "audio/x-ms-wax",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "wmx": "video/x-ms-wmx",
    "wrl": "model/vrml",
    "wvx": "video/x-ms-wvx",
    "xbm": "image/x-xbitmap",
    "xlw": "application/vnd.ms-excel",
    "xml": "text/xml",
    "xpm": "image/x-xpixmap",
    "xwd": "image/x-xwindowdump",
    "xyz": "chemical/x-pdb",
    "zip": "application/zip"
  };
  return function(filename) {
    var ext = path.extname(filename).substr(1);
    return types[ext] || "application/octet-stream";
  };
})();

var serveFile = function(file, stat, status, headers, request, response, callback) {
  var etag = JSON.stringify([ stat.ino, stat.size, Date.parse(stat.mtime) ].join('-'));
  headers = makeHeaders(headers);
  
  headers['Content-Type'] = headers['Content-Type'] || contentType(file);
  headers['Accept-Ranges'] = "bytes";
  
  if (!status && (request.headers['if-none-match'] == etag)) {
    headers['ETag'] = etag;
    headers['Last-Modified'] = stat.mtime.toUTCString();
    status = 304;
    headers['Content-Length'] = 0;
  } else if (!status && (Date.parse(request.headers['if-modified-since']) > stat.mtime.getTime())) {
    headers['ETag'] = etag;
    headers['Last-Modified'] = stat.mtime.toUTCString();
    status = 304;
    headers['Content-Length'] = 0;
  } else if (!status) {
    headers['ETag'] = etag;
    headers['Last-Modified'] = stat.mtime.toUTCString();
    status = 200;
    headers['Content-Length'] = stat.size;
  } else {
    headers['Content-Length'] = stat.size;
    delete headers['Accept-Ranges'];
  }

  if (status < 299) {
    if (request.headers && request.headers['range'] && (request.headers['range'].substr(0,6) == 'bytes=')) {
      var parts;
      var range = request.headers['range'].substr(6);
      if (range.match(/^\d+-\d+$/)) {
        parts = range.split(/-/);
        range = { from:parseInt(parts[0]), to:parseInt(parts[1]) };
      } else if (range.match(/^-\d+$/)) {
        range = { to:parseInt(range) };
        range.from = stat.size - range.to - 1;
      } else if (range.match(/^\d+$/)) {
        range = { from:parseInt(range), to:stat.size-1 };
      } else {
        range = undefined;
      }
      if (range) {
        range.from = (range.from > -1) ? range.from : 0;
        if (range.from >= stat.size) { console.log("a"); status=416; }
        if (range.to < range.from)  { console.log("b: ("+range.to+" < "+range.from+")"); status=416; }
        if (range.to >= stat.size)  { console.log("c"); status=416; }
        if (status < 400) {
          range.file = file;
          headers['Content-Range'] = 'bytes '+range.from+"-"+range.to+"/"+stat.size;
          headers['Content-Length'] = (range.to - range.from)+1;
          headers['Connection'] = 'close';
          delete headers['ETag']; // We only have E-Tags for the entire file;
          status = 206;
        }
      }
    }
  }
  var message;
  switch(status) {
    case 206 : message="Partial Content"; break;
    case 304 : message="Not Modified"; break;
    case 416 : message="Range not satisfied"; break;
    default : message="OK";
  }
  response.writeHead(status, message, headers);
  if ((status == 304) || ([ 304, 416 ].indexOf(status) != -1) || (request.method == 'HEAD')) {
    response.end();
    return callback(undefined, status);
  }
  
  streamFile((status==206)?range:file, response, function(err) {
    callback(err, status);
  });
};

var streamFile = function(file, response, callback) {
  var options = {'flags': 'r', 'encoding':'binary', 'mode': 0666, 'bufferSize': 4 * 1024};
  if ('object' == typeof file) {
    options.start = file.from;
    options.end = file.to + 1;
    file = file.file;
  };
  var stream = fs.createReadStream(file, options);
  if (!stream) return callback(new Error('File Error'));
  stream.on("end", function() {
    if ('function' != typeof callback) return;
    var cb = callback;
    callback=undefined;
    cb(undefined);
    response.end();
  });
  stream.on("error", function(error) { 
    if ('function' != typeof callback) return;
    var cb = callback;
    callback=undefined;
    cb(error, 500);
  });
  stream.on("data", function(data) {
    response.write(data,'binary');
  });
};

var httpStatic = function(webroot, headers, urls, request, response, callback) {  
  urls = resolveURLs(urls, webroot);
  urls = urls.map(function(url) {
    return function(status, callback) {
      if (status) return callback(undefined, status);
      fs.stat(url, function(err, stat) {
        if (err || !stat) return callback(undefined, 0);
        if (!stat.isFile()) return callback(undefined, 0);
        serveFile(url, stat, status, headers, request, response, callback);
      });
    };
  });
  urls.unshift(function(callback) { return callback(undefined, 0); });
  async.waterfall(urls, function(err, status) {
    if ('function' == typeof callback) callback(err, status);
  });
};

var sendFile = function(file, status, headers, response, callback) {
  fs.stat(file, function(err, stat) {
    if (err || !stat) return ('function' == typeof callback) ? callback(err || new Error('No such file'), status) : undefined;
    serveFile(file, stat, status, headers, {}, response, callback);
  });
};

module.exports = function(webroot, headers, urlmaker) {
  webroot = path.resolve(webroot);
  headers = headers || {};
  var handler = function(request, response, callback) {
    var urls;
    if ('function' == typeof urlmaker) {
      urls = urlmaker(request.url);
    } else {
      urls = [ request.url ];
    }
    return httpStatic(webroot, headers, urls, request, response, callback);
  };
  handler.sendFile = sendFile;
  return handler;
};
module.exports.sendFile = sendFile;
