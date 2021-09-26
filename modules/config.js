export default
{
    // background
    'background.topColor': '#555555',
    'background.bottomColor': '#000000',
    
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
    'controls.panSpeed': 1,
    'controls.screenPanning': true,
    
    'controls.damping.enable': false,
    'controls.damping.factor': 0.05,
    
    // lights
    'lights.direction.color': 0xffffff,
    'lights.direction.intensity': 1,
    
    // axes
    'axes.x': '#ff0000',
    'axes.y': '#00ff00',
    'axes.z': '#0000ff',
    
    // ground
    'ground.visible': true,
    'ground.size': 20,
    
    'ground.plane.visible': true,
    'ground.plane.color': '#1F3119',
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