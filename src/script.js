// src/index.js
import { SceneManager } from './SceneManager.js';
import { Lighting } from './Lighting.js';

document.addEventListener('click', () => {
    const elem = document.documentElement; 
  
    // Check if the page is not already in full-screen mode
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
  
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  }, { once: true }); // Triggers only once on the first click

const canvas = document.querySelector('canvas.threejs');
const sceneManager = new SceneManager(canvas, "haulmaster1300");


// Instantiate some objects, maybe should be handled by sceneManager
const lighting = new Lighting(sceneManager.scene);


sceneManager.start();
