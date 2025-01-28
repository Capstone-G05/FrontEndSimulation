import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
<<<<<<< HEAD
        this.directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
=======
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
>>>>>>> 2625313bde96ae0d999cdbdbfe61224a3b82ad06
        this.directionalLight.position.set(1, 1, 5);
        scene.add(this.ambientLight, this.directionalLight);
    }
}