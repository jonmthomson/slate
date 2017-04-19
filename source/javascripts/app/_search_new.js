//= require lunr.min
//= require ../lib/_jquery
//= require ../lib/_jquery_ui

var lunrIndex = null;
var lunrData = null;

// Download index data
$.ajax({
  url: '/search.json',
  cache: true,
  method: 'GET',
  success: function(data){
    lunrData = data;
  }
});

// Setup autocomplete 
$(function() {
  $('#input-search').autocomplete({
    source: function(request, response) {
      if (lunrIndex == null) {
        console.info('Creating Lunr index.');
        lunrIndex = lunr.Index.load(lunrData.index);
      }
      var result = _(lunrIndex.search(request.term)).take(50).pluck('ref').map(function(ref) {
        return lunrData.docs[ref];
      }).value();

      if (result.length == 0) {
        result = [{'noresults': true}];
      }

      response(result);
    },

    select: function(event, selected) {
      if (!selected.item.noresults) {
        window.location.href = selected.item.url;
      }
    },

    open: function() {
      $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },

    close: function() {
      $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
  }).autocomplete("instance")._renderItem = function(ul, item) {
    // Copied from https://jqueryui.com/autocomplete/#custom-data
    var content = item.noresults
      ? '<span class="noresults">No results found</span>'
      : '<a href="' + item.url + '">' + item.title + '</a>';

    $(this.menu.element).toggleClass('noresults', item.noresults);
    return $("<li>").append(content).appendTo(ul);
  };
});