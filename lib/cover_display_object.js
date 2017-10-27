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

module.exports = (displayObject, scaledWidth, scaledHeight) => {
  const { width, height } = displayObject.texture.baseTexture;
  const ratio = width / height;
  const scaledRaito = scaledWidth / scaledHeight;

  if (ratio > scaledRaito) {
    displayObject.width  = scaledHeight * ratio;
    displayObject.height = scaledHeight;
  } else {
    displayObject.height = scaledWidth / ratio;
    displayObject.width  = scaledWidth;
  }

  displayObject.x = (scaledWidth - displayObject.width) / 2;
  displayObject.y = (scaledHeight - displayObject.height) / 2;
};
