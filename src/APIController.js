
export class APIController{
    constructor(modelMovementLayer){
        this.ModelMovementLayer = modelMovementLayer;
    }

    //some code here, not really sure how it works but we'll get there
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