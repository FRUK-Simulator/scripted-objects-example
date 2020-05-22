import Interpreter from 'js-interpreter';
import * as THREE from 'three';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { ScriptableScene } from './scenebinder';

window.onload = main;

let renderer: THREE.Renderer;
let scene: THREE.Scene;
let camera: THREE.Camera;
let cameraControls: TrackballControls;

let interpreter: Interpreter;
let scriptable: ScriptableScene;

function main() {
  console.log("Hello world");

  // Rendering setup
  let height = Math.min(480, window.innerHeight);
  let width = Math.min(640, window.innerWidth);

  camera = new THREE.PerspectiveCamera(70, width / height, 0.001, 100);
  camera.position.z = 4;
  camera.position.y = 4;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(new THREE.AmbientLight(0x333333));

  let pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.x = 3;
  pointLight.position.y = 10;
  pointLight.position.z = 3;
  scene.add(pointLight);

  let rendererParams: THREE.WebGLRendererParameters = { antialias: true };
  renderer = new THREE.WebGLRenderer(rendererParams);
  renderer.setSize(width, height);
  renderer.domElement.classList.add("canvas");
  
  document.body.appendChild(renderer.domElement);

  cameraControls = new TrackballControls(camera, renderer.domElement);

  var helper = new THREE.GridHelper(1, 10);
  helper.scale.addScalar(10);
  scene.add(helper);

  scriptable = new ScriptableScene(scene);

  let script = [
    "var pos = {x:-5,y:0,z:-5};",
    "var scale = {x:1,y:1,z:1};",
    "var rot = {x:0,y:0,z:0};",
    "scene.create(pos, scale, rot);",
    "while(pos.x < 5) {",
    "  while(pos.z < 4) {",
    "    pos.z += 1.0; rot.x += 2.3;",
    "    scene.create(pos, scale, rot);",
    "  }",
    "  pos.z = -6; pos.x+=1.0",
    "}",
  ].join("\n");

  interpreter = new Interpreter(script, (interpreter, globalObject) => {
    scriptable.bind(interpreter, globalObject);
  });

  requestAnimationFrame(animate);
}

function animate(time: number) {
  requestAnimationFrame(animate);

  cameraControls.update();

  for(let i = 0; i< 10; i++){
    interpreter.step();
  }

  renderer.render(scene, camera);
}
