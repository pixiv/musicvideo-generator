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
const Container = require('../container');
const Filter = require('../filter');
const PIXI = require('pixi.js');

module.exports = class extends Container {

  constructor(params, audioAnalyser, renderer) {
    super(params);

    if (![null, undefined].includes(params.image)) {
      this.addChild(CoveringTexture, params => params, params, renderer);
    }

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
          scale     : 0.1,
          blendMode : PIXI.BLEND_MODES.SCREEN, // レイヤー合成のモード
        }),
        params,
        audioAnalyser,
        renderer,
        this.displayObject
      );
    }
  }

};
