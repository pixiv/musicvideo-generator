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

const DisplaySynchronic = require('../display_synchronic');
const coverDisplayObject = require('../cover_display_object');
const simplexNoise = require('../simplexNoise');
const { Sprite, Texture } = require('pixi.js');

module.exports = class extends DisplaySynchronic {

  constructor(params, renderer) {
    super(params, new Sprite);

    this._last = 0;
    this._renderer = renderer;
    this.changeParams(params);
  }

  /* 0 < rad < Math.PI / 2 */
  changeParams({
    visible,
    movement: {
      circle = { rad: 0, scale: 0, speed: 0 },
      random = { scale: 0, speed: 0 },
      zoom = { scale: 0, speed: 0 },
    } = {},
    image,
  }) {
    if (visible === false) {
      return super.changeParams(...arguments);
    }

    this._bias = [ { x: 0, y: 0 }, { x: 0, y: 0 } ];

    this._movement = {
      circle: { rad: circle.rad, speed: circle.speed },
      random: { scale: random.scale, speed: random.speed },
      zoom: { scale: zoom.scale, speed: zoom.speed },
    };

    const texture = Texture.from(image);
    this.displayObject.texture = texture;

    if (texture.baseTexture.hasLoaded) {
      this._promise = Promise.resolve();
    } else {
      this._promise = new Promise((resolve, reject) => {
        const listeners = [
          [
            'error',
            () => {
              removeListeners();
              reject();
            },
          ], [
            'loaded',
            () => {
              removeListeners();
              resolve();
            },
          ],
        ];

        for (const listener of listeners) {
          texture.baseTexture.on(...listener);
        }

        function removeListeners() {
          for (const listener of listeners) {
            texture.baseTexture.removeListener(...listener);
          }
        }
      });
    }

    this._promise = this._promise.then(() => {
      const distance = this._renderer.width * circle.scale /
        Math.cos(circle.rad + Math.PI * 1.5);

      const constX = this._renderer.width / 2;
      const constXSquare = constX ** 2;
      const constY = this._renderer.height + distance;
      const circumscribingRadius = Math.sqrt(constXSquare + constY ** 2);
      const inscribingRadius = Math.sqrt(constXSquare + distance ** 2);
      const constRad = Math.atan(constY / constX);
      const randomScale = random.scale * 4;

      const topY = randomScale + circumscribingRadius *
        Math.sin(circle.rad + constRad);

      coverDisplayObject(this.displayObject,
        (randomScale + circumscribingRadius *
          Math.cos(Math.min(circle.rad - constRad, 0))) * 2,
        topY + randomScale + inscribingRadius *
          Math.sin(circle.rad - Math.atan(distance / constX)));

      this._width = this.displayObject.width;
      this._height = this.displayObject.height;
      this._x = constX;
      this._y = constY;

      this.displayObject.anchor.set(
        0.5, (topY - this.displayObject.y) / this._height);
    });

    return Promise.all([
      super.changeParams(...arguments),
      this._promise,
    ]);
  }

  initialize() {
    return Promise.all([
      super.initialize(...arguments),
      this._promise,
    ]);
  }

  _calculateBias(time) {
    const noise = simplexNoise(time, 0) * Math.PI;

    return {
      x: Math.sin(noise) * this._movement.random.scale,
      y: Math.cos(noise) * this._movement.random.scale,
    };
  }

  update(time) {
    super.update(time);

    if (!this.displayObject.visible) {
      return;
    }

    const timeForRandom = time * this._movement.random.speed;

    const periods = [
      (timeForRandom / Math.PI + 0.5) / 2,
      timeForRandom / (Math.PI * 2),
    ];

    const lastPeriods = [
      this._last / (Math.PI * 2),
      (this._last / Math.PI + 0.5) / 2,
    ];

    const biasScale = [
      1 + Math.sin(timeForRandom + Math.PI / 2),
      1 + Math.sin(timeForRandom),
    ];

    const scale = 1 + (1 + Math.sin(time * this._movement.zoom.speed)) *
      this._movement.zoom.scale;

    if (periods[0] !== lastPeriods[0]) {
      this._bias[0] = this._calculateBias(timeForRandom);
    }

    if (periods[1] !== lastPeriods[1]) {
      this._bias[1] = this._calculateBias(timeForRandom);
    }

    this._last = timeForRandom;

    this.displayObject.x = (this._x + this._bias[0].x * biasScale[0] + this._bias[1].x * biasScale[1]) * scale -
      this._width * (scale - 1) / 2;

    this.displayObject.y = (this._y + this._bias[0].y * biasScale[0] + this._bias[1].y * biasScale[1]) * scale -
      this._height * (scale - 1) / 2;

    this.displayObject.rotation = Math.sin(time * this._movement.circle.speed) *
      this._movement.circle.rad;

    this.displayObject.width = this._width * scale;
    this.displayObject.height = this._height * scale;
  }

};
