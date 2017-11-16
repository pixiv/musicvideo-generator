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

const Synchronic = require('../synchronic');
const { calculateMedian } = require('../utils');

module.exports = class extends Synchronic {

  constructor(params, analyser) {
    super();

    this._analyser = analyser;
    this.changeParams(params);
  }

  changeParams({ band, threshold }) {
    this._params = {
      band: { bottom: band.bottom, top: band.top },
      threshold,
    };

    return super.changeParams(...arguments);
  }

  initialize(time) {
    this._time = time;
    this.wet = 0;

    return super.initialize(time);
  }

  // 音が突然大きくなる瞬間を検知
  update(time) {
    const sliced = this._analyser.byteFrequencyData.slice(
      this._analyser.hz2Index(this._params.band.bottom),
      this._analyser.hz2Index(this._params.band.top)
    );

    const median = sliced.length > 0 ? calculateMedian(sliced) : 0;

    this.wet = Math.max(
      median - this._params.threshold,
      this.wet * (1 - (time - this._time)),
      0);

    this._time = time;
  }

};
