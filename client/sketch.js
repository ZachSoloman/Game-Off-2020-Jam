let Spheres = [];
let star_count = 100;
let Stars = [];
let Star = { x:[],y:[],r:[] };
let Star_scroll = 0;

let w = 900;
let h = 600;

let windowFocused = false;
let debugMode = false;

function setup() {
  createCanvas(w, h);
  for (let i = 0; i < star_count; i++) {
    let randX = random(w);
    let randY = random(h);
    let randR = random(1,3);
    let star = { x:randX,y:randY,r:randR };
    Stars.push(star);
  }
}

function mouseClicked() {
  if (mouseX >= 0 && mouseX < w
  &&  mouseY >= 0 && mouseY < h)
    windowFocused = true;
  else
    windowFocused = false;
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

function clearSpheres() {
  Spheres = [];
}

function sendKill( user ) {
  socket_Die(user);
}

function drawStars() {
  Star_scroll += 0.1;
  push();
  for (let i = 0; i < Stars.length; i++) {
    fill(255);
    circle( (Stars[i].x + (Star_scroll*Stars[i].r)) % width,Stars[i].y,Stars[i].r);
  }
  pop();
}

function updateSpheres() {
  /* update, draw, and control planets */
  for (var i = 0; i < Spheres.length; i++) {
    let sphere = Spheres[i];
    if (sphere != null) {
      if (sphere.type.includes("_planet"))
        sphere.update(Spheres[0]);
      else
       sphere.update(Spheres[i-1]);
      if (windowFocused && sphere.name == socket_GetUser())
        sphere.control();
      sphere.behaviors();
  
      if(sphere.collide(Spheres)) die(sphere.name);
  
      sphere.show(); 
  
      if (sphere.name == socket_GetUser() ) {
        let tempData = sphere.copyData();
        tempData.id = i;
        socket_SaveSphereData(tempData);
      }
      else {
        socket_RetrieveSphereData( sphere.name, sphere.type );
      }    
    }
  }
  
  /* check for sphere users */
  if(Spheres.length > 0)
    socket_CheckUserStillExists();
}

function draw() {
  /* initialize */
  angleMode(RADIANS);
  frameRate(30);
  background(15);
  drawStars();
  updateSpheres();
}

