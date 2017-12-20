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

    this._noiseX = 0;
    this._biasX = 1;
    this._biasY = 1;
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

      const topY = random.scale + circumscribingRadius *
        Math.sin(circle.rad + constRad);

      coverDisplayObject(this.displayObject,
        (random.scale + circumscribingRadius *
          Math.cos(Math.min(circle.rad - constRad, 0))) * 2,
        topY + random.scale + inscribingRadius *
          Math.sin(circle.rad - Math.atan(distance / constX)));

      this._width = this.displayObject.width;
      this._height = this.displayObject.height;
      this._x = constX;
      this._y = constY;

      this._h = (topY - this.displayObject.y) / this._height;
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

  update(time) {
    super.update(time);

    if (!this.displayObject.visible) {
      return;
    }

    const delta = (time - this._last) /
      Math.sqrt(this._biasX ** 2 + this._biasY ** 2) *
      this._movement.random.speed;

    const scale = 1 + (1 + Math.sin(time * this._movement.zoom.speed)) *
      this._movement.zoom.scale;

    if (delta > Math.PI) {
      this._last = time;
      this._biasX = Math.min(simplexNoise(this._noiseX, 255) * this._movement.random.scale, 1);
      this._biasY = Math.min(simplexNoise(this._noiseX, 0) * this._movement.random.scale, 1);

      if (this._noiseX % 2 === 0) {
        this._biasX = -this._biasX;
        this._biasY = -this._biasY;
      }

      this._noiseX++;

      this.displayObject.x = this._x * scale;
      this.displayObject.y = this._y * scale;
    } else {
      this.displayObject.x = (this._x + this._biasX * Math.sin(delta)) * scale;
      this.displayObject.y = (this._y + this._biasY * Math.sin(delta)) * scale;
    }

    this.displayObject.x -= this._width * (scale - 1) / 2;
    this.displayObject.y -= this._height * (scale - 1) / 2;

    this.displayObject.rotation = Math.sin(time * this._movement.circle.speed) *
      this._movement.circle.rad;

    this.displayObject.width = this._width * scale;
    this.displayObject.height = this._height * scale;
  }

};
