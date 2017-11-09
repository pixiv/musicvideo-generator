/*
 * Copyright (C) 2017 pixiv Inc.
 *
 * This file is part of musicvideo-generator.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { Limitter, biasVolume } = require('../audio');
const DisplaySynchronic = require('../display_synchronic');
const PIXI = require('pixi.js');

class RandomGenerator {
  constructor(seed) {
    this._seed = seed;
  }

  generate() {
    this._seed ^= this._seed << 13;
    this._seed ^= this._seed >> 17;
    this._seed ^= this._seed << 5;

    return this._seed;
  }

  generateBrightness() {
    return Math.abs(this.generate() % 128);
  }
}

RandomGenerator.MAX = 2 ** 32;

module.exports = class extends DisplaySynchronic {

  constructor(params, audioAnalyser, renderer) {
    super(params, new PIXI.Graphics);

    this._limitter = new Limitter(params.limit, audioAnalyser);
    this._renderer = renderer;
    this._seed = Math.abs(Math.round(Math.random() * RandomGenerator.MAX));
  }

  initialize() {
    const promise = Promise.all([
      super.initialize(...arguments),
      this._limitter.initialize(...arguments),
    ]);

    this.displayObject.removeChildren();

    return promise;
  }

  start() {
    super.start(...arguments);
    this._limitter.start(...arguments);
  }

  stop() {
    super.stop(...arguments);
    this._limitter.stop(...arguments);
  }

  update(time) {
/*
    if ((time % 1) < 0.9) {
      return;
    }
*/
    this._limitter.update(time);

    const wet = biasVolume(this._limitter.wet);

    const randomGenerator = new RandomGenerator(this._seed);
    const vertices = 6;
    const diameter = Math.min(this._renderer.width, this._renderer.height) * 0.1;
    const radius = diameter * (0.25 + Math.min(wet, 1) / 4);
    const baseColor = 0xdd0000;
    const r = (baseColor >> 16) & 0xff;
    const g = (baseColor >> 8) & 0xff;
    const b = baseColor & 0xff;
    const radianPerVertex = Math.PI * 2 / vertices;

    for (let y = 0; ; y += diameter) {
      for (let x = randomGenerator.generate() % diameter; ; x += diameter) {
        this.displayObject.beginFill((Math.min((r + randomGenerator.generateBrightness()), 0xff) << 16) | (Math.min(g + randomGenerator.generateBrightness(), 0xff) << 8) | Math.min(b + randomGenerator.generateBrightness(), 0xff));

        this.displayObject.moveTo(x + radius, y);
        for (let vertex = 1; vertex < vertices; vertex++) {
          const radian = radianPerVertex * vertex;
          this.displayObject.lineTo(x + Math.cos(radian) * radius, y + Math.sin(radian) * radius);
        }

        this.displayObject.endFill();

        if (x > this._renderer.width) {
          break;
        }
      }

      if (y > this._renderer.height) {
        break;
      }
    }
  }

};
