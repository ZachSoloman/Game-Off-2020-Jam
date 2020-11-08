
function Sphere(name,type, x, y, r, color, parent) {
  /* name = username */
  this.name = name || "";
  /* type = color_planet || color_moon (e.g. red_planet, orange_moon) */
  this.type = type || "default";
  this.target = createVector(x,y);
  this.color = color || [128,128,128];
  this.pos = createVector(x,y);
  this.vel = createVector();
  this.acc = createVector();
  /* speed -> how fast can this reach maxspeed? */
  this.speed = 1.5;
  this.maxspeed = 6;
  this.maxforce = 1;
  this.friction = 0.1;
  /* radius */
  this.r = r || 50;
  /* health */
  this.health = 100;
  this.maxhealth = 100;
  
  //moon variables
  this.parent = parent || {};
  
  this.orbit = {
    isOrbiting:false,
    body:{},
    x:60,y:60,
    radius:50,
    period:0,offset:0,
    initial_speed:1,
    speed:1,speed_inc:1,maxspeed:20,
    dir:1
  };
  
  this.toss = {
    firing_stage:"orbiting",
    initial_force:10,force:10,
    inc:2,
    maxforce:50
  };
  
  this.start();
}

Sphere.prototype.start = function() {
  if (this.type.includes( "moon" ) ) { 
    this.speed = this.toss.force;
    this.maxspeed = this.toss.maxforce;
    this.orbit.isOrbiting = true;
  }
}

Sphere.prototype.incHealth = function(h) {
  this.health = Math.min(this.maxhealth, Math.max(0, this.health + h));
  if(this.health == 0 ) { return true; }
  return false;
}

Sphere.prototype.getHealth = function() {
  return this.health;
}

Sphere.prototype.control = function() {
  
  if(this.type.includes("moon")) {
    let firing = false;
    let pulling = false;
    if(keyIsDown (SHIFT)) // if `shift` key is pressed
      firing = true;
    if(keyIsDown(CONTROL)) // if `control` key is pressed
      pulling = true;
  
    if(firing) {
      if(this.toss.firing_stage == "orbiting") {
        this.toss.firing_stage = "charging";
      } 
      else if(this.toss.firing_stage == "charging") {
        if(this.toss.force < this.toss.maxforce){
          this.toss.force += this.toss.inc;            
        } 
        else if(this.toss.force >= this.toss.maxforce){
          this.toss.force = this.toss.maxforce;
        }
  
        this.orbit.speed = map( this.toss.force,
          this.toss.initial_force, this.toss.maxforce,
          this.orbit.initial_speed, this.orbit.maxspeed 
        );
      }
      if(this.toss.firing_stage == "loose") {
        this.toss.firing_stage = "returning";
      }
    } 
    else {
      if(this.toss.firing_stage == "charging") {
        this.toss.firing_stage = "released";
        this.orbit.speed = 1;
        this.orbit.dir *= -1;
      }
    }
    if(pulling) {
      if (this.toss.firing_stage == "loose") {
        this.toss.firing_stage = "returning";
        this.vel.mult(0.01);
        this.toss.force = this.toss.initial_force;
      }
      else if(this.toss.firing_stage == "returning") {
        this.toss.firing_stage == "loose"
      }
    } 
  }
  
  // move in direction if `a`, `w`, `s`, or `d` is pressed (ascii char value)
  if(this.type.includes("planet")) {
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
  allData.colorR = this.color.r;
  allData.colorG = this.color.g;
  allData.colorB = this.color.b;
  allData.colorA = this.color.a; 
  allData.targetX = this.target.x;  
  allData.targetY = this.target.y; 
  allData.posX = this.pos.x;
  allData.posY = this.pos.y;
  allData.velX = this.vel.x;
  allData.velY = this.vel.y;
  allData.speed = this.speed;
  allData.maxspeed = this.maxspeed;
  allData.maxforce = this.maxforce;
  allData.friction = this.friction1;
  allData.r = this.r;
  allData.orbitIs = this.orbit.isOrbiting;
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
  allData.tossMF = this.toss.maxforce;
  allData.bouncing = this.bouncing;
  
  return allData;
}

Sphere.prototype.readData = function(inData) {
  
  this.name = inData.name;
  this.type = inData.type;
  this.color.r = inData.colorR;
  this.color.g = inData.colorG;
  this.color.b = inData.colorB;
  this.color.a = inData.colorA;
  this.target = createVector(inData.targetX,inData.targetY);
  this.pos = createVector(inData.posX,inData.posY);  
  this.vel = createVector(inData.velX,inData.velY);
  this.speed = inData.speed;
  this.maxspeed = inData.maxspeed;
  this.maxforce = inData.maxforce;
  this.friction = inData.friction;
  this.r = inData.r;
  this.orbit.isOrbiting = inData.orbitIs;
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
  this.toss.maxforce = inData.tossMF;
  this.bouncing = inData.bouncing;
}

Sphere.prototype.behaviors = function() {
  let arrive;
  let point_of_force;
  let shoot;
  
  if(this.type.includes("planet")) {
    this.recurse();
  }
  if(this.type.includes( "moon" ) ) {
    if( this.toss.firing_stage == "orbiting") {
    } else if(this.toss.firing_stage == "charging") {
  
    } else if(this.toss.firing_stage == "released") {
      this.shoot();
    } else if(this.toss.firing_stage == "loose") {
      this.bounce();
    } else if(this.toss.firing_stage == "returning") {
      arrive = this.arrive(this.target);
      arrive.mult(4);
      this.applyForce(arrive);
    }
  }
}

Sphere.prototype.applyForce = function(f) {
  this.acc.add(f);
}

Sphere.prototype.updateTarget = function(target) {
  if(this.type.includes("planet")) {
    this.parent = target || {};
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
    this.orbit.body = target || {};
    this.orbit.period += (this.orbit.speed / this.orbit.radius) * this.orbit.dir;
  
    this.target = createVector(
      this.parent.pos.x + ( (cos(this.orbit.period) * this.orbit.radius) ), 
      this.parent.pos.y + ( (sin(this.orbit.period) * this.orbit.radius) )
    );
  }
}

Sphere.prototype.update = function(e) {
  
  this.updateTarget(e);
  
  if(this.type.includes("moon") ) {
    if(this.toss.firing_stage == "orbiting" 
      || this.toss.firing_stage == "charging") {
      this.vel = createVector(0,0);
      this.acc = createVector(0,0);
      this.pos = createVector(this.target.x, this.target.y);
    }
  }
  
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  
  //applies friction to sphere velocity 'this.vel'
  if(this.type.includes("planet") ) {
    let mag = this.vel.mag();
  
    if( mag > 0.1) {
      let friction = 1 - this.friction;
      let velX = round( (this.vel.x * friction) * 1000) / 1000;
      let velY = round( (this.vel.y * friction) * 1000) / 1000;
  
      this.vel = createVector(velX,velY);
    } else {
      this.vel.mult(0);
    }
  }
  
  this.acc.mult(0);
} 

Sphere.prototype.show = function() {
 
  /* draw 3x3 grid of copies of spheres to simulate recursion of screen */
  let copies = 9;
  let halfR = this.r/2;
  
  let drawX = [
    map( this.pos.x-width, -width, 0, -width, 0),
    this.pos.x,
    map( this.pos.x+width, 0, width, 0, width),
    map( this.pos.x-width, -width, 0, -width, 0),
    this.pos.x,
    map( this.pos.x+width, 0, width, 0, width),
    map( this.pos.x-width, -width, 0, -width, 0),
    this.pos.x,
    map( this.pos.x+width, 0, width, 0, width)
  ];
  let drawY = [
    map(this.pos.y-height, -(height*2), 0, -(height*2), 0),
    map(this.pos.y-height, -(height*2), 0, -(height*2), 0),
    map(this.pos.y-height, -(height*2), 0, -(height*2), 0),
    this.pos.y,
    this.pos.y,  
    this.pos.y,
    map(this.pos.y+height, height, height*2, height, height*2),
    map(this.pos.y+height, height, height*2, height, height*2),
    map(this.pos.y+height, height, height*2, height, height*2)
  ];
 
  //sphere body planet and moon
  push();
  noStroke(); 
  for(let c = 0; c < copies; c++) {
    
    let currentHealth = 1;
    let healthBarWeight = 1;
    
    //health / shield? display (back)
    if(this.type.includes("planet")) {
      currentHealth = this.getHealth();
      healthBarWeight = map(currentHealth, 0, 100, 0.1, 7);
  
      stroke(0,255,0, 128);
      strokeWeight(healthBarWeight);
      noFill();
      arc( drawX[c], drawY[c], this.r*1.5, this.r/2, PI, 0, OPEN);
    }
 
    noStroke();
    fill(this.color);
    circle( drawX[c], drawY[c], this.r);
  
    //health / shield? display (front)
    if(this.type.includes("planet")) {
      stroke(0,255,0, 128);
      strokeWeight(healthBarWeight);
      noFill();
      arc( drawX[c], drawY[c], this.r*1.5, this.r/2, 0, PI, OPEN);
  
      fill(255);
      stroke(255);
      strokeWeight(1);      
      textAlign(CENTER);
      text( this.name, drawX[c], drawY[c]);
    }
  }
  pop();
}

Sphere.prototype.arrive = function(target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxspeed;
 
  if( d < 1000) {
    speed = map(d, 0, 100, 0, this.maxspeed);
    if(d < this.orbit.radius ){
      this.toss.firing_stage = "orbiting"
    }
  }
 
  desired.setMag(speed);
  var steer = p5.Vector.sub(desired,this.vel);
  steer.limit(this.maxforce);
  return steer;
}

Sphere.prototype.shoot = function(target) {
  let invert = createVector( this.orbit.body.pos.y -this.orbit.body.pos.x);
  let perpendicular = p5.Vector.sub( this.target, this.orbit.body.pos);
  let outVel = createVector( perpendicular.y * this.orbit.dir, -perpendicular.x * this.orbit.dir).normalize();
  this.vel = createVector( outVel.x * this.toss.force, outVel.y * this.toss.force);
  this.vel.limit( this.toss.maxforce );
 
  this.toss.firing_stage = "loose";
  this.toss.force = this.toss.initial_force;
}

Sphere.prototype.recurse = function(target) {
  let edgetuck = 0;
  if(this.pos.x < -edgetuck ) {
    this.pos.x = width + edgetuck;
  }
  if(this.pos.x > width + edgetuck) {
    this.pos.x = -edgetuck;
  } 
  if(this.pos.y < -edgetuck) {
    this.pos.y = height + edgetuck;
  }
  if(this.pos.y > height + edgetuck) {
    this.pos.y = -edgetuck;
  }
}

Sphere.prototype.bounce = function(target) {
  
	let w = this.r / 2;
  
	if (this.pos.x <= w && this.vel.x < 0
	|| this.pos.x > width - w && this.vel.x > 0) {
		this.vel = createVector(-(this.vel.x),this.vel.y);
		this.pos.add(this.vel);
	}
	else if (this.pos.y <= w && this.vel.y < 0
	|| this.pos.y > height - w && this.vel.y > 0) {
		this.vel = createVector(this.vel.x,-(this.vel.y));
		this.pos.add(this.vel);
	}
}

Sphere.prototype.collide = function(spheres) {
  /* each planet checks if hit by another planets moon */
  for(let s = 0; s < spheres.length; s++) {
    if(this.type.includes('_planet')) {
      if(spheres[s].type.includes('_moon')){
        if(spheres[s].name != this.name) {
          let dist = p5.Vector.dist( spheres[s].pos, this.pos);
          if(dist < (this.r + spheres[s].r)/2){ //if I\'m close enough to be hit
            let isDead = this.incHealth(-10);
            return isDead;
          }
        }
      }
    }
  }
  return false;
}

