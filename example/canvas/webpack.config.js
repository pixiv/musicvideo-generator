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

const { resolve } = require('path');

module.exports = {
  devServer: { contentBase: resolve(__dirname, '..') },
  entry: '.',
  module: {
    rules: [
      {
        include: resolve(__dirname, '../../assets'),
        loader: 'file-loader',
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'bundle'),
    publicPath: 'bundle/',
  },
  resolve: { modules: [resolve(__dirname, '../../node_modules')] },
};
