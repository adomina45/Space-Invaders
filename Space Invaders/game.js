
var alienStartVerts = [
  vec3(-60, 150, 0),
  vec3(-60, 160, 0),
  vec3(-45, 150, 0),
  vec3(-45, 160, 0)
];
var alienVerts = [];
var shipVerts = [
  vec3(-20, 65, s_slope(65)),
  vec3(-20, 55, s_slope(55)),
  vec3(20, 65, s_slope(65)),
  vec3(20, 55, s_slope(55)),
  vec3(-15, 68, s_slope(68)),
  vec3(-15, 65, s_slope(65)),
  vec3(15, 68, s_slope(68)),
  vec3(15, 65, s_slope(65)),
  vec3(-5, 73, s_slope(73)),
  vec3(-5, 68, s_slope(68)),
  vec3(5, 73, s_slope(73)),
  vec3(5, 68, s_slope(68))
];

var monitor = [
  vec3(-110, 27.5, s_slope(27.5) - 0.5),
  vec3(-110, 247.5, s_slope(247.5) - 0.5),
  vec3(110, 27.5, s_slope(27.5) - 0.5),
  vec3(110, 247.5, s_slope(247.5) - 0.5)
];

var start = false;
var forwards = false;
var count = 0;

var xIncrement = 10;
var yIncrement = 10;

var laser = [
  vec3(-2.5, 55, s_slope(55)),
  vec3(2.5, 55, s_slope(55)),
  vec3(-2.5, 73, s_slope(73)),
  vec3(2.5, 73, s_slope(73))
];
var laserRef = [
  vec3(-2.5, 55, s_slope(55) - 5),
  vec3(2.5, 55, s_slope(55) - 5),
  vec3(-2.5, 73, s_slope(73) - 5),
  vec3(2.5, 73, s_slope(73) - 5)
];

var moveLeft = false;
var moveRight = false;
var shoot = false;
var fired = false;
var hit = false;

var speed = 1;

function s_slope(y) {         // flush with the screen
  return ((y - 137.5) / -5.6) - 10;
}

function drawGame() {

  for (var i = 0; i < 3; i++) {
    var a = i * 4;
    quad(shipVerts[a + 1], shipVerts[a], shipVerts[a + 2], shipVerts[a + 3], vertexColors[8]);
  }
  quad(laser[1], laser[0], laser[2], laser[3], vertexColors[8]);
  quad(laserRef[1], laserRef[0], laserRef[2], laserRef[3], vertexColors[0]);
  drawAlien(alienStartVerts, vertexColors[9]);
  quad(monitor[1], monitor[0], monitor[2], monitor[3], vertexColors[5]);
}

function drawAlien(b, color) {

  var c = 0;
  var space = 15;

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 5; j++) {
      if (j > 0 && i > 0) {
        for (var k = 0; k < 4; k++)
          alienVerts[c + k] = vec3(b[k][0] + (xIncrement * j) + space * j, // x
            b[k][1] + (yIncrement * i) + space * i,                        // y
            s_slope(b[k][1] + (yIncrement * i) + space * i));              // z
      } else if (i > 0) {
        for (var k = 0; k < 4; k++)
          alienVerts[c + k] = vec3(b[k][0] + (xIncrement * j),             // x
            b[k][1] + (yIncrement * i) + space * i,                        // y
            s_slope(b[k][1] + (yIncrement * i) + space * i));              // z
      } else if (j > 0) {
        for (var k = 0; k < 4; k++)
          alienVerts[c + k] = vec3(b[k][0] + (xIncrement * j) + space * j, // x
            b[k][1] + (yIncrement * i),                                    // y
            s_slope(b[k][1] + (yIncrement * i)));                          // z
      } else {
        for (var k = 0; k < 4; k++)
          alienVerts[c + k] = vec3(b[k][0] + (xIncrement * j),             // x
            b[k][1] + (yIncrement * i),                                    // y
            s_slope(b[k][1] + (yIncrement * i)));                          // z
      }
      c += 4;
    }
  }
  for (var i = 0; i < alienVerts.length; i += 4)
    quad(alienVerts[i + 1], alienVerts[i],
      alienVerts[i + 2], alienVerts[i + 3], color);
}

function alienMovement() {

  var edge = 95;

  for (var i = 0; i < alienVerts.length; i++) {
    if (start) {

      if (forwards)
        alienVerts[i][0] += speed;
      else if (!forwards)
        alienVerts[i][0] -= speed;

      if (alienVerts[alienVerts.length - 1][0] > edge)
        forwards = false;
      else if (alienVerts[1][0] < -edge && alienVerts[0][0] < -edge) {
        forwards = true;
        alienVerts[1][0] = -edge + speed;
        alienVerts[0][0] = -edge + speed;
      }
    }
  }
}

function playerMovement() {

  // move the player ship left and right
  for (var i = 0; i < shipVerts.length; i++) {
    if (moveLeft && shipVerts[0][0] >= -99 && shipVerts[1][0] >= -99)
      shipVerts[i][0] -= 1;
    else if (moveRight && (shipVerts[2][0] <= 99 || shipVerts[3][0] <= 99))
      shipVerts[i][0] += 1;
    if (shipVerts[0][0] == -100 || shipVerts[1][0] == -100) {
      shipVerts[0][0] = -99;
      shipVerts[1][0] = -99;
      moveLeft = false;
    } else if (shipVerts[2][0] == 100 || shipVerts[3][0] == 100) {
      shipVerts[0][0] = 59;
      shipVerts[1][0] = 59;
      shipVerts[2][0] = 99;
      shipVerts[3][0] = 99;
      moveRight = false;
    }
  } // move the laser reference position left and right with the ship
  for (var i = 0; i < 4; i++) {
    if (moveLeft && laser[0][0] >= -82.5 && laser[2][0] >= -82.5) {
      if (!shoot)
        laser[i][0] -= 1;
      laserRef[i][0] -= 1;
    } else if (moveRight && laser[1][0] <= 82.5 && laser[3][0] <= 82.5) {
      if (!shoot)
        laser[i][0] += 1;
      laserRef[i][0] += 1;
    }
  }
}

function shootLaser() {

  for (var i = 0; i < 4; i++) {
    // fire the laser upwards when shot
    if (shoot && laser[i][1] <= 300) {
      laser[i][1] += 7;
      if (!hit)
        laser[i][2] = s_slope(laser[i][1]);
    } else
      returnLaser();
    // and check if the laser hits any aliens
    for (var j = 0; j < 15; j++) {
      var a = j * 4;
      if (laser[2][1] >= alienVerts[a][1] && laser[2][1] <= alienVerts[a + 3][1] &&
        (laser[1][0] >= alienVerts[a][0] && laser[0][0] <= alienVerts[a + 3][0]) &&
        alienVerts[a][2] > -25 && laser[0][2] > -25) {
        for (var k = 0; k < 4; k++) {
          hit = true;
          alienVerts[a + k][2] -= 50;
          laser[k][2] -= 50;
        }
      }
    }
  }
}

function returnLaser() {
  for (var i = 0; i < 4; i++) {
    laser[i][0] = laserRef[i][0];
    laser[i][1] = laserRef[i][1];
    laser[i][2] = laserRef[i][2];
    shoot = false;
    hit = false;
  }
}
