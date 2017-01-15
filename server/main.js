import { Meteor } from 'meteor/meteor';

const points = new Meteor.Collection('userStates');
const users = new Meteor.Collection('users');
const goals = new Meteor.Collection('goals');
const problems = new Meteor.Collection('problems');

Meteor.publish('userStateSubscription', () => {
  return points.find()
});

Meteor.publish('usersSubscription', () => {
  return users.find();
});

Meteor.publish('goalsSubscription', () => {
  return goals.find();
});

Meteor.publish('problemsSubscription', () => {
  return problems.find();
});

Meteor.onConnection((conn) => {
  // Add the user when the connection opens
  users.insert({id: conn.id, state: {x: 100, y: 100, u: conn.id, m: 5}});
  // Remove the user when the conection closes
  conn.onClose(() => {
    users.remove({id: conn.id})
  });
});

Meteor.methods({
  'clear': () => { 
    points.remove({});
  },
  'getSessionId': () => {
    return Meteor.status()
  }
});

Meteor.startup(() => {
  // code to run on server at startup
  goal = goals.find({}).count()
  if (!goal) {
    goals.insert({x: 500, y: 100, r: 200})
  }
  problem = problems.find({}).count()
  if (!problem) {
    problems.insert({x: 500, y: 500, r: 25})
  }
});

