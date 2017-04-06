'use strict';

const Intersection = require('./lib/intersection');
const secToMin = require('sec-to-min');
const chalk = require('chalk');

// By default sleep doesn't stop the program
let sleep = () => {};
let multiplier = 1000;

if (process.argv.includes('--realtime')) {
  // Since it was asked to be done in realtime, we bring some setTimeout to have some waiting
  sleep = (time) => new Promise((resolve) => setTimeout(resolve, time * multiplier));10;

  if (process.argv.includes('--fast')) {
    multiplier = 5;
  }
}

let timer = 0;
const intersection = Intersection.create({
  red: 60 * 5,
  yellow: 30,
}, (time) => {
  timer += time;
  if (timer >= 60 * 30) {
    intersection.stop();
  }
  return sleep(time);
});

addLane('NS');
addLane('EW');
intersection.start();

function addLane(name) {
  const lane = intersection.addLane(name);
  lane.on('change', (oldColor) => {
    const newColor = lane.getColor();
    console.log(
      'At time', chalk.bold(secToMin(timer)),
      'lane', chalk.bold(name),
      'changed from', chalk[oldColor](oldColor),
      'to', chalk[newColor](newColor));
  });
}
