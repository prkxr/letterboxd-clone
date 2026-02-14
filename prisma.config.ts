import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Force Node to read your .env file
dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Read directly from the Node process environment
    url: process.env.DIRECT_URL as string,
  },
});