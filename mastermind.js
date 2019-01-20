// mastermind.js
// by Saumil Shah
//
// An implementation of Donald Knuth's Mastermind algorithm

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
var solutions_count = null;
var master_combination = [];
var guess_combination = [];
var solution_set = [];
var possible_ratings = [];

function init() {
   heading = document.getElementById("heading");
   output = document.getElementById("output");
   list = document.getElementById("list");
   setupform = document.getElementById("setupform");
   setvalues = document.getElementById("setvalues");
   guessform = document.getElementById("guessform");
   guessinput = document.getElementById("guess");
   makeguessbutton = document.getElementById("makeguessbutton");
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

   generate_possible_ratings();
   fill_solution_set(0);
   calculate_all_candidates();
   return(false);
}

function play_game() {
   hidethis.style.display = "none";
   showthis1.style.display = "inline-block";

   heading.innerHTML = "MASTERMIND (" + max_positions + ","
                                      + max_colours + ")";

   //generate_random_combination(master_combination);
   erase_solution_set_list();
   print_solution_set();
}

function generate_combination(c) {
   // erase combination array
   c.splice(0, c.length);

   for(var i = 0; i < max_positions; i++) {
      c[i] = choose_random_colour(max_colours);
   }
}

// function to generate all possible rating combinations (W, B, etc)
function generate_possible_ratings() {
   for(var white = 0; white <= max_positions; white++) {
      for(var black = 0; black <= max_positions; black++) {
         if(white + black > max_positions) {
            continue;
         }
         if(white == 1 && black == max_positions - 1) {
            // impossible situation. If B = n-1 and W = 1, then
            // it implies that the last colour is in the incorrect
            // position, with all other colours being in correct positions.
            // this is absurd, so such a rating combination cannot exist
            continue;
         }
         var r = {white: white, black: black};
         possible_ratings.push(r);
      }
   }
}

// recursive function to fill up the solution set
function fill_solution_set(p) {
   for(var i = 0; i < max_colours; i++) {
      guess_combination[p] = i + 1;
      if(p == max_positions - 1) {

         var ratings_candidates = {};
         for(var j = 0; j < possible_ratings.length; j++) {
            var rating_string = get_rating_string(possible_ratings[j]);
            ratings_candidates[rating_string] = 0;
         }
         solution_set.push({
            combination: Array.from(guess_combination),
            rating: {white: 0, black:0},
            included: true,
            played: false,
            candidates: ratings_candidates,
            max: 0
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
// choose a guess from the first available element
// in the solution set
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
         var possibilities = process_solution_set(guess_combination, r);
         recalc_all_candidates();
      }
   }

   guessinput.value = "";
   return(false);
}

// let the computer choose the first available combination in the
// solution set as a possible guess
function make_guess() {
   var minmax = solution_set.length;
   var minmax_included = minmax;
   var ret_index;
   var min_index = 0;
   var min_index_included = 0;

   for(var i = 0; i < solution_set.length; i++) {
      if(solution_set[i].played) {
         continue;
      }
      if(solution_set[i].max < minmax) {
         minmax = solution_set[i].max;
         min_index = i;
      }
      if(solution_set[i].max < minmax_included && solution_set[i].included) {
         minmax_included = solution_set[i].max;
         min_index_included = i;
      }
   }

   // if the minimum value exists within the set of included
   // solutions, use that. if not, use the overall minimum value
   if(minmax < minmax_included) {
      ret_index = min_index;
   }
   else {
      ret_index = min_index_included;
   }

   var guessvalue = solution_set[ret_index].combination.join('');
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
   var tr = document.createElement("tr");
   if(!s.included) {
      tr.className = "grey";
   }

   for(var i = 0; i < max_positions; i++) {
      var td = document.createElement("td");
      td.innerHTML = s.combination[i];
      tr.appendChild(td);
   }

   var candidate_keys = Object.keys(s.candidates);
   for(var i = 0; i < candidate_keys.length; i++) {
      var td = document.createElement("td");
      td.className = "candidates";
      var k = (candidate_keys[i] == "") ? "none" : candidate_keys[i];
      td.innerHTML = k + "," + s.candidates[candidate_keys[i]];
      if(s.candidates[candidate_keys[i]] == s.max) {
         td.className += " red";
      }
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
   var retval = 0;
   for(var i = 0; i < solution_set.length; i++) {

      // don't process entries that are not included in the set
      if(!solution_set[i].included) {
         continue;
      }

      var rating = compare_combinations(c, solution_set[i].combination);
      solution_set[i].rating = rating;
      if(equivalent_rating(rating, r)) {
         retval++;
      }
      else {
         solution_set[i].included = false;
      }
   }
   return(retval);
}

function erase_solution_set_list() {
   // empty out the solution set list
   while(list.firstChild) {
      list.removeChild(list.firstChild);
   }
}

function print_solution_set() {
   solution_set.sort(compare_max);

   var solutions_remaining = 0;
   for(var i = 0; i < solution_set.length; i++) {
      print_ith_solution(solution_set[i]);
      if(solution_set[i].included) {
         solutions_remaining++;
      }
   }

   solutions_count.innerHTML = solutions_remaining;
}

function calculate_all_candidates() {
   for(var i = 0; i < solution_set.length; i++) {
      // calculate the candidates array for the ith combination
      setTimeout(function(x) {
         if(x % 10 == 0) {
            update_setup_heading(x);
         }
         solution_set[x].max = calculate_candidates_array(solution_set[x]);
         if(x == solution_set.length - 1) {
            play_game();
         }
      }, 0, i);
   }
}

function recalc_all_candidates() {
   erase_solution_set_list();
   makeguessbutton.disabled = true;
   makeguessbutton.value = "PLEASE WAIT";
   for(var i = 0; i < solution_set.length; i++) {
      // calculate the candidates array for the ith combination
      setTimeout(function(x) {
         solution_set[x].max = calculate_candidates_array(solution_set[x]);
         if(x == solution_set.length - 1) {
            makeguessbutton.disabled = false;
            makeguessbutton.value = "MAKE GUESS";
            print_solution_set();
         }
      }, 0, i);
   }
}

// sorting function
function compare_max(a, b) {
   if(a.max == b.max) {
      if(a.included != b.included) {
         return(!a.included - !b.included);
      }
      else {
         // if max values are equal, choose the lower of the two
         // numeric values of the combination
         var value_a = parseInt(a.combination.join(''));
         var value_b = parseInt(b.combination.join(''));
         return(value_a - value_b);
      }
   }
   else {
      // otherwise return the element with the lower max value
      return(a.max - b.max);
   }
}

// for an element in the solution set, calculate the number of
// candidates for each possible rating combination
function calculate_candidates_array(s) {
   var max = 0;
   for(var j = 0; j < possible_ratings.length; j++) {
      var candidates = calculate_candidates(s.combination, possible_ratings[j]);
      s.candidates[get_rating_string(possible_ratings[j])] = candidates;
      if(candidates > max) {
         max = candidates;
      }
   }
   return(max);
}

// for a given combination and rating, calculate how many
// items can we eliminate from the solution set
function calculate_candidates(c, r) {
   var candidates = 0;
   for(var i = 0; i < solution_set.length; i++) {
      if(!solution_set[i].included) {
         continue;
      }
      var rating = compare_combinations(c, solution_set[i].combination);
      if(equivalent_rating(rating, r)) {
         candidates++;
      }
   }
   return(candidates);
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
