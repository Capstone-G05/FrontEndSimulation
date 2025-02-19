import dotenv from 'dotenv';

export class APIController{
    constructor(modelMovementLayer){
        this.modelMovementLayer = modelMovementLayer;
        this.pollingIntervalId = null;
        this.isMoving = {
          AugerArmBottom: false, 
          AugerArmTop: false, 
          AugerHead: false, 
          AugerSpout: false,
          GateAngle: false,
          PTO: false,
          FrontWeight: false,
          RearWeight: false
        };
        this.powerOn = false;
        this.pollingIntervalIds = {};
      }

    startPolling(componentName, url, direction) {
      const intervalMs = 100
        if (this.pollingIntervalIds[componentName + direction]) {
          console.warn('Polling is already running for ' + componentName + " " + direction);
          return;
        }
    
        const fetchAndUpdate = () => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              //console.log(componentName + ' Polled data:' + direction + " " + data);
              this.processRunningData(componentName, data, direction);
              this.sendPosition(componentName);
            })
            .catch((error) => {
              console.error(componentName + ' Error during polling: ' + direction + " " + error);
            });
        };
    
        // Start the polling
        this.pollingIntervalIds[componentName + direction] = setInterval(fetchAndUpdate, intervalMs+ Math.random()*100);
        console.log(`Started polling ${url} every ${intervalMs} ms.`);
      }
    
      // Method to stop polling
      stopPolling() {
        if (this.pollingIntervalId !== null) {
          clearInterval(this.pollingIntervalId);
          this.pollingIntervalId = null;
          console.log('Polling stopped.');
        } else {
          console.warn('Polling is not running.');
        }
      }

    //load all preset data from the server

    //loads one piece of the data from the URL
    getPresetData(url){
        fetch(url)
        .then(response => response.json())
        .then(min => {
            //console.log(min);
            return min;
        })
        .catch((error) => {
            console.error('Error getting preset data:', error);
        });
    }

    sendPosition(componentName){
        let url = "";
        let data = this.modelMovementLayer.getPosition(componentName);
        console.log("herehere");
        if(componentName == "AugerArmBottom"){
            url = "http://localhost:8000/set-auger-bottom-pivot-angle";
        }
        else if(componentName == "AugerArmTop"){
            url = "http://localhost:8000/set-auger-top-angle";
        }
        else if(componentName == "AugerSpout"){
            url = "http://localhost:8000/set-spout-tilt-angle";
        }
        else if(componentName == "AugerHead"){
            url = "http://localhost:8000/set-head-rotation-angle";
        }
        else if(componentName == "Gate"){
            url = "http://localhost:8000/set-gate-angle";
        }
        console.log(url + " " + data);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({value: data}),
        })
        .then(response => response.json())
        .then(data => {
            //console.log(componentName + ' Success:', data);
        })
        .catch((error) => {
            console.error(componentName+ ' Error sending position:', error);
        });
    }

    processRunningData(componentName, data, direction){
      let down = "down";
      let up = "up";
      if(componentName == "AugerHead"){
        down = "left";
        up = "right";
      }
      else if(componentName == "SimulationPower"){
        this.powerOn = data;
        return;
      }
      else if(componentName == "FrontWeight" || componentName == "RearWeight"){
        if(data != this.isMoving[componentName]){
          // this.modelMovementLayer.toggleFrontWeight(); //need to implement this better first
          this.isMoving[componentName] = data;
          console.log(componentName + " changed: " + data);
          return;
        }
      }
      else if(componentName == "PTO"){
        if(this.isMoving[componentName] == true && data == 0){
          this.modelMovementLayer.PTOOff();
          this.isMoving[componentName] = false;
        }
        else if(this.isMoving[componentName] == false && data != 0){
          this.modelMovementLayer.PTOOn();
          this.isMoving[componentName] = true;
        }
        return;
      }
      if(direction == up){
        if(this.isMoving[componentName] == up && data == 0){
          this.modelMovementLayer.setPresetSpeedsInit(componentName, data);
          this.modelMovementLayer.stopMovement(componentName);
          this.isMoving[componentName] = false;
        }
        else if(data != 0){
          this.modelMovementLayer.setPresetSpeedsInit(componentName, data);
          if(this.isMoving[componentName] != up){
            this.modelMovementLayer.startMovement(componentName, up);
            this.isMoving[componentName] = up;
          }
        }
      }

      else{
        if(this.isMoving[componentName] == down && data == 0){
          this.modelMovementLayer.setPresetSpeedsInit(componentName, data);
          this.modelMovementLayer.stopMovement(componentName);
          
          this.isMoving[componentName] = false;
        }
        else if(data != 0){
          this.modelMovementLayer.setPresetSpeedsInit(componentName, data);
          if(this.isMoving[componentName] != down){
            this.modelMovementLayer.startMovement(componentName, down);
            this.isMoving[componentName] = down;
          }
        }
      }
    }
    presetInit(){
        //load all preset data from the server
        console.log("Initialaizing Ranges")
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData("http://localhost:8000/auger-bottom-pivot-angle-max", "max"));
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData("http://localhost:8000/auger-bottom-pivot-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerArnTop", this.getPresetData("http://localhost:8000/auger-top-angle-max", "max"));
        this.modelMovementLayer.setPresetData("AugerArmTop", this.getPresetData("http://localhost:8000/auger-top-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData("http://localhost:8000/spout-tilt-angle-max", "min"));
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData("http://localhost:8000/spout-tilt-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData("http://localhost:8000/head-rotation-angle-max", "max"));
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData("http://localhost:8000/head-rotation-angle-min", "min"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData("http://localhost:8000/gate-angle-max", "max"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData("http://localhost:8000/gate-angle-min", "min"));
    }

    setPresetSpeedsInit(){
        //load all preset speeds from the server
      this.modelMovementLayer.setPresetSpeedsInit("AugerArmBottom", this.getPresetData("http://localhost:8000/auger-bottom-pivot-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerArmTop", this.getPresetData("http://localhost:8000/auger-top-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerSpout", this.getPresetData("http://localhost:8000/spout-tilt-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerHead", this.getPresetData("http://localhost:8000/head-rotation-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("Gate", this.getPresetData("http://localhost:8000/gate-speed-ref"));
    }

    //start all polling loops
      //Spout
      //Head
      //Top
      //Bottom
      //Gate
      //PTO
    pollingInit(){
      this.startPolling("AugerArmBottom", "http://localhost:8000/auger-bottom-pivot-up-pwm", "up");
      this.startPolling("AugerArmBottom", "http://localhost:8000/auger-bottom-pivot-down-pwm", "down");
      this.startPolling("AugerArmTop", "http://localhost:8000/auger-top-fold-pwm", "up");
      this.startPolling("AugerArmTop", "http://localhost:8000/auger-top-unfold-pwm", "down");
      this.startPolling("AugerSpout", "http://localhost:8000/spout-tilt-up-pwm", "up");
      this.startPolling("AugerSpout", "http://localhost:8000/spout-tilt-down-pwm", "down");
      this.startPolling("AugerHead", "http://localhost:8000/head-rotation-cw-pwm", "right");
      this.startPolling("AugerHead", "http://localhost:8000/head-rotation-ccw-pwm", "left");
      // this.startPolling("Gate", "http://localhost:8000/gate_open-pwm", "up");
      // this.startPolling("Gate", "http://localhost:8000/gate_close-pwm", "down");
      this.startPolling("PTO", "http://localhost:8000/pto", "NA");
      this.startPolling("FrontWeight", "http://localhost:8000/front-weight", "NA");
      this.startPolling("RearWeight", "http://localhost:8000/rear-weight", "NA");

    }

    sendInitialPositions(){
      this.sendPosition("AugerArmBottom");
      this.sendPosition("AugerArmTop");
      this.sendPosition("AugerHead");
      this.sendPosition("AugerSpout");
      // this.sendPosition("Gate");
    }

    simulationPower(){
      this.startPolling("Power", "http://localhost:8000/power", "NA");
    }

    setupAPIController() {
	    console.log("Trying");
      // this.retryUntilReachable().then(() => {
      //   this.presetInit();
      //   this.setPresetSpeedsInit();
      //   this.sendInitialPositions();
      //   this.pollingInit();
      // }).catch((error) => {
      //   console.error("Failed to reach server:", error);
      // });
        this.presetInit();
        this.setPresetSpeedsInit();
        this.sendInitialPositions();
        this.pollingInit();
    }
    
    retryUntilReachable() {
      const retryDelay = 1000; // 1 second between retries
    
      return new Promise((resolve, reject) => {
        const attemptPowerCheck = () => {
          this.simulationPower()
            .then(() => {
              // Start polling for power status
              this.pollPowerStatus().then(resolve);
            })
            .catch(() => {
              // Only log once to avoid console spam
              console.error("Server not reachable. Retrying...");
              setTimeout(attemptPowerCheck, retryDelay); // Retry after delay
            });
        };
        attemptPowerCheck();
      });
    }
    
    pollPowerStatus() {
      return new Promise((resolve) => {
        const checkStatus = () => {
          if (!this.powerOn) {
            resolve();
          } else {
            // Continue polling every 500ms until powerOn is true
            setTimeout(checkStatus, 500);
          }
        };
    
        // Start the polling loop
        checkStatus();
      });
    }
}
