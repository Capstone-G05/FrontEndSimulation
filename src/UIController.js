import { Pane } from "tweakpane";

export class UIController {
  constructor(modelMovementLayer) {
    this.ModelMovementLayer = modelMovementLayer;
    this.pane = new Pane();
  }
  setUpControls(){
    const boneFolder = this.pane.addFolder({title: 'Controls'});
    const AugerBottom = this.pane.addFolder({title: 'AugerBottom'});
    const AugerArmTop = this.pane.addFolder({title: 'AugerArmTop'});
    const AugerHead = this.pane.addFolder({title: 'AugerHead'});
    const AugerSpout = this.pane.addFolder({title: 'AugerSpout'});
    const PTO = this.pane.addFolder({title: 'PTO'});

    //model reset
    boneFolder.addButton({ title: 'Reset Cart' }).on('click', () => {
        this.ModelMovementLayer.reset();
      });

    //Auger Arm Bottom
    AugerBottom.addButton({ title: 'UP' }).on('click', () => {
        this.ModelMovementLayer.startMovement('AugerArmBottom', "up");
    });

    AugerBottom.addButton({ title: 'STOP' }).on('click', () => {
      this.ModelMovementLayer.stopMovement('AugerArmBottom');
    });

    AugerBottom.addButton({ title: 'DOWN' }).on('click', () => {
      this.ModelMovementLayer.startMovement('AugerArmBottom', "down");
    });

    //Auger Arm Top
    AugerArmTop.addButton({ title: 'UP' }).on('click', () => {
        this.ModelMovementLayer.startMovement('AugerArmTop', "up");
    });
    AugerArmTop.addButton({ title: 'STOP' }).on('click', () => {
      this.ModelMovementLayer.stopMovement('AugerArmTop');
    });
    AugerArmTop.addButton({ title: 'DOWN' }).on('click', () => {
      this.ModelMovementLayer.startMovement('AugerArmTop', "down");
    });

    //Auger Head
    AugerHead.addButton({ title: 'RIGHT' }).on('click', () => {
        this.ModelMovementLayer.startMovement('AugerHead', "right");
    });
    AugerHead.addButton({ title: 'STOP' }).on('click', () => {
      this.ModelMovementLayer.stopMovement('AugerHead');
    });
    AugerHead.addButton({ title: 'LEFT' }).on('click', () => {
      this.ModelMovementLayer.startMovement('AugerHead', "left");
    });
    
    //Auger Spout
    AugerSpout.addButton({ title: 'UP' }).on('click', () => {
        this.ModelMovementLayer.startMovement('AugerSpout', "up");
    });
    AugerSpout.addButton({ title: 'STOP' }).on('click', () => {
      this.ModelMovementLayer.stopMovement('AugerSpout');
    });
    AugerSpout.addButton({ title: 'DOWN' }).on('click', () => {
      this.ModelMovementLayer.startMovement('AugerSpout', "down");
    });

    //PTO on
    PTO.addButton({ title: 'PTO on' }).on('click', () => {
        this.ModelMovementLayer.PTOOn();
    });

    PTO.addButton({ title: 'PTO off' }).on('click', () => {
        this.ModelMovementLayer.PTOOff();
    });

  }
}