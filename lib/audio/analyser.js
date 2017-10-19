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

/* ----------------------------------------------------- *
 * 音声解析
 * ----------------------------------------------------- */
module.exports = class {

  constructor(byteFrequencyData, fftSize, sampleRate) {
    this._fftSize = fftSize;
    this._sampleRate = sampleRate;

    // いまの瞬間の各周波数帯の音量を、配列でゲット
    this.byteFrequencyData = byteFrequencyData;
  }

  hz2Index(hz) {
    return Math.ceil(hz / this._sampleRate * this._fftSize);
  }

};
