import {
  HttpAdapterHost,
  NestFactory,
  Reflector,
  // Reflector
} from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ExceptionLoggerFilter } from './utils/exceptions/exceptionLogger.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ExcludeNullInterceptor } from './utils/interceptors/excludeNull.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Use for parse cookie
  app.use(cookieParser());

  //  User custom exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionLoggerFilter(httpAdapter));

  // use to validate upcomming data
  app.useGlobalPipes(new ValidationPipe());

  // Testing purpose
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ExcludeNullInterceptor(),
  );

  await app.listen(3000);
}
bootstrap();
