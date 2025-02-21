import dotenv from 'dotenv';

export class APIController {
    constructor(modelMovementLayer) {
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

        this.api_host = import.meta.env.VITE_HOST || "localhost";
        this.api_port = import.meta.env.VITE_PORT || 8000;
        this.base_url = `http://${this.api_host}:${this.api_port}`;
    }

    /* Poll PWM data from the API */
    startPolling(componentName, url, direction) {
        const intervalMs = 400;
        // check that the polling task isn't already running
        if (this.pollingIntervalIds[componentName + direction]) {
            console.warn("Polling is already running for " + componentName + " " + direction);
            return;
        }

        // Fetch & process PWM data from API
        const fetchAndUpdate = () => {
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    // console.log(componentName + " Polled data:" + direction + " " + data);
                    this.processRunningData(componentName, data, direction);
                    this.sendPosition(componentName);
                })
                .catch((error) => {
                    console.error(componentName + " Error during polling: " + direction + " " + error);
                });
        };

        // Start polling
        this.pollingIntervalIds[componentName + direction] = setInterval(fetchAndUpdate, intervalMs + Math.random() * 100);
        console.log(`Started polling ${url} every ${intervalMs} ms.`);
    }

    stopPolling() {
        if (this.pollingIntervalId !== null) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
            console.log("Polling stopped");
        } else {
            console.warn("Polling is not running");
        }
    }

    /* Load initial data from the API */
    getPresetData(url) {
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                return data;
            })
            .catch((error) => {
                console.error("Error getting preset data: ", error);
            });
    }

    /* Update API with angle position */
    sendPosition(componentName) {
        let data = this.modelMovementLayer.getPosition(componentName);
        let url = ""
        switch (componentName) {
            case "AugerArmBottom":
                url = this.base_url + `/pivot-angle?value=${data}`;
                break;
            case "AugerArmTop":
                url = this.base_url + `/fold-angle?value=${data}`;
                break;
            case "AugerSpout":
                url = this.base_url + `/tilt-angle?value=${data}`;
                break;
            case "AugerHead":
                url = this.base_url + `/rotate-angle?value=${data}`;
                break;
            case "Gate":
                url = this.base_url + `/gate-angle?value=${data}`;
                break;
            default:
                return; // not all components need to send position (ie. PTO, weights, etc...)
        }
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: "",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .catch((error) => {
                console.error(`[${componentName}] Error sending position: `, error);
            });
    }

    processRunningData(componentName, data, direction) {
        switch (componentName) {
            case "AugerArmBottom":
                this.processAugerLogic(componentName, data, direction);
                break;
            case "AugerArmTop":
                this.processAugerLogic(componentName, data, direction);
                break;
            case "AugerSpout":
                this.processAugerLogic(componentName, data, direction);
                break;
            case "AugerHead":
                this.processAugerLogic(componentName, data, direction);
                break;
            case "Gate":
                this.processAugerLogic(componentName, data, direction);
                break;
            case "PTO":
                if (this.isMoving[componentName] === true && data === 0) {
                    this.modelMovementLayer.PTOOff();
                    this.isMoving[componentName] = false;
                } else if (this.isMoving[componentName] === false && data !== 0) {
                    this.modelMovementLayer.PTOOn();
                    this.isMoving[componentName] = true;
                }
                break;
            case "FrontWeight":
                // todo: fix bug
                if (data !== this.isMoving[componentName]) {
                    // this.modelMovementLayer.toggleFrontWeight(); //need to implement this better first
                    this.isMoving[componentName] = data;
                    // console.log(componentName + " changed: " + data);
                }
                break;
            case "RearWeight":
                // todo: fix bug
                if (data !== this.isMoving[componentName]) {
                    // this.modelMovementLayer.toggleFrontWeight(); //need to implement this better first
                    this.isMoving[componentName] = data;
                    // console.log(componentName + " changed: " + data);
                }
                break;
            case "Power":
                this.powerOn = data;
                break;
            default:
                console.warn(`[processRunningData] unhandled component: ${componentName}`);
        }
    }

    processAugerLogic(componentName, data, direction) {
        if (this.isMoving[componentName] === direction && data === 0) {
            this.modelMovementLayer.setSpeed(componentName, data);
            console.log(componentName + " stopped: " + data);
            this.modelMovementLayer.stopMovement(componentName);
            this.isMoving[componentName] = false;
        } else if (data !== 0) {
            this.modelMovementLayer.setSpeed(componentName, data);
            console.log(componentName + " started: " + data + " " + direction);
            if (this.isMoving[componentName] !== direction) {
                this.modelMovementLayer.startMovement(componentName, direction);
                this.isMoving[componentName] = direction;
            }
        }
    }

    async setPresetData(componentName, url, direction) {
        const data = await this.getPresetData(url);
        this.modelMovementLayer.setPresetData(componentName, data, direction);
    }
    presetInit() {
        this.setPresetData("AugerArmBottom", `${this.base_url}/pivot-angle-max`, "max");
        this.setPresetData("AugerArmBottom", `${this.base_url}/pivot-angle-min`, "min");
        // this.setPresetData("AugerArmTop", `${this.base_url}/fold-angle-max`, "max"); //todo, these dont work
        // this.setPresetData("AugerArmTop", `${this.base_url}/fold-angle-min`, "min");
        this.setPresetData("AugerSpout", `${this.base_url}/tilt-angle-max`, "max");
        this.setPresetData("AugerSpout", `${this.base_url}/tilt-angle-min`, "min");
        this.setPresetData("AugerHead", `${this.base_url}/rotate-angle-max`, "max");
        this.setPresetData("AugerHead", `${this.base_url}/rotate-angle-min`, "min");
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData(`${this.base_url}/gate-angle-max`, "max"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData(`${this.base_url}/gate-angle-min`, "min"));
    }

    async setPresetSpeedsInit(componentName, url){
        const data = await this.getPresetData(url);
        this.modelMovementLayer.setPresetSpeedsInit(componentName, data);
    }
    setPresetSpeeds() {
        this.setPresetSpeedsInit("AugerArmBottom", `${this.base_url}/pivot-speed-reference`);
        this.setPresetSpeedsInit("AugerArmTop", `${this.base_url}/fold-speed-reference`);
        this.setPresetSpeedsInit("AugerSpout", `${this.base_url}/tilt-speed-reference`);
        this.setPresetSpeedsInit("AugerHead", `${this.base_url}/rotate-speed-reference`);
        this.setPresetSpeedsInit("Gate", `${this.base_url}/gate-speed-reference`);
    }

    pollingInit() {
        this.startPolling("AugerArmBottom", `${this.base_url}/pivot-up-pwm`, "up");
        this.startPolling("AugerArmBottom", `${this.base_url}/pivot-down-pwm`, "down");
        this.startPolling("AugerArmTop", `${this.base_url}/fold-out-pwm`, "down");
        this.startPolling("AugerArmTop", `${this.base_url}/fold-in-pwm`, "up");
        this.startPolling("AugerSpout", `${this.base_url}/tilt-up-pwm`, "down");
        this.startPolling("AugerSpout", `${this.base_url}/tilt-down-pwm`, "up");
        this.startPolling("AugerHead", `${this.base_url}/rotate-cw-pwm`, "right");
        this.startPolling("AugerHead", `${this.base_url}/rotate-ccw-pwm`, "left");
        // this.startPolling("Gate", `${this.base_url}/gate-open-pwm`, "up"); //TODO
        // this.startPolling("Gate", `${this.base_url}/gate-close-pwm`, "down"); //TODO
        this.startPolling("PTO", `${this.base_url}/pto-speed`, "NA");
        this.startPolling("FrontWeight", `${this.base_url}/weight-front`, "NA");
        this.startPolling("RearWeight", `${this.base_url}/weight-rear`, "NA");
    }

    sendInitialPositions() {
        this.sendPosition("AugerArmBottom");
        this.sendPosition("AugerArmTop");
        this.sendPosition("AugerHead");
        this.sendPosition("AugerSpout");
        // this.sendPosition("Gate"); //TODO
    }

    simulationPower() {
        return this.startPolling("Power", `http://${this.api_host}:${this.api_port}/online`, "NA");
    }

    setupAPIController() {
        console.log("Trying");
        // this.retryUntilReachable().then(() => {
        //     this.presetInit();
        //     this.setPresetSpeedsInit();
        //     this.sendInitialPositions();
        //     this.pollingInit();
        // }).catch((error) => {
        //     console.error("Failed to reach server:", error);
        // });

        this.presetInit();
        this.setPresetSpeeds(); // TODO: something here is problematic (defaults in API server maybe)
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
