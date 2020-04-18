import * as console from "./modules/console.js";
import * as FEM from "./modules/FEM.js";

var canvas = document.getElementById("canvas");

var output = document.getElementById("output");
var log = document.getElementById("log");
var command_line = document.getElementById("command-line");
var autocomplete = document.getElementById("autocomplete");

// set the functions
console.add_function("loadModel", {
  func: FEM.loadModel,
  successful: function (model) {
    return "the " + "'" + model + "'" + " has been loaded";
  },
  error: function (model) {
    return "the " + "'" + model + "'" + " has not been loaded";
  },
});

// set events
canvas.addEventListener("mousedown", console.remove_focus);

document.addEventListener("keypress", console.give_focus);
output.addEventListener("mouseover", console.show_message);
output.addEventListener("mouseout", console.hide_message);

log.addEventListener("animationend", console.stop_animation);

command_line.addEventListener("keydown", console.run_command);  // enter and option_selected === -1
command_line.addEventListener("keydown", console.select_option);  // enter and option_selected !=== -1
command_line.addEventListener("keydown", console.esc);  // esc

command_line.addEventListener("input", console.show_autocomplete); // show autocomplete
command_line.addEventListener("keydown", console.choose_option);  // tab

autocomplete.addEventListener("mouseover", console.remove_selection);

// disable tab
document.onkeydown = function (event) {
  if ( event.key == 'Tab' ) {
    return false;
  }
}