// URL vars
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const ICON_BASE_URL = "https://openweathermap.org/img/w/";

// localstorage vars
var aPreviousSearches = []; // Array to contain searches
var sCurrentSearch = "";

// Element vars
var eForecastField = $("#forecastField");
var eSearchField = $("#searchField");
var eHistoryField = $("#historyField");

// Fields for current day panel
var aeTodaysWeather = [ $("#cityField"),
                        $("#dateField"),
                        $("#iconField"),
                        $("#tempField"),
                        $("#windField"),
                        $("#humidField"),
                        $("#uvIndexField"),
                        $("#errorField") ];

// Search Button
var eSearchButton = $("#searchBtn");

function clearHistoryListItems() {
    eHistoryField.empty();
}

// Clear all fields in the Current Day panel
function clearCurrentDayPanel() {

    aeTodaysWeather[1].text("");
    aeTodaysWeather[2].attr("style", "visibility:hidden;")
    aeTodaysWeather[3].text("");
    aeTodaysWeather[4].text("");
    aeTodaysWeather[5].text("");
    aeTodaysWeather[6].text("");
    aeTodaysWeather[7].text("");
}

// Clear out the forecast panel, to prevent doubling
function clearForecastListItems() {
    eForecastField.empty();
}

// Let's the user know if an error ocurred
function handleBadResponse(status) {

    if (status === 404) { // Handle bad search

        aeTodaysWeather[0].text("Could not find: " + eSearchField.val());
        aeTodaysWeather[7].attr("style", "display:block;");
        aeTodaysWeather[7].text("Please try again. You can search using [city name], [city name, country code], [city name, state code, country code], or [zip code]");

    } else if (status === 500) { // Handle server side error

        aeTodaysWeather[0].text("Server Error: 500");
        aeTodaysWeather[7].attr("style", "display:block;");
        aeTodaysWeather[7].text("Please try again later.");
    }
}

// Create cards for the next 5 days
function populateForecastCards(oDays) {

    // If the list already has cards, clear it
    if (eForecastField.children().length > 0) {

        clearForecastListItems();
    }

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

function populateHistoryList() {

        // If the list already has items, clear it
        if (eHistoryField.children().length > 0) {

            clearHistoryListItems();
        }

        // If the user has made a second search
        if (aPreviousSearches.length > 0) {

            // Iterate through all previous searches
            for (var index = 0; index < aPreviousSearches.length; index++) {

                // Create elements
                var eListItem = $("<li>");
                var eListLink = $("<button>");

                // Set Button attributes
                eListLink.attr("data-query", aPreviousSearches[index]);
                eListLink.text(aPreviousSearches[index]);

                // Add the Button to the list
                eListItem.append(eListLink);
                eHistoryField.append(eListItem);
            }
        }
}

// Use latitude and longitude from last call to get 5 day forecast data
function getForecast(lat, lon) {

    // Construct the request URL
    var sRequestSecondary = BASE_URL + "onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + API_KEY;

    // Attempt second call
    fetch(sRequestSecondary).then(function (response) {

        return response.json();

    }).then(function (data) {

        aeTodaysWeather[1].text(data.daily[0].dt); // Date
        aeTodaysWeather[2].attr("src", ICON_BASE_URL + data.daily[0].weather[0].icon + ".png"); // Weather icon
        aeTodaysWeather[2].attr("alt", data.current.weather[0].description); // Set the alt text
        aeTodaysWeather[2].attr("style", "visibility:visible;"); // Show the icon
        aeTodaysWeather[3].text(data.current.temp + " F"); // Temperature (Choose temp by time?)
        aeTodaysWeather[4].text(data.current.wind_speed + " MPH"); // Wind Speed
        aeTodaysWeather[5].text(data.current.humidity + "%"); // Humidity
        aeTodaysWeather[6].text(data.current.uvi); // UV index

        // Only send the next 5 days to populateForecastCards
        var aFiveDays = data.daily.slice(1, 6); // I tested this parameter set with jsfiddle
        populateForecastCards(aFiveDays);
    });
}

// Used to get latitude and longitude from city search
function getWeather(request) {

    // Hide the error field
    aeTodaysWeather[7].attr("style", "display:none;");

    // Attempt search of OWM server
    fetch(request).then(function (response) {

        // If bad response
        if (response.status > 400) {

            // Clear everything
            clearCurrentDayPanel()
            clearForecastListItems();

            // Write error to screen
            handleBadResponse(response.status);
        }

        return response.json();

    }).then(function (data) { 

        if (Number(data.cod) < 300) { // If there's something in data
            aeTodaysWeather[0].text(data.name + ", " + data.sys.country); // City name

            // If this isn't the first search
            if (sCurrentSearch !== "") {

                // Check for duplicates
                if (!aPreviousSearches.includes(sCurrentSearch)) {

                    // If no duplicates, add to array
                    aPreviousSearches.push(sCurrentSearch);
                }
            }

            // Set the current search element
            sCurrentSearch = data.name;

            // Display previous searches
            populateHistoryList();

            getForecast(data.coord.lat, data.coord.lon); // Get 5 day forecast
        }
    });
}

// When the user clicks the "Search" button, use the text in the search field
// to get the weather from the API call
eSearchButton.click(function () {

    // Get the text from the search bar
    var sCityInput = eSearchField.val();
    eSearchField.val(""); // Clear the search bar

    // Construct the request URL
    var sRequest = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sCityInput;
    getWeather(sRequest); // Get data from OWM

});

// When a history list item button is clicked
eHistoryField.click(function (event) {

    // What was clicked?
    var eClickedElement = event.target; // ! NOT a jQuery object!

    // Make sure it's a button being clicked
    if (eClickedElement.tagName === "BUTTON") {

        // Get city name from Button
        var sPreviousSearch = eClickedElement.getAttribute("data-query");

        // Construct the request URL
        var sRequest = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sPreviousSearch;
        getWeather(sRequest); // Get data from OWM
    }
})