// mastermind.js
// by Saumil Shah
//
// A quick and simple algorithm to solve Mastermind

var max_colours = 6;
var max_positions = 4;

var heading = null;
var output = null;
var list = null;
var setupform = null;
var setvalues = null;
var guessform = null;
var guessinput = null;
var makeguessbutton = null;
var secretform = null;
var secretinput = null;
var positionsinput = null;
var coloursinput = null;
var setupheading = null;
var hidethis = null;
var showthis1 = null;
var showthis2 = null;
var showthis3 = null;
var solutionsheading = null;
var solutions_count = null;
var master_combination = [];
var guess_combination = [];
var total_guesses = 0;
var solution_set = [];

function init() {
   heading = document.getElementById("heading");
   output = document.getElementById("output");
   list = document.getElementById("list");
   setupform = document.getElementById("setupform");
   setvalues = document.getElementById("setvalues");
   guessform = document.getElementById("guessform");
   guessinput = document.getElementById("guess");
   makeguessbutton = document.getElementById("makeguessbutton");
   solutionsheading = document.getElementById("solutionsheading");
   solutions_count = document.getElementById("solutions_count");
   secretform = document.getElementById("secretform");
   secretinput = document.getElementById("secret");
   positionsinput = document.getElementById("positions");
   coloursinput = document.getElementById("colours");
   setupheading = document.getElementById("setupheading");
   hidethis = document.getElementById("hidethis");
   showthis1 = document.getElementById("showthis1");
   showthis2 = document.getElementById("showthis2");
   showthis3 = document.getElementById("showthis3");

   positionsinput.value = max_positions;
   coloursinput.value = max_colours;

   setupform.onsubmit = setup_submitted;
   guessform.onsubmit = guess_submitted;
   secretform.onsubmit = secret_submitted;
   guessinput.value = "";
   secretinput.value = "";
}

function setup_submitted() {
   var valid = true;
   var positions = parseInt(positionsinput.value);
   var colours = parseInt(coloursinput.value);

   if(isNaN(positions) || positions <= 0) {
      positionsinput.value = max_positions;
      valid = false;
   }

   if(isNaN(colours) || colours <= 0) {
      coloursinput.value = max_colours;
      valid = false;
   }

   if(!valid) {
      return(false);
   }

   update_setup_heading(0);
   setvalues.value = "PLEASE WAIT";
   setvalues.disabled = true;

   max_positions = positions;
   max_colours = colours;
   guessinput.maxLength = max_positions;
   guessinput.size = max_positions;
   secretinput.maxLength = max_positions;
   secretinput.size = max_positions;

   fill_solution_set(0);
   play_game();
   return(false);
}

function play_game() {
   hidethis.style.display = "none";
   showthis1.style.display = "inline-block";

   heading.innerHTML = "FASTERMIND (" + max_positions + ","
                                      + max_colours + ")";

   //generate_random_combination(master_combination);
   print_solution_set();
}

function generate_combination(c) {
   // erase combination array
   c.splice(0, c.length);

   for(var i = 0; i < max_positions; i++) {
      c[i] = choose_random_colour(max_colours);
   }
}

// recursive function to fill up the solution set
function fill_solution_set(p) {
   for(var i = 0; i < max_colours; i++) {
      guess_combination[p] = i + 1;
      if(p == max_positions - 1) {

         solution_set.push({
            combination: Array.from(guess_combination),
            rating: {white: 0, black:0},
            included: true,
            played: false
         });
      }
      else {
         fill_solution_set(p + 1);
      }
   }
}

// set the master combination and hide the value
function secret_submitted() {
   var valid = parse_combination(secretinput.value, master_combination);

   if(valid) {
      showthis1.style.display = "none";
      showthis2.style.display = "inline-block";
      showthis3.style.display = "inline-block";
   }
   else {
      secretinput.value = "";
   }
   return(false);
}

// process a submitted guess
// if the value is left blank, the computer will
// choose a guess randomly from the remaining solutions
function guess_submitted() {

   // if the player hasn't submitted a value, let
   // the computer make the next guess
   if(guessinput.value == "") {
      guessinput.value = make_guess();
   }

   var valid = parse_combination(guessinput.value, guess_combination);

   if(valid) {
      // mark the guessed combination as played
      for(var i = 0; i < solution_set.length; i++) {
         if(guessinput.value == solution_set[i].combination.join('')) {
            solution_set[i].played = true;
            break;
         }
      }
      var r = compare_combinations(guess_combination, master_combination);
      add_guess(guess_combination, r);
      if(r.black == max_positions) {
         makeguessbutton.disabled = true;
         makeguessbutton.value = "SOLVED";
      }
      else {
         process_solution_set(guess_combination, r);
      }
      print_solution_set();
   }

   guessinput.value = "";
   return(false);
}

// let the computer choose a random solution
// such that it checks out with the ratings given
// for all past guesses
function make_guess() {
   var guess_chosen = false;
   var rg;
   var ri;
   var guess_index;

   while(!guess_chosen) {
      var rejected = false;
      guess_index = Math.floor(Math.random() * solution_set.length);

      // if we have already played this guess, choose another
      if(solution_set[guess_index].played) {
         continue;
      }

      // if this guess is rejected previously, choose another
      if(!solution_set[guess_index].included) {
         continue;
      }

      // compare with all past guesses played
      for(var i = 0; i < solution_set.length; i++) {
         if(solution_set[i].played) {
            rg = compare_combinations(solution_set[i].combination,
                                      solution_set[guess_index].combination);
            ri = solution_set[i].rating;

            // compare the guess with a previously played solution
            if(!equivalent_rating(rg, ri)) {
               solution_set[guess_index].included = false;
               rejected = true;
               break;
            }
         }
      }

      // check if the guess_index has been rejected after the entire loop
      // is complete. if not, that is our guess
      if(!rejected) {
         guess_chosen = true;
      }
   }

   var guessvalue = solution_set[guess_index].combination.join('');
   return(guessvalue);
}

function parse_combination(v, c) {
   var n = parseInt(v);

   if(isNaN(n) || v.length != max_positions) {
      return(false);
   }

   // erase combination array
   c.splice(0, c.length);

   for(var i = 0; i < max_positions; i++) {
      var digit = n % 10;
      if(digit > max_colours || digit <= 0) {
         console.log("Invalid input - " + v);
         return(false);
      }
      c.push(n % 10);
      n = Math.floor(n / 10);
   }
   c.reverse();
   return(true);
}

function same_combination(c1, c2) {
   var ct1 = Array.from(c1);
   var ct2 = Array.from(c2);
   var retval = true;

   for(var i = 0; i < max_positions; i++) {
      if(ct1[i] != ct2[i]) {
         retval = false;
         break;
      }
   }
   return(retval);
}

function compare_combinations(c1, c2) {
   var ct1 = Array.from(c1);
   var ct2 = Array.from(c2);
   var rating = {white: 0, black: 0};

   // count the number of black ratings
   for(var i = 0; i < max_positions; i++) {
      if(ct1[i] == ct2[i] && ct1[i] != 0 && ct2[i] != 0) {
         ct1[i] = 0;
         ct2[i] = 0;
         rating.black++;
      }
   }

   // count the number of white ratings
   for(var i = 0; i < max_positions; i++) {
      for(var j = 0; j < max_positions; j++) {
         if(j == i) {
            continue;
         }
         if(ct1[i] == ct2[j] && ct1[i] != 0 && ct2[j] != 0) {
            ct1[i] = 0;
            ct2[j] = 0;
            rating.white++;
         }
      }
   }
   return(rating);
}

function add_guess(c, r) {
   total_guesses++;

   var tr = document.createElement("tr");
   for(var i = 0; i < max_positions; i++) {
      var td = document.createElement("td");
      td.innerHTML = c[i];
      tr.appendChild(td);
   }

   if(r != null) {
      var td = document.createElement("td");
      td.innerHTML = get_rating_string(r);
      td.className = "rating";
      tr.appendChild(td);
   }

   output.appendChild(tr);
}

function print_ith_solution(s) {
   if(!s.included || s.played) {
      return;
   }

   var tr = document.createElement("tr");

   for(var i = 0; i < max_positions; i++) {
      var td = document.createElement("td");
      td.innerHTML = s.combination[i];
      tr.appendChild(td);
   }

   list.appendChild(tr);
}

function get_rating_string(r) {
   var rating_string = "";
   for(var i = 0; i < r.white; i++) {
      rating_string += "W";
   }
   for(var i = 0; i < r.black; i++) {
      rating_string += "B";
   }
   return(rating_string);
}

function process_solution_set(c, r) {
   for(var i = 0; i < solution_set.length; i++) {

      // don't process entries that are not included in the set
      if(!solution_set[i].included) {
         continue;
      }

      // don't process entries that aren't played yet
      if(!solution_set[i].played) {
         continue;
      }

      if(same_combination(c, solution_set[i].combination)) {
         solution_set[i].rating = r;
      }
   }
}

function erase_solution_set_list() {
   // empty out the solution set list
   while(list.firstChild) {
      list.removeChild(list.firstChild);
   }
}

function print_solution_set() {
   erase_solution_set_list();

   var solutions_remaining = 0;
   for(var i = 0; i < solution_set.length; i++) {
      print_ith_solution(solution_set[i]);
      if(solution_set[i].included) {
         solutions_remaining++;
      }
   }

   solutions_count.innerHTML = solutions_remaining;
}

function equivalent_rating(r1, r2) {
   if(r1.white == r2.white && r1.black == r2.black) {
      return(true);
   }
   return(false);
}

function choose_random_colour(m) {
   return(Math.floor(Math.random() * max_colours) + 1);
}

function update_setup_heading(n) {
   setupheading.innerHTML = "CALCULATING " + n + "/" +
                              solution_set.length;
}

window.onload = init;
