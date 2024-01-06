# Notes App
an auth protected service for storing notes

##### Tech:
- `Nodejs`: Javascript engine for writing a web server on my computer
- `Expressjs`: Framework for Nodejs to write middle ware, write routes, etc.. 
- `MongoDB`: NoSQL database
- `Redis`: in-memory key–value database
- `@hapi/joi`: validation package
- `monk`: its like knex but for mongodb, easy way to talk to the db on your machine
- `bcrypt`: hashing package to keep passwords secret in your db
- `volleyball`: http logger that makes it easy to read/debug in the console as we work

#### Backend:
use docker for database:
- install docker on ur machine
- create .env from sample

    example: 
    ```dotenv
    TOKEN_SECRET=your_secret
    DEFAULT_ADMIN_PASSWORD=1234567890
    DB_URL=mongodb://root:1234@localhost:27017/dbname
    PORT=3001
    MONGO_INITDB_ROOT_PASSWORD=1234567890
    ```

- `$ docker-compose up -d --build` (you can comment the `node-app` in docker compose file so app won't start)
- initialize db with name `dbname` collections `users` `notes` and one item at least for each collection
- run `npm run seed:admin`


to run:
- make sure you have installed nodejs and npm installed on ur machine
- `$ npm run dev` (uses nodemon so i dont have to refresh) or use docker compose file to boot up your app.
- using postman to check apis or jetbrains [http client plugin](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) because jetbrains is fun :)

forked from cj garden's repo❤️
