import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

import bodyParser from 'body-parser';
// var bodyParser = require('body-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env['ADMIN_API_PORT'] || 3001;
  app.use(
    bodyParser.json({
      limit: '2mb',
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  await app.listen(port);
  console.log('Listening on ', port);
}
bootstrap();
