import * as terminal from "./modules/terminal.js";
import * as mas from "./modules/mas.js";


// scene
var canvas = document.getElementById( "canvas" );

// console
var output = document.getElementById( "output" );
var log = document.getElementById( "log" );
var command_line = document.getElementById( "command-line" );
var autocomplete = document.getElementById( "autocomplete" );


// set the functions

// addLoadAtJoint
terminal.add_function( 'addLoadAtJoint', {
  func: mas.addLoadAtJoint
});

// addLoadPattern
terminal.add_function('addLoadPattern', {
  func: mas.addLoadPattern,
  successful: function ( name ) {
    return "load pattern '" + name + "' was added";
  }
});

// removeLoadPattern
terminal.add_function('removeLoadPattern', {
  func: mas.removeLoadPattern,
  succesful: function ( name ) {
    return "load pattern '" + name + "' was removed";
  }
});

// addSupport
terminal.add_function('addSupport', {
  func: mas.addSupport,
  successful: function ( name ) {
    return "support " + name + " was added";
  }
});

// removeSupport
terminal.add_function( 'removeSupport', {
  func: mas.removeSupport,
  successful: name => {
    return "support '" + name + "' was removed";
  }
});

// addFrame
terminal.add_function('addFrame', {
  func: mas.addFrame,
  successful: function ( name ) {
    return "frame " + name + " was added";
  }
});

// removeFrame
terminal.add_function( 'removeFrame', {
  func: mas.removeFrame,
  successful: name => {
    return "frame '" + name + "' was removed";
  }
});

// add section
terminal.add_function( 'addSection', { func: mas.addSection, successful: name => "section '" + name + "' was added" } );

// add rectangular section
terminal.add_function( 'addRectangularSection', {
  func: mas.addRectangularSection,
  successful: function( name, width, height ) {
    return "rectangle section " + name + " was added";
  }
});

// remove section
terminal.add_function( 'removeSection', { func: mas.removeSection, successful: name => "section '" + name + "' was removed" } );

// add material
terminal.add_function( 'addMaterial', {
  func: mas.addMaterial, 
  successful: function( name, e, g) {
    return "material '" + name + "' was added";
  }
});

// removeMaterial
terminal.add_function( 'removeMaterial', { func: mas.removeMaterial, successful: name => "material '" + name + "' was removed" } );

// addJoint
terminal.add_function('addJoint', {
  func: mas.addJoint,
  successful: function ( name, x, y, z ) { 
    return "joint " + name + " was added";
  }
});

// removeJoint
terminal.add_function( 'removeJoint', { func: mas.removeJoint, successful: name => "joint " + name + " was removed" } );

// setFrameView
terminal.add_function( 'setFrameView', { func: mas.setFrameView, successful: viewType => { return viewType + " setted" } } );

// showJointsLabel
terminal.add_function('showJointsLabel', {
  func: mas.showJointsLabel,
  successful: function () {
    return "joints' label was showed";
  }
});

// hideJointsLabel
terminal.add_function('hideJointsLabel', {
  func: mas.hideJointsLabel,
  successful: function () {
    return "joints' label was hidden";
  }
});

// showFramesLabel
terminal.add_function('showFramesLabel', {
  func: mas.showFramesLabel,
  successful: function () {
    return "frames' label was showed";
  }
});

// hideFramesLabel
terminal.add_function('hideFramesLabel', {
  func: mas.hideFramesLabel,
  successful: function () {
    return "frames' label was hidden";
  }
});

// setUpwardsAxis
terminal.add_function("setUpwardsAxis", {
  func: mas.setUpwardsAxis,
  successful: function ( axisUpwards ) {
    return "upwards axis set to " + axisUpwards;
  }
});

// setView
terminal.add_function("setView", {
  func: mas.setView,
  succesfull: function ( direction ) {
    return "standard view set to " + direction;
  }
});

// loadModel
terminal.add_function("open", {
  func: mas.open,
  successful: function (file) {
    return "the " + "'" + file + "'" + " has been loaded";
  }
});

// getStructure
terminal.add_function( "getStructure", { func: mas.getStructure, successful: "" } );

// get load patterns
terminal.add_function( "getLoadPatterns", { func: mas.getLoadPatterns, successful: "" } );

// default command
command_line.value = "open(" + '"' + "space_frame.json" + '"' + ")";

// focus terminal
terminal.give_focus();

// set events
canvas.addEventListener("mousedown", terminal.remove_focus);

// document.addEventListener("keypress", terminal.give_focus);
output.addEventListener("mouseover", terminal.show_message);
output.addEventListener("mouseout", terminal.hide_message);

log.addEventListener("animationend", terminal.stop_animation);

command_line.addEventListener("keydown", terminal.run_command);  // enter and option_selected === -1
command_line.addEventListener("keydown", terminal.select_option);  // enter and option_selected !=== -1
command_line.addEventListener("keydown", terminal.esc);  // esc

command_line.addEventListener("input", terminal.show_autocomplete); // show autocomplete
command_line.addEventListener("keydown", terminal.choose_option);  // tab

autocomplete.addEventListener("mouseover", terminal.remove_selection);

// disable tab
document.onkeydown = function (event) {
  if ( event.key == 'Tab' ) {
    return false;
  }
}
