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

const Musicvideo = require('./musicvideo');
const LightLeaksSync = require('./components/light_leaks/sync');
const { createAnalyserNode } = require('./audio');

function update(time) {
  this.audioAnalyserNode.getByteFrequencyData(this._audioByteFrequencyData);
  this._musicvideo.update(time);
}

module.exports = class {

  constructor(audioContext, params, lightLeaksVideo, getTime) {
    this.audioAnalyserNode = createAnalyserNode(audioContext);
    this._audioByteFrequencyData = new Uint8Array(this.audioAnalyserNode.frequencyBinCount);
    this._promise = null;

    this._musicvideo = new Musicvideo(LightLeaksSync.bind(undefined, lightLeaksVideo), {
      byteFrequencyData: this._audioByteFrequencyData,
      fftSize: this.audioAnalyserNode.fftSize,
      sampleRate: audioContext.sampleRate,
    }, params);

    this._interval = params.fps ? 1000 / params.fps : 0;

    if (getTime) {
      this._getTime = getTime;
    }
  }

  destroy() {
    this._musicvideo.destroy();
  }

  _getTime() {
    return this.audioAnalyserNode.context.currentTime;
  }

  changeParams(params) {
    const time = this._getTime();

    this._musicvideo.changeParams(params, time).then(() =>
      this._promise === null || update.call(this, time));
  }

  getRenderer() {
    return this._musicvideo.renderer;
  }

  initialize() {
    const time = this._getTime();

    let promise = this._musicvideo.initialize(time);
    this._promise = promise;

    promise = promise.then(() => {
      // This condition will be false if there is yet another initialize call.
      if (this._promise === promise) {
        update.call(this, time);
      }
    });
    this._promise = promise;
  }

  start() {
    let last = 0;

    const tick = now => {
      if ((now - last) >= this._interval) {
        update.call(this, this._getTime());
        last = now;
      }

      this._animationFrame = requestAnimationFrame(tick);
    };

    this._promise.then(() => {
      this._musicvideo.start(this._getTime());
      this._animationFrame = requestAnimationFrame(tick);
    });
  }

  stop() {
    cancelAnimationFrame(this._animationFrame);
    this._musicvideo.stop(this._getTime());
  }

};
