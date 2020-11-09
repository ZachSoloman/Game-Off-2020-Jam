let Spheres = [];
let star_count = 40;
let Stars = [];
let Star = { x:[],y:[],r:[] };
let Star_scroll = 0;

let Sun = { x: 0, y:0, color:[240,240,160], };

let asteroid_count = 20;
let asteroid_radius = 300;
let asteroids_rotate = 0;

let w = 1280;
let h = 720;

let planetImg;
let font;

function preload() {
  font = loadFont('EdgeOfTheGalaxy-Reg.otf');
}

function setup() {
  createCanvas( w, h, WEBGL);

  ortho( -width/2, width/2, -height/2, height/2, 0, 5000);
  //perspective( PI/3.0, width / height, 0.1, 5000);

  for (let i = 0; i < star_count; i++) {
    let randX = random(w);
    let randY = random(h);
    let randR = random(1,3);
    let star = { x:randX,y:randY,r:randR };
    Stars.push(star);
  }

  for (let a = 0; a < asteroid_count; a++) {
    let randomOrbitPeriod = random( TWO_PI );
    let rand_x = ( cos(randomOrbitPeriod) * asteroid_radius );
    let rand_y = ( sin(randomOrbitPeriod) * asteroid_radius );
    let rand_r = random( 5, 10);
    let new_asteroid = 
    new Sphere(
      "",
      "_asteroid",
      rand_x,
      rand_y,
      rand_r,
      [100,100,100]
    );
    new_asteroid.orbit.offset = randomOrbitPeriod;
    new_asteroid.orbit.radius = asteroid_radius;   
    Spheres.push(new_asteroid);
  }

  planetImg = loadImage('planet_skin.png');
  textFont(font);
  textSize(20);
  textAlign(CENTER, CENTER);
}

function clearSpheres() {
  Spheres = [];
}

function sendKill( user ) {
  die(user);
}

function createSphere(name, colorName, color, start_position) {
  let new_planet = 
	new Sphere(
		name,
		""+colorName+"_planet",
		start_position.x,
		start_position.y,
		20,
		color
	);
  Spheres.push(new_planet);
  let new_moon = 
	new Sphere(
		name,
		""+colorName+"_moon",
		new_planet.x,
		new_planet.y,
		8,
		[ max( 80, color[0] *0.8), max( 80, color[1]*0.8), max( 80, color[2]*0.8), color[3]],
		new_planet
	);
  Spheres.push(new_moon);
}

function drawSun() {
  /* draws a sun using p5 shapes */
  push();
  noStroke();
  translate( -width/2, -height/2, -100);
  emissiveMaterial( Sun.color );
  sphere( 10 );

  for(let f = 0; f < 10; f++) {
    fill(255,255,200,6);
    circle( 0, 0, 100 + (f*20));
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
  if( room == 'Lobby') {
  push();
  translate( 0, 0, -500);
  textSize(100);
  text('Game Title', -width/2, -height/1.3);
  pop();
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