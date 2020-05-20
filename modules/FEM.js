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

var xSupportMaterial, ySupportMaterial, zSupportMaterial;
var pedestalMaterial;

var foundationGeometry, pedestalGeometry, pinGeometry;

// , rGeometry;

//
var materials = {};
var sections = {};

function init() {
  // load the json config
  loadJSON("./config.json")
    .then(function ( json ) {
      // set the config
      config = json.remembered[json.preset]["0"];

      // create the structure
      structure = createstructure();
      
      // set the background
      setBackgroundColor( config.background.topColor, config.background.bottomColor );
      
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
      model = new THREE.Group();

      // create the camera
      camera = createCamera( config.camera.type, new THREE.Vector3( config.camera.position.x, config.camera.position.y, config.camera.position.z ) );

      // create axes
      var axes = new THREE.AxesHelper();
      axes.name = 'axes';
      axes.visible = config.model.axes;
      // add to model
      model.add( axes );
      
      // create the plane
      plane = createPlane( config.plane.size, config.plane.divisions, config.plane.color, config.plane.transparent, config.plane.opacity, config.plane.grid.major, config.plane.grid.minor );
      plane.position.set( 0, 0, -0.01 );
      // add the plane to the scene
      scene.add( plane );

      // set the joints
      joints = new THREE.Group();
      joints.name = 'joints';
      joints.visible = config.jointVisible;
      // set the geometry
      jointGeometry = new THREE.SphereGeometry( 1, 32, 32 );
      // set the material
      jointMaterial = new THREE.MeshBasicMaterial( { color: config.joint.color, transparent: config.joint.transparent, opacity: config.joint.opacity } );
      // add to the model
      model.add( joints );
      
      // set the frames
      frames = new THREE.Group();
      frames.name = 'frames';
      frames.visible = config.frame.visible;
      // set the material
      frameMaterial = new THREE.MeshBasicMaterial( { color: config.frame.color, transparent: config.frame.transparent, opacity: config.frame.opacity } );
      // set the shape
      wireFrameShape = new THREE.Shape().absarc();
      // add to the scene
      model.add( frames );

      // set the supports
      // material
      xSupportMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
      ySupportMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      zSupportMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );

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

      // rGeometry = new THREE.BoxBufferGeometry();

      // set the upwards axis
      setUpwardsAxis( config.model.axisUpwards );

      // add model to scene
      scene.add( model );

      // create the stats
      stats = initStats();

      // create the WebGL renderer
      webGLRenderer = new THREE.WebGLRenderer( { canvas: canvasWebGLRenderer, alpha: true, antialias: true } );
      // set pixel ratio
      webGLRenderer.setPixelRatio( window.devicePixelRatio );
      // set the size
      webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
      // shadows
      webGLRenderer.shadowMap.enabled = true;

      // create the CSS2D renderer
      CSS2DRenderer = new THREE.CSS2DRenderer();
      CSS2DRenderer.setSize( canvasCSS2DRenderer.clientWidth, canvasCSS2DRenderer.clientHeight );
      CSS2DRenderer.domElement.style.position = 'absolute';
      CSS2DRenderer.domElement.style.top = 0;
      canvasCSS2DRenderer.appendChild( CSS2DRenderer.domElement );

      // create the controls
      controls = createControls( config.controls.rotateSpeed, config.controls.zoomSpeed, config.controls.panSpeed, config.controls.screenPanning, config.controls.damping.enable, config.controls.damping.factor );

      return json;
    })
    .then(function ( json ) {
      // create the dat gui
      gui = new dat.GUI( { load: json, preset: json.preset } );

      // remember config
      // gui.remember( config );

      // close controllers
      gui.open();
      
      // add model folder
      let modelFolder = gui.addFolder( "model" );

      // set control axisUpwards
      modelFolder.add( config.model, 'axisUpwards' ).options( [ 'x', 'y', 'z' ] ).onChange( ( axis ) => setUpwardsAxis( axis ) ).listen();

      // set control axes
      modelFolder.add( config.model, 'axes' ).onChange( ( visible ) => model.getObjectByName( 'axes' ).visible = visible );

      // add a light folder
      // let lightsFolder = gui.addFolder( "light");

      // add a ambiernt folder

      // let ambientFolder = lightsFolder.addFolder( "ambient" );

      // add colot controller
      // ambientFolder.addColor( config.lights.ambient, 'color' ).onChange( color => ambientLight.color = new THREE.Color( color ) );

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
      planeFolder.close();

      // set visible plane
      planeFolder.add( config.plane, 'visible' ).onChange( ( visible ) => scene.getObjectByName( 'plane' ).getObjectByName( '_plane' ).visible = visible );

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

      // add grid folder
      let gridFolder = planeFolder.addFolder( "grid" );

      // set control visible
      gridFolder.add( config.plane.grid, "visible" ).onChange( visible => scene.getObjectByName( 'plane' ).getObjectByName( 'grid' ).visible = visible );

      // set control major color
      gridFolder.addColor( config.plane.grid, 'major' ).onChange( ( color ) => setCenterLineColor( color ));

      // add a grid folder
      gridFolder.addColor( config.plane.grid, "menor" ).onChange( ( color ) => setGridColor( color ));

      // add a Joint folder
      let jointFolder = gui.addFolder( "joint" );

      // set joints visible
      jointFolder.add( config.joint, 'visible' ).onChange( ( visible ) => setJointsVisible( visible ));

      // set control joint size
      jointFolder.add( config.joint, "size" ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( ( size ) => setJointSize( size ) );
      
      // set view joint's label
      jointFolder.add( config.joint, 'label' ).onChange( ( visible ) => setViewJointLabel( visible ) );

      // set control joint color
      jointFolder.addColor( config.joint, "color" ).onChange( ( color ) => setJointColor( color ) );

      // set transparent joint
      jointFolder.add( config.joint, 'transparent' ).onChange( ( transparent ) => setJointTransparent( transparent ) );

      // set opacity joint
      jointFolder.add( config.joint, 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( ( opacity ) => setJointOpacity( opacity ));

      // add a frame folder
      let frameFolder = gui.addFolder( "frame" );

      // set joints visible
      frameFolder.add( config.frame, 'visible' ).onChange( ( visible ) => setFramesVisible( visible ));

      // set control view
      frameFolder.add( config.frame, 'view', [ 'wireframe', 'extrude' ] ).onChange( ( view )  => setViewType( view ) );

      // set the control frame size
      frameFolder.add( config.frame, 'size' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( ( size ) => setFrameSize( size ) );

      // set control frame color
      frameFolder.addColor( config.frame, 'color' ).onChange( ( color ) => setFrameColor( color ) );

      // set control frame transparent
      frameFolder.add( config.frame, 'transparent' ).onChange( ( transparent ) => setFrameTransparent( transparent ) );

      // set control frame opcity
      frameFolder.add( config.frame, 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( ( opacity ) => setFrameOpacity( opacity ) );

      // set view frame's label
      frameFolder.add( config.frame, 'label' ).onChange( ( visible ) => setViewFrameLabel( visible ) );

      // set view frame's axes
      frameFolder.add( config.frame, 'axes' ).onChange( ( visible ) => setFramesAxesDisplay( visible ) );

      // add support folder
      let supportFolder = gui.addFolder( "support" );

      // add foundation folder
      let foundationFolder = supportFolder.addFolder( "foundation" );

      // set control size
      foundationFolder.add( config.support.foundation, 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setFoundationSize( size ) );

      // add pedestal folder
      let pedestalFolder = supportFolder.addFolder( "pedestal" );

      // set control size
      pedestalFolder.add( config.support.pedestal, 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPedestalSize( size ) );

      // add pin folder
      let pinFolder = supportFolder.addFolder( "pin" );

      // set control height
      pinFolder.add( config.support.pin, 'height' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPinHeight( size ) );

      // set control radius
      pinFolder.add( config.support.pin, 'radius' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( radius => setPinRadius( radius ) );

      // set control radius
      // supportFolder.add( config.support, 'radius' ).min( 0.01 ).max( 0.1 ).step( 0.001 ).onChange( ( radius ) => setSupportRadius( radius ) );
    })
    .then( function() {
      render();
    })
    .catch(function ( error ) {
      console.log( "Error occurred in sequence:", error );
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
      // set model rotation and foundationMaterial
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
      
      // redraw the supports
      for ( let [ joint, support ] of Object.entries( structure.supports ) ) {
        // get joint
        joint = joints.getObjectByName( joint );
        
        // remove support
        joint.remove( joint.getObjectByName( 'support' ) );

        // add support
        joint.add( createSupport( support.ux, support.uy, support.uz, support.rx, support.ry, support.rz ) );
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
      reject( new Error( viewType + " does not exits" ) );
    }
  });

  return promise; 
}

export function open( filename ) {
  // open a file

  var promise = loadJSON( filename )
    .then(function ( json ) {

      // delete joints label
      for ( const joint of joints.children ) joint.getObjectByName( 'joint' ).remove( joint.getObjectByName( 'joint' ).getObjectByName( 'label') );

      // delete frames label
      for ( const frame of frames.children ) frame.remove( frame.getObjectByName( 'label' ) );

      // delete joints
      joints.children = [];

      // delete frames
      frames.children = [];

      // create structure
      structure = createstructure();
      
      // add joints
      for ( const key in json.joints ) addJoint( key, json.joints[key].x, json.joints[key].y, json.joints[key].z );

      // add materials
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

      // add suports
      for ( const key in json.supports ) addSupport( key, json.supports[key].ux, json.supports[key].uy, json.supports[key].uz, json.supports[key].rx, json.supports[key].ry, json.supports[key].rz );

      return;
    })
    .catch(function ( e ) {
      throw e;
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

        // get joint
        joint = joints.getObjectByName( joint );

        // add support
        joint.add( support );

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
        j = joints.getObjectByName( j );
        k = joints.getObjectByName( k );
    
        // get local axis
        var x_local =  k.position.clone().sub( j.position );
    
        // create frame
        var frame = createFrame( x_local.length(), structure.frames[name].section );
    
        // set name
        frame.name = name;
    
        // add axes
        var axes = new THREE.AxesHelper();
        axes.name = 'axes';
        axes.visible = config.frame.axes;
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
        frameLabel.visible = config.frame.label;
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
    if ( structure.joints.hasOwnProperty( name ) || Object.values( structure.joints ).some( joint => joint.x == x && joint.y == y && joint.z == z ) ) {
      if ( structure.joints.hasOwnProperty( name ) ) {
        reject( new Error( "joint's name '" + name + "' already exist" ) );
      } else {
        reject( new Error( "joint's coordinate [" + x + ", " + y + ", " + z + "] already exist" )); 
      }
    } else {
      // add joint to structure
      structure.joints[name] = { x: x, y: y, z: z };

      // create joint
      var joint = new THREE.Object3D();
      joint.name = name;
    
      // create sphere
      var _joint = createJoint( config.joint.size );
      _joint.name = "joint";
      _joint.visible = config.joint.visible;
      joint.add( _joint );
  
      // set position
      joint.position.set( x, y, z );
  
      // add label
      const label = document.createElement( 'div' );
      label.className = 'joint';
      label.textContent = name;
      var jointLabel = new THREE.CSS2DObject( label );
      jointLabel.name = 'label';
      jointLabel.visible = config.joint.label;
      jointLabel.position.set( 2, 2, 2 );
      _joint.add( jointLabel );
      // joint.label = label;
      
      // add joint to scene
      joints.add( joint );
  
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

function createFoundation() {
  // create a foundation

  var foundationMaterial;

  // foundation material
  switch ( config.model.axisUpwards )  {
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
  foundation.scale.set( config.support.foundation.size, config.support.foundation.size, config.support.foundation.depth );

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
  pedestal.position.setZ( -config.support.pedestal.size / 2 ).applyQuaternion( quaternion );

  // set scale
  pedestal.scale.setScalar( config.support.pedestal.size );

  return pedestal;
}

function createPin() {
  
  // create a pin
  var color1;
  var color2;

  switch ( config.model.axisUpwards ) {
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
  pin.scale.set( config.support.pin.radius, config.support.pin.radius, config.support.pin.height );

  // set quaternion
  var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
  pin.quaternion.copy( quaternion );

  return pin;
}

function createSupport( ux, uy, uz, rx, ry, rz ) {
  // create a support

  var support = new THREE.Group();
  
  // fixed
  if ( ux && uy && uz && rx && ry && rz ) {
    // create foundation
    var foundation = createFoundation();
    // set position
    foundation.position.setZ( -( config.support.pedestal.size + config.support.foundation.depth / 2 ) ).applyQuaternion( new THREE.Quaternion().copy( model.quaternion ).inverse() );
    support.add( foundation );

    // pedestal
    var pedestal = createPedestal();
    support.add( pedestal );
  }

  // pined
  if ( ux && uy && uz && !rx && !ry && !rz ) {
    // create foundation
    var foundation = createFoundation();
    foundation.position.setZ( -( config.support.pin.height + config.support.foundation.depth / 2 ) ).applyQuaternion( new THREE.Quaternion().copy( model.quaternion ).inverse() );
    support.add( foundation );

    // create pin
    var pin = createPin();
    support.add( pin );
  }

  // if ( config.model.axisUpwards == 'x' ) axis = 0;
  // if ( config.model.axisUpwards == 'y' ) axis = 1;
  // if ( config.model.axisUpwards == 'z' ) axis = 2;

  // var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  // var quaternion = new THREE.Quaternion();

  // var mesh;
  // var uScale = new THREE.Vector3( config.support.radius, config.support.length, config.support.radius );
  // var rScale = new THREE.Vector3( config.support.rotation.thickness, 1, 1 );

  // if ( ux ) {
  //   mesh = new THREE.Mesh( uGeometry, uxMaterial );
  //   mesh.quaternion.copy( quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 ) );
  //   mesh.scale.copy( uScale );
  //   u.add( mesh );
  // }
  // if ( uy ) {
  //   mesh = new THREE.Mesh( uGeometry, uyMaterial );
  //   mesh.scale.copy( uScale );
  //   u.add( mesh );
  // }
  // if ( uz ) {
  //   mesh = new THREE.Mesh( uGeometry, uzMaterial );
  //   mesh.scale.copy( uScale );
  //   mesh.quaternion.copy( quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 ) );
  //   u.add( mesh );
  // }
  // if ( rx ) {
  //   mesh = new THREE.Mesh( rGeometry, rxMaterial );
  //   mesh.scale.copy( rScale )
  //   mesh.quaternion.copy( quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 ) );
  //   r.add( mesh );
  // }
  // if ( ry ) {
  //   mesh = new THREE.Mesh( rGeometry, ryMaterial );
  //   mesh.scale.copy( rScale )
  //   mesh.quaternion.copy( quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 ) );
  //   r.add( mesh );
  // }
  // if ( rz ) {
  //   mesh = new THREE.Mesh( rGeometry, rzMaterial );
  //   mesh.scale.copy( rScale )
  //   r.add( mesh );
  // }

  support.name = 'support';
  support.visible = config.support.visible;
  // u.name = 'u';
  // r.name = 'r';

  // r.scale.setScalar( config.support.rotation.size );

  // support.add( u );
  // support.add( r)

  return support;
}

function createFrame( length, section ) {
  // create a frame

  var parent = new THREE.Group();
  var extrudeSettings = { depth: length, bevelEnabled: false };  // curveSegments: 24, 

  // create wire frame
  var wireFrameGoemetry = new THREE.ExtrudeBufferGeometry( wireFrameShape, extrudeSettings );
  var wireFrame = new THREE.Mesh( wireFrameGoemetry, frameMaterial );
  wireFrame.scale.set( config.frame.size, config.frame.size, 1 );
  wireFrame.name = 'wireFrame';

  // wireFrame.castShadow = true;
  // wireFrame.receiveShadow = true;

  // create extrude frame
  var extrudeFrameGeometry = new THREE.ExtrudeBufferGeometry( sections[section], extrudeSettings );
  var extrudeFrame = new THREE.Mesh( extrudeFrameGeometry, frameMaterial );
  extrudeFrame.name = 'extrudeFrame';

  // extrudeFrame.castShadow = true;
  // extrudeFrame.receiveShadow = true;

  if ( structure.sections[section].type == 'Section' ) {
    // set frame size
    extrudeFrame.scale.set( config.frame.size, config.frame.size, 1 );
  } else {
    // create edges
    var frameEdgesGeomtry = new THREE.EdgesGeometry( extrudeFrameGeometry );
    var frameEdges = new THREE.LineSegments( frameEdgesGeomtry, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    frameEdges.name = 'edges';

    // add edges to frame
    extrudeFrame.add( frameEdges );
  }

  // set visibility
  if ( config.frame.view == 'wireframe' ) extrudeFrame.visible = false;
  if ( config.frame.view == 'extrude' ) wireFrame.visible = false;

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
  // set name
  parent.name = 'plane';
  // set visible
  parent.visible = config.plane.visible;

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

  // receive shadow
  parent.receiveShadow = true;
  
  return parent;
}

function createGrid( divisions, colorCenterLine, colorGrid ) {
  // create a grid

  // create the grid
  var grid = new THREE.GridHelper( 1, divisions, colorCenterLine, colorGrid );
  // set the name
  grid.name = 'grid';
  // set visible
  grid.visible = config.plane.grid.visible;
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
  plane.add( createGrid( divisions, config.plane.grid.major, config.plane.grid.menor ) );
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
  plane.add( createGrid( config.plane.divisions, config.plane.grid.major, color ) ); 
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

function setFramesAxesDisplay( visible ) {
  // set joint's label display

  for ( let frame of frames.children ) {
    frame.getObjectByName( 'axes' ).visible = visible
  }
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

function setPinRadius( radius ) {
  // set pin radius
  var pin;
  var foundation;

  for ( const joint in structure.supports ) {
    pin = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'pin' );
    foundation = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'foundation' );

    if ( pin && foundation ) {
      // set scale
      pin.scale.set( radius, radius, config.support.pin.height );

      // set position
      var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
      var position = new THREE.Vector3( 0, 0, -( config.support.pin.height + config.support.foundation.depth / 2 ) ).applyQuaternion( quaternion );
      foundation.position.copy( position );
    }
  }
}

function setPinHeight( height ) {
  // set pin size
  var pin;
  var foundation;

  for ( const joint in structure.supports ) {
    pin = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'pin' );
    foundation = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'foundation' );

    if ( pin && foundation ) {
      // set scale
      pin.scale.set( config.support.pin.radius, config.support.pin.radius, height );

      // set position
      var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
      var position = new THREE.Vector3( 0, 0, -( height + config.support.foundation.depth / 2 ) ).applyQuaternion( quaternion );
      foundation.position.copy( position );
    }
  }
}

function setPedestalSize( size ) {
  // set pedestal size

  var pedestal;
  var foundation;

  for ( const joint in structure.supports ) {
    pedestal = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'pedestal' );
    foundation = joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'foundation' );

    if ( pedestal && foundation ) {
      // set scale
      pedestal.scale.setScalar( size );


      var quaternion = new THREE.Quaternion().copy( model.quaternion ).inverse();
      var position = new THREE.Vector3( 0, 0, -size / 2 ).applyQuaternion( quaternion );

      // set pedestal  position
      pedestal.position.copy( position );

      // set foundation position
      var position = new THREE.Vector3( 0, 0, -( size + config.support.foundation.depth / 2 ) ).applyQuaternion( quaternion );
      foundation.position.copy( position );
    }
  }
}

function setFoundationSize( size ) {
  // set foundation size

  for ( const joint in structure.supports ) {
    joints.getObjectByName( joint ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).scale.set( size, size, config.support.foundation.depth );
  }
}

function setFrameSize( size ) {
  // set frame's size

  let scale = new THREE.Vector3( size, size, 1 );
  let frame, wireFrame, extrudeFrame;

  for ( const name in structure.frames ) {
    frame = frames.getObjectByName( name );
    wireFrame = frame.getObjectByName( 'wireFrame' );
    extrudeFrame = frame.getObjectByName( 'extrudeFrame');
    
    wireFrame.scale.copy( scale );
    if ( structure.sections[structure.frames[name].section].type == 'Section') extrudeFrame.scale.copy( scale );
  }
}

function setJointSize( size ) {
  // set joint's size

  joints.children.forEach( joint => joint.getObjectByName( 'joint' ).scale.setScalar( size ) );
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

  joints.children.forEach( joint => joint.getObjectByName( 'joint' ).visible = visible );
}

function createstructure() {
  // create structure

  return { joints: {}, materials: {}, sections: {}, frames: {}, supports: {} };
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
  camera.lookAt( 0, 0, 0 );

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