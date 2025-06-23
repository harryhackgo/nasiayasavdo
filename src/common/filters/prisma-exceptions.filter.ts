import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2000':
        message = 'Value too long for column';
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2001':
        message = 'Record not found with the specified filter';
        status = HttpStatus.NOT_FOUND;
        break;

      case 'P2002':
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        message = `Unique constraint failed on ${exception.meta?.target}`;
        status = HttpStatus.CONFLICT;
        break;

      case 'P2003':
        message = 'Foreign key constraint failed';
        status = HttpStatus.CONFLICT;
        break;

      case 'P2004':
        message = 'A database constraint failed';
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2005':
        message = 'Invalid value for column';
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2006':
        message = 'Invalid value for model field';
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2007':
        message = 'Data validation error';
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2025':
        message = 'Record to update/delete does not exist';
        status = HttpStatus.NOT_FOUND;
        break;

      default:
        console.error('Unhandled Prisma error:', exception.code);
        message = 'Unexpected database error';
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorCode: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
