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
    }

    /* Poll PWM data from the API */
    startPolling(componentName, url, direction) {
        const intervalMs = 100;
        // check that the polling task isn't already running
        if (this.pollingIntervalIds[componentName + direction]) {
            console.warn("Polling is already running for " + componentName + " " + direction);
            return;
        }

        /* Fetch & process PWM data from API */
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
        let url = `http://${this.api_host}:${this.api_port}`;
        switch (componentName) {
            case "AugerArmBottom":
                url = url + `/pivot-angle?value=${data}`;
                break;
            case "AugerArmTop":
                url = url + `/fold-angle?value=${data}`;
                break;
            case "AugerSpout":
                url = url + `/tilt-angle?value=${data}`;
                break;
            case "AugerHead":
                url = url + `/rotate-angle?value=${data}`;
                break;
            case "Gate":
                url = url + `/gate-angle?value=${data}`;
                break;
            default:
                return; // no all components need to send position (ie. PTO, weights, etc...)
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
                this.processAugerLogic(componentName, data, direction, "down");
                this.processAugerLogic(componentName, data, direction, "up");
                break;
            case "AugerArmTop":
                this.processAugerLogic(componentName, data, direction, "down");
                this.processAugerLogic(componentName, data, direction, "up");
                break;
            case "AugerSpout":
                this.processAugerLogic(componentName, data, direction, "down");
                this.processAugerLogic(componentName, data, direction, "up");
                break;
            case "AugerHead":
                this.processAugerLogic(componentName, data, direction, "left");
                this.processAugerLogic(componentName, data, direction, "right");
                break;
            case "Gate":
                this.processAugerLogic(componentName, data, direction, "down");
                this.processAugerLogic(componentName, data, direction, "up");
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

    processAugerLogic(componentName, data, direction, movement) {
        if (this.isMoving[componentName] === movement && data === 0) {
            this.modelMovementLayer.setPresetSpeedsInit(componentName, data / 100);
            this.modelMovementLayer.stopMovement(componentName);
            this.isMoving[componentName] = false;
        } else if (data !== 0) {
            this.modelMovementLayer.setPresetSpeedsInit(componentName, data / 100);
            if (this.isMoving[componentName] !== movement) {
                this.modelMovementLayer.startMovement(componentName, movement);
                this.isMoving[componentName] = movement;
            }
        }
    }

    presetInit() {
        let url = `http://${this.api_host}:${this.api_port}`;
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData(`${url}/pivot-angle-max`), "max");
        this.modelMovementLayer.setPresetData("AugerArmBottom", this.getPresetData(`${url}/pivot-angle-min`), "min");
        this.modelMovementLayer.setPresetData("AugerArmTop", this.getPresetData(`${url}/fold-angle-max`), "max");
        this.modelMovementLayer.setPresetData("AugerArmTop", this.getPresetData(`${url}/fold-angle-min`), "min");
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData(`${url}/tilt-angle-max`), "min");
        this.modelMovementLayer.setPresetData("AugerSpout", this.getPresetData(`${url}/tilt-angle-min`), "min");
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData(`${url}/rotate-angle-max`), "max");
        this.modelMovementLayer.setPresetData("AugerHead", this.getPresetData(`${url}/rotate-angle-min`), "min");
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData(`${url}/gate-angle-max`, "max"));
        // this.modelMovementLayer.setPresetData("Gate", this.getPresetData(`${url}/gate-angle-min`, "min"));
    }

    setPresetSpeedsInit() {
        let url = `http://${this.api_host}:${this.api_port}`;
        this.modelMovementLayer.setPresetSpeedsInit("AugerArmBottom", this.getPresetData(`${url}/pivot-speed-reference`));
        this.modelMovementLayer.setPresetSpeedsInit("AugerArmTop", this.getPresetData(`${url}/fold-speed-reference`));
        this.modelMovementLayer.setPresetSpeedsInit("AugerSpout", this.getPresetData(`${url}/tilt-speed-reference`));
        this.modelMovementLayer.setPresetSpeedsInit("AugerHead", this.getPresetData(`${url}/rotate-speed-reference`));
        this.modelMovementLayer.setPresetSpeedsInit("Gate", this.getPresetData(`${url}/gate-speed-reference`));
    }

    pollingInit() {
        let url = `http://${this.api_host}:${this.api_port}`;
        this.startPolling("AugerArmBottom", `${url}/pivot-up-pwm`, "up");
        this.startPolling("AugerArmBottom", `${url}/pivot-down-pwm`, "down");
        this.startPolling("AugerArmTop", `${url}/fold-out-pwm`, "up");
        this.startPolling("AugerArmTop", `${url}/fold-in-pwm`, "down");
        this.startPolling("AugerSpout", `${url}/tilt-up-pwm`, "up");
        this.startPolling("AugerSpout", `${url}/tilt-down-pwm`, "down");
        this.startPolling("AugerHead", `${url}/rotate-cw-pwm`, "right");
        this.startPolling("AugerHead", `${url}/rotate-ccw-pwm`, "left");
        // this.startPolling("Gate", `${url}/gate-open-pwm`, "up");
        // this.startPolling("Gate", `${url}/gate-close-pwm`, "down");
        this.startPolling("PTO", `${url}/pto-speed`, "NA");
        this.startPolling("FrontWeight", `${url}/weight-front`, "NA");
        this.startPolling("RearWeight", `${url}/weight-rear`, "NA");
    }

    sendInitialPositions() {
        this.sendPosition("AugerArmBottom");
        this.sendPosition("AugerArmTop");
        this.sendPosition("AugerHead");
        this.sendPosition("AugerSpout");
        // this.sendPosition("Gate");
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
        this.setPresetSpeedsInit();
        this.sendInitialPositions();
        // this.pollingInit();
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
