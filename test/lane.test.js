'use strict';

const Lane = require('../lib/lane');
const expect = require('chai').expect;
const assert = require('assert');

describe('Lane', () => {
  describe('Change event', () => {
    it('different color', (done) => {
      const lane = Lane.create('sw');
      lane.on('change', (oldColor) => {
        expect(oldColor).to.be.equal('red');
        expect(lane.getColor()).to.be.equal('green');
        done();
      });
      lane.setGreen();
    });
    it('change to same color shouldn\'t emit event', () => {
      const lane = Lane.create('sw');
      lane.on('change', () => assert.fail('Change event was emitted when the color wasnt' +
        ' changed'));
      lane.setRed();
    });
  });
});