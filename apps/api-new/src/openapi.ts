import { generateOpenApiDocument } from 'trpc-openapi'

import { appRouter } from './routers/app'

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Intake24 Dietician API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '1.0.0',
  baseUrl: 'http://localhost:8080/api',
  tags: ['auth'],
})
