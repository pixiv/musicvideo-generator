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

const { Canvas } = require('../../lib/index_browser');

const audioContext = new AudioContext;
const audioElement = document.getElementsByTagName('audio')[0];
const audioNode = audioContext.createMediaElementSource(audioElement);
const image = new Image;

image.onload = () => {
  const albumArtCanvas = new Canvas(audioContext, {
    fps: 30,
    resolution: { width: 480, height: 480 },
    image,
    blur: {
      movement: { band: { bottom: 50, top: 300 }, threshold: 155 },
      blink: { band: { bottom: 2000, top: 15000 }, threshold: 155 },
    },
    particle: {
      limit: { band: { bottom: 300, top: 2000 }, threshold: 155 },
      alpha: 0.9,
      color: 0xff0000,
    },
    lightLeaks: { alpha: 1, interval: 5 },
    spectrum: {
      alpha: 1,
      color: 0xff0000,
      mode: 0,
    },
    text: {
      alpha: 0.9,
      color: 0xffffff,
      title: 'Ain\'t We Got Fun',
      sub: 'Music by Richard A. Whiting, lyrics by Raymond B. Egan and Gus Kahn.',
    },
  }, 'light_leaks.mp4', () => audioElement.currentTime);

  audioNode.connect(albumArtCanvas.audioAnalyserNode);
  document.body.appendChild(albumArtCanvas.getRenderer().view);

  albumArtCanvas.initialize();

  audioElement.addEventListener('playing', () => albumArtCanvas.start());
  audioElement.addEventListener('ended', () => albumArtCanvas.stop());
  audioElement.addEventListener('pause', () => albumArtCanvas.stop());
  audioElement.addEventListener('seeked', () => albumArtCanvas.initialize());
};

image.src = '../media/Ain\'t_We_Got_Fun_1b.jpg';
