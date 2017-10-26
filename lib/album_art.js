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

const Audio = require('./audio');
const Root = require('./root');
const { WebGLRenderer } = require('pixi.js');

module.exports = class {

  constructor(LightLeak, audio, params) {
    const audioAnalyser = new Audio.Analyser(
      audio.byteFrequencyData,
      audio.fftSize,
      audio.sampleRate
    );

    this.renderer = new WebGLRenderer({
      width  : params.resolution.width,
      height : params.resolution.height,
      antialias : true,
      backgroundColor : params.backgroundColor,
    });

    this._root = new Root(params, LightLeak, audioAnalyser, this.renderer);
  }

  changeParams({ backgroundColor }) {
    this.renderer.backgroundColor = backgroundColor;
    return this._root.changeParams(...arguments);
  }

  initialize() {
    return this._root.initialize(...arguments);
  }

  start() {
    this._root.start(...arguments);
  }

  stop() {
    this._root.stop(...arguments);
  }

  update() {
    this._root.update(...arguments);
    this.renderer.render(this._root.displayObject);
  }

};
