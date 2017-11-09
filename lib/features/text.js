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

const TextAnimatedByLetter = require('../components/text_animated_by_letter');
const Container = require('../container');
const PIXI = require('pixi.js');

module.exports = class extends Container {

  constructor(params, { width, height }) {
    super(params);

    this.addChild(
      TextAnimatedByLetter,
      ({ color, title }) => ({
        color,
        text         : [null, undefined].includes(title) ? '' : title,
        startTime    : 0.0005,
        x            : width * 0.03,
        y            : height * 0.86,
        style        : new PIXI.TextStyle({
          fontFamily: 'Roboto',
          fontSize: height * 0.04,
          fontWeight: '500',
          letterSpacing: width * 0.0003,
          fill: ['#dddddd'],
        }),
      }),
      params
    );

    this.addChild(
      TextAnimatedByLetter,
      ({ color, sub }) => ({
        color,
        text         : [null, undefined].includes(sub) ? '' : sub,
        startTime    : 0.002,
        x            : width * 0.03,
        y            : height * 0.92,
        style        : new PIXI.TextStyle({
          fontFamily: 'Roboto',
          fontSize: height * 0.03,
          letterSpacing: width * 0.0003,
          fill: ['#dddddd'],
        }),
      }),
      params
    );
  }

};
