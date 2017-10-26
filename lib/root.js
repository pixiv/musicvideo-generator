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

const Spectrum = require('./components/spectrum');
const AlbumArt = require('./features/album_art');
const Text = require('./features/text');
const Container = require('./container');

module.exports = class extends Container {

  constructor(params, LightLeaks, audioAnalyser, renderer) {
    super(params);

    this.addChild(
      AlbumArt,
      ({ image, blur, particle, text }) => ({
        image,
        blur,
        particle,
        gradation: text,
      }),
      params,
      audioAnalyser,
      renderer
    );

    if (![null, undefined].includes(params.lightLeaks)) {
      this.addChild(
        LightLeaks,
        ({ lightLeaks }) => lightLeaks,
        params,
        renderer
      );
    }

    if (![null, undefined].includes(params.spectrum)) {
      this.addChild(
        Spectrum,
        ({ spectrum: { visible, mode, alpha, color } }) => ({
          barCount: 128,                  // バーの数
          width: renderer.width / 360,    // バーひとつひとつの幅
          radius: renderer.width / 3.6,   // 円形モードの時のバーの半径
          barTall: renderer.height / 144, // バーの長さ
          visible,                        // 可視かどうか
          mode,                           // 波形 : 0 - 直線カラム, 1 - 円カラム, 2 - 円連続, 3 - 直線塗りつぶし
          alpha,                          // 不透明度
          color,                          // バーの色
        }),
        params,
        audioAnalyser,
        renderer
      );
    }

    if (![null, undefined].includes(params.text)) {
      this.addChild(Text, ({ text }) => text, params, renderer);
    }
  }

};
