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

const DisplaySynchronic = require('../../display_synchronic');
const { BLEND_MODES, extras } = require('pixi.js');

module.exports = class extends DisplaySynchronic {

  constructor(textures, params) {
    super(params, new extras.AnimatedSprite(textures));

    this._interval = params.interval * 30;
    this.displayObject.animationSpeed = 1;
    this.displayObject.blendMode = BLEND_MODES.SCREEN;
  }

  changeParams({ interval }) {
    this._interval = interval * 30;
    return super.changeParams(...arguments);
  }

  update(time) {
    super.update(time);

    if (!this.displayObject.visible) {
      return;
    }

    const { totalFrames } = this.displayObject;
    const frame = Math.floor(time * 30) % (totalFrames + this._interval);

    if (frame < totalFrames) {
      this.displayObject. gotoAndStop(frame);
    }
  }

};
