// loaders should be shared in THREE.js programs to avoid them being created more than once.
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export class Loader {
    constructor() {
        this.loader = new GLTFLoader();
        this.draco = new DRACOLoader();
        this.draco.setDecoderPath("/draco");
        this.loader.setDRACOLoader(this.draco);
    }
    
    load(model) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                model,
                (gltf) => {
                    // Resolve with the loaded scene
                    resolve(gltf.scene);
                },
                (xhr) => {
                    console.log(Math.round(xhr.loaded / xhr.total * 100) + "%");
                },
                (error) => {
                    console.error("An error occurred while loading the model: ", error);
                    reject(error);
                }
            );
        });
    }
}