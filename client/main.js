import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
// import { Victor } from 'victor';
var Victor = require('victor');
import * as d3 from 'd3';

import './main.html';

const points = new Meteor.Collection('userStates');
const users = new Meteor.Collection('users');
const goals = new Meteor.Collection('goals');
const problems = new Meteor.Collection('problems');


Deps.autorun(() => {
  Meteor.subscribe('userStateSubscription');
  Meteor.subscribe('usersSubscription');
  Meteor.subscribe('goalsStateSubscription');
  Meteor.subscribe('problemsSubscription');
});


Meteor.startup(() => {
  let canvas = new Canvas();

  Deps.autorun(() => {
    let data = users.find({state: {$exists: true}}).fetch();
    let problem = problems.find({}, {limit: 1}).fetch();
    let goal = goals.find({}, {limit: 1}).fetch();

    $('h2').hide();
    if (canvas) {
      canvas.drawGoal(goal);
      canvas.drawProblem(problem);
      canvas.draw(data);
    }
  });
});

Template.canvas.events({
  'mousedown': function (event) {
    Session.set('draw', true);
    markPoint();
  },
  'mouseup': function (event) {
    Session.set('draw', false);
    markPoint();
  },
  'mousemove': function (event) {
    markPoint();
    if (Session.get('draw')) {
      contribute(event);
      checkProblem(event);
    }
  }
});

Template.drawingSurface.events({
  'click input': (event) => {
    Meteor.call('clear', () => {
      // canvas.clear();
    });
  }
});

const markPoint = function() {
  let offset = $('#canvas').offset();
  let connId = Meteor.default_connection._lastSessionId
  let user = users.findOne({id: connId})
  let state = {
    u: connId,
    x: (event.pageX - offset.left),
    y: (event.pageY - offset.top),
    dt: new Date(),
    c: Session.get('draw')
  }
  users.update({_id: user._id}, {$set: {state: state}});
  points.insert(state);
}

const contribute = function(event) { 
  let offset = $('#canvas').offset();
  let problem = problems.findOne({}); 
  let userPos = Victor(
    (event.pageX - offset.left), 
    (event.pageY - offset.top) 
  );
  let problemPos = Victor(problem.x, problem.y);
  let dist = userPos.distance(problemPos);
  if (dist < problem.r) {
    let diff = userPos.subtract(problemPos).normalize();
    // Add the difference to the problem
    // NOTE: this is where normalization will happen
    let newProblemPos = {x: problem.x + diff.x, y: problem.y + diff.y} 
    problems.update({_id: problem._id}, {$set: newProblemPos});
  } 
}

const checkProblem = function(event) {
  let prob = problems.findOne({}); 
  let goal = goals.findOne({}); 
  let probPos = Victor(prob.x, prob.y);
  let goalPos = Victor(goal.x, goal.y);
  let dist = goalPos.distance(probPos);
  if (dist <= goal.r) {
    alert('SUCCESS!')
  }
}

class Canvas {
  constructor() {
    this.svg = this.createSvg();
  }

  createSvg() {
    return d3.select('#canvas').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
  }

  clear() {
    d3.select('svg').remove();
    this.createSvg();
  }

  drawGoal(data) {
    let circles = d3.select('svg')
        .selectAll('.goal')
        .data(data)
   
    // Exit
    circles.exit().remove();
    
    // Update 
    circles
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('stroke-width', 3)
      
    // Enter
    circles.enter().append('circle')
      .attr('class', 'goal')
      .attr('r', (d) => { return d.r })
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('fill', 'red')
  }

  drawProblem(data) {
    let circles = d3.select('svg')
        .selectAll('.problem')
        .data(data)
   
    // Exit
    circles.exit().remove();
    
    // Update 
    circles
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('stroke-width', 3)
      
    // Enter
    circles.enter().append('circle')
      .attr('class', 'problem')
      .attr('r', (d) => { return d.r })
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('fill', 'orange')
  }

  draw(data) {
    let circles = d3.select('svg')
        .selectAll('.user')
        .data(data.map((d) => {return d.state}))
   
    // Exit
    circles.exit().remove();
    
    // Update 
    circles
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('r', (d) => {
        d.c ? r = 13 : r = 10;
        return r
      })
     .style('stroke-width', 3)
      
    // Enter
    circles.enter().append('circle')
      .attr('class', 'user')
      .attr('r', 10)
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('fill', 'steelblue')
  }
}
