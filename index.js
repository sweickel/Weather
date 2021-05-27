
//function to take location and return weather for that location
let currentUnit = "imperial";


const key = "&APPID=" + config.API_KEY;
async function getWeather(location, unit) {
    const newLocation = location.split(" ").join("");
    const newUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + newLocation + "&units=" + unit + key;   
    try {
        //work on pulling forecast data and displaying after current data so lat and lon can be pulled from first api call

        const response = await fetch(newUrl, {mode : 'cors'});
        const searchData = await response.json();
        
        
        function processData() {
            let data = {};
            data.city = searchData.name;
            data.weather = searchData.weather[0].main;
            data.feels_like = searchData.main.feels_like;
            data.humidity = searchData.main.humidity;
            data.pressure = searchData.main.pressure;
            data.temp = Number.parseFloat(searchData.main.temp).toFixed(0);
            data.temp_max = Number.parseFloat(searchData.main.temp_max).toFixed(0);
            data.temp_min = Number.parseFloat(searchData.main.temp_min).toFixed(0);
            data.wind = searchData.wind;
            data.visibility = searchData.visibility;
            data.lon = searchData.coord.lon;
            data.lat = searchData.coord.lat;
            
            console.log(data);

            async function getForecast() {
                const forecastCall = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.lat + "&lon=" + data.lon + "&exclude=minutely" + "&units=" + currentUnit + key;
                const response2 = await fetch(forecastCall, {mode : 'cors'});
                const forecastData = await response2.json();
                const todaysData = forecastData.daily[0]; 
                let forecast = {};
                forecast.max = todaysData.temp.max;
                forecast.min = todaysData.temp.min;
                forecast.humidity = todaysData.humidity;
                forecast.windspeed = todaysData.wind_speed;
                forecast.windgust = todaysData.wind_gust
                forecast.pressure = todaysData.pressure;
                forecast.sunrise = todaysData.sunrise;
                forecast.sunset = todaysData.sunset;
                forecast.uv = todaysData.uv;
                forecast.rain = todaysData.rain;
                forecast.dew_point = todaysData.dew_point;
                console.log(forecastData);

                try {
                    let fData = {};
                console.log(forecast);
                displayData(data, forecastData, forecast);
                } catch {
                    console.log("Error displaying data.");
                }                
            }
            getForecast();            
        }
        processData();        
    
    } catch (error) {
        console.log("Please try again");
    }
}


function dayToText(day) {
    switch(day) {
        case 0:
            return "SUN";
            break;
        case 1:
            return "MON";
            break;
        case 2:
            return "TUE";
            break;
        case 3:
            return "WED";
            break;
        case 4:
            return "THU";
            break;
        case 5:
            return "FRI";
            break;
        case 6:
            return "SAT";
            break;
        default:
            console.log("error in switch");
    }    
}







//function to display data in DOM
async function displayData(data, forecastData, forecast) {
    const weatherCard = document.getElementById("display");
    const weatherImg = document.getElementById("icon");
    const city = document.getElementById("cityinfo");
    const curTime = document.getElementById("time");
    const temp = document.getElementById("currentTemp");
    const description = document.getElementById("description");
    const dt = new Date();
    const utcDate = dt.toUTCString();
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + data.city + key;
    try {
        const response = await fetch(url);
        const searchData = await response.json();
        weatherImg.src = "http://openweathermap.org/img/wn/" + searchData.weather[0].icon + "@2x.png";

        //add logic to grab data from parameter from displayData function and display on DOM
        weatherCard.style.display = "flex";
        city.textContent = "Weather in " + data.city;
        curTime.textContent = "Updated " + moment(utcDate).format('MMMM Do YYYY, h:mm:ss a');
        temp.textContent = data.temp + "°";
        
        
        description.textContent = data.weather;

        //loops through and populates Outlook
        document.getElementById("outlook_title").textContent = "Outlook for " + data.city + " Today";
        for (let i = 0; i < 8; i++) {
            let stat = document.getElementById("stat_" + i);
            let value = document.getElementById("value_" + i);
            function popStat(a, b) {
                stat.textContent = a;
                if (currentUnit === "imperial" && a === "Wind")  {            
                    value.textContent = b + "mph";
                } else if (currentUnit === "metric" && a === "Wind") {
                    value.textContent = b + "kph";
                } else {                    
                    value.textContent = b;
                }                
            }
            
            const minmax = forecast.max + " " + forecast.min;
            const windspeed = Number.parseFloat(Math.floor(forecast.windspeed)).toFixed(0) + "-" + Number.parseFloat(Math.floor(forecast.windgust)).toFixed(0);
            const rise = moment(forecast.sunrise*1000).format('LT');
            const set = moment(forecast.sunset*1000).format('LT');
            const sun =  rise + " " + set;
            switch(i) {
                case 0:
                    popStat("High Low", minmax);
                    break;
                case 1:
                    popStat("Humidity", forecast.humidity + "%");
                    break;
                case 2:
                    popStat("Wind", windspeed);
                    break;
                case 3:
                    if (forecast.rain === undefined) {
                        popStat("Precipitation", "0%");
                    } else {
                        popStat("Precipitation", forecast.rain + "%");
                    }
                    break;
                case 4:
                    popStat("Sunrise Sunset", sun);          
                    break;
                case 5:
                    if (forecast.uv === undefined) {
                        popStat("UV Index", 0 + " of 10");
                    } else {
                        popStat("UV Index", forecast.uv + " of 10");
                    }
                    break;
                case 6: 
                    popStat("Pressure", Math.floor(forecast.pressure*0.02952998751).toFixed(2) + " in");  
                    break;
                case 7:
                    popStat("Dew Point", forecast.dew_point.toFixed(0) + "°");
                    break;
                default:
                    console.log("fill in the rest");
            }
            
        }

        //loops through and populates 4 day forecast
        for (let i = 0; i < 4; i++) {
            let dt = document.getElementById("d" + i);
            let min = document.getElementById("min" + i);
            let max = document.getElementById("max" + i);
            let icon = document.getElementById("icon" + i);
            let desc = document.getElementById("desc" + i);
            const today = new Date();
            let day = today.getDay();
            if (day === 4 && i === 3) {
                dt.textContent = dayToText(0);    
            } else {
                dt.textContent = dayToText(day + i);
            }
            

            
            min.textContent = Number.parseFloat(forecastData.daily[i].temp.min).toFixed(0);
            max.textContent = Number.parseFloat(forecastData.daily[i].temp.max).toFixed(0);
            icon.src = "http://openweathermap.org/img/wn/" + forecastData.daily[i].weather[0].icon + "@2x.png";
            desc.textContent = forecastData.daily[i].weather[0].main;
        }
        
    } catch (error) {
        console.log("Data cannot be displayed");
    }   
}

//sets event listeners for search bar and buttons
function init() {
    const btnC = document.getElementById("c");
    const btnF = document.getElementById("f");
    const searchBar = document.getElementById("searchBar")
    const searchBtn = document.getElementById("search");
    
    
    
    //function for searchbar
    function searchWeather() {
        let loc = searchBar.value;
        const nav = document.querySelector("nav");
        nav.style.height = "120px";
        if (loc === "") {
            alert("Please enter a city to search");
        } else {
            getWeather(loc,currentUnit);
        }
    }
    
    //function to change temperature units globally
    function changeUnit(unit) {
        if (unit === "metric") {
            currentUnit = "metric";
            btnF.classList.remove("active");
            btnC.classList.add("active"); 
        } else if (unit === "imperial") {
            currentUnit = "imperial";
            btnC.classList.remove("active");
            btnF.classList.add("active");
        }        
    }

    //--EVENT LISTENERS--//
    //event listeners for search bar and button
    searchBtn.addEventListener("click", (event) => {
        searchWeather();
    });
    searchBar.addEventListener("keydown", (event) => {
        if (event.keyCode === 13) {
            searchWeather();
        } 
    });

    //event listeners for changing temperature units
    btnC.addEventListener("click", (event) => {
        changeUnit("metric");
    });
    btnF.addEventListener("click", (event) => {
        changeUnit("imperial");
    });
}
window.addEventListener("load", (event) => {
init();
});

