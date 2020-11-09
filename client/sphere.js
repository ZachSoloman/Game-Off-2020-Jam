
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
  
  /* planet rotation */
  this.rotation = 0;

  //moon variables
  this.parent = parent || {};
  
  this.orbit = {
    isOrbiting:false,
    body:{},
    x:60,y:60,
    radius:60,
    period:0,offset:0,
    initial_speed:5,
    speed:5,speed_inc:1,maxspeed:25,
    dir:1
  };
  
  this.toss = {
    firing_stage:"orbiting",
    initial_force:20,force:20,
    inc:1,
    maxforce:40
  };

  /* asteroid behavior*/
  this.adopting = false;
  this.hit_force = -10;
  this.children = 1;
  this.childLimit = 4;

  this.start();
}

Sphere.prototype.start = function() {
  if (this.type.includes( "planet" ) ) {  
    if(this.type == "red_planet") {this.orbit.offset = PI;}
  }
  if (this.type.includes( "moon" ) 
    || this.type.includes( "asteroid" )) { 
    this.speed = this.toss.force;
    this.maxspeed = this.toss.maxforce;
    this.orbit.isOrbiting = true;
  }
}

Sphere.prototype.incHealth = function(h) {
  this.health += h;
  if(this.health <= 0 ) { this.health = 0; return true; }
  if(this.health >= this.maxhealth ) { this.health = this.maxhealth;}
  return false;
}

Sphere.prototype.getHealth = function() {
  return this.health;
}

Sphere.prototype.control = function() {
  
  let firing = false;
  let pulling = false;

  if (this.name == socket_GetUser()) {
    if( this.type.includes("moon")) {
      if(keyIsDown (SHIFT)) // if `shift` key is pressed
        firing = true;
      if(keyIsDown(67)) // if `c` key is pressed
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
        if(this.toss.firing_stage == "loose" && !this.type.includes("_asteroid")) {
          this.toss.firing_stage = "returning";
        }
      } 
      else {
        if(this.toss.firing_stage == "charging") {
          this.toss.firing_stage = "released";
          this.orbit.speed = 1;
          this.orbit.dir *= -1;

          if( this.type.includes("_asteroid") ) {
            this.name = "";
          }
        }
      }
    }

    if(pulling && this.toss.firing_stage == "loose" && !this.type.includes("_asteroid")) {
      this.toss.firing_stage = "returning";
      this.vel.mult(0.01);
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
      if (keyIsDown(189)) this.incHealth(-1);// if `h` key is pressed
      if (keyIsDown(187)) this.incHealth(1);// if `h` key is pressed
      if(keyIsDown(SHIFT)) this.adopting = true;// if `SHIFT` key is pressed
      else { this.adopting = false; this.children = 1;}
    }
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

Sphere.prototype.readData = function( inData ) {
  
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
    if(this.adopting && this.children < this.childLimit) {
      this.adopt( Spheres );
    }
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
  } else if( this.type.includes("asteroid")) {

  }
}

Sphere.prototype.applyForce = function(f) {
  this.acc.add(f);
}

Sphere.prototype.getParent = function( p, type ) {
  for(let i = 0; i < p.length; i++) {
    if( p[i].type.includes(type) ) {
      if(p[i].name == this.name){
        return p[i];
      }
    }
  }
  return {};
}

Sphere.prototype.doOrbit = function( parent ) {
  if(parent.pos) {
  this.orbit.period += (this.orbit.speed / this.orbit.radius) * this.orbit.dir;

  this.target = createVector(
    parent.pos.x + ( cos(this.orbit.period+this.orbit.offset) * this.orbit.radius ), 
    parent.pos.y + ( sin(this.orbit.period+this.orbit.offset) * this.orbit.radius * 0.5 ), 
    parent.pos.z + ( sin(this.orbit.period+this.orbit.offset) * this.orbit.radius * 0.5 )    
  );
  }
}

Sphere.prototype.updateParent = function( target ) {
  if(target!=undefined) {
    if(this.type.includes("planet"))
      this.orbit.body = this.parent = this.getParent(target,"_sun");
    else if(this.type.includes("moon"))
      this.orbit.body = this.parent = this.getParent(target,"_planet");
    else if(this.type.includes("asteroid")) {
      this.orbit.body = this.parent = {pos:{x:width/2,y:height/2}};
    }
  }
}

Sphere.prototype.update = function(e) {

  let amHit = this.collide(e);
  if(amHit != false) this.incHealth(amHit);

  if(this.parent != {} || this.parent != undefined) {
    this.updateParent(e);
    if(this.orbit.isOrbiting) {
      this.doOrbit(this.parent);
    }
  }
  
  if(this.type.includes("moon") ) {
    if(this.toss.firing_stage == "orbiting" 
      || this.toss.firing_stage == "charging") {
      this.vel = createVector(0,0);
      this.acc = createVector(0,0);
      this.pos = createVector(this.target.x, this.target.y);
    }
  } 
  else if(this.type.includes("asteroid") ) {
    this.pos = createVector(this.target.x, this.target.y);
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

  /* from sketch.js update*/
  this.control();
  this.behaviors();
  this.show(); 

  if(this.health <= 0) {
    if(this.type.includes('_asteroid')){
      this.die( e );
    }
    else { 
      return die( this.name );
    }
  }
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

  /* 3d drwawing*/
  push();

  /* 3d lighting, uses planet color to color texture */
  pointLight( this.color, 0, 0, -10 );

  /* do planet rotation*/
  this.rotation = this.rotation + (1*(deltaTime / 700));

  noStroke(); 
  for(let c = 0; c < copies; c++) {
    push();
    /* translates movement for 3d*/
    translate(drawX[c], drawY[c]);

    if(this.type.includes("planet")) {

      let healthBarWeight = map(this.getHealth(), 0, 100, 0.01, 0.3);

      push();
      rotateX( -TWO_PI / 3.5 );
      emissiveMaterial( 80, 255, 180, 128 );
      torus( this.r * 1.6, this.r * healthBarWeight, 24, 2);
      pop();

      // draw planet 
      push();
      rotateY( this.rotation );
      noStroke();
      texture(planetImg);
      sphere( this.r);
      pop();

    } else if(this.type.includes("moon")) {

      // draw moon
      push();
      translate( 0, 0, 0);
      noStroke();
      texture(planetImg);
      sphere( this.r);
      pop();
    } else if(this.type.includes("asteroid")) {
      // draw moon
      push();
      translate( 0, 0, -this.r*3);
      noStroke();
      texture(planetImg);
      sphere( this.r);
      pop();
    }
    pop();
  }

  /* player name */
  if(this.type.includes("planet")) {
    push();
    fill(255);
    textSize(20);
    translate( 0, 0, 0);
    if(this.type.includes("red")) {
      textAlign( LEFT);
      text( this.name, -width + 50, -50);
    }
    else if(this.type.includes("blue")) {
      textAlign(RIGHT);
      text( this.name, -50, -height + 50);
    }
    pop();
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

  //uses current rotation
  let perpendicular = p5.Vector.sub( this.target, this.orbit.body.pos);
  let outVel = createVector( perpendicular.y * this.orbit.dir, -perpendicular.x * this.orbit.dir).normalize();
  
  // uses planet direction to aim
  let planetVel = this.parent.vel.normalize();

  this.vel = createVector( 
    (planetVel.x * this.toss.force) + outVel.x,
    (planetVel.y * this.toss.force) + outVel.y
    );

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
  let bounced = false;

	if (this.pos.x <= w && this.vel.x < 0
	|| this.pos.x > width - w && this.vel.x > 0) {
		this.vel = createVector(-(this.vel.x),this.vel.y);
		this.pos.add(this.vel);
    bounced = true;
	}
	else if (this.pos.y <= w && this.vel.y < 0
	|| this.pos.y > height - w && this.vel.y > 0) {
		this.vel = createVector(this.vel.x,-(this.vel.y));
		this.pos.add(this.vel);
    bounced = true;
	}

    /* kill asteroids after two bounces */
  if( bounced && this.type.includes("_asteroid") ) {
    this.incHealth(-this.maxhealth/2);
  }
}

Sphere.prototype.collide = function(spheres) {
  /* each planet checks if hit by another planets moon*/
  for(let s = 0; s < spheres.length; s++) {
    if(this.type.includes('_planet')) {
      if(spheres[s].type.includes('_moon')){
        if(spheres[s].name != this.name) {
          let dist = p5.Vector.dist( spheres[s].pos, this.pos);
          if(dist < (this.r + spheres[s].r)){//if I'm close enough to be hit
            return spheres[s].hit_force;
          }
        }
      }
    }
  }

  return false;
}

Sphere.prototype.adopt = function( spheres ) {
  /* if 'asteroid' near a planet trying to adopt, get adopted*/
  for(let s = 0; s < spheres.length; s++) {
    if(this.type.includes('_planet')) {
      if(spheres[s].type.includes('_asteroid') && !spheres[s].type.includes('_moon') ){
        if(this.adopting) {
          let dist = p5.Vector.dist( spheres[s].pos, this.pos);
          if(dist < (this.r + spheres[s].r)*2){
            spheres[s].name = this.name;
            spheres[s].type += "_moon";
            spheres[s].orbit.radius = 60;
            this.children++;
          }
        }
      }
    }
  }
}

Sphere.prototype.getAdopted = function( spheres ) {
  /* if 'asteroid' near a planet trying to adopt, get adopted*/
  for(let s = 0; s < spheres.length; s++) {
    if(this.type.includes('_asteroid')) {
      if(spheres[s].type.includes('_planet')){
        if(spheres[s].adopting) {
          let dist = p5.Vector.dist( spheres[s].pos, this.pos);
          if(dist < (this.r + spheres[s].r)*2){
            this.name = spheres[s].name;
            this.type += "_moon";
            this.orbit.radius = 60;
            return true;
          }
        }
      }
    }
  }
  return false;
}

Sphere.prototype.die = function( spheres ) {
  /* removes self from Spheres */
  for(let s = 0; s < spheres.length; s++) {
    if(spheres[s] == this)
      spheres.splice(s, 1);
  }
}