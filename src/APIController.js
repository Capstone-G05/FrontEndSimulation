<<<<<<< HEAD
export class APIController{
    constructor(modelMovementLayer){
        this.ModelMovementLayer = modelMovementLayer;
        this.pollingIntervalId = null;
=======

export class APIController{
    constructor(modelMovementLayer){
        this.ModelMovementLayer = modelMovementLayer;
>>>>>>> 2625313bde96ae0d999cdbdbfe61224a3b82ad06
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
        //this.ModelMovementLayer.setPresetData(data);
    }
<<<<<<< HEAD

    handleSubmitPTO = async () => {
        
      
        try {
          var response = await fetch('http://localhost:8020/set-pto', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: false}),
          });
      
          if (!response.ok) {
            throw new Error('Failed to set PTO');
          }
      
          var data = await response.json();
          console.log('PTO set:', data);
          //alert('PTO successfully set.');
        } catch (error) {
          console.error('Error setting PTO:', error);
          alert('Failed to set PTO. Check console for details.');
        }
    };
          
=======
    
>>>>>>> 2625313bde96ae0d999cdbdbfe61224a3b82ad06
    

}