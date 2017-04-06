'use strict';

const Lane = require('./lane');

/**
 * Represents an intersection.
 * @Type Intersection
 */
class Intersection {
  /**
   * Creates a new intersection.
   * @param {number} red      Specified time for the lights to remain red
   * @param {number} yellow   Specified time for the lights to remain yellow
   * @param {function} sleep  An async function that is called with the time to sleep the
   * program if needed. It should return a promise.
   * @return {Intersection}
   */
  static create(...args) {
    return new Intersection(...args);
  }

  constructor({ red, yellow } = {}, sleep) {
    this.yellowTime = yellow;
    this.greenTime = red - yellow;
    this.sleep = sleep;

    // This lanes array practically is a queue. The first element, is the one who should be
    // moving and the second element is one that it is queued to be moving next and so on.
    // The ordering in the lane is important, because it keeps tracks of which lane is
    // moving(green or yellow) and the least recently moving lane to start moving after this lane.
    // When a lane light becomes red it should be moved the back of the queue.
    this.lanes = [];

    // This tracks whether the intersection simulation should be running or not.
    this.running = false;
  }

  /**
   * Adds and creates a new lane. It takes same params as Lane.create.
   * @param args
   * @returns {Lane}
   */
  addLane(...args) {
    const lane = Lane.create(...args);
    this.lanes.push(lane);
    return lane;
  }

  /**
   * Returns a copy of the lanes.
   * @return {Array<Lane>}
   */
  getLanes() {
    return this.lanes.slice();
  }

  /**
   * Sets a lane light to green.
   * If a lane is provided it will set it to green and move it to the first element of lanes array.
   * If no lane is provided it will set the next lane that should become green from the queue.
   * @param {Lane} lane Optional
   */
  setGreen(lane) {
    const movingLane = this.getMovingLane();

    // If it's the lane is green already don't do anything.
    if (lane === movingLane) {
      lane.setGreen();
      return;
    }

    this.lanes.push(this.lanes.shift());
    movingLane.setRed();

    if (lane) {
      this.lanes.splice(this.lanes.indexOf(lane), 1);
      this.lanes.unshift(lane);
    } else {
      lane = this.lanes[0];
    }

    lane.setGreen();
  }

  /**
   * Sets a lane light to yellow.
   * If a lane is provided, it will move it to the beginning of the list.
   * If no lane is provided, it will set the lane that should have green light, yellow.
   * @param {Lane} lane
   */
  setYellow(lane) {
    if (lane) {
      this.setGreen(lane);
    } else {
      lane = this.getMovingLane();
    }
    lane.setYellow();
  }

  /**
   * Gets the lane that should be moving.
   * @return {Lane}
   */
  getMovingLane() {
    return this.lanes[0];
  }

  /**
   * Start the simulation.
   * If no lane is green, it will set one.
   * @return {Promise}
   */
  start() {
    if (!this.getMovingLane().isMoving()) {
      this.setGreen();
    }
    this.running = true;

    return (async () => {
      while (this.running) {
        await this.sleep(this.greenTime);
        this.setYellow();
        await this.sleep(this.yellowTime);
        this.setGreen();
      }
    })();
  }

  /**
   * Stop the simulation.
   */
  stop() {
    this.running = false;
  }
}

Intersection.Lane = Lane;

module.exports = Intersection;