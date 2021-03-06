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
const { Sprite, Texture } = require('pixi.js');

function scale() {
  if (this.displayObject.width < this.displayObject.height) {
    const width = this._renderer.width / 16;
    const scale = width / this.displayObject.width;

    this.displayObject.width = width;
    this.displayObject.height *= scale;
  } else {
    const height = this._renderer.height / 16;
    const scale = height / this.displayObject.height;

    this.displayObject.width *= scale;
    this.displayObject.height = height;
  }

  this.displayObject.x = this._renderer.width * 0.95 - this.displayObject.width;
  this.displayObject.y = this._renderer.height * 0.95 - this.displayObject.height;
}

module.exports = class extends DisplaySynchronic {

  constructor(params, renderer) {
    super({ visible: params.visible }, new Sprite);

    this._renderer = renderer;
    this.changeParams(params);
  }

  changeParams({ visible, alpha, image }, time) {
    if (visible === false) {
      return super.changeParams({ visible }, time);
    }

    const texture = Texture.from(image);

    this._alpha = alpha;
    this.displayObject.texture = texture;

    if (texture.baseTexture.hasLoaded) {
      scale.call(this);
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
              scale.call(this);
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

    return Promise.all([
      super.changeParams({ visible }, time),
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
    this.displayObject.alpha = this._alpha * Math.min(1, time - 1, 8 - time);
  }

};
