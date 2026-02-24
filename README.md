## Steps to setup the starter template

1. Clone the project

2. Move in to the folder structure




3. Install npm dependencies
    ``` npm i ````

4. Create a new .env file in the root directory and add the `PORT` env variable
```
echo PORT=3000 >> .env
```

5. Start the express server
'''
npm run server
'''



HOW TO TEST THE API
1. Start the server 
    '''npm run server '''
    You should see: {"level":"info","message":"Server listening on port 3000","timestamp":"..."}

2. Test the Ping Endpoint Using Postman
    URL - http://localhost:3000/ping
    Headers - Content-Type: application/json
    Body-{"name": "test"}

3. Expected result 
    {
  "status": "success",
  "message": "pong",
  "correlationId": "abc-123-xyz"
}

4. Expected Terminal logs
    {"level":"info","message":"Request received","correlationId":"abc-123-xyz","method":"POST","path":"/ping"}
    {"level":"info","message":"Handling ping request","correlationId":"abc-123-xyz"}

5. Test Validation Error
   URL - http://localhost:3000/ping
   Body - {"wrongField": "test"}
   
   Expected Response (400):
   {
     "status": "fail",
     "message": "Validation failed",
     "errors": [...]
   }

/// Markdown ///
Correlation ID: A unique identifier for tracking requests across logs