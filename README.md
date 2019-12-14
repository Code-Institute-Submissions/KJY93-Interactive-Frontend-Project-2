# Milestone Project 2: Interactive Front End Development

## WeatherRadar

This project focuses on the development of a sleek and minimalistic weather application called WeatherRadar.
Combining 3 weather APIs (DarkSky, WeatherStack, Weather), IP address API (ipapi) and the Google Maps API itself, this weather application made it easy for users to check for the past, current and upcoming weather forecast of any country at any point of time.

## Demo



## Project Strategy and Scope
### User stories
1. User would like to check out the temperature of a location
   Features to implement: To include a search form that allows user to key in a location of their choice to then to be used to query for the weather data

2. User would like to know the location of the places that they have used to query for the weather data
   Features to implement: To include a google map with a marker to identify the location that have used to query for the weather data

3. User would like to know the temperature in Celsius / Fahrenheit
   Features to implement: To include a toggle button that allows user to toggle between different temperture units

4. User would like to know the past historical temperature data in the location that they have searched for
   Features to implement: To include a plot showing the user the temperature trend for the past 3 days, 5 days and 7 days

5. User would like to know the current time at the location that they have used to query for the weather data
   Features to implement: To include the local time of the location that they have used to query for the weather data

6. User would like to know the weather at their current location upon loading up of the web application
    Features to implement: To display the weather data of the users at their current location once the weather application fires up 

7. User would like the background to change depending on the weather condition
   Features to implement: To change the background color using CSS based on the weather condition returned from the DarkSky JSON object

## Project Structure
### a. Overview
This weather application is divided into 3 main sections, namely the navbar section, main body section and also the footer section.

At the navbar section, user will be able to find the brand-logo at the left hand side whereas on the right hand side, the user will be
able to able to find the temperature toggle button.

At the main body section, user will find weather data at the current moment. A little bit down, user will be able to find the weather forecast for the upcoming 7 hours, 7 days and a summary of other weather parameters which includes visibility, UV index, wind speed, just to name a few.  

### b. Wireframes
https://drive.google.com/file/d/1HsY5j_XmliTh1xy0NItERGpIGtXE0pfj/view?usp=sharing (small screen device)
https://drive.google.com/file/d/1HsY5j_XmliTh1xy0NItERGpIGtXE0pfj/view?usp=sharing (large screen device)

## Project Skeleton
### a. Existing Features
The weather application was designed with Bootstrap grid design and mobile responsiveness in mind. 

Current features implemented:
i. There is a temperature toggle button on the upper right hand corner of the weather application that allows user to toggle the temperature in the waether application between Fahrenheit and Celsius. The temperature currently selected by the user will be displayed in green.

ii. There is a current location logo at the bottom left corner of the weather application. Upon clicking on it, user will be shown the map with a marker on it to indicate the location that they have used to query for the weather data. In addition, user will also be able to toggle between satellite imagery / street map mode to change the display of the map. Zoom in and the zoom out button on the map also allows the user to have a better glimpse of the surrounding location.

iii. There is a magnifying glass search icon beside the city name. Upon clicking on it, a modal form will be popped up allowing the user to key in a location of their choice. Once the form has been submitted, the modal form will be automatically closed. The longtitude and latitude of the coordinates of the location in the form will be obtained using the google maps autocomplete lat and lng function. Upon obtaining the longitude and latitude coordinates, it will be appended as a hidden input to the "country-search" form so that later on if the backend of the weather application has been setup, it could be send via POST method to the database to have the data persisted. The hidden input is appended to the form in the following format:

For longitude:
`<input type="hidden" id="lng" name="lng" value=${lng}>`

For latitude:
`<input type="hidden" id="lat" name="lat" value=${lat}>`

The WeatherStack API, http://api.weatherstack.com/current?access_key=YOUR_API_KEY&query=latitude,longitude will then use the latitude and longitude value of the above input tag to make a GET query to obtain the weather forecast of that particular location.

iv. The current time displaying on the weather application is obtained using moment.js based on the unix time format and the timezone of the particular location passed into the moment object.

v. There is an information logo at the bottom right of the weather application. User will be able to click on it and be displayed with the past historical temperature trend. On this plotly plot that is displayed, user will be able to check out the min, average and max temperature in both Celsius and Fahrenheit on the same plot. Another additional feature of this plot is that it enables the user to take a snapshot of the current plot. The past historical weather data is obtained through the Weather API, by far the only API that provides 7 days of free historical temperature trend. The API GET format query used is as follow: 
- http://api.weatherapi.com/v1/history.json?key=YOUR_API_KEY&q=latitude,longitude&dt=startWeekDate&end_dt=currentDate

vi. For every load of the page, the weather application will detect the user's current location using the ipapi API. The longitude and latitude coordinates is then passed to DarkSky API to obtain the weather data of that particular location the user is currently in.
The ipapi and DarkSky API GET query is as follow: 
- https://ipapi.co/json/
- https://api.darksky.net/forecast/YOUR_API_KEY/latitude,longitude?units=si
Note: To get around the CORS error during the DarkSky API query, the API query has to be preceded with https://cors-anywhere.herokuapp.com/ API to enable cross origin request.

vii. The background of the weather application will change according to the weather condition returned from the JSON object from DarkSky. Currently, the weather condition that I have configured for the background color change are cloudy, clear-day, clear-night, rain, sleet and snow.

### b. Features to be implemented in the future
For the future development of this weather application, I would like to setup the backend side of the web application to use session object so that each users will be able to customize their weather application to shows weather data at locations of their choices.
In addition to that, I would also like to implement a more realistic weather condition to display raining effect, snowing effect for instance. 

## Project Surface
The color scheme chosen for this web application are as follow: 
- light gray for the navbar and footer
- green for the search and submit button
- linear gradient for the main body section and this depends on the weather condition returned by the
  API GET query. Snapshots of background color for a clear day, clear night, rain and cloudy are as follow:

![Clear Day|300x463](https://github.com/KJY93/Interactive-Frontend-Project-2/blob/master/static/images/clear-day.PNG)
![Clear Night|300x463](https://github.com/KJY93/Interactive-Frontend-Project-2/blob/master/static/images/clear-night.PNG) 
![Rain|300x463](https://github.com/KJY93/Interactive-Frontend-Project-2/blob/master/static/images/rain.PNG) 
![Cloudy|300x463](https://github.com/KJY93/Interactive-Frontend-Project-2/blob/master/static/images/cloudy.PNG)

## Technologies Used
1. HTML5 was the markup language used for structuring the content of the web application
2. CSS3 was a style sheet language used to format the outlook of the web application
3. JavaScript was the programming language to add front end interactivity to the web application
4. jQuery is a JavaScript library. It was used to manipulate the HTML DOM element, event handling, animation and AJAX - https://jquery.com/
5. Bootstrap 4 was the framework used to make the application responsive - https://getbootstrap.com/
6. Moment.js was used to parse unix format date in the JSON object to a human readable datetime - https://momentjs.com/
7. Plotly.js was used to plot the historical temperature trend - https://plot.ly/
8. Skycons.js was used to animate the weather icon - https://darkskyapp.github.io/skycons/
9. Postman was used to test out the API query
10. Github was used to deploy the web application    

## APIs Used
1. ipapi - https://ipapi.co/ 
2. DarkSky - https://darksky.net/dev
3. WeatherStack - https://weatherstack.com/
4. Weather API - https://www.weatherapi.com/
5. Google Maps API - https://developers.google.com/maps/documentation/javascript/places

Note: 
- There are 3 weather APIs being used. DarkSky itself does not show the city in its JSON result, therefore WeatherStack API is needed to get the city name to be displayed in the web application. Weather API, on the other hand, is used due to the fact that it is the only free API that can provide free historical weather data.

- Error response code are added for the WeatherStack API and Weather API. Did not manage to find the error code response for DarkSky API and ipapi in their documentations. Link to WeatherStack and Weather API error response code: https://weatherstack.com/documentation, https://www.weatherapi.com/docs/

## Testing 
### Responsiveness
The web application was tested across multiple device screen sizes (small: iPhone 5, Galaxy S5, Pixel 2, medium: iPad, large: iPad Pro). Website scale responsively according to the device screen when tested in the Developer tools.

### Browser compatibility
The web application was tested and is compatible on Chrome, Opera and Firefox.

### Test Cases
| Test Case     | Description                   | Outcome  |
| ------------- |-----------------------------  | -------- |
| 1             |  When user clicks on temperature toggle button, the temperature data will toggle between Celsius and Fahrenheit. The selected temperature unit will be displayed in green. | Pass    |
| 2             | When user clicks on the location logo on the bottom left , a map will be popped up  showing the current location with marker that is used to query for the weather data |   Pass     |
| 3             | When user clicks on the information logo on the bottom right, the past historical weather data will be popped up. The default historical weather display will be 7 days. User will be able to toggle between 3 days, 5 days and 7 days if they wish to. The selected days to display the temperture trend will be displayed in yellow. |    Pass    |
| 4            |  In the past historical weather data, user will be able to view the min, average, max temperature trend in both Celsius and Fahrenheit | Pass    |
| 5            | User should see the brand logo on the top left of the navbar, temperature unit toggle on the right of the navbar. | Pass    |
| 6           | User should see the location logo at the bottom left of the footer, copyright logo on the center of the footer and information logo on the bottom right of the navbar. | Pass    |
| 7           | User should see the main body section background-color change. Note, this will depends on the weather condition returned from the API query and the condition to change the background-color as pre-configured in the script.js file | Pass    |
| 8           | User should see the local time of the location that they have used to query for the weather data. | Pass    |

## Bugs Discovered
No bugs found.

## Acknowledgements
Weather icon animation: 
- Source code adapted from https://darkskyapp.github.io/skycons/ was used to animate the weather icon

Background-color:
- The background-color changes based on the weather condition returned from the API query. The css for the background-color were obtained from the following:
    i. https://cssgradient.io/gradient-backgrounds/
    ii. https://gradienthunt.com
    iii. https://cssgradient.io/gradient-backgrounds

Fonts: 
- Fonts used are from https://fonts.google.com/

Font Awesome:
- Icons from font awesome are used fot the magnifying search icon, location icon and the information icon for this web application. https://fontawesome.com/ 

Favicon:
- Logo from favicon are used as the logo for the tab browser. https://favicon.io/emoji-favicons/

Note: This is for educational purpose only and not for commercial use.

