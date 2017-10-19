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
const { BLEND_MODES, Sprite } = require('pixi.js');

const videoTotalTime = 70 / 30;

function queueLoop(delay) {
  this._timeout = setTimeout(function(source) {
    source.currentTime = 0;
    source.play();
  }, delay * 1000, this.displayObject.texture.baseTexture.source);
}

module.exports = class extends DisplaySynchronic {

  constructor(video, params) {
    super(params, Sprite.from(video));

    this.displayObject.texture.baseTexture.autoUpdate = false;
    this.displayObject.texture.baseTexture.source.crossOrigin = 'anonymous';
    this.displayObject.blendMode = BLEND_MODES.SCREEN;
    this._interval = params.interval;
    this._listenVideoEndedEvent = () => queueLoop.call(this, this._interval);
    this._paused = true;
  }

  changeParams(params, time) {
    const promises = [super.changeParams(params, time)];
    const toInitialize = params.visible === this.displayObject.visible &&
                         params.interval === this._interval;

    if (toInitialize) {
      this._interval = params.interval;
      promises.push(this.initialize(time));
    }

    return Promise.all(promises);
  }

  initialize(time) {
    const videoCurrentTime = time % (videoTotalTime + this._interval);
    const elapsedAfterVideo = videoCurrentTime - videoTotalTime;
    const { baseTexture } = this.displayObject.texture;
    const { source } = baseTexture;

    const promises = [super.initialize(time)];

    if (elapsedAfterVideo > 0) {
      source.currentTime = 0;

      if (!this._paused && this.displayObject.visible) {
        source.pause();
        clearTimeout(this._timeout);
        queueLoop.call(this, elapsedAfterVideo);
      }
    } else {
      source.currentTime = videoCurrentTime;

      if (!this._paused && this.displayObject.visible) {
        source.play();
      }
    }

    if (source.HAVE_ENOUGH_DATA === source.readyState) {
      promises.push(new Promise(resolve => source.addEventListener('seeked', resolve)));
    } else {
      promises.push(new Promise(resolve => source.addEventListener('canplaythrough', resolve)));

      if ([source.HAVE_FUTURE_DATA, source.HAVE_CURRENT_DATA].includes(source.readyState)) {
        promises.push(new Promise(resolve => source.addEventListener('seeked', resolve)));
      }
    }

    return Promise.all(promises);
  }

  start(time) {
    const { source } = this.displayObject.texture.baseTexture;

    super.start(time);

    this._paused = false;

    source.addEventListener(
      'ended', this._listenVideoEndedEvent, { once: false });

    if (!this.displayObject.visible) {
      return;
    }

    const videoCurrentTime = time % (videoTotalTime + this._interval);
    const elapsedAfterVideo = videoCurrentTime - videoTotalTime;

    if (elapsedAfterVideo > 0) {
      queueLoop.call(this, elapsedAfterVideo);
    } else {
      source.play();
    }
  }

  stop(time) {
    const { source } = this.displayObject.texture.baseTexture;

    super.stop(time);

    this._paused = true;

    clearTimeout(this._timeout);

    source.pause();
    source.removeEventListener('ended', this._listenVideoEndedEvent);
  }

  update() {
    if (this.displayObject.visible) {
      this.displayObject.texture.update();
    }
  }

};
