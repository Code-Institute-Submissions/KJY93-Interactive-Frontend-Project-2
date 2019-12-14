$(document).ready(function () {

    // hide the loading spinner
    $("#loading").hide();

    // hide the main content and load it only when the AJAX call is successful
    $("#loaded").hide();

    // proxy to allow API query even if it is not on https
    let proxy = "https://cors-anywhere.herokuapp.com/";

    // On first page load, go ahead and get the current location of the user using their IP address
    // Then use the result returned to get the weather data using the weatherstack API
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "text/plain",
        url: "https://ipapi.co/json/",

        "beforeSend": function (xhr) {
            //before the ajax request query is send over let's do some UI changes
            $("#loading").show();
            $("#loaded").hide();
        },

        success: function (response) {
            // hide the loading spinner
            $("#loading").hide();

            // show the loaded content
            $("#loaded").show();

            // added <hr> element to the divs container
            $("hr-1").html("<hr>");
            $("hr-2").html("<hr>");
            let longitude = response["longitude"];
            let latitude = response["latitude"];
            let city = response["city"];

            // added 101219 to get timezone
            let cityTimeZone = response["timezone"];

            getWeatherDetails(longitude, latitude, city, cityTimeZone);

        }
    });

    function getWeatherDetails(longitude, latitude, city, cityTimeZone) {

        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "text/plain",
            // 101219 added timezone as query parameter to get the correct timezone based on DarkSky api
            url: `${proxy}https://api.darksky.net/forecast/33d90799f68e195b57437884fb34e078/${latitude},${longitude}?units=si`,

            success: function (response) {

                $("#weather-condition").html(response["currently"]["summary"]);
                $("#temperature").html(Math.floor(response["currently"]["temperature"]));
                $("#city-section").html(city);

                // Temperature unit will default to Celsius
                $("#temperature-unit").html("&#xb0;");

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
                    // https://cssgradient.io/gradient-backgrounds/
                    $("body").css("background-image", "linear-gradient( 135deg, #ABDCFF 10%, #0396FF 100%)");
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

                // 121019 added to include embedded map
                $("#modal-body-map").html(`<iframe width="100%" height="300px" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q=${latitude},${longitude}&key=AIzaSyAxfWSblcH15jkAI4XusbQDKNTqT6uuruM"></iframe>`);

                // Get time at current location based on timezone 101219
                var currentTimeObject = moment.unix(response["currently"]["time"]).tz(cityTimeZone).format('YYYY-MM-DD HH:mm A');

                // save the current city to local Storage
                localStorage.setItem("currentCity", city);

                let currentHour = currentTimeObject.substring(11, 13);

                let currentMinutes = currentTimeObject.substring(14, 16);

                let returnedAntiPostMeridien = currentTimeObject.substring(17, 19);

                $("#amPm").html(currentHour + ":" + currentMinutes + " " + returnedAntiPostMeridien);

                // Get current day
                let day = moment(currentTimeObject.substring(0, 10)).day();

                // Call the dayOfWeek function
                var currentDay = dayOfWeek(day);

                $("#current-day").html("TODAY");

                // Update daily lowest and highest temperature
                $("#high").html("Hi: " + (Math.floor(response["daily"]["data"][0]["temperatureHigh"]).toString()));
                $("#low").html("Lo: " + (Math.floor(response["daily"]["data"][0]["temperatureLow"]).toString()));

                // Update the weather display for the upcoming 7 hours
                var sevenHoursPrediction = response["hourly"]["data"].slice(0, 7);
                var weatherIcons = [];

                // Replace the - weather icon to _ in order to use skycons.js to display the animated weather icon
                for (var i = 0; i < sevenHoursPrediction.length; i++) {

                    // Rename the current hour to "Now" instead
                    if (i === 0) {
                        $(`#hour${i}`).html("Now");
                    }
                    else {
                        $(`#hour${i}`).html(moment.unix(response["hourly"]["data"][i]["time"]).tz(cityTimeZone).format('YYYY-MM-DD HH:mm').substring(11, 13));
                    }

                    $(`#temp${i}`).html(Math.floor(response["hourly"]["data"][i]["temperature"]) + "&#xb0;");
                    weatherIcons.push(((sevenHoursPrediction[i]["icon"]).replace(/-/g, "_")).toUpperCase());
                }

                // Trigger the Skycons function call
                for (var j = 0; j < weatherIcons.length; j++) {
                    setWeatherIcons(weatherIcons[j], `icon${j}`);
                }

                //  Update the weather display for the upcoming 7 days
                var sevenDaysPrediction = response["daily"]["data"].slice(0, 7);
                var weatherIconsWeek = [];

                for (var l = 0; l < sevenDaysPrediction.length; l++) {
                    let currentDayOfWeek = new Date(((sevenDaysPrediction[l]["time"]) * 1000)).getDay();
                    let returnedCurrentDayOfWeek = dayOfWeek(currentDayOfWeek);
                    weatherIconsWeek.push(((sevenDaysPrediction[l]["icon"]).replace(/-/g, "_")).toUpperCase());

                    $(`#day${l}`).html(returnedCurrentDayOfWeek);
                    $(`#temp-day${l}-high`).html(Math.floor(sevenDaysPrediction[l]["temperatureMax"]));
                    $(`#temp-day${l}-low`).html(Math.floor(sevenDaysPrediction[l]["temperatureMin"]));
                }

                // Call the Skycons function call to display the animated weather icon for the upcoming 7 days
                for (var k = 0; k < weatherIconsWeek.length; k++) {
                    setWeatherIcons(weatherIconsWeek[k], `temp-day${k}-icon`);
                }

                // Update the sunrise and sunset time for the day
                // Sunrise time
                $(`#sunrise-label`).html("SUNRISE");
                let sunriseTime = moment.unix(response["daily"]["data"][0]["sunriseTime"]).tz(cityTimeZone).format('YYYY-MM-DD HH:mm A');

                $(`#sunrise-time`).html(sunriseTime.substring(11, 19));

                $("#sunrise-img").attr("src", "./static/images/sunrise.png")

                // Sunset time
                $(`#sunset-label`).html("SUNSET");
                let sunsetTime = moment.unix(response["daily"]["data"][0]["sunsetTime"]).tz(cityTimeZone).format('YYYY-MM-DD HH:mm A');
                $(`#sunset-time`).html(sunsetTime.substring(11, 19));

                $("#sunset-img").attr("src", "./static/images/sunset.png")

                // Update chance of rain and humidity percentage for the current moment
                // Chance of Rain
                $(`#chance-of-rain-label`).html("CHANCE OF RAIN");
                $(`#chance-of-rain-percentage`).html(Math.round(response["currently"]["precipProbability"] * 100) + "%");

                // Humidity
                $(`#humidity-label`).html("HUMIDITY");
                $(`#humidity-percentage`).html(Math.floor(response["currently"]["humidity"] * 100) + "%");

                // Update wind direction and feels like for the current moment
                // Wind 
                $(`#wind-label`).html("WIND");
                $(`#wind-speed`).html(Math.ceil(response["currently"]["windSpeed"]) + " " + "mps");

                // Feels like
                $(`#feels-like-label`).html("FEELS LIKE");
                $(`#feels-like`).html(Math.floor(response["currently"]["apparentTemperature"]).toString() + "&#xb0;");

                // Update visibility and uv-index for the current moment
                // Visibility
                $(`#visibility-label`).html("VISIBILITY");
                $(`#visibility-level`).html(Math.floor(response["currently"]["visibility"]).toString() + " " + "km");

                // UV Index
                $(`#uv-index-label`).html("UV INDEX");
                $(`#uv-index-level`).html(response["currently"]["uvIndex"]);

            }
        });

        // define an empty array to save the date and temperature value
        let xDate = [];
        let yTempCelMin = [];
        let yTempCelAvg = [];
        let yTempCelMax = [];

        let yTempFahMin = [];
        let yTempFahAvg = [];
        let yTempFahMax = [];

        // Past 7 days data inclusive of current date
        // Get the date of the start of last week (e.g. if today is 11th Dec, 7 days ago would be 5th Dec, inclusive of 11th Dec itself)
        let currentDateUnix = moment().unix();
        let pastDateUnix = moment().unix() - (24*60*60*6);

        let currentDate = moment.unix(currentDateUnix).tz(cityTimeZone).format('YYYY-MM-DD HH:mm A').substring(0, 10);
        let startWeekDate = moment.unix(pastDateUnix).tz(cityTimeZone).format('YYYY-MM-DD HH:mm A').substring(0, 10);

        // Default selection - Past 7 Days Data

        $("#option7Days").attr("checked", "checked");

        $("#option7Days-label").css("color", "#ffff33");

        document.getElementById("option7Days-label").classList.add("active");

        // Do a query to the weather API to get the past 7 days temperature data
        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "text/plain",
            url: `${proxy}http://api.weatherapi.com/v1/history.json?key=9eca6ab9a63f498ba7a130121191012&q=${latitude},${longitude}&dt=${startWeekDate}&end_dt=${currentDate}`,

            success: function (response) {
                for (let ct = 0; ct < response["forecast"]["forecastday"].length; ct++) {
                    xDate.push(response["forecast"]["forecastday"][ct]["date"]);

                    yTempCelMin.push(response["forecast"]["forecastday"][ct]["day"]["mintemp_c"]);
                    yTempFahMin.push(response["forecast"]["forecastday"][ct]["day"]["mintemp_f"]);

                    yTempCelAvg.push(response["forecast"]["forecastday"][ct]["day"]["avgtemp_c"]);
                    yTempFahAvg.push(response["forecast"]["forecastday"][ct]["day"]["avgtemp_f"]);

                    yTempCelMax.push(response["forecast"]["forecastday"][ct]["day"]["maxtemp_c"]);
                    yTempFahMax.push(response["forecast"]["forecastday"][ct]["day"]["maxtemp_f"]);

                }
                    // Save the historical data to local storage
                    localStorage.setItem("xAxisDate", JSON.stringify(xDate));
                    localStorage.setItem("yAxisTempCelMin", JSON.stringify(yTempCelMin));
                    localStorage.setItem("yAxisTempCelAvg", JSON.stringify(yTempCelAvg));
                    localStorage.setItem("yAxisTempCelMax", JSON.stringify(yTempCelMax));
                    localStorage.setItem("yAxisTempFahMin", JSON.stringify(yTempFahMin));
                    localStorage.setItem("yAxisTempFahAvg", JSON.stringify(yTempFahAvg));
                    localStorage.setItem("yAxisTempFahMax", JSON.stringify(yTempFahMax));
            },
            // alert the user on the error response code if the API query fails
            error: function (request, status, error) {
                alert(request.responseText);
            }

        });

    };

    // Degree Celcius / Fahrenheit Conversion
    // Default to celcius 
    $("#celsius").attr("checked", "checked");

    // Initial temperature unit is in Celsius, set its color to let user know that the current unit is Celsius
    $("#cel-symbol").css("color", "#28a745");
    document.getElementById("celsius-label").classList.add("active");

    // Add an onclick event listener to toggle between Celsius and Fahrenheit 
    $("#celsius-label").click(function () {
        if ($("#celsius").is(":checked") === false) {
            $("#celsius").attr("checked", "checked");
            $("#fahrenheit").removeAttr("checked");

            // Set celsius and fahrenheit symbol color
            $("#cel-symbol").css("color", "#28a745");
            $("#fah-symbol").css("color", "#ffffff");

            // Convert current temperature to Celsius
            $("#temperature").html(Math.round((parseInt($("#temperature").text()) - 32) / 1.8));

            // Convert High and Low Temperature section to Celsius
            $("#high").html("Hi: " + (Math.round(((parseInt($("#high").text().substring(4, 6))) - 32) / 1.8)).toString());
            $("#low").html("Lo: " + (Math.round(((parseInt($("#low").text().substring(4, 6))) - 32) / 1.8)).toString());

            // Convert 7 hours weather display to Celsius
            let temperatureSevenHourCelsius = $("#temperature-prediction")["0"]["cells"]["length"];

            for (let d = 0; d < temperatureSevenHourCelsius; d++) {
                $(`#temp${d}`).html((Math.round(((parseInt($(`#temp${d}`).text().substring(0, 2))) - 32) / 1.8)).toString() + "&#xb0;");
            }

            // Convert upcoming seven days temperature to Celsius
            let temperatureSevenDaysCelsius = $(".temp-profile-of-week")["length"];

            for (let f = 0; f < temperatureSevenDaysCelsius; f++) {
                $(`#temp-day${f}-high`).html(Math.round((parseInt($(`#temp-day${f}-high`).text()) - 32) / 1.8).toString());
                $(`#temp-day${f}-low`).html(Math.round((parseInt($(`#temp-day${f}-low`).text()) - 32) / 1.8).toString());
            }

            // Convert feels like weather temperature to Fahrenheit
            $("#feels-like").html(Math.round(((parseInt($("#feels-like").text())) - 32) / 1.8) + "&#xb0;");


        }
    });

    $("#fahrenheit-label").click(function () {

        if ($("#fahrenheit").is(":checked") === false) {
            $("#fahrenheit").attr("checked", "checked");
            $("#celsius").removeAttr("checked");

            // Convert current temperature to Fahrenheit
            $("#temperature").html(Math.round(parseInt($("#temperature").text()) * 1.8 + 32));

            // Set celsius and fahrenheit symbol color
            $("#fah-symbol").css("color", "#28a745");
            $("#cel-symbol").css("color", "#ffffff");


            // Convert High and Low Temperature section to Fahrenheit
            $("#high").html("Hi: " + (Math.round(parseInt($("#high").text().substring(4, 6)) * 1.8 + 32)).toString());
            $("#low").html("Lo: " + (Math.round(parseInt($("#low").text().substring(4, 6)) * 1.8 + 32)).toString());

            // Convert 7 hours weather display to Fahrenheit
            let temperatureSevenHourFahrenheit = $("#temperature-prediction")["0"]["cells"]["length"];

            for (let n = 0; n < temperatureSevenHourFahrenheit; n++) {
                $(`#temp${n}`).html((Math.round(parseInt($(`#temp${n}`).text().substring(0, 2)) * 1.8 + 32)).toString() + "&#xb0;");
            }

            // Convert upcoming seven days temperature to Fahrenheit
            let temperatureSevenDaysFahrenheit = $(".temp-profile-of-week")["length"];

            for (let m = 0; m < temperatureSevenDaysFahrenheit; m++) {
                $(`#temp-day${m}-high`).html(Math.round(parseInt(($(`#temp-day${m}-high`).text()) * 1.8 + 32)).toString());
                $(`#temp-day${m}-low`).html(Math.round(parseInt(($(`#temp-day${m}-low`).text()) * 1.8 + 32)).toString());
            }

            // Convert feels like weather temperature to Fahrenheit
            $("#feels-like").html(Math.round((parseInt($("#feels-like").text())) * 1.8 + 32) + "&#xb0;");
        }


    });

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

        const skycons = new Skycons({ color: "white" });
        skycons.play();
        return skycons.set(iconID, Skycons[icon])
    }

    // to query for location to get coords to query in DarkSky
    $(".country-search").submit(function (event) {
        event.preventDefault();

        // get longitude and latitude value from the hidden input form field
        let queryLng = $("#lng").val();
        let queryLat = $("#lat").val();

        $.ajax({
            type: "GET",
            dataType: "json",
            contentType: "text/plain",
            // using the weatherstack api to perform a query based on input from user to get location details (timezone offset and city)
            url: `${proxy}http://api.weatherstack.com/current?access_key=adcf0b574a906d43986d1d8b229ad309&query=${queryLat},${queryLng}`,

            success: function (response) {
                // add a logic statement to handle the API query result (API query is successful but no result is returned)
                if (response["success"] !== false) {
                    let city = response["location"]["name"];

                    // 101219 added to get timezone
                    let queryTimeZone = response["location"]["timezone_id"];

                    getWeatherDetails(queryLng.toString(), queryLat.toString(), city, queryTimeZone);

                    // Close the modal once form submitted
                    $('#countryModal').modal('hide');

                    // Clear the HTML form once value is submitted
                    $("#autocomplete").val('');

                }
                else if (response["success"] === false) {
                    alert("Error code: " + response["error"]["code"] + ", Error type: " + response["error"]["type"] + ", Info: " + response["error"]["info"]);
                }
            },
            // alert the user on the error response code if the API query fails
            error: function (request, status, error) {
                alert(request.responseText);
            }

        });



    })


    $("#info-button").click(function () {

        // Retrieve weather data from localStorage
        let xDateVal = JSON.parse(localStorage.getItem("xAxisDate"));
        let yTempCelMinVal = JSON.parse(localStorage.getItem("yAxisTempCelMin"));
        let yTempCelAvgVal = JSON.parse(localStorage.getItem("yAxisTempCelAvg"));
        let yTempCelMaxVal = JSON.parse(localStorage.getItem("yAxisTempCelMax"));
        let yTempFahMinVal = JSON.parse(localStorage.getItem("yAxisTempFahMin"));
        let yTempFahAvgVal = JSON.parse(localStorage.getItem("yAxisTempFahAvg"));
        let yTempFahMaxVal = JSON.parse(localStorage.getItem("yAxisTempFahMax"));
        
        // Get city name
        let weatherLocation = localStorage.getItem("currentCity");

        // To display the title for the plot in the modal title section - default option
        let sevenDays = $("#option7Days-label").text();
        $("#past7DaysTemperatureTrend").html(`${sevenDays} temperature trend in ${weatherLocation}`);

        function historicalWeatherData(xDateVal, yTempCelAvgVal, yTempCelMinVal, yTempCelMaxVal, yTempFahMinVal, yTempFahAvgVal, yTempFahMaxVal) {
            var trace1 = {
                x: xDateVal,
                y: yTempCelAvgVal,
                mode: 'lines+markers',
                name: 'Avg (℃)',
                marker: {
                    size: 8
                }
            };

            var trace2 = {
                x: xDateVal,
                y: yTempCelMinVal,
                mode: 'lines+markers',
                name: 'Min (℃)',
                marker: {
                    size: 8
                }
            };

            var trace3 = {
                x: xDateVal,
                y: yTempCelMaxVal,
                mode: 'lines+markers',
                name: 'Max (℃)',
                marker: {
                    size: 8
                }
            };

            var trace4 = {
                x: xDateVal,
                y: yTempFahAvgVal,
                mode: 'lines+markers',
                name: 'Avg (℉)',
                marker: {
                    size: 8
                }
            };

            var trace5 = {
                x: xDateVal,
                y: yTempFahMinVal,
                mode: 'lines+markers',
                name: 'Min (℉)',
                marker: {
                    size: 8
                }
            };

            var trace6 = {
                x: xDateVal,
                y: yTempFahMaxVal,
                mode: 'lines+markers',
                name: 'Max (℉)',
                marker: {
                    size: 8
                }
            };

            let data = [trace1, trace2, trace3, trace4, trace5, trace6];

            return data;

        };

        var layout = {
            autosize: true,
            xaxis: {
                title: {
                    text: 'Date'
                },
            },
            yaxis: {
                title: {
                    text: 'Temperature (℃ / ℉)'
                }
            }

        };

        let result = historicalWeatherData(xDateVal, yTempCelAvgVal, yTempCelMinVal, yTempCelMaxVal, yTempFahMinVal, yTempFahAvgVal, yTempFahMaxVal);

        $('#pastHistoryData').on('shown.bs.modal', function (e) {
            Plotly.newPlot('myDiv', result, layout);
        })

        // Toggle between 3 days, 5 days and 7 days temperature trend
        // Past 3 days
        $("#option3Days-label").click(function () {
            if ($("#option3Days").is(":checked") === false) {

                let threeDays = $("#option3Days-label").text();
                $("#past7DaysTemperatureTrend").html(`${threeDays} temperature trend in ${weatherLocation}`);
                $("#option3Days").attr("checked", "checked");
                $("#option5Days").removeAttr("checked");
                $("#option7Days").removeAttr("checked");

                // Set the days selected color
                $("#option3Days-label").css("color", "#ffff33");
                $("#option5Days-label").css("color", "#ffffff");
                $("#option7Days-label").css("color", "#ffffff");

                let past3Days = historicalWeatherData(xDateVal.slice(4, 7), yTempCelAvgVal.slice(4, 7), yTempCelMinVal.slice(4, 7), yTempCelMaxVal.slice(4, 7), yTempFahMinVal.slice(4, 7), yTempFahAvgVal.slice(4, 7), yTempFahMaxVal.slice(4, 7));
                var layout = {
                    autosize: true,
                    xaxis: {
                        title: {
                            text: 'Date'
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'Temperature (℃ / ℉)'
                        }
                    }

                };

                Plotly.newPlot('myDiv', past3Days, layout);
            }
        });

        // Past 5 days
        $("#option5Days-label").click(function () {
            if ($("#option5Days").is(":checked") === false) {

                let fiveDays = $("#option5Days-label").text();
                $("#past7DaysTemperatureTrend").html(`${fiveDays} temperature trend in ${weatherLocation}`);
                $("#option5Days").attr("checked", "checked");
                $("#option3Days").removeAttr("checked");
                $("#option7Days").removeAttr("checked");

                // Set the days selected color
                $("#option3Days-label").css("color", "#ffffff");
                $("#option5Days-label").css("color", "#ffff33");
                $("#option7Days-label").css("color", "#ffffff");

                let past5Days = historicalWeatherData(xDateVal.slice(2, 7), yTempCelAvgVal.slice(2, 7), yTempCelMinVal.slice(2, 7), yTempCelMaxVal.slice(2, 7), yTempFahMinVal.slice(2, 7), yTempFahAvgVal.slice(2, 7), yTempFahMaxVal.slice(2, 7));
                var layout = {
                    autosize: true,
                    xaxis: {
                        title: {
                            text: 'Date'
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'Temperature (℃ / ℉)'
                        }
                    }

                };

                Plotly.newPlot('myDiv', past5Days, layout);
            }
        });

        // Past 7 days
        $("#option7Days-label").click(function () {
            if ($("#option7Days").is(":checked") === false) {

                let pastSevenDays = $("#option7Days-label").text();
                $("#past7DaysTemperatureTrend").html(`${pastSevenDays} temperature trend in ${weatherLocation}`);
                $("#option7Days").attr("checked", "checked");
                $("#option3Days").removeAttr("checked");
                $("#option5Days").removeAttr("checked");

                // Set the days selected color
                $("#option3Days-label").css("color", "#ffffff");
                $("#option5Days-label").css("color", "#ffffff");
                $("#option7Days-label").css("color", "#ffff33");

                let past7Days = historicalWeatherData(xDateVal, yTempCelAvgVal, yTempCelMinVal, yTempCelMaxVal, yTempFahMinVal, yTempFahAvgVal, yTempFahMaxVal)
                var layout = {
                    autosize: true,
                    xaxis: {
                        title: {
                            text: 'Date'
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'Temperature (℃ / ℉)'
                        }
                    }

                };

                Plotly.newPlot('myDiv', past7Days, layout);
            }
        });

        // Reset temperature trend to 7 days if modal is closed
        $('#pastHistoryData').on('hidden.bs.modal', function (e) {

            document.getElementById("option7Days-label").classList.add("active");
            document.getElementById("option3Days-label").classList.remove("active");
            document.getElementById("option5Days-label").classList.remove("active");

            // let resetPastSevenDays = $("#option7Days-label").text();
            // $("#past7DaysTemperatureTrend").html(`${resetPastSevenDays} temperature trend in ${weatherLocation}`);
            $("#option7Days").attr("checked", "checked");
            $("#option3Days").removeAttr("checked");
            $("#option5Days").removeAttr("checked");

            // // Reset the days selected color
            $("#option3Days-label").css("color", "#ffffff");
            $("#option5Days-label").css("color", "#ffffff");
            $("#option7Days-label").css("color", "#ffff33");
        })
    });
})