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

const lightLeaksImages = [
  '../light_leaks/0.png',
  '../light_leaks/1.png',
  '../light_leaks/2.png',
  '../light_leaks/3.png',
  '../light_leaks/4.png',
  '../light_leaks/5.png',
  '../light_leaks/6.png',
  '../light_leaks/7.png',
  '../light_leaks/8.png',
  '../light_leaks/9.png',
  '../light_leaks/10.png',
  '../light_leaks/11.png',
  '../light_leaks/12.png',
  '../light_leaks/13.png',
  '../light_leaks/14.png',
  '../light_leaks/15.png',
  '../light_leaks/16.png',
  '../light_leaks/17.png',
  '../light_leaks/18.png',
  '../light_leaks/19.png',
  '../light_leaks/20.png',
  '../light_leaks/21.png',
  '../light_leaks/22.png',
  '../light_leaks/23.png',
  '../light_leaks/24.png',
  '../light_leaks/25.png',
  '../light_leaks/26.png',
  '../light_leaks/27.png',
  '../light_leaks/28.png',
  '../light_leaks/29.png',
  '../light_leaks/30.png',
  '../light_leaks/31.png',
  '../light_leaks/32.png',
  '../light_leaks/33.png',
  '../light_leaks/34.png',
  '../light_leaks/35.png',
  '../light_leaks/36.png',
  '../light_leaks/37.png',
  '../light_leaks/38.png',
  '../light_leaks/39.png',
  '../light_leaks/40.png',
  '../light_leaks/41.png',
  '../light_leaks/42.png',
  '../light_leaks/43.png',
  '../light_leaks/44.png',
  '../light_leaks/45.png',
  '../light_leaks/46.png',
  '../light_leaks/47.png',
  '../light_leaks/48.png',
  '../light_leaks/49.png',
  '../light_leaks/50.png',
  '../light_leaks/51.png',
  '../light_leaks/52.png',
  '../light_leaks/53.png',
  '../light_leaks/54.png',
  '../light_leaks/55.png',
  '../light_leaks/56.png',
  '../light_leaks/57.png',
  '../light_leaks/58.png',
  '../light_leaks/59.png',
  '../light_leaks/60.png',
  '../light_leaks/61.png',
  '../light_leaks/62.png',
  '../light_leaks/63.png',
  '../light_leaks/64.png',
  '../light_leaks/65.png',
  '../light_leaks/66.png',
  '../light_leaks/67.png',
  '../light_leaks/68.png',
  '../light_leaks/69.png',
].map(pathname => url.format({
  pathname: path.join(__dirname, pathname),
  protocol: 'file:',
}));

const lightLeaksImagesTexure
  = lightLeaksImages.map(formattedUrl => Texture.from(formattedUrl));

module.exports = {

  Canvas,

  RgbaEmitter: class extends RgbaEmitter {

    constructor() {
      super(lightLeaksImagesTexure, ...arguments);
    }

  },

};
