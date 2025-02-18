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
      }

    startPolling(componentName, url, direction) {
      const intervalMs = 100
        if (this.pollingIntervalId !== null) {
          console.warn('Polling is already running!');
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
              console.log('Polled data:', data);
              this.processRunningData(componentName, data, direction);
            })
            .catch((error) => {
              console.error('Error during polling:', error);
            });
        };
    
        // Start the polling
        this.pollingIntervalId = setInterval(fetchAndUpdate, intervalMs);
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
        .then(data => {
            console.log(data);
            return data;
        })
        .catch((error) => {
            console.error('Error getting preset data:', error);
        });
    }

    sendPosition(componentName){
        let url = "";
        let data = this.modelMovementLayer.getPosition(componentName);
        if(componentName == "AugerArmBottom"){
            url = "http://localhost:8020/api/auger-bottom-pivot-angle";
        }
        else if(componentName == "AugerTop"){
            url = "http://localhost:8020/api/auger-top-angle";
        }
        else if(componentName == "AugerSpout"){
            url = "http://localhost:8020/api/spout-tilt-angle";
        }
        else if(componentName == "AugerHead"){
            url = "http://localhost:8020/api/head-rotation-angle";
        }
        else if(componentName == "Gate"){
            url = "http://localhost:8020/api/gate-angle";
        }
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error sending position:', error);
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
          this.modelMovementLayer.setPresetSpeed(componentName, data);
          this.modelMovementLayer.stopMovement(componentName);
          this.modelMovementLayer.sendPosition(componentName);
          this.isMoving[componentName] = false;
        }
        else if(data != 0){
          this.modelMovementLayer.setPresetSpeed(componentName, data);
          if(this.isMoving[componentName] != up){
            this.modelMovementLayer.startMovement(componentName, up);
            this.isMoving[componentName] = up;
          }
        }
      }

      else{
        if(this.isMoving[componentName] == down && data == 0){
          this.modelMovementLayer.setPresetSpeed(componentName, data);
          this.modelMovementLayer.stopMovement(componentName);
          this.modelMovementLayer.sendPosition(componentName);
          this.isMoving[componentName] = false;
        }
        else if(data != 0){
          this.modelMovementLayer.setPresetSpeed(componentName, data);
          if(this.isMoving[componentName] != down){
            this.modelMovementLayer.startMovement(componentName, down);
            this.isMoving[componentName] = down;
          }
        }
      }
    }
    presetInit(){
        //load all preset data from the server
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData("http://localhost:8020/api/auger-bottom-pivot-angle-max", "max"));
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData("http://localhost:8020/api/auger-bottom-pivot-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerTop", this.getPresetData("http://localhost:8020/api/auger-top-angle_max", "max"));
        this.modelMovementLayer.setPresetData("AugerTop", this.getPresetData("http://localhost:8020/api/auger-top-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData("http://localhost:8020/api/spout-tilt-angle-max", "min"));
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData("http://localhost:8020/api/spout-tilt-angle-min", "min"));
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData("http://localhost:8020/api/head-rotation-angle-max", "max"));
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData("http://localhost:8020/api/head-rotation-angle-min", "min"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData("http://localhost:8020/api/gate-angle-max", "max"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData("http://localhost:8020/api/gate-angle-min", "min"));
    }

    setPresetSpeedsInit(){
        //load all preset speeds from the server
      this.modelMovementLayer.setPresetSpeedsInit("AugerArmBottom", this.getPresetData("http://localhost:8020/api/auger-bottom-pivot-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerTop", this.getPresetData("http://localhost:8020/api/auger-top-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerSpout", this.getPresetData("http://localhost:8020/api/spout-tilt-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("AugerHead", this.getPresetData("http://localhost:8020/api/head-rotation-speed-ref"));
      this.modelMovementLayer.setPresetSpeedsInit("Gate", this.getPresetData("http://localhost:8020/api/gate-speed-ref"));
    }

    //start all polling loops
      //Spout
      //Head
      //Top
      //Bottom
      //Gate
      //PTO
    pollingInit(){
      this.startPolling("AugerArmBottom", "http://localhost:8020/api/auger-bottom-pivot-up-pwm", "up");
      this.startPolling("AugerArmBottom", "http://localhost:8020/api/auger-bottom-pivot-down-pwm", "down");
      this.startPolling("AugerTop", "http://localhost:8020/api/auger-top-fold-pwm", "up");
      this.startPolling("AugerTop", "http://localhost:8020/api/auger-top-unfold-pwm", "down");
      this.startPolling("AugerSpout", "http://localhost:8020/api/spout-tilt-up-pwm", "up");
      this.startPolling("AugerSpout", "http://localhost:8020/api/spout-tilt-down-pwm", "down");
      this.startPolling("AugerHead", "http://localhost:8020/api/head-rotation-cw-pwm", "right");
      this.startPolling("AugerHead", "http://localhost:8020/api/head-rotation-ccw-pwm", "left");
      // this.startPolling("Gate", "http://localhost:8020/api/gate_open-pwm", "up");
      // this.startPolling("Gate", "http://localhost:8020/api/gate_close-pwm", "down");
      this.startPolling("PTO", "http://localhost:8020/api/pto", "NA");
      this.startPolling("FrontWeight", "http://localhost:8020/api/front-weight", "NA");
      this.startPolling("RearWeight", "http://localhost:8020/api/rear-weight", "NA");

    }

    sendInitialPositions(){
      this.sendPosition("AugerArmBottom");
      this.sendPosition("AugerTop");
      this.sendPosition("AugerHead");
      this.sendPosition("AugerSpout");
      // this.sendPosition("Gate");
    }

    simulationPower(){
      this.startPolling("Power", "http://localhost:8020/api/power", "NA");
    }

    setupAPIController() {
      this.retryUntilReachable().then(() => {
        this.presetInit();
        this.setPresetSpeedsInit();
        this.sendInitialPositions();
        this.pollingInit();
      }).catch((error) => {
        console.error("Failed to reach server:", error);
      });
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
          if (this.powerOn) {
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