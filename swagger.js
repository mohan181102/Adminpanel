const swaggerJSDoc = require("swagger-jsdoc");

// Define Swagger specification
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Admin Panel API",
        version: "1.0.0",
        description: "APIs for admin panel",
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT", // Optional, specify if using JWT format
            },
        },
    },
    security: [
        {
            bearerAuth: [], // Apply globally to all APIs
        },
    ],
};

// Options for the swagger docs
const options = {
    swaggerDefinition,
    apis: ["./routes/*.js"], // Path to the API routes
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;



// const swaggerJSDoc = require('swagger-jsdoc');

// const swaggerDefinition = {
// openapi: '3.0.0',
// info: {
// title: 'Admin Panel API',
// version: '1.0.0',
// description: 'Api\'s for admin panel',
// },
// };

// const options = {
// swaggerDefinition,
// // apis: ['./routes/*.js'],
// apis: ['./routes/*.js'], // Path to the API routes in your Node.js application
// };

// const swaggerSpec = swaggerJSDoc(options);
// module.exports = swaggerSpec;