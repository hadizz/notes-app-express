# Pocket Service
an auth protected service for storing notes

##### Tech:
- Nodejs: Javascript engine for writing a web server on my computer
- Expressjs: Framework for Nodejs to write middle ware, write routes, etc.. 
- MongoDB: NoSQL database
- Redis: in-memory key–value database
- @hapi/joi: validation package
- monk: its like knex but for mongodb, easy way to talk to the db on your machine
- bcrypt: hashing package to keep passwords secret in your db
- volleyball: http logger that makes it easy to read/debug in the console as we work

#### Backend:
use docker for database:
- install docker on ur machine
- `$ docker-compose up -d --build`

to run:
- create .env from sample
- make sure you have installed nodejs and npm installed on ur machine
- `$ npm run dev` (uses nodemon so i dont have to refresh)
- using postman to check apis or jetbrains [http client plugin](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) because jetbrains is fun :)

forked from cj garden's repo❤️
