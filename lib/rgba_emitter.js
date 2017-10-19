/*
 * Copyright (C) 2017 pixiv Inc.
 *
 * This file is part of musicvideo-converter.
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

const AlbumArt = require('./album_art');
const LightLeaksAsync = require('./components/light_leaks/async');
const { createAnalyserNode } = require('./audio');
const { Readable } = require('stream');

function createOfflineAnalyserNode(buffer) {
  const context = new OfflineAudioContext(2, 44100 * buffer.duration, 44100);
  const analyserNode = new createAnalyserNode(context);

  // 再生準備
  const source = context.createBufferSource();

  source.connect(analyserNode);
  source.buffer = buffer;

  // 再生
  source.start(0);

  return analyserNode;
}

class RgbaEmitter extends Readable {

  constructor(lightLeaksImages, audioBuffer, params) {
    const audioAnalyserNode = createOfflineAnalyserNode(audioBuffer);
    const audioByteFrequencyData = new Uint8Array(audioAnalyserNode.frequencyBinCount);

    const albumArt = new AlbumArt(LightLeaksAsync.bind(undefined, lightLeaksImages), {
      byteFrequencyData: audioByteFrequencyData,
      fftSize: audioAnalyserNode.fftSize,
      sampleRate: audioAnalyserNode.context.sampleRate,
    }, params);

    const size = albumArt.renderer.width * albumArt.renderer.height * 4;

    super({ highWaterMark: size });

    this._albumArt = albumArt;
    this._fps = params.fps;
    this.width = albumArt.renderer.width;
    this.height = albumArt.renderer.height;

    this._audio = {
      analyserNode: audioAnalyserNode,
      byteFrequencyData: audioByteFrequencyData,
    };

    this._buffer = new Buffer(size);

    this._count = 0;
    this._thenTerminateWithBuffer(
      this._thenUpdateRenderer(
        Promise.all([
          albumArt.initialize(0),
          audioAnalyserNode.context.suspend(0),
        ])));

    audioAnalyserNode.context.startRendering();
  }

  _thenUpdateRenderer(suspension) {
    const rendererUpdate = suspension.then(() => {
      this._audio.analyserNode.getByteFrequencyData(this._audio.byteFrequencyData);

      const suspension = this._audio.analyserNode.context.suspend((this._count + 1) / this._fps);

      // Prevent unhandledrejection event from being fired.
      suspension.catch(Function.prototype);

      this._audio.analyserNode.context.resume();
      this._albumArt.update(this._count / this._fps);

      this._count++;

      return { suspension };
    }).catch(error => {
      if (error.name === 'InvalidStateError') {
        this._audio.byteFrequencyData.fill(0);
        this._albumArt.update(this._count / this._fps);

        return { };
      }

      return Promise.reject(error);
    });

    return rendererUpdate;
  }

  _thenTerminateWithBuffer(rendererUpdate) {
    return rendererUpdate.then(({ suspension }) => {
      const { gl } = this._albumArt.renderer;

      gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this._buffer);

      if (suspension) {
        const rendererUpdate = this._thenUpdateRenderer(suspension);

        if (this.push(this._buffer)) {
          this._thenTerminateWithBuffer(rendererUpdate);
        } else {
          // Prevent unhandledrejection event from being fired.
          rendererUpdate.catch(Function.prototype);

          this._rendererUpdate = rendererUpdate;
        }
      } else {
        this.push(this._buffer);
        this.push(null);
      }
    }).catch(error => this.emit('error', error));
  }

  _read() {
    const { _rendererUpdate } = this;

    if (_rendererUpdate) {
      // Assign null BEFORE this._then because it can assign the next
      // _rendererUpdate.
      this._rendererUpdate = null;

      this._thenTerminateWithBuffer(_rendererUpdate);
    }
  }

};

module.exports = RgbaEmitter;
