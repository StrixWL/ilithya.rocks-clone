import * as THREE from 'three'
import * as dat from 'lil-gui'
import { gsap } from 'gsap'
import Stats from 'stats.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/*
const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load('textures/door/color.jpg'); 
const doorAlphaTexture = textureLoader.load('textures/door/alpha.jpg'); 
const doorHeightTexture = textureLoader.load('textures/door/height.jpg'); 
const doorNormalTexture = textureLoader.load('textures/door/normal.jpg'); 
const doorAmbientOcclusionTexture = textureLoader.load('textures/door/ambientOcclusion.jpg'); 
const doorRoughnessTexture = textureLoader.load('textures/door/roughness.jpg'); 
const doorMetalnessTexture = textureLoader.load('textures/door/metalness.jpg'); 
const matcapTexture = textureLoader.load('textures/matcaps/5.png')
const gradientTexture = textureLoader.load('textures/matcaps/3.png')
*/

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
THREE.ColorManagement.enabled = false
const scene = new THREE.Scene()
const black = scene.background
scene.background = new THREE.Color(0x292929)
const textureLoader = new THREE.TextureLoader()
const group = new THREE.Group();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 1
const matcapTexture = textureLoader.load('./3.png')
const matMaterial = new THREE.MeshMatcapMaterial()
matMaterial.matcap = matcapTexture
const norMaterial = new THREE.MeshNormalMaterial()
scene.add(camera)

const constants = {
    distanceBetweenObjects: 25,
    objectsCount: 650,
    size: .3,
    material: 'Default'
}

const material = norMaterial

const grey = scene.background
gui.add(constants, 'material')
    .name('Theme')
    .options({ Default: norMaterial, Metalic: matMaterial })
    .onChange(v => {
        text.material = v
        group.traverse(obj => obj.material = v)
        scene.background = v == norMaterial ? grey : black
        
    })
gui.add(camera, 'fov')
    .min(0)
    .max(150)
    .name('Field of view')
    .onChange(() => {
        camera.updateProjectionMatrix( )
    })
gui.add(constants, 'objectsCount')
    .name('Objects count')
    .onChange(v => {
        group.clear()
        for (let i = 0; i < v; i += 2) {
            const newBox = box.clone()
            newBox.position.set(...randomPosGenerator())
            newBox.rotation.set(...randomPosGenerator())
            group.add(newBox)
            const newTorus = torus.clone()
            newTorus.position.set(...randomPosGenerator())
            newTorus.rotation.set(...randomPosGenerator())
            group.add(newTorus)
        }
    })
gui.add(constants, 'size')
    .name('Objects size')
    .min(0)
    .max(5)
    .onChange(v => {
        group.traverse(obj => {
            obj.scale.x = v
            obj.scale.y = v
            obj.scale.z = v
        })
        text.scale.x = v
        text.scale.y = v
        text.scale.z = v
    })

gui.add(constants, 'distanceBetweenObjects')
    .name('Distance between objects')
    .min(.1)
    .max(200)
    .onChange((v) => {
        group.traverse(obj => {
            obj.position.x = obj.position.x / distanceBetweenObjects * v
            obj.position.y = obj.position.y / distanceBetweenObjects * v
            obj.position.z = obj.position.z / distanceBetweenObjects * v
        })
        distanceBetweenObjects = v
    })

const text = new THREE.Mesh(undefined, material)
const fontLoader = new FontLoader();
fontLoader.load('./helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry('1337 3D', {
                font,
                size: .5,
                height: .2,
                curveSegments: 20, // 36
                bevelEnabled: true,
                bevelThickness: .03,
                bevelSize: .02,
                bevelOffset: 0,
                bevelSegments: 16 // 20
            }
        )
        textGeometry.computeBoundingBox()
        textGeometry.translate(
            - (textGeometry.boundingBox.max.x - .02) / 3,
            - (textGeometry.boundingBox.max.y - .02) / 2,
            - (textGeometry.boundingBox.max.z - .03) / 2            
        )
        textGeometry.computeBoundingBox()
        text.geometry = textGeometry
        scene.add(text)
        scene.add(group)
    }
)

let distanceBetweenObjects = constants.distanceBetweenObjects
const objectsCount = constants.objectsCount
const objectsSize = constants.size

const randomPosGenerator = () => [(Math.random() - .5) * distanceBetweenObjects, (Math.random() - .5) * distanceBetweenObjects, (Math.random() - .5) * distanceBetweenObjects]
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1 * objectsSize, 1 * objectsSize, 1 * objectsSize),
    material
)
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(.3 * objectsSize, .2 * objectsSize, 30, 200),
    material
)
for (let i = 0; i < objectsCount; i += 2) {
    const newBox = box.clone()
    newBox.position.set(...randomPosGenerator())
    newBox.rotation.set(...randomPosGenerator())
    group.add(newBox)
    const newTorus = torus.clone()
    newTorus.position.set(...randomPosGenerator())
    newTorus.rotation.set(...randomPosGenerator())
    group.add(newTorus)
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const handleMove = (event) => {
    const x = event.clientX / sizes.width
    const y = event.clientY / sizes.height
    const diffx = Math.abs(x - .5)
    const diffy = Math.abs(y - .5)
    const diff = Math.max(diffx, diffy)
    const coefficientX = 26
    const coefficientY = 18
    const coefficientZ = 10
    animations.forEach(animation => animation.kill())
    animations.push(gsap.to(camera.position, { duration: 1, x: (x * coefficientX) - coefficientX / 2 }));
    animations.push(gsap.to(camera.position, { duration: 1, y: (-y * coefficientY) + coefficientY / 2 }));
    animations.push(gsap.to(camera.position, { duration: 1, z: 1 + diff * coefficientZ}));
}

let animations = []
document.addEventListener('mousemove', handleMove)
document.addEventListener('touchmove', (event) => handleMove(event.changedTouches[0]))

const stats = new Stats();
stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const gsapTextLoop = (z) => {
    gsap.to(text.rotation, { duration: 5, ease: 'power1.inOut', z, onComplete: () => gsapTextLoop(-z)})
}
gsapTextLoop(1)

const gsapGroupLoopX = (x) => {
    gsap.to(group.rotation, { duration: 5, ease: 'power1.inOut', x, onComplete: () => gsapGroupLoopX(-x)})
}
gsapGroupLoopX(.5)

const gsapTextLoopX = (x) => {
    gsap.to(text.rotation, { duration: 5, ease: 'power1.inOut', x, onComplete: () => gsapTextLoopX(-x)})
}
gsapTextLoopX(.5)

const gsapGroupLoopY = (y) => {
    gsap.to(group.rotation, { duration: 8, ease: 'power1.inOut', y, onComplete: () => gsapGroupLoopY(-y)})
}
gsapGroupLoopY(.5)

const gsapTextLoopY = (y) => {
    gsap.to(text.rotation, { duration: 8, ease: 'power1.inOut', y, onComplete: () => gsapTextLoopY(-y)})
}
gsapTextLoopY(.5)

const gsapGroupLoopZ = (z) => {
    gsap.to(group.rotation, { duration: 14, ease: 'power1.inOut', z, onComplete: () => gsapGroupLoopZ(-z)})
}
gsapGroupLoopZ(.5)

const gsapTextLoopZ = (x) => {
    gsap.to(text.rotation, { duration: 5, ease: 'power1.inOut', z: x, onComplete: () => gsapTextLoopX(-x)})
}
gsapTextLoopZ(.5)

const loop = () => {
    stats.begin();
    camera.lookAt(scene.position)
    renderer.render(scene, camera)
    stats.end();
    window.requestAnimationFrame(loop)
}

loop()
