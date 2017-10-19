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

const DisplaySynchronic = require('../display_synchronic');
const { Text } = require('pixi.js');

module.exports = class extends DisplaySynchronic {

  constructor(params) {
    super(params, new Text({ fontFamily: 'Roboto' }));

    if (params) {
      this.changeParams(params);
    }
  }

  changeParams(params) {
    this._startTime = params.startTime;
    this._text = params.text;

    this.displayObject.tint  = params.color;
    this.displayObject.style = params.style;
    this.displayObject.x     = params.x;
    this.displayObject.y     = params.y;

    return super.changeParams(params);
  }

  update(time) {
    super.update(time);
    this.displayObject.text = this._text.substr(0, (time - this._startTime) * 16);
  }

};
