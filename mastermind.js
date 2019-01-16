// mastermind.js
// by Saumil Shah
//
// A simplistic implementation of Donald Knuth's Mastermind
// algorithm

var max_colours = 6;
var max_positions = 4;

var output = null;
var list = null;
var guessform = null;
var guessinput = null;
var secretform = null;
var secretinput = null;
var hidethis = null;
var showthis1 = null;
var showthis2 = null;
var solutions_count = null;
var master_combination = [];
var guess_combination = [];
var solution_set = [];

function init() {
   output = document.getElementById("output");
   list = document.getElementById("list");
   guessform = document.getElementById("guessform");
   guessinput = document.getElementById("guess");
   solutions_count = document.getElementById("solutions_count");
   secretform = document.getElementById("secretform");
   secretinput = document.getElementById("secret");
   hidethis = document.getElementById("hidethis");
   showthis1 = document.getElementById("showthis1");
   showthis2 = document.getElementById("showthis2");

   guessinput.maxlength = max_positions;
   guessinput.size = max_positions;
   secretinput.maxlength = max_positions;
   secretinput.size = max_positions;

   guessform.onsubmit = guess_submitted;
   secretform.onsubmit = secret_submitted;
   guessinput.value = "";
   secretinput.value = "";

   //generate_random_combination(master_combination);
   fill_solution_set(0);
   print_solution_set();
}

function generate_combination(c) {
   // erase combination array
   c.splice(0, c.length);

   for(var i = 0; i < max_positions; i++) {
      c[i] = choose_random_colour(max_colours);
   }
}

function fill_solution_set(p) {
   for(var i = 0; i < max_colours; i++) {
      guess_combination[p] = i + 1;
      if(p == max_positions - 1) {
         solution_set.push({
            combination: Array.from(guess_combination),
            rating: {white: 0, black:0},
            included: true
         });
      }
      else {
         fill_solution_set(p + 1);
      }
   }
}

function secret_submitted() {
   var valid = parse_combination(secretinput.value, master_combination);

   if(valid) {
      hidethis.style.display = "none";
      showthis1.style.display = "inline-block";
      showthis2.style.display = "inline-block";
   }
   else {
      secretinput.value = "";
   }
   return(false);
}

function guess_submitted() {
   var valid = parse_combination(guessinput.value, guess_combination);

   if(valid) {
      var r = compare_combinations(guess_combination, master_combination);
      add_row(output, guess_combination, r);
      var possibilities = process_solution_set(guess_combination, r);
      print_solution_set();
   }

   guessinput.value = "";
   return(false);
}

function parse_combination(v, c) {
   var n = parseInt(v);

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

   for(var i = 0; i < max_positions; i++) {
      if(ct1[i] == ct2[i] && ct1[i] != 0 && ct2[i] != 0) {
         ct1[i] = 0;
         ct2[i] = 0;
         rating.black++;
      }
   }

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

function add_row(e, c, r) {
   e.appendChild(make_row(c, r));
}

function make_row(c, r) {
   var tr = document.createElement("tr");
   for(var i = 0; i < max_positions; i++) {
      var td = document.createElement("td");
      td.innerHTML = c[i];
      tr.appendChild(td);
   }

   if(r != null) {
      var rating_string = "";
      for(var i = 0; i < r.white; i++) {
         rating_string += "W";
      }
      for(var i = 0; i < r.black; i++) {
         rating_string += "B";
      }
      var td = document.createElement("td");
      td.innerHTML = rating_string;
      td.className = "rating";
      tr.appendChild(td);
   }
   return(tr);
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

function print_solution_set() {
   // empty out the solution set list
   while(list.firstChild) {
      list.removeChild(list.firstChild);
   }

   var solutions_remaining = 0;
   for(var i = 0; i < solution_set.length; i++) {
      if(solution_set[i].included) {
         add_row(list, solution_set[i].combination);
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

window.onload = init;
