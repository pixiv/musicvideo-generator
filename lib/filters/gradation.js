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

const { Filter } = require('pixi.js');

module.exports = class extends Filter {

  constructor() {
    super(null, `
      precision mediump float;
      uniform float height;
      varying vec2 vTextureCoord;
      uniform vec4 filterArea;
      uniform sampler2D uSampler;

      void main(void) {
        const float alpha = 0.4;
        const float start = 0.6;
        vec4 sample = texture2D(uSampler, vTextureCoord.xy);
        float y = vTextureCoord.y * filterArea.y / height;

        gl_FragColor.rgb = y < start ? sample.rgb : sample.rgb * (alpha + (1.0 - y) / (1.0 - start) * (1.0 - alpha));
        gl_FragColor.a = sample.a;
      }
    `);
  }

  apply(filterManager, input, output) {
    this.uniforms.height = input.sourceFrame.height;
    filterManager.applyFilter(this, input, output);
  }

};
