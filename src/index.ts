import Interpreter from 'js-interpreter';
import * as THREE from 'three';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { ScriptableScene } from './scenebinder';
import * as monaco from 'monaco-editor';

window.onload = main;

let renderer: THREE.Renderer;
let scene: THREE.Scene;
let camera: THREE.Camera;
let cameraControls: TrackballControls;

let interpreter: Interpreter;
let scriptable: ScriptableScene;

let editor: monaco.editor.IStandaloneCodeEditor;
let codeRunning = false;

function main() {
  console.log("Hello world");

  let canvas = <HTMLCanvasElement>document.getElementById("canvas");

  // Rendering setup
  let height = canvas.clientHeight;
  let width = canvas.clientWidth;

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

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
  });
  renderer.setSize(width, height);

  cameraControls = new TrackballControls(camera, renderer.domElement);

  var helper = new THREE.GridHelper(1, 10);
  helper.scale.addScalar(10);
  scene.add(helper);

  scriptable = new ScriptableScene(scene);

  setup_editor();

  requestAnimationFrame(animate);
}

function setup_editor() {

  let script = [
    "// Delete items in the scene",
    "var items = scene.list();",
    "for(var i = 0;i<items.length;i++) {",
    "  scene.delete(i);",
    "}",
    "// Create a few cubes",
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

  editor = monaco.editor.create(document.getElementById("code"), {
    value: script,
    language: "javascript"
  });

  let button = <HTMLButtonElement>document.getElementById("run");

  interpreter = new Interpreter("", (interpreter, globalObject) => {
    scriptable.bind(interpreter, globalObject);
  });

  button.addEventListener('click', (ev) => {
    interpreter.appendCode(editor.getValue());
    codeRunning = true;
    ev.preventDefault();
  });
}

function animate(time: number) {
  requestAnimationFrame(animate);

  cameraControls.update();

  if(codeRunning) {
    for (let i = 0; i < 10; i++) {
      if(false == interpreter.step()) {
        codeRunning = false;
        break;
      }
    }
  }

  renderer.render(scene, camera);
}
