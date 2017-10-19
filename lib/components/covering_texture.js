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
const { Container, Sprite, Texture } = require('pixi.js');

function locate() {
  const { width, height } = this.displayObject.texture.baseTexture;
  const ratio = width / height;

  if (ratio > 1) {
    this.displayObject.width  = this._renderer.height * ratio;
    this.displayObject.height = this._renderer.height;
  } else {
    this.displayObject.height = this._renderer.width / ratio;
    this.displayObject.width  = this._renderer.width;
  }

  this.displayObject.x = (this._renderer.width - this.displayObject.width) / 2;
  this.displayObject.y = (this._renderer.height - this.displayObject.height) / 2;
}

module.exports = class extends DisplaySynchronic {

  constructor(params, renderer) {
    super(params, new Sprite);

    this._renderer = renderer;
    this.changeParams(params);
  }

  changeParams({ image }) {
    this.displayObject.texture = Texture.from(image);

    if (this.displayObject.texture.baseTexture.hasLoaded) {
      locate.call(this);
      this._promise = Promise.resolve();
    } else {
      this._promise = new Promise(resolve =>
        this.displayObject.texture.baseTexture.once('loaded', () => {
          locate.call(this);
          resolve();
        }));
    }

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

};
