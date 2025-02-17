// src/index.js
import { SceneManager } from './SceneManager.js';//vs code doesn't like this becase it's redundant, but three.js won't compile without it...
import { Lighting } from './Lighting.js';

document.addEventListener('click', () => {
    const elem = document.documentElement; // Target the full page
  
    // Check if the page is not already in full-screen mode
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
  
      // Request full-screen in a cross-browser way
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { // Safari and older WebKit browsers
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge legacy support
        elem.msRequestFullscreen();
      }
    }
  }, { once: true }); // Triggers only once on the first click

const canvas = document.querySelector('canvas.threejs');
const sceneManager = new SceneManager(canvas, "haulmaster1300");


// Instantiate some objects, maybe should be handled by sceneManager
const lighting = new Lighting(sceneManager.scene);


sceneManager.start();
