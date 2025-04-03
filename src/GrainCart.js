import * as THREE from 'three';

export class GrainCart {
    constructor(modelType, loader) {
        this.loader = loader; // Instance of Loader
        this.model = null;   // Model will be loaded here
        this.modelType = modelType; // Type of model to load
        this.bones = {}; //Armature object, assume all grain carts hold the same basic objects
                            //AugerBottom
                            //AugerTop
                            //AugerBottomSpiral
                            //AugerTopSpiral
                            //AugerHead
                            //AugerSpout
                            //GateIndicator
                            //AugerBodySpiral
    }

    load() {
        return new Promise((resolve, reject) => {
            if (this.modelType === "haulmaster1300") {
                // Use the loader to load the model
                this.loader.load("models/DecalsAddedV3.glb")
                    .then((loadedScene) => {
                        // Once loaded, set up the model
                        this.model = loadedScene;
                        this.model.name = "grainCart";
                        this.model.scale.set(0.05, 0.05, 0.05);
                        this.model.position.y = 1;
                        this.model.position.z = 2.5;
                        this.model.position.x = 0;

                        //Temp code adds axis to each bone joint
                        // const targetBone = loadedScene.getObjectByName("AugerArmTop");
                        // const axesHelper = new THREE.AxesHelper(10);
                        // targetBone.add(axesHelper);
                        // targetBone.rotateX(Math.PI);
                        // loadedScene.traverse((node) => {
                        //     //console.log(node.type, node.name);
                        //     if(node.isBone){
                        //         //console.log("hello");
                        //         node.add(new THREE.AxesHelper(10));
                        //     }
                        // });

                        this.model.traverse((node) => {
                            if (node.isBone) {
                                this.bones[node.name] = node;
                            }
                        });

                        resolve(this.model);
                    })
                    .catch((error) => {
                        console.error('Error loading cart model:', error);
                        reject(error);
                    });
            }
        });
    }
    // const targetBone = loadedScene.getObjectByName("AugerArmTop");
    // const axesHelper = new THREE.AxesHelper(10);
    // targetBone.add(axesHelper);
    // targetBone.rotateX(Math.PI);

}