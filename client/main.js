import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import * as d3 from 'd3';

import './main.html';

const points = new Meteor.Collection('userStates');
const users = new Meteor.Collection('users');

Deps.autorun(() => {
  Meteor.subscribe('userStateSubscription');
  Meteor.subscribe('usersSubscription');
});


Meteor.startup(() => {
  let canvas = new Canvas();

  Deps.autorun(() => {
    // let data = points.find({}, {sort: {dt: -1}, limit: 1}).fetch();
    let data = users.find({state: {$exists: true}}).fetch();

    $('h2').hide();
    if (canvas) {
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
  }
});

Template.drawingSurface.events({
  'click input': (event) => {
    Meteor.call('clear', () => {
      // canvas.clear();
      console.log('clearing');
    });
  }
});


var markPoint = function() {
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
  users.update({_id: user._id}, {$set: {state: state}})
  points.insert(state)
}

class Canvas {
  constructor() {
    this.svg = this.createSvg();
    this.addUser();
  }

  createSvg() {
    return d3.select('#canvas').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
  }
 
  addUser() {
    d3.select('svg').append('circle')
        .attr('r', 10)
        .attr('cx', 100)
        .attr('cy', 100)
        .style('fill', 'steelblue')
        .style('opacity', .3)
  }

  clear() {
    d3.select('svg').remove();
    this.createSvg();
  }

  draw(data) {
    let circles = d3.select('svg')
        .selectAll('circle')
        .data(data.map((d) => {return d.state}))
   
    // Exit
    circles.exit().remove();
    
    // Update 
    circles
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('r', (d) => {
        let r;
        d.c ? r = 13 : r = 10;
        return r
      })
     .style('stroke-width', 3)
      
    // Enter
    circles.enter().append('circle')
      .attr('r', 10)
      .attr('cx', (d) => { return d.x })
      .attr('cy', (d) => { return d.y })
      .style('fill', 'steelblue')
  }
}
