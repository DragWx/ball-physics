/* Copyright (C) 2023 DragWx <https://github.com/DragWx> */

window.onload = init;

var gamescreen;
var canvas;
var context;
var inputMap = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyZ", "KeyX"];
var keyState = [false, false, false, false, false, false, false];
var keySingle = [false, false, false, false, false, false, false];

var fpsLimit = 1000/60.0;
var fpsDisplay = true;
var fpsCountA = 0;
var fpsCountB = 0;
var fpsAvg = fpsLimit;
var fpsDom;

function keydownhandler(e) {
    if (!e.repeat) {
        var i = inputMap.indexOf(e.code);
        keyState[i] = true;
        keySingle[i] = true;
    }
}

function keyuphandler(e) {
    var i = inputMap.indexOf(e.code);
    keyState[i] = false;
}

function flushkeys() {
	for (var i = 0; i < keySingle.length; i++) {
		keySingle[i] = false;
	}
}

function init() {
	document.onkeydown = keydownhandler;
	document.onkeyup = keyuphandler;
	fpsDom = document.getElementById('footer');
    gamescreen = document.getElementById("gamescreen");
    gamescreen.innerHTML = "";

    canvas = document.createElement("canvas");
    canvas.id = "gamecanvas";
    canvas.width = 320;
    canvas.height = 240;

    context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0,0,320,240);
    context.fillStyle = "#FFF";
    context.fillRect(159,119,3,3);
    context.fillStyle = "#000";
    context.fillRect(160,120,1,1);

    gamescreen.appendChild(canvas);

	if (fpsDisplay) {
		fpsDom.style.display = "block";
		fpsCountA = Date.now();
	}
    loadLevel();
    doNextFrame();
}

var nextFrame = 0;
function doNextFrame() {
    window.requestAnimationFrame(doNextFrame);
    // FPS throttling.
    var currFrame = Date.now();
    if (currFrame >= nextFrame) {
		// Increase the timestamp for the next frame. If after doing that, the current timestamp
		// is still larger, then just drop the frames rather than fast forward to catch up.
		if (currFrame >= (nextFrame += fpsLimit)) {
            nextFrame = currFrame + fpsLimit;
        }
		// If enabled, calculate the game's FPS by comparing the timestamps and converting
		// ms into hz
		if (fpsDisplay) {
			fpsCountB = fpsCountA;
			fpsCountA = currFrame;
			fpsAvg = (fpsAvg * 0.75) + ((fpsCountA - fpsCountB) * 0.25);
			fpsDom.innerHTML = Math.round(1000/fpsAvg) + " fps";
		}
        // Update the game logic by one frame.
        game_update();
        // Clear out the single-keypress array
        flushkeys();
    }
}
var layout = [
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0, 25,  0,  0,  0, 24,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0, 23, 23, 23,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0, 23, 23, 23,  0,  0,  0,  0,  0,  2,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 17,  0, 18,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  8, 21, 22,  4,  0,  8,  0,  6, 10,  0, 18,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  1,  1,  0,  0,  8,  0,  0,  0,  0,  0, 18,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1, 20, 18,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
];
var tilePoints = [
    // Inward-facing boundaries: 8-Right, 4-Left, 2-Bottom, 1-Top 
    [],
    [[16,0],[0,0],null],
    [[0,16],[16,16],null],
    [[16,0],[0,0],null,[0,16],[16,16],null],
    [[0,0],[0,16],null],
    [[16,0],[0,0],[0,16],null],
    [[0,0],[0,16],[16,16],null],
    [[16,0],[0,0],[0,16],[16,16],null],
    [[16,16],[16,0],null],
    [[16,16],[16,0],[0,0],null],
    [[0,16],[16,16],[16,0],null],
    [[0,16],[16,16],[16,0],[0,0],null],
    [[0,0],[0,16],null,[16,16],[16,0],null],
    [[16,16],[16,0],[0,0],[0,16],null],
    [[0,0],[0,16],[16,16],[16,0],null],
    [[0,0],[0,16],[16,16],[16,0]],

    [[0,0],[16,0],[16,16],[0,16]],  // Square block
    [[0,16],[16,0],null],           // / floor
    [[0,0],[16,16],null],           // \ floor
    [[16,0],[0,16],null],           // / ceiling
    [[16,16],[0,0],null],           // \ ceiling
    [[0,0],[8,8],[16,0],null],
    [[0,0],[8,12],[16,0],null],
    [[2,4],null,[6,12],null,[10,4],null,[14,12],null], // Pegs
    [[-.5,15.5],[15.5,-0.5],null,[16.5,.5],[.5,16.5],null],  // / rail
    [[.5,-.5],[16.5,15.5],null,[15.5,16.5],[-.5,.5],null]   // \ rail
];
//UL, UR, DL, DR
// e.g., UL = only boundaries with an UP component and/or a LEFT component.
var tilePointsSorted = [
    [[],[],[],[]],
    [
        [[0,16], [0,0],  [16,0]],
        [[0,0],  [16,0], [16,16]],
        [[16,16],[0,16], [0,0]],
        [[16,0], [16,16],[0,16]]
    ],
    [
        [[0,16], [16,0]],
        [[0,16], [16,0], [16,16]],
        [[16,16],[0,16], [16,0]],
        [[16,0], [16,16],[0,16]]
    ],
    [
        [[0,16], [0,0],  [16,16]],
        [[0,0],  [16,16]],
        [[16,16],[0,16], [0,0]],
        [[0,0],  [16,16],[0,16]]
    ]
];
function loadLevel() {
    // Compile tilePoints into the various sorted versions we need.

    // The way this works is, each tile has four versions:
    // - All segments facing up/left
    // - All segments facing up/right
    // - All segments facing down/left
    // - All segments facing down/right

    // We go through all vertices and add each line segment to whichever
    // quadrants it faces.

    // When there's a lone vertex, it's treated like a peg and is added to
    // all quadrants.

    // A "null" vertex marks the end of a continuous shape. The last vertex is
    // assumed to connect to the first vertex.

    tilePointsSorted = [];
    for (let currTile of tilePoints) {
        // Playable space is defined counter clockwise.
        // Left->Right = Boundary faces upwards.
        // Up->Down = Boundary faces rightwards.

        let quadrants = [[],[],[],[]];
        let isFirstVertex = true;
        if (currTile.length > 1) {
            let j = 0;
            for (let i = 0; i < currTile.length; i++) {
                if (++j >= currTile.length) {
                    j = 0;
                }
                let hasQuadrant = [false, false, false, false];
                if ((currTile[i] !== null) && (currTile[j] !== null)) {
                    // A and B are vertices.
                    // NOTE: If A and B are the same vertex, it registers as
                    // there being nothing.

                    // Start point
                    let Ax = currTile[i][0];
                    let Ay = currTile[i][1];
                    // End point
                    let Bx = currTile[j][0];
                    let By = currTile[j][1];
                    
                    let hasUp = Ax < Bx;        // Left to right
                    let hasDown = Bx < Ax;      // Right to left
                    let hasLeft = By < Ay;      // Bottom to top
                    let hasRight = Ay < By;     // Top to bottom

                    hasQuadrant = [
                        hasUp || hasLeft,
                        hasUp || hasRight,
                        hasDown || hasLeft,
                        hasDown || hasRight
                    ];

                    isFirstVertex = false;
                } else if (currTile[i] === null) {
                    // A is null, B is vertex or null.
                    isFirstVertex = true;
                } else if (currTile[j] === null) {
                    // A is vertex, B is null.
                    if (isFirstVertex) {
                        // Not the end of a line, interpret as a point.
                        hasQuadrant = [true, true, true, true];
                    }
                }
                
                // Add the current vertex (and sometimes the preceeding one too)
                // to whichever quadrants it belongs to.
                for (let currQuad = 0; currQuad < 4; currQuad++) {
                    if (hasQuadrant[currQuad]) {
                        // Boundary belongs to the quadrant.
                        if ((quadrants[currQuad].length == 0) || (quadrants[currQuad][quadrants[currQuad].length-1] == null)) {
                            // Starting a new group of boundaries, need to include
                            // the first vertex.
                            quadrants[currQuad].push(i);
                        }
                        // Add second vertex of boundary, which might be null if
                        // boundary is a single point.
                        quadrants[currQuad].push(j);
                    } else {
                        // Boundary does not belong to the quadrant.
                        if ((quadrants[currQuad].length > 0) && (quadrants[currQuad][quadrants[currQuad].length-1] != null)) {
                            // Add a marker to indicate a gap.
                            quadrants[currQuad].push(null);
                        }    
                    }
                }
            }
        }

        // Clean up the data and convert it to coordinates, from indices.

        for (let i = 0; i < 4; i++) {
            // Remove any trailing gap.
            if (quadrants[i].length > 0 && (quadrants[i][quadrants[i].length-1] == null)) {
                quadrants[i].pop();
            }
            // One optimization we can do is, locate the position of a gap,
            // then shift it out of the array.
            let gap = quadrants[i].indexOf(null);
            if (gap != -1) {
                let halfA = quadrants[i].slice(0, gap);
                let halfB = quadrants[i].slice(gap+1, quadrants[i].length);
                if ((halfA.length > 0) && (halfB.length > 0)) {
                    if (halfB[halfB.length-1] == halfA[0]) {
                        // If the first and last vertex are the same, join them.
                        halfB.pop();
                    } else {
                        // If the first and last vertex are different, put a
                        // gap between them.
                        halfB.push(null);
                    }
                }
                quadrants[i] = [...halfB, ...halfA];
            }
            // Convert the arrays into coordinates, since right now they only
            // contain indices.
            quadrants[i] = quadrants[i].map(x => x == null ? null : currTile[x]);
        }
        tilePointsSorted.push(quadrants);
    }
}

var playerX = 160;
var playerY = 120;
var playerXSpeed = 0;
var playerYSpeed = 0;
var playerSize = 4;

var playerA = 0;
var playerASpeed = 0;

var drawCollisionDebug = 2;
function game_update() {
    // Air resistance or playfield friction, depending on how you want to
    // look at it.
    playerYSpeed *= 0.99;
    playerXSpeed *= 0.99;
    playerASpeed *= 0.99;

    // Gravity or fally-downy speed, depending on how you want to look at it.
    playerYSpeed += 0.05;

    // Arrow keys for thrust-like control.
    if (keyState[0]) {
        playerYSpeed -= 0.1;
    } else if (keyState[1]) {
        playerYSpeed += 0.1;
    }
    if (keyState[2]) {
        playerXSpeed -= 0.06;
    } else if (keyState[3]) {
        playerXSpeed += 0.06;
    }

    // Hold space to stop and hold the ball.
    if (keyState[4]) {
        playerYSpeed = 0;
        playerXSpeed = 0;
    }

    // Move the ball based on velocity.
    playerY += playerYSpeed;
    playerX += playerXSpeed;
    playerA += playerASpeed;

    // Collide with the edges of the screen. They're frictionless.
    if (playerY > 240-playerSize) {
        playerY = 240-playerSize;
        if ((playerYSpeed > 0) && (playerYSpeed < 0.5)) {
            playerYSpeed = 0;
        } else {
            playerYSpeed *= -0.6;
        }
    } else if (playerY < playerSize) {
        playerY = playerSize;
        if ((playerYSpeed < 0) && (playerYSpeed > -0.5)) {
            playerYSpeed = 0;
        } else {
            playerYSpeed *= -0.6;
        }
    }
    if (playerX > 320-playerSize) {
        playerX = 320-playerSize;
        if ((playerXSpeed > 0) && (playerXSpeed < 0.5)) {
            playerXSpeed = 0;
        } else {
            playerXSpeed *= -0.6;
        }
    } else if (playerX < playerSize) {
        playerX = playerSize;
        if ((playerXSpeed < 0) && (playerXSpeed > -0.5)) {
            playerXSpeed = 0;
        } else {
            playerXSpeed *= -0.6;
        }
    }

    // Clear the screen to get ready for drawing on it.
    context.fillStyle = "#000";
    context.fillRect(0,0,320,240);

    // Draw the player in the collision visualization.
    if (drawCollisionDebug > 0) {
        context.strokeStyle = "#48F";
        context.beginPath();
        context.arc(32.5,32.5,playerSize,0,Math.PI*2);
        context.closePath();
        context.stroke();
        
        context.strokeStyle = "#48F";
        context.beginPath();
        context.moveTo(32.5 - (playerSize * Math.sin(playerA)), 32.5 - (playerSize * Math.cos(playerA)));
        context.lineTo(32.5, 32.5);
        context.stroke();
    }

    // Collision detection vs tilemap. Each tile has four definitions: a list
    // of vertices for boundaries facing up/left, up/right, down/right, down/left.

    // If the ball is travelling down and right, check adjacent tiles down and
    // to the right, and within those tiles, check all boundaries that face
    // up and left. Vertices are counter-clockwise, so up-facing walls are
    // left-to-right, down-facing walls are right-to-left.

    // If we do it this way, then it's easy to tell which side of the boundary
    // we're supposed to be on, no matter how that boundary intersects the ball.

    // Direction quadrant. We'll use this for which subset of tile points we want.
    // 0: Moving down and right
    // 1: Moving down and left
    // 2: Moving up and right
    // 3: Moving up and left
    let dirIsDown = playerYSpeed >= 0;
    let dirIsRight = playerXSpeed >= 0;
    let dirQuad = (dirIsRight ? 0 : 1) + (dirIsDown ? 0 : 2);

    // The center of the player is (0,0), so translate all of the boundaries
    // relative to that.
    let offsetX = -(playerX - playerSize) % 16;
    let offsetY = -(playerY - playerSize) % 16;

    // Calculate the bounding box edges of the player.
    let cTop = (playerY - playerSize) | 0;
    let cBot = (playerY + playerSize) | 0;
    let cLef = (playerX - playerSize) | 0;
    let cRig = (playerX + playerSize) | 0;

    // All vertices which need to be checked for collision.
    let segments = [];

    // Go through every single tile currently overlapping the player's bounding
    // box, and collect the line segments (and points) which face opposite the
    // player's movement direction (simplifies things for later).
    let tileOffsetY = offsetY - playerSize;
    let prevCheckY = -1;
    for (let currY = cTop; ; currY += 16) {
        // Start at the top and go down in increments of the tile height.
        if (currY > cBot) {
            // Make sure we include tiles specifically touching the bottom edge,
            // but only if that wasn't already the last row we checked.
            currY = cBot;
            if ((currY / 16 | 0) == prevCheckY) {
                break;
            }
        }

        let tileOffsetX = offsetX - playerSize;
        let prevCheckX = -1;
        for (let currX = cLef; ; currX += 16) {
            // Start at the left and go right in increments of the tile width.
            if (currX > cRig) {
                // Make sure we include the tile specifically touching the right
                // edge, but only if we didn't already check it.
                currX = cRig;
                if ((currX / 16 | 0) == prevCheckX) {
                    break;
                }
            }
            if ((currX >= 0) && (currX < 320) && (currY >= 0) && (currY < 240)) {
                // Don't try to check tiles outside of the tilemap, because
                // that's scary unknown space that probably warps us to the
                // credits or something.

                // Go get the tile's vertices (the ones facing the way we want),
                // translate them relative to the player (0,0), group each
                // continuous shape into a "segment", then add each segment to
                // the list of stuff we check collisions against.
                let currTile = layout[currY / 16 | 0][currX / 16 | 0];
                if (currTile) {
                    let newSegment = [];
                    for (let currCoord of tilePointsSorted[currTile][dirQuad]) {
                        if (currCoord != null) {
                            // Add the vertex to the current segment.
                            newSegment.push([currCoord[0] + tileOffsetX, currCoord[1] + tileOffsetY]);
                        } else {
                            if (newSegment.length > 0) {
                                // The current vertex is a break, so end the
                                // current segment and start a new one.
                                segments.push(newSegment);
                                newSegment = [];
                            }
                        }
                    }
                    // End of vertices, end the current segment.
                    if (newSegment.length > 0) {
                        segments.push(newSegment);
                    }
                }
            }
            // Remember which tile we just checked so we don't recheck it when
            // we go past the player's right edge.
            prevCheckX = currX / 16 | 0;
            if (currX == cRig) {
                break;
            }
            tileOffsetX += 16;
        }
        // Remember which row we just checked so we don't recheck it when we
        // go past the player's bottom edge.
        prevCheckY = currY / 16 | 0;
        if (currY == cBot) {
            break;
        }
        tileOffsetY += 16;
    }

    // For the collision visualization, draw all of the lines and points we're
    // going to check.
    if (drawCollisionDebug >= 1) {
        context.strokeStyle = "#FFF";
        for (let segment of segments) {
            context.beginPath();
            for (let i = 0; i < segment.length; i++) {
                if (i == 0) {
                    if (segment.length == 1) {
                        // Drawing a point.
                        context.arc(segment[i][0] + 32.5, segment[i][1] + 32.5, 0.5, 0, Math.PI * 2);
                    } else {
                        // Beginning of a line.
                        context.moveTo(segment[i][0] + 32.5, segment[i][1] + 32.5);
                    }
                } else {
                    // Next vertex of current line.
                    context.lineTo(segment[i][0] + 32.5, segment[i][1] + 32.5);
                }
            }
            context.stroke();
        }
    }

    // For each boundary (Ax,Ay)->(Bx,By), project the current position
    // of the player (Px,Py) onto it.
    // Find the unit vector N of A->B, then dot(P-A, N) = C.
    // If the distance between P and C is less than the ball's radius, then
    // the ball is colliding with that boundary.

    let NCx = 0;    // Nearest collision point X
    let NCy = 0;    // Nearest collision point Y
    let NPCx = 0;   // P->C Vector[x] for nearest collision point
    let NPCy = 0;   // P->C Vector[y] for nearest collision point
    let NABx = 0;   // A->B Vector[x] for surface collision point lies on
    let NABy = 0;   // A->B Vector[y] for surface collision point lies on
    let Ndist = Infinity;   // The distance to the player the nearest collision point is

    for (let currSegment of segments) {
        if (currSegment.length > 1) {
            for (let i = 0; i < currSegment.length - 1; i++) {
                // Endpoints A->B of boundary
                let Ax = currSegment[i][0];
                let Ay = currSegment[i][1];
                let Bx = currSegment[i+1][0];
                let By = currSegment[i+1][1];
                // Vectors A->B and A->P
                let ABx = Bx - Ax;
                let ABy = By - Ay;
                let APx = 0 - Ax;
                let APy = 0 - Ay;
                // Player's position on A->B, as a percentage.
                // This is (AP . AB) / (AB . AB)
                let p = (APx*ABx + APy*ABy) / (ABx*ABx + ABy*ABy);
                let isPoint = false;
                // Clip percentage to [0..1].
                // When we clip, treat it as a point. If we hit 0 or 1 exactly,
                // treat it as part of the line.
                if (p < 0) {
                    p = 0;
                    isPoint = true;
                } else if (p > 1) {
                    p = 1;
                    isPoint = true;
                }
                // The nearest point to the player on the current boundary.
                let Cx = p*Bx + (1-p)*Ax;
                let Cy = p*By + (1-p)*Ay;
                let PCx = Cx - 0;
                let PCy = Cy - 0;
                // Distance between player and point on boundary.
                let PCdist = Math.sqrt(PCx*PCx + PCy*PCy);
                if (PCdist <= playerSize) {
                    // Player is colliding with a collision point.
                    if (PCdist < Ndist) {
                        NCx = Cx;
                        NCy = Cy;
                        NPCx = PCx;
                        NPCy = PCy;
                        // If isPoint && (PCdist == 0), then I think the player's
                        // movement vector (rotated 90 degrees CCW) can be used
                        // as NAB, because for the player to exactly end up on
                        // a point C (instead of a surface C), the player had to
                        // have been aimed directly at it, and a bounce is a
                        // perfect reversal of that direction.
                        if (isPoint) {
                            // If the closest point is only a corner and not
                            // a point on the line, the boundary is perpendicular
                            // to P and C, pointing towards P.
                            // Without this, the "bounce in wrong direction"
                            // fixer doesn't like sharp points.
                            NABx = NPCy;
                            NABy = -NPCx;
                        } else {
                            NABx = ABx;
                            NABy = ABy;
                        }
                        Ndist = PCdist;
                        // NOTE: This sometimes chooses the wrong boundary
                        // if it's really far behind the player's direction.
                        // The bounce will still be correct, but the ejection
                        // may not be. Imagine a "T" shaped boundary and the
                        // ball is dropping directly down the center.

                        // TODO: May need to take more care when defining the
                        // layout to avoid these kinds of seams, or maybe
                        // some kind of algorithm to cull them?
                    }
                    // On the collision visualizer, highlight all boundaries
                    // we're colliding with.
                    if (drawCollisionDebug >= 2) {
                        context.strokeStyle = "#F00";
                        context.beginPath();
                        context.moveTo(Ax + 32.5, Ay + 32.5);
                        context.lineTo(Bx + 32.5, By + 32.5);
                        context.stroke();
                    }
                }
            }
        } else if (currSegment.length == 1) {
            //Point collision, mostly copied from boundary collision.
            let Cx = currSegment[0][0];
            let Cy = currSegment[0][1];
            let PCx = Cx - 0;
            let PCy = Cy - 0;
            let PCdist = Math.sqrt(PCx*PCx + PCy*PCy);
            if (PCdist <= playerSize) {
                if (PCdist < Ndist) {
                    NCx = Cx;
                    NCy = Cy;
                    NPCx = PCx;
                    NPCy = PCy;

                    NABx = NPCy;
                    NABy = -NPCx;
                    Ndist = PCdist;
                }
                // On the collision visualizer, highlight all of the simple
                // points we're colliding with. (We mostly won't see them)
                if (drawCollisionDebug >= 2) {
                    context.strokeStyle = "#F00";
                    context.beginPath();
                    context.arc(Cx + 32.5, Cy + 32.5, 0.5, 0, Math.PI * 2);
                    context.stroke();
                }
            }
        }
    }
    
    if (Ndist != Infinity) {
        // Time to collide with the boundary and bounce the ball off of it!
        // (Oh boy!)

        // Unit vector pointing from the player, towards collision point C
        let dirX = 0;
        let dirY = 0;
        if (Ndist != 0) {
            dirX = NPCx / Ndist;
            dirY = NPCy / Ndist;
        } else {
            // C is literally overtop of the player, so that's awkward.
            // If C comes from a single point, use the player's movement direction.
            // Otherwise, use the normal of the boundary.
            let ABlen = Math.sqrt(NABx*NABx + NABy*NABy);
            dirX = -NABy / ABlen;
            dirY = NABx / ABlen;
        }

        // "dir" will usually point into the boundary. If it points *out* from
        // the boundary, then the player's travelling so fast that they've
        // passed more than halfway through the wall and will get ejected/bounced
        // in the wrong direction.

        // To calculate the boundary's normal, take AB, invert X, then swap X/Y.
        // (We rotate AB by 90 degrees CCW and just assume that points outward)
        // Then, dot it with "dir". If both are pointing the same way (>=0),
        // flip the dir 180 degrees.
        if (NABy*dirX + (-NABx)*dirY > 0) {
            dirX = -dirX;
            dirY = -dirY;
        }

        // Eject the player by observing where the player's edge would
        // tangent the collision point, and adjusting until we get there.
        playerX -= (dirX * playerSize) - NCx;
        playerY -= (dirY * playerSize) - NCy; 

        let newXSpeed = 0;
        let newYSpeed = 0;

        // Project the player's current X,Y momentum onto dirX,dirY.
        // Invert (and dampen) the player's velocity on the collision axis.
        let dot = playerXSpeed * dirX + playerYSpeed * dirY;
        newXSpeed -= dot * dirX * 0.6;
        newYSpeed -= dot * dirY * 0.6;
        // First, stop the player.
        //playerYSpeed -= dot * dirY;
        //playerXSpeed -= dot * dirX;
        // Now bounce the player.
        //playerYSpeed -= dot * dirY * 0.6;
        //playerXSpeed -= dot * dirX * 0.6;

        // Now apply surface friction to the player's cross-axis.
        dot = playerXSpeed * dirY + playerYSpeed * -dirX;
        newXSpeed += dot * dirY * 0.98;
        newYSpeed += dot * -dirX * 0.98;
        playerASpeed = (-dot  / playerSize) * 0.98;
        // First, stop the player.
        //playerXSpeed -= dot * dirY;
        //playerYSpeed -= dot * -dirX;
        // Now add dampened movement.
        //playerXSpeed += dot * dirY * 0.95;
        //playerYSpeed += dot * -dirX * 0.95;

        playerXSpeed = newXSpeed;
        playerYSpeed = newYSpeed;

        // On the collision visualizer, draw a dot to show where the collision
        // point is.
        if (drawCollisionDebug >= 2) {            
            context.fillStyle = "#FFF";
            context.beginPath();
            context.arc(NCx + 32.5,NCy + 32.5,1.5,0,Math.PI*2);
            context.fill();
        }
    }

    // Draw the layout.
    for (let y = 0; y < layout.length; y++) {
        let drawY = y * 16;
        for (let x = 0; x < layout[y].length; x++) {
            let drawX = x * 16;
            let currTile = layout[y][x];
            if (currTile) {
                let currTilePoints = tilePoints[currTile];
                context.strokeStyle = "#FFF";
                context.lineWidth = 1;
                context.beginPath();
                let gap = true;
                let point = false;
                for (var i = 0; i <= currTilePoints.length; i++) {
                    let j = (i == currTilePoints.length) ? 0 : i;
                    if (currTilePoints[j] == null) {
                        gap = true;
                        if (point) {
                            context.arc(point[0], point[1], 0.5, 0, Math.PI * 2);
                        }
                        continue;
                    }
                    if (gap) {
                        context.moveTo(drawX + currTilePoints[j][0] + 0.5, drawY + currTilePoints[j][1] + 0.5);
                        gap = false;
                        point = [drawX + currTilePoints[j][0] + 0.5, drawY + currTilePoints[j][1] + 0.5];
                    } else {
                        context.lineTo(drawX + currTilePoints[j][0] + 0.5, drawY + currTilePoints[j][1] + 0.5);
                        point = false;
                    }
                }
                context.stroke();
            }
        }
    }

    // Draw Player
    context.fillStyle = "#48F";
    context.beginPath();
    context.arc(playerX + 0.5,playerY + 0.5,playerSize,0,2 * Math.PI);
    context.fill()
    
    // Draw a checker to show rotation. Or, is it an hourglass?
    context.fillStyle = "#048";
    context.beginPath();
    context.moveTo(playerX + 0.5, playerY + 0.5);
    context.arc(playerX + 0.5,playerY + 0.5,playerSize,-playerA,(Math.PI / 2) - playerA);
    context.moveTo(playerX + 0.5, playerY + 0.5);
    context.arc(playerX + 0.5,playerY + 0.5,playerSize,-playerA - Math.PI,(Math.PI / 2) - playerA - Math.PI);
    context.fill()
}
