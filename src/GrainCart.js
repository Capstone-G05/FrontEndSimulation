export class GrainCart {
    constructor(modelType, loader) {
        this.loader = loader; // Instance of Loader
        this.model = null;    // Model will be loaded here
        this.modelType = modelType; // Type of model to load
    }

    load() {
        return new Promise((resolve, reject) => {
            if (this.modelType === "haulmaster1300") {
                // Use the loader to load the model
                this.loader.load("models/grainCartDecimateOn10.glb")
                    .then((loadedScene) => {
                        // Once loaded, set up the model
                        this.model = loadedScene;
                        this.model.name = "grainCart";
                        this.model.scale.set(0.05, 0.05, 0.05);
                        this.model.position.y = 1;
                        // this.model.rotateX(-Math.PI/2);
                        resolve(this.model);
                    })
                    .catch((error) => {
                        console.error('Error loading cart model:', error);
                        reject(error);
                    });
            }
        });
    }
}