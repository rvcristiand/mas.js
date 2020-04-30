// global variables
var scene;
var camera;
var renderer, labelRenderer;

var canvas = document.getElementById( "canvas" );
var canvasLabels = document.getElementById( "labels" );

var stats, gui;

var controls;

var config;

var plane;

var joints, jointMaterial, jointGeometry;
var frames, frameMaterial;

var joints_name = new Set();
var joints_coordinate = [];

var frames_name = new Set();
var frames_joints = [];

function init() {
  // load the json config
  loadJSON("./config.json")
    .then(function ( json ) {
      // set the config
      config = json.remembered[json.preset]["0"];

      // set the background
      canvas.style.backgroundColor = config.topBackgroundColor;
      canvas.style.backgroundImage = 
        "linear-gradient(" +
        config.topBackgroundColor +
        ", " +
        config.bottomBackgroundColor +
        ")";

      // create the scene
      scene = new THREE.Scene();

      // create the camera
      camera = new THREE.PerspectiveCamera(
        config.perspectiveCameraFOV,
        window.innerWidth / window.innerHeight,
        config.perspectiveCameraNear,
        config.perspectiveCameraFar
      );
      // set 'position'
      camera.position.set(
        config.cameraPosition_x,
        config.cameraPosition_y,
        config.cameraPosition_z
      );
      // set orientation
      setCameraOrientation( config.axisUpwards );
      
      // create the plane
      plane = createPlane();
      // set orientation
      setPlaneOrientation( config.axisUpwards );
 
      // add the plane to the scene
      scene.add( plane );

      // show axes in the screen
      var axes = new THREE.AxesHelper();
      scene.add( axes );

      // set the joints
      joints = new THREE.Object3D();
      // set the geometry
      jointGeometry = new THREE.SphereGeometry( 1, 32, 32 );
      // set the material
      jointMaterial = new THREE.MeshBasicMaterial({ color: config.jointColor });
      // add to the scene
      scene.add( joints );

      // set the frames
      frames = new THREE.Object3D();
      // set the material
      frameMaterial = new THREE.MeshBasicMaterial({ color: config.frameColor });
      // add to the scene
      scene.add( frames );

      // create the stats
      stats = initStats();

      // create the WebGL renderer
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
      // set pixel ratio
      renderer.setPixelRatio( window.devicePixelRatio );
      // set the size
      renderer.setSize( canvas.clientWidth, canvas.clientHeight );

      // create the CSS2D renderer
      labelRenderer = new THREE.CSS2DRenderer();
      labelRenderer.setSize( canvasLabels.clientWidth, canvasLabels.clientHeight );
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = 0;
      canvasLabels.appendChild( labelRenderer.domElement );

      // create the controls
      controls = createControls();

      return json;
    })
    .then(function ( json ) {
      // create the dat gui
      gui = new dat.GUI({ load: json, preset: json.preset });

      // close gui
      gui.close();

      // remember config
      gui.remember( config );

      // add a Background folder
      let backgroundFolder = gui.addFolder( "Background" );
      backgroundFolder.open();

      // set control topBackgroundColor
      let topBackgroundColorController = backgroundFolder.addColor(
        config,
        "topBackgroundColor"
      );
      topBackgroundColorController.name( "Top color" );
      topBackgroundColorController.onChange(function ( topBackgroundColor ) {
        // set the background
        canvas.style.backgroundColor = config.topBackgroundColor;
        canvas.style.backgroundImage =
          "linear-gradient(" +
          config.topBackgroundColor +
          ", " +
          config.bottomBackgroundColor +
          ")";
      });

      // set control bottomBackgroundColor
      let bottomBackgroundColorController = backgroundFolder.addColor(
        config,
        "bottomBackgroundColor"
      );
      bottomBackgroundColorController.name( "Bottom color" );
      bottomBackgroundColorController.onChange(function ( bottomBackgroundColor ) {
        // set the background
        canvas.style.backgroundColor = config.topBackgroundColor;
        canvas.style.backgroundImage =
          "linear-gradient(" +
          config.topBackgroundColor +
          ", " +
          config.bottomBackgroundColor +
          ")";
      });

      // add a Camera folder
      let cameraFolder = gui.addFolder( "Camera" );
      cameraFolder.open();

      // set control FOV
      let cameraFOVController = cameraFolder
        .add( config, "cameraFOV" )
        .min( 45 )
        .max( 90 )
        .step( 1 );
      cameraFOVController.name( "FOV" );
      cameraFOVController.onChange(function ( fov ) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      });
      // set control near
      let cameraNearController = cameraFolder
        .add( config, "cameraNear" )
        .min( 0.01 )
        .max( 1 )
        .step( 0.01 );
      cameraNearController.name( "Near" );
      cameraNearController.onChange(function ( near ) {
        camera.near = near;
        camera.updateProjectionMatrix();
      });
      // set control far
      let cameraFarController = cameraFolder
        .add( config, "cameraFar" )
        .min( 100 )
        .max( 10000 )
        .step( 100 );
      cameraFarController.name( "Far" );
      cameraFarController.onChange(function ( far ) {
        camera.far = far;
        camera.updateProjectionMatrix();
      });

      // add a cameraPosition folder
      let cameraPositionFolder = cameraFolder.addFolder( "Position" );

      // set control cameraPosition_x
      let cameraPosition_xController = cameraPositionFolder
        .add( config, "cameraPosition_x" )
        .min( -100 )
        .max( 100 )
        .step( 1 );
      cameraPosition_xController.name( "x" );
      cameraPosition_xController.onChange(function ( cameraPosition_x ) {
        // save the lookAt
        var lookAtVector = new THREE.Vector3();
        camera.getWorldDirection( lookAtVector );
        // set the position
        camera.position.set(
          config.cameraPosition_x,
          config.cameraPosition_y,
          config.cameraPosition_z
        );
        // set the look at
        camera.lookAt( lookAtVector );
      });

      // set control cameraPosition_y
      let cameraPosition_yController = cameraPositionFolder
        .add( config, "cameraPosition_y" )
        .min( -100 )
        .max( 100 )
        .step( 1 );
      cameraPosition_yController.name( "y" );
      cameraPosition_yController.onChange(function ( cameraPosition_y ) {
        // save the lookAt
        var lookAtVector = new THREE.Vector3();
        camera.getWorldDirection( lookAtVector );
        // set the position
        camera.position.set(
          config.cameraPosition_x,
          config.cameraPosition_y,
          config.cameraPosition_z
        );
        // set the look at
        camera.lookAt( lookAtVector );
      });

      // set control cameraPosition_z
      let cameraPosition_zController = cameraPositionFolder
        .add( config, "cameraPosition_z" )
        .min( -100 )
        .max( 100 )
        .step( 1 );
      cameraPosition_zController.name( "z" );
      cameraPosition_zController.onChange(function ( cameraPosition_z ) {
        // save the lookAt
        var lookAtVector = new THREE.Vector3();
        camera.getWorldDirection( lookAtVector );
        // set the position
        camera.position.set(
          config.cameraPosition_x,
          config.cameraPosition_y,
          config.cameraPosition_z
        );
        // set the look at
        camera.lookAt( lookAtVector );
      });

      // set control axisUpwards
      let axisUpwardsController = cameraFolder
        .add( config, "axisUpwards" )
        .options( ["x", "y", "z"] );
      axisUpwardsController.name( "Upwards axis" );
      axisUpwardsController.onChange(function ( axisUpwards ) {
        setUpwardsAxis( axisUpwards );
      });

      // add a Trackball controls folder
      let controlsFolder = gui.addFolder( "Trackball controls" );
      controlsFolder.open();

      // set control rotateSpeed
      let rotateSpeedController = controlsFolder
        .add( config, "rotateSpeed" )
        .min( 0.1 )
        .max( 10 )
        .step( 0.1 );
      rotateSpeedController.name( "Rotate speed" );
      rotateSpeedController.onFinishChange(function ( rotateSpeed ) {
        controls.rotateSpeed = rotateSpeed;
      });

      // set control zoomSpeed
      let zoomSpeedController = controlsFolder
        .add( config, "zoomSpeed" )
        .min( 0.12 )
        .max( 12 )
        .step( 0.12 );
      zoomSpeedController.name( "Zoom speed" );
      zoomSpeedController.onFinishChange(function ( zoomSpeed ) {
        controls.zoomSpeed = zoomSpeed;
      });

      // set control panSpeed
      let panSpeedController = controlsFolder
        .add( config, "panSpeed" )
        .min( 0.03 )
        .max( 3 )
        .step( 0.03 );
      panSpeedController.name( "Pan speed" );
      panSpeedController.onFinishChange(function ( panSpeed ) {
        controls.panSpeed = panSpeed;
      });

      // set control staticMoving
      // let staticMovingController = trackbackControlsFolder.add(
      //   config,
      //   "staticMoving"
      // );
      // staticMovingController.name("Static moving");
      // staticMovingController.onFinishChange(function (staticMoving) {
      //   trackballControls.staticMoving = staticMoving;
      // });

      // add a Plane folder
      let planeFolder = gui.addFolder( "Plane" );
      planeFolder.open();

      // set control planeSize
      let planeSizeController = planeFolder
        .add( config, "planeSize" )
        .min( 1 )
        .max( 100 )
        .step( 1 );
      planeSizeController.name( "Size" );
      planeSizeController.onChange(function () {
        // update the plane
        updatePlane();
      });

      // set control planeDivisions
      let planeDivisions = planeFolder
        .add( config, "planeDivisions" )
        .min( 0 )
        .max( 100 )
        .step( 5 );
      planeDivisions.name( "Divisions" );
      planeDivisions.onChange(function () {
        // update the plane
        updatePlane();
      });

      // add a Color folder
      let planeColorsFolder = planeFolder.addFolder( "Colors" );

      // set control planeColor
      let planeColorController = planeColorsFolder.addColor(
        config,
        "planeColor"
      );
      planeColorController.name( "Plane" );
      planeColorController.onChange(function () {
        // update the plane
        updatePlane();
      });

      // set control planeColorCenterLine
      let planeColorCenterLineController = planeColorsFolder.addColor(
        config,
        "planeColorCenterLine"
      );
      planeColorCenterLineController.name( "Center line" );
      planeColorCenterLineController.onChange(function () {
        // update the plane
        updatePlane();
      });

      // set control planeTransparent
      let planeTransparentController = planeFolder.add(
        config,
        "planeTransparent"
      );
      planeTransparentController.name( "Transparent" );
      planeTransparentController.onChange(function ( transparent ) {
        plane.children[1].material.transparent = transparent;
      });

      // set control planeOpacity
      let planeOpacityController = planeFolder
        .add( config, "planeOpacity" )
        .min( 0 )
        .max( 1 )
        .step( 0.01 );
      planeOpacityController.name( "Opacity" );
      planeOpacityController.onChange(function ( opacity ) {
        // update the plane
        updatePlane();
      });

      // add a Joint folder
      let jointFolder = gui.addFolder( "Joints" );
      jointFolder.open();

      // set control joint size
      let jointSizeController = jointFolder
        .add( config, "jointSize" )
        .min( 0.01 )
        .max( 1 )
        .step( 0.01 );
      jointSizeController.name( "Size" );
      jointSizeController.onChange(function ( jointSize ) {
        var joint;

        for ( var i = 0; i < joints.children.length; i++ ) {
          joint = joints.children[i];

          joint.scale.x = jointSize;
          joint.scale.y = jointSize;
          joint.scale.z = jointSize;
        }
      });

      let jointColorController = jointFolder.addColor( config, "jointColor" );
      jointColorController.name( "Color" );
      jointColorController.onChange(function ( color ) {
        jointMaterial.color = new THREE.Color( color );
      });

      // add a Frame folder
      let frameFolder = gui.addFolder( "Frames" );
      frameFolder.open();

      // set the control frame size
      let frameSizeController = frameFolder
        .add( config, "frameSize" )
        .min( 0.01 )
        .max( 1 )
        .step( 0.01 );
      frameSizeController.name( "Size" );
      frameSizeController.onChange(function ( frameSize ) {
        var frame;

        for ( var i = 0; i < frames.children.length; i++ ) {
          frame = frames.children[i];

          frame.scale.x = frameSize;
          frame.scale.z = frameSize;
        }
      });

      let frameColorController = frameFolder.addColor( config, "frameColor" );
      frameColorController.name( "Color" );
      frameColorController.onChange(function ( color ) {
        frameMaterial.color = new THREE.Color( color );
      });
    })
    .then(function() {
      render();
    })
    .catch(function (error) {
      console.log("Error occurred in sequence:", error);
    })

  // // casting
  // var projector = new THREE.Projector();

  // document.addEventListener('mousedown', onDocumentMouseDown, false);
  // document.addEventListener('mousemove', onDocumentMouseMove, false);

  // // // setupKeyLogger();
  // // setupKeyControls();
}

// function onDocumentMouseDown(event) {
//     var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
//     vector = vector.unproject(camera);

//     var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

//     var intersects = raycaster.intersectObjects([joint]);

//     if (intersects.length > 0) {
//         console.log(intersects[0]);

//         intersects[0].object.material.transparent = !intersects[0].object.material.transparent;
//         intersects[0].object.material.opacity = 0.1;
//     }
// }

// function onDocumentMouseMove(event) {
// var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
// var vector = vector.unproject(camera);

// var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
// var intersects = raycaster.intersectObjects([joint]);

// if (intersects.length > 0) {
//     var points = [];
//     points.push(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));
//     points.push(intersects[0].point);

//     var mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.6});
//     var tubeGeometry = new THREE.TubeGeometry(new THREE.SplineCurve3(points), 60, 0.001);

//     tube = new THREE.Mesh(tubeGeometry, mat);
//     scene.add(tube);
// }
// }

// function getCSSValuePrefix() {
//     var rtrnVal = '';
//     var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

//     var dom = document.createElement('div');

//     for (var i = 0; i < prefixes.length; i++) {
//         dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

//         if (dom.style.background) {
//             rtrnVal = prefixes[i];
//         }
//     }

//     dom = null;

//     delete dom;

//     return rtrnVal;
// }

window.onload = init;

function createControls() {
  // create the controls

  // create the controls
  var controls = new THREE.OrbitControls( camera, labelRenderer.domElement );

  // set the properties
  controls.rotateSpeed = config.rotateSpeed;
  controls.zoomSpeed = config.zoomSpeed;
  controls.panSpeed = config.panSpeed;
  // controls.staticMoving = config.staticMoving;

  return controls;
}

function setCameraOrientation( axis ) {
  // set the camera's orientation

  // save the lookAt vector
  var lookAt = new THREE.Vector3();
  camera.getWorldDirection( lookAt );
  
  if ( axis =='x' || axis == 'y' || axis == 'z' ) {
    switch( axis ) {
      case 'x':
        camera.up.set( 1, 0, 0 );
        break;
      case 'y':
        camera.up.set( 0, 1, 0 );
        break;
      case 'z':
        camera.up.set( 0, 0, 1 );
        break;
    }

    // update the camera
    camera.updateProjectionMatrix();
    camera.lookAt( lookAt );
  }
}

function setPlaneOrientation( axis ) {
  // set the plane's orientation
  
  if ( axis =='x' || axis == 'y' || axis == 'z' ) {
    switch( axis ) {
      case 'x':
        plane.rotation.x = 0;
        plane.rotation.y = 0.5 * Math.PI;
        break;
      case 'y':
        plane.rotation.y = 0;
        plane.rotation.x = -0.5 * Math.PI;
        break;
      case 'z':
        plane.rotation.x = 0;
        plane.rotation.y = 0;
        break;
    }
  }
}

export function setUpwardsAxis( axis ) {
  // set the upwards axis
  
  var promise = new Promise( (resolve, reject) => {
    if ( axis =='x' || axis == 'y' || axis == 'z' ) {
      // set the camera orientation
      setCameraOrientation( axis );

      // set plane orientation
      setPlaneOrientation( axis );

      // remove the event listeners
      controls.dispose();

      // create the controls
      controls = createControls();

      // save the changes
      config.axisUpwards = axis;

      resolve();
    } else {
      reject(new Error("'" + axis + "' axis does not exist"));
    }
  })

  return promise;
}

export function loadModel( filename ) {
  // load a model

  var promise = loadJSON( filename )
    .then(function ( json ) {
      // delete joints
      for ( let name of joints_name ) {
        deleteJoint( name );
      }

      // delete frames
      for ( let name of frames_name ) {
        deleteFrame( name );
      }
      
      // add joints
      for ( var key in json.joints ) {
        addJoint(
          key,
          json.joints[key].x,
          json.joints[key].y,
          json.joints[key].z
        );
      }
      
      // add frames
      for ( var key in json.frames ) {
        addFrame( key, json.frames[key].j, json.frames[key].k );
      }

      return;
    })
    .catch(function ( e ) {
      throw e;
    })

  return promise;
}

export function addFrame( name, j, k ) {
  // add a frame

  var promise = new Promise( ( resolve, reject ) => {  
    // only strings accepted as name
    name = name.toString();
    j = j.toString();
    k = k.toString();
    
    // check if frame's name of frame's joints already exits
    if ( frames_name.has( name ) || frames_joints.some(jk => jointsEqual(jk, [j, k])) ) {
      if ( frames_name.has( name ) ) {
        reject( new Error("frame's name '" + name + "' already exits") );
      } else {
        reject( new Error("frame's joints [" + j + ", " + k + "] already taked") );
      }
    } else {
      // get frame's joints
      var joint_j = joints.getObjectByName( j );
      var joint_k = joints.getObjectByName( k );
    
      if ( joint_j && joint_k ) {
        // get vector director
        var vector = new THREE.Vector3(
          joint_k.position.x - joint_j.position.x,
          joint_k.position.y - joint_j.position.y,
          joint_k.position.z - joint_j.position.z
        );
          
        // 'x' axis (?)
        var axis = new THREE.Vector3( 0, 1, 0 );
    
        // create frame
        var frame = createFrame( config.frameSize, vector.length() );

        // set name
        frame.name = name;
    
        // set position
        frame.quaternion.setFromUnitVectors( axis, vector.clone().normalize() );
        frame.position.copy( vector.clone().multiplyScalar(0.5) );
        frame.position.x += joint_j.position.x;
        frame.position.y += joint_j.position.y;
        frame.position.z += joint_j.position.z;

        // add label
        const label = document.createElement( 'div' );
        label.classList.add( 'frame' );
        label.textContent = name;
        var frameLabel = new THREE.CSS2DObject( label );
        frameLabel.position.set(0, 0, 10);
        frame.add( frameLabel );

        // add frame's joints info
        frame.joints = [j, k];
        
        // add frame to scene
        frames.add( frame );

        // track frame's name
        frames_name.add(name);
        
        // track frame's joints
        frames_joints.push( [j, k] );
        
        resolve();
      } else {  
        if ( joint_j ) {
          reject( new Error("joint's '" + k + "' does not exits") );
        } else {
          reject( new Error("joint's '" + j + "' does not exits") );
        }
      }
    }
  });

  return promise;
}

export function addJoint( name, x, y, z ) {
  // add a joint

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();
    
    // check if joint's name or joint's coordinate already exits
    if ( joints_name.has(name) || joints_coordinate.some( xyz => coordinatesEqual( xyz, [x, y, z] ) ) ) {
      if ( joints_name.has(name) ) {
        reject( new Error("joint's name '" + name + "' already exist" ));
      } else {
        reject( new Error("joint's coordinate [" + x + ", " + y + ", " + z + "] already exist" ));
      }
    } else {
      // create joint
      var joint = createJoint( config.jointSize );

      // set name
      joint.name = name;

      // set position
      joint.position.x = x;
      joint.position.y = y;
      joint.position.z = z;
      
      // add label
      const label = document.createElement( 'div' );
      label.className = 'joint';
      label.textContent = name;
      var jointLabel = new THREE.CSS2DObject( label );
      jointLabel.position.set(0, 1, 1);
      joint.add( jointLabel );
      joint.label = label;

      // add joint to scene
      joints.add( joint );

      // track joint's name
      joints_name.add( name );

      // track joint's coordinate
      joints_coordinate.push( [x, y, z] );

      resolve();
    }
  })

  return promise;
}
export function removeFrame( name ) {
  // remove a frame

  var promise = new Promise( ( resolve, reject ) => {
    if ( frames_name.has( name ) ) {
      let frame = frames.getObjectByName( name );

      // delete frame
      deleteFrame( name );

      // delete joint
      for (let joint of frame.joints) {
        if ( isJointInUse( joint ) == 0) {
          deleteJoint( joint );
        }
      }

      resolve();
    } else {
      reject( new Error("frame " + name + " does not exits") );
    }
  });
  
  return promise;
}

function deleteFrame( name ) {
  // delete a frame

  // get the frame
  let frame = frames.getObjectByName( name );

  // remove the label
  frame.remove(frame.children[0]);
  
  // remove frame of the scene
  frames.remove( frame );
  
  // remove frame's name
  frames_name.delete( name );
  
  // remove frame's joints
  let frame_joints = frame.joints;
  frames_joints = frames_joints.filter( jk => !jointsEqual( jk, frame_joints ) );
}

function isJointInUse( name ) {
  // check if joint is in use
  let count = 0;

  for ( let frame_joints of frames_joints ) {
    for ( let joint of frame_joints ) {
      if ( joint == name ) {
        count += 1;
      }
    }
  }

  return count;
}

export function removeJoint( name ) {
  // remove a joint
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( joints_name.has( name ) && (isJointInUse( name ) > 1) ) {
      deleteJoint( name );

      resolve();
    } else {
      if ( joints_name.has( name ) ) {
        reject( new Error("joint '" + name + "' is in use") );
      } else {
        reject( new Error("joint '" + name + "' does not exist") );
      }
    }
  });
   
  return promise;
}

function deleteJoint( name ) {
  // delete a joint

  // get the joint
  let joint = joints.getObjectByName(name);

  // remove the label
  joint.remove(joint.children[0]);

  // remove joint of the scene
  joints.remove(joint);

  // remove joint's name
  joints_name.delete(name);

  // remove joint's coordinate
  let joint_coordinate = [joint.position.x, joint.position.y, joint.position.z];
  joints_coordinate = joints_coordinate.filter( xyz => !coordinatesEqual( xyz, joint_coordinate ) );
}

function createFrame( size, length ) {
  // create a frame

  var frameGeometry = new THREE.CylinderGeometry( 1, 1, length );

  var frame = new THREE.Mesh( frameGeometry, frameMaterial ); 
  frame.scale.x = size;
  frame.scale.z = size;

  return frame;
}

function createJoint( size ) {
  // create a joint

  var joint = new THREE.Mesh( jointGeometry, jointMaterial );
  joint.scale.x = size;
  joint.scale.y = size;
  joint.scale.z = size;

  scene.add( joint );
  
  return joint;
}

function updatePlane() {
  // update the plane

  // remove the plane
  scene.remove( plane );

  // create the plane
  plane = createPlane();
  // set the orientation
  setPlaneOrientation( config.axisUpwards );

  // add the plane to the scene
  scene.add( plane );
}

function createPlane() {
  // create the plane

  // create the plane obj
  plane = new THREE.Object3D();

  // create the grid
  var grid = new THREE.GridHelper(
    config.planeSize,
    config.planeDivisions,
    new THREE.Color(config.planeColorCenterLine),
    new THREE.Color(config.planeColorGrid)
  );

  // set the rotation
  grid.rotation.x = 0.5 * Math.PI;
  // add the grid to the plane
  plane.add( grid );
  // add the rectangle to the plane
  plane.add(
    new THREE.Mesh(
      new THREE.PlaneBufferGeometry(
        config.planeSize,
        config.planeSize
      ),
      new THREE.MeshBasicMaterial({
        color: config.planeColor,
        transparent: config.planeTransparent,
        opacity: config.planeOpacity,
        side: THREE.DoubleSide,
      })
    )
  );

  return plane;
}

function listsEqual( a, b ) {
  // check if the a's elements are equals to b's elements
  
  for ( var i = 0; i < a.length; ++i ) {
    if ( a[i] !== b[i] ) return false;
  }
  
  return true;
}

function coordinatesEqual( a, b ) {
  // check if coordinate 'a' is equal to coordinate 'b'

  return listsEqual( a, b );
}

function jointsEqual( a, b ) {
  // check if frame 'a' is equal to frame 'b'
  
  return listsEqual( a, b );
}

export function showFramesLabel() {
  // hide joints' label

  var promise = new Promise( ( resolve, reject ) =>  {
    setFramesLabelDisplay( true );
    
    resolve()
  });
  
  return promise;
}

export function hideFramesLabel() {
  // hide joints' label

  var promise = new Promise( ( resolve, reject ) =>  {
    setFramesLabelDisplay( false );

    resolve()
  });
  
  return promise;
}

function setFramesLabelDisplay( display ) {
  // set joint's label display

  for ( let frame of frames.children ) {
    frame.children[0].visible = display;  // first child == label
  }
}

export function showJointsLabel() {
  // hide joints' label

  var promise = new Promise( ( resolve, reject ) =>  {
    setJointsLabelDisplay( true );
    
    resolve()
  });
  
  return promise;
}

export function hideJointsLabel() {
  // hide joints' label

  var promise = new Promise( ( resolve, reject ) =>  {
    setJointsLabelDisplay( false );

    resolve()
  });
  
  return promise;
}

function setJointsLabelDisplay( display ) {
  // set joint's label display

  for ( let joint of joints.children ) {
    joint.children[0].visible = display; // first child == label
  }
}

function render() {
  
  // call the render function
  requestAnimationFrame( render );

  // update the statistics
  stats.update();

  // update the scene
  renderer.render( scene, camera );
  labelRenderer.render( scene, camera );
}

function initStats() {
  var stats = new Stats();

  document.getElementById( "Stats-output" ).appendChild( stats.domElement );

  return stats;
}

function loadJSON(json) {
  var promise = fetch( json + "?nocache=" + new Date().getTime() )
    .then(function ( response ) {
      if ( response.status == 404 ) {
        throw new Error( "404 File Not Found" );
      }
      
      return response;
    })
    .then(function ( response ) {
      return response.json();
    })
    .catch(function ( e ) {
      throw e;
    })

  return promise;
}

function onResize() {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;

  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

window.addEventListener("resize", onResize, false);