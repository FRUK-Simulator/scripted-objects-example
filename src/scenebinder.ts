import * as THREE from 'three';
import Interpreter from 'js-interpreter';

interface XYZ { x: number; y: number; z: number };

class Thing {
    static geometry: THREE.Geometry = new THREE.BoxGeometry(1, 1, 1);
    static material: THREE.Material = new THREE.MeshStandardMaterial({ color: 0xEEEEEEEE });

    mesh: THREE.Mesh;

    constructor(pos: XYZ, scale: XYZ, rot: XYZ, scene: THREE.Scene) {
        this.mesh = new THREE.Mesh(Thing.geometry, Thing.material);
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.scale.set(scale.x, scale.y, scale.z);
        this.mesh.rotation.set(rot.x, rot.y, rot.z);
    }

    get pos(): XYZ { return this.mesh.position; }
    set pos(value: XYZ) { this.mesh.position.set(value.x, value.y, value.z); }

    get scale(): XYZ { return this.mesh.scale; }
    set scale(value: XYZ) { this.mesh.scale.set(value.x, value.y, value.z); }

    get rot(): XYZ { return this.mesh.rotation; }
    set rot(value: XYZ) { this.mesh.rotation.set(value.x, value.y, value.z); }

    toObject(): Object {
        let o: any = { pos: this.pos, scale: this.scale, rot: this.rot };
        return o;
    }
}

class Things {
    catalog: Map<number, Thing>;
    nextId: number;
    constructor(public scene: THREE.Scene) { this.catalog = new Map(); this.nextId = 0; }

    create(pos: XYZ, scale: XYZ, rot: XYZ): number {
        let id = this.nextId++;
        let newThing = new Thing(pos, scale, rot, this.scene);
        this.catalog.set(id, newThing);
        this.scene.add(newThing.mesh);
        return id;
    }

    read(id: number): Object {
        if (this.catalog.has(id)) {
            return this.catalog.get(id).toObject();
        }
        return undefined;
    }

    update(id: number, pos: XYZ, scale: XYZ, rot: XYZ): void {
        if (!this.catalog.has(id)) { return; }
        let thing = this.catalog.get(id);
        if (pos !== undefined) { thing.pos = pos; }
        if (scale !== undefined) { thing.scale = pos; }
        if (rot !== undefined) { thing.rot = pos; }
    }

    delete(id: number): void {
        if (!this.catalog.has(id)) { return; }
        let thing = this.catalog.get(id);
        this.scene.remove(thing.mesh);
        this.catalog.delete(id);
    }

    list(): number[] {
        return Array.from(this.catalog.keys());
    }
}

export class ScriptableScene {
    things: Things;

    constructor(scene: THREE.Scene) { this.things = new Things(scene); }

    bind(interpreter: Interpreter, scope: any): void {
        let sceneObject = interpreter.nativeToPseudo({});

        interpreter.setProperty(sceneObject, 'create', 
            interpreter.createNativeFunction(this.things.create.bind(this.things)));
        interpreter.setProperty(sceneObject, 'read', 
            interpreter.createNativeFunction((id: number) => { let obj = this.things.read(id); return interpreter.nativeToPseudo(obj); }));
        interpreter.setProperty(sceneObject, 'update', 
            interpreter.createNativeFunction(this.things.update.bind(this.things)));
        interpreter.setProperty(sceneObject, 'delete', 
            interpreter.createNativeFunction(this.things.delete.bind(this.things)));

        interpreter.setProperty(scope, 'scene', sceneObject);
    }
}