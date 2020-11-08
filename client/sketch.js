let Spheres = [];
let star_count = 100;
let Stars = [];
let Star = { x:[],y:[],r:[] };
let Star_scroll = 0;

let w = 900;
let h = 600;

let planetImg;

function setup() {
  createCanvas( w, h, WEBGL);

  ortho( -width/2, width/2, -height/2, height/2, 0, 5000);
  //perspective( PI/3.0, width / height, 0.1, 5000);

  for (let i = 0; i < star_count; i++) {
    let randX = random(w);
    let randY = random(h);
    let randR = random(1,5);
    let star = { x:randX,y:randY,r:randR };
    Stars.push(star);
  }

  planetImg = loadImage('planet_skin.png');
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
		25,
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
		color,
		new_planet
	);
  Spheres.push(new_moon);
}

function draw() {
  /* initialize */
  angleMode(RADIANS);
  frameRate(30);
  background(15);

  /* center 3d camera */
  translate( width/2,height/2);

  /* draw stars */
  Star_scroll+= 0.1;
  push();
  translate( -width, -height, 0);
  for (let i = 0; i < Stars.length; i++) {
    fill(255);
    circle( 
      (Stars[i].x + (Star_scroll*Stars[i].r)) % width,
      Stars[i].y,
      Stars[i].r
      );
  }
  pop();

  /*  raise the overall 3d light level 0-255 */
  ambientLight(30);

  /* update, draw, and control planets */
  for (var i = 0; i < Spheres.length; i++) {
    let sphere = Spheres[i];
    if (sphere != null) {
      if (sphere.type.includes("_planet"))
  	   sphere.update(Spheres[0]);
      else
       sphere.update(Spheres[i-1]);
  
      sphere.control();
      sphere.behaviors();

      if(sphere.collide(Spheres)) die( sphere.name );

      sphere.show(); 

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