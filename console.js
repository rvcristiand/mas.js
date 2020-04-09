var command_line = document.getElementById("command-line");
var message = document.getElementById("message");

function run_command(event) {
  if (event.key == 'Enter') {
    var command = command_line.value;

    message.classList.add("remove-message")
    message.classList.remove("message-successful", "message-error");

    if (check_command(command)) {
      message.classList.add("message-successful");
      message.innerHTML = command;
    } else {
      message.classList.add("message-error");
      message.innerHTML = "SyntaxError: invalid syntax";
    }

    command_line.value = "";

    message.style.animation = 'none';
    void(message.offsetHeight); /* trigger reflow */
    message.style.animation = null; 
  }
}

function check_command(command) {
    var pattern = /^[_a-z]\w*\([\w,\s]*\)$/i;
    return pattern.test(command);
}

function show_message() {
  message.style.opacity = 1;
  
  message.style.animation = 'none';
}

function hide_message() {
  message.classList.add("remove-message");
  message.offsetHeight; /* trigger reflow */
  message.style.animation = null;
}

function end_animation() {
  message.classList.remove("remove-message");
  message.style.opacity = 0;
}

function remove_focus() {
  command_line.blur();
}

// function give_focus() {
//   console.log("holi");
// }


