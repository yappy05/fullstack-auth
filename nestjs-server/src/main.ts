import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

import {ConfigService} from '@nestjs/config'
import cookieParser from 'cookie-parser'
import {ValidationPipe} from "@nestjs/common";
import IORedis from 'ioredis'
import * as sessionNS from 'express-session';
const session = (sessionNS as any).default || sessionNS;
import {ms, StringValue} from "@/libs/common/utils/ms.utils";
import {parseBoolean} from "@/libs/common/utils/parse-boolean.utils";
import { RedisStore } from 'connect-redis'

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService)
    const redis = new IORedis(config.getOrThrow<string>('REDIS_URI'))


    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        })
    )

    app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

    app.enableCors({
        origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
        credential: true,
        exposedHeaders: ['set-cookie']
    })

    app.use(session({
        secret: config.getOrThrow<string>('SESSION_SECRET'),
        name: config.getOrThrow<string>('SESSION_NAME'),
        resave: true,
        saveUninitialized: false,
        cookie: {
            domain: config.getOrThrow<string>('SESSION_DOMAIN'),
            maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
            httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
            secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
            sameSite: 'lax'
        },
        store: new RedisStore({
            client: redis,
            prefix: config.getOrThrow<string>('SESSION_FOLDER')
        })
    }))

    await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}

bootstrap();
