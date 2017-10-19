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

/* eslint-disable no-console */

const { RgbaEmitter } = require('../../lib');
const { execFile } = require('child_process');
const { webFrame } = require('electron');
const path = require('path');
const music = '../media/aint_we_got_fun_billy_jones1921.mp3';
const image = '../media/Ain\'t_We_Got_Fun_1b.jpg';

webFrame.registerURLSchemeAsPrivileged('file');

fetch(music).then(response => response.arrayBuffer()).then(audio => {
  const audioContext = new AudioContext;
  return audioContext.decodeAudioData(audio);
}).then(audio => {
  const emitter = new RgbaEmitter(audio, {
    image,
    fps: 30,
    blur: {
      movement: { band: { bottom: 50, top: 300 }, threshold: 165 },
      blink: { band: { bottom: 2000, top: 15000 }, threshold: 165 },
    },
    particle: {
      limit: { band: { bottom: 300, top: 2000 }, threshold: 165 },
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
      alpha: 1,
      color: 0,
      title: 'Ain\'t We Got Fun',
      sub: 'Music by Richard A. Whiting, lyrics by Raymond B. Egan and Gus Kahn.',
    },
  });

  console.log('starting');
  performance.mark('emission-start');

  const ffmpeg = execFile('ffmpeg', [
    '-f', 'rawvideo',
    '-framerate', '30',
    '-pix_fmt', 'bgr32',
    '-video_size', [emitter.width, emitter.height].join('x'),
    '-i', 'pipe:',
    '-i', path.resolve(__dirname, music),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-vf', 'vflip',
    'output.mp4',
  ], { stdio: ['pipe', process.stdout, process.stderr] });

  ffmpeg.on('close', () => {
    performance.mark('emission-end');
    console.log('ended');

    performance.measure('emission', 'emission-start', 'emission-end');
    console.log(performance.getEntriesByName('emission'));
  });

  emitter.pipe(ffmpeg.stdin);
});
