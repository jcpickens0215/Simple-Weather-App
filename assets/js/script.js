const BASE_URL = "https://api.openweathermap.org/data/2.5/";
var sRequestInitial = BASE_URL + "weather?" + "appid=" + API_KEY + "&units=imperial" + "&q=Dallas,tx,us";

function getWeather(request) {

    var nLatitude = "";
    var nLongitude = "";

    fetch(request).then(function (response) {

        return response.json();

    }).then(function (data) {

        console.log(data);
        nLatitude = data.coord.lat;
        nLongitude = data.coord.lon;

        getForecast(nLatitude, nLongitude);
    });
}

function getForecast(lat, lon) {

    var sRequestSecondary = BASE_URL + "onecall?" + "lat=" + lat + "&lon=" + lon + "&units=imperial" +"&appid=" + API_KEY;

    fetch(sRequestSecondary).then(function (response) {

        return response.json();

    }).then(function (data) {

        console.log(data);
    });
}

getWeather(sRequestInitial);
