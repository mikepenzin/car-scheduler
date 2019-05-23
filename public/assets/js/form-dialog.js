/*global jQuery*/
(function($) {
    $(document).ready(function() {
        $("#form-dialog").hide();
        var previousText = $("#open-form-dialog").text();

        $("#open-form-dialog").click(function() {
            $("#form-dialog").slideToggle("slow", function() {
                if ($("#open-form-dialog").text() == previousText) {
                    $("#open-form-dialog").fadeOut('slow', function() {
                        $(this).text("סגור טופס").fadeIn('slow');
                    });
                }
                else {
                    $("#open-form-dialog").fadeOut(function() {
                        $(this).text(previousText).fadeIn();
                    });
                }
            });
        });

        $("#advancedSearch").click(function() {
            $("#advancedSearchForm").slideToggle("slow", function() {
                if ($("#advancedSearch > i").hasClass("fa-chevron-down")) {
                    $("#advancedSearch i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
                }
                else {
                    $("#advancedSearch i").removeClass("fa-chevron-up").addClass("fa-chevron-down");
                }
            });
        });
    });
}(jQuery));
