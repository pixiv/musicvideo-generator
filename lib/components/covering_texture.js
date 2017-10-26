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
const { Container, Sprite, Texture } = require('pixi.js');

module.exports = class extends DisplaySynchronic {

  constructor(params, renderer) {
    super(params, new Sprite);

    this._renderer = renderer;
    this.changeParams(params);
  }

  changeParams({ visible, image }) {
    if (!visible) {
      return super.changeParams(...arguments);
    }

    this.displayObject.texture = Texture.from(image);

    if (this.displayObject.texture.baseTexture.hasLoaded) {
      coverDisplayObject(
        this.displayObject,
        this._renderer.width,
        this._renderer.height
      );

      this._promise = Promise.resolve();
    } else {
      this._promise = new Promise(resolve =>
        this.displayObject.texture.baseTexture.once('loaded', () => {
          coverDisplayObject(
            this.displayObject,
            this._renderer.width,
            this._renderer.height
          );

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
