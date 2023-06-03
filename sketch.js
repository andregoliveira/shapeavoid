const num_shapes = 100;
const motion_threshold = 5;
const smoothing = 1.0;

let camera;
let shapes = [];
let prevFrame;

function setup() {
  camera = createCapture(VIDEO);
  camera.size(windowWidth, windowHeight);
  camera.hide();

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  colorMode(RGB);

  for (let i = 0; i < num_shapes; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(20, 50);
    let shapeType = random(["arrow", "circle", "triangle"]);
    let shapeColor = randomColor(); 
    let tilt = random(-PI / 4, PI / 4);

    shapes[i] = {
      x: x,
      y: y,
      size: size,
      type: shapeType,
      colors: shapeColor,
      tilt: tilt,
      motionX: 0,
      motionY: 0,

      drawArrow() {
        let arrowSize = this.size / 2;
        push();
        translate(this.x, this.y);
        rotate(this.tilt);
        triangle(-arrowSize, 0, arrowSize, 0, 0, -arrowSize);
        rect(-arrowSize / 2, -arrowSize / 20, arrowSize, arrowSize);
        pop();
      },

      drawTriangle() {
        let angle = TWO_PI / 3;
        push();
        translate(this.x, this.y);
        rotate(this.tilt);
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
          let sx = cos(a) * this.size;
          let sy = sin(a) * this.size;
          vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
      },

      all_shapes() {
        noStroke();
        fill(this.colors);
        if (this.type === "arrow") {
          this.drawArrow();
        } else if (this.type === "circle") {
          ellipse(this.x, this.y, this.size);
        } else if (this.type === "triangle") {
          this.drawTriangle();
        }
      },

      move(motionX, motionY) {
        let speed = 0.5;
        this.x += motionX * speed;
        this.y += motionY * speed;
        if (
          this.x < 0 ||
          this.x > width ||
          this.y < 0 ||
          this.y > height
        ) {
          this.reset();
        }
      },

      reset() {
        this.x = random(-this.size, width + this.size);
        this.y = random(-this.size, height + this.size);
        this.size = random(20, 50);
        this.type = random(["arrow", "circle", "triangle"]);
        this.colors = randomColor(); 
        this.tilt = random(-PI / 4, PI / 4);
      },
    };
  }

  prevFrame = createImage(camera.width, camera.height);
}

function draw() {
  background(0);
  //image(camera, 0, 0, width, height);

  camera.loadPixels();
  scale(-1, 1);
  translate(-width, 0);
  let count = 0;

  if (prevFrame) {
    prevFrame.loadPixels();
    for (let i = 0; i < shapes.length; i++) {
      let shape = shapes[i];

      if (shape.x > 0 && shape.x < width && shape.y > 0 && shape.y < height) {
        count++;

        let x = Math.floor(shape.x);
        let y = Math.floor(shape.y);
        let index = (y * camera.width + x) * 4;
        let r = camera.pixels[index];
        let g = camera.pixels[index + 1];
        let b = camera.pixels[index + 2];
        let pixelDist = dist(r, g, b, 0, 0, 0);

        let prevX = Math.floor(shape.x);
        let prevY = Math.floor(shape.y);
        let prevIndex = (prevY * camera.width + prevX) * 4;
        let prevR = prevFrame.pixels[prevIndex];
        let prevG = prevFrame.pixels[prevIndex + 1];
        let prevB = prevFrame.pixels[prevIndex + 2];
        let prevPixelDist = dist(prevR, prevG, prevB, 0, 0, 0);

        let motionX = pixelDist - prevPixelDist;
        let motionY = pixelDist - prevPixelDist;

        if (
          Math.abs(motionX) > motion_threshold ||
          Math.abs(motionY) > motion_threshold
        ) {
          let smoothingX = lerp(shape.motionX, motionX, smoothing);
          let smoothingY = lerp(shape.motionY, motionY, smoothing);

          shape.move(smoothingX, smoothingY);

          shape.motionX = smoothingX;
          shape.motionY = smoothingY;
        }
      } else {
        shape.reset();
      }

      shape.all_shapes();
    }
  }

  console.log("Number of shapes: " + count);

  prevFrame.copy(camera, 0, 0, camera.width, camera.height, 0, 0, camera.width, camera.height);
}

function randomColor() {
  let colors = [
    color(255, 140, 0),   
    color(0, 255, 0),     
    color(255, 105, 180), 
    color(255, 255, 0),   
    color(0, 0, 255)      
  ];
  return random(colors);
}
