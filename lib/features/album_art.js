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

const CoveringTexture = require('../components/covering_texture');
const Particle = require('../components/particle');
const Graphics = require('../graphics');
const Filter = require('../filter');
const PIXI = require('pixi.js');

module.exports = class extends Graphics {

  constructor(params, audioAnalyser, renderer) {
    super(params);

    this.addChild(
      CoveringTexture,
      ({ image }) => ({ visible: image !== null, image }),
      params,
      renderer
    );

    this.addChild(
      Filter,
      params => params,
      params,
      audioAnalyser,
      renderer,
      this.displayObject
    );

    if (![null, undefined].includes(params.particle)) {
      this.addChild(
        Particle,
        ({ particle: { visible, alpha, color, limit } }) => ({
          visible,
          alpha,
          color, // パーティクルのの色
          limit,
          scale     : renderer.height / 7200,
          blendMode : PIXI.BLEND_MODES.SCREEN, // レイヤー合成のモード
        }),
        params,
        audioAnalyser,
        renderer,
        this.displayObject
      );
    }

    this._renderer = renderer;
    this.changeParams(params);
  }

  changeParams ({ backgroundColor }) {
    super.changeParams(...arguments);
    this.displayObject.beginFill(backgroundColor);
    this.displayObject.drawRect(0, 0, this._renderer.width, this._renderer.height);
  }

};
