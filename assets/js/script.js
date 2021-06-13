// URL vars
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
var sCityName = "fort worth,tx,us";
var sRequestInitial = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sCityName;

// Element vars
var aeTodaysWeather = [ $("#cityField"),
                        $("#dateField"),
                        $("#tempField"),
                        $("#windField"),
                        $("#humidField"),
                        $("#uvIndexField") ];

var eForecastField = $("#forecastField");

function populateForecastCards(oDays) {

    // For each of the days passed in, create a card
    for (var index = 0; index < oDays.length; index++) {

        // Create the list item
        var eDay = $("<li>");
        eDay.addClass("column is-12-desktop is-one-fifth-widescreen");

        // Create the container
        var eBox = $("<div>");
        eBox.addClass("box content");

        // Create the Header
        var eHeader = $("<h3>");
        eHeader.addClass("subtitle is-3");
        eHeader.text("Date: "); // Use moment to convert UNIX timestamp

        // Icon representing weather state
        var eIcon = $("<i>");
        eIcon.text();
        eIcon.text(oDays[index].weather[0].icon);

        // Temperature display
        var eTemp = $("<p>");
        eTemp.text("Temp: " + oDays[index].temp.day + " F");

        // Wind speed display
        var eWind = $("<p>");
        eWind.text("Wind: " + oDays[index].wind_speed + " MPH");

        // Humidity display
        var eHumid = $("<p>");
        eHumid.text("Humidity: " + oDays[index].humidity + "%");

        // Add data fields to container
        eBox.append(eHeader);
        eBox.append(eIcon);
        eBox.append(eTemp);
        eBox.append(eWind);
        eBox.append(eHumid);

        // Add container to list item
        eDay.append(eBox);

        // Add list item to list container
        eForecastField.append(eDay);
    }
}

function getForecast(lat, lon) {

    var sRequestSecondary = BASE_URL + "onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + API_KEY;

    fetch(sRequestSecondary).then(function (response) {

        return response.json();

    }).then(function (data) {

        var aFiveDays = data.daily.slice(1, 6); // I tested this parameter set with jsfiddle
        populateForecastCards(aFiveDays)
        console.log(data);
    });
}

function getWeather(request) {

    fetch(request).then(function (response) {

        if (response.status > 400) {
            return;
        }
        return response.json();

    }).then(function (data) {

        getForecast(data.coord.lat, data.coord.lon);
    });
}

getWeather(sRequestInitial);
