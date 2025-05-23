import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { createSky } from "./skyInit.js";
import { createField } from './field.js';
import { Pane } from "tweakpane";
import { Loader } from './Loader.js';
import { GrainCart } from './GrainCart.js';
import { ModelMovementLayer } from './ModelMovementLayer.js';
import { UIController } from './UIController.js';
import { APIController } from './APIController.js';
import { GrainPouringEffect } from './GrainPouringEffect.js';


/*
This class will handle changes to the scene that need to occur, such as adding and triggering animations for various objects.
*/

export class SceneManager {
    constructor(canvas) {
        // Initialize scene
        this.scene = new THREE.Scene();
        
        // Initialize camera and position
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 5, 5);

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)*0.5);

        // Initialize controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;

        // Resize event listener
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initialize stats
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        // Create sky and field
        this.sky = createSky();
        this.field = createField();

        // Initialize loader
        this.loader = new Loader();

        // Initialize ModelMovementLayer
        this.movementLayer = null;

        // Initialize UIController
        this.uiController = null;

        // Initialize APIController
        this.APIController = null;

        //initialize particle effect
        this.grainPouringEffect = new GrainPouringEffect(new THREE.Vector3(0, 0, 0));
    }

    initializeScene() {
        this.scene.add(this.sky, this.field);
        this.scene.background = new THREE.Color("white");
        this.addGrainCart("haulmaster1300"); // Pass model type here
        //this.APISetup();
    }

    render() {
        this.stats.begin();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
    }

    start() {
        this.initializeScene();
        this.renderer.setAnimationLoop(() => this.render());
    }

    addGrainCart(modelType) {
        const grainCart = new GrainCart(modelType, this.loader);
        grainCart.load().then((model) => {
            model.castShadow = false;
            model.recieveShadow = false;
            this.movementLayer = new ModelMovementLayer(grainCart, this.scene);
            // this.uiController = new UIController(this.movementLayer);  // uncomment for web UI controls
            // this.uiController.setUpControls();
            this.scene.add(model);
            //could use API CONTROLLER HERE
            // console.log("API Controller: " + this.APIController);
            this.APIController = new APIController(this.movementLayer);
            this.APIController.setupAPIController();
        }).catch((error) => {
            console.error('Error loading grain cart:', error);
        });
    }

    // APISetup(){
    //     this.APIController.getPresetData("http://localhost:8020/auger-pivot-angle-max");//this is a placeholder url
    //     this.APIController.startPolling("http://localhost:8020/auger-pivot-angle-max", 100); // 100 ms
    // }
}
