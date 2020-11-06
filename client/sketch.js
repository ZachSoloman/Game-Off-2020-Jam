let Spheres = [];
let star_count = 45;
let Stars = [];
let Star = { x:[],y:[],r:[] };

function setup() {
  createCanvas( 800, 600);
  for (let i = 0; i < star_count; i++) {
    let randX = random(width);
    let randY = random(height);
    let randR = random(1,3);
    let star = { x:randX,y:randY,r:randR };
    Stars.push(star);
  }
}

function clearSpheres() {
  Spheres = [];
}

function createSphere(name, colorName, color, start_position) {
  let new_planet = 
	new Sphere(
		name,
		""+colorName+"_planet",
		start_position.x,
		start_position.y,
		50,
		color
	);
  Spheres.push(new_planet);
  let new_moon = 
	new Sphere(
		name,
		""+colorName+"_moon",
		new_planet.x,
		new_planet.y,
		15,
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
  /* draw stars */
  push();
  for (let i = 0; i < Stars.length; i++) {
    fill(255);
    circle(Stars[i].x,Stars[i].y,Stars[i].r);
  }
  pop();
  /* update, draw, and control planets */
  for (var i = 0; i < Spheres.length; i++) {
    var sphere = Spheres[i];
    if (sphere != null) {
      if(sphere.type.includes("planet"))
        sphere.update(Spheres[0]);
      else
        sphere.update(Spheres[i-1]);

      sphere.control();
      sphere.behaviors();

      if (sphere.name == socket_GetUser()) {
        let tempData = sphere.copyData();
        tempData.id = i;
        saveSphereData(tempData);
      }
      else {
        retrieveSphereData(i);
      }

      sphere.show();     
    }
  }
}