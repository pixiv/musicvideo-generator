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

const { Filter } = require('pixi.js');

module.exports = function() {
  const fragmentSrc = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec4 filterArea;
    uniform vec2 blurStrength;

    float random(vec3 scale, float seed) {
      return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main(void) {
      const float samples = 8.0;
      vec4 sum = vec4(0.0);
      float weightSum = 0.0;

      for (float f = 0.0; f < samples; f++) {
        vec2 blurCoord = (f - samples / 2.0) * blurStrength.xy / filterArea.xy;
        float weight = 1.0 - abs(f / (samples / 2.0) - 1.0);

        sum += texture2D(uSampler, vTextureCoord.xy + blurCoord) * weight;
        weightSum += weight;
      }

      gl_FragColor = sum / weightSum;
    }
  `;

  return new Filter(null, fragmentSrc, {
    blurStrength: { type: '2f', value: [0.0, 0.0] },
  });
};
