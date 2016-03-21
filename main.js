var movieKey = '3c03bdd643b85d2306455896d5df614b:14:74709955';
var guideBoxKey = 'rKwNUv86qWPdUIaMOejW5NnPYBQxAYrk';

document.addEventListener("DOMContentLoaded", function(event){
  console.log("JS Running");

  // var movieKey = '3c03bdd643b85d2306455896d5df614b:14:74709955';
  // var guideBoxKey = 'rKwNUv86qWPdUIaMOejW5NnPYBQxAYrk';
  var submitButton = document.querySelector('#submit-btn');
  var movieInfo = {};
  var contentContainer = document.querySelector('#content-placeholder');

  submitButton.addEventListener('click', function(){
    movieInfo = {};
    var loadingImg = document.createElement("img");
    loadingImg.setAttribute("src", "teddy-bear-loading.gif");

    contentContainer = document.querySelector('#content-placeholder').innerHTML = "";
    contentContainer = document.querySelector('#content-placeholder').appendChild(loadingImg);
    var movieTitle = document.querySelector('#movie-search').value;
    $.ajax({
      url: "http://www.omdbapi.com/?tomatoes=true&t=" + movieTitle,
      success: function(response){
        if (response.Title) {
          movieInfo.title = response.Title;
          movieInfo.actors = response.Actors;
          movieInfo.year = response.Year;
          movieInfo.release = response.Release;
          movieInfo.rated = response.Rated;
          movieInfo.plot = response.Plot;
          movieInfo.tomatoRating = response.tomatoRating;
          movieInfo.tomatoPic = response.tomatoImage;
          movieInfo.id = response.imdbID;
          if (document.querySelector('#nyTimes_checkbox:checked')){
            getReview(movieInfo);
          } else {
            movieInfo.timesLinkText = true;
            movieInfo.dontPrint = true;
          }
          if (document.querySelector('#stream_checkbox:checked')){
            movieInfo.printResources = true;
            getGuideBoxID(movieInfo);
            console.log("in getGuideBoxID checkedbox");
          } else {
            movieInfo.dontPrintResources = true;
            getPictureOnly(movieInfo);
            console.log("in else of guidebox, and movieInfo.dontPrintResources is: ", movieInfo.dontPrintResources);
          }
        } else {
          console.log("response is: ", response);
          contentContainer = document.querySelector('#content-placeholder').innerHTML = "Can't find your selection, try again!";
        }
      },
      fail: function(response) {
        console.log("Never got into OMDB database");
      }
    }) // end of ajax callback

  }) //end of submit button event listener;

}) // end of window onload function

var getReview = function(obj){
  $.ajax({
    url: "http://api.nytimes.com/svc/movies/v2/reviews/search?query=" + obj.title + "&api-key=" + movieKey,
    success: function(response){
      console.log("response is: ", response);
      if (response.results.length == 0) {
        obj.timesURL = "";
        obj.timesLinkText = "";

      } else if (response.results[0].link.url) {
        obj.timesURL = response.results[0].link.url;
        obj.timesLinkText = response.results[0].link.suggested_link_text;
      } else {
        console.log("in else statement");
      }

    },
    error: function(response) {
      console.log("In fail function");
      obj.timesURL = "";
      obj.timesLinkText = "";
      // runHandlebars(obj);
    }
  }) // end of ajax callback
}

var runHandlebars = function(obj) {
  var templateSource = document.getElementById("movie_template").innerHTML;

  var template = Handlebars.compile(templateSource);

  var computedHtml = template(obj);

  var contentContainer = document.getElementById("content-placeholder");
  contentContainer.innerHTML = computedHtml;

}


// ***This function gets the picture from guidebox and appends all info.  Movie poster not available through OMDB API.
var getPictureOnly = function(obj) {
  $.ajax({
    url: "https://api-public.guidebox.com/v1.43/US/"+ guideBoxKey + "/search/movie/id/imdb/"+ obj.id + "/sources/all/",
    success: function(response){
      obj.picture = response.poster_240x342;
      obj.guideID = response.id;
      runHandlebars(obj);
    },
    error: function(response) {
      console.log("In fail function of guidebox");
    }
  }) // end of ajax callback
}



var getGuideBoxID = function(obj) {
  $.ajax({
    url: "https://api-public.guidebox.com/v1.43/US/"+guideBoxKey + "/search/movie/id/imdb/"+ obj.id + "/sources/all/",
    success: function(response){
      console.log("response is: ", response);
      obj.picture = response.poster_240x342;
      obj.guideID = response.id;
      getGuideBoxResources(obj);
    },
    error: function(response) {
      console.log("In fail function of guidebox");
    }
  }) // end of ajax callback
}

var getGuideBoxResources = function(obj) {
  $.ajax({
    url: "https://api-public.guidebox.com/v1.43/US/" +guideBoxKey + "/movie/" + obj.guideID,
    success: function(response){
      console.log("response is: ", response);
      if (response.subscription_web_sources.length > 0) {
        obj.sources = [];
        obj.printResources = true;
        for (var i = 0; i < response.subscription_web_sources.length; i++) {
          obj.sources.push(response.subscription_web_sources[i].display_name);
          console.log("obj.sources is now: ", obj.sources);
        }
      }
      console.log("in getGuideBoxResources, obj is: ", obj);
      runHandlebars(obj)
    },
    error: function(response) {
      console.log("In fail function of getguideBoxResources");
      runHandlebars(obj);
    }
  }) // end of ajax callback
}
