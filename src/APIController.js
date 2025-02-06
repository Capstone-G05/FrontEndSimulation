import dotenv from 'dotenv';

export class APIController{
    constructor(modelMovementLayer){
        this.ModelMovementLayer = modelMovementLayer;
        this.pollingIntervalId = null;
    }

    startPolling(url, intervalMs = 100) {
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
              // Uncomment and update the following line if you need to pass data to the ModelMovementLayer
              this.processRunningData(data);
              // this.ModelMovementLayer.setPresetData(data);
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

    //some code here, not really sure how it works but we'll get there
    //loads one piece of the data from the URL
    getPresetData(url){
        fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            //this.ModelMovementLayer.setPresetData(data);
        })
        .catch((error) => {
            console.error('Error getting preset data:', error);
        });
    }

    processRunningData(data){
        //process the data from the server
        console.log("PROCESSING DATA TO DO STUFF WITH: data");
        console.log(data);
        //this.ModelMovementLayer.setPresetData(data);
    }

    setupAPIController(){
        //Initialize dotenv
        const test = import.meta.env.VITE_TEST;
        console.log(test);
        console.log("YO");
        //get Model type
            //send to server? not sure about this here
        
        //get all range stuff from server
            //Spout Min Max
            //Head Min Max
            //Top Min Max
            //Bottom Min Max
            //Gate Min Max
        //get all reference speeds from server
            //Spout
            //Head
            //Top
            //Bottom
            //Gate

        //send all initial positions to the server
            //Spout
            //Head
            //Top
            //Bottom
            //Gate
        //start polling for all the data
            //Spout
            //Head
            //Top
            //Bottom
            //Gate
    }
}