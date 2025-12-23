import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cryptomask API Documentation',
      version: '1.0.0',
      description: 'API documentation for Cryptomask Ethereum-based crypto wallet',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controller/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: any) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 