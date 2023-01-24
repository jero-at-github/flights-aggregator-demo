# powerus-coding-challenge 
###### By: Jeronimo Lopez

#### Installation
To start the REST API:
`npm install` 
`npm run start`

- The server will provide the endpoint in the URL: http://localhost:3000/flights
- The Swagger API documentation can be found here: http://localhost:3000/api

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
- **nestjs/swagger, swagger-ui-express**: for swager documentation

#### Comments
- The endpoint will try to fetch data from the data sources in less than 1 second.
If one of the sources fails, it will retry until the 1 second time limit triggers, in that case the endpoint will return the data of the sources which loaded sucessfully.
In case all sources failed it will return an exception with the message: No flight sources available at the moment
- The endpoint uses caching per request for 1 hour. 
- Since the endpoint would be consumed by a search flights application, it implements some basic filters:
    - By maxPrice
    - By departure date (day)
    - By return date (day)
    - By origin
    - By destination
Example: http://localhost:3000/flights?maxPrice=150&origin=Schon&destination=Stansted&departureDate=2019-08-08T04:30:00.000Z&returnDate=2019-08-10T06:25:00.000Z
