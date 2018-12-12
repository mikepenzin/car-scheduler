(function ($) {
    $(document).ready(function(){
        $("#form-dialog").hide();
        
        $( "#open-form-dialog" ).click(function() {
          $( "#form-dialog" ).slideToggle( "slow", function() {
            console.log("Finished!");
          });
        });
    });
}(jQuery));