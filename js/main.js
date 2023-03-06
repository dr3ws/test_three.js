let CANVAS = document.querySelector('#follower');

let SCENE, CAMERA, RENDERER;
let PLANE;
let LOADER;
let LOADING_MANAGER;
let MTL_LOADER, OBJ_LOADER;
let CONTROLS;
let OBJECT;
let LIGHT;

const COLORLIGHT = 0xffffff;
const INTENSITYLIGHT = 0.5;
const PLANESIZESCENE = 1000;

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class AxesGUIHelper {
    constructor(node) {
        const axes = new THREE.AxesHelper(20);
        axes.renderOrder = 2;
        node.add(axes);
        this.axes = axes;
        this.visible = false;
    }
    get visible() {
        return this._visible;
    }
    set visible(v) {
        this._visible = v;
        this.axes.visible = v;
    }
}

main();

function main() {
    initScene();
    initLights();
    initCamera();
    initRenderer();
    initLoaders();
    initControls();

    initControlPanel();

    loadModel();
}

// сцена
function initScene() {
    SCENE = new THREE.Scene();
    SCENE.fog = new THREE.Fog(0xa0a0a0, 1, 1500);
    SCENE.background = new THREE.Color(0xa0a0a0);

        LOADER = new THREE.TextureLoader();
        let texture = LOADER.load('./images/texture_plane.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);

        let planeGeometry = new THREE.PlaneGeometry(PLANESIZESCENE, PLANESIZESCENE);
        let planeMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        PLANE = new THREE.Mesh(planeGeometry, planeMaterial);
        PLANE.receiveShadow = true; // объект получает тени
        PLANE.rotation.x = -Math.PI / 2;
        PLANE.position.y = -0.5;
        PLANE.position.z = 0;
        SCENE.add(PLANE);
}

let urls = [
    './images/_ft.png', './images/_bk.png',
    './images/_up.png', './images/_dn.png',
    './images/_rt.png', './images/_lf.png'
];
let loader = new THREE.CubeTextureLoader();
SCENE.background = loader.load(urls);

const cubeCamera = new THREE.CubeCamera(1, 10, 50);
cubeCamera.position.set(30, 30, 30);
SCENE.add(cubeCamera);

let sphereGeo = new THREE.SphereGeometry(50, 50, 50);
let material = new THREE.MeshBasicMaterial({
    envMap: cubeCamera.renderTarget
});

let sphere = new THREE.Mesh(sphereGeo, material);
sphere.position.set(100, 100, 50);
sphere.castShadow = true;
sphere.receiveShadow = true;
SCENE.add(sphere);

// источник света
function initLights() {
    LIGHT = new THREE.DirectionalLight(COLORLIGHT, INTENSITYLIGHT); //  свет в определенном направлении
    LIGHT.position.set(80, 60, -20); // устанавливаем источник света
    LIGHT.target.position.set(45, 0, 30); // устанавливаем направление света
    LIGHT.shadow.camera.near = 0.5;
    LIGHT.shadow.camera.far = 5000;
    LIGHT.shadow.camera.left = -500;
    LIGHT.shadow.camera.bottom = -500;
    LIGHT.shadow.camera.right = 500;
    LIGHT.shadow.camera.top = 500;
    LIGHT.castShadow = true;
    SCENE.add(LIGHT);
}

// камера
function initCamera() {
    CAMERA = new THREE.PerspectiveCamera(
        90, // fov - поле зрения. Определяет угол, который можно видеть вокруг центра камеры
        window.innerWidth / window.innerHeight, // (aspect ratio) пропорция (соотношение ширины к высоте экрана)
        1, // (near) минимальное расстояние от камеры, которое попадает в рендеринг
        2000 // (far) максимальное расстояние от камеры, которое попадает в рендеринг
    );
    CAMERA.position.set(210, 180, 200);
}

// отрисовка изображения
function initRenderer() {
    RENDERER = new THREE.WebGLRenderer( { CANVAS, alpha: true } );
    RENDERER.setPixelRatio(window.devicePixelRatio);
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    RENDERER.shadowMap.enabled = true;
    RENDERER.shadowMapEnable = true;
    CANVAS.appendChild(RENDERER.domElement);
}

// загрузчики
function initLoaders() {
    LOADING_MANAGER = new THREE.LoadingManager();
    MTL_LOADER = new THREE.MTLLoader(LOADING_MANAGER);
    OBJ_LOADER = new THREE.OBJLoader(LOADING_MANAGER);
}

// событие вращения
function initControls() {
    CONTROLS = new THREE.OrbitControls(CAMERA, CANVAS);
    CONTROLS.target.set(110, 25, 10);
    CONTROLS.maxPolarAngle = Math.PI * 1.5 / 4;
    CONTROLS.zoomSpeed = 3;
    CONTROLS.update();
}

// загрузка модели
function loadModel() {
    MTL_LOADER.setTexturePath('./models/');
    MTL_LOADER.load('./models/Door.mtl', (materials) => {
        materials.preload();
        OBJ_LOADER.setMaterials(materials);
        OBJ_LOADER.load('./models/Door.obj', (object) => {
            object.scale.set(5, 5, 5);
            object.rotation.set(0, 0, 0);
            object.position.y = -5;
            object.castShadow = true; // объект отбрасывает тени
            object.receiveShadow = true; // объект получает тени

            object.traverse(function(child) {
                child.castShadow = true;
            });

            OBJECT = object;
            SCENE.add(OBJECT);
        });
    });

    let geometryCube = new THREE.BoxGeometry(50, 50, 50);
    let materialCube = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    let CUBE = new THREE.Mesh(geometryCube, materialCube);
    CUBE.castShadow = true; // объект отбрасывает тени
    CUBE.position.x = 100;
    CUBE.position.y = 25;
    SCENE.add(CUBE);
}

// панель управления
function initControlPanel() {
    let cameraHelper = new THREE.CameraHelper(LIGHT.shadow.camera);
    // SCENE.add(cameraHelper);

    let directionalLightHelper = new THREE.DirectionalLightHelper(LIGHT);
    // SCENE.add(directionalLightHelper);

    function updateCamera() {
        LIGHT.target.updateMatrixWorld();
        directionalLightHelper.update();
        // обновление матрицы проекции теневой камеры света
        LIGHT.shadow.camera.updateProjectionMatrix();
        // обновление cameraHelper, для того, чтобы показать теневую камеру света
        cameraHelper.update();

        requestAnimationFrame(animate);
    }
    updateCamera();

    let gui = new dat.GUI();
    gui.close();
    gui.add(LIGHT, 'intensity', 0, 2, 0.01).name('Яркость света').onChange(requestRenderIfNotRequested);
    gui.addColor(new ColorGUIHelper(LIGHT, 'color'), 'value').name('Цвет').onChange(requestRenderIfNotRequested);

    // makeShadow(gui, LIGHT.shadow.camera, 'Shadow camera', updateCamera);
    makeXYZLight(gui, LIGHT.position, 'Позиция света', updateCamera);
    makeXYZLightTarget(gui, LIGHT.target.position, 'Направление света', updateCamera);
}

// let renderRequested = false;
function animate() {
    requestAnimationFrame( animate );
    render();
    update();
}

function update() {
    CONTROLS.update();
}

function render() {
    cubeCamera.update( RENDERER, SCENE );
    RENDERER.render( SCENE, CAMERA );
}

// запрос рендеринга, если он не запрошен
function requestRenderIfNotRequested() {
    requestAnimationFrame(animate);
}

// CANVAS.addEventListener('click', requestRenderIfNotRequested);
CONTROLS.addEventListener('change', requestRenderIfNotRequested);
window.addEventListener('resize', requestRenderIfNotRequested);

function makeXYZLight(gui, vector, name, onChangeFn) {
    const lightFolder = gui.addFolder(name);

    const helper = new AxesGUIHelper(LIGHT);
    lightFolder.add(helper, 'visible').name('Оси').onChange(onChangeFn);

    lightFolder.add(vector, 'x', -150, 150).onChange(onChangeFn);
    lightFolder.add(vector, 'y', 0, 150).onChange(onChangeFn);
    lightFolder.add(vector, 'z', -150, 150).onChange(onChangeFn);
}

function makeXYZLightTarget(gui, vector, name, onChangeFn) {
    const lightFolder = gui.addFolder(name);

    lightFolder.add(vector, 'x', -150, 150).onChange(onChangeFn);
    lightFolder.add(vector, 'y', 0, 150).onChange(onChangeFn);
    lightFolder.add(vector, 'z', -150, 150).onChange(onChangeFn);
}