function initMap() {
    var input = document.getElementById('autocomplete');
    var autocomplete = new google.maps.places.Autocomplete(input);

    // Get the longitude and latitude of based on places selected
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();

        // append hidden input field based on selection to the form element 
        $(".country-search").append(`<input type="hidden" id="lng" name="lng" value="${lng}">`);
        $(".country-search").append(`<input type="hidden" id="lat" name="lat" value="${lat}">`);

    })
}