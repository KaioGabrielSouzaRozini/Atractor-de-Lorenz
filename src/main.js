import './style.css';
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuração da cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);

// Luzes
const pointLight = new THREE.PointLight(0xffffff, 1);
const ambientLight = new THREE.AmbientLight(0xffffff);
pointLight.position.set(10, 10, 10);
scene.add(pointLight, ambientLight);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);

// Configuração do Atraente de Lorenz
const sigma = 10, rho = 28, beta = 8 / 3;
let x = 0.1, y = 0, z = 0;
const dt = 0.01; 
const maxPoints = 20000; 
const positions = new Float32Array(maxPoints * 3); 
const colors = new Float32Array(maxPoints * 3); 
let drawCount = 0; 

// Geometria e material
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); 
geometry.setDrawRange(0, drawCount);

const material = new THREE.LineBasicMaterial({ vertexColors: true }); 
const line = new THREE.Line(geometry, material);
scene.add(line);

// Ponto brilhante (esfera)
const pointGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Pequena esfera
const pointMaterial = new THREE.MeshStandardMaterial({
  emissive: 0xff0000, // Cor brilhante
  emissiveIntensity: 2, // Intensidade do brilho
});
const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
scene.add(pointMesh);

// Função para calcular o próximo ponto do Atraente de Lorenz
function updateLorenz(x, y, z) {
  const dx = sigma * (y - x) * dt;
  const dy = (x * (rho - z) - y) * dt;
  const dz = (x * y - beta * z) * dt;
  return [x + dx, y + dy, z + dz];
}

// Função para converter HSV para RGB
function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [r, g, b];
}

// Animação
let hue = 0; // Matiz inicial (HSV)
function animate() {
  requestAnimationFrame(animate);

  // Atualizar o Atraente de Lorenz
  [x, y, z] = updateLorenz(x, y, z);

  // Atualizar os pontos da geometria
  const positionsArray = geometry.attributes.position.array;
  const colorsArray = geometry.attributes.color.array;

  // Adicionar o ponto atual à posição
  positionsArray[drawCount * 3] = x;
  positionsArray[drawCount * 3 + 1] = y;
  positionsArray[drawCount * 3 + 2] = z;

  // Converter o matiz atual (hue) para RGB
  const [r, g, b] = hsvToRgb(hue, 1, 1); 
  colorsArray[drawCount * 3] = r;
  colorsArray[drawCount * 3 + 1] = g;
  colorsArray[drawCount * 3 + 2] = b;

  // Incrementar o matiz (hue) para mudar a cor global
  hue += 0.0002;
  if (hue > 1) hue = 0; 

  drawCount++;
  if (drawCount >= maxPoints) {
    drawCount = 0; 
  }

  geometry.setDrawRange(0, drawCount);
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true; 

  // Atualizar posição do ponto brilhante
  pointMesh.position.set(x, y, z);

  // Renderizar a cena
  controls.update();
  renderer.render(scene, camera);
}

// Ajustar o canvas ao redimensionar a janela
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar a animação
animate();
