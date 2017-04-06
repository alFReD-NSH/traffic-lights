'use strict';

const Intersection = require('../lib/intersection');
const { expect } = require('chai');

describe('Intersection', () => {
  it('create', () => {
    const intersection = Intersection.create();
    expect(intersection).instanceof(Intersection);
  });
  it('addLane', () => {
    const LANE_NAME = 'NS';
    const intersection = Intersection.create();
    const lane = intersection.addLane(LANE_NAME);
    expect(lane).to.be.instanceof(Intersection.Lane);
    expect(lane.name).to.be.equal(LANE_NAME);
    const lanes = intersection.getLanes();
    expect(lanes).to.be.eql([lane]);
  });
  it('setGreen', () => {
    const intersection = Intersection.create();
    const nsLane = intersection.addLane('NS');
    const ewLane = intersection.addLane('EW');
    intersection.setGreen();
    expect(intersection.getMovingLane()).to.be.oneOf([nsLane, ewLane]);
    intersection.setGreen(nsLane);
    expect(nsLane.getColor()).to.be.equal('green');
    expect(ewLane.getColor()).to.be.equal('red');
    intersection.setGreen(ewLane);
    expect(nsLane.getColor()).to.be.equal('red');
    expect(ewLane.getColor()).to.be.equal('green');
    const trainLane = intersection.addLane('train');
    intersection.setGreen(trainLane);
    expect(nsLane.getColor()).to.be.equal('red');
    expect(ewLane.getColor()).to.be.equal('red');
  });
  it('setYellow', () => {
    const intersection = Intersection.create();
    const nsLane = intersection.addLane('NS');
    const ewLane = intersection.addLane('EW');
    intersection.setYellow();
    expect(intersection.getMovingLane()).to.be.oneOf([nsLane, ewLane]);
    intersection.setGreen(ewLane);
    intersection.setYellow();
    expect(ewLane.getColor()).to.be.equal('yellow');
    intersection.setYellow(nsLane);
    expect(ewLane.getColor()).to.be.equal('red');
    expect(nsLane.getColor()).to.be.equal('yellow');
  });
  it('getMovingLane', () => {
    const intersection = Intersection.create();
    const nsLane = intersection.addLane('NS');
    const ewLane = intersection.addLane('EW');
    intersection.setGreen(nsLane);
    expect(intersection.getMovingLane()).to.be.equal(nsLane);
    intersection.setGreen(ewLane);
    expect(intersection.getMovingLane()).to.be.equal(ewLane);
  });
  describe('start/stop', () => {
    it('Should set a lane to green when there\'s none', (done) => {
      const intersection = Intersection.create({}, () => {
        intersection.stop();
      });
      const lanes = [intersection.addLane('NS'), intersection.addLane('EW')];
      intersection.start().then(done, done);
      const movingLane = intersection.getMovingLane();
      expect(movingLane).to.be.oneOf(lanes);
      expect(movingLane.getColor()).to.be.equal('green');
      expect(lanes.find((lane) => !lane.isMoving())).to.be.ok;
    });
    it('check everything', (done) => {
      const times = {
        red: 10,
        yellow: 1,
      };
      let timePassed = 0;
      const intersection = Intersection.create(times, function sleep(time) {
        timePassed += time;
      });
      const nsLane = intersection.addLane('NS');
      const ewLane = intersection.addLane('EW');
      intersection.setGreen(nsLane);

      // Since nsLane.on('change') is used to track what's going on, we use a generator to check
      // the states on each stage. This way we don't have to keep track which stage are we on.
      let testIterator = (function* () {
        // First stage is when ns becomes yellow from green
        let oldColor = yield;
        expect(timePassed).to.be.equal(9);
        expect(oldColor).to.be.equal('green');
        expect(nsLane.getColor()).to.be.equal('yellow');

        // ns becomes red from yellow
        oldColor = yield;
        expect(timePassed).to.be.equal(10);
        expect(oldColor).to.be.equal('yellow');
        expect(nsLane.getColor()).to.be.equal('red');

        // ns later becomes green and by this time, ew must be red.
        yield;
        expect(nsLane.getColor()).to.be.equal('green');
        expect(timePassed).to.be.equal(20);
        expect(ewLane.getColor()).to.be.equal('red');

        intersection.stop();
      })();
      testIterator.next();
      nsLane.on('change', (oldColor) => {
        testIterator.next(oldColor);
      });
      intersection.start().then(done, done);
    });
  });
});