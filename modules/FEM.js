// three.js
var scene, camera, controls;
var webGLRenderer, CSS2DRenderer;

// html
var canvasWebGLRenderer = document.getElementById( "canvas" );
var canvasCSS2DRenderer = document.getElementById( "labels" );

// light
// var ambientLight;
// var hemisphereLight;
// var directionalLight;

// controls
var stats, gui;

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
 
  // 'lights.ambient.color': 0x0c0c0c,

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
  'ground.grid.menor': 0xffffff,

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

  'support.analytical.restrain.radius': 0.1,
  'support.analytical.restrain.thickness': 0.01,

  'support.foundation.size': 0.5,
  'support.foundation.depth': 0.05,

  'support.pedestal.size': 0.3,

  'support.pin.height': 0.3,
  'support.pin.radius': 0.3,
};

var structure, model;

var jointMaterial, frameMaterial, frameEdgesMaterial, xMaterial, yMaterial, zMaterial, foundationMaterial, foundationEdgesMaterial, pedestalMaterial, pedestalEdgesMaterial, pinEdgesMaterial;
var jointGeometry, wireFrameShape, straightShaftGeometry, headGeometry, restrainGeometry, foundationGeometry, foundationEdgesGeometry, pedestalGeometry, pedestalEdgesGeometry, pinGeometry, pinEdgesGeometry;

var sections = {};

function init() {
  // refresh the config
  var json = JSON.parse( localStorage.getItem( window.location.href + '.gui' ) );
  if ( json ) {
    var preset = json.remembered[ json.preset ][ '0' ];
    for ( let [ key, value ] of Object.entries( preset ) ) config[ key ] = value;
  }
  
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

  // create the WebGL renderer
  webGLRenderer = new THREE.WebGLRenderer( { canvas: canvasWebGLRenderer, alpha: true, antialias: true } );
  webGLRenderer.setPixelRatio( window.devicePixelRatio );
  webGLRenderer.setSize( canvasWebGLRenderer.clientWidth, canvasWebGLRenderer.clientHeight );
  // webGLRenderer.shadowMap.enabled = true;
  
  // create the CSS2D renderer
  CSS2DRenderer = new THREE.CSS2DRenderer();
  CSS2DRenderer.setSize( canvasCSS2DRenderer.clientWidth, canvasCSS2DRenderer.clientHeight );
  canvasCSS2DRenderer.appendChild( CSS2DRenderer.domElement );
  
  // create the controls
  controls = createControls( config[ 'controls.rotateSpeed' ], config[ 'controls.zoomSpeed' ], config[ 'controls.panSpeed' ], config[ 'controls.screenPanning' ], config[ 'controls.damping.enable' ], config[ 'controls.damping.factor' ] );
  
  // set the materials
  jointMaterial = new THREE.MeshBasicMaterial( { color: config[ 'joint.color' ], transparent: config[ 'joint.transparent' ], opacity: config[ 'joint.opacity' ] } );

  frameMaterial = new THREE.MeshBasicMaterial( { color: config[ 'frame.color' ], transparent: config[ 'frame.transparent' ], opacity: config[ 'frame.opacity' ] } );
  frameEdgesMaterial = new THREE.LineBasicMaterial( { color: config[ 'frame.color' ] } ) ;

  xMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.x' ] } );
  yMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.y' ] } );
  zMaterial = new THREE.MeshBasicMaterial( { color: config[ 'axes.z' ] } );

  foundationMaterial = { x: xMaterial, y: yMaterial, z:zMaterial };
  foundationEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );  

  pedestalMaterial = [ xMaterial, xMaterial, yMaterial, yMaterial, zMaterial, zMaterial ];
  pedestalEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );

  pinEdgesMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );

  // set the geometries
  jointGeometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
  
  wireFrameShape = new THREE.Shape().arc();

  straightShaftGeometry = new THREE.CylinderBufferGeometry();
  straightShaftGeometry.rotateZ( Math.PI / 2 );
  straightShaftGeometry.translate( 0.5, 0, 0 );

  headGeometry = new THREE.ConeBufferGeometry();
  headGeometry.rotateZ( 3 * Math.PI / 2 );
  headGeometry.translate( 0.5, 0, 0 );

  restrainGeometry = new THREE.CylinderBufferGeometry();
  restrainGeometry.rotateZ( Math.PI / 2 );
  
  foundationGeometry = new THREE.BoxBufferGeometry();
  foundationGeometry.translate( 0, 0, -0.5 );
  foundationEdgesGeometry = new THREE.EdgesGeometry( foundationGeometry );
  
  pedestalGeometry = new THREE.BoxBufferGeometry();
  pedestalEdgesGeometry = new THREE.EdgesGeometry( pedestalGeometry );

  pinGeometry = new THREE.ConeBufferGeometry( 1, 1, 4, 1, true );
  pinGeometry.groups = [];
  pinGeometry.addGroup(  0, 6, 0 );
  pinGeometry.addGroup(  6, 6, 1 );
  pinGeometry.addGroup( 12, 6, 2 );
  pinGeometry.addGroup( 18, 6, 3 );
  pinGeometry.rotateX( Math.PI / 2 );
  pinGeometry.rotateZ( Math.PI / 4 );
  pinGeometry.translate( 0, 0, -0.5 );

  pinEdgesGeometry = new THREE.EdgesGeometry( pinGeometry );

  // create the ground
  var ground = createGround( config[ 'ground.size' ], config[ 'ground.grid.divisions' ], config[ 'ground.plane.color' ], config[ 'ground.plane.transparent' ], config[ 'ground.plane.opacity' ], config[ 'ground.grid.major' ], config[ 'ground.grid.menor' ] );
  scene.add( ground );

  // create the model
  model = createModel();
  setModelRotation( config[ 'model.axisUpwards' ] );
  scene.add( model );

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
  headAxesModel.add( config, 'model.axes.head.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setAxesHeadRadius( model.getObjectByName( 'axes' ), radius ) );
  // add shaft folder
  let shaftAxesModel = axesModelFolder.addFolder( "shaft" );
  shaftAxesModel.add( config, 'model.axes.shaft.length' ).name( 'length' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( length => setAxesShaftLength( model.getObjectByName( 'axes' ), length ) );
  shaftAxesModel.add( config, 'model.axes.shaft.radius' ).name( 'radius' ).min( 0.001 ).max( 0.1 ).step( 0.001 ).onChange( radius => setAxesShaftRadius( model.getObjectByName( 'axes' ), radius ) );

  // add a light folder
  // let lightsFolder = gui.addFolder( "light");
  // add a ambiernt folder
  // let ambientFolder = lightsFolder.addFolder( "ambient" );
  // ambientFolder.addColor( config.lights.ambient, 'color' ).onChange( color => ambientLight.color = new THREE.Color( color ) );

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

  // add axes folder
  let axesFolder = gui.addFolder( "axes" );
  axesFolder.addColor( config, 'axes.x' ).name( 'x' ).onChange( color => xMaterial.color = new THREE.Color( color ) );
  axesFolder.addColor( config, 'axes.y' ).name( 'y' ).onChange( color => yMaterial.color = new THREE.Color( color ) );
  axesFolder.addColor( config, 'axes.z' ).name( 'z' ).onChange( color => zMaterial.color = new THREE.Color( color ) );

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
  frameFolder.add( config, 'frame.visible' ).name( 'visible' ).onChange( visible => setFrameVisible( visible ));
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
  // add restrain folder
  let restrainArrowSupportFolder = analyticalSupportFolder.addFolder( "restrain" );
  restrainArrowSupportFolder.add( config, 'support.analytical.restrain.radius' ).name( 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( radius => setAnalyticalRestrainRadiusSupport( radius ) );
  restrainArrowSupportFolder.add( config, 'support.analytical.restrain.thickness' ).name( 'thickness' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( thickness => setAnalyticalRestrainThicknessSupport( thickness ) );
  
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
    camera.position.add( position.clone().sub( target ).multiplyScalar( 10 ) ); // TODO: proyect camera in the scene's boundaty sphere
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
function createStructure() { return { joints: {}, materials: {}, sections: {}, frames: {}, supports: {} } };

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
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: color, transparent: transparent, opacity: opacity, side: THREE.DoubleSide } ) );
  plane.name = 'plane';
  plane.visible = config[ 'ground.plane.visible'];
  ground.add( plane )
  
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

      // create structure
      structure = createStructure();
      
      // add objects
      Object.entries( json.joints ).forEach( ( [ name, joint ] ) => { addJoint( name, joint.x, joint.y, joint.z ) } );
      Object.entries( json.materials ).forEach( ( [ name, material ] ) => { addMaterial( name, material.E, material.G ) } );
      
      // add sections
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

      // add frames
      Object.entries( json.frames ).forEach( ( [ name, frame ] ) => { addFrame( name, frame.j, frame.k, frame.material, frame.section ) } );

      // add suports
      Object.entries( json.supports ).forEach( ( [ name, support ] ) => { addSupport( name, support.ux, support.uy, support.uz, support.rx, support.ry, support.rz ) } );

      return "the '" + filename + "' model has been loaded"
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

// model 
function setModelRotation( axis ) { model.setRotationFromAxisAngle( new THREE.Vector3( 1, 1, 1 ).normalize(), { x: 4 * Math.PI / 3, y: 2 * Math.PI / 3, z: 0 }[ axis ] ) };

export function setUpwardsAxis( axis ) {
  // set the upwards axis
  
  var promise = new Promise( ( resolve, reject ) => {
    if ( axis =='x' || axis == 'y' || axis == 'z' ) {
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

// axes
function createAxes( shaftLength, shaftRadius, headHeight, headRadius ) {
  // create the axes

  var axes = new THREE.Group();
  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();

  var arrow;

  // axis x
  arrow = createArrow( xMaterial, shaftLength, shaftRadius, headHeight, headRadius );
  axes.add( arrow );

  // axis y
  arrow = createArrow( yMaterial, shaftLength, shaftRadius, headHeight, headRadius );
  arrow.quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
  axes.add( arrow );

  // axis z
  arrow = createArrow( zMaterial, shaftLength, shaftRadius, headHeight, headRadius );
  arrow.quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
  axes.add( arrow );

  return axes;
}

function createArrow( material, shaftLength, shaftRadius, headHeight, headRadius ) {
  // create an arrow
  var arrow = new THREE.Group();

  // shaft
  var shaft = new THREE.Mesh( straightShaftGeometry, material );
  shaft.name = 'shaft';
  shaft.scale.set( shaftLength, shaftRadius, shaftRadius );
  arrow.add( shaft );

  // head
  var head = new THREE.Mesh( headGeometry, material );
  head.name = 'head';
  head.position.setX( shaftLength );
  head.scale.set( headHeight, headRadius, headRadius );
  arrow.add( head );

  return arrow;
}

function setAxesHeadHeight( axes, head ) { axes.children.forEach( arrow => arrow.getObjectByName( 'head' ).scale.setX( head ) ) };

function setAxesHeadRadius( axes, radius) { axes.children.forEach( arrow => arrow.getObjectByName( 'head' ).scale.set( arrow.getObjectByName( 'head' ).scale.x, radius, radius ) ) };

function setAxesShaftLength( axes, length ) {
  // set axes shaft length

  axes.children.forEach( arrow => { 
    arrow.getObjectByName( 'shaft' ).scale.setX( length );
    arrow.getObjectByName( 'head' ).position.setX( length );
  });
}

function setAxesShaftRadius( axes, radius ) { axes.children.forEach( arrow => arrow.getObjectByName( 'shaft' ).scale.set( arrow.getObjectByName( 'shaft' ).scale.x, radius, radius ) ) };

// joint
function createJoint( size ) {
  // create a joint

  var joint = new THREE.Mesh( jointGeometry, jointMaterial );

  joint.name = "joint";
  joint.visible = config[ 'joint.visible' ];
  joint.scale.setScalar( size );
  
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

function setJointSize( size ) { model.getObjectByName( 'joints' ).children.forEach( joint => joint.getObjectByName( 'joint' ).scale.setScalar( size ) ) };

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
    }

    resolve( "material '" + name + "' was added" );
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

function createRectangularSection( widht, height ) { return new THREE.Shape().moveTo(  widht / 2, -height / 2 ).lineTo(  widht / 2,  height / 2 ).lineTo( -widht / 2,  height / 2 ).lineTo( -widht / 2, -height / 2 ) };

export function addSection( name ) {
  // add a section

  var promise = new Promise( ( resolve, reject ) => {
    // only strings accepted as name
    name = name.toString();

    // check if section's name already exits
    if ( structure.sections.hasOwnProperty( name ) ) {
      reject( new Error( "Section's name '" + name + "' already exits" ) );
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
    }

    resolve( "rectangular section '" + name + "' was added" );
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
  var extrudeSettings = { depth: length, bevelEnabled: false };  // curveSegments: 24,

  // extrude wireFrameShape
  var wireFrame = new THREE.Mesh( new THREE.ExtrudeBufferGeometry( wireFrameShape, extrudeSettings ), frameMaterial );
  wireFrame.name = 'wireFrame';
  wireFrame.scale.set( config[ 'frame.size' ], config[ 'frame.size' ], 1 );

  // create extrude frame
  var extrudeFrame;  
  if ( structure.sections[ section ].type == 'Section' ) {
    // fallback mode
    extrudeFrame = wireFrame.clone();
  } else {
    // extrude cross section
    var extrudeFrameGeometry = new THREE.ExtrudeBufferGeometry( sections[ section ], extrudeSettings );
    extrudeFrame = new THREE.Mesh( extrudeFrameGeometry, frameMaterial );
    // add edges to frame
    var edgesExtrudeFrame = new THREE.LineSegments( new THREE.EdgesGeometry( extrudeFrameGeometry ), frameEdgesMaterial );
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
    
        // get local axis
        var x_local =  k.position.clone().sub( j.position );
    
        // create frame
        var frame = createFrame( x_local.length(), structure.frames[ name ].section );
    
        // set name
        frame.name = name;
    
        // add axes
        var axes = createAxes( config[ 'frame.axes.shaft.length'], config[ 'frame.axes.shaft.radius'], config[ 'frame.axes.head.height'], config[ 'frame.axes.head.radius'] );
        axes.name = 'axes';
        axes.visible = config[ 'frame.axes.visible' ];
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
};

function setFrameSize( size ) {
  // set frame size

  let scale = new THREE.Vector3( size, size, 1 );

  model.getObjectByName( 'frames' ).children.forEach( frame => { 
    frame.getObjectByName( 'wireFrame' ).scale.copy( scale );
    if ( structure.sections[ structure.frames[ frame.name ].section ].type == 'Section' ) frame.getObjectByName( 'extrudeFrame').scale.copy( scale );
  });
}

// supports
function createSupport( ux, uy, uz, rx, ry, rz ) {
  // create a support

  var support = new THREE.Group();

  // create analytical support
  var analytical = new THREE.Group();

  // create displacements supports
  var displacements = new THREE.Group();

  if ( ux ) displacements.add( createDisplacementSupport( 'x', config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] ) );
  if ( uy ) displacements.add( createDisplacementSupport( 'y', config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] ) );
  if ( uz ) displacements.add( createDisplacementSupport( 'z', config[ 'support.analytical.straightShaft.length' ], config[ 'support.analytical.shaft.tube' ], config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ] ) );

  // create rotational supports
  var rotations = new THREE.Group();

  if ( rx ) rotations.add( createRotationSupport( 'x' ) );
  if ( ry ) rotations.add( createRotationSupport( 'y' ) );
  if ( rz ) rotations.add( createRotationSupport( 'z' ) );

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
  displacements.name = 'displacements';
  rotations.name = 'rotations';
  space.name = 'space';

  analytical.add( displacements );
  analytical.add( rotations );

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

  // add edges
  foundation.add( foundationEdges );

  // keep vertical
  foundation.quaternion.copy( model.quaternion.clone().inverse() );

  // set size
  foundation.scale.set( config[ 'support.foundation.size' ], config[ 'support.foundation.size' ], config[ 'support.foundation.depth' ] );

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

  return pedestal;
}

function createPin() {
  
  // create a pin
  var color1;
  var color2;

  switch ( config[ 'model.axisUpwards'] ) {
    case 'x':
      color1 = yMaterial;
      color2 = zMaterial;
      break;
    case 'y':
      color1 = zMaterial;
      color2 = xMaterial;
      break;
    case 'z':
      color1 = xMaterial;
      color2 = yMaterial;
      break;
  }

  // create pin
  var pin = new THREE.Mesh( pinGeometry, [ color1, color2, color1, color2 ] );
  pin.name = 'pin';

  // create edges
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

function createDisplacementSupport( axis, shaftLength, shaftRadius, headHeight, headRadius ) {
  // create a displacement support

  var displacementSupport = new THREE.Group();

  var arrow, restrain;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  switch ( axis ) {
    case 'x': 
      arrow = createArrow( xMaterial, shaftLength, shaftRadius, headHeight, headRadius );
      restrain = new THREE.Mesh( restrainGeometry, xMaterial );
      break;
    case 'y':
      arrow = createArrow( yMaterial, shaftLength, shaftRadius, headHeight, headRadius );
      restrain = new THREE.Mesh( restrainGeometry, yMaterial );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      arrow = createArrow( zMaterial, shaftLength, shaftRadius, headHeight, headRadius );
      restrain = new THREE.Mesh( restrainGeometry, zMaterial );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }

  restrain.name = 'restrain';
  restrain.scale.set( config[ 'support.analytical.restrain.thickness' ], config[ 'support.analytical.restrain.radius' ], config[ 'support.analytical.restrain.radius' ] );
  restrain.position.set( shaftLength / 2, 0, 0 );
  restrain.rotateZ( Math.PI / 4 );
  arrow.add( restrain );
  
  arrow.name = 'arrow';
  arrow.position.set( -( shaftLength + headHeight ), 0, 0 );
  displacementSupport.add( arrow );
  
  displacementSupport.name = axis;
  displacementSupport.quaternion.copy( quaternion );

  return displacementSupport;
}

function createRotationSupport( axis ) {
  // create a rotational suppoort
  
  var rotationSupport = new THREE.Group();

  var head, curveShaft, restrain;

  var vector = new THREE.Vector3( 1, 1, 1 ).normalize();
  var quaternion = new THREE.Quaternion();

  var curveShaftGeometry = new THREE.TorusGeometry( config[ 'support.analytical.curveShaft.radius' ], config[ 'support.analytical.shaft.tube' ], 8, 6, 3 * Math.PI / 2 );
  curveShaftGeometry.rotateY( Math.PI / 2 );
  
  switch ( axis ) {
    case'x':
      head = new THREE.Mesh( headGeometry, xMaterial );
      curveShaft = new THREE.Mesh( curveShaftGeometry, xMaterial );
      restrain = new THREE.Mesh( restrainGeometry, xMaterial );
      break;
    case 'y':
      head = new THREE.Mesh( headGeometry, yMaterial );
      curveShaft = new THREE.Mesh( curveShaftGeometry, yMaterial );
      restrain = new THREE.Mesh( restrainGeometry, yMaterial );
      quaternion.setFromAxisAngle( vector, 2 * Math.PI / 3 );
      break;
    case 'z':
      head = new THREE.Mesh( headGeometry, zMaterial );
      curveShaft = new THREE.Mesh( curveShaftGeometry, zMaterial );
      restrain = new THREE.Mesh( restrainGeometry, zMaterial );
      quaternion.setFromAxisAngle( vector, 4 * Math.PI / 3 );
      break;
  }
  
  restrain.name = 'restrain';
  restrain.scale.set( config[ 'support.analytical.restrain.thickness' ], config[ 'support.analytical.restrain.radius' ], config[ 'support.analytical.restrain.radius' ] );
  restrain.position.set( 0, config[ 'support.analytical.curveShaft.radius' ], 0 );
  restrain.rotateX( -Math.PI / 2 );
  restrain.rotateZ( -Math.PI / 4 );
  curveShaft.add( restrain );
  
  head.name = 'head';
  head.scale.set( config[ 'support.analytical.head.height' ], config[ 'support.analytical.head.radius' ], config[ 'support.analytical.head.radius' ] );
  head.position.set( 0, -config[ 'support.analytical.curveShaft.radius' ], 0 );
  head.rotateY( Math.PI / 2 );
  curveShaft.add( head );
  
  curveShaft.name = 'curveShaft';
  curveShaft.position.set( -( config[ 'support.analytical.head.height' ] + config[ 'support.analytical.straightShaft.length' ] / 2 ), 0, 0 );
  rotationSupport.add( curveShaft );

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
        model.getObjectByName( 'joints' ) .getObjectByName( joint ).add( support );

        resolve();
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

function setFoundationSize( size ) { Object.entries( structure.supports ).filter( ( [ , support ] ) => support[ 'u' + config[ 'model.axisUpwards' ] ] == true ).forEach( ( [ name, ] ) => { model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).scale.set( size, size, config[ 'support.foundation.depth' ] ) } ) };

function setFoundationDepth( depth ) { Object.entries( structure.supports ).filter( ( [ , support ] ) => support[ 'u' + config[ 'model.axisUpwards' ] ] == true ).forEach( ( [ name, ] ) => { model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'foundation' ).scale.setZ( depth ) } ) };

function setPedestalSize( size ) {
  // set pedestal size

  var support, pedestal, foundation, quaternion = model.quaternion.clone().inverse();

  Object.entries( structure.supports ).filter( ( [ , support ] ) => support.ux == support.uy == support.uz == support.rx == support.ry == support.rz == true ).forEach( ( [ name, ] ) => {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pedestal = support.getObjectByName( 'pedestal' );
    foundation = support.getObjectByName( 'foundation' );

    pedestal.scale.setScalar( size );
    pedestal.position.copy( new THREE.Vector3( 0, 0, -size / 2 ).applyQuaternion( quaternion ) );
    foundation.position.copy( new THREE.Vector3( 0, 0, -size ).applyQuaternion( quaternion ) );
  });
}

function setPinHeight( height ) {
  // set pin height

  var support, pin, foundation, quaternion = model.quaternion.clone().inverse();

  Object.entries( structure.supports ).filter( ( [ , support ] ) => ( support.ux == support.uy == support.uz == true ) && ( support.rx == support.ry == support.rz == false ) ).forEach( ( [ name, ] ) => { 
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pin = support.getObjectByName( 'pin' );
    foundation = support.getObjectByName( 'foundation' );
  
    pin.scale.set( config[ 'support.pin.radius' ], config[ 'support.pin.radius' ], height );
    foundation.position.copy( new THREE.Vector3( 0, 0, -height ).applyQuaternion( quaternion ) );
  });
}

function setPinRadius( radius ) {
  // set pin radius

  var support, pin, foundation;

  Object.entries( structure.supports ).filter( ( [ , support ] ) => ( support.ux == support.uy == support.uz == true ) && ( support.rx == support.ry == support.rz == false ) ).forEach( ( [ name, ] ) => {
    support = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' );
    pin = support.getObjectByName( 'pin' );
    foundation = support.getObjectByName( 'foundation' );
    
    pin.scale.set( radius, radius, config[ 'support.pin.height' ] );
  });
}

function setAnalyticalHeadHeightSupport( height ) {
  // set analytical support's head height

  var position = new THREE.Vector3( -( config[ 'support.analytical.straightShaft.length' ] + height ), 0, 0 );

  Object.keys( structure.supports ).forEach( name => { 
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => {
      displacement.getObjectByName( 'arrow' ).position.copy( position );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.setX( height );
    });
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'head' ).scale.setX( height );
      rotation.getObjectByName( 'curveShaft' ).position.set( -( height + config[ 'support.analytical.straightShaft.length' ] / 2 ), 0, 0 );
    });
  });
}

function setAnalyticalHeadRadiusSupport( radius ) {
  // set analytical support's head radius

  var analytical;

  Object.keys( structure.supports ).forEach( name => { 
    analytical = model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' );
    analytical.getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );
    analytical.getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'head' ).scale.set( config[ 'support.analytical.head.height'], radius, radius ) );
  });
}

function setAnalyticalShaftLengthSupport( length ) {
  // set analytical displacement length shaft

  Object.keys( structure.supports ).forEach( name => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => { 
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'shaft' ).scale.setX( length );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'head' ).position.setX( length );
      displacement.getObjectByName( 'arrow' ).getObjectByName( 'restrain' ).position.set( length / 2, 0, 0 );
      displacement.getObjectByName( 'arrow' ).position.setX( -( length + config[ 'support.analytical.head.height' ] ) );
    });
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'curveShaft' ).position.set( -( config[ 'support.analytical.head.height' ] + length / 2 ), 0, 0 ) );
  });
}

function setAnalyticalShaftRadiusSupport( radius ) {
  // set analytical support's curve shaft radius

  var curveShaftGeometry = new THREE.TorusGeometry( radius, config[ 'support.analytical.shaft.tube'], 8, 6, 3 * Math.PI / 2 );
  curveShaftGeometry.rotateY( Math.PI / 2 );

  Object.keys( structure.supports ).forEach( name => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'curveShaft' ).geometry.dispose();
      rotation.getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
      rotation.getObjectByName( 'head' ).position.set( 0, -radius, 0 );
      rotation.getObjectByName( 'restrain' ).position.set( 0, radius, 0 );
    });
  });
}

function setAnalyticalShaftTubeSupport( tube ) {
  // set analytical support's shaft tube

  var curveShaftGeometry = new THREE.TorusGeometry( config[ 'support.analytical.curveShaft.radius' ], tube, 8, 6, 3 * Math.PI / 2 );
  curveShaftGeometry.rotateY( Math.PI / 2 );

  Object.keys( structure.supports ).forEach( name => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'shaft' ).scale.set( config[ 'support.analytical.straightShaft.length'], tube, tube ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => {
      rotation.getObjectByName( 'curveShaft' ).geometry.dispose();
      rotation.getObjectByName( 'curveShaft' ).geometry = curveShaftGeometry;
    });
  });
}

function setAnalyticalRestrainRadiusSupport( radius ) {
  // set analytical support's restrain radius
  
  Object.keys( structure.supports ).forEach( name => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restrain' ).scale.set( config[ 'support.analytical.restrain.thickness' ], radius, radius ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'curveShaft' ).getObjectByName( 'restrain' ).scale.set( config[ 'support.analytical.restrain.thickness' ], radius, radius ) );
  });
}

function setAnalyticalRestrainThicknessSupport( thickness ) {
  // set analytical support's restrain thickness

  Object.keys( structure.supports ).forEach( name => {
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'displacements' ).children.forEach( displacement => displacement.getObjectByName( 'arrow' ).getObjectByName( 'restrain' ).scale.setX( thickness ) );
    model.getObjectByName( 'joints' ).getObjectByName( name ).getObjectByName( 'support' ).getObjectByName( 'analytical' ).getObjectByName( 'rotations' ).children.forEach( rotation => rotation.getObjectByName( 'curveShaft' ).getObjectByName( 'restrain' ).scale.setX( thickness ) );
  });
}

window.addEventListener( "resize", onResize, false );