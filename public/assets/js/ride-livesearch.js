(function ($) {
  var $rows = $('div.ride-card');
    var searchTermOption = $('select#search-type');
    
    var searchOption = searchTermOption.val();
    var texts = $rows.map(function () {
        return $(this).find("." + searchOption).text().toLowerCase();
    }).toArray();
    
    
    searchTermOption.on('change', function(){
      searchOption = searchTermOption.val(); 
      texts = $rows.map(function () {
          return $(this).find("." + searchOption).text().toLowerCase();
      }).toArray();
    });
    
    $('input#searchInput').on("keyup paste drop", function () {
        var searchTerm = $.trim( this.value.toLowerCase() ), 
            lastTerm = $(this).data("lastTerm"),
            i, found;
    
        if (searchTerm === lastTerm) return;
        $(this).data("lastTerm", searchTerm);
    
        for (i = texts.length - 1; i >= 0; i--) {
            found = searchTerm === '' || texts[i].indexOf(searchTerm) > -1;
            $rows[i].style.display = found ? "" : "none";
        }
    });
}(jQuery));