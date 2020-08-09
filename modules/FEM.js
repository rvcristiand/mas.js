// three.js
var scene, camera, controls;
var webGLRenderer, CSS2DRenderer;

// html
var canvasWebGLRenderer = document.getElementById( "canvas" );
var canvasCSS2DRenderer = document.getElementById( "labels" );

// controls
var stats, gui;

// model
var structure, model;

// scene
var jointMaterial, frameMaterial, frameEdgesMaterial, xMaterial, yMaterial, zMaterial, foundationMaterial, foundationEdgesMaterial, pedestalMaterial, pedestalEdgesMaterial, pinEdgesMaterial, resultantForceMaterial, resultantTorqueMaterial, xLoadMaterial, xLoadEdgesMaterial, yLoadMaterial, yLoadEdgesMaterial, zLoadMaterial, zLoadEdgesMaterial;
var jointGeometry, wireFrameShape, straightShaftGeometry, headGeometry, restraintGeometry, foundationGeometry, foundationEdgesGeometry, pedestalGeometry, pedestalEdgesGeometry, pinGeometry, pinEdgesGeometry;

// light
var hemisphereLight;
var directionalLight;

var sections = {};

var loadPatternController;

// FEM.js
var config = {
  // background
  'background.topColor': '#000000',
  'background.bottomColor': '#282828',
  
  // model
  'model.axisUpwards': 'y',
  
  'model.axes.visible': true,
  'model.axes.size': 1,
  
  'model.axes.head.radius': 0.04,
  'model.axes.head.height': 0.3,
  
  'model.axes.shaft.length': 0.7, 
  'model.axes.shaft.radius': 0.01,
  
  // camera
  'camera.type': 'perspective',
  
  'camera.perspective.fov': 45,
  'camera.perspective.near': 0.1,
  'camera.perspective.far': 1000,
  
  'camera.position.x': 10,
  'camera.position.y': 10,
  'camera.position.z': 10,
  
  'camera.target.x': 0, 
  'camera.target.y': 0,
  'camera.target.z': 0,
  
  // controls
  'controls.rotateSpeed': 1,
  'controls.zoomSpeed': 1.2,
  'controls.panSpeed': 0.3,
  'controls.screenPanning': true,
  
  'controls.damping.enable': false,
  'controls.damping.factor': 0.05,
  
  // lights
  // 'lights.direction.color': 0xffffff,
  // 'lights.direction.intensity': 1,
  
  // axes
  'axes.x': '#ff0000',
  'axes.y': '#00ff00',
  'axes.z': '#0000ff',
  
  // ground
  'ground.visible': true,
  'ground.size': 20,
  
  'ground.plane.visible': false,
  'ground.plane.color': 0x000000,
  'ground.plane.transparent': true,
  'ground.plane.opacity': 0.5,
  
  'ground.grid.visible': true,
  'ground.grid.divisions': 20,
  'ground.grid.major': 0xff0000,
  'ground.grid.minor': 0xffffff,
  
  // joint
  'joint.visible': true,
  'joint.size': 0.03,
  'joint.color': 0xffff00,
  'joint.transparent': true,
  'joint.opacity': 1,
  'joint.label': false,
  
  // frame
  'frame.visible': true,
  'frame.view': 'extrude',
  'frame.size': 0.02,
  'frame.color': 0xff00ff,
  'frame.transparent': true,
  'frame.opacity': 0.5,
  'frame.label': false,
  
  'frame.axes.visible': true,
  'frame.axes.size': 1,
  
  'frame.axes.head.radius': 0.04,
  'frame.axes.head.height': 0.3,
  
  'frame.axes.shaft.length': 0.7,
  'frame.axes.shaft.radius': 0.01,
  
  // support
  'support.visible': true,
  'support.mode': 'space',
  
  'support.analytical.size': 1,
  
  'support.analytical.head.radius': 0.04,
  'support.analytical.head.height': 0.3,
  
  'support.analytical.shaft.tube' : 0.04,
  'support.analytical.straightShaft.length': 1,
  'support.analytical.curveShaft.radius': 1,
  
  'support.analytical.restraint.radius': 0.1,
  'support.analytical.restraint.thickness': 0.01,
  
  'support.foundation.size': 0.5,
  'support.foundation.depth': 0.05,
  
  'support.pedestal.size': 0.3,
  
  'support.pin.height': 0.3,
  'support.pin.radius': 0.3,
  
  // load
  'load.loadPattern': '',
  'load.visible': true,
  'load.system': 'global',
  
  'load.head.radius': 0.05,
  'load.head.height': 0.3,
  'load.shaft.tube' : 0.02,
  
  'load.as': 'components',
  
  'load.force.scale': 1,
  'load.torque.scale': 1,

  'load.resultant.force': 0x000000,
  'load.resultant.torque': 0x000000,
  
  'load.frames.force.scale': 1,
  'load.frames.torque.scale': 0.5,
  
  'load.frames.transparent': true,
  'load.frames.opacity': 0.2
};

function init() {
  // refresh the config
  var json = JSON.parse( localStorage.getItem( window.location.href + '.gui' ) );
  if ( json ) for ( let [ key, value ] of Object.entries( json.remembered[ json.preset ][ '0' ] ) ) config[ key ] = value;
  
  // set the background
  setBackgroundColor( config[ 'background.topColor' ], config[ 'background.bottomColor' ] );
  
  // create the scene
  scene = new THREE.Scene();
  
  // create the camera
  camera = createCamera( config[ 'camera.type' ], new THREE.Vector3( config[ 'camera.position.x' ], config[ 'camera.position.y' ], config[ 'camera.position.z' ] ), new THREE.Vector3( config[ 'camera.target.x' ], config[ 'camera.target.y' ], config[ 'camera.target.z' ] ) );
  
  // background
  // scene.background = new THREE.Color( 'white' ); // .setHSL( 0.6, 0, 1 )

  // fog
  // scene.fog = new THREE.Fog( scene.background, 1, 5000 );

  // hemisphereLight
  hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemisphereLight.color.setHSL( 0.6, 1, 0.6 );
  hemisphereLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemisphereLight.position.set( 0, 0, 50 );
  scene.add( hemisphereLight );

  // directionalLight
  directionalLight = new THREE.DirectionalLight( 0xffffff, config[ 'lights.direction.intensity' ] );  // config[ 'lights.direction.color' ]
  directionalLight.color.setHSL( 0.1, 1, 0.95 );
  directionalLight.position.set( -1, 1.75, 1 );
  directionalLight.position.multiplyScalar( 30 );
  scene.add( directionalLight );

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

  // create the WebGL renderer
  webGLRenderer = new THREE.WebGLRenderer( { canvas: canvasWebGLRenderer, alpha: true, antialias: true } );
  webGLRenderer.setPixelRatio( window.devicePixelRatio );
  webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
  // webGLRenderer.sortObjects = false;
  // webGLRenderer.shadowMap.enabled = true;
  
  // create the CSS2D renderer
  CSS2DRenderer = new THREE.CSS2DRenderer();
  CSS2DRenderer.setSize( canvasCSS2DRenderer.clientWidth, canvasCSS2DRenderer.clientHeight );
  canvasCSS2DRenderer.appendChild( CSS2DRenderer.domElement );
  
  // create the controls
  controls = createControls( config[ 'controls.rotateSpeed' ], config[ 'controls.zoomSpeed' ], config[ 'controls.panSpeed' ], config[ 'controls.screenPanning' ], config[ 'controls.damping.enable' ], config[ 'controls.damping.factor' ] );
  
  // set the materials
  jointMaterial = new THREE.MeshLambertMaterial( { color: config[ 'joint.color' ], transparent: config[ 'joint.transparent' ], opacity: config[ 'joint.opacity' ] } );

  frameMaterial = new THREE.MeshLambertMaterial( { color: config[ 'frame.color' ], transparent: config[ 'frame.transparent' ], opacity: config[ 'frame.opacity' ] } );
  frameEdgesMaterial = new THREE.LineBasicMaterial( { color: config[ 'frame.color' ] } ) ;

  xMaterial = new THREE.MeshLambertMaterial( { color: config[ 'axes.x' ] } );
  yMaterial = new THREE.MeshLambertMaterial( { color: config[ 'axes.y' ] } );
  zMaterial = new THREE.MeshLambertMaterial( { color: config[ 'axes.z' ] } );

  foundationMaterial = { x: xMaterial, y: yMaterial, z: zMaterial };
  foundationEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );  

  pedestalMaterial = [ xMaterial, xMaterial, yMaterial, yMaterial, zMaterial, zMaterial ];
  pedestalEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );

  pinEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );

  resultantForceMaterial = new THREE.MeshLambertMaterial( { color: config[ 'load.resultant.force' ] } );
  resultantTorqueMaterial = new THREE.MeshLambertMaterial( { color: config[ 'load.resultant.torque' ] } );

  xLoadMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.x' ], transparent: config[ 'load.frames.transparent'], opacity: config[ 'load.frames.opacity' ], side: THREE.DoubleSide } );
  yLoadMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.y' ], transparent: config[ 'load.frames.transparent'], opacity: config[ 'load.frames.opacity' ], side: THREE.DoubleSide } );
  zLoadMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.z' ], transparent: config[ 'load.frames.transparent'], opacity: config[ 'load.frames.opacity' ], side: THREE.DoubleSide } );

  xLoadEdgesMaterial = new THREE.LineBasicMaterial( { color: config[ 'axes.x' ] } );
  yLoadEdgesMaterial = new THREE.LineBasicMaterial( { color: config[ 'axes.y' ] } );
  zLoadEdgesMaterial = new THREE.LineBasicMaterial( { color: config[ 'axes.z' ] } );

  // set the geometries
  jointGeometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
  
  wireFrameShape = new THREE.Shape().arc();

  straightShaftGeometry = new THREE.CylinderBufferGeometry();
  straightShaftGeometry.rotateZ( Math.PI / 2 );
  straightShaftGeometry.translate( 0.5, 0, 0 );

  headGeometry = new THREE.ConeBufferGeometry( 1, 1, 32 );
  headGeometry.rotateZ( 3 * Math.PI / 2 );
  headGeometry.translate( 0.5, 0, 0 );

  restraintGeometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 32 );
  restraintGeometry.rotateZ( Math.PI / 2 );
  
  foundationGeometry = new THREE.BoxBufferGeometry();
  foundationGeometry.translate( 0, 0, -0.5 );
  foundationEdgesGeometry = new THREE.EdgesGeometry( foundationGeometry );
  
  pedestalGeometry = new THREE.BoxBufferGeometry();
  pedestalEdgesGeometry = new THREE.EdgesGeometry( pedestalGeometry );

  pinGeometry = new THREE.ConeBufferGeometry( 1, 1, 4, 1 );
  pinGeometry.groups = [];
  pinGeometry.addGroup(  0,  6, 0 );
  pinGeometry.addGroup(  6,  6, 1 );
  pinGeometry.addGroup( 12,  6, 2 );
  pinGeometry.addGroup( 18,  6, 3 );
  pinGeometry.addGroup( 24, 12, 4 );
  pinGeometry.rotateX( Math.PI / 2 );
  pinGeometry.rotateZ( Math.PI / 4 );
  pinGeometry.translate( 0, 0, -0.5 );

  pinEdgesGeometry = new THREE.EdgesGeometry( pinGeometry );
  
  // create the model
  model = createModel();
  setModelRotation( config[ 'model.axisUpwards' ] );
  scene.add( model );
  
  // create the ground
  var ground = createGround( config[ 'ground.size' ], config[ 'ground.grid.divisions' ], config[ 'ground.plane.color' ], config[ 'ground.plane.transparent' ], config[ 'ground.plane.opacity' ], config[ 'ground.grid.major' ], config[ 'ground.grid.minor' ] );
  scene.add( ground );
  
  // create the structure
  structure = createStructure();

  // // casting
  // var projector = new THREE.Projector();

  // document.addEventListener('mousedown', onDocumentMouseDown, false);
  // document.addEventListener('mousemove', onDocumentMouseMove, false);

  // // // setupKeyLogger();
  // // setupKeyControls();

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

  // create the stats
  stats = new Stats();
  document.getElementById( "Stats-output" ).appendChild( stats.domElement );

  // create the dat gui
  gui = new dat.GUI();

  // remember config
  gui.remember( config );

  // add model folder
  let modelFolder = gui.addFolder( "model" );
  modelFolder.add( config, 'model.axisUpwards' ).options( [ 'x', 'y', 'z' ] ).name( 'axisUpwards' ).onChange( axis => setUpwardsAxis( axis ) ); // .listen();
  // add axes folder
  let axesModelFolder = modelFolder.addFolder( "axes" );
  axesModelFolder.add( config, 'model.axes.visible' ).name( 'visible' ).onChange( visible => model.getObjectByName( 'axes' ).visible = visible );
  axesModelFolder.add( config, 'model.axes.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => model.getObjectByName( 'axes' ).scale.setScalar( size ) );
  // add head folder
  let headAxesModel = axesModelFolder.addFolder( "head" );
  headAxesModel.add( config, 'model.axes.head.height' ).name( 'height' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( head => setAxesHeadHeight( model.getObjectByName( 'axes' ), head ) );
  headAxesModel.add( config, 'model.axes.head.radius' ).name( 'radius' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( radius => setAxesHeadRadius( model.getObjectByName( 'axes' ), radius ) );
  // add shaft folder
  let shaftAxesModel = axesModelFolder.addFolder( "shaft" );
  shaftAxesModel.add( config, 'model.axes.shaft.length' ).name( 'length' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( length => setAxesShaftLength( model.getObjectByName( 'axes' ), length ) );
  shaftAxesModel.add( config, 'model.axes.shaft.radius' ).name( 'radius' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( radius => setAxesShaftRadius( model.getObjectByName( 'axes' ), radius ) );

  // add a light folder
  // let lightsFolder = gui.addFolder( "light");

  // add a background folder
  let backgroundFolder = gui.addFolder( "background" );
  backgroundFolder.addColor( config, 'background.topColor' ).name( 'top' ).onChange( color => setBackgroundColor( color, config[ 'background.bottomColor' ] ) );
  backgroundFolder.addColor( config, 'background.bottomColor' ).name( 'bottom' ).onChange( color => setBackgroundColor( config[ 'background.topColor' ], color ) );

  // add a camera folder
  let cameraFolder = gui.addFolder( "camera" );
  cameraFolder.add( config, 'camera.type' ).options( [ 'perspective', 'orthographic' ] ).name( 'type' ).onChange( type => setCameraType( type ) );

  // add controls folder
  let controlsFolder = gui.addFolder( "controls" );
  controlsFolder.add( config, 'controls.rotateSpeed' ).name( 'rotateSpeed' ).min( 0.1 ).max( 10 ).step( 0.1 ).onChange( speed => controls.rotateSpeed = speed );
  controlsFolder.add( config, 'controls.zoomSpeed' ).name( 'zoomSpeed' ).min( 0.12 ).max( 12 ).step( 0.12 ).onChange( speed => controls.zoomSpeed = speed );
  controlsFolder.add( config, 'controls.panSpeed' ).name( 'panSpeed' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( speed => controls.panSpeed = speed );
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
  gridFolder.addColor( config, "ground.grid.minor" ).name( 'menor' ).onChange( color => setGridMenor( color ) );

  // add axes folder
  let axesFolder = gui.addFolder( "axes" );
  axesFolder.addColor( config, 'axes.x' ).name( 'x' ).onChange( color => xMaterial.color = xLoadMaterial.color = xLoadEdgesMaterial.color = new THREE.Color( color ) );
  axesFolder.addColor( config, 'axes.y' ).name( 'y' ).onChange( color => yMaterial.color = yLoadMaterial.color = yLoadEdgesMaterial.color = new THREE.Color( color ) );
  axesFolder.addColor( config, 'axes.z' ).name( 'z' ).onChange( color => zMaterial.color = zLoadMaterial.color = zLoadEdgesMaterial.color = new THREE.Color( color ) );

  // add a joint folder
  let jointFolder = gui.addFolder( "joint" );
  jointFolder.add( config, 'joint.visible' ).name( 'visible' ).onChange( visible => setJointVisible( visible ) );
  jointFolder.add( config, "joint.size" ).name( 'size' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( size => setJointSize( size ) );
  jointFolder.add( config, 'joint.label' ).name( 'label' ).onChange( visible => setJointLabel( visible ) );
  jointFolder.addColor( config, "joint.color" ).name( 'color' ).onChange( color => setJointColor( color ) );
  jointFolder.add( config, 'joint.transparent' ).name( 'transparent' ).onChange( transparent => setJointTransparent( transparent ) );
  jointFolder.add( config, 'joint.opacity' ).name( 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( opacity => setJointOpacity( opacity ) );

  // add a frame folder
  let frameFolder = gui.addFolder( "frame" );
  frameFolder.add( config, 'frame.visible' ).name( 'visible' ).onChange( visible => setFrameVisible( visible ) );
  frameFolder.add( config, 'frame.view', [ 'wireframe', 'extrude' ] ).name( 'view' ).onChange( view  =>  setFrameView( view ) );
  frameFolder.add( config, 'frame.size' ).name( 'size' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( size => setFrameSize( size ) );
  frameFolder.add( config, 'frame.label' ).name( 'label' ).onChange( visible => model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'label' ).visible = ( visible && config[ 'frame.visible' ] ) ) );
  frameFolder.addColor( config, 'frame.color' ).name( 'color' ).onChange( color => frameMaterial.color = frameEdgesMaterial.color = new THREE.Color( color ) );
  frameFolder.add( config, 'frame.transparent' ).name( 'transparent' ).onChange( transparent => frameMaterial.transparent = transparent );
  frameFolder.add( config, 'frame.opacity' ).name( 'opacity' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( opacity => frameMaterial.opacity = opacity );
  // add axes folder
  let axesFrameFolder = frameFolder.addFolder( "axes" );
  axesFrameFolder.add( config, 'frame.axes.visible' ).name( 'visible' ).onChange( visible => model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'axes' ).visible = visible ) );
  axesFrameFolder.add( config, 'frame.axes.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'axes' ).scale.setScalar( size ) ) );
  // add head folder
  let headAxesFrame = axesFrameFolder.addFolder( "head" );
  headAxesFrame.add( config, 'frame.axes.head.height' ).name( 'height' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( height => model.getObjectByName( 'frames' ).children.forEach( frame => setAxesHeadHeight( frame.getObjectByName( 'axes' ), height ) ) );
  headAxesFrame.add( config, 'frame.axes.head.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => model.getObjectByName( 'frames' ).children.forEach( frame => setAxesHeadRadius( frame.getObjectByName( 'axes' ), radius ) ) );
  // add shaft folder
  let shaftAxesFrame = axesFrameFolder.addFolder( "shaft" );
  shaftAxesFrame.add( config, 'frame.axes.shaft.length' ).name( 'length' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( length => model.getObjectByName( 'frames' ).children.forEach( frame => setAxesShaftLength( frame.getObjectByName( 'axes' ), length ) ) );
  shaftAxesFrame.add( config, 'frame.axes.shaft.radius' ).name( 'radius' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( radius => model.getObjectByName( 'frames' ).children.forEach( frame => setAxesShaftRadius( frame.getObjectByName( 'axes' ), radius ) ) );

  // add support folder
  let supportFolder = gui.addFolder( "support" );
  supportFolder.add( config, 'support.visible' ).name( 'visible' ).onChange( visible => Object.keys( structure.supports ).forEach( name => model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).visible = visible ) );
  supportFolder.add( config, 'support.mode' ).options( [ 'space', 'analytical' ] ).name( 'mode' ).onChange( mode => setSupportMode( mode ) );
  // add analytical folder
  let analyticalSupportFolder = supportFolder.addFolder( "analytical" );
  // add head folder
  let headArrowSupportFolder = analyticalSupportFolder.addFolder( "head" );
  headArrowSupportFolder.add( config, 'support.analytical.head.height' ).name( 'height' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( height => setAnalyticalHeadHeightSupport( height ) );
  headArrowSupportFolder.add( config, 'support.analytical.head.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setAnalyticalHeadRadiusSupport( radius ) );
  // add shaft folder
  let shaftArrowSupportFolder = analyticalSupportFolder.addFolder( "shaft" );
  shaftArrowSupportFolder.add( config, 'support.analytical.straightShaft.length' ).name( 'length' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( length => setAnalyticalShaftLengthSupport( length ) );
  shaftArrowSupportFolder.add( config, 'support.analytical.curveShaft.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setAnalyticalShaftRadiusSupport( radius ) );
  shaftArrowSupportFolder.add( config, 'support.analytical.shaft.tube' ).name( 'tube' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( tube => setAnalyticalShaftTubeSupport( tube ) );
  // add restraint folder
  let restrainArrowSupportFolder = analyticalSupportFolder.addFolder( "restraint" );
  restrainArrowSupportFolder.add( config, 'support.analytical.restraint.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setAnalyticalRestrainRadiusSupport( radius ) );
  restrainArrowSupportFolder.add( config, 'support.analytical.restraint.thickness' ).name( 'thickness' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( thickness => setAnalyticalRestrainThicknessSupport( thickness ) );
  
  // add space folder
  let spaceSupportFolder = supportFolder.addFolder( "space" );
  // add foundation folder
  let foundationFolder = spaceSupportFolder.addFolder( "foundation" );
  foundationFolder.add( config, 'support.foundation.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setFoundationSize( size ) );
  foundationFolder.add( config, 'support.foundation.depth' ).name( 'depth' ).min( 0.01 ).max( 0.1 ).step( 0.01 ).onChange( depth => setFoundationDepth( depth ) );
  // add pedestal folder
  let pedestalFolder = spaceSupportFolder.addFolder( "pedestal" );
  pedestalFolder.add( config, 'support.pedestal.size' ).name( 'size' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPedestalSize( size ) );
  // add pin folder
  let pinFolder = spaceSupportFolder.addFolder( "pin" );
  pinFolder.add( config, 'support.pin.height' ).name( 'height' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( size => setPinHeight( size ) );
  pinFolder.add( config, 'support.pin.radius' ).name( 'radius' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( radius => setPinRadius( radius ) );

  // add load folder
  let loadFolder = gui.addFolder( "load" );
  loadFolder.add( config, 'load.visible' ).name( 'visible' ).onChange( visible => setLoadVisible( visible ) );
  loadPatternController = loadFolder.add( config, 'load.loadPattern', [] ).name( 'load pattern' ).onChange( loadPattern => setLoadPatternVisible( loadPattern ) );
  loadFolder.add( config, 'load.system' ).options( [ 'global' ] ).name ( 'system' ).onChange( system => console.log( system ) );  // TODO: add 'local'
  loadFolder.add( config, 'load.as' ).options( [ 'components', 'resultant' ] ).name( 'as' ).onChange( as => setLoadAs( as ) );
  // add force folder
  let forceFolder = loadFolder.addFolder( "force" );
  forceFolder.add( config, 'load.force.scale' ).name( 'scale' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( scale => setLoadForceScale( scale ) );
  forceFolder.addColor( config, 'load.resultant.force' ).name( 'color' ).onChange( color => resultantForceMaterial.color = new THREE.Color( color ) );
  // add torque folder
  let torqueFolder = loadFolder.addFolder( "torque" );
  torqueFolder.add( config, 'load.torque.scale' ).name( 'scale' ).min( 0.1 ).max( 1 ).step( 0.01 ).onChange( scale => setLoadTorqueScale( scale ) );
  torqueFolder.addColor( config, 'load.resultant.torque' ).name( 'color' ).onChange( color => resultantTorqueMaterial.color = new THREE.Color( color ) );

  // add head folder
  let headArrowLoadFolder = loadFolder.addFolder( "head" );
  headArrowLoadFolder.add( config, 'load.head.height' ).name( 'height' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( height => setLoadHeadHeight( height ) );
  headArrowLoadFolder.add( config, 'load.head.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setLoadHeadRadius( radius ) );
  // add shaft folder
  let shaftArrowLoadFolder = loadFolder.addFolder( "shaft" );
  shaftArrowLoadFolder.add( config, 'load.shaft.tube' ).name( 'tube' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( tube => setLoadShaftTube( tube ) );

  render();
}

window.onload = init;

// three.js
function createCamera( type, position, target ) {
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
    camera.zoom = 1 / ( 2 * Math.tan( ( fov / 2 ) * Math.PI / 180 ) * position.clone().sub( target ).length() );
  }

  camera.up.set( 0, 0, 1 );
  camera.position.copy( position );
  camera.lookAt( target );
  camera.updateProjectionMatrix();

  return camera;
}

function createControls( rotateSpeed, zoomSpeed, panSpeed, screenSpacePanning, enableDamping, dampingFactor ) {
  // create the controls

  var controls = new THREE.OrbitControls( camera, CSS2DRenderer.domElement );

  controls.rotateSpeed = rotateSpeed;
  controls.zoomSpeed = zoomSpeed;
  controls.panSpeed = panSpeed;
  controls.screenSpacePanning = screenSpacePanning;
  controls.enableDamping = enableDamping;
  controls.dampingFactor = dampingFactor;

  return controls;
}

function setCameraType( type ) {
  // set the camera type

  // set camera
  var position = camera.position.clone();
  var quaternion = camera.quaternion.clone();
  var zoom = camera.zoom;
  var target = controls.target.clone();
  
  camera = createCamera( type, position, target );
  camera.quaternion.copy( quaternion );

  // set position
  if ( type == 'perspective' ) {
    // move camera along z axis
    var worldDirection = new THREE.Vector3();

    camera.getWorldDirection( worldDirection );
    worldDirection.multiplyScalar( -1 / ( 2 * zoom * Math.tan( ( config[ 'camera.perspective.fov' ] / 2 ) * Math.PI / 180 ) ) );
    camera.position.copy( target.clone().add( worldDirection ) );
  } else {
    camera.position.add( position.clone().sub( target ).multiplyScalar( 10 ) ); // TODO: proyect camera in the scene's boundary sphere
  }

  // set controls
  controls = createControls( config[ 'controls.rotateSpeed' ], config[ 'controls.zoomSpeed' ], config[ 'controls.panSpeed' ], config[ 'controls.screenPanning' ], config[ 'controls.damping.enable' ], config[ 'controls.damping.factor' ] );
  controls.target.copy( target );
  controls.update();
}

function render() {
  // render the scene

  requestAnimationFrame( render );

  stats.update();

  webGLRenderer.render( scene, camera );
  CSS2DRenderer.render( scene, camera );

  if ( controls.enableDamping ) controls.update();
}

function onResize() {
  // resize scene renderer

  camera.aspect = canvasWebGLRenderer.clientWidth / canvasWebGLRenderer.clientHeight;
  camera.updateProjectionMatrix();

  webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
}

// FEM.js
function createStructure() { return { joints: {}, materials: {}, sections: {}, frames: {}, supports: {}, load_patterns: {} } };

function createModel() {
  // create the model

  var model = new THREE.Group();

  // add axes
  var axes = createAxes( config[ 'model.axes.shaft.length' ], config[ 'model.axes.shaft.radius'], config[ 'model.axes.head.height'], config[ 'model.axes.head.radius'] );
  axes.name = 'axes';
  axes.visible = config[ 'model.axes.visible' ];
  axes.scale.setScalar( config[ 'model.axes.size' ] );
  model.add( axes );
  
  // add joints
  var joints = new THREE.Group();
  joints.name = 'joints';
  model.add( joints );
  
  // add frames
  var frames = new THREE.Group();
  frames.name = 'frames';
  frames.visible = config[ 'frame.visible' ];
  model.add( frames );

  // add loads
  var loads = new THREE.Group();
  loads.name = 'loads';
  loads.visible = config[ 'load.visible' ];
  model.add( loads );

  return model;
}

function createGround( size, divisions, color, transparent, opacity, colorCenterLine, colorGrid ) {
  // create the ground
  
  var ground = new THREE.Group();
  ground.name = 'ground';
  ground.visible = config[ 'ground.visible' ];
  
  // add grid
  var grid = createGrid( divisions, colorCenterLine, colorGrid );
  ground.add( grid );
  
  // add plane
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshLambertMaterial( { color: color, transparent: transparent, opacity: opacity, side: THREE.DoubleSide } ) ); //  1, 1, 2000, 2000 
  plane.name = 'plane';
  plane.visible = config[ 'ground.plane.visible'];
  ground.add( plane );
  
  // set size
  ground.scale.setScalar( size );
  
  // receive shadow

  // plane.receiveShadow = true;
  
  return ground;
}

function createGrid( divisions, colorCenterLine, colorGrid ) {
  // create a grid

  var grid = new THREE.GridHelper( 1, divisions, colorCenterLine, colorGrid );
  
  grid.name = 'grid';
  grid.visible = config[ 'ground.grid.visible' ];
  grid.rotation.x = Math.PI / 2;
  grid.material.opacity = 0.25;
  grid.material.transparent = true;

  return grid;
}

export function open( filename ) {
  // open a file

  var promise = loadJSON( filename )
    .then( json => {
      // delete labels
      model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).remove( joint.getObjectByName( 'joint' ).getObjectByName( 'label' ) ) );
      model.getObjectByName( 'frames' ).children.forEach( frame => frame.remove( frame.getObjectByName( 'label' ) ) );

      // delete objects
      model.getObjectByName( 'joints' ).children = [];
      model.getObjectByName( 'frames' ).children = [];
      model.getObjectByName( 'loads' ).children = [];

      // create structure
      structure = createStructure();
      
      // add materials
      if ( json.hasOwnProperty( 'materials' ) ) Object.entries( json.materials ).forEach( ( [ name, material ] ) => { addMaterial( name, material.E, material.G ) } );

      // add sections
      if ( json.hasOwnProperty( 'sections' ) ) {
        Object.entries( json.sections ).forEach( ( [ name, section ] ) => {
          switch ( section.type ) {
            case "Section":
              addSection( name );
              break;
            case "RectangularSection":
              addRectangularSection( name, section.width, section.height );
              break;
          }
        });
      }

      // add joints
      if ( json.hasOwnProperty( 'joints' ) ) Object.entries( json.joints ).forEach( ( [ name, joint ] ) => { addJoint( name, joint.x, joint.y, joint.z ) } );

      // add frames
      if ( json.hasOwnProperty( 'frames' ) ) Object.entries( json.frames ).forEach( ( [ name, frame ] ) => { addFrame( name, frame.j, frame.k, frame.material, frame.section ) } );

      // add suports
      if ( json.hasOwnProperty( 'supports' ) ) Object.entries( json.supports ).forEach( ( [ name, support ] ) => { addSupport( name, support.ux, support.uy, support.uz, support.rx, support.ry, support.rz ) } );

      // add load patterns
      Object.entries( json.load_patterns ).forEach( ( [ name, load_pattern] ) => {
        addLoadPattern( name );
        if ( load_pattern.hasOwnProperty( 'joints' ) ) Object.entries( load_pattern.joints ).forEach( ( [ joint, pointLoads ] ) => pointLoads.forEach( pointLoad => addLoadAtJoint( name, joint, pointLoad.fx, pointLoad.fy, pointLoad.fz, pointLoad.mx, pointLoad.my, pointLoad.mz ) ) );
        if ( load_pattern.hasOwnProperty( 'frames' ) ) Object.entries( load_pattern.frames ).forEach( ( [ frame, load_types ] ) => {
          if ( load_types.hasOwnProperty( 'uniformly_distributed' ) ) Object.entries( load_types.uniformly_distributed ).forEach( ( [ system, loads ] ) => loads.forEach( load => addUniformlyDistributedLoadAtFrame( name, frame, system, load.fx, load.fy, load.fz, load.mx, load.my, load.mz ) ) );
        });
      });

      return "the '" + filename + "' model has been loaded";
    });

  return promise;
}

function loadJSON( json ) {
  // load json

  var promise = fetch( json + "?nocache=" + new Date().getTime() )
    .then( response => { 
      if ( !response.ok ) throw new Error( 'Network response was not ok' );
      return response.json();
    });

  return promise;
}

function setBackgroundColor( top, bottom ) { canvasWebGLRenderer.style.backgroundImage = "linear-gradient(" + top + ", " + bottom + ")" };

function setGroundVisible( visible ) { scene.getObjectByName( 'ground' ).visible = visible };

function setGroundSize( size ) { scene.getObjectByName( 'ground' ).scale.setScalar( size ) };

function setPlaneVisible( visible ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).visible = visible };

function setPlaneColor( color ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.color = new THREE.Color( color ) };

function setPlaneTransparent( transparent ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.transparent = transparent };

function setPlaneOpacity( opacity ) { scene.getObjectByName( 'ground' ).getObjectByName( 'plane' ).material.opacity = opacity };

function setGridVisible( visible ) { scene.getObjectByName( 'ground' ).getObjectByName( 'grid' ).visible = visible };

function setGridDivisions( divisions ) {
  // set grid divisions

  var ground = scene.getObjectByName( 'ground' );

  ground.remove( ground.getObjectByName( 'grid' ) );
  ground.add( createGrid( divisions, config[ 'ground.grid.major' ], config[ 'ground.grid.minor' ] ) );
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

export function getStructure() { return new Promise( resolve => resolve( JSON.stringify( structure, null, 2 ) ) ) };

export function getLoadPatterns() { return new Promise( resolve => resolve( JSON.stringify( structure.load_patterns, null, 2 ) ) ) };

// model 
function setModelRotation( axis ) { model.setRotationFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), { x: 4 * Math.PI / 3, y: 2 * Math.PI / 3, z: 0 }[ axis ] ) };

export function setUpwardsAxis( axis ) {
  // set the upwards axis
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( axis == 'x' || axis == 'y' || axis == 'z' ) {
      var joint;
      
      // set model rotation
      setModelRotation( axis );

      // redraw the supports
      Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
        joint = model.getObjectByName( 'joints' ).getObjectByName( name );
        joint.remove( joint.getObjectByName( 'support' ) );
        joint.add( createSupport( support.ux, support.uy, support.uz, support.rx, support.ry, support.rz ) );
      });
      
      // save the value
      config[ 'model.axisUpwards' ] = axis;

      resolve( "upwards axis set to '" + axis + "' axis" );
    } else {
      reject( new Error( "'" + axis + "' axis does not exist" ) );
    }
  });

  return promise;
}

export function setView( direction ) {
  // set the standard view direction of the camera: 
  // t = top, f = front, b = back, r = right, l = left

  var promise = new Promise( ( resolve, reject ) => {
    if ( direction == 't' || direction == 'f' || direction == 'b' || 
      direction == 'r' || direction == 'l' ) {

      // get the target of the camera
      var target = controls.target.clone();

      // get distance from camera to model point
      var distance = camera.position.distanceTo( target );

      // set the base quaternion to define camera direction
      var quaternion = new THREE.Quaternion()
      quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), 0 );
      
      switch ( direction ) {
        case 'f':
          var vector = new THREE.Vector3( distance, 0, 0 );
          break;
        case 'r':
          var vector = new THREE.Vector3( 0, distance, 0 );
          break;
        case 't':
          var vector = new THREE.Vector3( 0, 0, distance );
          break;
        case 'b':
          var vector = new THREE.Vector3( -distance, 0, 0 );
          break;
        case 'l':
          var vector = new THREE.Vector3( 0, -distance, 0 );
          break;
      }

      // set camera new position
      vector.applyQuaternion( quaternion );
      camera.position.copy( vector );

    } else {
      reject( new Error( "'" + direction + "' standard view is not available yet" ) );
    }
  });

  return promise;
}

// arrows
function createCurveShaftGeometry( radius, tube ) {
  // create a curve shaft geometry
   
  var shaftGeometry = new THREE.TorusBufferGeometry( radius, tube, 8, 32, 3 * Math.PI / 2 );
  shaftGeometry.rotateY( Math.PI / 2 );

  return shaftGeometry;
}
function createHead( material, height, radius ) {
  // create a head

  var head = new THREE.Mesh( headGeometry, material );
  head.name = 'head';
  head.scale.set( height, radius, radius );

  return head;
}

function createStraightShaft( material, length, radius ) {
  // create a stright shaft

  var shaft = new THREE.Mesh( straightShaftGeometry, material );
  shaft.name = 'straightShaft';
  shaft.scale.set( length, radius, radius );

  return shaft;
}

function createCurveShaft( material, radius, tube ) {
  // create a curve shaft

  var shaft = new THREE.Mesh( createCurveShaftGeometry( radius, tube ), material );
  shaft.name = 'curveShaft';

  return shaft;
}

function createStraightArrow( material, shaftLength, shaftRadius, headHeight, headRadius ) {
  // create a straight arrow
  
  var arrow = new THREE.Group();

  // shaft
  arrow.add( createStraightShaft( material, shaftLength, shaftRadius ) );

  // head
  var head = createHead( material, headHeight, headRadius );
  head.position.setX( shaftLength );
  arrow.add( head );
  
  return arrow;
}

function createCurveArrow( material, shaftRadius, shaftTube, headHeight, headRadius ) {
  // create a curve arrow

  var arrow = new THREE.Group();

  // shaft
  arrow.add( createCurveShaft( material, shaftRadius, shaftTube ) );
  
  // head
  var head = createHead( material, headHeight, headRadius );

  head.position.set( 0, -shaftRadius, 0 );
  head.rotateY( Math.PI / 2 );
  arrow.add( head );

  return arrow;
}

// axes
function createAxes( shaftLength, shaftRadius, headHeight, headRadius ) {
  // create the axes

  var axes = new THREE.Group();
  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();

  var arrow;

  [ [ 'x', xMaterial, 0 ] , [ 'y', yMaterial, 2 * Math.PI / 3 ], [ 'z', zMaterial, 4 * Math.PI / 3 ] ].forEach( ( [ name, material, angle ] ) => {
    arrow = createStraightArrow( material, shaftLength, shaftRadius, headHeight, headRadius );
    arrow.name = name;
    arrow.quaternion.setFromAxisAngle( vector, angle );
    axes.add( arrow );
  });

  return axes;
}

function setAxesHeadHeight( axes, head ) { axes.children.forEach( arrow => arrow.getObjectByName( 'head' ).scale.setX( head ) ) };

function setAxesHeadRadius( axes, radius ) { axes.children.forEach( arrow => arrow.getObjectByName( 'head' ).scale.set( arrow.getObjectByName( 'head' ).scale.x, radius, radius ) ) };

function setAxesShaftLength( axes, length ) {
  // set axes shaft length

  axes.children.forEach( arrow => { 
    arrow.getObjectByName( 'straightShaft' ).scale.setX( length );
    arrow.getObjectByName( 'head' ).position.setX( length );
  });
}

function setAxesShaftRadius( axes, radius ) { axes.children.forEach( arrow => arrow.getObjectByName( 'straightShaft' ).scale.set( arrow.getObjectByName( 'straightShaft' ).scale.x, radius, radius ) ) };

// joint
function createJoint( size ) {
  // create a joint

  var joint = new THREE.Mesh( jointGeometry, jointMaterial );

  joint.name = "joint";
  joint.visible = config[ 'joint.visible' ];
  joint.scale.setScalar( size );
  // joint.castShadow = true;
  // joint.receiveShadow = true;
  
  return joint;
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
      structure.joints[ name ] = { x: x, y: y, z: z };

      // parent
      var parent = new THREE.Group();
      parent.name = name;
      parent.position.set( x, y, z );
      model.getObjectByName( 'joints' ).add( parent );
    
      // joint
      var joint = createJoint( config[ 'joint.size' ] );
      parent.add( joint );
  
      // label
      var label = document.createElement( 'div' );
      label.className = 'joint';
      label.textContent = name;
      label = new THREE.CSS2DObject( label );
      label.name = 'label';
      label.visible = config[ 'joint.label' ];
      label.position.set( 0.5, 0.5, 0.5 );
      joint.add( label );

      resolve( "joint '" + name + "' was added" );
    }
  });

  return promise;
}

export function removeJoint( name ) {
  // remove a joint
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( structure.joints.hasOwnProperty( name ) && ( Object.values( structure.frames ).every( frame => frame.j != name && frame.k != name ) ) ) {
      deleteJoint( name );
      
      resolve( "joint '" + name + "' was removed" );
    } else {
      if ( structure.joints.hasOwnProperty( name ) ) {
        reject( new Error( "joint '" + name + "' is in use" ) );
      } else {
        reject( new Error( "joint '" + name + "' does not exist" ) );
      }
    }
  });
  
  return promise;
}

function deleteJoint( name ) {
  // delete a joint

  // only strings accepted as name
  name = name.toString();

  // get the joint
  let joint = model.getObjectByName( 'joints' ).getObjectByName( name );

  // remove the label
  joint.getObjectByName( 'joint' ).remove( joint.getObjectByName( 'joint' ).getObjectByName( 'label' ) );

  // remove joint of the scene
  model.getObjectByName( 'joints' ).remove( joint );
  
  // remove joint from structure
  delete structure.joints[ name ];

  // remove possible joint's support
  delete structure.supports[ name ]
}

function setJointVisible( visible ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).visible = visible ) };

function setJointSize( size ) {
  // set joint size

  model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).scale.setScalar( size ) );
  setLoadForceScale( config[ 'load.force.scale' ] );
}

function setJointLabel( visible ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'label' ).visible = visible ) };

function setJointColor( color ) { jointMaterial.color = new THREE.Color( color ) };

function setJointTransparent( transparent ) { jointMaterial.transparent = transparent };

function setJointOpacity( opacity ) { jointMaterial.opacity = opacity };

// material
export function addMaterial( name, e, g ) {
  // add a material

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if material's name already exits
    if ( structure.materials.hasOwnProperty( name ) ) {
      reject( new Error( "material's name '" + name + "' already exist" ) );
    } else {
      // add material to structure
      structure.materials[ name ] = { "E": e, "G": g };

      resolve( "material '" + name + "' was added" );
    }
  });

  return promise;
}

export function removeMaterial( name ) {
  // remove a material

  var promise = new Promise( ( resolve, reject ) => {
    if ( structure.materials.hasOwnProperty( name ) && Object.values( structure.frames ).every( frame => frame.material != name ) ) {
      delete structure.materials[ name ];

      resolve( "material '" + name + "' was removed" );
    } else {
      if ( structure.materials.hasOwnProperty( name ) ) {
        reject( new Error( "material '" + name + "' is in use" ) );
      } else {
        reject( new Error( "material '" + name + "' does not exist" ) );
      }
    }
  });

  return promise;
}

// sections
function createSection() { return wireFrameShape };

function createRectangularSection( widht, height ) { return new THREE.Shape().moveTo( widht / 2, -height / 2 ).lineTo( widht / 2, height / 2 ).lineTo( -widht / 2, height / 2 ).lineTo( -widht / 2, -height / 2 ).lineTo( widht / 2, -height / 2 ) };

export function addSection( name ) {
  // add a section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) {
      reject( new Error( "section's name '" + name + "' already exits" ) );
    } else {
      structure.sections[ name ] = { type: "Section" };
      // create section
      sections[ name ] = createSection();
  
      resolve( "section '" + name + "' was added" );
    }
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
      structure.sections[ name ] = { type: "RectangularSection", width: width, height: height };
      // create rectangular section
      sections[ name ] = createRectangularSection( width, height );
    
      resolve( "rectangular section '" + name + "' was added" );
    }
  });

  return promise;
}

export function removeSection( name ) {
  // remove a section

  var promise = new Promise( ( resolve, reject ) => {
    if ( structure.sections.hasOwnProperty( name ) && Object.values( structure.frames ).every( frame => frame.section != name ) ) {
      delete sections[ name ];
      delete structure.sections[ name ]

      resolve( "section '" + name + "' was removed" );
    } else {
      if ( structure.sections.hasOwnProperty( name ) ) {
        reject( new Error( "section '" + name + "' is in use" ) );
      } else {
        reject( new Error( "section '" + name + "' does not exist" ) );
      }
    }
  });

  return promise;
}

// frame
function createFrame( length, section ) {
  // create a frame

  var frame = new THREE.Group();
  var extrudeSettings = { depth: length, bevelEnabled: false };

  // extrude wireFrameShape
  var wireFrame = new THREE.Mesh( new THREE.ExtrudeBufferGeometry( wireFrameShape, extrudeSettings ), frameMaterial );
  wireFrame.name = 'wireFrame';
  wireFrame.scale.set( config[ 'frame.size' ], config[ 'frame.size' ], 1 );
  frame.add( wireFrame );

  // create extrude frame
  var extrudeFrame;  
  if ( structure.sections[ section ].type == 'Section' ) {
    extrudeFrame = wireFrame.clone();
  } else {
    var extrudeFrameGeometry = new THREE.ExtrudeBufferGeometry( sections[ section ], extrudeSettings );
    extrudeFrame = new THREE.Mesh( extrudeFrameGeometry, frameMaterial );
    var edgesExtrudeFrame = new THREE.LineSegments( new THREE.EdgesGeometry( extrudeFrameGeometry ), frameEdgesMaterial );
    edgesExtrudeFrame.name = 'edges';
    extrudeFrame.add( edgesExtrudeFrame );
  }
  extrudeFrame.name = 'extrudeFrame';
  frame.add( extrudeFrame );
  
  // set visibility
  if ( config[ 'frame.view' ] == 'wireframe' ) extrudeFrame.visible = false;
  if ( config[ 'frame.view' ] == 'extrude' ) wireFrame.visible = false;

  // x local along frame
  var quaternion = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), 2 * Math.PI / 3 );
  extrudeFrame.quaternion.copy( quaternion );
  wireFrame.quaternion.copy( quaternion );

  // middle frame at origin
  var position = new THREE.Vector3( -length / 2, 0, 0 );
  extrudeFrame.position.copy( position );
  wireFrame.position.copy( position );

  // wireFrame.castShadow = true;
  // wireFrame.receiveShadow = true;

  // extrudeFrame.castShadow = true;
  // extrudeFrame.receiveShadow = true;

  return frame;
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
        reject( new Error( "frame's joints [" + j + ", " + k + "] already taked" ) );
      }
    } else {
      // check if joints, material and section exits
      if ( structure.joints.hasOwnProperty( j ) && structure.joints.hasOwnProperty( k ) && structure.materials.hasOwnProperty( material ) && structure.sections.hasOwnProperty( section ) ) {
        // add frame to structure
        structure.frames[ name ] = { j: j, k: k, material: material, section: section };
    
        // get frame's joints
        j = model.getObjectByName( 'joints' ).getObjectByName( j );
        k = model.getObjectByName( 'joints' ).getObjectByName( k );
    
        // calculate local axis
        var x_local =  k.position.clone().sub( j.position );
    
        // create frame
        var frame = createFrame( x_local.length(), structure.frames[ name ].section );
        frame.name = name;
        frame.position.copy( x_local.clone().multiplyScalar(0.5).add( j.position ) );
        frame.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0 ), x_local.clone().normalize() );
    
        // add axes
        var axes = createAxes( config[ 'frame.axes.shaft.length'], config[ 'frame.axes.shaft.radius'], config[ 'frame.axes.head.height'], config[ 'frame.axes.head.radius'] );
        axes.name = 'axes';
        axes.visible = config[ 'frame.axes.visible' ];
        frame.add( axes );
    
        // add label
        var label = document.createElement( 'div' );
        label.className = 'frame';
        label.textContent = name;
        label = new THREE.CSS2DObject( label );
        label.name = 'label';
        label.visible = config[ 'frame.label' ];
        frame.add( label );
        
        // add frame to scene
        model.getObjectByName( 'frames' ).add( frame );
      
        resolve( "frame '" + name + "' was added" );
      } else {
        if ( !structure.joints.hasOwnProperty( j ) ) reject( new Error("joint '" + j + "' does not exits" ) );
        if ( !structure.joints.hasOwnProperty( k ) ) reject( new Error("joint '" + k + "' does not exits" ) );
        if ( !structure.materials.hasOwnProperty( material ) ) reject( new Error( "material '" + material + "' does not exits" ) );
        if ( !structure.sections.hasOwnProperty( section ) ) reject( new Error( "section '" + section + "' does not exits" ) );
      }
    }
  });

  return promise;
}

export function removeFrame( name ) {
  // remove a frame

  var promise = new Promise( ( resolve, reject ) => {
    if ( structure.frames.hasOwnProperty( name ) ) {
      // get frame's joints
      var j = structure.frames[ name ].j;
      var k = structure.frames[ name ].k;

      // delete frame
      deleteFrame( name );

      if ( Object.values( structure.frames ).every( frame => frame.j != j && frame.k != j ) ) deleteJoint( j );
      if ( Object.values( structure.frames ).every( frame => frame.j != k && frame.k != k ) ) deleteJoint( k );

      resolve( "frame '" + name + "' was removed" );
    } else {
      reject( new Error( "frame '" + name + "' does not exits" ) );
    }
  });
  
  return promise;
}

function deleteFrame( name ) {
  // delete a frame

  // only strings accepted as name
  name = name.toString();

  // get the frame
  let frame = model.getObjectByName( 'frames' ).getObjectByName( name );

  // remove the label
  frame.remove( frame.getObjectByName( 'label' ) );
  
  // remove frame of the scene
  model.getObjectByName( 'frames' ).remove( frame );

  // remove frame from structure
  delete structure.frames[ name ];
}

export function setFrameView( view ) {
  // set frame view
  
  var promise = new Promise( ( resolve, reject ) => {
    let wireframeView = view == 'wireframe', extrudeView = view == 'extrude';

    if ( wireframeView || extrudeView ) {
      model.getObjectByName( 'frames' ).children.forEach( frame => {
        frame.getObjectByName( 'wireFrame' ).visible = wireframeView;
        frame.getObjectByName( 'extrudeFrame' ).visible = extrudeView;
      });
      
      resolve( "'" + view + "' view setted" );
    } else {
      reject( new Error( "'" + view + "' does not exits" ) );
    }
  });

  return promise;
}

function setFrameVisible( visible ) {
  // set frame visible

  model.getObjectByName( 'frames' ).visible = visible;
  visible = visible && config[ 'frame.label' ];
  model.getObjectByName( 'frames' ).children.forEach( frame => frame.getObjectByName( 'label' ).visible = visible );
}

function setFrameSize( size ) {
  // set frame size

  let scale = new THREE.Vector3( size, size, 1 );

  model.getObjectByName( 'frames' ).children.forEach( frame => { 
    frame.getObjectByName( 'wireFrame' ).scale.copy( scale );
    if ( structure.sections[ structure.frames[ frame.name ].section ].type == 'Section' ) frame.getObjectByName( 'extrudeFrame').scale.copy( scale );
  });
}

// supports
function createRestraint( material, radius, thickness ) {
  // create a restraint

  var restraint = new THREE.Mesh( restraintGeometry, material );
  restraint.name = 'restraint';
  restraint.scale.set( thickness, radius, radius );

  return restraint;
}

function createSupport( ux, uy, uz, rx, ry, rz ) {
  // create a support

  var support = new THREE.Group();

  // create analytical support
  var analytical = new THREE.Group();

  // create displacements supports
  var displacements = new THREE.Group();

  if ( ux ) displacements.add( createDisplacementSupport( 'x' ) );
  if ( uy ) displacements.add( createDisplacementSupport( 'y' ) );
  if ( uz ) displacements.add( createDisplacementSupport( 'z' ) );

  // create rotational supports
  var rotations = new THREE.Group();

  if ( rx ) rotations.add( createRotationSupport( 'x' ) );
  if ( ry ) rotations.add( createRotationSupport( 'y' ) );
  if ( rz ) rotations.add( createRotationSupport( 'z' ) );

  displacements.name = 'displacements';
  rotations.name = 'rotations';

  analytical.name = 'analytical';
  analytical.add( displacements );
  analytical.add( rotations );

  // create space support
  var space = new THREE.Group();
  
  // TODO:
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
    space.add( createPedestal() );
  // pined
  } else if ( ux && uy && uz && !rx && !ry && !rz ) {
    // create foundation
    var foundation = createFoundation();
    foundation.position.setZ( -( config[ 'support.pin.height' ] ) ).applyQuaternion( quaternion );
    space.add( foundation );
    
    // create pin
    space.add( createPin() );
  // fallback mode
  } else {
    space.copy( analytical );
  } 

  space.name = 'space';

  space.visible = ( config[ 'support.mode' ] == 'space' );
  analytical.visible = ( config[ 'support.mode' ] == 'analytical' );

  support.add( analytical );
  support.add( space );

  support.name = 'support';
  support.visible = config[ 'support.visible' ];

  return support;
}

function createFoundation() {
  // create a foundation
  
  // create foundation
  var foundation = new THREE.Mesh( foundationGeometry, foundationMaterial[ config[ 'model.axisUpwards' ] ] );
  foundation.name = 'foundation';

  // create edges
  var foundationEdges = new THREE.LineSegments( foundationEdgesGeometry, foundationEdgesMaterial );
  foundationEdges.name = 'foundationEdges';
  foundation.add( foundationEdges );

  // keep vertical
  foundation.quaternion.copy( model.quaternion.clone().inverse() );

  // set size
  foundation.scale.set( config[ 'support.foundation.size' ], config[ 'support.foundation.size' ], config[ 'support.foundation.depth' ] );

  // cast shadow
  // foundation.castShadow = true;
  // foundation.receiveShadow = true;

  return foundation;
}

function createPedestal() {
  // create a pedestal

  // create pedestal
  var pedestal = new THREE.Mesh( pedestalGeometry, pedestalMaterial );
  pedestal.name = 'pedestal';

  // create edges
  var pedestalEdges = new THREE.LineSegments( pedestalEdgesGeometry, pedestalEdgesMaterial );
  pedestalEdges.name = 'edges';

  // add edges
  pedestal.add( pedestalEdges );

  // keep vertical
  pedestal.position.setZ( -config[ 'support.pedestal.size' ] / 2 ).applyQuaternion( model.quaternion.clone().inverse() );

  // set size
  pedestal.scale.setScalar( config[ 'support.pedestal.size' ] );

  // cast shadow
  // pedestal.castShadow = true;
  // pedestal.receiveShadow = true;

  return pedestal;
}

function createPin() {
  // create a pin

  var color1, color2, color3;

  switch ( config[ 'model.axisUpwards'] ) {
    case 'x':
      color1 = yMaterial;
      color2 = zMaterial;
      color3 = xMaterial;
      break;
    case 'y':
      color1 = zMaterial;
      color2 = xMaterial;
      color3 = yMaterial;
      break;
    case 'z':
      color1 = xMaterial;
      color2 = yMaterial;
      color3 = zMaterial;
      break;
  }

  // create pin
  var pin = new THREE.Mesh( pinGeometry, [ color1, color2, color1, color2, color3 ] );
  pin.name = 'pin';

  // create edges
  var pinEdges = new THREE.LineSegments( pinEdgesGeometry, pinEdgesMaterial );
  pinEdges.name = 'edges';

  // add edges
  pin.add( pinEdges );
  
  // set scale
  pin.scale.set( config[ 'support.pin.radius' ], config[ 'support.pin.radius' ], config[ 'support.pin.height' ] );

  // set quaternion
  pin.quaternion.copy( model.quaternion.clone().inverse() );

  // cast shadow
  // pin.castShadow = true;
  // pin.receiveShadow = true;

  return pin;
}

function createDisplacementSupport( axis ) {
  // create a displacement support

  var displacementSupport = new THREE.Group();

  var arrow, restraint;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  switch ( axis ) {
    case 'x': 
      arrow = createStraightArrow( xMaterial, config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( xMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      break;
    case 'y':
      arrow = createStraightArrow( yMaterial, config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( yMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      arrow = createStraightArrow( zMaterial, config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( zMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }

  restraint.position.set( config[ 'support.analytical.straightShaft.length' ] / 2, 0, 0 );
  restraint.rotateZ( Math.PI / 4 );
  arrow.add( restraint );
  
  arrow.name = 'arrow';
  arrow.position.set( -( config[ 'support.analytical.straightShaft.length' ] + config[ 'support.analytical.head.height' ] ), 0, 0 );
  displacementSupport.add( arrow );

  displacementSupport.name = axis;
  displacementSupport.quaternion.copy( quaternion );

  return displacementSupport;
}

function createRotationSupport( axis ) {
  // create a rotational suppoort

  var rotationSupport = new THREE.Group();

  var arrow, restraint;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();
  
  switch ( axis ) {
    case 'x':
      arrow = createCurveArrow( xMaterial, config[ 'support.analytical.curveShaft.radius' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( xMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      break;
    case 'y':
      arrow = createCurveArrow( yMaterial, config[ 'support.analytical.curveShaft.radius' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( yMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      arrow = createCurveArrow( zMaterial, config[ 'support.analytical.curveShaft.radius' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] );
      restraint = createRestraint( zMaterial, config[ 'support.analytical.restraint.radius' ], config[ 'support.analytical.restraint.thickness' ] );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }

  restraint.position.set( 0, config[ 'support.analytical.curveShaft.radius' ], 0 );
  restraint.rotateZ( Math.PI / 4 );
  arrow.add( restraint );

  arrow.name = 'arrow';
  arrow.position.setX( -( config[ 'support.analytical.head.height' ] + config[ 'support.analytical.straightShaft.length' ] / 2 ) );
  rotationSupport.add( arrow );

  rotationSupport.name = axis;
  rotationSupport.quaternion.copy( quaternion );

  return rotationSupport;
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
        model.getObjectByName( 'joints' ).getObjectByName( joint ).add( support );

        resolve( "'" + joint + "' support added" );
      } else {
        reject( new Error( "joint '" + "' does not exist" ) );
      }
    }
  });

  return promise;
}

function setSupportMode( mode ) {
  // set support mode

  var support;

  Object.keys( structure.supports ).forEach( name => {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    support.getObjectByName( 'analytical' ).visible = ( mode == 'analytical' );
    support.getObjectByName( 'space' ).visible = ( mode == 'space' );
  });
}

function setFoundationSize( size ) {
  // set foundation size
  
  var ux, uy, uz, rx, ry, rz;
  
  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( ( ux && uy && uz && rx && ry && rz ) || ( ux && uy && uz && !rx && !ry && !rz ) ) model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).scale.set( size, size, config[ 'support.foundation.depth' ] );
  });
}

function setFoundationDepth( depth ) {
  // set foundation depth

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;
    
    if ( ( ux && uy && uz && rx && ry && rz ) || ( ux && uy && uz && !rx && !ry && !rz ) ) model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).scale.setZ( depth );
  });
}

function setPedestalSize( size ) {
  // set pedestal size

  var ux, uy, uz, rx, ry, rz;
  var quaternion = model.quaternion.clone().inverse();

  Object.entries( structure.supports ).forEach( ( [ name , support ] ) => {
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( ux && uy && uz && rx && ry && rz ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'pedestal' ).scale.setScalar( size );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'pedestal' ).position.copy( new THREE.Vector3( 0, 0, -size / 2 ).applyQuaternion( quaternion ) );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).position.copy( new THREE.Vector3( 0, 0, -size ).applyQuaternion( quaternion ) );
    }
  });
}

function setPinHeight( height ) {
  // set pin height

  var ux, uy, uz, rx, ry, rz;
  var quaternion = model.quaternion.clone().inverse();

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( ux && uy && uz && !rx && !ry && !rz ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'pin' ).scale.set( config[ 'support.pin.radius' ], config[ 'support.pin.radius' ], height );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).position.copy( new THREE.Vector3( 0, 0, -height ).applyQuaternion( quaternion ) );
    }
  });
}

function setPinRadius( radius ) {
  // set pin radius

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( ux && uy && uz && !rx && !ry && !rz ) model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'pin' ).scale.set( radius, radius, config[ 'support.pin.height' ] );
  });
}

function setAnalyticalHeadHeightSupport( height ) {
  // set analytical support's head height

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => { 
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => {
      displacement.getObjectByName( 'arrow' ).position.setX( -( config[ 'support.analytical.straightShaft.length' ] + height ) );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height );
    });
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height );
      rotation.getObjectByName( 'arrow' ).position.set( -( height + config[ 'support.analytical.straightShaft.length' ] / 2 ), 0, 0 );
    });
    
    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => {
        displacement.getObjectByName( 'arrow' ).position.setX( -( config[ 'support.analytical.straightShaft.length' ] + height ) );
        displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height );
      });
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height );
        rotation.getObjectByName( 'arrow' ).position.set( -( height + config[ 'support.analytical.straightShaft.length' ] / 2 ), 0, 0 );
      });
    }
  });
}

function setAnalyticalHeadRadiusSupport( radius ) {
  // set analytical support's head radius

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => { 
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );
    }
  });
}

function setAnalyticalShaftLengthSupport( length ) {
  // set analytical displacement length shaft

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => { 
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'straightShaft' ).scale.setX( length );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.setX( length );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).position.set( length / 2, 0, 0 );
      displacement.getObjectByName( 'arrow' ).position.setX( -( length + config[ 'support.analytical.head.height' ] ) );
    });
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).position.set( -( config[ 'support.analytical.head.height' ] + length / 2 ), 0, 0 ) );

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => { 
        displacement.getObjectByName( 'arrow' ).getObjectByName( 'straightShaft' ).scale.setX( length );
        displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.setX( length );
        displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).position.set( length / 2, 0, 0 );
        displacement.getObjectByName( 'arrow' ).position.setX( -( length + config[ 'support.analytical.head.height' ] ) );
      });
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).position.set( -( config[ 'support.analytical.head.height' ] + length / 2 ), 0, 0 ) );
    }
  });
}

function setAnalyticalShaftRadiusSupport( radius ) {
  // set analytical support's curve shaft radius

  var ux, uy, uz, rx, ry, rz;
  var curveShaftGeometry = createCurveShaftGeometry( radius, config[ 'support.analytical.shaft.tube'] );

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry.dispose();
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.set( 0, -radius, 0 );
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).position.set( 0, radius, 0 );
    });

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;
    
    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry.dispose();
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.set( 0, -radius, 0 );
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).position.set( 0, radius, 0 );
      });
    }
  });
}

function setAnalyticalShaftTubeSupport( tube ) {
  // set analytical support's shaft tube

  var ux, uy, uz, rx, ry, rz;
  var curveShaftGeometry = createCurveShaftGeometry( config[ 'support.analytical.curveShaft.radius' ], tube );

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'straightShaft' ).scale.set( config[ 'support.analytical.straightShaft.length'], tube, tube ) ); 
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry.dispose();
      rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
    });

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'straightShaft' ).scale.set( config[ 'support.analytical.straightShaft.length'], tube, tube ) ); 
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry.dispose();
        rotation.getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
      });
    }
  });
}

function setAnalyticalRestrainRadiusSupport( radius ) {
  // set analytical support's restraint radius
  
  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.set( config[ 'support.analytical.restraint.thickness' ], radius, radius ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.set( config[ 'support.analytical.restraint.thickness' ], radius, radius ) );

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.set( config[ 'support.analytical.restraint.thickness' ], radius, radius ) );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.set( config[ 'support.analytical.restraint.thickness' ], radius, radius ) );
    }
  });
}

function setAnalyticalRestrainThicknessSupport( thickness ) {
  // set analytical support's restraint thickness

  var ux, uy, uz, rx, ry, rz;

  Object.entries( structure.supports ).forEach( ( [ name, support ] ) => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.setX( thickness ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.setX( thickness ) );

    ux = support.ux;
    uy = support.uy;
    uz = support.uz;
    rx = support.rx;
    ry = support.ry;
    rz = support.rz;

    if ( !( ux && uy && uz && rx && ry && rz ) && !( ux && uy && uz && !rx && !ry && !rz ) ) {
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.setX( thickness ) );
      model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'space' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'arrow' ).getObjectByName( 'restraint' ).scale.setX( thickness ) );
    }
  });
}

// loads
function createLoadAtJoint( loadPattern, joint ) {
  // create a load at joint

  var loadAtJoint = new THREE.Group();
  loadAtJoint.name = loadPattern;
  
  var fx, fy, fz, mx, my, mz;
  fx = fy = fz = mx = my = mz = 0;
  
  structure.load_patterns[ loadPattern ].joints[ joint ].forEach( load => {
    fx += load.fx;
    fy += load.fy;
    fz += load.fz;
    mx += load.mx;
    my += load.my;
    mz += load.mz;
  });

  // create components forces
  var components = new THREE.Group();
  components.name = 'components';
  components.visible = config[ 'load.as' ] == 'components';
  loadAtJoint.add( components );

  var forces = new THREE.Group();
  forces.name = 'forces';
  components.add( forces );

  if ( fx != 0 ) forces.add( createForce( fx, 'x' ) );
  if ( fy != 0 ) forces.add( createForce( fy, 'y' ) );
  if ( fz != 0 ) forces.add( createForce( fz, 'z' ) );
  
  var torques = new THREE.Group();
  torques.name = 'torques';
  components.add( torques );

  if ( mx != 0 ) torques.add( createTorque( mx, 'x' ) );
  if ( my != 0 ) torques.add( createTorque( my, 'y' ) );
  if ( mz != 0 ) torques.add( createTorque( mz, 'z' ) );

  // create resultante force
  var resultant = new THREE.Group();
  resultant.name = 'resultant';
  resultant.visible = config[ 'load.as' ] == 'resultant';
  loadAtJoint.add( resultant );

  var vector;
  
  vector = new THREE.Vector3( fx, fy, fz );
  if ( vector.length() != 0 ) {
    var force = createForce( vector.length(), 'resultant' );
    force.name = 'force';
    force.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0), vector.normalize() );
    resultant.add( force );
  }

  vector = new THREE.Vector3( mx, my, mz );
  if ( vector.length() != 0 ) {
    var torque = createTorque( vector.length(), 'resultant' );
    torque.name = 'torque';
    torque.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0 ), vector.normalize() );
    resultant.add( torque );
  }
  
  return loadAtJoint;
}

function createGlobalLoadAtFrame( loadPattern, frame ) {
  // create a global load at frame

  var loadAtFrame = new THREE.Group();
  loadAtFrame.name = frame;

  var fx, fy, fz, mx, my, mz;
  fx = fy = fz = mx = my = mz = 0;
  
  // uniformly distributed
  if ( structure.load_patterns[ loadPattern ].frames[ frame ].hasOwnProperty( 'uniformly_distributed' ) ) {
    if ( structure.load_patterns[ loadPattern ].frames[ frame ].uniformly_distributed.hasOwnProperty( 'global' ) ) structure.load_patterns[ loadPattern ].frames[ frame ].uniformly_distributed.global.forEach( load => {
      fx += load.fx;
      fy += load.fy;
      fz += load.fz;
      mx += load.mx;
      my += load.my;
      mz += load.mz;
    });
  }

  // create components forces
  var components = new THREE.Group();
  components.name = 'components';
  components.visible = config[ 'load.as' ] == 'components';
  loadAtFrame.add( components );

  var forces = new THREE.Group();
  forces.name = 'forces';
  components.add( forces );
  
  if ( fx != 0 ) forces.add( createGlobalUniformlyDistributedForceAtFrame( frame, fx, 'x' ) );
  if ( fy != 0 ) forces.add( createGlobalUniformlyDistributedForceAtFrame( frame, fy, 'y' ) );
  if ( fz != 0 ) forces.add( createGlobalUniformlyDistributedForceAtFrame( frame, fz, 'z' ) );

  var torques = new THREE.Group();
  torques.name = 'torques';
  components.add( torques );

  if ( mx != 0 ) torques.add( createGlobalUniformlyDistributedTorqueAtFrame( frame, mx, 'x' ) );
  if ( my != 0 ) torques.add( createGlobalUniformlyDistributedTorqueAtFrame( frame, my, 'y' ) );
  if ( mz != 0 ) torques.add( createGlobalUniformlyDistributedTorqueAtFrame( frame, mz, 'z' ) );

  // create resultant force
  // var resultant = new THREE.Group();
  // resultant.name = 'resultant';
  // resultant.visible = config[ 'load.as' ] == 'resultant';
  // loadAtFrame.add( resultant );

  // var vector = new THREE.Vector3( fx, fy, fz );
  // if ( vector.length() != 0 ) {
  //   force = create
  // }

  return loadAtFrame;
}

function createGlobalUniformlyDistributedForceAtFrame( frame, magnitud, axis ) {
  // create a uniformly distributed force at frame

  var uniformlyDistributed = new THREE.Group();
  uniformlyDistributed.name = axis;
  
  frame = model.getObjectByName( 'frames' ).getObjectByName( frame );
  
  var vector = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( frame.quaternion );
  
  if ( 1 - Math.abs( vector.dot( new THREE.Vector3( axis == 'x' ? 1: 0, axis == 'y' ? 1: 0, axis == 'z' ? 1: 0 ) ) ) < 0.003 ) {
    // longitudinal
    var longitudinal = createUniformlyDistributedLongitudinalForce( frame.name, magnitud, axis );
    longitudinal.position.copy( frame.position );
    longitudinal.quaternion.copy( frame.quaternion );
    uniformlyDistributed.add( longitudinal );
  } else {
    // transversal
    var transversal = createUniformlyDistributedTransversalForce( frame.name, magnitud, axis );
    transversal.position.copy( frame.position );
    uniformlyDistributed.add( transversal );
  }

  return uniformlyDistributed;
}

function createUniformlyDistributedLongitudinalForce( frame, magnitud, axis ) {
  // create a uniformly distributed longitudinal force

  var longitudinal = new THREE.Group();
  longitudinal.name = 'longitudinal';
  
  var arrow;
  var material = axis == 'x' ? xMaterial: axis == 'y' ? yMaterial: zMaterial;

  var length = model.getObjectByName( 'joints' ).getObjectByName( structure.frames[ frame ].k ).position.clone().sub( model.getObjectByName( 'joints' ).getObjectByName( structure.frames[ frame ].j ).position ).length();
  var quantite_arrows = Math.max( 1, Math.floor( 1.5 * length ) );
  var step = length / quantite_arrows;
  var shaft = Math.max( 0, step - config[ 'load.head.height' ] );
  
  var init = magnitud < 0 ? 1: 0;
  var i = init;

  for ( i; i < quantite_arrows + init; i++ ) {
    arrow = createStraightArrow( material, shaft, config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
    arrow.name = 'arrrow_' + String( i - init );
    arrow.rotateZ( magnitud < 0 ? Math.PI: 0 );
    arrow.position.setX( -length / 2 + i * step );
    longitudinal.add( arrow );
  }
  
  return longitudinal;
}

function createUniformlyDistributedTransversalForce( frame, magnitud, axis ) {
  // create a uniformly distributed transversal force

  var transversal = new THREE.Group();
  transversal.name = 'transversal';

  var load, loadGeometry, loadEdges, loadEdgesGeometry;

  magnitud = magnitud / Math.abs( magnitud );

  let p1, p2;
  p1 = model.getObjectByName( 'joints' ).getObjectByName( structure.frames[ frame ].j ).position.clone();
  p2 = model.getObjectByName( 'joints' ).getObjectByName( structure.frames[ frame ].k ).position.clone();

  var averague = p1.clone().add( p2 ).multiplyScalar( 0.5 );
  p1.sub( averague );
  p2.sub( averague );

  var p3, p4;
  p3 = p2.clone();
  p4 = p1.clone();
  switch ( axis ) {
    case 'x':
      p3.x -= magnitud;
      p4.x -= magnitud;
      break;
    case 'y':
      p3.y -= magnitud;
      p4.y -= magnitud;
      break;
    case 'z':
      p3.z -= magnitud;
      p4.z -= magnitud;
      break;
  }

  var positions = [];
  positions.push( p1.x, p1.y, p1.z );
  positions.push( p2.x, p2.y, p2.z );
  positions.push( p3.x, p3.y, p3.z );
  positions.push( p3.x, p3.y, p3.z );
  positions.push( p4.x, p4.y, p4.z );
  positions.push( p1.x, p1.y, p1.z );
  
  loadGeometry = new THREE.BufferGeometry();
  loadGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3) );

  loadEdgesGeometry = new THREE.EdgesGeometry( loadGeometry );
  
  switch ( axis ) {
    case 'x':
      load = new THREE.Mesh( loadGeometry, xLoadMaterial );
      loadEdges = new THREE.LineSegments( loadEdgesGeometry, xLoadEdgesMaterial );
      break;
    case 'y':
      load = new THREE.Mesh( loadGeometry, yLoadMaterial );
      loadEdges = new THREE.LineSegments( loadEdgesGeometry, yLoadEdgesMaterial );
      break;
    case 'z':
      load = new THREE.Mesh( loadGeometry, zLoadMaterial );
      loadEdges = new THREE.LineSegments( loadEdgesGeometry, zLoadEdgesMaterial );
      break;
  }
  load.name = 'load';
  loadEdges.name = 'edges';

  load.add( loadEdges );
  transversal.add( load );

  return transversal;
}

function createForce( magnitud, axis ) {
  // create a force

  var force = new THREE.Group();

  var arrow;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();
  
  magnitud = magnitud / Math.abs( magnitud );

  switch ( axis ) {
    case 'resultant':
      arrow = createStraightArrow( resultantForceMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      break;
    case 'x':
      arrow = createStraightArrow( xMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      break;
    case 'y':
      arrow = createStraightArrow( yMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      arrow = createStraightArrow( zMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }

  arrow.name = 'arrow';
  if ( magnitud < 0 ) arrow.quaternion.setFromUnitVectors( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( -1, 0, 0 ) );
  arrow.position.setX( -magnitud * ( Math.abs( magnitud ) + config[ 'load.head.height' ] + config[ 'joint.size' ] ) );
  force.add( arrow );
  
  force.name = axis;
  force.quaternion.copy( quaternion );

  return force;
}

function createTorque( magnitud, axis ) {
  // create a torque

  var torque = new THREE.Group();

  var arrow;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  magnitud = magnitud / Math.abs( magnitud );

  switch ( axis ) {
    case 'resultant':
      arrow = createCurveArrow( resultantTorqueMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      break;
    case 'x':
      arrow = createCurveArrow( xMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      break;
    case 'y':
      arrow = createCurveArrow( yMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      arrow = createCurveArrow( zMaterial, Math.abs( magnitud ), config[ 'load.shaft.tube' ], config[ 'load.head.height' ], config[ 'load.head.radius' ] );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }

  arrow.name = 'arrow';
  if ( axis != 'resultant' && magnitud < 0 ) arrow.rotateY( Math.PI );
  torque.add( arrow );

  torque.name = axis;
  torque.quaternion.copy( quaternion );

  return torque;
}

export function addLoadPattern( name ) {
  // add a load pattern

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if load pattern's name already exits
    if ( structure.load_patterns.hasOwnProperty( name) ) {
      reject( new Error( "load pattern's name '" + name + "' already extis" ) );
    } else {
      // add load pattern to structure
      structure.load_patterns[ name ] = {};

      // add load pattern to model
      var loadPattern = new THREE.Group();
      loadPattern.name = name;
      loadPattern.visible = name == config[ 'load.loadPattern' ];
      model.getObjectByName( 'loads' ).add( loadPattern );

      // add load pattern to controller
      var str, innerHTMLStr = "<option value='" + "" + "'>" + "" + "</options>";
      Object.keys( structure.load_patterns ).forEach( loadPattern => {
        str = "<option value='" + loadPattern + "'>" + loadPattern + "</options>";
        innerHTMLStr += str;
      });
      loadPatternController.domElement.children[ 0 ].innerHTML = innerHTMLStr;
      loadPatternController.updateDisplay();

      resolve( "load pattern '" + name + "' was added" );
    }
  });

  return promise;
}

export function addLoadAtJoint( loadPattern, joint, fx, fy, fz, mx, my, mz ) {
  // add a load at joint

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    loadPattern = loadPattern.toString();
    joint = joint.toString();
      
    // check if loadPattern & joint exists
    if ( structure.load_patterns.hasOwnProperty( loadPattern ) && structure.joints.hasOwnProperty( joint ) ) {
      // add load to structure

      if ( !structure.load_patterns[ loadPattern ].hasOwnProperty( 'joints' ) ) structure.load_patterns[ loadPattern ].joints = {};
      if ( !structure.load_patterns[ loadPattern ].joints.hasOwnProperty( joint ) ) structure.load_patterns[ loadPattern ].joints[ joint ] = [];

      structure.load_patterns[ loadPattern ].joints[ joint ].push( { 'fx': fx, 'fy': fy, 'fz': fz, 'mx': mx, 'my': my, 'mz': mz } );

      // add loads to joint
      if ( !model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ) ) {
        var loads = new THREE.Group();
        loads.name = 'loads';
        loads.visible = config[ 'load.visible' ];
        model.getObjectByName( 'joints' ).getObjectByName( joint ).add( loads );
      }

      // remove loadPattern
      if ( model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPattern ) ) model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).remove( model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPattern ) );

      // add load to model
      var load = createLoadAtJoint( loadPattern, joint );
      load.visible = loadPattern == config[ 'load.loadPattern' ];
      model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).add( load );

      // set force scale
      setLoadForceScale( config[ 'load.force.scale' ] );

      // set torque scale
      setLoadTorqueScale( config[ 'load.torque.scale' ] );

      resolve( "joint load added" );
    } else {
      if ( structure.load_patterns.hasOwnProperty( loadPattern ) ) {
        reject( new Error( "joint '" + joint + "' does not exist" ) );
      } else {
        reject( new Error( "load pattern '" + loadPattern + "' does not exist" ) );
      }
    }
  });

  return promise;
}

export function addUniformlyDistributedLoadAtFrame( loadPattern, frame, system, fx, fy, fz, mx, my, mz ) {
  // add a uniformly distributed load at frame

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    loadPattern = loadPattern.toString();
    frame = frame.toString();

    // check if loadPatttern & frame exists
    if ( structure.load_patterns.hasOwnProperty( loadPattern ) && structure.frames.hasOwnProperty( frame ) ) {
      // add load to structure

      if ( !structure.load_patterns[ loadPattern ].hasOwnProperty( 'frames' ) ) structure.load_patterns[ loadPattern ].frames = {};
      if ( !structure.load_patterns[ loadPattern ].frames.hasOwnProperty( frame ) ) structure.load_patterns[ loadPattern ].frames[ frame ] = {};
      if ( !structure.load_patterns[ loadPattern ].frames[ frame ].hasOwnProperty( 'uniformly_distributed' ) ) structure.load_patterns[ loadPattern ].frames[ frame ][ 'uniformly_distributed' ] = {};
      if ( !structure.load_patterns[ loadPattern ].frames[ frame ].uniformly_distributed.hasOwnProperty( system ) ) structure.load_patterns[ loadPattern ].frames[ frame ][ 'uniformly_distributed' ][ system ] = [];
      structure.load_patterns[ loadPattern ].frames[ frame ].uniformly_distributed[ system ].push( { 'fx': fx, 'fy': fy, 'fz': fz, 'mx': mx, 'my': my, 'mz': mz } );

      // add frame to loads
      if ( !model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).getObjectByName( 'frames' ) ) {
        var frames = new THREE.Group();
        frames.name = 'frames';
        model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).add( frames );
      }

      // add loads to frame
      // if ( !model.getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'loads' ) ) {
      //   var loads = new THREE.Group();
      //   loads.name = 'loads';
      //   loads.visible = config[ 'load.visible' ];
      //   model.getObjectByName( 'frames' ).getObjectByName( frame ).add( loads );
      // }

      // remove loadPattern
      if ( model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).getObjectByName( 'frames' ).getObjectByName( frame ) ) model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).getObjectByName( 'frames' ).remove( model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).getObjectByName( 'frames' ).getObjectByName( frame ) );
      // if ( model.getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'loads' ).getObjectByName( loadPattern ) ) model.getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'laods' ).remove( model.getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'laods' ).getObjectByName( loadPattern ) );

      // add distributed load to model
      model.getObjectByName( 'loads' ).getObjectByName( loadPattern ).getObjectByName( 'frames' ).add( createGlobalLoadAtFrame( loadPattern, frame ) );

      // set force scale
      setLoadForceScale( config[ 'load.force.scale' ] );

      resolve( "frame distributed load added" );
    } else {
      if ( structure.load_patterns.hasOwnProperty( loadPattern ) ) {
        reject( new Error( "frame '" + frame + "' does not exist" ) );
      } else {
        reject( new Error( "load pattern '" + loadPattern + "' does not exist" ) );
      }
    }
  });

  return promise;
}

function setLoadVisible( visible ) {
  // set load visibile

  model.getObjectByName( 'joints' ).children.filter( joint => joint.getObjectByName( 'loads' ) ).forEach( joint => joint.getObjectByName( 'loads' ).visible = visible );
  model.getObjectByName( 'loads' ).visible = visible;

  // Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    // if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      
      // Object.keys( loadPattern.frames ).forEach( frame => model.getObjectByName( 'freames' ).getObjectByName( frame ).getObjectByName( 'loads' ).visible = visible );
    // }
  // });
}

function setLoadPatternVisible( loadPattern ) {
  // set visible load pattern

  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      Object.keys( loadPatternValue.joints ).forEach( joint => model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).visible = loadPatternName == loadPattern );
    }
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).visible = loadPatternName == loadPattern;
    }
  });
}

function setLoadAs( as ) {
  // set load as
  
  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      Object.keys( loadPatternValue.joints ).forEach( joint => {
        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).visible = as == 'components';
        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).visible = as == 'resultant';
      });
    }
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      Object.keys( loadPatternValue.frames ).forEach( frame => {
        model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'components' ).visible = as == 'components';
        // model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'resultant' ).visible = as == 'resltant';
      });
    }
  });
}

function setLoadForceScale( scale ) {
  // set load force scale
  var fcomp, fres, fx, fy, fz, fcomp_min, fcomp_max, fres_min, fres_max, arrow, transversal, vector, magnitud;

  // joints
  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      // calculate fcomp_min and fcomp_max
      fcomp = [];
      fres = [];
      fcomp_min = fcomp_max = fres_min = fres_max = 0;

      Object.values( loadPatternValue.joints ).forEach( loads => {
        fx = fy = fz = 0;
        loads.forEach( load => {
          fx += load.fx;
          fy += load.fy;
          fz += load.fz;
        });

        if ( fx ) fcomp.push( Math.abs( fx ) );
        if ( fy ) fcomp.push( Math.abs( fy ) );
        if ( fz ) fcomp.push( Math.abs( fz ) );

        vector = new THREE.Vector3( fx, fy, fz );
        if ( vector.length() ) fres.push( vector.length() );
      });

      fcomp_min = Math.min( ...fcomp );
      fcomp_max = Math.max( ...fcomp );

      fres_min = Math.min( ...fres );
      fres_max = Math.max( ...fres );

      Object.entries( loadPatternValue.joints ).forEach( ( [ joint, loads ] ) => {
        fx = fy = fz = 0;
        loads.forEach( load => {
          fx += load.fx;
          fy += load.fy;
          fz += load.fz;
        });

        // components
        Object.entries( { 'x': fx, 'y': fy, 'z': fz } ).forEach( ( [ axis, magnitud ] ) => { 
          if ( magnitud != 0 ) {
            magnitud = magnitud / Math.abs( magnitud ) * scale * ( 0.25 * ( fcomp_max - Math.abs( magnitud ) ) + ( Math.abs( magnitud ) - fcomp_min ) ) / ( fcomp_max - fcomp_min );

            arrow = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'forces' ).getObjectByName( axis ).getObjectByName( 'arrow' );
            arrow.getObjectByName( 'straightShaft' ).scale.setX( Math.abs( magnitud ) );
            arrow.getObjectByName( 'head' ).position.setX( Math.abs( magnitud ) );
            
            arrow.position.setX( -magnitud / Math.abs( magnitud ) * ( Math.abs( magnitud ) + config[ 'load.head.height' ] + config[ 'joint.size' ] ) );
          }
        });

        vector = new THREE.Vector3( fx, fy, fz );
        
        // resultant
        if ( vector.length() != 0 ) {
          magnitud = scale * ( 0.25 * ( fres_max - vector.length() ) + ( vector.length() - fres_min ) ) / ( fres_max - fres_min );
          
          arrow = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'force' ).getObjectByName( 'arrow' );
          arrow.getObjectByName( 'straightShaft' ).scale.setX( magnitud );
          arrow.getObjectByName( 'head' ).position.setX( magnitud );

          arrow.position.setX( -( magnitud + config[ 'load.head.height' ] + config[ 'joint.size' ] ) );
        }
      });
    }

    // frames
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      // calculate fcomp_min and fcomp_max
      fcomp = [];
      fres = [];
      fcomp_min = fcomp_max = fres_min = fres_max = 0;

      Object.values( loadPatternValue.frames ).forEach( loads => {
        // uniformly distributed
        if ( loads.hasOwnProperty( 'uniformly_distributed' ) ) {
          // global
          if ( loads.uniformly_distributed.hasOwnProperty( 'global' ) ) {
            fx = fy = fz = 0;

            loads.uniformly_distributed.global.forEach( load => {
              fx += load.fx;
              fy += load.fy;
              fz += load.fz;
            });
            
            if ( fx ) fcomp.push( Math.abs( fx ) );
            if ( fy ) fcomp.push( Math.abs( fy ) );
            if ( fz ) fcomp.push( Math.abs( fz ) );
  
            vector = new THREE.Vector3( fx, fy, fz );
            if ( vector.length() ) fres.push( vector.length() );
          }
        }
      });

      fcomp_min = Math.min( ...fcomp );
      fcomp_max = Math.max( ...fcomp );

      fres_min = Math.min( ...fres );
      fres_max = Math.max( ...fres );

      Object.entries( loadPatternValue.frames ).forEach( ( [ frame, loads ] ) => {
        // uniformly distributed
        if ( loads.hasOwnProperty( 'uniformly_distributed' ) ) {
          // global
          if ( loads.uniformly_distributed.hasOwnProperty( 'global' ) ) {
            fx = fy = fz = 0;

            loads.uniformly_distributed.global.forEach( load => {
              fx += load.fx;
              fy += load.fy;
              fz += load.fz;
            });

            // components
            Object.entries( { 'x': fx, 'y': fy, 'z': fz } ).forEach( ( [ axis, magnitud ] ) => { 
              if ( magnitud != 0 ) {
                magnitud = magnitud / Math.abs( magnitud ) * scale * ( 0.4 * ( fcomp_max - Math.abs( magnitud ) ) + ( Math.abs( magnitud ) - fcomp_min ) ) / ( fcomp_max - fcomp_min );
    
                // longitudinal
                if ( model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( frame ).getObjectByName( 'components' ).getObjectByName( 'forces' ).getObjectByName( axis ).getObjectByName( 'transversal' ) ) {
                  transversal = model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( frame ).getObjectByName( 'components' ).getObjectByName( 'forces' ).getObjectByName( axis ).getObjectByName( 'transversal' );
                  transversal.scale.setComponent( { 'x': 0, 'y': 1, 'z': 2 }[ axis ], Math.abs( magnitud ) );
                }
              }
            });
    
            // vector = new THREE.Vector3( fx, fy, fz );
            
            // // resultant
            // if ( vector.length() != 0 ) {
            //   magnitud = scale * ( 0.25 * ( fres_max - vector.length() ) + ( vector.length() - fres_min ) ) / ( fres_max - fres_min );
              
            //   arrow = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'force' ).getObjectByName( 'arrow' );
            //   arrow.getObjectByName( 'straightShaft' ).scale.setX( magnitud );
            //   arrow.getObjectByName( 'head' ).position.setX( magnitud );
    
            //   arrow.position.setX( -( magnitud + config[ 'load.head.height' ] + config[ 'joint.size' ] ) );
            // }
          }
        }
      });
    }
  });
}

function setLoadTorqueScale( scale ) {
  // set load torque scale

  var mcomp, mres, mx, my, mz, mcomp_min, mcomp_max, mres_min, mres_max, curveShaft, vector, magnitud;

  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      // calculate mcomp_min and mcomp_max
      mcomp = [];
      mres = [];
      mcomp_min = mcomp_max = mres_min = mres_max = 0;

      Object.values( loadPatternValue.joints ).forEach( loads => {
        mx = my = mz = 0;
        loads.forEach( load => {
          mx += load.mx;
          my += load.my;
          mz += load.mz;
        });

        if ( mx ) mcomp.push( Math.abs( mx ) );
        if ( my ) mcomp.push( Math.abs( my ) );
        if ( mz ) mcomp.push( Math.abs( mz ) );

        vector = new THREE.Vector3( mx, my, mz );
        if ( vector.length() ) mres.push( vector.length() );
      });

      mcomp_min = Math.min( ...mcomp );
      mcomp_max = Math.max( ...mcomp );

      mres_min = Math.min( ...mres );
      mres_max = Math.max( ...mres );

      Object.entries( loadPatternValue.joints ).forEach( ( [ joint, loads ] ) => {
        mx = my = mz = 0;
        loads.forEach( load => {
          mx += load.mx;
          my += load.my;
          mz += load.mz;
        });
        
        // components
        Object.entries( { 'x': mx, 'y': my, 'z': mz } ).forEach( ( [ axis, magnitud ] ) => {
          if ( magnitud != 0 ) {
            magnitud = scale * ( 0.4 * ( mcomp_max - Math.abs( magnitud ) ) + ( Math.abs( magnitud ) - mcomp_min ) ) / ( mcomp_max - mcomp_min );

            curveShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'torques' ).getObjectByName( axis ).getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' );
            curveShaft.geometry.dispose();
            curveShaft.geometry = createCurveShaftGeometry( magnitud, config[ 'load.shaft.tube' ] );

            model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'torques' ).getObjectByName( axis ).getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.setY( -magnitud );
          }
        });
        
        vector = new THREE.Vector3( mx, my, mz );
        
        // resultant
        if ( vector.length() != 0 ) {
          magnitud = scale * ( 0.4 * ( mres_max - vector.length() ) + ( vector.length() - mres_min ) ) / ( mres_max - mres_min );

          curveShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'torque' ).getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' );
          curveShaft.geometry.dispose();
          curveShaft.geometry = createCurveShaftGeometry( magnitud, config[ 'load.shaft.tube' ] );

          model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'torque' ).getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.setY( -magnitud );
        }
      });
    }
  });
}

function setLoadHeadHeight( height ) {
  // set load head height

  var arrow;

  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      Object.keys( loadPatternValue.joints ).forEach( joint => {
        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).children.forEach( loads => loads.children.forEach( axis => axis.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height ) ) );

        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'forces' ).children.forEach( axis => {
          arrow = axis.getObjectByName( 'arrow' );
          arrow.position.setX( arrow.position.x / Math.abs( arrow.position.x ) * ( arrow.getObjectByName( 'straightShaft' ).scale.x + height + config[ 'joint.size' ] ) );
        });

        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).children.forEach( load => load.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height ) );
        
        arrow = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'force' ).getObjectByName( 'arrow' );
        arrow.position.setX( -( arrow.getObjectByName( 'straightShaft' ).scale.x + height + config[ 'joint.size' ] ) );
      });
    }
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      Object.keys( loadPatternValue.frames ).forEach( frame => {
        model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).remove( model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).getObjectByName( frame ) );
        model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).add( createGlobalLoadAtFrame( loadPatternName, frame ) );
      });

      setLoadForceScale( config[ 'load.force.scale' ] );
    }
  });
}

function setLoadHeadRadius( radius ) {
  // set load head radius

  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      Object.keys( loadPatternValue.joints ).forEach( joint => {
        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).children.forEach( loads => loads.children.forEach( axis => axis.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'load.head.height' ], radius, radius ) ) );
        model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).children.forEach( load => load.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'load.head.height' ], radius, radius ) );
      });
    }
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) Object.keys( loadPatternValue.frames ).forEach( frame => model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'components' ).getObjectByName( 'forces' ).children.filter( force => force.getObjectByName( 'longitudinal' ) ).forEach( force => force.getObjectByName( 'longitudinal' ).children.forEach( arrow => arrow.getObjectByName( 'head' ).scale.set( config[ 'load.head.height' ], config[ 'load.head.radius' ], config[ 'load.head.radius' ] ) ) ) );
  });
}

function setLoadShaftTube( tube ) {
  // set load shaft tube

  var fx, fy, fz, mx, my, mz, straightShaft, curveShaft, curveShaftGeometry, vector;
  
  Object.entries( structure.load_patterns ).forEach( ( [ loadPatternName, loadPatternValue ] ) => {
    if ( loadPatternValue.hasOwnProperty( 'joints' ) ) {
      Object.entries( loadPatternValue.joints ).forEach( ( [ joint, loads ] ) => {
        fx = fy = fz = mx = my = mz = 0;
        loads.forEach( load => {
          fx += load.fx;
          fy += load.fy;
          fz += load.fz;
          mx += load.mx;
          my += load.my;
          mz += load.mz;
        });

        // components
        Object.entries( { 'x': fx, 'y': fy, 'z': fz } ).forEach( ( [ axis, magnitud ] ) => {
          if ( magnitud != 0 ) {
            straightShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'forces' ).getObjectByName( axis ).getObjectByName( 'straightShaft' );
            straightShaft.scale.setY( tube );
            straightShaft.scale.setZ( tube );
          }});
                  
        Object.entries( { 'x': mx, 'y': my, 'z': mz } ).forEach( ( [ axis, magnitud ] ) => {
          if ( magnitud != 0 ) {
            curveShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'components' ).getObjectByName( 'torques' ).getObjectByName( axis ).getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' );
            curveShaftGeometry = createCurveShaftGeometry( curveShaft.geometry.parameters.radius, tube );
            curveShaft.geometry.dispose();
            curveShaft.geometry = curveShaftGeometry;
          }
        });

        // resultant
        vector = new THREE.Vector3( fx, fy, fz );
        if ( vector.length() != 0 ) {
          straightShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'force' ).getObjectByName( 'arrow' ).getObjectByName( 'straightShaft' );
          straightShaft.scale.setY( tube );
          straightShaft.scale.setZ( tube );
        }
        
        vector = new THREE.Vector3( mx, my, mz );
        if ( vector.length() != 0 ) {
          curveShaft = model.getObjectByName( 'joints' ).getObjectByName( joint ).getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'resultant' ).getObjectByName( 'torque' ).getObjectByName( 'arrow' ).getObjectByName( 'curveShaft' );
          curveShaftGeometry = createCurveShaftGeometry( curveShaft.geometry.parameters.radius, tube );
          curveShaft.geometry.dispose();
          curveShaft.geometry = curveShaftGeometry;
        }
      });
    }
    if ( loadPatternValue.hasOwnProperty( 'frames' ) ) {
      Object.keys( loadPatternValue.frames ).forEach( frame => model.getObjectByName( 'loads' ).getObjectByName( loadPatternName ).getObjectByName( 'frames' ).getObjectByName( frame ).getObjectByName( 'components' ).getObjectByName( 'forces' ).children.filter( force => force.getObjectByName( 'longitudinal' ) ).forEach( force => force.getObjectByName( 'longitudinal' ).children.forEach( arrow => {
        arrow.getObjectByName( 'straightShaft' ).scale.setY( tube );
        arrow.getObjectByName( 'straightShaft' ).scale.setZ( tube );
      })));
    }
  });
}

window.addEventListener( "resize", onResize, false );
