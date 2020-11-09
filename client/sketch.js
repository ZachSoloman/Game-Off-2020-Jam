let Spheres = [];
let star_count = 30;
let Stars = [];
let Star = { x:[],y:[],r:[] };
let Star_scroll = 0;

let Sun = { x:-500, y:-250, z: -100, color:[240,240,160] };

let asteroid_count = 30;
let asteroid_radius = 600;

let w = 1280;
let h = 720;

let planetImg;
let font;
let titleElm;
let titleText = "Game Title";

let projection = 'ortho';

function preload() {
  font = loadFont('EdgeOfTheGalaxy-Reg.otf');
}

function setup() {
  createCanvas( w, h, WEBGL);

  if(projection == 'ortho')
    ortho( -width/2, width/2, -height/2, height/2, 0, 5000);
  else
    perspective( PI/3.0, width / height, 0.1, 5000);

  /* inititalize stars*/
  for (let i = 0; i < star_count; i++) {
    let randX = random(w);
    let randY = random(h);
    let randR = random(1,3);
    let star = { x:randX,y:randY,r:randR };
    Stars.push(star);
  }

  /* inititalize asteroids*/
  for (let a = 0; a < asteroid_count; a++) {
    let rand_p = random( TWO_PI );
    let rand_x = ( cos(rand_p) * asteroid_radius );
    let rand_y = ( sin(rand_p) * asteroid_radius );
    let rand_r = random( 5, 10);

    createSphere( {
      name:"",
      type:'_asteroid',
      x:rand_x,
      y:rand_y,
      color:[100,100,100],
      r:rand_r,
      orbit_radius:asteroid_radius,
      orbit_offset:rand_p,
      parent:{pos:{x:-Sun.x,y:-Sun.y,z:0}}
    });
  }

  planetImg = loadImage('planet_skin.png');
  textFont(font);
  textSize(20);

  /* iniitialize title element */
  textAlign(CENTER, CENTER);
  titleElm = createElement( 'h1', titleText);
  titleElm.id('title');
  titleElm.position( width/2, 0);
  titleElm.class( 'space_font' );
}

function clearSpheres() {
  Spheres = [];
}

function sendKill( user ) {
  die(user);
}

function createSphere( data ) {
  let new_sphere = 
  new Sphere(data);
  Spheres.push(new_sphere);
}

function drawSun() {
  /* draws a sun using p5 shapes */
  push();
  noStroke();
  /* uses half width and height to center sun before positioning */
  translate( (-width/2) + Sun.x, (-height/2) + Sun.y, Sun.z);
  emissiveMaterial( Sun.color );
  sphere( 10 );

  for(let f = 0; f < 10; f++) {
    fill(255,255,200,2);
    circle( 0, 0, 100 + (f*10));
  }
  pop();
}


function drawStars() {
  /* draw stars */
  Star_scroll+= 0.1;
  push();
  translate( -width, -height, -200);
  noStroke();
  fill(255);
  for (let i = 0; i < Stars.length; i++) {
    circle( 
      (Stars[i].x + (Star_scroll*Stars[i].r)) % width,
      Stars[i].y,
      Stars[i].r
      );
  }
  pop();
}

function drawTitle() {
  /* title text*/
  if( socket_GetRoom() == 'Lobby') {
  //   push();
  //   translate( 0, 0, -500);
  //   textSize(100);
  //   text('Game Title', -width/2, -height/1.3);
  //   pop();
  // }
    titleElm.show(); 
  }
  else {
    titleElm.hide(); 
  }
}

function draw() {
  /* initialize */
  angleMode(RADIANS);
  frameRate(30);
  background(10);
  /* center 3d camera */
  translate( width/2, height/2);

  drawStars();
  drawTitle();
  drawSun();

  /*  raise the overall 3d light level 0-255 */
  ambientLight(40);

  /* update, draw, and control planets */
  for (var i = 0; i < Spheres.length; i++) {
    let sphere = Spheres[i];
    if (sphere != null) {

      sphere.update(Spheres);

      if (sphere.name == socket_GetUser() ) {
        let tempData = sphere.copyData();
        tempData.id = i;
        saveSphereData(tempData);
      }
      else {
        retrieveSphereData( sphere.name, sphere.type );
      }    
    }
  }

  /* check for sphere users */
  if(Spheres.length > 0)
    checkUserStillExists();
}