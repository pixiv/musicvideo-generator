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

const DisplaySynchronic = require('./display_synchronic');

function delegate(children, key, delegatedArguments) {
  for (const { component } of children) {
    component[key](...delegatedArguments);
  }
}

module.exports = class extends DisplaySynchronic {

  constructor(params, displayObject) {
    super(params, displayObject);
    this._children = [];
  }

  addChild(Component, constructParams, params, ...componentArguments) {
    const component =
      new Component(constructParams(params), ...componentArguments);

    this._children.push({ component, constructParams });

    if (component.displayObject) {
      this.displayObject.addChild(component.displayObject);
    }
  }

  changeParams(params, time) {
    const promises = this._children.map(({ component, constructParams }) => {
      const childParams = constructParams(params);

      return component.changeParams(
        childParams.visible === undefined ?
          Object.create(childParams, { visible: { value: params.visible } }) :
          childParams,
        time
      );
    });

    promises.push(super.changeParams(params, time));

    return Promise.all(promises);
  }

  initialize() {
    return Promise.all(this._children.map(
      ({ component }) => component.initialize(...arguments)));
  }

  start() {
    delegate(this._children, 'start', arguments);
  }

  stop() {
    delegate(this._children, 'stop', arguments);
  }

  update() {
    delegate(this._children, 'update', arguments);
  }

};
