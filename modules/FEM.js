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
// var ambientLight;
// var hemisphereLight;
// var directionalLight;

//
var stats, gui;

//
var config = {
  'background.topColor': '#000000',
  'background.bottomColor': '#818181',

  'model.axisUpwards': 'y',

  'model.axes.visible': true,
  'model.axes.size': 1,

  'camera.type': 'perspective',

  'camera.position.x': 10,
  'camera.position.y': 10,
  'camera.position.z': 10,

  'camera.perspective.fov': 45,
  'camera.perspective.near': 0.1,
  'camera.perspective.far': 1000,

  'controls.rotateSpeed': 1,
  'controls.zoomSpeed': 1.2,
  'controls.panSpeed': 0.3,
  'controls.screenPanning': true,

  'controls.damping.enable': false,
  'controls.damping.factor': 0.05,

  // 'lights.ambient.color': 0x0c0c0c,

  // 'lights.direction.color': 0xffffff,
  // 'lights.direction.intensity': 1,

  'ground.visible': true,
  'ground.size': 10,

  'ground.plane.visible': true,
  'ground.plane.color': 0x000000,
  'ground.plane.transparent': true,
  'ground.plane.opacity': 0.5,
  
  'ground.grid.visible': true,
  'ground.grid.divisions': 10,
  'ground.grid.major': 0xff0000,
  'ground.grid.menor': 0x000000,

  'joint.visible': true,
  'joint.size': 0.03,
  'joint.color': 0xffff00,
  'joint.transparent': true,
  'joint.opacity': 1,
  'joint.label': false,

  'frame.visible': true,
  'frame.view': 'extrude',
  'frame.size': 0.02,
  'frame.color': 0xff00ff,
  'frame.transparent': true,
  'frame.opacity': 0.5,
  'frame.label': false,
  'frame.axes': false,

  'support.visible': true,
  'support.mode': 'analytical',

  'support.foundation.size': 0.5,
  'support.foundation.depth': 0.05,

  'support.pedestal.size': 0.3,

  'support.pin.height': 0.3,
  'support.pin.radius': 0.3,
};

//
var structure;

//
var model;

//
var jointMaterial, jointGeometry;
var frameMaterial, wireFrameShape;

var xSupportMaterial, ySupportMaterial, zSupportMaterial;
var pedestalMaterial;

var foundationGeometry, pedestalGeometry, pinGeometry;

//
var materials = {};
var sections = {};

function init() {
  // refresh the config
  var json = JSON.parse( localStorage.getItem( window.location.href + '.gui' ) );
  if ( json ) {
    var preset = json.remembered[json.preset]['0'];
    for ( const key in preset ) config[ key ] = preset[ key ];
  }

  // create the structure
  structure = createStructure();
  
  // set the background
  setBackgroundColor( config[ 'background.topColor' ], config[ 'background.bottomColor' ] );
  
  // create the scene
  scene = new THREE.Scene();

  // background
  // scene.background = new THREE.Color( 'white' ); // .setHSL( 0.6, 0, 1 )

  // fog
  // scene.fog = new THREE.Fog( scene.background, 1, 5000 );

  // ambient light
  // ambientLight = new THREE.AmbientLight( config.lights.ambient.color );
  // scene.add( ambientLight );

  // hemisphereLight
  // hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  // hemisphereLight.color.setHSL( 0.6, 1, 0.6 );
  // hemisphereLight.groundColor.setHSL( 0.095, 1, 0.75 );
  // hemisphereLight.position.set( 0, 50, 0 );
  // scene.add( hemisphereLight );

  // directionalLight
  // directionalLight = new THREE.DirectionalLight( config.lights.direction.color, config.lights.direction.intensity );
  // directionalLight.color.setHSL( 0.1, 1, 0.95 );
  // directionalLight.position.set( -1, 1.75, 1 );
  // directionalLight.position.multiplyScalar( 30 );
  // scene.add( directionalLight );

  // directionalLight.castShadow = true;

  // directionalLight.shadow.mapSize.widht = 2048;
  // directionalLight.shadow.mapSize.height = 2048;
  
  // var d = 50;

  // directionalLight.shadow.camera.left = -d;
  // directionalLight.shadow.camera.right = d;
  // directionalLight.shadow.camera.top = d;
  // directionalLight.shadow.camera.bottom = -d;

  // directionalLight.shadow.camera.far = 3500;
  // directionalLight.shadow.bias = -0.0001

  // create the model
  model = createModel();

  // set the upwards axis
  setModelRotation( config[ 'model.axisUpwards' ] );

  // create the camera
  camera = createCamera( config[ 'camera.type' ], new THREE.Vector3( config[ 'camera.position.x' ], config[ 'camera.position.y' ], config[ 'camera.position.z' ] ) );
  
  // create the ground
  var ground = createGround( config[ 'ground.size' ], config[ 'ground.grid.divisions' ], config[ 'ground.plane.color' ], config[ 'ground.plane.transparent' ], config[ 'ground.plane.opacity' ], config[ 'ground.grid.major' ], config[ 'ground.grid.minor' ] );
  // ground.position.set( 0, 0, -0.01 );
  // add the ground to the scene
  scene.add( ground );

  // set the geometry
  jointGeometry = new THREE.SphereGeometry( 1, 32, 32 );
  // set the material
  jointMaterial = new THREE.MeshBasicMaterial( { color: config[ 'joint.color' ], transparent: config[ 'joint.transparent' ], opacity: config[ 'joint.opacity' ] } );

  // set the material
  frameMaterial = new THREE.MeshBasicMaterial( { color: config[ 'frame.color' ], transparent: config[ 'frame.transparent' ], opacity: config[ 'frame.opacity' ] } );
  // set the shape
  wireFrameShape = new THREE.Shape().absarc();

  // set the supports
  // material
  xSupportMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
  ySupportMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
  zSupportMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } );

  pedestalMaterial = [ xSupportMaterial, xSupportMaterial, ySupportMaterial, ySupportMaterial, zSupportMaterial, zSupportMaterial ];

  // geometry
  foundationGeometry = new THREE.BoxBufferGeometry();
  pedestalGeometry = new THREE.BoxBufferGeometry();

  pinGeometry = new THREE.ConeBufferGeometry( 1, 1, 4, 1, true );

  // materials
  pinGeometry.groups = [ ];
  pinGeometry.addGroup(  0, 6, 0 );
  pinGeometry.addGroup(  6, 6, 1 );
  pinGeometry.addGroup( 12, 6, 2 );
  pinGeometry.addGroup( 18, 6, 3 );

  // rotate
  pinGeometry.rotateX( Math.PI / 2 );
  pinGeometry.rotateZ( Math.PI / 4 );

  // translate
  pinGeometry.translate( 0, 0, -0.5 );

  // add model to scene
  scene.add( model );

  // create the stats
  stats = initStats();

  // create the WebGL renderer
  webGLRenderer = new THREE.WebGLRenderer( { canvas: canvasWebGLRenderer, alpha: true, antialias: true } );
  webGLRenderer.setPixelRatio( window.devicePixelRatio );
  webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
  // webGLRenderer.shadowMap.enabled = true;

  // create the CSS2D renderer
  CSS2DRenderer = new THREE.CSS2DRenderer();
  CSS2DRenderer.setSize( canvasCSS2DRenderer.clientWidth, canvasCSS2DRenderer.clientHeight );
  CSS2DRenderer.domElement.style.position = 'absolute';
  CSS2DRenderer.domElement.style.top = 0;
  canvasCSS2DRenderer.appendChild( CSS2DRenderer.domElement );

  // create the controls
  controls = createControls( config[ 'controls.rotateSpeed' ], config[ 'controls.zoomSpeed' ], config[ 'controls.panSpeed' ], config[ 'controls.screenPanning' ], config[ 'controls.damping.enable' ], config[ 'controls.damping.factor' ] );

  // create the dat gui
  gui = new dat.GUI();

  // remember config
  gui.remember( config );

  // add model folder
  let modelFolder = gui.addFolder( "model" );
  modelFolder.add( config, 'model.axisUpwards' ).options( [ 'x', 'y', 'z' ] ).name( 'axisUpwards' ).onChange( axis => setUpwardsAxis( axis ) ); // .listen();
  // add axes folder
  let axesFolder = modelFolder.addFolder( "axes" );
  axesFolder.add( config, 'model.axes.visible' ).name( 'visible' ).onChange( visible => model.getObjectByName( 'axes' ).visible = visible );
  axesFolder.add( config, 'model.axes.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => model.getObjectByName( 'axes' ).scale.setScalar( size ) );

  // add a light folder
  // let lightsFolder = gui.addFolder( "light");

  // add a ambiernt folder
  // let ambientFolder = lightsFolder.addFolder( "ambient" );
  // ambientFolder.addColor( config.lights.ambient, 'color' ).onChange( color => ambientLight.color = new THREE.Color( color ) );

  // add a background folder
  let backgroundFolder = gui.addFolder( "background" );
  backgroundFolder.addColor( config, 'background.topColor' ).name( 'top' ).onChange( color => setBackgroundColor( color, config[ 'background.bottomColor' ] ) );
  backgroundFolder.addColor( config, 'background.bottomColor' ).name( 'bottom' ).onChange( color => setBackgroundColor( config[ 'background.topColor' ], color ) );

  // add a Camera folder
  let cameraFolder = gui.addFolder( "camera" );
  cameraFolder.add( config, 'camera.type' ).options( [ 'perspective', 'orthographic' ] ).name( 'type' ).onChange( type => setCameraType( type ) );

  // add controls folder
  let controlsFolder = gui.addFolder( "controls" );
  controlsFolder.add( config, 'controls.rotateSpeed' ).name( 'rotateSpeed' ).min( 0.1 ).max( 10 ).step( 0.1 ).onChange( speed => controls.rotateSpeed = speed );
  controlsFolder.add( config, 'controls.zoomSpeed' ).name( 'zoomSpeed' ).min( 0.12 ).max( 12 ).step( 0.12 ).onChange( speed => controls.zoomSpeed = speed );
  controlsFolder.add( config, 'controls.panSpeed' ).name( 'panSpeed' ).min( 0.03 ).max( 3 ).step( 0.03 ).onChange( speed => controls.panSpeed = speed );
  controlsFolder.add( config, 'controls.screenPanning' ).name( 'screenPanning' ).onChange( screenPanning => controls.screenSpacePanning = screenPanning );
  // add damping folder
  var dampingFolder = controlsFolder.addFolder( "damping" );
  dampingFolder.add( config, 'controls.damping.enable' ).name( 'enable' ).onChange( enable => controls.enableDamping = enable );
  dampingFolder.add( config, 'controls.damping.factor' ).name( 'factor' ).min( 0.005 ).max( 0.5 ).step( 0.005 ).onChange( factor => controls.dampingFactor = factor );

  // add ground folder
  let groundFolder = gui.addFolder( "ground" );
  groundFolder.add( config, 'ground.visible' ).name( 'visible' ).onChange( visible => setGroundVisible( visible ) );
  groundFolder.add( config, 'ground.size' ).name( 'size' ).min( 1 ).max( 100 ).step( 1 ).onChange( size => setGroundSize( size ) );
  // add plane folder
  let planeFolder = groundFolder.addFolder( "plane" );
  planeFolder.add( config, 'ground.plane.visible' ).name( 'visible' ).onChange( visible => setPlaneVisible( visible ) );
  planeFolder.addColor( config, 'ground.plane.color' ).name( 'color' ).onChange( color => setPlaneColor( color ) );
  planeFolder.add( config, 'ground.plane.transparent' ).name( 'transparent' ).onChange( transparent => setPlaneTransparent( transparent ) );
  planeFolder.add( config, 'ground.plane.opacity' ).name( 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( opacity => setPlaneOpacity( opacity ) );
  // add grid folder
  let gridFolder = groundFolder.addFolder( "grid" );
  gridFolder.add( config, 'ground.grid.visible' ).name( 'visible' ).onChange( visible => setGridVisible( visible ) );
  gridFolder.add( config, 'ground.grid.divisions' ).name( 'divisions' ).min( 0 ).max( 100 ).step( 5 ).onChange( divisions => setGridDivisions( divisions ) );
  gridFolder.addColor( config, 'ground.grid.major' ).name( 'major' ).onChange( color => setGridMajor( color ) );
  gridFolder.addColor( config, "ground.grid.menor" ).name( 'menor' ).onChange( color => setGridMenor( color ) );

  // add a joint folder
  let jointFolder = gui.addFolder( "joint" );
  jointFolder.add( config, 'joint.visible' ).name( 'visible' ).onChange( visible => setJointVisible( visible ) );
  jointFolder.add( config, "joint.size" ).name( 'size' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( size => setJointSize( size ) );
  jointFolder.add( config, 'joint.label' ).name( 'label' ).onChange( visible => setJointLabel( visible ) );
  jointFolder.addColor( config, "joint.color" ).name( 'color' ).onChange( color => setJointColor( color ) );
  jointFolder.add( config, 'joint.transparent' ).name( 'transparent' ).onChange( transparent => setJointTransparent( transparent ) );
  jointFolder.add( config, 'joint.opacity' ).name( 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( opacity => setJointOpacity( opacity ));

  // add a frame folder
  let frameFolder = gui.addFolder( "frame" );
  frameFolder.add( config, 'frame.visible' ).name( 'visible' ).onChange( visible => setFramesVisible( visible ));
  frameFolder.add( config, 'frame.view', [ 'wireframe', 'extrude' ] ).name( 'view' ).onChange( view  =>  setFrameView( view ) );
  frameFolder.add( config, 'frame.size' ).name( 'size' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( size => setFrameSize( size ) );
  frameFolder.addColor( config, 'frame.color' ).name( 'color' ).onChange( color => setFrameColor( color ) );
  frameFolder.add( config, 'frame.transparent' ).name( 'transparent' ).onChange( transparent => setFrameTransparent( transparent ) );
  frameFolder.add( config, 'frame.opacity' ).name( 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( opacity => setFrameOpacity( opacity ) );
  frameFolder.add( config, 'frame.label' ).name( 'label' ).onChange( visible => setFrameLabel( visible ) );
  frameFolder.add( config, 'frame.axes' ).name( 'axes' ).onChange( visible => setFrameAxes( visible ) );

  // add support folder
  let supportFolder = gui.addFolder( "support" );
  supportFolder.add( config, 'support.mode' ).options( [ "space", "analytical" ]).name( 'mode' ).onChange( mode => setSupportMode( mode ) );
  // add foundation folder
  let foundationFolder = supportFolder.addFolder( "foundation" );
  foundationFolder.add( config, 'support.foundation.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setFoundationSize( size ) );
  // add pedestal folder
  let pedestalFolder = supportFolder.addFolder( "pedestal" );
  pedestalFolder.add( config, 'support.pedestal.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPedestalSize( size ) );
  // add pin folder
  let pinFolder = supportFolder.addFolder( "pin" );
  pinFolder.add( config, 'support.pin.height' ).name( 'height' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPinHeight( size ) );
  pinFolder.add( config, 'support.pin.radius' ).name( 'radius' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( radius => setPinRadius( radius ) );
  // supportFolder.add( config, 'radius' ).min( 0.01 ).max( 0.1 ).step( 0.001 ).onChange( ( radius ) => setSupportRadius( radius ) );

  render();
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

window.onload = init;

function createControls( rotateSpeed, zoomSpeed, panSpeed, screenSpacePanning, enableDamping, dampingFactor ) {
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

function setModelRotation( axis ) {
  // set model rotation

  var angle;

  switch( axis ) {
    case 'x':
      angle = 4 * Math.PI / 3
      break;
    case 'y':
      angle = 2 * Math.PI / 3;
      break;
    case 'z':
      angle = 0;
      break;
  }

  model.setRotationFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), angle );
}

export function setUpwardsAxis( axis ) {
  // set the upwards axis
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( axis =='x' || axis == 'y' || axis == 'z' ) {
      // set model rotation
      setModelRotation( axis );
      
      // redraw the supports
      for ( let [ joint, support ] of Object.entries( structure.supports ) ) {
        joint = model.getObjectByName( 'joints' ).getObjectByName( joint );
        joint.remove( joint.getObjectByName( 'support' ) );
        joint.add( createSupport( support.ux, support.uy, support.uz, support.rx, support.ry, support.rz ) );
      }
      
      // save the value
      config[ 'model.axisUpwards' ] = axis;

      resolve();
    } else {
      reject( new Error( "'" + axis + "' axis does not exist" ) );
    }
  });

  return promise;
}

export function setFrameView( view ) {
  // set frame view
  
  var promise = new Promise( ( resolve, reject ) => {
    let wireframeView = view == 'wireframe';
    let extrudeView = view == 'extrude';

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
      reject( new Error( viewType + " does not exits" ) );
    }
  });

  return promise; 
}

export function open( filename ) {
  // open a file

  var promise = loadJSON( filename )
    .then( json => {
      // delete labels
      for ( const joint of model.getObjectByName( 'joints' ).children ) joint.getObjectByName( 'joint' ).remove( joint.getObjectByName( 'joint' ).getObjectByName( 'label') );
      for ( const frame of model.getObjectByName( 'frames' ).children ) frame.remove( frame.getObjectByName( 'label' ) );

      // delete objects
      model.getObjectByName( 'joints' ).children = [];
      model.getObjectByName( 'frames' ).children = [];

      // create structure
      structure = createStructure();
      
      // add objects
      for ( let [ name, joint ] of Object.entries( json.joints ) ) addJoint( name, joint.x, joint.y, joint.z );
      for ( let [ name, material ] of Object.entries( json.materials ) ) addMaterial( name, material.E, material.G );
      
      // add sections
      for ( let [ name, section ] of Object.entries( json.sections ) ) {
        switch ( section.type ) {
          case "Section":
            addSection( name );
            break;
          case "RectangularSection":
            addRectangularSection( name, section.width, section.height );
            break;
        }
      }
      
      // add frames
      for ( let [ name, frame ] of Object.entries( json.frames ) ) addFrame( name, frame.j, frame.k, frame.material, frame.section );

      // add suports
      for ( let [ name, support ] of Object.entries( json.supports ) ) addSupport( name, support.ux, support.uy, support.uz, support.rx, support.ry, support.rz );
    })
    .catch(function ( e ) {
      console.log( e ); // throw e;
    })

  return promise;
}

export function addSupport( joint, ux, uy, uz, rx, ry, rz ) {
  // add a support
  
  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as joint
    joint = joint.toString();

    // check if joint's support already exist
    if ( structure.supports.hasOwnProperty( joint ) ) {
      reject( new Error( "support's joint '" + joint + "' already exits" ) );
    } else {
      // check if joint exist
      if ( structure.joints.hasOwnProperty( joint ) ) {
        // add support to structure
        structure.supports[ joint ] = { ux: ux, uy: uy, uz: uz, rx: rx, ry: ry, rz: rz };
        
        // create support
        var support = createSupport( ux, uy, uz, rx, ry, rz );

        // add support
        model.getObjectByName( 'joints' ) .getObjectByName( joint ).add( support );

        resolve();
      } else {
        reject( new Error( "joint '" + "' does not exist" ) );
      }
    }
  });

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
    if ( structure.frames.hasOwnProperty( name ) || Object.values( structure.frames ).some( frame => frame.j == j && frame.k == k ) ) {
      if ( structure.frames.hasOwnProperty( name ) ) { 
        reject( new Error( "frame's name '" + name + "' already exits" ) );
      } else {
        reject( new Error( "frame's joints [" + j + ", " + k + "] already taked") );
      }
    } else {
      // check if joints exits
      if ( structure.joints.hasOwnProperty( j ) || structure.joints.hasOwnProperty( k ) ) {
        // add frame to structure
        structure.frames[name] = { j: j, k: k, material: material, section: section };
    
        // get frame's joints
        j = model.getObjectByName( 'joints' ).getObjectByName( j );
        k = model.getObjectByName( 'joints' ).getObjectByName( k );
    
        // get local axis
        var x_local =  k.position.clone().sub( j.position );
    
        // create frame
        var frame = createFrame( x_local.length(), structure.frames[name].section );
    
        // set name
        frame.name = name;
    
        // add axes
        var axes = new THREE.AxesHelper();
        axes.name = 'axes';
        axes.visible = config[ 'frame.axes' ];
        axes.position.set( 0, 0, length / 2 );
        frame.add( axes );
    
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
        frameLabel.visible = config[ 'frame.label' ];
        frame.add( frameLabel );
    
        // add frame's joints info
        // frame.j = j;
        // frame.k = k;
        // frame.joints = [j, k];
        
        // add frame to scene
        model.getObjectByName( 'frames' ).add( frame );
    
        // track frame's name
        // frames_name.add(name);
        
        // track frame's joints
        // frames_joints.push( [j, k] );
      
        resolve();
      } else {
        if ( !structure.joints.hasOwnProperty( j ) ) {
          reject( new Error("joint's '" + j + "' does not exits") );
        } else {
          reject( new Error("joint's '" + k + "' does not exits") );
        }
      }
    }
  });

  return promise;
}

export function addSection( name ) {
  // add a section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) {
      reject( new Error( "Section's name '" + name + "' already exits" ) );
    } else {
      structure.sections[name] = { type: "Section" };
      // create section
      sections[name] = createSection();
  
      resolve();
    }

    // add section to structure
  });

  return promise;
}

export function addRectangularSection( name, width, height ) {
  // add a rectangular section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) {
      reject( new Error( "section's name '" + name + "' already exits" ) );
    } else {
      // add section to structure
      structure.sections[name] = { type: "RectangularSection", width: width, height: height };
      // create rectangular section
      sections[name] = createRectangularSection( width, height );
    }

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
    if ( structure.joints.hasOwnProperty( name ) || Object.values( structure.joints ).some( joint => joint.x == x && joint.y == y && joint.z == z ) ) {
      if ( structure.joints.hasOwnProperty( name ) ) {
        reject( new Error( "joint's name '" + name + "' already exist" ) );
      } else {
        reject( new Error( "joint's coordinate [" + x + ", " + y + ", " + z + "] already exist" )); 
      }
    } else {
      // add joint to structure
      structure.joints[name] = { x: x, y: y, z: z };

      // create parent
      var parent = new THREE.Group();
      parent.name = name;
    
      // create joint
      var joint = createJoint( config[ 'joint.size' ] );
      parent.add( joint );
  
      // add label
      const label = document.createElement( 'div' );
      label.className = 'joint';
      label.textContent = name;
      var jointLabel = new THREE.CSS2DObject( label );
      jointLabel.name = 'label';
      jointLabel.visible = config[ 'joint.label' ];
      jointLabel.position.set( 0.5, 0.5, 0.5 );
      joint.add( jointLabel );
      
      // set position
      parent.position.set( x, y, z );

      // add parent to scene
      model.getObjectByName( 'joints' ).add( parent );

      resolve();
    }
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
      if ( structure.joints.hasOwnProperty( name ) ) {
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
}

function deleteJoint( name ) {
  // delete a joint

  // get the joint
  let joint = model.getObjectByName( 'joints' ).getObjectByName( name );

  // remove the label
  joint.remove( joint.getObjectByName( 'label' ) );

  // remove joint of the scene
  joints.remove( joint );
  
  // remove joint from structure
  delete structure.joints[name];
}

function createFoundation() {
  // create a foundation

  var foundationMaterial;

  // foundation material
  switch ( config[ 'model.axisUpwards' ] )  {
    case 'x':
      foundationMaterial = xSupportMaterial;
      break;
    case 'y':
      foundationMaterial = ySupportMaterial;
      break;
    case 'z':
      foundationMaterial = zSupportMaterial;
      break;
  }

  // create foundation
  var foundation = new THREE.Mesh( foundationGeometry, foundationMaterial );
  foundation.name = 'foundation';

  // create edges
  var foundationEdgesGeometry = new THREE.EdgesGeometry( foundationGeometry );
  var foundationEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );  
  var foundationEdges = new THREE.LineSegments( foundationEdgesGeometry, foundationEdgesMaterial );
  foundationEdges.name = 'foundationEdges';

  // add edges
  foundation.add( foundationEdges );

  // set rotation
  var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
  foundation.quaternion.copy( quaternion );

  // set scale 
  foundation.scale.set( config[ 'support.foundation.size' ], config[ 'support.foundation.size' ], config[ 'support.foundation.depth' ] );

  return foundation;
}

function createPedestal() {
  // create a pedestal

  // create pedestal
  var pedestal = new THREE.Mesh( pedestalGeometry, pedestalMaterial );
  pedestal.name = 'pedestal';

  // create edges
  var pedestalEdgesGeometry = new THREE.EdgesGeometry( pedestalGeometry );
  var pedestalEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
  var pedestalEdges = new THREE.LineSegments( pedestalEdgesGeometry, pedestalEdgesMaterial );
  pedestalEdges.name = 'edges';

  // add edges
  pedestal.add( pedestalEdges );
  
  // set quaternion
  var quaternion = new THREE.Quaternion().copy( model.quaternion );
  quaternion.inverse();

  // set position
  pedestal.position.setZ( -config[ 'support.pedestal.size' ] / 2 ).applyQuaternion( quaternion );

  // set scale
  pedestal.scale.setScalar( config[ 'support.pedestal.size' ] );

  return pedestal;
}

function createPin() {
  
  // create a pin
  var color1;
  var color2;

  switch ( config[ 'model.axisUpwards'] ) {
    case 'x':
      color1 = ySupportMaterial;
      color2 = zSupportMaterial;
      break;
    case 'y':
      color1 = zSupportMaterial;
      color2 = xSupportMaterial;
      break;
    case 'z':
      color1 = xSupportMaterial;
      color2 = ySupportMaterial;
      break;
  }

  // create pin
  var pin = new THREE.Mesh( pinGeometry, [ color1, color2, color1, color2 ] );
  pin.name = 'pin';

  // create edges
  var pinEdgesGeometry = new THREE.EdgesGeometry( pinGeometry );
  var pinEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
  var pinEdges = new THREE.LineSegments( pinEdgesGeometry, pinEdgesMaterial );
  pinEdges.name = 'edges';

  // add edges
  pin.add( pinEdges );
  
  // set scale
  pin.scale.set( config[ 'support.pin.radius' ], config[ 'support.pin.radius' ], config[ 'support.pin.height' ] );

  // set quaternion
  var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
  pin.quaternion.copy( quaternion );

  return pin;
}

function createDisplacementSupport( axis ) {
  // create a displacement support
  var displacementSupport = new THREE.Group();

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  var arrow, circle;

  var circleGeometry = new THREE.CircleBufferGeometry( 1, 32 );
  circleGeometry.rotateX( -Math.PI / 2 );
  circleGeometry.rotateZ( -Math.PI / 4 );
  circleGeometry.scale( 0.1, 0.1, 0.1 ); 

  // create displacementSupport
  switch ( axis ) {
    case 'x': 
      arrow = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0,  0, 0 ), 1, xSupportMaterial.color.getHex() )
      circle = new THREE.Mesh( circleGeometry, xSupportMaterial );
      break;
    case 'y':
      arrow = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), 1, ySupportMaterial.color.getHex() );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      circle = new THREE.Mesh( circleGeometry, ySupportMaterial );
      break;
    case 'z':
      arrow = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0,  0, 0 ), 1, zSupportMaterial.color.getHex() );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      circle = new THREE.Mesh( circleGeometry, zSupportMaterial );
      break;
  }
  
  circle.position.set( 0, 0.5, 0 );

  arrow.add( circle );

  arrow.applyQuaternion( quaternion );
  arrow.position.set( -1, 0, 0 ).applyQuaternion( quaternion );

  arrow.name = 'arrow';
  circle.name = 'circle';

  displacementSupport.add( arrow );
  // set size

  return displacementSupport;
}

function createRotationSupport( axis ) {
  // create a rotational suppoort
  
  var rotationSupport = new THREE.Group();

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  // head arrow
  var coneGeometry = new THREE.ConeBufferGeometry();
  coneGeometry.translate( 0, 0.5, 0 );
  
  // curve arrow
  var circumferenceCurve = new THREE.EllipseCurve( 0, 0, 1, 1, 0, 5 * Math.PI / 4 );
  var points = circumferenceCurve.getPoints( 32 );
  var circumferenceGeometry = new THREE.BufferGeometry().setFromPoints( points );
  circumferenceGeometry.rotateY( Math.PI / 2 );

  // restrain symbol 
  var circleGeometry = new THREE.CircleBufferGeometry( 1, 32 );
  circleGeometry.rotateX( -Math.PI / 2 );
  circleGeometry.rotateZ( -Math.PI / 4 );
  circleGeometry.scale( 0.1, 0.1, 0.1 );
  
  var circumferenceMaterial;
  var cone;
  var circle;

  switch ( axis ) {
    case'x':
      circumferenceMaterial = new THREE.LineBasicMaterial( { color: xSupportMaterial.color } );
      cone = new THREE.Mesh( coneGeometry, xSupportMaterial );
      circle = new THREE.Mesh( circleGeometry, xSupportMaterial );
      break;
    case 'y':
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      circumferenceMaterial = new THREE.LineBasicMaterial( { color: ySupportMaterial.color } );
      cone = new THREE.Mesh( coneGeometry, ySupportMaterial );
      circle = new THREE.Mesh( circleGeometry, ySupportMaterial );
      break;
    case 'z':
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      circumferenceMaterial = new THREE.LineBasicMaterial( { color: zSupportMaterial.color } );
      cone = new THREE.Mesh( coneGeometry, zSupportMaterial );
      circle = new THREE.Mesh( circleGeometry, zSupportMaterial );
      break;
  }

  var circumference = new THREE.Line( circumferenceGeometry, circumferenceMaterial );
  circumference.position.set( -0.5, 0, 0 );
  circumference.scale.setScalar( 0.5 );
  
  cone.position.set( 0, points[ points.length - 1 ].x, -points[ points.length - 1 ].x );
  cone.rotateX( 5 * Math.PI / 4 );
  cone.scale.set( 0.05, 0.5, 0.05 );

  circle.position.set( 0, 1, 0 );

  circumference.name = 'circumference';
  cone.name = 'cone';
  circle.name = 'circle';
  
  circumference.add( cone );
  circumference.add( circle );

  rotationSupport.add( circumference );

  rotationSupport.quaternion.copy( quaternion );

  return rotationSupport;
}

function createSupport( ux, uy, uz, rx, ry, rz ) {
  // create a support

  var support = new THREE.Group();

  // create analytical support
  var analytical = new THREE.Group();

  if ( ux ) analytical.add( createDisplacementSupport( 'x' ) );
  if ( uy ) analytical.add( createDisplacementSupport( 'y' ) );
  if ( uz ) analytical.add( createDisplacementSupport( 'z' ) );
  if ( rx ) analytical.add( createRotationSupport( 'x' ) );
  if ( ry ) analytical.add( createRotationSupport( 'y' ) );
  if ( rz ) analytical.add( createRotationSupport( 'z' ) );

  // create space support
  var space = new THREE.Group();

  // fallback mode
  if ( !ux || !uy || !uz ) {
    // space.copy( analytical );
    if ( ux ) space.add( createDisplacementSupport( 'x' ) );
    if ( uy ) space.add( createDisplacementSupport( 'y' ) );
    if ( uz ) space.add( createDisplacementSupport( 'z' ) );
    if ( rx ) space.add( createRotationSupport( 'x' ) );
    if ( ry ) space.add( createRotationSupport( 'y' ) );
    if ( rz ) space.add( createRotationSupport( 'z' ) );
  }

  // con las coordenadas identificar en que cara del cubo está el apoyo
  // aun no tengo un ejercicio el cual pueda usar para desarrollar esta herramienta
  // a al espera de ejemplos de mayor complejidad

  // var box = new THREE.Box3();
  // box.setFromObject( joints );

  // var boxHelper = new THREE.BoxHelper( joints, 0xffff00 );
  // scene.add( boxHelper );

  // var vector = new THREE.Vector3();
  // for ( var joint of joints.children ) {
  //   box.clampPoint( joint.position, vector );
  //   console.log( joint.name, vector );
  // }
  
  var quaternion = model.quaternion.clone().inverse();

  // fixed
  if ( ux && uy && uz && rx && ry && rz ) {
    // create foundation
    var foundation = createFoundation();
    // set position
    foundation.position.setZ( -( config [ 'support.pedestal.size' ] ) ).applyQuaternion( quaternion );
    space.add( foundation );

    // create pedestal
    var pedestal = createPedestal();
    space.add( pedestal );
  }

  // pined
  if ( ux && uy && uz && !rx && !ry && !rz ) {
    // create foundation
    var foundation = createFoundation();
    foundation.position.setZ( -( config[ 'support.pin.height' ] ) ).applyQuaternion( quaternion );
    space.add( foundation );

    // create pin
    var pin = createPin();
    space.add( pin );
  }

  analytical.name = 'analytical';
  space.name = 'space';

  space.visible = ( config[ 'support.mode' ] == 'space' );
  analytical.visible = ( config[ 'support.mode' ] == 'analytical' );

  support.add( analytical );
  support.add( space );

  support.name = 'support';
  support.visible = config[ 'support.visible' ];

  return support;
}

function createFrame( length, section ) {
  // create a frame

  var frame = new THREE.Group();
  var extrudeSettings = { depth: length, bevelEnabled: false };  // curveSegments: 24,

  // create wireframe
  // extrude wireFrameShape
  var wireFrame = new THREE.Mesh( new THREE.ExtrudeBufferGeometry( wireFrameShape, extrudeSettings ), frameMaterial );
  wireFrame.name = 'wireFrame';
  wireFrame.scale.set( config[ 'frame.size' ], config[ 'frame.size' ], 1 );
  // top cover
  var wireFrameCoverTop = new THREE.LineSegments( new THREE.EdgesGeometry( new THREE.ShapeBufferGeometry( wireFrameShape ) ), new THREE.LineBasicMaterial( { color: config[ 'frame.color' ] } ) );
  wireFrameCoverTop.name = 'top';
  wireFrame.add( wireFrameCoverTop );
  // botom cover
  var wireFrameCoverBottom = wireFrameCoverTop.clone();
  wireFrameCoverBottom.name = 'bottom';
  wireFrameCoverBottom.position.setZ( length );
  wireFrame.add( wireFrameCoverBottom );

  // create extrude frame
  var extrudeFrame;  
  if ( structure.sections[section].type == 'Section' ) {
    // fallback mode
    extrudeFrame = wireFrame.clone();
  } else {
    // extrude cross section
    var extrudeFrameGeometry = new THREE.ExtrudeBufferGeometry( sections[section], extrudeSettings );
    extrudeFrame = new THREE.Mesh( extrudeFrameGeometry, frameMaterial );
    // add edges to frame
    var edgesExtrudeFrame = new THREE.LineSegments( new THREE.EdgesGeometry( extrudeFrameGeometry ), new THREE.LineBasicMaterial( { color: config[ 'frame.color'] } ) )
    edgesExtrudeFrame.name = 'edges';
    extrudeFrame.add( edgesExtrudeFrame );
  }
  extrudeFrame.name = 'extrudeFrame';

  // x local along frame
  var quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), 2 * Math.PI / 3 );
  extrudeFrame.quaternion.copy( quaternion );
  wireFrame.quaternion.copy( quaternion );

  // middle frame at origin
  var position = new THREE.Vector3( -length / 2, 0, 0 );
  extrudeFrame.position.copy( position );
  wireFrame.position.copy( position );

  // set visibility
  if ( config[ 'frame.view' ] == 'wireframe' ) extrudeFrame.visible = false;
  if ( config[ 'frame.view' ] == 'extrude' ) wireFrame.visible = false;

  // wireFrame.castShadow = true;
  // wireFrame.receiveShadow = true;

  // extrudeFrame.castShadow = true;
  // extrudeFrame.receiveShadow = true;

  // add wire frame and extrudeFrame
  frame.add( wireFrame );
  frame.add( extrudeFrame );

  return frame;
}

function createSection() { return wireFrameShape };

function createRectangularSection( widht, height ) { return new THREE.Shape().moveTo(  widht / 2, -height / 2 ).lineTo(  widht / 2,  height / 2 ).lineTo( -widht / 2,  height / 2 ).lineTo( -widht / 2, -height / 2 ) };

function createJoint( size ) {
  // create a joint

  var joint = new THREE.Mesh( jointGeometry, jointMaterial );

  joint.name = "joint";
  joint.visible = config[ 'joint.visible' ];
  joint.scale.setScalar( size );
  
  return joint;
}

function createGround( size, divisions, color, transparent, opacity, colorCenterLine, colorGrid ) {
  // create the ground

  var ground = new THREE.Group();
  ground.name = 'ground';
  ground.visible = config[ 'ground.visible' ];

  var grid = createGrid( divisions, colorCenterLine, colorGrid );
  ground.add( grid );
  
  var planeGometry = new THREE.PlaneBufferGeometry();
  var planeMaterial = new THREE.MeshBasicMaterial( { color: color, transparent: transparent, opacity: opacity, side: THREE.DoubleSide } );
  var plane = new THREE.Mesh( planeGometry, planeMaterial );
  plane.name = 'plane';
  ground.add( plane );
  
  // set size
  ground.scale.setScalar( size );

  // receive shadow
  // parent.receiveShadow = true;
  
  return ground;
}

function createGrid( divisions, colorCenterLine, colorGrid ) {
  // create a grid

  var grid = new THREE.GridHelper( 1, divisions, colorCenterLine, colorGrid );
  
  grid.name = 'grid';
  grid.visible = config[ 'ground.grid.visible' ];
  grid.rotation.x = Math.PI / 2;  // rotate grid to plane xy

  return grid;
}

function setGroundVisible( visible ) { scene.getObjectByName( 'ground' ).visible = visible };

function setGroundSize( size ) { scene.getObjectByName( 'ground' ).scale.setScalar( size ) } ;

function setPlaneVisible( visible ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).visible = visible };

function setPlaneColor( color ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.color = new THREE.Color( color ) };

function setPlaneTransparent( transparent ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.transparent = transparent };

function setPlaneOpacity( opacity ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.opacity = opacity }

function setGridVisible( visible ) { scene.getObjectByName( 'ground' ).getObjectByName( 'grid' ).visible = visible };

function setGridDivisions( divisions ) {
  // set grid divisions

  var ground = scene.getObjectByName( 'ground' );

  ground.remove( ground.getObjectByName( 'grid' ) );
  ground.add( createGrid( divisions, config[ 'ground.grid.major' ], config[ 'ground.grid.menor' ] ) );
}

function setGridMajor( color ) {
  // set grid major divisions color

  var ground = scene.getObjectByName( 'ground' );

  ground.remove( ground.getObjectByName( 'grid' ) );
  ground.add( createGrid( config[ 'ground.grid.divisions' ], color, config[ 'ground.grid.minor' ] ) );
}

function setGridMenor( color ) {
  // set grid menor divisions color

  var ground = scene.getObjectByName( 'ground' );

  ground.remove( ground.getObjectByName( 'grid' ) );
  ground.add( createGrid( config[ 'ground.grid.divisions' ], config[ 'ground.grid.major' ], color ) );
}

function setFrameAxes( visible ) { model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'axes' ).visible = visible ) };

function setFrameLabel( visible ) { model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'label' ).visible = visible ) };

function setJointLabel( visible ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'label' ).visible = visible ) };

function setFrameColor( color ) {
  // set frame color
  var wireframe, extrudeFrame;
  var color = new THREE.Color( color );

  frameMaterial.color = color;

  for ( let frame of model.getObjectByName( 'frames' ).children ) {
    wireframe = frame.getObjectByName( 'wireFrame' );
    wireframe.getObjectByName( 'top' ).material.color = color;
    wireframe.getObjectByName( 'bottom' ).material.color = color;

    extrudeFrame = frame.getObjectByName( 'extrudeFrame' ).getObjectByName( 'edges' ).material.color = color;
  }
}

function setFrameTransparent( transparent ) { frameMaterial.transparent = transparent };

function setFrameOpacity( opacity ) { frameMaterial.opacity = opacity };

function setJointColor( color ) { jointMaterial.color = new THREE.Color( color ) };

function setJointTransparent( transparent ) { jointMaterial.transparent = transparent };

function setJointOpacity( opacity ) { jointMaterial.opacity = opacity };

function setPinRadius( radius ) {
  // set pin radius

  var support, pin, foundation;

  for ( const name in structure.supports ) {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pin = support.getObjectByName( 'pin' );
    foundation = support.getObjectByName( 'foundation' );

    if ( pin && foundation ) {
      // set radius
      pin.scale.set( radius, radius, config[ 'support.pin.height' ] );

      // set position
      var quaternion = model.quaternion.clone().inverse();
      var position = new THREE.Vector3( 0, 0, -( config[ 'support.pin.height' ] + config[ 'support.foundation.depth' ] / 2 ) ).applyQuaternion( quaternion );
      foundation.position.copy( position );
    }
  }
}

function setPinHeight( height ) {
  // set pin height

  var support, pin, foundation;

  for ( const name in structure.supports ) {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pin = support.getObjectByName( 'pin' );
    foundation = support.getObjectByName( 'foundation' );

    if ( pin && foundation ) {
      // set scale
      pin.scale.set( config[ 'support.pin.radius' ], config[ 'support.pin.radius' ], height );

      // set position
      foundation.position.set( 0, 0, -height ).applyQuaternion( model.quaternion.clone().inverse() );
    }
  }
}

function setPedestalSize( size ) {
  // set pedestal size

  var support, pedestal, foundation;

  for ( const name in structure.supports ) {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pedestal = support.getObjectByName( 'pedestal' );
    foundation = support.getObjectByName( 'foundation' );

    if ( pedestal && foundation ) {
      // set scale
      pedestal.scale.setScalar( size );

      var quaternion = model.quaternion.clone().inverse();
      var position = new THREE.Vector3( 0, 0, -size / 2 ).applyQuaternion( quaternion );

      // set pedestal  position
      pedestal.position.copy( position );

      // set foundation position
      position.set( 0, 0, -size ).applyQuaternion( quaternion );
      foundation.position.copy( position );
    }
  }
}

function setFoundationSize( size ) {
  // set foundation size

  var foundation;

  for ( const name in structure.supports ) {
    foundation = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' );

    if ( foundation ) foundation.scale.set( size, size, config[ 'support.foundation.depth' ] );
  }
}

function setSupportMode( mode ) {
  // set support mode

  var support;

  for ( const name in structure.supports ) {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );

    support.getObjectByName( 'analytical' ).visible = ( mode == 'analytical' );
    support.getObjectByName( 'space' ).visible = ( mode == 'space' );
  }
}

function setFrameSize( size ) {
  // set frame size

  let frame, wireFrame, extrudeFrame, scale = new THREE.Vector3( size, size, 1 );

  for ( const name in structure.frames ) {
    frame = model.getObjectByName( 'frames' ).getObjectByName( name );
    wireFrame = frame.getObjectByName( 'wireFrame' );
    extrudeFrame = frame.getObjectByName( 'extrudeFrame');
    
    wireFrame.scale.copy( scale );
    if ( structure.sections[structure.frames[name].section].type == 'Section') extrudeFrame.scale.copy( scale );
  }
}

function setJointSize( size ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).scale.setScalar( size ) ) };

function setBackgroundColor( topColor, bottomColor ) { canvasWebGLRenderer.style.backgroundImage = "linear-gradient(" + topColor + ", " + bottomColor + ")" };

function setFramesVisible( visible ) { model.getObjectByName( 'frames' ).visible = visible };

function setJointVisible( visible ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).visible = visible ) };

function createStructure() { return { joints: {}, materials: {}, sections: {}, frames: {}, supports: {} } };

function setCameraType( type ) {
  // set the camera type

  // set camera
  var quaternion = camera.quaternion.clone();
  var position = camera.position.clone();
  var zoom = camera.zoom;

  camera = createCamera( type, position );

  camera.quaternion.copy( quaternion );

  if ( type == 'perspective' ) {
    // move camera along z axis
    var worldDirection = new THREE.Vector3();

    camera.getWorldDirection( worldDirection );
    worldDirection.multiplyScalar( position.length() - 1 / ( 2 * zoom * Math.tan( ( camera.fov / 2 ) * Math.PI / 180 ) ) );

    position.add( worldDirection );
  }
  camera.position.copy( position );

  // set controls
  var target = controls.target.clone();

  controls = createControls( config[ 'controls.rotateSpeed' ], config[ 'controls.zoomSpeed' ], config[ 'controls.panSpeed' ], config[ 'controls.screenPanning' ], config[ 'controls.damping.enable' ], config[ 'controls.damping.factor' ] );
  controls.target.copy( target );
}

function createModel() {
  // create the model

  var model = new THREE.Group();

  var axes = new THREE.AxesHelper();
  axes.name = 'axes';
  axes.visible = config['model.axes.visible'];
  axes.scale.setScalar( config['model.axes.size'] );
  model.add( axes );
  
  var joints = new THREE.Group();
  joints.name = 'joints';
  model.add( joints );
  
  var frames = new THREE.Group();
  frames.name = 'frames';
  model.add( frames );

  return model;
}

function createCamera( type, position ) {
  // create the camera

  var camera;

  var fov = config[ 'camera.perspective.fov' ];
  var near = config[ 'camera.perspective.near' ];
  var far = config[ 'camera.perspective.far' ];
  var aspect = canvasWebGLRenderer.clientWidth / canvasWebGLRenderer.clientHeight;

  if ( type == 'perspective' ) {
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  } else if ( type == 'orthographic' ) {
    camera = new THREE.OrthographicCamera( -0.5 * aspect, 0.5 * aspect, 0.5, -0.5, near, far );
    camera.zoom = 1 / ( 2 * Math.tan( ( fov / 2 ) * Math.PI / 180 ) * position.length() );
  }

  camera.up.set( 0, 0, 1 );
  camera.position.copy( position );
  camera.lookAt( 0, 0, 0 );
  camera.updateProjectionMatrix();

  return camera;
}

function render() {
  // render the scene

  requestAnimationFrame( render );

  stats.update();

  webGLRenderer.render( scene, camera );
  CSS2DRenderer.render( scene, camera );

  if ( controls.enableDamping ) controls.update();
}

function initStats() {
  // init stats
  
  var stats = new Stats();
  document.getElementById( "Stats-output" ).appendChild( stats.domElement );

  return stats;
}

function loadJSON( json ) {
  // load json
  
  return fetch( json + "?nocache=" + new Date().getTime() )
    .then( response => {
      if ( !response.ok ) throw new Error( 'Network response was not ok' );
      return response.json();
    })
    .catch( error => console.log( 'There has been a problem with your fetch operation:', error ) );
}

function onResize() {
  // resize scene renderer

  camera.aspect = canvasWebGLRenderer.clientWidth / canvasWebGLRenderer.clientHeight;
  camera.updateProjectionMatrix();

  webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
}

window.addEventListener( "resize", onResize, false );