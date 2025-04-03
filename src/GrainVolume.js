import * as THREE from "three";

const MAX_WEIGHT = 55000
const MIN_WEIGHT = 0

const WEIGHT_1 = ((1.45 - 1.1) / (2.9 - 1.1)) * (MAX_WEIGHT - MIN_WEIGHT)
const WEIGHT_2 = ((2.4 - 1.1) / (2.9 - 1.1)) * (MAX_WEIGHT - MIN_WEIGHT)

const DIMENSIONS = {
    MIN_WEIGHT: {
        width: 5.7, height: 0.88, y: 1.1, z: -0.375
    }, WEIGHT_1: {
        width: 5.7, height: 1.6, y: 1.45, z: -0.375
    }, WEIGHT_2: {
        width: 6.8, height: 3.8, y: 2.4, z: -0.9
    }, MAX_WEIGHT: {
        width: 6.8, height: 3.8, y: 2.9, z: -0.9
    },
}

export class GrainVolume {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
    }

    removeGrain() {
        // Remove existing grain plane
        this.scene.remove(this.mesh);
    }

    renderGrain(width, height, yOffset, zOffset) {
        // Create grain plane geometry
        this.geometry = new THREE.PlaneGeometry(width, height, 100, 50);
        this.geometry.rotateX(-Math.PI / 2);
        this.geometry.rotateY(Math.PI / 2);

        // Adjust position
        this.geometry.translate(0, yOffset, zOffset);

        // Create new material
        this.material = new THREE.ShaderMaterial({
            vertexShader:
                `uniform float grainLevel;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 displacedPosition = position;
                    displacedPosition.y += sin(uv.x * 3.14) * grainLevel;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
                }`,
            fragmentShader:
                `varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(0.8, 0.6, 0.3, 1.0); // Grain-like color
                }`,
            uniforms: {
                grainLevel: {value: 0.0}
            }
        });

        // Create new mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    adjustHeight(weight) {
        if (weight < MIN_WEIGHT) {
            this.removeGrain();
            this.renderGrain(
                DIMENSIONS.MIN_WEIGHT.width,
                DIMENSIONS.MIN_WEIGHT.height,
                DIMENSIONS.MIN_WEIGHT.y,
                DIMENSIONS.MIN_WEIGHT.z,
            );
        } else if (weight <= WEIGHT_1) {
            this.removeGrain();
            const delta = (weight - MIN_WEIGHT) / (WEIGHT_1 - MIN_WEIGHT);
            this.renderGrain(
                lerp(DIMENSIONS.MIN_WEIGHT.width, DIMENSIONS.WEIGHT_1.width, delta),
                lerp(DIMENSIONS.MIN_WEIGHT.height, DIMENSIONS.WEIGHT_1.height, delta),
                lerp(DIMENSIONS.MIN_WEIGHT.y, DIMENSIONS.WEIGHT_1.y, delta),
                lerp(DIMENSIONS.MIN_WEIGHT.z, DIMENSIONS.WEIGHT_1.z, delta),
            );
        } else if (weight <= WEIGHT_2) {
            this.removeGrain();
            const delta = (weight - WEIGHT_1) / (WEIGHT_2 - WEIGHT_1);
            this.renderGrain(
                lerp(DIMENSIONS.WEIGHT_1.width, DIMENSIONS.WEIGHT_2.width, delta),
                lerp(DIMENSIONS.WEIGHT_1.height, DIMENSIONS.WEIGHT_2.height, delta),
                lerp(DIMENSIONS.WEIGHT_1.y, DIMENSIONS.WEIGHT_2.y, delta),
                lerp(DIMENSIONS.WEIGHT_1.z, DIMENSIONS.WEIGHT_2.z, delta),
            );
        } else if (weight <= MAX_WEIGHT) {
            this.removeGrain();
            const delta = (weight - WEIGHT_2) / (MAX_WEIGHT - WEIGHT_2);
            this.renderGrain(
                lerp(DIMENSIONS.WEIGHT_2.width, DIMENSIONS.MAX_WEIGHT.width, delta),
                lerp(DIMENSIONS.WEIGHT_2.height, DIMENSIONS.MAX_WEIGHT.height, delta),
                lerp(DIMENSIONS.WEIGHT_2.y, DIMENSIONS.MAX_WEIGHT.y, delta),
                lerp(DIMENSIONS.WEIGHT_2.z, DIMENSIONS.MAX_WEIGHT.z, delta),
            );
        } else {
            this.removeGrain();
            this.renderGrain(
                DIMENSIONS.MAX_WEIGHT.width,
                DIMENSIONS.MAX_WEIGHT.height,
                DIMENSIONS.MAX_WEIGHT.y,
                DIMENSIONS.MAX_WEIGHT.z,
            );
        }
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

function lerp(start, end, delta) {
    return start + delta * (end - start);
}

export default GrainVolume;