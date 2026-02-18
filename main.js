import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'lil-gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xEFEDEB);
const clock = new THREE.Clock();

const gui = new GUI();
const colorSettings = {
    color1: '#FF428A',
    color2: '#C084FC',
    color3: '#06D6A0',
    color4: '#EEFF44',
    color5: '#FFD166'
};
const frostedGroups = [[], [], [], [], []];

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('#canvasThree'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Bloom Post-Processing 
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.2,  // Stärke
    0.4,  // Radius
    0.4   // Schwellenwert
);
composer.addPass(bloomPass);

const spotLight = new THREE.PointLight(0xffffff, 250);
spotLight.position.set(15, 10, 10);
scene.add(spotLight);

const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/royal_esplanade_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    const sideLight = new THREE.PointLight(0xffffff, 250);
    sideLight.position.set(-15, 5, 5);
    scene.add(sideLight);
});


const getFrostedMaterial = (color) => {
    const baseColor = new THREE.Color(color);
    return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        attenuationColor: baseColor.clone().multiplyScalar(1.2),
        attenuationDistance: 1.2,
        transmission: 1.3,
        roughness: 0.3,
        ior: 1.4,
        thickness: 0.8,
        transparent: true,
        emissive: baseColor,         // leuchtet in eigener Farbe
        emissiveIntensity: 0.2,      
        specularIntensity: 3.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0,
    });
};

const getClearMaterial = () => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    transmission: 1.0,
    ior: 1.3,
    dispersion: 15.0,   
    roughness: 0.2,
    thickness: 1.0,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    specularIntensity: 3.0,
    specularColor: new THREE.Color(0xffffff),
});

const canvasTexture = new THREE.CanvasTexture(generateTextCanvas());
const bgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 30),
    new THREE.MeshBasicMaterial({ map: canvasTexture })
);
bgPlane.position.z = -5;
scene.add(bgPlane);

const svgLoader = new SVGLoader();

function loadSVGSymbol(url, color, position) {
    svgLoader.load(url, (data) => {
        data.paths.forEach((path) => {
            const shapes = SVGLoader.createShapes(path);
            shapes.forEach((shape) => {
                const geom = new THREE.ExtrudeGeometry(shape, {
                    depth: 180,           // Tiefe der Extrusion
                    bevelEnabled: true,
                    bevelThickness: 0.5,
                    bevelSize: 0.3,
                    bevelSegments: 5
                });
                geom.center();

                const colorIndex = Math.floor(Math.random() * 5);
                const startColor = Object.values(colorSettings)[colorIndex];

                const mesh = new THREE.Mesh(geom, getFrostedMaterial(startColor));
                const scale = 0.005;
                mesh.scale.set(scale, -scale, scale);
                mesh.position.set(position.x, position.y, position.z);
                mesh.userData.basePosition = mesh.position.clone();
                scene.add(mesh);
                floatingMeshes.push(mesh);
                frostedGroups[colorIndex].push(mesh);
            });
        });
    });
}

loadSVGSymbol('./symbols/Herz.svg', getFrostedMaterial, new THREE.Vector3(5, 6, 1.5));
loadSVGSymbol('./symbols/Logo.svg', getFrostedMaterial, new THREE.Vector3(-15, -2, 2));

const floatingMeshes = [];
const symbols = ['*', '+', '&', '!', '«', '?', 'o', 'λ', '(('];

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    symbols.forEach((symbol, i) => {
        const geom = new TextGeometry(symbol, {
            font: font,
            size: 3.5,
            height: 0.8,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.03,
            bevelSegments: 5
        });
        geom.center();

        const colorIndex = i % 5;
        const startColor = Object.values(colorSettings)[colorIndex];

        const createMesh = (mat, zPos, renderOrder) => {
            const mesh = new THREE.Mesh(geom, mat);
            const aspect = window.innerWidth / window.innerHeight;
            const posX = (Math.random() - 0.5) * 14 * aspect;
            const posY = (Math.random() - 0.5) * 12;
            mesh.position.set(posX, posY, zPos);
            mesh.userData.basePosition = mesh.position.clone();
            mesh.renderOrder = renderOrder;
            scene.add(mesh);
            floatingMeshes.push(mesh);
            return mesh;
        };

        createMesh(getClearMaterial(), Math.random() * 1, 1);
        const frostedMesh = createMesh(getFrostedMaterial(startColor), 1.5 + Math.random() * 1.5, 1.5);
        frostedGroups[colorIndex].push(frostedMesh);
        renderer.sortObjects = true;
    });

    setupColorGUI();
    animate();
});

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

raycaster.setFromCamera(mouse, camera);

floatingMeshes.forEach((mesh, i) => {
    const targetPos = mesh.userData.basePosition.clone();
    targetPos.y += Math.sin(elapsed * 0.5 + i) * 0.3;
    targetPos.x += Math.cos(elapsed * 0.3 + i) * 0.2;

    // Abstand vom Strahl zur Form messen
    const closestPoint = new THREE.Vector3();
    raycaster.ray.closestPointToPoint(mesh.position, closestPoint);
    const dist = mesh.position.distanceTo(closestPoint);

    // Sanfte Abstoßung je näher der Strahl ist
    const pushRadius = 3.0;
    if (dist < pushRadius) {
        const pushDir = new THREE.Vector3()
            .subVectors(mesh.position, closestPoint)
            .normalize();
        const force = (pushRadius - dist) * 2.0;
        targetPos.addScaledVector(pushDir, force);
    }

    // Grenzen
    const boundX = (window.innerWidth / window.innerHeight) * 7;
    const boundY = 5;
    targetPos.x = THREE.MathUtils.clamp(targetPos.x, -boundX, boundX);
    targetPos.y = THREE.MathUtils.clamp(targetPos.y, -boundY, boundY);

    mesh.position.lerp(targetPos, 0.08);
    mesh.rotation.z = Math.sin(elapsed * 0.2 + i) * 0.1;
    mesh.rotation.x = Math.cos(elapsed * 0.2 + i) * 0.1;
});

    controls.update();
    // WICHTIG: composer.render() statt renderer.render() → sonst kein Bloom!
    composer.render();
}

function setupColorGUI() {
    const colorFolder = gui.addFolder('Glas Farben');
    Object.keys(colorSettings).forEach((key, index) => {
        colorFolder.addColor(colorSettings, key).name(`Farbe ${index + 1}`).onChange((value) => {
            frostedGroups[index].forEach(mesh => {
                mesh.material.color.set(value);
                mesh.material.attenuationColor.set(value);
                mesh.material.emissive.set(value); 
            });
        });
    });
}

function generateTextCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#EFEDEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 160px Arial';
    const text = "Queequeque Queer?";
    for (let i = 0; i < 10; i++) ctx.fillText(text, 50, 160 * i + 100);
    return canvas;
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // NEU: auch composer resizen
    composer.setSize(window.innerWidth, window.innerHeight);
});