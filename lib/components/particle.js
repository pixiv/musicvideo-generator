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

const { Limitter } = require('../audio');
const DisplaySynchronic = require('../display_synchronic');
const { noise } = require('../perlinnoise');
const PIXI = require('pixi.js');

const particleTexture = createParticleTexture();

function createParticleTexture() {
  const particleCanvas = document.createElement('canvas');
  const particle2d = particleCanvas.getContext('2d');
  const particleDiameter = 128;
  const particleRadius = particleDiameter / 2;
  const particleGradient = particle2d.createRadialGradient(
    particleRadius, particleRadius, particleRadius,
    particleRadius, particleRadius, 0);

  particleCanvas.width = particleDiameter;
  particleCanvas.height = particleDiameter;

  particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  particleGradient.addColorStop(1, 'rgba(255, 255, 255, 255)');

  particle2d.clearRect(0, 0, particleDiameter, particleDiameter);
  particle2d.fillStyle = particleGradient;
  particle2d.rect(0, 0, particleDiameter, particleDiameter);
  particle2d.fill();

  return PIXI.Texture.from(particleCanvas);
}

class AfterImage extends DisplaySynchronic {

  constructor(params, renderer, original) {
    const bufferTextures = [
      PIXI.RenderTexture.create(renderer.width, renderer.height),
      PIXI.RenderTexture.create(renderer.width, renderer.height),
    ];

    super(params, new PIXI.Sprite(bufferTextures[0]));

    this.original = original;
    this._renderer = renderer;

    this._currentBufferTextureIndex = 1;
    this._bufferTextures = bufferTextures;

    this.displayObject.anchor.set(0.5);
    this.displayObject.x = this._renderer.width  / 2;
    this.displayObject.y = this._renderer.height / 2;

    this._bufferSprite = new PIXI.Sprite;

    this.changeParams(params);
  }

  changeParams(params) {
    this.displayObject.blendMode = params.blendMode;
    this._bufferSprite.alpha = params.alpha;

    return super.changeParams(params);
  }

  initialize() {
    return Promise.all([
      super.initialize(...arguments),
      this.original.initialize(...arguments),
    ]);
  }

  start() {
    super.start(...arguments);
    this.original.start(...arguments);
  }

  stop() {
    super.stop(...arguments);
    this.original.stop(...arguments);
  }

  update() {
    super.update(...arguments);
    this.original.update(...arguments);

    if (!this.displayObject.visible) {
      return;
    }

    const nextBufferTextureIndex = (this._currentBufferTextureIndex + 1) % 2;
    const nextBufferTexture = this._bufferTextures[nextBufferTextureIndex];

    this._renderer.render(this.original.displayObject, this._bufferTextures[0], false);

    this._bufferSprite.texture = this._bufferTextures[this._currentBufferTextureIndex];
    this._renderer.render(this._bufferSprite, nextBufferTexture, true);

    this.displayObject.texture = nextBufferTexture;
    this._currentBufferTextureIndex = nextBufferTextureIndex;
  }

}

class Particles extends DisplaySynchronic {

  constructor(params, audioAnalyser, renderer, origin) {
    super(params, new PIXI.particles.ParticleContainer(1000, {
      scale    : true,
      position : true,
      uvs      : true,
      alpha    : true,
    }));

    this._limitter = new Limitter(params.limit, audioAnalyser);
    this._origin = origin;
    this._renderer = renderer;

    if (params) {
      this._scale = params.scale;
      this.displayObject.tint = params.color;
    }
  }

  changeParams({ limit, scale, color }) {
    super.changeParams(...arguments);

    this._limitter.changeParams(limit);
    this._scale = scale;
    this.displayObject.tint = color;
  }

  initialize() {
    const promise = Promise.all([
      super.initialize(...arguments),
      this._limitter.initialize(...arguments),
    ]);

    this.displayObject.removeChildren();

    return promise;
  }

  start() {
    super.start(...arguments);
    this._limitter.start(...arguments);
  }

  stop() {
    super.stop(...arguments);
    this._limitter.stop(...arguments);
  }

  update(time) {
    super.update(time);

    this._limitter.update(time);

    const { wet } = this._limitter;

    for (let count = 0; count < (wet * 0.0015) + 1; count++) {
      const sprite = new PIXI.Sprite;

      sprite.birthtime = time;
      sprite.lifetime = Math.random() * 3 + 1;
      sprite.position = {
        x: Math.random() * this._renderer.width,
        y: Math.random() * this._renderer.height,
      };
      sprite.texture = particleTexture;
      sprite.anchor.set(0.5);

      this.displayObject.addChild(sprite);
    }

    for (const sprite of this.displayObject.children) {
      const age = time - sprite.birthtime;

      if (age < sprite.lifetime) {
        const particleNoise = noise(
          (sprite.x * 0.005) + time,
          (sprite.y * 0.005) + time,
          wet * 0.00015 + time * 0.01
        ) * 2 - 1;

        const rad = Math.atan2(sprite.x - this._origin.x, sprite.y - this._origin.y);
        const scale = (1 + wet * 0.15) * this._scale;

        sprite.x += Math.sin(rad) * (wet * 0.0075 + 1) + Math.cos(Math.PI * 2 * particleNoise) * (0.2 + wet * 0.009);
        sprite.y += Math.cos(rad) * (wet * 0.0075 + 1) + Math.sin(Math.PI * 2 * particleNoise) * (0.2 + wet * 0.009);

        sprite.scale.x = scale;
        sprite.scale.y = scale;
        sprite.alpha = 1 - Math.pow(age / sprite.lifetime, 8);
      } else {
        this.displayObject.removeChild(sprite);
      }
    }
  }

}

module.exports = class extends AfterImage {

  constructor(params, audioAnalyser, renderer, origin) {
    super(
      params,
      renderer,
      new Particles(params, audioAnalyser, renderer, origin)
    );
  }

  changeParams() {
    this.original.changeParams(...arguments);
    super.changeParams(...arguments);
  }

};
