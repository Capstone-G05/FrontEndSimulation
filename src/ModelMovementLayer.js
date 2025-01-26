import { GrainCart } from './GrainCart.js';


export class ModelMovementLayer{
    constructor(model){
        this.model = model;
        this.animationStates = {
            PTO: false, // Tracks whether the PTO animation is running
        };
        this.animations = {
            PTO: null, // Reference to the PTO animation loop
        };
        this.isMoving = {};  // Tracks movement for each bone
        this.animationRequestId = {};
    }
    //Start Moving a Component
    startMovement(componentName, direction) {
        if (this.isMoving[componentName]) {
            this.stopMovement(componentName); // Stop any ongoing movement for this component
        }

        this.isMoving[componentName] = direction;
        this.animateComponent(componentName);
        console.log(`Starting ${componentName} animation ${direction}`);
    }

    //stop component movement
    stopMovement(componentName) {
        this.isMoving[componentName] = false;
        cancelAnimationFrame(this.animationRequestId[componentName]); // Stop the animation
        console.log(`Stopping ${componentName} animation`);
    }

    // Animate the component (up or down)
    animateComponent(componentName) {
        // Customize movement logic for each component (use Y-axis or any axis you need)
        if(componentName === "AugerHead"){
            if (this.isMoving[componentName] === 'right') {
                this.model.bones[componentName].rotateY(Math.PI / 512);
            }
            else{
                this.model.bones[componentName].rotateY(-Math.PI / 512);
            }
        }
        if (this.isMoving[componentName] === 'up') {
            this.model.bones[componentName].rotateX(Math.PI / 512);
        } else if (this.isMoving[componentName] === 'down') {
            this.model.bones[componentName].rotateX(-Math.PI / 512);
        }

        // Repeat animation
        if (this.isMoving[componentName]) {
            this.animationRequestId[componentName] = requestAnimationFrame(() => this.animateComponent(componentName));
        }
    }

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

    reset(){
        //this.model.resetCart();
        console.log("Cart reset");
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

        animate(); // Start the animation loop
    }

    PTOOff(){
        //actions to stop model rotating PTO
        if (!this.animationStates.PTO) return; // Not running
        this.animationStates.PTO = false;
        console.log("PTO animation stopped");

        if (this.animations.PTO) {
            cancelAnimationFrame(this.animations.PTO);
            this.animations.PTO = null;
        }
    }


}