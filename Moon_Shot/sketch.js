let Spheres = [];
let star_count = 45;
let Stars = [];
let Star = { x:[],y:[],r:[] };

function setup() {
  createCanvas( 800, 600);
  
  for(let s = 0; s < star_count; s++) {
    let randX = random(width);
    let randY = random(height);
    let randR = random(1,3);
    let star = { x:randX,y:randY,r:randR };
      Stars.push(star);
  }
  
}

function createSphere( name,colorName,color ) {
  let new_planet = new Sphere(name,""+colorName+"_planet",100,100,50,color);//,sun);
    Spheres.push(new_planet);
  let new_moon = new Sphere(name,""+colorName+"_moon",new_planet.x,new_planet.y,15,color,new_planet);
    Spheres.push(new_moon);
}

function draw() {
  angleMode(RADIANS);
  frameRate(30);
  background(15);
  
  push();
  for(let s = 0; s < Stars.length; s++) {
    fill(255);
    circle(Stars[s].x,Stars[s].y,Stars[s].r);
  }
  pop();
  
  for(var i = 0; i < Spheres.length; i++){
    var s = Spheres[i];
    if(s != null) {
      if(s.type.includes("planet")) {
        s.update(Spheres[0]);
      } else {
        s.update(Spheres[i-1]);
      }
        s.show();
        s.control();
        s.behaviors();

      if(s.name == user) {
        let tempData = s.copyData();
        tempData.id = i;
        saveSphereData( tempData );
      //} else {
      //  retrieveSphereData( i );
      }
    }
  }
}