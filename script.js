const canvas = document.querySelector("#ga");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

class Renderable {
  x;
  y;
  w;
  h;
  vx=0;
  vy=0;
  constructor(x,y,w,h) {
    this.x =x;
    this.y =y;
    this.w =w;
    this.h =h;
  }
  draw() {
    ctx.fillRect(this.x,this.y,this.w,this.h)
  }
  physics() {
    let smooth = 0.98;
    let powerMultiplier = 1;
    this.x += this.vx * powerMultiplier * smooth;
    this.vy *= smooth;
    this.y += this.vy * powerMultiplier * smooth;
    this.vx *= smooth;

    for(const o of renderedObjects) {
      if(this.x < o.x && this.x > o.x - tileSize &&
          this.y > o.y
      ) {
        ctx.fillStyle = "blue"
      }
    }
  }
}

const floorY = 200;
let startX = 0;
let startY = floorY;
const obj = new Renderable(startX, startY, 25, 25);

const keys = {};
window.onkeydown=(e)=>{keys[e.key]=true}
window.onkeyup=(e)=>{keys[e.key]=false}

const maps = [
  `>...............sS............SSS....<`
]
let isJumping = false;

const plyrControl = ()=> {
  obj.vx = 5;
  if(keys[' ']) {
    if(!isJumping) {
      obj.vy = -12;
      isJumping = true;
    }
  }

  obj.vy++;

  if(obj.y > floorY) {
    obj.y = floorY;
    isJumping = false;
  }

  obj.draw();
}

const tileSize = 25;

class Spike extends MapTile {
  isSmall = false;
  constructor(x,y,isSmall) {
    super(x,y,"s")
    this.isSmall = isSmall;
  }
  draw() {
    ctx.fillStyle = '#ccc'
    ctx.beginPath();
    ctx.moveTo(this.x, this.y+this.h)
    if(this.isSmall) {
      ctx.lineTo(this.x - (this.h/2), this.y+this.h/2)
    } else {
      ctx.lineTo(this.x - (this.h/2), this.y)
    }
    ctx.lineTo(this.x - this.h, this.y+this.h)
    ctx.lineTo(this.x, this.y+this.h)
    ctx.fill();
  }
}

class MapTile extends Renderable {
  tile = "";
  constructor(x,y,options="") {
    super(x,y,(typeof options == "string" ? tileSize: options.w),(typeof options == "string" ? tileSize: options.h))
    this.tile = (typeof options == "string" ? options : options.key);
  }
}
const renderedObjects = [];
const renderTilemap = (tm) => {
  let renderX = 0;
  let renderY = floorY;
  for(const map of tm.split("\n")) {
    for(const tile of map.split("")) {
      switch(tile) {
        case " ":
        case "\t":
        case "":
          renderX -= tileSize;
          break;
        case ">":
          startX = renderX;
          startY = renderY;
          break;
        case "<":
          renderedObjects.push(new MapTile(renderX,0,{
            tile: "exit",
            w: tileSize,
            h: floorY + tileSize,
          }))
          break;
        case ".":
          break;
        case "b":
          renderedObjects.push(new Renderable(renderX,renderY,tileSize,tileSize))
          break;
        case "S":
        case "s":
          renderedObjects.push(new Spike(renderX,renderY, tile == "s"))
          break;
      }
      renderX += tileSize;
    }
    renderX = 0;
    renderY += tileSize;
  }
}

const render = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height)

  obj.physics();

  plyrControl()

  renderTilemap(maps[0])
  for(const e of renderedObjects) {
    e.draw();
  }

  requestAnimationFrame(render)
}

render();