$(document).ready(function() {

    // proxy to allow API query even if it is not on https
    let proxy = "https://cors-anywhere.herokuapp.com/";
    
    // On first page load, go ahead and get the current location of the user using their IP address
    // Then use the result returned to get the weather data using the weatherstack API
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "text/plain",
        url: "https://ipapi.co/json/",

        success: function (response) {
            let longitude = response["longitude"];
            let latitude =  response["latitude"];
            let timeZoneOffset = response["utc_offset"].slice(0,3);
            let city = response["city"];
            getWeatherDetails(longitude, latitude, timeZoneOffset, city);
        }        
    });

    $(("label")[0]).addClass("active");

    function getWeatherDetails(longitude, latitude, timeZoneOffset, city) {  
    
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "text/plain",     
            url: `${proxy}https://api.darksky.net/forecast/33d90799f68e195b57437884fb34e078/${latitude},${longitude}?units=si`,
            
            success: function(response) {
                $("#timezone").html(response["timezone"]);
                $("#weather-condition").html(response["currently"]["summary"]);
                $("#temperature").html(Math.floor(response["currently"]["temperature"]));
                $("#city-section").html(city);

                // Temperature unit will default to Celsius
                $("#temperature-unit").html("&#8451;");

                // Set body and table font color
                $("body").css("color", "rgb(255,255,255)"); 
                $("table").css("color", "rgb(255,255,255)");

                // Get weather icon from dark sky
                // Then based on result returned, change the background of the html
                let weatherIcon = response["currently"]["icon"];

                if ((weatherIcon.includes("cloudy")) || (weatherIcon.includes("fog"))) {
                    // gradient css from https://gradienthunt.com/gradient/2141
                    $("body").css("background-image", "linear-gradient(179.7deg,  rgba(197,214,227,1) 2.9%, rgba(144,175,202,1) 97.1% )");                    
                }
                else if (weatherIcon.includes("clear-day")) {
                    // gradient css from https://cssgradient.io/gradient-backgrounds/
                    $("body").css("background-image", "linear-gradient( 176.4deg,  rgba(237,135,33,1) 28.8%, rgba(244,62,62,1) 99% )"); 
                }
                else if (weatherIcon.includes("clear-night")) {
                    // gradient from https://gradienthunt.com/gradient/4835
                    $("body").css("background-image", "linear-gradient( 359.8deg,  rgba(56,104,178,1) 7.3%, rgba(31,67,122,1) 84.8% )"); 
                }
                else if ((weatherIcon.includes("rain")) || (weatherIcon.includes("sleet"))) {
                    // gradient from https://gradienthunt.com/gradient/3610
                    $("body").css("background-image", "linear-gradient( 177.7deg,  rgba(79,104,112,1) 4.1%, rgba(150,198,214,1) 93.9% )");  
                }
                else if ((weatherIcon.includes("snow"))) {
                    // gradient from https://gradienthunt.com/gradient/4110
                    $("body").css("background-image", "linear-gradient( 180deg,  rgba(29,70,163,1) 5.6%, rgba(17,196,238,1) 109.7% )");  
                }
                else {
                    // gradient from https://cssgradient.io/gradient-backgrounds/
                    $("body").css("background-image", "radial-gradient( circle 1305px at -23% -5.8%,  rgba(62,209,218,1) 0%, rgba(0,105,148,1) 59% )"); 
                }

                // Default timezone to compare with (currently set to compare to Singapore)
                let refTimeZone = 8;

                // Get current timezone offset
                let currentTimeZoneOffset = timeZoneOffset;

                // Get time at current location
                // let currentTimeObject = new Date(response["currently"]["time"] * 1000) ;
                // Newly added 23/11/19
                let currentTimeObject = new Date(((response["currently"]["time"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000));

                let currentHour = hourMinutes(currentTimeObject.getHours());

                let currentMinutes = hourMinutes(currentTimeObject.getMinutes());

                let returnedAntiPostMeridien = antiPostMeridien(currentHour);

                $("#amPm").html(currentHour  + ":" +  currentMinutes  + " " + returnedAntiPostMeridien);
 
                // Get current day
                let day = new Date(((response["currently"]["time"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000)).getDay();

                // Call the dayOfWeek function
                var currentDay = dayOfWeek(day);
                
                $("#current-day").html(currentDay + " " + "TODAY");

                // Update daily lowest and highest temperature
                $("#high").html("Hi: " + (Math.floor(response["daily"]["data"][0]["temperatureHigh"]).toString())); 
                $("#low").html("Lo: " + (Math.floor(response["daily"]["data"][0]["temperatureLow"]).toString()));

                // Update the weather display for the upcoming 7 hours
                var sevenHoursPrediction = response["hourly"]["data"].slice(0, 7);
                var weatherIcons = [];

                // Replace the - weather icon to _ in order to use skycons.js to display the animated weather icon
                for (var i=0; i<sevenHoursPrediction.length; i++) {

                    $(`#hour${i}`).html(hourMinutes(new Date(((response["hourly"]["data"][i]["time"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000)).getHours()))
                    $(`#temp${i}`).html(Math.floor(response["hourly"]["data"][i]["temperature"]));
                    weatherIcons.push(((sevenHoursPrediction[i]["icon"]).replace(/-/g, "_")).toUpperCase());
                }     
                
                // Trigger the Skycons function call
                for (var j=0; j<weatherIcons.length; j++) {
                    setWeatherIcons(weatherIcons[j], `icon${j}`);
                }

                //  Update the weather display for the upcoming 7 days
                var sevenDaysPrediction = response["daily"]["data"].slice(0, 7);
                var weatherIconsWeek = [];
                
                for (var l=0; l<sevenDaysPrediction.length; l++) {
                    let currentDayOfWeek = new Date(((sevenDaysPrediction[l]["time"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000)).getDay();
                    let returnedCurrentDayOfWeek = dayOfWeek(currentDayOfWeek);
                    weatherIconsWeek.push(((sevenDaysPrediction[l]["icon"]).replace(/-/g, "_")).toUpperCase());

                    $(`#day${l}`).html(returnedCurrentDayOfWeek);
                    $(`#temp-day${l}-high`).html(Math.floor(sevenDaysPrediction[l]["temperatureMax"]));
                    $(`#temp-day${l}-low`).html(Math.floor(sevenDaysPrediction[l]["temperatureMin"]));
                }

                // Call the Skycons function call to display the animated weather icon for the upcoming 7 days
                for (var k=0; k<weatherIconsWeek.length; k++) {
                    setWeatherIcons(weatherIconsWeek[k], `temp-day${k}-icon`);
                }

                // Update the sunrise and sunset time for the day
                // Sunrise time
                $(`#sunrise-label`).html("SUNRISE");
                let sunriseTime = new Date(((response["daily"]["data"][0]["sunriseTime"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000));

                $(`#sunrise-time`).html(hourMinutes(sunriseTime.getHours()) + ":" + hourMinutes(sunriseTime.getMinutes())
                + " " + antiPostMeridien(hourMinutes(sunriseTime.getHours())));

                // Sunset time
                $(`#sunset-label`).html("SUNSET");
                let sunsetTime = new Date(((response["daily"]["data"][0]["sunsetTime"] - (refTimeZone * 3600) + (currentTimeZoneOffset * 3600)) * 1000));
                $(`#sunset-time`).html(hourMinutes(sunsetTime.getHours()) + ":" + hourMinutes(sunsetTime.getMinutes())
                + " " + antiPostMeridien(hourMinutes(sunsetTime.getHours())));

                // Update chance of rain and humidity percentage for the current moment
                // Chance of Rain
                $(`#chance-of-rain-label`).html("CHANCE OF RAIN");
                $(`#chance-of-rain-percentage`).html(response["currently"]["precipProbability"] * 100 + "%");

                // Humidity
                $(`#humidity-label`).html("HUMIDITY");
                $(`#humidity-percentage`).html(Math.floor(response["currently"]["humidity"] * 100) + "%");

                // Update wind direction and feels like for the current moment
                // Wind 
                $(`#wind-label`).html("WIND");
                $(`#wind-speed`).html(Math.ceil(response["currently"]["windSpeed"]) + " " + "mps");

                // Feels like
                $(`#feels-like-label`).html("FEELS LIKE");
                $(`#feels-like`).html(Math.floor(response["currently"]["apparentTemperature"]).toString() + "&#8451;");

                // Update visibility and uv-index for the current moment
                // Visibility
                $(`#visibility-label`).html("VISIBILITY");
                $(`#visibility-level`).html(Math.floor(response["currently"]["visibility"]).toString() + " " + "km");

                // UV Index
                $(`#uv-index-label`).html("UV INDEX");
                $(`#uv-index-level`).html(response["currently"]["uvIndex"]);

            }
        });
    };

    // Hour function
    function hourMinutes(time) {
        if (time < 10) {
            return "0" + time.toString();
        }
        else {
            return time.toString();
        }
    }

    // Hour association to AM or PM;
    function antiPostMeridien(hourOfDay) {
        if ((hourOfDay >= 0) && (hourOfDay <= 11)) {
            return "AM";
        }
        else {
            return "PM";
        }
    }

    // Function to associate day returned by API
    function dayOfWeek(day) {
        if (day === 0) {
            return "Sunday"
        }
        else if (day === 1) {
            return "Monday";
        }
        else if (day === 2) {
            return "Tuesday";
        }
        else if (day === 3) {
            return "Wednesday";
        }
        else if (day === 4) {
            return "Thursday";
        } 
        else if (day === 5) {
            return "Friday";
        }      
        else if (day === 6) {
            return "Saturday";
        }   
    }
       
    // Based on windows size, set canvas width and height
    let mediaQuerysize = window.matchMedia("(max-width: 575.98px)");

    //  Get number of canvas elements
    let canvasElement = $("canvas");

    function canvasElementDimension(e) {
        if (e.matches) {
            $("canvas").attr("width", "32");
            $("canvas").attr("height", "32");
        }
        else {
            $("canvas").attr("width", "60");
            $("canvas").attr("height", "60");                    
        }
    }

    // Call the function at run time in order to resize the canvas element dimension
    canvasElementDimension(mediaQuerysize);

    // attach listener to respond on state changes
    mediaQuerysize.addListener(canvasElementDimension);

    // Skycons animation
    function setWeatherIcons(icon, iconID) {

        const skycons = new Skycons({color: "white"});
        skycons.play();
        return skycons.set(iconID, Skycons[icon])
    } 

    // to query for location to get coords to query in DarkSky
    $(".country-search").submit(function(event) {
        event.preventDefault();

        let countryName = $("#autocomplete").val();
        
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "text/plain",
            // using the weatherstack api to perform a query based on input from user to get location details (long, lat, timezone offset and city)
            url: `${proxy}http://api.weatherstack.com/current?access_key=adcf0b574a906d43986d1d8b229ad309&query=${countryName}`,

            success: function (response) {

                let longCountry = response["location"]["lon"];
                let latCountry =  response["location"]["lat"];
                let countryTimeZoneOffset = response["location"]["utc_offset"];
                let city = response["location"]["name"];

                getWeatherDetails(longCountry, latCountry, countryTimeZoneOffset, city);
            }
    
        });     
        
    })
    // https://api.mapbox.com/geocoding/v5/mapbox.places/georgia.json?types=country&access_token=pk.eyJ1Ijoiank5MyIsImEiOiJjazM2MHZqenAwNnl1M2hxcDloZm0xajMzIn0.x2fIjAi3cI3gVT3LTZ_2FQ"
})