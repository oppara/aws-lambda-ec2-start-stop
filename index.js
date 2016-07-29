'use strict';

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

var STATE_RUNNING = 'running';

var ACTION_START = 'start';
var ACTION_STOP = 'stop';
var ACTION_NOTHING = 'nothing';

var aws = require('aws-sdk');
var async = require('async');
var date = require('./lib/date.js');

aws.config.update({region: 'ap-northeast-1'});

var getTagValue = function(instance, tagName) {
  var name = '';
  instance.Tags.forEach(function(tag) {
    if (tag.Key === tagName) {
      name = tag.Value;
    }
  });

  return name;
};

var getInstanceName = function(instance) {
  return getTagValue(instance, 'Name');
};


var getAction = function(instance) {
      var now = date.now(),
        state = instance.State.Name,
        weeks = date.getWeeks(getTagValue(instance, 'BusinessDay')),
        start = date.create(now, getTagValue(instance, 'Start')),
        end = date.create(now, getTagValue(instance, 'End'));

      if (weeks.length > 0 && !date.inWeeks(now, weeks)) {
        console.log('condition: holyday!');
        return state === STATE_RUNNING ? ACTION_STOP : ACTION_NOTHING;
      }

      if (start === '' && end === '') {
        console.log('condition: not specify start and stop');
        return ACTION_NOTHING;
      }

      if (end <= now) {
        console.log('condition: end <= now');
        return state === STATE_RUNNING ? ACTION_STOP : ACTION_NOTHING;
      }

      if (start <= now) {
        console.log('condition: start <= now');
        return state !== STATE_RUNNING ? ACTION_START : ACTION_NOTHING;
      }

      console.log('No conditions');

      return ACTION_NOTHING;
};

var handleInstance = function(action, ec2, instanceId, callback) {
  var params = { InstanceIds: [instanceId] },
    method = action === ACTION_START ? 'startInstances' : 'stopInstances';

  ec2[method](params, function(err, data) {
    if (err) {
      console.log('id:' + instanceId + ' ' + action + ' unsuccessfully');
      console.error(err, err.stack);
    } else {
      console.log('id:' + instanceId + ' ' + action + ' successfully');
    }
    callback();
  });

};

exports.handler = function(event, context) {
  var ec2 = new aws.EC2();

  console.log('Start.');

  ec2.describeInstances(EC2_TAG_FILTERS, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      return;
    }

    if (data.Reservations.length === 0) {
      console.log('No ec2 instance exists.');
      return;
    }

    async.forEach(data.Reservations, function(reservation, callback) {
      var instance = reservation.Instances[0],
        instanceId = instance.InstanceId,
        action = '';

      console.log('Check Instance ' + getInstanceName(instance));
      console.log('id:' + instanceId);
      console.log('state:' + instance.State.Name);

      action = getAction(instance);
      console.log('action:' + action);

      if (action === ACTION_START || action === ACTION_STOP) {
        handleInstance(action, ec2, instanceId, callback);
        return;
      }

      callback();

    }, function() {
      console.log('Done.');
      context.succeed('OK');
    });
  });

};
