// controls
var stats, gui;
var loadPatternController;

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