import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, '#12385e');
  ocean.addColorStop(0.42, '#0b5d7d');
  ocean.addColorStop(0.72, '#103a68');
  ocean.addColorStop(1, '#07172f');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const land = [
    [178, 170, 112, 54, -0.2],
    [276, 226, 72, 84, 0.4],
    [455, 175, 132, 72, 0.08],
    [548, 274, 86, 92, -0.35],
    [690, 160, 150, 58, 0.3],
    [802, 276, 100, 70, -0.18],
    [920, 210, 96, 104, 0.24],
  ];

  land.forEach(([x, y, rx, ry, rot]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const gradient = ctx.createRadialGradient(0, 0, 6, 0, 0, Math.max(rx, ry));
    gradient.addColorStop(0, '#87a86b');
    gradient.addColorStop(0.55, '#3d784f');
    gradient.addColorStop(1, '#244934');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = '#d8f3ff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 58; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 34 + Math.random() * 112;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + w * 0.2, y - 18, x + w * 0.72, y + 18, x + w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.42)';

  for (let i = 0; i < 92; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = 18 + Math.random() * 80;
    const ry = 5 + Math.random() * 15;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function RotatingEarth({ scrollProgress = 0, scale = 0.6 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const groupRef = useRef(null);
  const frameRef = useRef(0);
  const scaleRef = useRef(scale);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 96, 96),
      new THREE.MeshPhongMaterial({
        map: makeEarthTexture(),
        shininess: 18,
        specular: new THREE.Color('#10233b'),
      }),
    );
    group.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.59, 96, 96),
      new THREE.MeshLambertMaterial({
        map: makeCloudTexture(),
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    group.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.68, 96, 96),
      new THREE.MeshBasicMaterial({
        color: '#5ba8d0',
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    );
    group.add(atmosphere);

    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.575, 36, 18),
      new THREE.MeshBasicMaterial({
        color: '#9edcff',
        transparent: true,
        opacity: 0.06,
        wireframe: true,
      }),
    );
    group.add(grid);

    const keyLight = new THREE.DirectionalLight('#dff8ff', 2.1);
    keyLight.position.set(3, 2, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight('#39506d', 1.6));

    sceneRef.current = { renderer, camera, scene, earth, clouds, grid };
    groupRef.current = group;

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };

    const tick = () => {
      const currentScale = scaleRef.current;
      const progress = progressRef.current;
      earth.rotation.y += 0.0026;
      clouds.rotation.y += 0.0036;
      grid.rotation.y -= 0.0008;
      group.rotation.x = -0.18 + clamp(progress) * 0.14;
      group.position.y = -0.18 + clamp(progress, 0, 0.25) * 0.45;
      group.scale.setScalar(currentScale);
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('resize', resize);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
      mount.removeChild(renderer.domElement);
      [earth, clouds, atmosphere, grid].forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}
