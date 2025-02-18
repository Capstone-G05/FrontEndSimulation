import * as THREE from 'three';


export class GrainPouringEffect {
    constructor(scene, model) {
        this.spoutPosition = new THREE.Vector3(0, 0, 0); // Ensure it's initialized
        this.isPouring = false;
        this.particles = [];
        this.particleCount = 10000; // Number of particles
        this.gravity = -0.02; // Simulated gravity
        this.speeds = []; // Stores velocities for each particle
        this.scene = scene;
        this.model = model;
    }

    getPourBonePosition() {
        const pourBone = this.model.bones["PourBone"];
        if (!pourBone) {
            console.warn("PourBone not found in the model.");
            return new THREE.Vector3(0, 0, 0); // default position if bone not found
        }
        return pourBone.getWorldPosition(new THREE.Vector3());
    }

    getPourDirection() {
        const pourDirectionBone = this.model.bones["PourDirection"]; // Get PourDirection bone
        if (!pourDirectionBone) {
            console.warn("PourDirection bone not found in the model.");
            return new THREE.Vector3(0, 0, 0); // default position if bone not found
        }
        return pourDirectionBone.getWorldPosition(new THREE.Vector3());
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);

        const initSpeed = this.getInitSpeed();

        for (let i = 0; i < this.particleCount; i++) {
            const point = this.getRandomPoint();
            
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;

            velocities[i * 3] = -initSpeed.x *2;  // Initial horizontal speed
            velocities[i * 3 + 1] = -initSpeed.y *2 // Initial downward speed
            velocities[i * 3 + 2] = -initSpeed.z *2
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.speeds = velocities;

        const material = new THREE.PointsMaterial({
            color: 0xC59401, // Brownish color like grain
            size: 0.05,
            transparent: true,
            opacity: 0.95,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    start() {
        if (this.isPouring) return;
        this.createParticles();
        this.isPouring = true;
        console.log("Grain pouring started");
        this.animate();
    }

    stop(){
        if(this.isPouring){
            this.isPouring = false;
            console.log("Grain pouring stopped");
        }
    }

    animate() {
        const positions = this.particles.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount; i++) {
            this.speeds[i * 3] -= (Math.random() - 0.2) * 0.01;
            this.speeds[i * 3 + 1] += (Math.random() - 0.5) * 0.01;
            this.speeds[i * 3 + 2] -= (Math.random() - 0.2) * 0.01;

            const randomFactor = Math.random();

            positions[i * 3] += this.speeds[i * 3]/8*randomFactor;      // X movement
            positions[i * 3 + 1] += this.speeds[i * 3 + 1]/2*randomFactor;  // Y movement (gravity)
            positions[i * 3 + 2] += this.speeds[i * 3 + 2]/8*randomFactor;  // Z movement

            this.speeds[i * 3 + 1] += this.gravity; // Apply gravity effect

            // Reset particle if it falls too low
            if (positions[i * 3 + 1] < 0) {
                if(this.isPouring){
                    const point = this.getRandomPoint();
                    const initSpeed = this.getInitSpeed();

                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;

                    // this.speeds[i * 3] = -initSpeed.x + (Math.random() - 0.5) * 0.1;
                    // this.speeds[i * 3 + 1] = -initSpeed.y + (Math.random() * 0.02);
                    // this.speeds[i * 3 +  2] = -initSpeed.z + (Math.random() - 0.5) * 0.1;

                    this.speeds[i * 3] = -initSpeed.x*2;
                    this.speeds[i * 3 + 1] = -initSpeed.y*2;
                    this.speeds[i * 3 +  2] = -initSpeed.z*2;            
                }
                else{
                    positions[i * 3] = 9999;
                    positions[i * 3 + 1] = 9999;
                    positions[i * 3 + 2] = 9999
                }
            }
                
        }


        this.particles.geometry.attributes.position.needsUpdate = true;

        requestAnimationFrame(() => this.animate());
    }

    getInitSpeed(){
        const pourBone = this.getPourBonePosition();
        const pourDirection = this.getPourDirection();
        const direction = new THREE.Vector3().subVectors(pourBone, pourDirection).normalize();

        return direction;
    }
    

    getRandomPoint(){
        const pourBone = this.getPourBonePosition();
        const pourDirection = this.getPourDirection();

        const diskNormal = new THREE.Vector3().subVectors(pourBone, pourDirection).normalize();

        const angle = Math.random() * Math.PI * 2;
        //const radius = Math.random() * 0.23;
        const radius = 0.23;

        const randomX = Math.cos(angle) * radius;
        const randomY = Math.sin(angle) * radius;

        const randomPoint = new THREE.Vector3(randomX, randomY, 0);

        const rotationMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), diskNormal, new THREE.Vector3(0,1,0));

        randomPoint.applyMatrix4(rotationMatrix);

        randomPoint.add(pourBone);

        return randomPoint;


    }
}
