import * as console from "./modules/console.js";
import * as FEM from "./modules/FEM.js";

var command_line = document.getElementById("command-line");
var output = document.getElementById("output");
var log = document.getElementById("log");

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
document.addEventListener("keydown", console.give_focus);
document.addEventListener("mousedown", console.remove_focus);

command_line.addEventListener("change", console.run_command);

output.addEventListener("mouseover", console.show_message);
output.addEventListener("mouseout", console.hide_message);

log.addEventListener("animationend", console.end_animation);
