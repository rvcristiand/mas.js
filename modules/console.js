var functions = {};

var option_selected = -1;

var command_line = document.getElementById("command-line");
var log = document.getElementById("log");
var autocomplete = document.getElementById("autocomplete");


export function run_command(event) {
  // run command

  if ( (event.key == 'Enter') && (option_selected === -1) ) {
    var command = event.target.value;

    log.classList.add("remove-message")
    log.classList.remove("message-successful", "message-error");

    log.style.visibility = "visible";

    // check if command is valid
    if ( check_command(command) ) {
      // get function name
      var f = get_function_name(command);
      
      // check if function name is a valid function
      if (f in functions) {
        // get parameters
        var params = get_param_function(command);

        // run function
        functions[f]['func'].apply(null, params)
          .then(function () {
            // command is valid
            log.classList.add("message-successful");
            log.textContent = functions[f]['successful'].apply(null, params);
          })
          .catch(function (e) {
            // command is no valid 
            log.classList.add("message-error");
            log.textContent = e.name + ": " + e.message; // functions[f]['error'].apply(null, params);
          });
      } else {
        // command doesnt exist
        log.classList.add("message-error");

        log.textContent = "'" + f + "'" + " is not recognized as a function";
      }
    } else {
      // sintaxis error
      log.classList.add("message-error");

      log.textContent = "SyntaxError: invalid syntax";
    }

    // clear the command-line
    command_line.value = "";

    // resert animation
    log.style.animation = 'none';
    void(log.offsetHeight); /* trigger reflow */
    log.style.animation = null;
  }
}

export function show_autocomplete(event) {
  // show autocomplete
  
  // remove previous autocomplete
  while ( autocomplete.firstChild ) {
    autocomplete.removeChild(autocomplete.lastChild);
  }

  var command = event.target.value;
  // if no command exit
  if ( command == "") {
    return;
  }

  option_selected = -1;

  var functions_name = get_functions_name();
  // show the options
  for ( const function_name of functions_name) {
    if ( function_name.toLowerCase().includes(command.toLowerCase()) ) {
      var p = document.createElement("span");

      p.addEventListener('click', option_clicked);
      p.innerHTML = function_name;
      p.classList.add("option");

      autocomplete.appendChild(p);
    }
  }
}

export function choose_option(event) {
  // choose option

  if ( event.key == "Tab" ) {
    command_line.focus();
    var options = autocomplete.children;
    var num_options = options.length;    

    // remove any previous option selected
    for ( var i = 0; i < num_options; i++ ) {
      options[i].classList.remove("option-selected");
    }

    // select option
    if ( !event.shiftKey ) {
      if ( option_selected + 1 < num_options ) {
        option_selected += 1;
  
        options[option_selected].classList.add("option-selected");
      } else {
        option_selected = -1;
      }
    } else {
      if ( 0 < option_selected ) {
        option_selected -= 1;
  
        options[option_selected].classList.add("option-selected");
      } else {
        if ( option_selected < 0 ) {
          option_selected = num_options - 1;
          options[option_selected].classList.add("option-selected");
        } else {
          option_selected = -1;
        }
      }      
    }
  }
}

export function select_option(event) {
  // select option
  if ( (event.key == "Enter") && (option_selected != -1) ) {
    var options = autocomplete.children;
    var option = options[option_selected].innerHTML;
    
    apply_option(option);
  }
}

function option_clicked(event) {
  apply_option(event.target.textContent);
}

function apply_option(option) {
  // apply optiont selected
  command_line.value = option + '()';
  
  option_selected = -1;

  remove_options();
  set_carret_position();
}

function check_command(command) {
  // check if a command has the function's structure
    var pattern = /^[_a-z]\w*\([\w\s.,'"]*\)$/i;

    return pattern.test(command);
}

function get_function_name(command) {
  // get the function's name 
  var pattern = /(^[_a-z]\w*)\([\w\s.,'"]*\)$/i;

  return command.match(pattern)[1];
}

function get_param_function(command) {
  // get parameters function
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
  // add funciton

  functions[name] = obj;
}

function get_functions_name() {
  // get an array with all function's name registred through add_function
  var functions_name = [];
  const keys = Object.keys(functions);

  for ( const key of keys) {
    functions_name.push(key);
  }

  return functions_name;
}

function set_carret_position() {
  // set carret position between parethesis
  var position = command_line.value.length - 1;

  if ( command_line.createTextRange ) {
    var range = command_line.createTextRange();
    range.move('character', position);
  } else {
    if ( command_line.selectionStart ) {
      command_line.focus();
      command_line.setSelectionRange(position, position);
    } else {
      command_line.focus();
    }
  }
}

function remove_options() {
  // remove options

  while (autocomplete.firstChild) {
    autocomplete.removeChild(autocomplete.lastChild);
  }

  option_selected = -1;
}

export function remove_selection() {
  // remove selection

  var options = autocomplete.children;
  var num_options = options.length;

  for ( var i = 0; i < num_options; i++ ) {
    options[i].classList.remove("option-selected");
  }

  option_selected = -1;
}

export function show_message() {
  // show the message
  log.classList.remove("remove-message");
  log.style.visibility = "visible";
}

export function hide_message() {
  // hide the message
  log.classList.add("remove-message");
}

export function stop_animation() {
  // stop animation
  log.classList.remove("remove-message");
  log.style.visibility = "hidden";
}

export function esc(event) {
  // remove focus to input when esc is pressed
  if (event.key == 'Escape') {
    remove_focus();
  }
}

export function give_focus() {
  // give focus to input
  command_line.focus();
}

export function remove_focus() {
  // remove focus to input
  command_line.blur();
}