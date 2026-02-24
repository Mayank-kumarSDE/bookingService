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


# backend-template

> A production-ready Express.js starter template with logging, validation, and correlation ID tracking.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 table of contents
- [features](#-features)
- [prerequisites](#-prerequisites)
- [installation](#-installation)
- [environment variables](#-environment-variables)
- [available scripts](#-available-scripts)
- [folder structure](#-folder-structure)
- [testing the api](#-testing-the-api)
- [correlation-id-logging](#-correlation-id-logging)
- [contributing](#-contributing)
- [license](#-license)

## ✨ features
- 🔐 request validation with zod/joi
- 🪪 automatic correlation-id generation for request tracing
- 📝 structured logging with winston/pino
- 🚀 scalable folder structure for microservices
- 🧪 ready for unit/integration testing

## 🛠 prerequisites
- node.js >= 18.x
- npm >= 9.x

## 📦 installation

1. clone the repository
   ```bash
   git clone https://github.com/Mayank-kumarSDE/backendTemplate.git
   cd backendTemplate

2. install dependencies
``` bash
    npm install

3. configure environment variables
`` bash
    echo "PORT=3000" >> .env
    # add other vars as needed
4. start the development server
``` bash 
    npm run server

## Folder structure
backendTemplate/
├── src/
│   ├── config/         # environment & app config
│   ├── controllers/    # request handlers
│   ├── middlewares/    # custom middleware (auth, validation, logger)
│   ├── routes/         # API route definitions
│   ├── utils/          # helpers (correlationId, logger)
│   └── app.js          # express app setup
├── tests/              # test files
├── .env.example        # env template
├── .gitignore
├── package.json
└── README.md