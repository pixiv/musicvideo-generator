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

function R_A(f) {
  return (12194 ** 2 * f ** 4) /
         ((f ** 2 + 20.6 ** 2) *
          Math.sqrt((f ** 2 + 107.7 ** 2) * (f ** 2 + 737.9 ** 2)) *
          (f ** 2 + 12194 ** 2));
}

// A-weighting defined in IEC 61672:2003.
function A(f) {
  return 20 * Math.log10(R_A(f)) + 2.00;
}

/* ----------------------------------------------------- *
 * 音声解析
 * ----------------------------------------------------- */
module.exports = class {

  constructor(fftSize, sampleRate) {
    this._fftSize = fftSize;
    this._sampleRate = sampleRate;

    this.floatAData = new Float32Array(this._fftSize / 2);
    for (let index = 0; index < this.floatAData.length; index++) {
      this.floatAData[index] = A(this.index2Hz(index));
    }
  }

  update(floatFrequencyData) {
    this.floatFrequencyDataA = floatFrequencyData.map(
      (data, index) => data + this.floatAData[index]);
  }

  hz2Index(hz) {
    return Math.ceil(hz / this._sampleRate * this._fftSize);
  }

  index2Hz(index) {
    return index / this._fftSize * this._sampleRate;
  }

};
