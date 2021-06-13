// URL vars
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const ICON_BASE_URL = "https://openweathermap.org/img/w/";
var sCityName = "fort worth,tx,us";
var sRequestInitial = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sCityName;

// Element vars
var aeTodaysWeather = [ $("#cityField"),
                        $("#dateField"),
                        $("#iconField"),
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
        var eIcon = $("<img>");
        eIcon.attr("src", ICON_BASE_URL + oDays[index].weather[0].icon + ".png")
        eIcon.attr("alt", oDays[index].weather[0].description); // Set the alt text

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

        aeTodaysWeather[1].text(data.daily[0].dt); // Date

        aeTodaysWeather[2].attr("src", ICON_BASE_URL + data.daily[0].weather[0].icon + ".png"); // Weather icon
        aeTodaysWeather[2].attr("alt", data.daily[0].weather[0].description); // Set the alt text

        aeTodaysWeather[3].text(data.daily[0].temp.day + " F"); // Temperature (Choose temp by time?)
        aeTodaysWeather[4].text(data.daily[0].wind_speed + " MPH"); // Wind Speed
        aeTodaysWeather[5].text(data.daily[0].humidity + "%"); // Humidity
        aeTodaysWeather[6].text(data.daily[0].uvi); // UV index

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

        // console.log(data);
        aeTodaysWeather[0].text(data.name + ", " + data.sys.country); // City name
        getForecast(data.coord.lat, data.coord.lon);
    });
}

getWeather(sRequestInitial);
