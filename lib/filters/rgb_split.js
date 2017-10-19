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

module.exports = function() {
  const fragmentSrc = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec4 filterArea;
    uniform float blink;
    uniform vec2 red;
    uniform vec2 green;
    uniform vec2 blue;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main(void) {
      vec2 st = vTextureCoord.xy;

      gl_FragColor.rgb = blink * vec3(
        texture2D(uSampler, st + red / filterArea.xy).r,
        texture2D(uSampler, st + green / filterArea.xy).g,
        texture2D(uSampler, st + blue / filterArea.xy).b);

      gl_FragColor.a = texture2D(uSampler, st).a;
    }
  `;

  return new Filter(null, fragmentSrc, {
    blink: { type: '1f', value: 1.0 },
    red: { type: '2f', value: [0.0, 0.0] },
    green: { type: '2f', value: [0.0, 0.0] },
    blue: { type: '2f', value: [0.0, 0.0] },
  });
};
