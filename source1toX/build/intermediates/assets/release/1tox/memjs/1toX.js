var act;
var level;
var timeout;
var hblocks = [];
var nblocks;
var hdots = [];
var counternum;
var hcounter;
var ptop;
var pleft;
var tout = [];
var timeoutID;
var clicked;
var stat_num;
var num_arr = [];
var corr = [];
var score;
var actuator;

function main() {
  level = 4;
  score = 0;
  startnum = 3;
  nblocks = 16;
  hblocks = document.getElementsByClassName('grid-cell');
  actuator = new HTMLActuator;
  for (i=0; i<nblocks; i++) {
    block = hblocks[i];
    block.addEventListener("click", function() { click(this.id); });
    block.style.background = '#33' + (i.toString() + "0").slice(-2) + "33";
    block.innerHTML = "";
  }
  //make_number(2);
  tout[4] = [ 500 ];
  tout[5] = [ 700 ];
  tout[6] = [ 1000 ];
  tout[7] = [ 1300 ];
  tout[8] = [ 1800 ];
  tout[9] = [ 1800 ];
  tout[10] = [ 2000 ];
  tout[11] = [ 2200 ];
  tout[12] = [ 2500 ];
}
function make_number(n) {
  hblocks[5].style.backgroundColor = "#bbada0";
  hblocks[5].style.backgroundColor = "#bbada0";
  hblocks[6].style.backgroundColor = "#bbada0";
  hblocks[9].style.backgroundColor = "#bbada0";
  hblocks[10].style.backgroundColor = "#bbada0";
}
function startme() {
  document.getElementById('but').style.display = 'none';
  act = 'counter';
  hcontainer.style.border = '';
  for (let i=1; i<=level; i++) {
    hblocks[i].style.display = "none";
    hblocks[i].innerHTML = "";
    hdots[i].style.backgroundColor = "";
  }
  document.getElementById('splevel').innerHTML = level;
  clicked = 0;
  for (let i=1; i<=level; i++) {
    hdots[i].style.display = "inline-block";
  }
  if ( document.selection ) {
    document.selection.empty();
  }
  else if ( window.getSelection ) {
    window.getSelection().removeAllRanges();
  }
}
function trigger() {
  if (act == 'won') {
    show_won();
    set_score();
    timeout = 1000;
    level += 1;
    act = 'restart';
  }
  else if (act == 'counter') {
    show_counter();
    timeout = 1000;
  }
  else if (act == 'blocks') {
    show_blocks();
    timeout = 1200;
    act = 'numbers';
  }
  else if (act == 'numbers') {
    get_numbers(level);
    show_numbers();
    timeout = tout[level];
    act = 'hide';
  }
  else if (act == 'hide') {
    hide_numbers();
    act = 'waitclick';
    timeout = 2000;
  }
  else if (act == 'wrong') {
    hcontainer.style.border = '8px #FF3020 solid';
    show_numbers();
    timeout = 2000;
    act = 'restart';
  }
  else if (act == 'restart') {
    startme();
  }
  timeoutID = window.setTimeout(trigger, timeout);
  if (act == 'waitclick') {
    window.clearTimeout(timeoutID);
  }
}
function show_won() {
  hcounter.style.display = '';
  hcounter.style.color = 'green';
  hcounter.innerHTML = '&#10004;';
  hide_blocks();
}
function set_score() {
  score += level;
  document.getElementById('spscore').innerHTML = score;
}
function show_counter() {
  hcounter.style.display = '';
  hcounter.style.color = 'red';
  hcounter.innerHTML = startnum;
  if (startnum == 0) {
    hcounter.style.display = 'none';
    act = 'blocks';
    startnum = 3;
  }
  startnum -= 1;
}
function show_blocks() {
  for (let i=1; i<=level; i++) {
    hblocks[i].style.display = 'block';
    hblocks[i].style.top = ptop[level][i-1];
    hblocks[i].style.left = pleft[level][i-1];
  }
}
function show_numbers() {
  for (let i=1; i<=level; i++) {
    hblocks[i].innerHTML = num_arr[i-1];
  }
}
function hide_numbers() {
  for (let i=1; i<=level; i++) {
    hblocks[i].innerHTML = '';
  }
}
function hide_blocks() {
  for (let i=1; i<=level; i++) {
    hblocks[i].style.display = 'none';
  }
}
function get_numbers(n) {
  a = [];
  for (let i=1; i<=n; i++) a.push(i);
  num_arr = shuffle(a)
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}
function click(id) {
  if (act != 'waitclick') return
  document.getElementById(id).innerHTML = num_arr[id-1];
  if (num_arr[id-1] - clicked == 1) {
    status_dot(num_arr[id-1],1);
    clicked = num_arr[id-1];
    if (clicked == level) {
      act = 'won';
      trigger();
    }
  }
  else {
    status_dot(num_arr[id-1],0);
    act = 'wrong';
    trigger();
  }
}
function status_dot(id,b) {
  col = b ? 'green' : 'red';
  document.getElementById('dot'+id).style.backgroundColor = col;
  hdots[id].style.backgroundColor = col;
}
function nightswitch() {
    if (document.getElementsByTagName("html")[0].style.backgroundColor === "rgb(45, 48, 44)") {
                document.getElementsByTagName("html")[0].style.backgroundColor = "#faf8ef";
                document.getElementsByTagName("body")[0].style.backgroundColor = "#faf8ef";
        return false;
    } else {
                document.getElementsByTagName("html")[0].style.backgroundColor = "#2D302C";
                document.getElementsByTagName("body")[0].style.backgroundColor = "#2D302C";
                return false;
    }
}
