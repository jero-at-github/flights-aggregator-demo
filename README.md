# powerus-coding-challenge 
###### By: Jeronimo Lopez

#### Installation
To start the REST API:
`npm install` 
`npm run start`

The server will provide the endpoint in the URL: `http://localhost:3000/flights`

#### Testing
There are included 2 test sets:
- `npm run test` which main target is to test the controller and specifically check that the time response remains under 1 second.
- `npm run test:e2e` which main tartget is to test the endpoint and its response.

#### Dependencies
The most important dependencies used in the project are:
- **nestjs/axios**: for http requests
- **performance**: for http requests time response measurement
- **date-fns**: to compare dates
- **cache-manager**: for http requests responses caching

##### g