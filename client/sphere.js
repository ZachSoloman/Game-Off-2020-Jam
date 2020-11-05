/*
 * Sphere(name:string, type:string, x:int, y:int, color:[r:int, g:int, b:int], parent:Sphere or {})
 * %MEMBERS%
 * Sphere.name: string		-> user name
 * Sphere.type: string 		-> color_name + {"_planet" | "_moon"}
 * Sphere.x: int		-> x 
 * Sphere.y: int		-> y
 * Sphere.target: Vec		-> target
 * Sphere.color: [3]		-> color ([r, g, b])
 * Sphere.pos: Vec		-> unused
 * Sphere.vel: Vec		-> velocity
 * Sphere.acc: Vec		-> acceleration
 * Sphere.speed: int		-> current speed 
 * Sphere.maxspeed: int		-> max speed
 * Sphere.friction: float	-> friction
 * Sphere.r: int		-> radius
 * %FUNCTIONS%
 * Sphere.start ()		-> ? set in motion
 * Sphere.control ()		-> control via input
 * Sphere.copyData ()		-> ? return all data (what data type)
 * Sphere.readData (inData)	-> ? update all data (what data type)
 * Sphere.behaviors ()		-> 
 * Sphere.applyForce (f)	-> apply force f
 * Sphere.update		-> 
 * Sphere.show			-> 
 * Sphere.arrive		-> 
 * Sphere.shoot			-> 
 * Sphere.collide		-> 
 * Sphere.bounce		-> 
 */

function Sphere(name,type, x, y, r, color, parent) {
  this.name = name || "";
  this.type = type || "default";
  this.x = x || 0;
  this.y = y || 0;
  this.target = createVector(x,y);
  this.color = color || [128,128,128];
  this.pos = createVector(x,y);
  this.vel = createVector();
  this.acc = createVector();
  this.speed = 1.5;
  this.maxspeed = 6;
  this.maxforce = 1;
  this.friction = 0.1;
  this.r = r || 50;
  
  //moon variables
  this.parent = parent || {};
  
  this.orbit = {
    x:60,y:60,
    radius:60,period:0,
    speed:100,speed_inc:0.1,maxspeed:16,
    dir:1,offset:0
  };
  
  this.toss = {
    firing_stage:"idle",
    initial_force:20,force:20,
    inc:0.25,
    maxspeed:20,maxforce:1
  };
  this.bouncing = false;
  
  this.start();
}

Sphere.prototype.start = function() {
  if (this.type.includes( "planet" ) ) {
    this.orbit = {x:300,y:200,radius:600,period:0,speed:750,speed_inc:0.1,maxspeed:16,dir:1,offset:0};    
    if(this.type == "red_planet") {this.orbit.offset = PI;}
  }
  if (this.type.includes( "moon" ) ) {
    this.orbit = {x:60,y:60,radius:60,period:0,speed:4,speed_inc:0.5,maxspeed:16,dir:1,offset:0};
  }
}

Sphere.prototype.control = function() {
  
  let firing = false;
  
  if (this.name == socket_GetUser()) {
    if (keyIsDown (SHIFT)) {
      firing = true;
    } // if `z` key is pressed
    else if (keyIsDown(90)) {
      this.toss.firing_stage = "idle";
      this.vel.mult(0);
      this.toss.force = this.toss.initial_force;
    }
    if (firing) {
      if(this.toss.firing_stage == "idle") {
        this.toss.firing_stage = "charging";
      }
      if(this.toss.firing_stage == "charging") {
        if(this.orbit.speed <= this.orbit.maxspeed){
          this.orbit.speed += this.orbit.speed_inc;
          this.toss.force += this.toss.inc;
        }
      }
      if(this.toss.firing_stage == "released" ||
        this.toss.firing_stage == "bouncing") {
        this.toss.firing_stage = "charging";
       this.vel.mult(0.5);
       this.toss.force = this.toss.initial_force;
      }
    } 
    else {
      if(this.toss.firing_stage == "charging") {
        this.toss.firing_stage = "released";
        this.orbit.speed = 1;
        this.orbit.dir *= -1;
      }      
    }
  
  // move in direction if `a`, `w`, `s`, or `d` is pressed (ascii char value)
    if (keyIsDown(65)) this.vel.x -= this.speed;
    if (keyIsDown(68)) this.vel.x += this.speed;
    if (keyIsDown(87)) this.vel.y -= this.speed;
    if (keyIsDown(83)) this.vel.y += this.speed;
  }
}

Sphere.prototype.copyData = function() {
  
  let allData = {};
  
  allData.name = this.name;
  allData.type = this.type;
  allData.x = this.x;
  allData.y = this.y;
  allData.targetX = this.pos.x;  
  allData.targetY = this.pos.y;    
  allData.colorR = this.color.r;
  allData.colorG = this.color.g;
  allData.colorB = this.color.b;
  allData.colorA= this.color.a;  
  allData.posX = this.pos.x;
  allData.posY = this.pos.y;
  allData.velX = this.vel.x;
  allData.velY = this.vel.y;
  // allData.acc = this.acc;
  allData.speed = this.speed;
  allData.maxspeed = this.maxspeed;
  allData.maxforce = this.maxforce;
  allData.friction = this.friction1;
  allData.r = this.r;
  // allData.parent = this.parent;
  allData.orbitX = this.orbit.x;
  allData.orbitY = this.orbit.y;
  allData.orbitR = this.orbit.radius;
  allData.orbitP = this.orbit.period;
  allData.orbitS = this.orbit.speed;
  allData.orbitSI = this.orbit.speed_inc;
  allData.orbitMS = this.orbit.maxspeed;
  allData.orbitD = this.orbit.dir;
  allData.orbitO = this.orbit.offset;  
  allData.tossFS = this.toss.firing_stage;
  allData.tossIS = this.toss.initial_force;
  allData.tossF = this.toss.force;
  allData.tossI = this.toss.inc;
  allData.tossMS = this.toss.maxspeed;
  allData.tossMF = this.toss.maxforce;
  allData.bouncing = this.bouncing;
  
  return allData;
}

Sphere.prototype.readData = function( inData ) {
  
  console.log(inData.name);
  this.name = inData.name;
  this.type = inData.type;
  this.x = inData.x;
  this.y = inData.y;
  this.target.x = inData.posX;  
  this.target.y = inData.posY;    
  this.color.r = inData.colorR;
  this.color.g = inData.colorG;
  this.color.b = inData.colorB;
  this.color.a = inData.colorA;  
  this.pos.x = inData.posX;
  this.pos.y = inData.posY;
  this.vel.x = inData.velX;
  this.vel.y = inData.velY;
  // this.acc = inData.acc;
  this.speed = inData.speed;
  this.maxspeed = inData.maxspeed;
  this.maxforce = inData.maxforce;
  this.friction = inData.friction;
  this.r = inData.r;
  // inData.parent = inData.parent;
  this.orbit.x = inData.orbitX;
  this.orbit.y = inData.orbitY;
  this.orbit.radius = inData.orbitR;
  this.orbit.period = inData.orbitP;
  this.orbit.speed = inData.orbitS;
  this.orbit.speed_inc = inData.orbitSI;
  this.orbit.maxspeed = inData.orbitMS;
  this.orbit.dir = inData.orbitD;
  this.orbit.offset = inData.orbitO;  
  this.toss.firing_stage = inData.tossFS;
  this.toss.initial_force = inData.tossIS;
  this.toss.force = inData.tossF;
  this.toss.inc = inData.tossI;
  this.toss.maxspeed = inData.tossMS;
  this.toss.maxforce = inData.tossMF;
  this.bouncing = inData.bouncing;
}

Sphere.prototype.behaviors = function() {
  var arrive = this.arrive(this.target);
  var point_of_force = createVector(mouseX, mouseY);
  var shoot = this.shoot(point_of_force);
  
  if(this.type.includes("planet")) {
    //arrive.mult(1);
    //this.applyForce(arrive);
  }
  if(this.type.includes( "moon" ) ) {
    if(this.toss.firing_stage == "released") {
      point_of_force = createVector(this.target.x,this.target.y);
      shoot = this.shoot(point_of_force);
      shoot.mult( -this.toss.force );
      this.applyForce(shoot);
      this.toss.firing_stage = "bouncing";
    } 
    else if( this.toss.firing_stage == "idle" ||
      this.toss.firing_stage == "charging") {
      arrive.mult(1);
      this.applyForce(arrive);
    } 
    else if(this.toss.firing_stage == "bouncing" || 
      this.toss.firing_stage == "idle" ) {
//      this.bounce();
    }
  } 
}

Sphere.prototype.applyForce = function(f) {
  this.acc.add(f);
}

Sphere.prototype.update = function(e) {
  
  if(this.type.includes("planet")) {
    this.parent = e || {};
    this.orbit.period += TWO_PI / this.orbit.radius;
    this.target = createVector(this.x,this.y);
    this.target = createVector(
      this.parent.pos.x + ((sin((this.orbit.period+this.orbit.offset)
			    * this.orbit.dir) * this.orbit.x)), 
      this.parent.pos.y + ((cos((this.orbit.period+this.orbit.offset)
			    * this.orbit.dir) * this.orbit.y))
    );
  }
  
  if(this.type.includes("moon") ) {
    if(this.toss.firing_stage == "idle" ||
      this.toss.firing_stage == "charging") {
      this.parent = e || {};
      this.orbit.period += (this.orbit.speed / this.orbit.radius) * this.orbit.dir;
  
      this.target = createVector(
        this.parent.pos.x + ( (sin(this.orbit.period) * this.orbit.radius) ), 
        this.parent.pos.y + ( (cos(this.orbit.period) * this.orbit.radius) )
      );
    }
  }
  
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
  if(this.type.includes("planet")) {
    this.vel.mult(1-this.friction);//friction
  }
}

Sphere.prototype.show = function() {
  noStroke();
  push();
  
  fill(this.color);
  circle(this.pos.x, this.pos.y, this.r);
  
  fill(255);
  textAlign(CENTER);
  if(this.type.includes("planet")) {
    text(this.name,this.pos.x, this.pos.y);
  }
  if(this.type.includes("moon")) {
    //text(this.toss.firing_stage,this.pos.x, this.pos.y);
  }
  //text(""+round(this.pos.x)+" | "+round(this.pos.y),this.pos.x, this.pos.y);
}

Sphere.prototype.arrive = function(target) {
  var desired = p5.Vector.sub(target, this.pos);
  var d = desired.mag();
  var speed = this.maxspeed;
  if(d < 80 && this.toss.firing_stage == "return") {
    this.toss.firing_stage = "idle"
  }
  if( d < 400) {
    speed = map(d, 0,100, 0, this.maxspeed);
  }
  desired.setMag(speed);
  var steer = p5.Vector.sub(desired,this.vel);
  steer.limit(this.maxforce);
  return steer;
}

Sphere.prototype.shoot = function(target) {
  var desired = p5.Vector.sub(target, this.pos);
  var d = desired.mag();
  var steer = createVector(0,0);
  
  if(d < 300) {
    desired.setMag(this.toss.maxspeed);
    desired.mult(-1);
    steer = p5.Vector.sub(desired,this.vel);
    steer.limit(this.toss.maxforce);
  }
  return steer;
}

Sphere.prototype.collide = function(target) {
  var desired = p5.Vector.sub(target, this.pos);
  var d = desired.mag();
  var evade = createVector(0,0);
  if(d < 8) {
    desired.setMag(0.0001);
    desired.mult(-1);
    evade = p5.Vector.sub(desired,this.vel);
  }
  return evade;
}

Sphere.prototype.bounce = function(target) {
  
  let l_bound = createVector(0,this.pos.y);
  let r_bound = createVector(width,this.pos.y);
  let u_bound = createVector(this.pos.x, height);
  let d_bound = createVector(this.pos.x, 0);
  let doBounce = false;
  
  if(this.pos.x <= 0) {
    doBounce = true;
    this.pos.x = 0;
  }
  if(this.pos.x >= width) {
    doBounce = true;
    this.pos.x = width;
  }
  if(this.pos.y <= 0) {
    doBounce = true;
    this.pos.y = 0;
  }
  if(this.pos.y >= height) {z
    doBounce = true;
    this.pos.y = height;
  }
  
  if(doBounce && this.bouncing == false) {
    let tempVect = this.pos;
    this.vel = createVector(tempVect.y*1,-tempVect.x*1);
    this.bouncing = true;
  } 
  else if(doBounce == false && this.bouncing == true) {
    this.bouncing = false;
  }
}