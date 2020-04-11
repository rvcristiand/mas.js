var functions = {};

var command_line = document.getElementById("command-line");
var message = document.getElementById("log");

export function run_command(event) {
  // run the command

  // command
  var command = event.target.value;

  // add class
  message.classList.add("remove-message")
  // remove classes
  message.classList.remove("message-successful", "message-error");

  // check if command is valid
  if (check_command(command)) {
    // function name
    var f = get_name_function(command);
    
    // check if function name is a valid function
    if (f in functions) {
      // get parameters
      var params = get_param_function(command);

      functions[f]['func'].apply(null, params)
        .then(function () {
          // command is valid
          message.classList.add("message-successful");
          message.textContent = functions[f]['successful'].apply(null, params);
        })
        .catch(function (e) {
          // command is no valid 
          message.classList.add("message-error");
          message.textContent = e.name + ": " + e.message; // functions[f]['error'].apply(null, params);
        });
    } else {
      // command doesnt exist
      message.classList.add("message-error");

      message.textContent = "'" + f + "'" + " is not recognized as a command";
    }
  } else {
    // sintaxis error
    message.classList.add("message-error");
    message.textContent = "SyntaxError: invalid syntax";
  }

  // clear the command-line
  command_line.value = "";

  // resert animation
  message.style.animation = 'none';
  void(message.offsetHeight); /* trigger reflow */
  message.style.animation = null;
}

function check_command(command) {
    var pattern = /^[_a-z]\w*\([\w\s.,'"]*\)$/i;
    return pattern.test(command);
}

function get_name_function(command) {
  var pattern = /(^[_a-z]\w*)\([\w\s.,'"]*\)$/i;

  return command.match(pattern)[1];
}

function get_param_function(command) {
  var pattern = /^[_a-z]\w*\(([\w\s.,'"]*)\)$/i;
  var params = command.match(pattern)[1].split(',');
  
  for ( var i = 0; i < params.length; i++ ) {
    params[i] = params[i].match(/^["']?([\w\s.,]*)["']?$/i)[1];

    if ( params[i] == "" ) {
      params[i] = undefined;
    }
  }

  return params;
}

export function add_function(name, obj) {
  functions[name] = obj;
}

export function show_message() {
  message.style.opacity = 1;
  
  message.style.animation = 'none';
}

export function hide_message() {
  message.classList.add("remove-message");
  message.offsetHeight; /* trigger reflow */
  message.style.animation = null;
}

export function end_animation() {
  message.classList.remove("remove-message");
  message.style.opacity = 0;
}

export function remove_focus() {
  command_line.blur();
}

export function give_focus() {
  command_line.focus();
}
