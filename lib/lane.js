'use strict';

const EventEmitter = require('events');

/**
 * Represents a lane, should be created by intersection.
 * @type {Lane}
 * @Inherits {EventEmitter}
 */
module.exports = class Lane extends EventEmitter {
  /**
   * Create a new lane which is red by default
   * @param {String} name
   */
  static create(name) {
    return new Lane(name);
  }

  constructor(name) {
    super();
    this.name = name;
    this.setRed();
  }

  /**
   * Returns the color, either 'red', 'green', 'yellow'
   * @return {String}
   */
  getColor() {
    return this.color;
  }

  /**
   * Returns the color, either 'red', 'green', 'yellow'
   * @return {String}
   */
  setColor(color) {
    const oldColor = this.getColor();
    if (oldColor === color) {
      return;
    }
    this.color = color;
    this.emit('change', oldColor);
  }

  /**
   * Sets color to green
   */
  setGreen() {
    this.setColor('green');
  }

  /**
   * Sets color to yellow
   */
  setYellow() {
    this.setColor('yellow');
  }

  /**
   * Sets color to red
   */
  setRed() {
    this.setColor('red');
  }

  /**
   * Returns if the color is green or yellow
   * @return {boolean}
   */
  isMoving() {
    return this.color === 'green' || this.color === 'yellow';
  }
};
