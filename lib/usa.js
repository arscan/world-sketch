let THREE = require('three');
import OBJLoader from 'three-obj-loader';
import Color from 'color';
import TWEEN from 'tween.js';

const states = {  AL:  {name: 'Alabama', lat:  32.806671  , lon:  -86.79113  },
  AK:  {name: 'Alaska', lat:  61.370716  , lon:  -152.404419  },
  AZ:  {name: 'Arizona', lat:  33.729759  , lon:  -111.431221  },
  AR:  {name: 'Arkansas', lat:  34.969704  , lon:  -92.373123  },
  CA:  {name: 'California', lat:  36.116203  , lon:  -119.681564  },
  CO:  {name: 'Colorado', lat:  39.059811  , lon:  -105.311104  },
  CT:  {name: 'Connecticut', lat:  41.597782  , lon:  -72.755371  },
  DE:  {name: 'Delaware', lat:  39.318523  , lon:  -75.507141  },
  FL:  {name: 'Florida', lat:  27.766279  , lon:  -81.686783  },
  GA:  {name: 'Georgia', lat:  33.040619  , lon:  -83.643074  },
  HI:  {name: 'Hawaii', lat:  21.094318  , lon:  -157.498337  },
  ID:  {name: 'Idaho', lat:  44.240459  , lon:  -114.478828  },
  IL:  {name: 'Illinois', lat:  40.349457  , lon:  -88.986137  },
  IN:  {name: 'Indiana', lat:  39.849426  , lon:  -86.258278  },
  IA:  {name: 'Iowa', lat:  42.011539  , lon:  -93.210526  },
  KS:  {name: 'Kansas', lat:  38.5266  , lon:  -96.726486  },
  KY:  {name: 'Kentucky', lat:  37.66814  , lon:  -84.670067  },
  LA:  {name: 'Louisiana', lat:  31.169546  , lon:  -91.867805  },
  ME:  {name: 'Maine', lat:  44.693947  , lon:  -69.381927  },
  MD:  {name: 'Maryland', lat:  39.063946  , lon:  -76.802101  },
  MA:  {name: 'Massachusetts', lat:  42.230171  , lon:  -71.530106  },
  MI:  {name: 'Michigan', lat:  43.326618  , lon:  -84.536095  },
  MN:  {name: 'Minnesota', lat:  45.694454  , lon:  -93.900192  },
  MS:  {name: 'Mississippi', lat:  32.741646  , lon:  -89.678696  },
  MO:  {name: 'Missouri', lat:  38.456085  , lon:  -92.288368  },
  MT:  {name: 'Montana', lat:  46.921925  , lon:  -110.454353  },
  NE:  {name: 'Nebraska', lat:  41.12537  , lon:  -98.268082  },
  NV:  {name: 'Nevada', lat:  38.313515  , lon:  -117.055374  },
  NH:  {name: 'New Hampshire', lat:  43.452492  , lon:  -71.563896  },
  NJ:  {name: 'New Jersey', lat:  40.298904  , lon:  -74.521011  },
  NM:  {name: 'New Mexico', lat:  34.840515  , lon:  -106.248482  },
  NY:  {name: 'New York', lat:  42.165726  , lon:  -74.948051  },
  NC:  {name: 'North Carolina', lat:  35.630066  , lon:  -79.806419  },
  ND:  {name: 'North Dakota', lat:  47.528912  , lon:  -99.784012  },
  OH:  {name: 'Ohio', lat:  40.388783  , lon:  -82.764915  },
  OK:  {name: 'Oklahoma', lat:  35.565342  , lon:  -96.928917  },
  OR:  {name: 'Oregon', lat:  44.572021  , lon:  -122.070938  },
  PA:  {name: 'Pennsylvania', lat:  40.590752  , lon:  -77.209755  },
  RI:  {name: 'Rhode Island', lat:  41.680893  , lon:  -71.51178  },
  SC:  {name: 'South Carolina', lat:  33.856892  , lon:  -80.945007  },
  SD:  {name: 'South Dakota', lat:  44.299782  , lon:  -99.438828  },
  TN:  {name: 'Tennessee', lat:  35.747845  , lon:  -86.692345  },
  TX:  {name: 'Texas', lat:  31.054487  , lon:  -97.563461  },
  UT:  {name: 'Utah', lat:  40.150032  , lon:  -111.862434  },
  VT:  {name: 'Vermont', lat:  44.045876  , lon:  -72.710686  },
  VA:  {name: 'Virginia', lat:  37.769337  , lon:  -78.169968  },
  WA:  {name: 'Washington', lat:  47.400902  , lon:  -121.490494  },
  WV:  {name: 'West Virginia', lat:  38.491226  , lon:  -80.954453  },
  WI:  {name: 'Wisconsin', lat:  44.268543  , lon:  -89.616508  },
  WY:  {name: 'Wyoming', lat:  42.755966  , lon:  -107.30249  }
};

class USA {
  constructor(scene,clear){
    this.lastTime = 0;
    this.scene = scene;
    this.color = Color('#336699');
    this.states = [];
    this.clear = clear;

    this._load();
  }

  animate(time){
    // console.log(`!!${time - this.lastTime}`);
    this.lastTime = time;
  }

  _load(clear){
    let loader = new THREE.OBJLoader();
    let material = new THREE.MeshPhongMaterial({polygonOffset: true,
                                             polygonOffsetFactor: 1, // positive value pushes polygon further away
                                                 polygonOffsetUnits: 1});
    let mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2, opacity: .1, transparent: true } );
    loader.load( 'assets/model.obj', ( object ) => {

      object.traverse(  ( child ) =>  {

        if ( child instanceof THREE.Mesh ) {
          child.material = material.clone();
          child.material.color.set(this.color.lighten(Math.random()/ 3 + .666).rgbNumber());
          child.material.side = THREE.DoubleSide;
          child.position.y = -.05;
          // var geo = new THREE.EdgesGeometry( child.geometry ); // or WireframeGeometry
          // var wireframe = new THREE.LineSegments( geo, mat );
          // child.add( wireframe );
        }

      } );

      // object.position.y = - 95;
      this.scene.add( object );
      this.states = object.children;

      object.children.forEach((item) => {
        let prefix = item.name.substr(0,2);
        let state_info = states[prefix];
        new TWEEN.Tween({y: -.05})
                     .to({y: 0}, 1000)
                     .onUpdate(function(){
                        item.position.y = this.y;
                      })
                     .easing(TWEEN.Easing.Quadratic.InOut)
                     .delay((state_info.lon + 80) * -20)
                     .start() // Use an easing function to make the animation smooth. // Create a new tween that modifies 'coords'.
      });

      setInterval(() => {
        object.children.forEach((item) => {
        let prefix = item.name.substr(0,2);
        let state_info = states[prefix];
        this.clear();
        new TWEEN.Tween({y: 0})
                     .to({y: -.05}, 1000)
                     .onUpdate(function(){
                        item.position.y = this.y;
                      })
                     .easing(TWEEN.Easing.Quadratic.InOut)
                     .delay((state_info.lon + 80) * -20)
                     .start() // Use an easing function to make the animation smooth. // Create a new tween that modifies 'coords'.
        new TWEEN.Tween({y: -.05})
                     .to({y: 0}, 1000)
                     .onUpdate(function(){
                        item.position.y = this.y;
                      })
                     .easing(TWEEN.Easing.Quadratic.InOut)
                     .delay((state_info.lon + 80) * -20 + 1000)
                     .start() // Use an easing function to make the animation smooth. // Create a new tween that modifies 'coords'.
         });
       }, 10000);

      // let mesh = scene.children[2].children[Math.floor(Math.random() * 50)]

    // debugger;
    });

  }
}

export default USA;
