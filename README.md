# FFBT-Server-Heroku
This repository includes all of the relevant code for creating and running the backend/server code for the Family Friendly Brewery Tracker (also known as "FamBrews") project created for the Computer Science Junior Design (CS 3311/CS 3312) class at the Georgia Institute of Technology. This project is currently being run/hosted on a live server running on Heroku. Any changes merged to this repository will force a new build of the development instance of the server on the aforementioned Heroku instance. Once changes have been adequately tested and shown to work correctly, they can be promoted to the production instance of the Heroku server from within Heroku itself. The server is primarily running on a Node.js implementation, which is connected to a MongoDB storage instance for storing all Users, Breweries, user ResetTokens, and Reviews that a user may leave on an individual Brewery. It is also connected to an AWS instance for uploading/downloading images associated with a User's account, or a Brewery instance. See below for more information regarding all implementations.

# Contents



# Install Guide
## Pre-Requisites:
This server component was built using Node.js, and all associated Node packages were installed and managed using the NPM (Node Package Manager).  
The current installed version of Node.js (used to both develop this project, and which is currently running on the Heroku server) is **v12.4.0**  
The current installed version of NPM is **6.4.1**  

To install each of these, visit the following link: https://nodejs.org/en/download/  
Follow all setup instructions for your specific machine.  
**NOTE: the current 'recommended' version of Node.js is 12.13.1 -- this shouldn't cause any known compatibility issues with this project.**

## Dependent Node Packages:
The following list contains all of the currently-installed/-used Node packages in the backend portion of this project. Note, to install each individually you can use the following syntax from your command line: "npm -i __name_of_package__"  
To install all required packages at once, "cd" into the folder created by cloning this repository and run the following from your command line: "npm -i"
### Packages: 
- aws-sdk: v2.559.0
- bcrypt: v3.0.6
- body-parser: v1.19.0
- express: v4.17.1
- flat: v4.1.0
- fuzzball: v1.3.0
- geo-tz: v5.0.5
- jsonwebtoken: v8.5.1
- moment: v2.24.0
- moment-timezone: v0.5.26
- mongoose: v5.7.5
- node-geocoder: v3.24.0
- nodemailer: v6.3.0

## Build Instructions:
At this time, no specific building needs to be done by the user in order to run this application. Each time changes are merged into the Master branch of this repository, the development branch of the associated Heroku application will re-build itself with all changes made. To learn more about Heroku, see the following links:
- Managing Multiple Environments: https://devcenter.heroku.com/articles/multiple-environments
- Config Vars: https://devcenter.heroku.com/articles/config-vars
- Running Heroku Locally (for local development/testing): https://devcenter.heroku.com/articles/heroku-local

To learn more about MongoDB, refer to the following links:
- Running Locally: https://stackoverflow.com/questions/18452023/installing-and-running-mongodb-on-osx

## Run Instructions:
To run the project locally, see the above links for running Heroku and MongoDB locally. To run locally, or to test backend function calls on the development server, it's strongly advised that you install Postman on your machine. Download here: https://www.getpostman.com/downloads/

For some information on using Postman, please refer to their docs here: https://learning.getpostman.com/?_ga=2.131658572.237368632.1574266369-119785825.1564078300

## Troubleshooting:
The most-often-occurring issue related to the backend server is in unhandled promise rejections, due to the fact that much of our project handles various tasks asynchonrously. For information about promises, and asynchronous calls, StackOverflow is probably the best bet for resolving issues.  For troubleshooting other related portions of the project, see the "Docs" sections of the related software (i.e. Heroku, Postman, MongoDB), most of which are referenced above.






# Release Notes (v1.0.0)
## New Features:
This is the first official iteration of the backend for this project, as such all features are considered to be "new" at this time. See below for a list of all features.
### 1. User Features
The most basic entity of our application is considered to be a "User". A User is comprised of quite a bit of data, but is primarily composed of a unique email address, a unique user ID/username, a unique phone number, a birthdate (that must make them 21 years or older), their name (first and last), and their active zip code. The basic functions of a User are represented by two separate files, the "authRoutes.js" file, and the "userRoutes.js" file. See below for more information:
#### AuthRoutes:
The AuthRoutes file contains all of the necessary routes for authenticating a User including: registering a User, signing a User in, and refreshing a User's access tokens if they expire. 
#### UserRoutes:
The UserRoutes file contains all of the other relevant routes for allowing Users to interact with the application as a whole. All routes in this file require a User to be properly authenticated (i.e. signed in) and present valid authorization tokens in order to properly modify their information. Routes in this file handle all of the logic for allowing a User to do the following: 1) update their personal non-critical information (i.e. first name, last name, zip code, and uploading a new profile photo); 2) get a user's non critical information (same as before); 3) update their password; 4) update their email; 5) and update their phone number. Functions 3 through 5 require a higher level of authentication, as these pieces of information are considered "critical" for proper functioning of a User's account.

### 2. Brewery Features
Perhaps the most mission-critical entity of our application is that of a "Brewery". A Brewery is comprised of a large amount of information including the following: a name; an address (made up of a street address, city, state, zip code); a relative price indicator (on a scale from $ being cheapest to $$$$ being most expensive); an overall ratings value (i.e. how highly rated other users have indicated the location is with 1 star indicating the lowest rating, ang 5 stars indicating the highest rating); a geo location object composed of a single latitude/longitude pair (for using MongoDB's built-in GeoLocation features to find nearby locations); a unique phone number; a unique email address (optional); a unique website (optional); a User entity that serves as the owner/creator of the location; the business hours during which the location is open; the "alternative kid-friendly hours" that the location may allow kids during; and the individual accommodations that location has making it kid-friendly.

#### BreweryRoutes:
The primary functions for interacting with Brewery data are creating a location, updating a location, getting a list of locations that the signed in user owns/created, searching for a brewery, getting all of the information for a specific Brewery location. These are all handled within the BreweryRoutes file. 
##### Searching: 
While most of the primary functions for Brewery objects are fairly straightforward, the search feature is by far the most involved. The search feature allows for a user to specify certain filtering criteria (i.e. maximum price value, maximum distance away from their relative location, minimum overall star rating, etc.) that they want to apply to their search, limiting the results returned. **At the current time, the search feature will always return results sorted by distance, nearest to farthest. While we hope to implement further sorting options in the future, this is the only one available at the moment.**
The search function will then return all relevant results (or an empty list, if no results match the User's filter) to be displayed by the frontend. In an attempt to reduce the amount of raw data being transmitted on each Search call, we only return information relevant to displaying the list of results: name, street address, relative price, relative distance from the User, whether the location is open now or not, the relative rating of the location.

### 3. Review Features
We've also provided Users with the ability to write reviews about locations which they've visited. Users currently can perform the basic function of creating reviews. The backend also has routes relevant to updating a Review, for getting a list of all Reviews associated with a particular Brewery, for getting a list of all Reviews written by the currently signed-in User, and for getting the contents of a particular Review. **Currently the edit feature has not been implemented on the frontend.**



## Bug Fixes:
At the current time, no bug fixes have been implemented, as this is the initial iteration of the project.



## Known Bugs/Defects:
To date, all known bugs have been addressed to the best of our ability. With each new iteration of the frontend and backend, thorough testing to uncover potential new bugs will be conducted, with attempts made to address each bug deemed critical for that release.
