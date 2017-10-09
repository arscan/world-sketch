
class PatientEvents {
  constructor(callback){
    this.callback = callback;
    this.lastDate = Date.now();
  }

  tick(timeStamp){

    let ms = Math.min(Math.max(timeStamp - this.lastDate, .00001), 100);
    this.lastDate = timeStamp;

    return this.createEvent(ms/1000);
  }

  createEvent(timeNormalize){
    // probability per second
    let eventDefs = [
      {name: 'birth', eps: 1},
      {name: 'death', eps: 1},
      {name: 'condition-onset', eps: 1},
      {name: 'condition-resolved', eps: 1},
      {name: 'procedure', eps: 1},
      {name: 'encounter', eps: 1}
    ];

    let events = [];

    eventDefs.forEach((item) => {
      if(Math.random() < item.eps * timeNormalize){
        let position = this.randomPosition()
        events.push([item.name, position[0], position[1]]);
      }
    });


    return events;

  }

  randomPosition(){
    return [31 + Math.random() * 17, -70 - 50 * Math.random()]
  }
  
}
export default PatientEvents;
