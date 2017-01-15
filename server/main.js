import { Meteor } from 'meteor/meteor';

const points = new Meteor.Collection('userStates');
const users = new Meteor.Collection('users');

Meteor.publish('userStateSubscription', () => {
  return points.find()
});

Meteor.publish('usersSubscription', () => {
  return users.find();
});


Meteor.onConnection((conn) => {
  // Add the user when the connection opens
  users.insert({id: conn.id, state: {x: 100, y: 100, u: conn.id}});
  // Remove the user when the conection closes
  conn.onClose(() => {
    users.remove({id: conn.id})
  });
});


Meteor.methods({
  'clear': () => { 
    points.remove({});
    console.log('clearing')
  },
  'getSessionId': () => {
    return Meteor.status()
  }
});

Meteor.startup(() => {
  // code to run on server at startup
});

