// src/index.js
import { SceneManager } from './SceneManager.js';//vs code doesn't like this becase it's redundant, but three.js won't compile without it...
import { Lighting } from './Lighting.js';

const canvas = document.querySelector('canvas.threejs');
const sceneManager = new SceneManager(canvas, "haulmaster1300");


// Instantiate some objects, maybe should be handled by sceneManager
const lighting = new Lighting(sceneManager.scene);


sceneManager.start();
