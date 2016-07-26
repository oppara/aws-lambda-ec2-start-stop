"use strict";

var EC2_TAG_FILTERS = {
  Filters: [
    {
      Name: 'tag-key',
      Values: ['Type']
    },
    {
      Name: 'tag-value',
      Values: ['dev']
    }
  ]
};

var JST_OFFSET = '+09:00';


var aws = require('aws-sdk');
var moment = require('moment');
var async = require('async');

aws.config.update({region: 'ap-northeast-1'});

var getNow = function() {
  return  moment().utcOffset(JST_OFFSET);
};

var getHour = function(str) {
  return str.split(':', 2)[0];
};

var getMinute = function(str) {
  return str.split(':', 2)[1];
};
var isValidTime = function(str, key) {
  // null
  if(!str)  {
    console.log(key + ' = null or undefined');
    return false;
  }

  // format
  if(!(str.match(/^[0-9]{1,2}:[0-9][0-9]$/))) {
    console.log('not support format. ' + key + ' = ' + str);
    return false;
  }

  // hour
  if(24 < getHour(str) || 0 > getHour(str)) {
    console.log('not support format(hour). ' + key + ' = ' + str);
    return false;
  }

  // minute
  if(60 < getMinute(str) || 0 > getMinute(str)) {
    console.log('not support format(minute). ' + key + ' = ' + str);
    return false;
  }

  return true;

};

var makeTimeValue = function(str) {
  var now = getNow();
  var month = now.get('month') + 1;

  return moment(now.get('year') + '-' + month + '-' + now.get('date') + ' ' + getHour(str) + ':' + getMinute(str) + ' ' + JST_OFFSET, 'YYYY-MM-DD HH:mm Z');
};

var getTimeValue = function(instance, tagName) {
  var tagValue = '';

  instance.Tags.forEach(function(tag) {
    if (tag.Key === tagName) {
      tagValue = tag.Value;
    }
  });

  if (tagValue === '' || !isValidTime(tagValue, tagName)) {
    return '';
  }

  return makeTimeValue(tagValue);
};

var getInstanceName = function(instance) {
  var name = '';

  instance.Tags.forEach(function(tag) {
    if (tag.Key === 'Name') {
      name = tag.Value;
    }
  });

  return name;
};

var getAction = function(state, start, end) {
  var now = getNow();

  if (start >= end) {
    return 'not support';
  }

  if ((start > now || end <= now) && state === 'running') {
    return 'stop';
  }

  if (start <= now && end > now && state === 'stopped') {
    return 'start';
  }

  return 'nothing';
};

var startInstance = function(ec2, instanceId, callback) {
  var params = {InstanceIds: [instanceId]};

  ec2.startInstances(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return;
    }

    callback();
  });
};

var stopInstance = function(ec2, instanceId, callback) {
  var params = {InstanceIds: [instanceId]};

  ec2.stopInstances(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return;
    }

    callback();
  });
};

exports.handler = function(event, context) {
  var ec2 = new aws.EC2();

  ec2.describeInstances(EC2_TAG_FILTERS, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return;
    }

    if (data.Reservations.length === 0) {
      console.log('No ec2 instance exists.');
      return;
    }

    async.forEach(data.Reservations, function(reservation, callback) {
      var instance = reservation.Instances[0],
        currentState = instance.State.Name,
        instanceId = instance.InstanceId,
        instanceName = getInstanceName(instance),
        start = getTimeValue(instance, 'Start'),
        end = getTimeValue(instance, 'End'),
        log = '',
        action = '';

      log += 'Instance ' + instanceName  + ' id=' + instanceId;

      if (start === '' || end === '') {
        console.log(log + ' State: ' + currentState);
        callback();
        return;
      }

      action = getAction(currentState, start, end);
      console.log(log + ' Action: ' + action);

      if (action === 'start') {
        startInstance(ec2, instanceId, callback);
        return;
      }

      if (action === 'stop') {
        stopInstance(ec2, instanceId, callback);
        return;
      }

      callback();

    }, function() {
      console.log('Done.');
      context.succeed('OK');
    });
  });

  console.log('done.');
};
