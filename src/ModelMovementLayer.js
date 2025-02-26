import { GrainCart } from './GrainCart.js';
import { GrainPouringEffect } from './GrainPouringEffect.js';
import { GrainVolume } from './GrainVolume.js';
import * as THREE from 'three';

export class ModelMovementLayer {
    constructor(model, scene) {
        this.model = model;
        this.animationStates = {
            PTO: false, // Tracks whether the PTO animation is running
        };
        this.animations = {
            PTO: null, // Reference to the PTO animation loop
        };
        this.isMoving = {};  // Tracks movement for each bone
        this.animationRequestId = {}; // Tracks animation request ID for each bone

        this.componentLimits = {
            AugerArmBottom: { min: 0.6630780216691512, max: 1.3673039677973988}, 
            AugerArmTop: { min: -0.3, max: 2.7872021407926706 }, 
            AugerHead: { min: -Math.PI/3, max: Math.PI/3}, 
            AugerSpout: { min: -1.2, max: -0.5232488139826064 }, 
            GateStick: { min: 0.0934044597388311, max: 2.7502591888170893 },
        };

        this.componentSpeeds = {
            AugerArmBottom: Math.PI / 1024, 
            AugerArmTop: Math.PI / 1024, 
            AugerHead: Math.PI / 1024, 
            AugerSpout: Math.PI / 1024,
            GateStick: Math.PI / 1024
        }; //eventually have coefficients so each component can move at different speeds

        this.componentMaxSpeeds = {
            AugerArmBottom: Math.PI / 1024, 
            AugerArmTop: Math.PI / 1024, 
            AugerHead: Math.PI / 1024, 
            AugerSpout: Math.PI / 1024,
            GateStick: Math.PI / 1024
        };

        this.scene = scene;
        this.grainPouringEffect = new GrainPouringEffect(scene, model);
        this.grainVolume = new GrainVolume(scene, new THREE.Vector3(0, 0, 0));
    }
    setPresetData(componentName, componentData, minOrMax) {
        console.log("Setting preset data for " + componentName + " to " + componentData + " " + minOrMax + " degrees" + " (" + this.degreesToRadians(componentData) + " radians)");
        if (minOrMax === "min") {
            this.componentLimits[componentName].min = this.degreesToRadians(componentData);
            console.log(componentName + " MIN set to: " + this.componentLimits[componentName].min);
        }
        else if (minOrMax === "max") {
            this.componentLimits[componentName].max =  this.degreesToRadians(componentData);
            console.log(componentName + " MAX set to: " + this.componentLimits[componentName].max);

        }
    }

    /* Start component movement */
    startMovement(componentName, direction) {
        // TODO: handle weights front/rear
        if (componentName === "RearWeight" || componentName === "FrontWeight") { return; }

        if (this.isMoving[componentName]) {
            this.stopMovement(componentName); // stop any ongoing movement
        }

        this.isMoving[componentName] = direction;
        this.animateComponent(componentName);
        console.log(`Starting ${componentName} animation ${direction}`);
    }

    /* Stop component movement */
    stopMovement(componentName) {
        this.isMoving[componentName] = false;
        cancelAnimationFrame(this.animationRequestId[componentName]);
        console.log("min: " + this.radiansToDegrees(this.componentLimits[componentName].min));
        console.log("max: " + this.radiansToDegrees(this.componentLimits[componentName].max));
        console.log(`Stopping ${componentName} animation`);
    }

    /* Animate the component (up or down) */
    animateComponent(componentName) {
        // TODO: should 'weight' have bones (?)
        if (componentName === "RearWeight" || componentName === "FrontWeight") { return; }

        // Customize movement logic for each component (use Y-axis or any axis you need)
        const targetBone = this.model.bones[componentName];
        if (!targetBone) {
            console.error("Bone not found: " + componentName);
            return;
        }
        const limits = this.componentLimits[componentName];
        const direction = this.isMoving[componentName];

        if (limits) {
            const currentRotation = componentName === "AugerArmTop" || componentName === "AugerSpout" || componentName === "GateStick" ? targetBone.rotation.x : targetBone.rotation.y;
            const step = direction === "up" || direction === "right" ? this.componentSpeeds[componentName] : -this.componentSpeeds[componentName];
            const newRotation = currentRotation + step;
    
            // Clamp rotation
            if (newRotation < limits.min || newRotation > limits.max) {
                console.warn("${componentName} animation out of bounds");
                this.stopMovement(componentName); // Stop animation if out of bounds
                return;
            }
    
            // Apply rotation
            if (componentName === "AugerHead") {
                targetBone.rotateY(step);
            } else {
                targetBone.rotateX(step);
            }
            // console.log("Rotation at: " + targetBone.rotation.x);
        }
    
        // Repeat animation
        if (this.isMoving[componentName]) {
            this.animationRequestId[componentName] = requestAnimationFrame(() => this.animateComponent(componentName));
        }
    }

    // this is what I was using before to move bones before beginning to play with animations
    rotateBone(boneName, rotation){
        //logic for if they can rotate much goes here
        console.log("Rotating bone: " + boneName + " by " + rotation);
        if(this.model.bones[boneName]){
            const targetBone = this.model.bones[boneName];
            if(boneName === "AugerHead"){
                targetBone.rotateY(rotation);            
            }
            else{
                targetBone.rotateX(rotation);
            }
        }
        else{
            console.warn("Bone" + boneName + " not found in grain cart model.");
        }
    }

    autoFold(){
        console.log("Auto folding auger");
        this.PTOOff(); // Step 1: Turn off PTO
    
        const targetRotation = 0; // Neutral position for AugerHead
        const augerHead = this.model.bones["AugerHead"];
        const speed = this.componentSpeeds["AugerHead"];
    
        const moveAugerHeadToCenter = () => {
            return new Promise((resolve) => {
                const step = () => {
                    const currentRotation = augerHead.rotation.y;
                    const diff = targetRotation - currentRotation;
    
                    if (Math.abs(diff) > 0.01) {
                        const adjustment = diff > 0 ? speed : -speed;
                        augerHead.rotateY(adjustment);
                        requestAnimationFrame(step);
                    } else {
                        console.log("AugerHead centered");
                        resolve(); // Resolve the promise once done
                    }
                };
    
                step(); // Start the animation
            });
        };
    
        const foldAugerTop = () => {
            return new Promise((resolve) => {
                console.log("Folding AugerArmTop");
                this.startMovement("AugerArmTop", "up");
    
                const checkIfFolded = () => {
                    const currentRotation = this.model.bones["AugerArmTop"].rotation.x;
                    const maxLimit = this.componentLimits["AugerArmTop"].max;
    
                    if (Math.abs(currentRotation - maxLimit) > 0.01) {
                        requestAnimationFrame(checkIfFolded);
                    } else {
                        console.log("AugerArmTop folded");
                        this.stopMovement("AugerArmTop");
                        resolve(); // Resolve once folding is complete
                    }
                };
    
                checkIfFolded();
            });
        };
    
        const foldAugerBottom = () => {
            return new Promise((resolve) => {
                console.log("Folding AugerArmBottom");
                this.startMovement("AugerArmBottom", "down");
    
                const checkIfFolded = () => {
                    const currentRotation = this.model.bones["AugerArmBottom"].rotation.x;
                    const minLimit = this.componentLimits["AugerArmBottom"].min;
    
                    if (Math.abs(currentRotation - minLimit) > 0.01) {
                        requestAnimationFrame(checkIfFolded);
                    } else {
                        console.log("AugerArmBottom folded");
                        this.stopMovement("AugerArmBottom");
                        resolve(); // Resolve once folding is complete
                    }
                };
    
                checkIfFolded();
            });
        };
    

        moveAugerHeadToCenter()
            .then(() => foldAugerTop())
            .then(() => foldAugerBottom())
            .then(() => {
                console.log("Auto fold complete!");
            })
            .catch((error) => {
                console.error("Error during auto fold:", error);
            });
    }



    setPresetSpeedsInit(componentName, speed){
        // TODO: units ???
        console.log(componentName + " speed set to " + speed);
        console.log("Max speed for " + componentName + " set to " + this.degreesToRadians(speed/1000));
        this.componentMaxSpeeds[componentName] = this.degreesToRadians(speed/1000);
    }

    setSpeed(componentName, speedPercentage){
        this.componentSpeeds[componentName] = this.componentMaxSpeeds[componentName] * (speedPercentage/100);
    }
    // TODO: Implement this (quick model reset)
    reset(){
        //this.model.resetCart();
        this.grainVolume.setFillState("fullBack");
        // console.log("Cart reset");
    }

    PTOOn(){
        //actions to keep model rotating PTO
        console.log("PTO On");
        if (this.animationStates.PTO) return; // Already running
        this.animationStates.PTO = true;
        console.log("PTO animation started");

        const ptoBoneBottom = this.model.bones["AugerArmBottomSpiral"];
        const ptoBoneTop = this.model.bones["AugerArmTopSpiral"];
        const ptoBody = this.model.bones["BodySpiral"];

        const animate = () => {
            if (!this.animationStates.PTO) return; // Stop if PTO is toggled off
            ptoBoneBottom.rotateY(0.1); // Adjust rotation speed as needed
            ptoBoneTop.rotateY(0.1);
            ptoBody.rotateY(0.1);
            this.animations.PTO = requestAnimationFrame(animate);
        };
        this.grainPouringEffect.start();

        animate(); // Start the animation loop
    }

    PTOOff(){
        // actions to stop model rotating PTO
        if (!this.animationStates.PTO) return; // Not running
        this.animationStates.PTO = false;
        console.log("PTO animation stopped");

        if (this.animations.PTO) {
            cancelAnimationFrame(this.animations.PTO);
            this.animations.PTO = null;
        }

        this.grainPouringEffect.stop();
    }

    getPosition(componentName) {
        const targetBone = this.model.bones[componentName];
        switch (componentName) {
            case "AugerArmBottom": // pivot
                return this.radiansToDegrees(targetBone.rotation.y);
            case "AugerArmTop": // fold
                return this.radiansToDegrees(targetBone.rotation.x);
            case "AugerSpout": // rotate (?)
                return this.radiansToDegrees(targetBone.rotation.x);
            case "AugerHead": // tile (?)
                return this.radiansToDegrees(targetBone.rotation.y);
            case "GateStick": // gate
                return this.radiansToDegrees(targetBone.rotation.x);
            case "PTO":
                return 0;  // TODO: handle
            case "FrontWeight":
                return 0;  // TODO: handle
            case "RearWeight":
                return 0;  // TODO: handle
            default:
                console.warn(`[getPosition] unhandled component: ${componentName}`)
        }
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}