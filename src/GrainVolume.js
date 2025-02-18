import * as THREE from "three";

export class GrainVolume {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;

        this.geometry = new THREE.PlaneGeometry(4, 2, 100, 50);
        this.geometry.rotateX(-Math.PI / 2);
        this.geometry.rotateY(Math.PI / 2);
        this.geometry.translate(0, 2, -0.5);

        this.material = new THREE.ShaderMaterial({
            vertexShader: `
              uniform float grainLevel;
              varying vec2 vUv;
              void main() {
                vUv = uv;
                vec3 displacedPosition = position;
                displacedPosition.y += sin(uv.x * 3.14) * grainLevel;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
              }
            `,
            fragmentShader: `
              varying vec2 vUv;
              void main() {
                gl_FragColor = vec4(0.8, 0.6, 0.3, 1.0); // Grain-like color
              }
            `,
            uniforms: {
              grainLevel: { value: 0.0 }
            }
          });

          this.mesh = new THREE.Mesh(this.geometry, this.material);
          this.mesh.position.copy(this.position);
          this.scene.add(this.mesh);
        }

    setFillState(state) {
        switch (state) {
            case 'fullMiddle':
            this.material.uniforms.grainLevel.value = 1.0;
            break;
            case 'fullFront':
            this.material.uniforms.grainLevel.value = 0.6;
            break;
            case 'fullBack':
            this.material.uniforms.grainLevel.value = 0.4;
            break;
            case 'empty':
            this.material.uniforms.grainLevel.value = 0.0;
            break;
            default:
            console.warn('Unknown state:', state);
        }
        }
}

export default GrainVolume;