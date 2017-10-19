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

const { Limitter, biasVolume } = require('./audio');
const { noise } = require('./perlinnoise');
const RGBSplit = require('./filters/rgb_split');
const DirBlur = require('./filters/dir_blur');
const Gradation = require('./filters/gradation');
const Synchronic = require('./synchronic');

module.exports = class extends Synchronic {

  constructor({ blur, gradation }, audioAnalyser, renderer, container) {
    const filters = [];

    super();

    this._container = container;
    this._renderer = renderer;
    this._filters = {
      rgbShift: new RGBSplit,
      dirBlur: new DirBlur,
      gradation: new Gradation,
    };

    if (blur) {
      this._limitters = {
        movement: new Limitter(blur.movement, audioAnalyser),
        blink: new Limitter(blur.blink, audioAnalyser),
      };

      if ([undefined, true].includes(blur.visible)) {
        filters.push(this._filters.rgbShift, this._filters.dirBlur);
      }
    }

    if (gradation && [undefined, true].includes(gradation.visible)) {
      filters.push(this._filters.gradation);
    }

    this._container.filters = filters;

    this._container.pivot.x = this._renderer.width  / 2;
    this._container.pivot.y = this._renderer.height / 2;
    this._container.x       = this._renderer.width  / 2;
    this._container.y       = this._renderer.height / 2;
  }

  changeParams({ blur, gradation }) {
    const filters = [];

    if (blur) {
      this._limitters.movement.changeParams(blur.movement);
      this._limitters.blink.changeParams(blur.blink);

      if ([undefined, true].includes(blur.visible)) {
        filters.push(this._filters.rgbShift, this._filters.dirBlur);
      }
    }

    if (gradation && [undefined, true].includes(gradation.visible)) {
      filters.push(this._filters.gradation);
    }

    this._container.filters = filters;

    return Promise.resolve();
  }

  initialize() {
    return this._limitters ?
      Promise.all([
        this._limitters.movement.initialize(...arguments),
        this._limitters.blink.initialize(...arguments),
      ]) :
      Promise.resolve();
  }

  start() {
    if (this._limitters) {
      this._limitters.movement.start(...arguments);
      this._limitters.blink.start(...arguments);
    }
  }

  stop() {
    if (this._limitters) {
      this._limitters.movement.stop(...arguments);
      this._limitters.blink.stop(...arguments);
    }
  }

  update(time) {
    if (!this._limitters) {
      return;
    }

    const { movement, blink } = this._limitters;

    movement.update(time);
    blink.update(time);

    if (!this._container.filters.includes(this._filters.rgbShift) ||
        !this._container.filters.includes(this._filters.dirBlur)) {
      return;
    }

    const movementWet = biasVolume(movement.wet);
    const blinkWet = biasVolume(blink.wet);

    const pn  = noise(
      movementWet * 0.08 + time * 0.02,
      movementWet * 0.08 + time * 0.02,
      time * 0.1
    ) * 2 - 1;

    const noiseCoordinate = [
      Math.sin(Math.PI * 2 * pn),
      Math.cos(Math.PI * 2 * pn),
    ];

    this._container.scale.x = 1 + (movementWet * 0.01);
    this._container.scale.y = 1 + (movementWet * 0.01);

    this._container.x = this._renderer.width  / 2 + noiseCoordinate[0] * (movementWet * 2);
    this._container.y = this._renderer.height / 2 + noiseCoordinate[1] * (movementWet * 2);


    // RGB分離とブラー
    this._filters.rgbShift.uniforms.red = [
      noiseCoordinate[0] * (movementWet * 2),
      noiseCoordinate[1] * (movementWet * 2),
    ];

    this._filters.rgbShift.uniforms.blue = [
      noiseCoordinate[0] * (movementWet * -2),
      noiseCoordinate[1] * (movementWet * -2),
    ];

    this._filters.rgbShift.uniforms.blink = blinkWet * 0.1 + 1;

    this._filters.dirBlur.uniforms.blurStrength = [
      noiseCoordinate[0] * movementWet,
      noiseCoordinate[1] * -movementWet,
    ];
  }

};
