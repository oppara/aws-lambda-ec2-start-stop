'use strict';
var moment = require('moment');
var JST_OFFSET = '+09:00';

var getHour = function(str) {
  var hour = str.split(':', 2)[0];

  if (hour < 0 || hour > 24) {
    return '';
  }

  return hour;
};

var getMinute = function(str) {
  var min = str.split(':', 2)[1];

  if (min < 0 || min >= 60) {
    return '';
  }

  return min;
};

var parseIntMap = function(arr) {
  return arr.map(function(value, idx) {
    return parseInt(value, 10);
  });
};

var parseRange = function(str) {
  var ret = [],
    start = str.split('-')[0],
    end = str.split('-')[1];

  while(start <= end) {
    ret.push(start);
    start++;
  }

  return ret;
};

module.exports = {
  create: function(now, str) {
    var y = now.get('year'),
      m = now.get('month') + 1,
      d = now.get('date'),
      hour = getHour(str),
      min = getMinute(str);

    if (hour === '' || min === '') {
      return '';
    }

    return moment(y + '-' + m  + '-' + d + ' ' + hour + ':' + min + ' ' + JST_OFFSET, 'YYYY-MM-DD HH:mm Z');
  },

  getWeeks: function(str) {
    var weeks;

    if (str.indexOf(',') > 0) {
      weeks = str.split(',');
    }
    else if (str.indexOf('-') === 1) {
      weeks = parseRange(str);
    }
    else {
      weeks = str !== '' ? [str] : [];
    }

    return parseIntMap(weeks);
  },

  inWeeks: function(now, weeks) {
    var idx = now.format('d');
    return weeks.some(function(val) {
      return parseInt(val, 10) === parseInt(idx, 10);
    });
  },

  now: function() {
    return  moment().utcOffset(JST_OFFSET);
  }
};

