function run(command) {
  if (event.keyCode == 13) {
    alert(check_command(command.value));
  }
}

function check_command(command) {
    var pattern = /^[_a-z]\w*\([\w,\s]*\)$/i;
    return pattern.test(command);
  }

function remove_focus() {
  var command_line = document.getElementById("command-line");

  command_line.blur();
}
