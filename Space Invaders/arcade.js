
var canvas;
var gl;

var points = [];
var colors = [];

var program;

var faceVerts = [
  vec3(0, 350, -100), // [0]
  vec3(0, 250, -200), // [1]
  vec3(0, -400, -200), // [2]
  vec3(0, -400, 100), // [3]
  vec3(0, -150, 100), // [4]
  vec3(0, -75, 175), // [5]
  vec3(0, 0, 175), // [6]
  vec3(0, 25, 15), // [7]
  vec3(0, 250, -25), // [8]
  vec3(0, 250, 0), // [9]
  vec3(0, 350, 0), // [10]

  vec3(0, 237.5, -22.78), // [11]
  vec3(0, 37.5, 12.78) // [12]
];
var sideVerts = [
  vec3(0, 360, -110), // [0]
  vec3(0, 260, -210), // [1]
  vec3(0, -400, -210), // [2]
  vec3(0, -400, 110), // [3]
  vec3(0, -160, 110), // [4]
  vec3(0, -85, 185), // [5]
  vec3(0, 10, 185), // [6]
  vec3(0, 35, 35), // [7]
  vec3(0, 150, 0), // [8]
  vec3(0, 360, 10), // [9]

  vec3(0, -400, -110), // [10]
  vec3(0, -160, -110), // [11]
  vec3(0, -85, -110), // [12]
  vec3(0, 10, -110), // [13]
  vec3(0, 35, -110), // [14]
  vec3(0, 150, -110), // [15]
];
var setVerts = [
  // FLOOR & WALL
  vec3(500, -400, 750), // [0]
  vec3(500, -400, -250), // [1]
  vec3(-500, -400, -250), // [2]
  vec3(-500, -400, 750), // [3]
  vec3(-500, 600, -250), // [4]
  vec3(500, 600, -250), // [5]
];

var vertexColors = [
  [0.45, 0.25, 0.45, 1.0], // [0] purple
  [0.0, 0.0, 0.5, 1.0], // [1] blue
  [0.95, 0.75, 0.0, 1.0], // [2] yellow
  [0.25, 0.15, 0.0, 1.0], // [3] brown
  [0.35, 0.35, 0.35, 1.0], // [4] grey
  [0.0, 0.0, 0.0, 1.0], // [5] black
  [0.75, 0.1, 0.1, 1.0], // [6] red
  [0.1, 0.15, 0.8, 1.0], // [7] light blue
  [0.25, 1.0, 0.0, 1.0], // [8] neon green
  [1.0, 1.0, 1.0, 1.0] // [9] white
 ];
var m = []; // this is an array to mirror vertices across the x axis

var theta = [10, 0, 0];
var thetaLoc;

var fovy = 45.0;
var aspect = 1.0;
var near = 1.0;
var far = 2000.0;

var camPosition = 0;
var camLock = true;

var xTrans = 0;
var yTrans = 0;
var zTrans = 0;

var btnNum = 0;
var btnFlags = [];
var btnRefs = [];


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  drawMachine(vertexColors[1], vertexColors[2]);
  quad(setVerts[2], setVerts[1], setVerts[5], setVerts[4], vertexColors[0]); // DRAW THE WALL
  quad(setVerts[0], setVerts[1], setVerts[2], setVerts[3], vertexColors[3]); // AND THE FLOOR
  drawGame();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.5, 0.75, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelView = gl.getUniformLocation(program, "modelView");
  projection = gl.getUniformLocation(program, "projection");

  window.onkeydown = keyPress;
  window.onkeyup = keyRelease;

  document.getElementById("cam_0").onclick = function() {
    camPosition = 0;
    theta = [10, 0, 0];
    xTrans = 0;
    yTrans = 0;
    zTrans = 0;
  };
  document.getElementById("cam_1").onclick = function() {
		if (camPosition != 1) {
			camPosition = 1;
			if (theta[0] < -12)
				theta[0] = -12;
			else if (theta[0] > 28)
				theta[0] = 28;
	    if (theta[1] < -40)
	      theta[1] = -40;
	    else if (theta[1] > 40)
	      theta[1] = 40;
	    xTrans = 0;
	    yTrans = 30;
	    zTrans = -225;
		}
  };
  document.getElementById("cam_2").onclick = function() {
		if (camPosition != 2) {
			camPosition = 2;
	    theta[0] = 10;
	    xTrans = 0;
	    yTrans = 150;
	    zTrans = -850;
		}
  };
  document.getElementById("cam_c").onclick = function() {
    theta = [10, 0, 0];
    xTrans = 0;
  };

render();
}

function keyRelease(event) {
  var key = String.fromCharCode(event.keyCode);
  switch (key) {

    case 'J':
      btnFlags[0] = false;
      moveLeft = false;
      break;
    case 'K':
      btnFlags[1] = false;
      fired = false;
      break;
    case 'L':
      btnFlags[2] = false;
      moveRight = false;
      break;
    case 'S':
      btnFlags[3] = false;
      break;
    case 'Z':
      btnFlags[4] = false;
      break;
  }
}

function keyPress(event) {
  var key = String.fromCharCode(event.keyCode);
  switch (key) {

    case '1':
      if (!camLock)
        theta[0] += 2.0;
      else if ((camPosition == 2 && theta[0] < 48) || (camPosition == 1 && theta[0] < 28))
        theta[0] += 2.0;
      break;
    case '2':
      if (!camLock)
        theta[0] -= 2.0;
      else if ((camPosition == 2 && theta[0] > -6) || (camPosition == 1 && theta[0] > -12))
        theta[0] -= 2.0;
      break;
    case '3':
      if (!camLock)
        theta[1] += 2.0;
      else if ((camPosition == 2 && theta[1] < 80) || (camPosition == 1 && theta[1] < 40))
        theta[1] += 2.0;
      break;
    case '4':
      if (!camLock)
        theta[1] -= 2.0
      else if ((camPosition == 2 && theta[1] > -80) || (camPosition == 1 && theta[1] > -40))
        theta[1] -= 2.0;
      break;

    case 'J':
      btnFlags[0] = true;
      if (start)
        moveLeft = true;
      break;
    case 'K':
      btnFlags[1] = true;
      if (!fired && start) {
        shoot = true;
        fired = true;
      }
      break;
    case 'L':
      btnFlags[2] = true;
      if (start)
        moveRight = true;
      break;
    case 'S':
      btnFlags[3] = true;
      start = true;
      if (count == 0) {
        forwards = true;
        count++;
      }
      break;
    case 'Z':
      btnFlags[4] = true;
      start = false;
      break;
    case 'C':
      if (camLock)
        camLock = false;
      else
        camLock = true;
      break;
  }
}

function drawMachine(color_1, color_2) {

  m = [
    vec3(-150, 0, 0), // left
    vec3(150, 0, 0) // right
  ];
  var color = color_1;
  quad(add(faceVerts[0], m[0]), add(faceVerts[10], m[0]),
    add(faceVerts[10], m[1]), add(faceVerts[0], m[1]), color);
  for (var i = 0; i < 10; i++) {
    if (i == 6)
      color = vertexColors[4];
    else if (i == 4 || i == 8)
      color = darken(color);
    else
      color = color_1;
    if (i == 2 || i == 7) {}
    // do nothing, this is either the bottom or the monitor
    else
      quad(add(faceVerts[i + 1], m[0]), add(faceVerts[i], m[0]),
        add(faceVerts[i], m[1]), add(faceVerts[i + 1], m[1]), color);
  }

  drawBezel(darken(vertexColors[7]));
  drawPanels(darken(color_1), color_2); // DRAW THE SIDE PANELS
  addButton(30, 30, 100, vertexColors[9]);  // LEFT BUTTON
  addButton(35, 70, 100, vertexColors[6]);  // FIRE BUTTON
  addButton(30, 110, 100, vertexColors[9]);  // RIGHT BUTTON
  addButton(35, -100, 75, vertexColors[2]);  // START BUTTON
  addButton(30, -100, 125, vertexColors[7]);  // DIFFICULTY BUTTON

  //quad(vertices[2], vertices[1], vertices[5], vertices[4], vertexColors[0]); // DRAW THE WALL
  //quad(vertices[0], vertices[1], vertices[2], vertices[3], vertexColors[3]); // AND THE FLOOR

}

function drawBezel(color) {
  m = [
    vec3(-150, 0, 0),
    vec3(150, 0, 0),
    vec3(-100, 0, 0),
    vec3(100, 0, 0)
  ];
  quad(add(faceVerts[8], m[0]), add(faceVerts[7], m[0]),
    add(faceVerts[7], m[2]), add(faceVerts[8], m[2]), color);
  quad(add(faceVerts[8], m[3]), add(faceVerts[7], m[3]),
    add(faceVerts[7], m[1]), add(faceVerts[8], m[1]), color);
  quad(add(faceVerts[8], m[2]), add(faceVerts[11], m[2]),
    add(faceVerts[11], m[3]), add(faceVerts[8], m[3]), color);
  quad(add(faceVerts[12], m[2]), add(faceVerts[7], m[2]),
    add(faceVerts[7], m[3]), add(faceVerts[12], m[3]), color);
}

function drawPanels(color_1, color_2) {

  m = [
    vec3(160, 0, 0), // [0]	far right
    vec3(150, 0, 0), // [1]	near right
    vec3(-150, 0, 0), // [2]	near left
    vec3(-160, 0, 0) // [3]	far left
  ];
  // CREATE THE TRIM FOR THE SIDE PANELLING
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 9; j++) {
      quad(add(sideVerts[0], m[i]), add(sideVerts[9], m[i]),
        add(sideVerts[9], m[i + 1]), add(sideVerts[0], m[i + 1]), color_2);
      if (j != 2) {     // if i == 2, it's the bottom of the machine
        if (j == 4 || j == 8)
          quad(add(sideVerts[j + 1], m[i]), add(sideVerts[j], m[i]),
            add(sideVerts[j], m[i + 1]), add(sideVerts[j + 1], m[i + 1]), darken(color_2));
        else
          quad(add(sideVerts[j + 1], m[i]), add(sideVerts[j], m[i]),
            add(sideVerts[j], m[i + 1]), add(sideVerts[j + 1], m[i + 1]), color_2);
      }
    }
    i++;
  }
  // NOW FILL IN EACH PANEL
  for (var i = 0; i < 4; i++) {
    quad(add(sideVerts[1], m[i]), add(sideVerts[2], m[i]),
      add(sideVerts[10], m[i]), add(sideVerts[0], m[i]), color_1);
    for (var j = 11; j < 17; j++)
      quad(add(sideVerts[j % 16], m[i]), add(sideVerts[j - 1], m[i]),
        add(sideVerts[j - 8], m[i]), add(sideVerts[j - 7], m[i]), color_1);
  }
}

function p_slope(z) {         // flush with the control panel
  return (-1/6) * z + 29.167;
}

function darken(color) {
  return vec4(subtract(color, vec4(0.2, 0.2, 0.2, 0.0)))
}

function addButton(size, x, z, color) {

  var a = btnNum * 2;
  var b = a++;
  m = [
    vec3(x - size/2, 0, 0),
    vec3(x + size/2, 0, 0)
  ];
  var outline = [
    vec3(0, p_slope(z - size/2), z - size/2),              // [0]
    vec3(0, p_slope(z + size/2), z + size/2),              // [1]
    vec3(0, p_slope(z + size/2) + 10, (z + size/2) + 5/3), // [2]
    vec3(0, p_slope(z - size/2) + 10, (z - size/2) + 5/3)  // [3]
  ];

  quad(add(outline[3], m[0]), add(outline[0], m[0]),            // LEFT
    add(outline[1], m[0]), add(outline[2], m[0]), darken(color));
  quad(add(outline[2], m[0]), add(outline[1], m[0]),            // FRONT
    add(outline[1], m[1]), add(outline[2], m[1]), darken(color));
  quad(add(outline[2], m[1]), add(outline[1], m[1]),            // RIGHT
    add(outline[0], m[1]), add(outline[3], m[1]), darken(color));
  quad(add(outline[3], m[1]), add(outline[0], m[1]),            // BACK
    add(outline[0], m[0]), add(outline[3], m[0]), darken(color));
  quad(add(outline[2], m[0]), add(outline[3], m[0]),            // TOP
    add(outline[3], m[1]), add(outline[2], m[1]), color);

  btnNum++;
  btnFlags.push(false);
  btnRefs.push(0.0);
}

function quad(a, b, c, d, color) {
  var indices = [a, b, c, a, c, d];
  for (var i = 0; i < indices.length; ++i) {
    points.push(indices[i]);
    colors.push(color);
  }
}

function btnAnimation() {

  for (var i = 0; i < btnNum; i++) {
    var a = 450 + i*30; // the first point of the current button

    if (btnFlags[i] && btnRefs[i] > -8) {
      for (var j = a; j < a + 30; j++) {
        if (j != a + 3 && j != a + 6 && j != a + 12 &&
            j != a + 18 && j != a + 27 && j != a + 28) {
            points[j][1] -= 2;
            points[j][2] -= 1 / 3;
        }
      }
    }
    else if (!btnFlags[i] && btnRefs[i] < 0) {
      for (var j = a; j < a + 30; j++) {
        if (j != a + 3 && j != a + 6 && j != a + 12 &&
            j != a + 18 && j != a + 27 && j != a + 28) {
            points[j][1] += 2;
            points[j][2] += 1 / 3;
        }
      }
    }
    if (btnFlags[i] && btnRefs[i] > -8)
      btnRefs[i] -= 2;
    else if (!btnFlags[i] && btnRefs[i] < 0)
      btnRefs[i] += 2;
  }
}

function render() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  pMatrix = perspective(fovy, aspect, near, far);

  btnAnimation();
  alienMovement();
  playerMovement();
  shootLaser();

  mvMatrix = mat4();
  mvMatrix = mult(mvMatrix, translate(xTrans, yTrans - 137, zTrans - 255));
  mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
  mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
  mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
  gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(projection, false, flatten(pMatrix))
  gl.drawArrays(gl.TRIANGLES, 0, points.length);

  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


  requestAnimFrame(render);
}
