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

const DisplaySynchronic = require('../display_synchronic');
const { biasVolume } = require('../audio');
const { Graphics } = require('pixi.js');

// The top frequency of the last band is the limit when the sample rate is
// 22,050 Hz.
const BANDS = [
  { bottom: 50,   top: 300  },
  { bottom: 300,  top: 2000 },
  { bottom: 2000, top: 11025 },
];

module.exports = class extends DisplaySynchronic {

  constructor(params, audioAnalyser, renderer) {
    super(params, new Graphics);

    this._audioAnalyser = audioAnalyser;
    this._renderer = renderer;

    // それぞれの帯域は floatFrequencyDataA ではどこからどこまで？
    this._BAND_INDEX_RANGES = BANDS.map(band => ({
      bottom: audioAnalyser.hz2Index(band.bottom),
      top:    audioAnalyser.hz2Index(band.top),
    }));

    this.changeParams(params);
  }

  changeParams({ mode, barCount, barTall, color, width, radius }) {
    this._params = { mode, barCount, barTall, color, width, radius };
    return super.changeParams(...arguments);
  }

  update() {
    super.update(...arguments);

    if (!this.displayObject.visible) {
      return;
    }

    const bandIndexRanges = this._BAND_INDEX_RANGES;
    const barUnit = this._params.barCount / bandIndexRanges.length;
    const margin = this._renderer.width / this._params.barCount;

    // 素のままの floatFrequencyDataA は
    // [低音,   中音, 中音,   高音, 高音, 高音, 高音, 高音, 高音]
    // のような偏りをしているので、
    // これを
    // [低音, 低音, 低音,   中音, 中音, 中音,   高音, 高音, 高音]
    // な感じに rescale する
    const rescaled = Array(this._params.barCount); // rescale 後の floatFrequencyDataA

    for (let bar = 0; bar < this._params.barCount; bar++) {
      const bandIndex = Math.floor(bar / barUnit);
      const bandIndexRange = bandIndexRanges[bandIndex];
      const barRange = {
        bottom: barUnit * bandIndex,
        top: barUnit * (bandIndex + 1),
      };

      const scale = (bandIndexRange.top - bandIndexRange.bottom) / barUnit;
      const index = Math.ceil((bar - barRange.bottom) * scale + bandIndexRange.bottom);
      let volume = this._audioAnalyser.floatFrequencyDataA[index];

      // 以下は低音ごまかしキット。
      // 低音はあまり解像度よく取れない（floatFrequencyDataA の要素数が barUnit 未満しかない）ため、こんなものが必要。
      if (bandIndexRange.top <= 300) {
        const lostRange = barUnit / bandIndexRange.top; // 何倍くらい要素数が足りないか
        const nextVolume  = this._audioAnalyser.floatFrequencyDataA[index + 1];

        // 足りない配列要素を直線補完する
        volume += (bar % lostRange) / lostRange * (nextVolume - volume);
      }

      // 直線補完しただけではダサいので、味付けもする
      rescaled[bar] = Math.max(Math.pow(biasVolume(volume) + 100, 5) / 70000000, 1) * this._params.barTall;
    }

    // 初期化
    this.displayObject.clear();

    switch (this._params.mode) {
    case 0: // 直線カラム
      this.displayObject.beginFill(this._params.color, 1);

      for (let bar = 0; bar < this._params.barCount; bar++) {
        this.displayObject.drawRect(
          (bar * margin) + (margin / 2),
          this._renderer.height - rescaled[bar],
          this._params.width, rescaled[bar]);
      }
      break;

    case 1: // 円カラム
      this.displayObject.lineStyle(this._params.width, this._params.color, 1);

      for (let bar = 0; bar < this._params.barCount; bar++) {
        const angle = bar / (this._params.barCount - 1) * Math.PI * 2;
        const index = Math.abs((bar * 2 - (this._params.barCount - 1)));

        this.displayObject.moveTo(  // 内側に向かって伸びる
          this._renderer.width  / 2 + Math.sin(angle) * (this._params.radius - rescaled[index] * 0.1),
          this._renderer.height / 2 + Math.cos(angle) * (this._params.radius - rescaled[index] * 0.1));
        this.displayObject.lineTo(  // 外側に向かって伸びる
          this._renderer.width  / 2 + Math.sin(angle) * (this._params.radius + rescaled[index]),
          this._renderer.height / 2 + Math.cos(angle) * (this._params.radius + rescaled[index]));
      }
      break;

    case 2: // 円連続
      this.displayObject.lineStyle(this._params.width, this._params.color, 1);

      for (let bar = 0; bar < this._params.barCount; bar++) {
        const angle = bar / (this._params.barCount - 1) * Math.PI * 2;
        const index = Math.abs((bar * 2 - (this._params.barCount - 1)));

        this.displayObject[bar === 0 ? 'moveTo' : 'lineTo'](
          this._renderer.width  / 2 + Math.sin(angle) * (this._params.radius + rescaled[index]),
          this._renderer.height / 2 + Math.cos(angle) * (this._params.radius + rescaled[index]));
      }
      break;

    case 3: // 直線塗りつぶし
      this.displayObject.beginFill(this._params.color, 1);

      this.displayObject.moveTo(
        0,
        this._renderer.height - rescaled[0]);

      for (let bar = 1; bar < this._params.barCount - 2; bar++) {
        this.displayObject.quadraticCurveTo(
          bar * (margin + this._params.width),
          this._renderer.height - rescaled[bar],
          (bar + 1) * (margin + this._params.width),
          this._renderer.height - rescaled[bar + 1]);
      }

      this.displayObject.lineTo(this._renderer.width, this._renderer.height);
      this.displayObject.lineTo(0, this._renderer.height);
      break;
    }
  }

};
