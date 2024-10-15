import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ExceptionLoggerFilter } from './utils/exceptions/exceptionLogger.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Use for parse cookie
  app.use(cookieParser());

  //  User custom exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionLoggerFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
