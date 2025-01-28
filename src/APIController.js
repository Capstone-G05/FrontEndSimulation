
export class APIController{
    constructor(modelMovementLayer){
        this.ModelMovementLayer = modelMovementLayer;
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
    

}