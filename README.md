# FFBT-Server-Heroku
This repository includes all of the relevant code for creating and running the backend/server code for the Family Friendly Brewery Tracker (also known as "FamBrews") project created for the Computer Science Junior Design (CS 3311/CS 3312) class at the Georgia Institute of Technology. This project is currently being run/hosted on a live server running on Heroku. Any changes merged to this repository will force a new build of the development instance of the server on the aforementioned Heroku instance. Once changes have been adequately tested and shown to work correctly, they can be promoted to the production instance of the Heroku server from within Heroku itself. The server is primarily running on a Node.js implementation, which is connected to a MongoDB storage instance for storing all Users, Breweries, user ResetTokens, and Reviews that a user may leave on an individual Brewery. It is also connected to an AWS instance for uploading/downloading images associated with a User's account, or a Brewery instance. See below for more information regarding all implementations.

# Contents



# Version Number
1.0.0

# Release Notes
## New Features:
This is the first official iteration of the backend for this project, as such all features are considered to be "new" at this time. See below for a list of all features.
### 1. User Features
The most basic entity of our application is considered to be a "User". A User is comprised of quite a bit of data, but is primarily composed of a unique email address, a unique user ID/username, a unique phone number, a birthdate (that must make them 21 years or older), their name (first and last), and their active zip code. The basic functions of a User are represented by two separate files, the "authRoutes.js" file, and the "userRoutes.js" file. See below for more information:
#### AuthRoutes:
The AuthRoutes file contains all of the necessary routes for authenticating a User including: registering a User, signing a User in, and refreshing a User's access tokens if they expire. 
#### UserRoutes:
The UserRoutes file contains all of the other relevant routes for allowing Users to interact with the application as a whole. All routes in this file require a User to be properly authenticated (i.e. signed in) and present valid authorization tokens in order to properly modify their information. Routes in this file handle all of the logic for allowing a User to do the following: 1) update their personal non-critical information (i.e. first name, last name, zip code, and uploading a new profile photo); 2) get a user's non critical information (same as before); 3) update their password; 4) update their email; 5) and update their phone number. Functions 3 through 5 require a higher level of authentication, as these pieces of information are considered "critical" for proper functioning of a User's account.

### 2. Brewery Features
Perhaps the most mission-critical entity of our application is that of a "Brewery". A Brewery is comprised of a large amount of information including the following:
