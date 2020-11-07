
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
  
  //moon variables
  this.parent = parent || {};
  
  this.orbit = {
    isOrbiting:false,
    body:{},
    x:60,y:60,
    radius:40,
    period:0,offset:0,
    initial_speed:1,
    speed:1,speed_inc:1,maxspeed:15,
    dir:1
  };
  
  this.toss = {
    firing_stage:"orbiting",
    initial_force:1,force:1,
    inc:1,
    maxforce:50
  };

  this.start();
}

Sphere.prototype.start = function() {
  if (this.type.includes( "planet" ) ) {  
    if(this.type == "red_planet") {this.orbit.offset = PI;}
  }
  if (this.type.includes( "moon" ) ) { 
    this.speed = this.toss.force;
    this.maxspeed = this.toss.maxforce;
    this.orbit.isOrbiting = true;
  }
}

Sphere.prototype.control = function() {
  
  let firing = false;
  let pulling = false;

  if (this.name == socket_GetUser()) {
    if( this.type.includes("moon")) {
      if(keyIsDown (SHIFT)) // if `shift` key is pressed
        firing = true;
      if(keyIsDown(CONTROL)) // if `control` key is pressed
        pulling = true;

      if(firing) {
        if(this.toss.firing_stage == "orbiting") {
          this.toss.firing_stage = "charging";
        } else if(this.toss.firing_stage == "charging") {
          if(this.toss.force < this.toss.maxforce){
            this.toss.force += this.toss.inc;            
          } else if(this.toss.force >= this.toss.maxforce){
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
    }

    if(pulling && this.toss.firing_stage == "loose") {
      this.toss.firing_stage = "returning";
      this.vel.mult(0.25);
      this.toss.force = this.toss.initial_force;
    } else if( this.toss.firing_stage == "returning" ) {
      this.toss.firing_stage == "loose"
    }
  
   // move in direction if `a`, `w`, `s`, or `d` is pressed (ascii char value)
    if( this.type.includes("planet")) {
      if (keyIsDown(65)) this.vel.x -= this.speed;
      if (keyIsDown(68)) this.vel.x += this.speed;
      if (keyIsDown(87)) this.vel.y -= this.speed;
      if (keyIsDown(83)) this.vel.y += this.speed;
    }
  }
}

Sphere.prototype.copyData = function() {
  
  let allData = {};
  
  allData.name = this.name;
  allData.type = this.type;
  allData.x = this.x;
  allData.y = this.y;
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

Sphere.prototype.readData = function( inData ) {
  
  this.name = inData.name;
  this.type = inData.type;
  this.x = inData.x;
  this.y = inData.y;
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

Sphere.prototype.updateTarget = function( target ) {
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
    // if(this.toss.firing_stage == "orbiting"
    //   || this.toss.firing_stage == "charging" 
    //   || this.toss.firing_stage == "returning" ) {
      this.orbit.body = target || {};
      this.orbit.period += (this.orbit.speed / this.orbit.radius) * this.orbit.dir;
  
      this.target = createVector(
        this.orbit.body.pos.x + ( (sin(this.orbit.period) * this.orbit.radius) ), 
        this.orbit.body.pos.y + ( (cos(this.orbit.period) * this.orbit.radius) )
      );
    //}
  }
}

Sphere.prototype.update = function(e) {
  
  this.updateTarget(e);
  
  if(this.type.includes("moon") ) {
    if(this.toss.firing_stage == "orbiting" 
      || this.toss.firing_stage == "charging") {
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
 
  /* draw copies of player sphere on recursion of screen */
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

  let copies = 9;

  // if(this.pos.x > width - halfR && this.pos.x < width){ copies++;}
  // if(this.pos.x < halfR && this.pos.x > 0){ copies++;}
  // if(this.pos.y > height - halfR && this.pos.y < height){ copies++;}
  // if(this.pos.y < halfR && this.pos.y > 0){ copies++;}

  push();
  noStroke(); 
  for(let c = 0; c < copies; c++) {

    fill(this.color);
    circle( drawX[c], drawY[c], this.r);
    
    fill(255);
    textAlign(CENTER);

    if(this.type.includes("planet")) {
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
  let outVel = createVector( perpendicular.y * -this.orbit.dir, -perpendicular.x * -this.orbit.dir).normalize();
  this.vel = createVector( outVel.x * this.toss.force, outVel.y * this.toss.force);
  this.vel.limit( this.toss.maxforce );

  this.toss.firing_stage = "loose";
  this.toss.force = this.toss.initial_force;
}

Sphere.prototype.recurse = function(target) {
  let edgetuck = 0;//this.r/2;
  if(  this.pos.x < -edgetuck ) {
    this.pos.x = width + edgetuck;
  }
  if( this.pos.x > width + edgetuck) {
    this.pos.x = -edgetuck;
  } 
  if(  this.pos.y < -edgetuck) {
    this.pos.y = height + edgetuck;
  }
  if( this.pos.y > height + edgetuck) {
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
