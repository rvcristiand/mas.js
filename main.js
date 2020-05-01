import * as terminal from "./modules/terminal.js";
import * as FEM from "./modules/FEM.js";


// scene
var canvas = document.getElementById( "canvas" );

// console
var output = document.getElementById( "output" );
var log = document.getElementById( "log" );
var command_line = document.getElementById( "command-line" );
var autocomplete = document.getElementById( "autocomplete" );


// set the functions

// addFrame
terminal.add_function('addFrame', {
  func: FEM.addFrame,
  successful: function ( name ) {
    return "frame " + name + " was added";
  }
});

// add section
terminal.add_function( 'addRectangleSection', {
  func: FEM.addRectangleSection,
  successful: function( name, width, height ) {
    return "rectangle section " + name + " was added";
  }
});

// add material
terminal.add_function( 'addMaterial', {
  func: FEM.addMaterial, 
  successful: function( name, e, g) {
    return "material " + name + " was added";
  }
});

// addJoint
terminal.add_function('addJoint', {
  func: FEM.addJoint,
  successful: function ( name, x, y, z ) { 
    return "joint " + name + " was added";
  }
});

// showJointsLabel
terminal.add_function('showJointsLabel', {
  func: FEM.showJointsLabel,
  successful: function () {
    return "joints' label was showed";
  }
});

// hideJointsLabel
terminal.add_function('hideJointsLabel', {
  func: FEM.hideJointsLabel,
  successful: function () {
    return "joints' label was hidden";
  }
});

// showFramesLabel
terminal.add_function('showFramesLabel', {
  func: FEM.showFramesLabel,
  successful: function () {
    return "frames' label was showed";
  }
});

// hideFramesLabel
terminal.add_function('hideFramesLabel', {
  func: FEM.hideFramesLabel,
  successful: function () {
    return "frames' label was hidden";
  }
});

// setUpwardsAxis
terminal.add_function("setUpwardsAxis", {
  func: FEM.setUpwardsAxis,
  successful: function ( axisUpwards ) {
    return "upwards axis set to " + axisUpwards;
  }
});

// loadModel
terminal.add_function("loadModel", {
  func: FEM.loadModel,
  successful: function (model) {
    return "the " + "'" + model + "'" + " has been loaded";
  }
});


// set events
canvas.addEventListener("mousedown", terminal.remove_focus);

document.addEventListener("keypress", terminal.give_focus);
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