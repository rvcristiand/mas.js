 // global variables

//
var scene;
var camera;
var controls;
var webGLRenderer, CSS2DRenderer;

//
var canvasWebGLRenderer = document.getElementById( "canvas" );
var canvasCSS2DRenderer = document.getElementById( "labels" );

//
var stats, gui;

//
var config;

//
var structure;

//
var model;

//
var plane;

//
var joints, jointMaterial, jointGeometry;
var frames, frameMaterial, wireFrameShape;

//
var materials = {};
var sections = {};

function init() {
  // load the json config
  loadJSON("./config.json")
    .then(function ( json ) {
      // set the config
      config = json.remembered[json.preset]["0"];
      
      // set the background
      setBackgroundColor( config.background.topColor, config.background.bottomColor );
      
      // create the scene
      scene = new THREE.Scene();

      // create the model
      model = new THREE.Group();
      // set the upwards axis
      setUpwardsAxis( config.model.axisUpwards );

      // create the camera
      camera = createCamera( config.camera.type, new THREE.Vector3( config.camera.position.x, config.camera.position.y, config.camera.position.z ) );

      // create axes
      var axes = new THREE.AxesHelper();
      axes.name = 'axes';
      axes.visible = config.model.axes;
      // add to model
      model.add( axes );
      
      // create the plane
      plane = createPlane( config.plane.size, config.plane.divisions, config.plane.color, config.plane.transparent, config.plane.opacity, config.plane.centerLine.color, config.plane.grid.color );
      plane.name = 'plane';
      // add the plane to the scene
      scene.add( plane );

      // set the joints
      joints = new THREE.Group();
      joints.name = 'joints';
      joints.visible = config.jointVisible;
      // set the geometry
      jointGeometry = new THREE.SphereGeometry( 1, 32, 32 );
      // set the material
      jointMaterial = new THREE.MeshBasicMaterial({ color: config.jointColor });
      // add to the model
      model.add( joints );

      // set the frames
      frames = new THREE.Group();
      frames.name = 'frames';
      frames.visible = config.frameVisible;
      // set the material
      frameMaterial = new THREE.MeshBasicMaterial( { color: config.frameColor, transparent: config.frameTransparent, opacity: config.frameOpacity } );
      // set the shape
      wireFrameShape = new THREE.Shape().absarc();
      // add to the scene
      model.add( frames );

      // add model to scene
      scene.add( model );

      // create the structure
      structure = createstructure();

      // create the stats
      stats = initStats();

      // create the WebGL renderer
      webGLRenderer = new THREE.WebGLRenderer({ canvas: canvasWebGLRenderer, alpha: true });
      // set pixel ratio
      webGLRenderer.setPixelRatio( window.devicePixelRatio );
      // set the size
      webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );

      // create the CSS2D renderer
      CSS2DRenderer = new THREE.CSS2DRenderer();
      CSS2DRenderer.setSize( canvasCSS2DRenderer.clientWidth, canvasCSS2DRenderer.clientHeight );
      CSS2DRenderer.domElement.style.position = 'absolute';
      CSS2DRenderer.domElement.style.top = 0;
      canvasCSS2DRenderer.appendChild( CSS2DRenderer.domElement );

      // create the controls
      controls = createControls( config.controls.rotateSpeed, config.controls.zoomSpeed, config.controls.panSpeed, config.controls.screenSpacePanning, config.controls.damping.enable, config.controls.damping.factor );

      return json;
    })
    .then(function ( json ) {
      // create the dat gui
      gui = new dat.GUI( { load: json, preset: json.preset } );

      // remember config
      // gui.remember( config );
      
      // add model folder
      let modelFolder = gui.addFolder( "model" );
      
      // set control view
      modelFolder.add( config.model, 'view', [ 'wireframe', 'extrude' ] ).onChange( ( view )  => setViewType( view ) );

      // set control axisUpwards
      modelFolder.add( config.model, 'axisUpwards' ).options( [ 'x', 'y', 'z' ] ).onChange( ( axis ) => setUpwardsAxis( axis ) ).listen();

      // set control axes
      modelFolder.add( config.model, 'axes' ).onChange( ( visible ) => model.getObjectByName( 'axes' ).visible = visible );

      // add a background folder
      let backgroundFolder = gui.addFolder( "background" );

      // add a control topBackgroundColor
      backgroundFolder.addColor( config.background, 'topColor' ).onChange( ( color ) => setBackgroundColor( color, config.background.bottomColor ) );

      // add a control bottomBackgroundColor
      backgroundFolder.addColor( config.background, 'bottomColor' ).onChange( ( color ) => setBackgroundColor( config.background.topColor, color ) );

      // add a Camera folder
      let cameraFolder = gui.addFolder( "camera" );

      // set control cameraType
      cameraFolder.add( config.camera, 'type' ).options( [ 'perspective', 'orthographic' ] ).onChange( ( type ) => setCameraType( type ) );

      // add controls folder
      let controlsFolder = gui.addFolder( "controls" );

      // set control rotateSpeed
      controlsFolder.add( config.controls, 'rotateSpeed' ).min( 0.1 ).max( 10 ).step( 0.1 ).onChange( ( speed ) => controls.rotateSpeed = speed );

      // set control zoomSpeed
      controlsFolder.add( config.controls, 'zoomSpeed' ).min( 0.12 ).max( 12 ).step( 0.12 ).onChange( ( speed ) => controls.zoomSpeed = speed );

      // set control panSpeed
      controlsFolder.add( config.controls, 'panSpeed' ).min( 0.03 ).max( 3 ).step( 0.03 ).onChange( ( speed ) => controls.panSpeed = speed );
      
      // set control screenSpacePanning
      controlsFolder.add( config.controls, 'screenPanning' ).onChange( ( screenPanning ) => controls.screenSpacePanning = screenPanning );

      // add damping folder
      var dampingFolder = controlsFolder.addFolder( "damping" );

      // set control damping
      dampingFolder.add( config.controls.damping, 'enable' ).onChange( ( enable ) => controls.enableDamping = enable );

      // set control damping factor
      dampingFolder.add( config.controls.damping, 'factor' ).min( 0.005 ).max( 0.5 ).step( 0.005 ).onChange( ( factor ) => controls.dampingFactor = factor );

      // add plane folder
      let planeFolder = gui.addFolder( "plane" );
      planeFolder.close()

      // set visible plane
      planeFolder.add( config.plane, 'visible' ).onChange( ( visible ) => scene.getObjectByName( 'plane' ).visible = visible )

      // set control planeSize
      planeFolder.add( config.plane, 'size' ).min( 1 ).max( 100 ).step( 1 ).onChange( ( size ) => setPlaneSize( size ) );

      // set control planeDivisions
      planeFolder.add( config.plane, 'divisions' ).min( 0 ).max( 100 ).step( 5 ).onChange( ( divisions ) => setPlaneDivisions( divisions ) );

      // set control planeColor
      planeFolder.addColor( config.plane, 'color' ).onChange( ( color ) => setPlaneColor( color ) );
      
      // set control planeTransparent
      planeFolder.add( config.plane, 'transparent' ).onChange( ( transparent ) => setPlaneTransparent( transparent ));

      // set control planeOpacity
      planeFolder.add( config.plane, "opacity" ).min( 0 ).max( 1 ).step( 0.01 ).onChange( ( opacity ) => setPlaneOpacity( opacity ) );

      // set control planeColorCenterLine
      planeFolder.addFolder( "center line" ).addColor( config.plane.centerLine, 'color' ).onChange( ( color ) => setCenterLineColor( color ));

      // add a grid folder
      planeFolder.addFolder( "grid" ).addColor( config.plane.grid, "color" ).onChange( ( color ) => setGridColor( color ));

      // add a Joint folder
      let jointFolder = gui.addFolder( "Joints" );

      // set joints visible
      let jointsVisibleController = jointFolder.add( config, 'jointsVisible' );
      jointsVisibleController.name( "Visible" );
      jointsVisibleController.onChange( () => setJointsVisible( config.jointsVisible ));

      // set control joint size
      let jointSizeController = jointFolder.add( config, "jointSize" ).min( 0.01 ).max( 1 ).step( 0.01 );
      jointSizeController.name( "Size" );
      jointSizeController.onChange( () => setJointSize() );
      
      // set view joint's label
      let viewJointLabelController = jointFolder.add( config, 'viewJointLabel' );
      viewJointLabelController.name( "Labels" );
      viewJointLabelController.onChange( () => setViewJointLabel( config.viewJointLabel ) );

      // add a Color folder
      let jointColorFolder = jointFolder.addFolder( "Colors" );

      // set control joint color
      let jointColorController = jointColorFolder.addColor( config, "jointColor" );
      jointColorController.name( "Color" );
      jointColorController.onChange( () => setJointColor( config.jointColor ) );

      // set transparent joint
      let jointTransparentController = jointColorFolder.add( config, 'jointTransparent' );
      jointTransparentController.name( "Transparent" );
      jointTransparentController.onChange( () => setJointTransparent( config.jointTransparent ) );

      // set opacity joint
      let jointOpacityController = jointColorFolder.add( config, 'jointOpacity' ).min( 0 ).max( 1 ).step( 0.01 );
      jointOpacityController.name( "jointOpacity" );
      jointOpacityController.onChange( () => setJointOpacity( config.jointOpacity ));

      // add a Frame folder
      let frameFolder = gui.addFolder( "Frames" );

      // set joints visible
      let framesVisibleController = frameFolder.add( config, 'framesVisible' );
      framesVisibleController.name( "Visible" );
      framesVisibleController.onChange( () => setFramesVisible( config.framesVisible ));

      // set the control frame size
      let frameSizeController = frameFolder.add( config, "frameSize" ).min( 0.01 ).max( 1 ).step( 0.01 );
      frameSizeController.name( "Size" );
      frameSizeController.onChange( () => setFrameSize() );

      // set view frame's label
      let viewFrameLabelController = frameFolder.add( config, 'viewFrameLabel' );
      viewFrameLabelController.name( "Labels" );
      viewFrameLabelController.onChange( () => setViewFrameLabel( config.viewFrameLabel ));

      // add a Color folder
      let frameColorFolder = frameFolder.addFolder( "Colors" );

      // set control frame color
      let frameColorController = frameColorFolder.addColor( config, "frameColor" );
      frameColorController.name( "Colors" );
      frameColorController.onChange( () => setFrameColor( config.frameColor ) );

      // set control frame transparent
      let frameTransparentController = frameColorFolder.add( config, "frameTransparent" );
      frameTransparentController.name( "Transparent" );
      frameTransparentController.onChange( () => setFrameTransparent( config.frameTransparent ) );

      // set control frame opcity
      let frameOpacityController = frameColorFolder.add( config, "frameOpacity" ).min( 0 ).max( 1 ).step( 0.01 );
      frameOpacityController.name( "Opacity" );
      frameOpacityController.onChange( () => setFrameOpacity( config.frameOpacity ) );
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

function createControls( rotateSpeed, zoomSpeed, panSpeed, screenSpacePanning, enableDamping, dampingFactor ) {
  // create the controls

  // create the controls
  var controls = new THREE.OrbitControls( camera, CSS2DRenderer.domElement );

  // set the properties
  controls.rotateSpeed = rotateSpeed;
  controls.zoomSpeed = zoomSpeed;
  controls.panSpeed = panSpeed;
  controls.screenSpacePanning = screenSpacePanning;
  controls.enableDamping = enableDamping;
  controls.dampingFactor = dampingFactor;

  return controls;
}

function setModelRotation( angle ) {
  // set the model rotation

  model.setRotationFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), angle );
}

export function setUpwardsAxis( axis ) {
  // set the upwards axis
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( axis =='x' || axis == 'y' || axis == 'z' ) {
      // set model rotation
      switch( axis ) {
        case 'x':
          setModelRotation( 4 * Math.PI / 3 );
          break;
        case 'y':
          setModelRotation( 2 * Math.PI / 3 );
          break;
        case 'z':
          setModelRotation( 0 );
          break;
      }

      // save the value
      config.model.axisUpwards = axis;

      resolve();
    } else {
      reject( new Error( "'" + axis + "' axis does not exist" ) );
    }
  });

  return promise;
}

export function setViewType( viewType ) {
  // set view type
  
  var promise = new Promise( ( resolve, reject ) => {
    let wireframeView = viewType == 'wireframe';
    let extrudeView = viewType == 'extrude';

    if ( wireframeView || extrudeView ) {
      let wireFrame, extrudeFrame;

      for (const frame of model.getObjectByName( 'frames' ).children ) {
        wireFrame = frame.getObjectByName( 'wireFrame' );
        extrudeFrame = frame.getObjectByName( 'extrudeFrame' );

        wireFrame.visible = wireframeView;
        extrudeFrame.visible = extrudeView;
      }
      
      resolve();
    } else {
      reject( new Error(viewType + " does not exits") );
    }
  });

  return promise;
}

export function open( filename ) {
  // open a file

  var promise = loadJSON( filename )
    .then(function ( json ) {

      // delete joints label
      for ( const joint of joints.children ) joint.remove( joint.getObjectByName( 'label' ) );

      // delete frames label
      for ( const frame of frames.children ) frame.remove( frame.getObjectByName( 'label' ) );

      joints.children = [];

      // delete frames
      frames.children = [];

      // create structure
      structure = createstructure();
      
      // add joints
      for ( const key in json.joints ) addJoint( key, json.joints[key].x, json.joints[key].y, json.joints[key].z );

      for ( const key in json.materials ) addMaterial( key, json.materials[key].E, json.materials[key].G );
      
      // add section
      for ( const key in json.sections ) {
        let section = json.sections[key];

        switch ( section.type ){
          case "Section":
            addSection( key );
            break;
          case "RectangularSection":
            addRectangularSection( key, section.width, section.height );
            break;
        }
      }
      
      // add frames
      for ( const key in json.frames ) addFrame( key, json.frames[key].j, json.frames[key].k, json.frames[key].material, json.frames[key].section );

      return;
    })
    .catch(function ( e ) {
      throw e;
    })

  return promise;
}

export function addFrame( name, j, k, material, section ) {
  // add a frame
  
  var promise = new Promise( ( resolve, reject ) => {  
    // only strings accepted as name
    name = name.toString();

    j = j.toString();
    k = k.toString();
    
    material = material.toString();
    section = section.toString();

    // check if frame's name of frame's joints already exits
    if ( structure.frames.hasOwnProperty( name ) ) reject( new Error("frame's name '" + name + "' already exits") );
    if ( Object.values( structure.frames ).some( frame => frame.j == j && frame.k == k ) ) reject( new Error("frame's joints [" + j + ", " + k + "] already taked") );

    // check if joints exits
    if ( !structure.joints.hasOwnProperty( j ) ) reject( new Error("joint's '" + j + "' does not exits") );
    if ( !structure.joints.hasOwnProperty( k ) ) reject( new Error("joint's '" + k + "' does not exits") );
    
    // add frame to structure
    structure.frames[name] = { j: j, k: k, material: material, section: section };

    // get frame's joints
    j = joints.getObjectByName( j );
    k = joints.getObjectByName( k );

    // get local axis
    var x_local =  k.position.clone().sub( j.position );

    // create frame
    var frame = createFrame( x_local.length(), structure.frames[name].section );

    // set name
    frame.name = name;

    // set material
    // frame.structural_material = structural_material;

    // set section
    // frame.section = section;

    // add axes
    // var axes = new THREE.AxesHelper();
    // frame.add( axes );
    // axes.position.set(0, 0, length / 2);

    // set position
    frame.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0 ), x_local.clone().normalize() );
    frame.position.copy( x_local.clone().multiplyScalar(0.5) );
    frame.position.add( j.position );

    // add label
    const label = document.createElement( 'div' );
    label.classList.add( 'frame' );
    label.textContent = name;
    var frameLabel = new THREE.CSS2DObject( label );
    frameLabel.name = 'label';
    frameLabel.visible = config.viewFrameLabel;
    frame.add( frameLabel );

    // add frame's joints info
    // frame.j = j;
    // frame.k = k;
    // frame.joints = [j, k];
    
    // add frame to scene
    frames.add( frame );

    // track frame's name
    // frames_name.add(name);
    
    // track frame's joints
    // frames_joints.push( [j, k] );
  
    resolve();
  });

  return promise;
}

export function addSection( name ) {
  // add a section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) reject( new Error( "Section's name '" + name + "' already exits" ) );

    // add section to structure
    structure.sections[name] = { type: "Section" };
    // create section
    sections[name] = createSection();

    resolve();
  });

  return promise;
}

export function addRectangularSection( name, width, height ) {
  // add a rectangular section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) reject( new Error( "section's name '" + name + "' already exits" ) );
    
    // add section to structure
    structure.sections[name] = { type: "RectangularSection", width: width, height: height };
    // create rectangular section
    sections[name] = createRectangularSection( width, height );

    resolve();
  });

  return promise;
}

export function addMaterial( name, e, g ) {
  // add a material

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if material's name already exits
    if ( materials.hasOwnProperty( name ) ) reject( new Error( "material's name '" + name + "' already exist" ) );

    // add material to structure
    structure.materials[name] = { "E": e, "G": g };

    resolve();
  });

  return promise;
}

export function addJoint( name, x, y, z ) {
  // add a joint

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();
    
    // check if joint's name or joint's coordinate already exits
    if ( structure.joints.hasOwnProperty( name ) ) reject( new Error("joint's name '" + name + "' already exist" ));
    if ( Object.values( structure.joints ).some( joint => joint.x == x && joint.y == y && joint.z == z ) ) reject( new Error("joint's coordinate [" + x + ", " + y + ", " + z + "] already exist" )); ; 
    
    // add joint to structure
    structure.joints[name] = { x: x, y: y, z: z };
  
    // create joint
    var joint = createJoint( config.jointSize );

    // set name
    joint.name = name;

    // set position
    joint.position.set( x, y, z );

    // add label
    const label = document.createElement( 'div' );
    label.className = 'joint';
    label.textContent = name;
    var jointLabel = new THREE.CSS2DObject( label );
    jointLabel.name = 'label';
    jointLabel.visible = config.viewJointLabel;
    jointLabel.position.set( 1, 1, 1 );
    joint.add( jointLabel );
    // joint.label = label;
    
    // add joint to scene
    joints.add( joint );

    resolve();
  });

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

export function removeSection( name ) {
  // remove a section

  var promise = new Promise( ( resolve, reject ) => {
    if ( sections.hasOwnProperty( name ) ) {
      delete sections[name];

      resolve();
    } else {
      reject( new Error( "section '" + name + "' does not exist" ) );
    }
  });

  return promise;
}

export function removeMaterial( name ) {
  // remove a material

  var promise = new Promise( ( resolve, reject ) => {
    if ( materials.hasOwnProperty( name ) ) {
      delete materials[name];

      resolve();
    } else {
      reject( new Error( "section '" + name + "' does not exist" ) );
    }
  });

  return promise;
}

function isJointInUse( name ) {
  // check if joint is in use
  let count = 0;
  
  for ( let frame of structure.frames ) {
    if ( frame.J == name ) count += 1;
    if ( frame.k == name ) count += 1;
  }
  
  return count;
}

export function removeJoint( name ) {
  // remove a joint
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( structure.joints.hasOwnProperty( name ) && (isJointInUse( name ) > 1) ) {
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

function deleteFrame( name ) {
  // delete a frame

  // get the frame
  let frame = frames.getObjectByName( name );

  // remove the label
  for ( let child of frame.children ) {
    frame.remove( child );
  }
  
  // remove frame of the scene
  frames.remove( frame );
  
  // remove frame's joints
  let frame_joints = frame.joints;
  frames_joints = frames_joints.filter( jk => !jointsEqual( jk, frame_joints ) );
}

function deleteJoint( name ) {
  // delete a joint

  // get the joint
  let joint = joints.getObjectByName( name );

  // remove the label
  joint.remove( joint.getObjectByName( 'label' ) );

  // remove joint of the scene
  joints.remove( joint );
  
  // remove joint from structure
  delete structure.joints[name];
}

function createFrame( length, section ) {
  // create a frame

  var parent = new THREE.Group();
  var extrudeSettings = { depth: length, bevelEnabled: false };

  // create wire frame
  var wireFrameGoemetry = new THREE.ExtrudeBufferGeometry( wireFrameShape, extrudeSettings );
  var wireFrame = new THREE.Mesh( wireFrameGoemetry, frameMaterial );
  wireFrame.scale.set( config.frameSize, config.frameSize, 1 );
  wireFrame.name = 'wireFrame';

  // create extrude frame
  var extrudeFrameGeometry = new THREE.ExtrudeBufferGeometry( sections[section], extrudeSettings );
  var extrudeFrame = new THREE.Mesh( extrudeFrameGeometry, frameMaterial );
  extrudeFrame.name = 'extrudeFrame';

  if ( structure.sections[section].type == 'Section' ) {
    // set frame size
    extrudeFrame.scale.set( config.frameSize, config.frameSize, 1 );
  } else {
    // create edges
    var frameEdgesGeomtry = new THREE.EdgesGeometry( extrudeFrameGeometry );
    var frameEdges = new THREE.LineSegments( frameEdgesGeomtry, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    frameEdges.name = 'edges';

    // add edges to frame
    extrudeFrame.add( frameEdges );
  }

  // set visibility
  if ( config.model.view == 'wireframe' ) extrudeFrame.visible = false;
  if ( config.model.view == 'extrude' ) wireFrame.visible = false;

  // x local along frame
  var quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), 2 * Math.PI / 3 );
  extrudeFrame.quaternion.copy( quaternion );
  wireFrame.quaternion.copy( quaternion );

  // middle's frame at origin
  var position = new THREE.Vector3( -length / 2, 0, 0 )
  extrudeFrame.position.copy( position );
  wireFrame.position.copy( position );

  // add wire frame and extrudeFrameto parent
  parent.add( wireFrame );
  parent.add( extrudeFrame );

  return parent;
}

function createSection() {
  // create a section

  return wireFrameShape;
}

function createRectangularSection( widht, height ) {
  // create a rectangular section

  var rectangularSection = new THREE.Shape()
    .moveTo(  widht / 2, -height / 2 )
    .lineTo(  widht / 2,  height / 2 )
    .lineTo( -widht / 2,  height / 2 )
    .lineTo( -widht / 2, -height / 2 );
  
  return rectangularSection;
}

function createJoint( size ) {
  // create a joint

  var joint = new THREE.Mesh( jointGeometry, jointMaterial );
  joint.scale.setScalar( size );
  
  return joint;
}

function createPlane( size, divisions, color, transparent, opacity, colorCenterLine, colorGrid ) {
  // create the plane

  // create the parent
  var parent = new THREE.Group();

  // add the grid to the parent
  parent.add( createGrid( divisions, colorCenterLine, colorGrid ) );
  
  // create colorCenterLine
  var planeGometry = new THREE.PlaneBufferGeometry();
  var planeMaterial = new THREE.MeshBasicMaterial( { color: color, transparent: transparent, opacity: opacity, side: THREE.DoubleSide } );
  var plane = new THREE.Mesh( planeGometry, planeMaterial );
  plane.name = '_plane';
  
  // add the plane to the parent
  parent.add( plane );
  
  // set size
  parent.scale.setScalar( size );
  
  return parent;
}

function createGrid( divisions, colorCenterLine, colorGrid ) {
  // create a grid

  // create the grid
  var grid = new THREE.GridHelper( 1, divisions, colorCenterLine, colorGrid );
  // set the name
  grid.name = 'grid';
  // set the rotation
  grid.rotation.x = 0.5 * Math.PI;

  return grid;
}

function setPlaneSize( size ) {
  // set plane's size

  plane.scale.setScalar( size );
}

function setPlaneDivisions( divisions ) {
  // set plane's divisions

  // remove actual grid
  plane.remove( plane.getObjectByName( 'grid' ) );
  
  // add new grid
  plane.add( createGrid( divisions, config.plane.centerLine.color, config.plane.grid.color ) );
}

function setPlaneColor( color ) {
  // set plane color

  plane.getObjectByName( '_plane' ).material.color = new THREE.Color( color );
}

function setPlaneTransparent( transparent ) {
  // set plane transparent

  plane.getObjectByName( '_plane' ).material.transparent = transparent;
}

function setPlaneOpacity( opacity ) {
  // set plane opacity

  plane.getObjectByName( '_plane' ).material.opacity = opacity;
}

function setCenterLineColor( color ) {
  // set center line color

  // remove actual grid
  plane.remove( plane.getObjectByName( 'grid' ) );

  // add new grid
  plane.add( createGrid( config.plane.divisions, color, config.plane.grid.color ) ); 
}

function setGridColor( color ) {
  // set grid color

  // remove actual grid
  plane.remove( plane.getObjectByName( 'grid' ) );

  // add new grid
  plane.add( createGrid( config.plane.divisions, config.plane.centerLine.color, color ) ); 
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

function setViewFrameLabel( visible ) {
  // set view joint's label

  var label;
  
  for ( let frame of frames.children ) {
    label = frame.getObjectByName( "label" );

    label.visible = visible;
  }
}

function setViewJointLabel( visible ) {
  // set view joint's label
  
  for ( let joint of joints.children ) {
    var label = joint.getObjectByName( "label" );

    label.visible = visible;
  }
}

function setFrameColor( color ) {
  // set frame's color

  frameMaterial.color = new THREE.Color( color );
}

function setFrameTransparent( transparent ) {
  // set frame's transparent

  frameMaterial.transparent = transparent;
}

function setFrameOpacity( opacity ) {
  // set frame's opacity

  frameMaterial.opacity = opacity;
}

function setJointColor( color ) {
  // set joint's color

  jointMaterial.color = new THREE.Color( color );
}

function setJointTransparent( transparent ) {
  // set joint's transparent

  jointMaterial.transparent = transparent;
}

function setJointOpacity( opacity ) {
  // set joint's opacity

  jointMaterial.opacity = opacity;
}

function setFrameSize() {
  // set frame's size

  let scale = new THREE.Vector3( config.frameSize, config.frameSize, 1 );
  let frame, wireFrame, extrudeFrame;

  for ( const name in structure.frames ) {
    frame = frames.getObjectByName( name );
    wireFrame = frame.getObjectByName( 'wireFrame' );
    extrudeFrame = frame.getObjectByName( 'extrudeFrame');
    
    wireFrame.scale.copy( scale );
    if ( structure.sections[structure.frames[name].section].type == 'Section') extrudeFrame.scale.copy( scale );
  }

}

function setJointSize() {
  // set joint's size

  for ( const joint of joints.children ) joint.scale.setScalar( config.jointSize );
}

function setBackgroundColor( topColor, bottomColor ) {
  // set background color

  canvasWebGLRenderer.style.backgroundColor = topColor;
  canvasWebGLRenderer.style.backgroundImage = "linear-gradient(" + topColor + ", " + bottomColor + ")";
}

function setFramesVisible ( visible ) {
  // set frames's visible

  frames.visible = visible;
}

function setJointsVisible ( visible ) {
  // set joint's visible

  joints.visible = visible;
}

function createstructure() {
  // create structure

  return { joints: {}, materials: {}, sections: {}, frames: {} };
}

function setCameraType( type ) {
  // set the camera type

  // save the controls target
  var target = controls.target.clone();
  
  // save previous camera quaternion
  var quaternion = camera.quaternion.clone();
    
  // save previous camera position
  var position = camera.position.clone();

  // save previous zoom
  var zoom = camera.zoom;

  // set the camera
  camera = createCamera( type, position );

  // set the controls
  controls = createControls( config.controls.rotateSpeed, config.controls.zoomSpeed, config.controls.panSpeed, config.controls.screenPanning, config.controls.damping.enable, config.controls.damping.factor );
  controls.target.copy( target );

  // set rotation
  camera.quaternion.copy( quaternion );

  // set position
  if ( type == 'perspective' ) {
    // z local in globar coordinates
    var worldDirection = new THREE.Vector3();
    camera.getWorldDirection( worldDirection );

    worldDirection.multiplyScalar( position.length() - 1 / ( 2 * zoom * Math.tan( ( camera.fov / 2 ) * Math.PI / 180 ) ) );
    position.add( worldDirection );
  }

  camera.position.copy( position );
}

  // set zoom
  // camera.zoom = 1 / position.length();

  // set postiion
  // camera.position.copy( position );


  // create the controls
  // controls.dispose();
  // if (config.cameraType == "perspective") {
  //   controls = createControls( config.rotateSpeed, config.zoomSpeed, config.panSpeed, config.screenSpacePanning );
  // } else if (config.cameraType == "orthographic") {
  //   controls = createControls( config.rotateSpeed, config.zoomSpeed, config.panSpeed, config.screenSpacePanning );
  // }
  // set the target
  // controls.target = target;
  // set the properties
  // controls.rotateSpeed = config.rotateSpeed;
  // controls.zoomSpeed = config.zoomSpeed;
  // controls.panSpeed = config.panSpeed;

function createCamera( type, position ) {
  // create the camera

  var camera;

  var fov = 45;
  var near = 0.01;
  var far = 1000;
  var aspect = canvasWebGLRenderer.clientWidth / canvasWebGLRenderer.clientHeight;

  // set the camera
  if ( type == 'perspective' ) {
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  } else if ( type == 'orthographic' ) {
    camera = new THREE.OrthographicCamera( -0.5 * aspect, 0.5 * aspect, 0.5, -0.5, near, far );
    camera.zoom = 1 / ( 2 * Math.tan( ( fov / 2 ) * Math.PI / 180 ) * position.length() );
  }
  // set the up
  camera.up.set( 0, 0, 1 );

  // set the camera position
  camera.position.copy( position );

  // set the look at
  camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

  // update camera
  camera.updateProjectionMatrix();

  return camera;
}

function render() {
  // render the scene

  // call the render function
  requestAnimationFrame( render );

  // update the statistics
  stats.update();

  // update the scene
  webGLRenderer.render( scene, camera );
  CSS2DRenderer.render( scene, camera );

  // update controls
  if ( config.controls.damping ) controls.update();
}

function initStats() {
  // init stats
  
  var stats = new Stats();

  document.getElementById( "Stats-output" ).appendChild( stats.domElement );

  return stats;
}

function loadJSON(json) {
  // load json

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
  camera.aspect = canvasWebGLRenderer.clientWidth / canvasWebGLRenderer.clientHeight;

  camera.updateProjectionMatrix();
  webGLRenderer.setSize(canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight);
}

window.addEventListener("resize", onResize, false);