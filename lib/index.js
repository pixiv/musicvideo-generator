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

const Canvas = require('./canvas');
const RgbaEmitter = require('./rgba_emitter');
const path = require('path');
const { Texture } = require('pixi.js');
const url = require('url');

const lightLeaksVideo = url.format({
  pathname: path.join(__dirname, '../assets/light_leaks.mp4'),
  protocol: 'file:',
});

const lightLeaksImages = [
  '../assets/light_leaks/0.png',
  '../assets/light_leaks/1.png',
  '../assets/light_leaks/2.png',
  '../assets/light_leaks/3.png',
  '../assets/light_leaks/4.png',
  '../assets/light_leaks/5.png',
  '../assets/light_leaks/6.png',
  '../assets/light_leaks/7.png',
  '../assets/light_leaks/8.png',
  '../assets/light_leaks/9.png',
  '../assets/light_leaks/10.png',
  '../assets/light_leaks/11.png',
  '../assets/light_leaks/12.png',
  '../assets/light_leaks/13.png',
  '../assets/light_leaks/14.png',
  '../assets/light_leaks/15.png',
  '../assets/light_leaks/16.png',
  '../assets/light_leaks/17.png',
  '../assets/light_leaks/18.png',
  '../assets/light_leaks/19.png',
  '../assets/light_leaks/20.png',
  '../assets/light_leaks/21.png',
  '../assets/light_leaks/22.png',
  '../assets/light_leaks/23.png',
  '../assets/light_leaks/24.png',
  '../assets/light_leaks/25.png',
  '../assets/light_leaks/26.png',
  '../assets/light_leaks/27.png',
  '../assets/light_leaks/28.png',
  '../assets/light_leaks/29.png',
  '../assets/light_leaks/30.png',
  '../assets/light_leaks/31.png',
  '../assets/light_leaks/32.png',
  '../assets/light_leaks/33.png',
  '../assets/light_leaks/34.png',
  '../assets/light_leaks/35.png',
  '../assets/light_leaks/36.png',
  '../assets/light_leaks/37.png',
  '../assets/light_leaks/38.png',
  '../assets/light_leaks/39.png',
  '../assets/light_leaks/40.png',
  '../assets/light_leaks/41.png',
  '../assets/light_leaks/42.png',
  '../assets/light_leaks/43.png',
  '../assets/light_leaks/44.png',
  '../assets/light_leaks/45.png',
  '../assets/light_leaks/46.png',
  '../assets/light_leaks/47.png',
  '../assets/light_leaks/48.png',
  '../assets/light_leaks/49.png',
  '../assets/light_leaks/50.png',
  '../assets/light_leaks/51.png',
  '../assets/light_leaks/52.png',
  '../assets/light_leaks/53.png',
  '../assets/light_leaks/54.png',
  '../assets/light_leaks/55.png',
  '../assets/light_leaks/56.png',
  '../assets/light_leaks/57.png',
  '../assets/light_leaks/58.png',
  '../assets/light_leaks/59.png',
  '../assets/light_leaks/60.png',
  '../assets/light_leaks/61.png',
  '../assets/light_leaks/62.png',
  '../assets/light_leaks/63.png',
  '../assets/light_leaks/64.png',
  '../assets/light_leaks/65.png',
  '../assets/light_leaks/66.png',
  '../assets/light_leaks/67.png',
  '../assets/light_leaks/68.png',
  '../assets/light_leaks/69.png',
].map(pathname => url.format({
  pathname: path.join(__dirname, pathname),
  protocol: 'file:',
}));

const lightLeaksImagesTexure
  = lightLeaksImages.map(formattedUrl => Texture.from(formattedUrl));

module.exports = {

  Canvas: class extends Canvas {

    constructor() {
      super(lightLeaksVideo, ...arguments);
    }

  },

  RgbaEmitter: class extends RgbaEmitter {

    constructor() {
      super(lightLeaksImagesTexure, ...arguments);
    }

  },

};
