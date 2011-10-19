/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT OpenSource License
** LICENSE should have been included in this package
*/

module.exports = function(original) {
  var duplicate = {};
  var item;
  for (item in original) {
    var val = original[item];
    switch(typeof val) {
      case 'function':
        val = val();
        break;
      case 'object':
        if (!val) { val=undefined; break; }
        if (Array == val.constructor) { break; }
        if (Date == val.constructor) { val=val.toUTCString(); break; }
        val = Object.keys(val).map(function(name) { return name+'='+val[name]; }).join('; ');
        break;
      default:
        val = String(val);
    }
    duplicate[item] = val;
  }
  return duplicate;
};
