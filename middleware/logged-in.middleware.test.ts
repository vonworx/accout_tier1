import * as express from 'express';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { RequestMethod, Module, Controller, Get, NestModule, MiddlewareConsumer, HttpStatus } from '@nestjs/common';
import { LogProvider } from '../../common/logging/log.provider';
import { Logger } from '../../common/logging/log.service';
import { LoggedInMiddleware } from './logged-in.middleware';
import { SessionAuthType, SessionInfoDto } from '../../common/dto/session-info.dto';
import { MemberService } from '../_services/member.service';
import { ConfigurationProvider } from '../../common/configuration/configuration.provider';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';

const credsOnly = '/credsOnly', autoOnly = '/autoOnly', credsOrAuto = '/credsOrAuto';

@Controller()
class FixtureController {

    @Get( credsOnly )
    credsOnly () {
        return 'credsOnly_done';
    }

    @Get( autoOnly )
    autoOnly () {
        return 'autoOnly_done';
    }

    @Get( credsOrAuto )
    credsOrAuto () {
        return 'credsOrAuto_done';
    }
}

@Module( { controllers: [ FixtureController ], providers: [ LogProvider, MemberService, ConfigurationProvider ] } )
class LoggedInFixtureModule implements NestModule {

    configure ( consumer: MiddlewareConsumer ): void {
        consumer.apply( ( req, res, next ) => {
            //Fake the session info
            const sess = new SessionInfoDto();
            //Just let our routes specify the authType for Easy Testing
            sess.authType = parseInt(req.query.authType);
            req.sessionInfo = sess;
            next();
        }).forRoutes(FixtureController);

        consumer.apply( LoggedInMiddleware ).with( SessionAuthType.CREDS ).forRoutes( { path: credsOnly, method: RequestMethod.ALL } );
        consumer.apply( LoggedInMiddleware ).with( SessionAuthType.AUTOLOGIN ).forRoutes( { path: autoOnly, method: RequestMethod.ALL } );
        consumer.apply( LoggedInMiddleware ).with( SessionAuthType.CREDS | SessionAuthType.AUTOLOGIN ).forRoutes( { path: credsOrAuto, method: RequestMethod.ALL } );
    }

}

const logger = new Logger( '' );

describe( 'LoggedInMiddleware', () => {

    const server = express();
    const memberService: MemberService = new MemberService(new Logger(''), new ConfigurationDto(process.env));
    let loggerSpy: jest.SpyInstance, validateUserSpy: jest.SpyInstance;

    beforeAll( async () => {
        const module = await Test.createTestingModule( { imports: [ LoggedInFixtureModule ] } )
            .overrideProvider( Logger.getToken() ).useValue( logger )
            .overrideProvider( MemberService ).useValue(memberService)
            .compile();

        const app = module.createNestApplication( server );
        await app.init();

        loggerSpy = jest.spyOn( logger, 'info' );
        validateUserSpy = jest.spyOn(memberService, 'validateUser');

    } );

    beforeEach( () => {
        validateUserSpy.mockImplementation(() => Promise.resolve(true));
    } );

    afterEach( () => {
        validateUserSpy.mockReset();
    } );

    describe('Credentials Only Resource', () => {
        test('Credential Token, Success' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOnly )
                .query( { authType: SessionAuthType.CREDS } )
                .expect(HttpStatus.OK, 'credsOnly_done')
                .then( (res) => expect( res.ok ).toBeTruthy() );
        } );

        test('AutoLogin Token, Fail' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOnly )
                .query( { authType: SessionAuthType.AUTOLOGIN } )
                .then( (res) => expect( res.unauthorized ).toBeTruthy() );
        } );

        test('Anonymous Token, Fail' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOnly )
                .query( { authType: SessionAuthType.ANON } )
                .then( (res) => expect( res.unauthorized ).toBeTruthy() );
        } );
    });

    describe('AutoLogin Resource', () => {
        test('Credential Token, Success' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( autoOnly )
                .query( { authType: SessionAuthType.CREDS } )
                .then( (res) => expect( res.unauthorized ).toBeTruthy() );
        } );

        test('AutoLogin Token, Fail' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( autoOnly )
                .query( { authType: SessionAuthType.AUTOLOGIN } )
                .expect(HttpStatus.OK, 'autoOnly_done')
                .then( (res) => expect( res.ok ).toBeTruthy() );
        } );

        test('Anonymous Token, Fail' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( autoOnly )
                .query( { authType: SessionAuthType.ANON } )
                .then( (res) => expect( res.unauthorized ).toBeTruthy() );
        } );
    });

    describe('Creds or AutoLogin Resource', () => {
        test('Credential Token, Success' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOrAuto )
                .query( { authType: SessionAuthType.CREDS } )
                .expect(HttpStatus.OK, 'credsOrAuto_done')
                .then( (res) => expect( res.ok ).toBeTruthy() );
        } );

        test('AutoLogin Token, Success' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOrAuto )
                .query( { authType: SessionAuthType.AUTOLOGIN } )
                .expect(HttpStatus.OK, 'credsOrAuto_done')
                .then( (res) => expect( res.ok ).toBeTruthy() );
        } );

        test('Anonymous Token, Fail' , () => {
            expect.assertions( 1 );
            return request( server )
                .get( credsOrAuto )
                .query( { authType: SessionAuthType.ANON } )
                .then( (res) => expect( res.unauthorized ).toBeTruthy() );
        } );
    });

} );
