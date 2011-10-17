var cookie = module.exports = function(name, manufacturer) {
  var handler = function(request, response, callback) {
    var cookies = cookie.parse(request.headers['cookie'] || '');
    if (!cookies[name]) {
      var header = response.getHeader('Set-Cookie') || [];
      if (header.constructor != Array) header = [ header ];
      var value = String(manufacturer(request, name));
      cookies[name] = value.replace(/^(.*?);\s.*$/,'$1');
      request.headers['cookie'] = cookie.makeFromObject(cookies);
      header.push([name, value].join('='));
      response.setHeader("Set-Cookie", header);
    }
    return callback(undefined, 0);
  };
  handler.parse = cookie.parse;
  handler.make = cookie.make;
  return handler;
};
cookie.makeFromObject = function(obj) {
  var item;
  var res = [];
  for (item in obj) {
    if (obj.hasOwnProperty(item)) {
      res.push([item, obj[item]].join('='));
    }
  }
  return res.join('; ');
};
cookie.parse = function(header) {
  var result = {};
  header = header.split(/;\s/);
  header.forEach(function(item) {
    var value = item.split('=');
    var name = value.shift();
    value = value.join('=');
    result[name] = value;
  });
  return result;
};
cookie.make = function(value, domain, path, expire, httpsonly) {
	path = path || "/";
	expire = (expire && (expire.constructor == Date))?("; expire="+expire.toGMTString()):"";
	domain = domain?("; domain="+domain):"";
	return value+"; path="+path+expire+domain;
};