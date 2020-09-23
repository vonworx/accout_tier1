'use strict';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import * as request from 'supertest';

jest.mock('./_services/member.service');
import { MemberService } from './_services/member.service';

jest.mock('../common/configuration/dto/configuration.dto');
import { ConfigurationDto } from '../common/configuration/dto/configuration.dto';

jest.mock('../cart/cart.service');
import { CartService } from '../cart/cart.service';

jest.mock('../products/product.service');
import { ProductService } from '../products/product.service';

jest.mock('@techstyle/emma-sdk');
import { EmmaService } from '@techstyle/emma-sdk';

import { Logger } from '../common/logging/log.service';

jest.mock('../quiz/quiz.service');
import { QuizService } from '../quiz/quiz.service';

import { SessionAuthType, SessionInfoDto } from '../common/dto/session-info.dto';
import { SessionService } from '../common/session.service';
import { JwtService } from '../common/jwt.service';
import { StoreService } from '../common/store.service';

import { randomIntegerInRange, randomString } from '../../tests/test-helpers';

jest.mock('../retailstore/retailstore-service');
import { RetailStoreService } from '../retailstore/retailstore-service';

jest.mock('../common/cache.service');
import { CacheService } from '../common/cache.service';
import { BrandType } from '../common/constants/brand.type';

import { AccountModule } from './account.module';

describe('account module', () => {
    let app: INestApplication;
    let expectedSessionCustomerId: number;
    let SessionInfoDtoMock;
    let expectedProduct: any;
    let emmaService;

    afterEach(async () => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        await app.close();
    });

    const getWiredUpApp = ( memberService, productService, session, theEmmaService, retailStoreService = undefined ): TestingModuleBuilder => {
        const configurationDto = new ConfigurationDto();
        configurationDto.bentoApiOptions = {
            port: randomIntegerInRange(1000, 9000),
            path: randomString(),
            hostname: randomString(),
            https: randomIntegerInRange(0, 2) === 1,
            rejectUnauthorized: randomIntegerInRange(0, 2) === 1,
            method: randomString(),
            serviceName: randomString(),
            agent: {},
            clientConnectionTimeOut: randomIntegerInRange(10, 999)
        };

        const storeDetailMock = {
            storeGroupId: 34,
            getBrandType: jest.fn().mockReturnValue(BrandType.SavageXFenty)
        };

        return Test.createTestingModule( {
            imports: [ AccountModule ],
        } )
            .overrideProvider( Logger ).useValue( {
                error: jest.fn(),
                debug: jest.fn(),
                info: jest.fn()
            } )
            .overrideProvider( ConfigurationDto ).useValue( configurationDto )
            .overrideProvider( MemberService ).useValue( memberService )
            .overrideProvider( CacheService ).useValue( new CacheService(null, null) )
            .overrideProvider( CartService ).useValue( new CartService(null, null, null, null) )
            .overrideProvider( StoreService ).useValue( {
                getStoreDetailByStoreGroup: jest.fn().mockResolvedValue( storeDetailMock ),
                getStoreDetailByDomain: jest.fn().mockResolvedValue( storeDetailMock )
            } )
            .overrideProvider( ProductService ).useValue( productService )
            .overrideProvider( EmmaService ).useValue( theEmmaService )
            .overrideProvider( QuizService ).useValue( new QuizService(null, null) )
            .overrideProvider( SessionService ).useValue( {
                getSessionCookieName: jest.fn().mockReturnValue( '' ),
                getLegacyCookieName: jest.fn().mockReturnValue( '' ),
                appendSessionCookie: jest.fn(),
                getSessionLengthMS: jest.fn().mockReturnValue(3)
            })
            .overrideProvider(JwtService).useValue({
                verifyToken: jest.fn().mockReturnValue(session),
                getToken: jest.fn().mockResolvedValue('token')
            })
            .overrideProvider(RetailStoreService).useValue(retailStoreService || new RetailStoreService(null, null, null));
    };

    beforeEach(() => {
        emmaService = new EmmaService(null);
        expectedSessionCustomerId = randomIntegerInRange(1, 20000);
        SessionInfoDtoMock = jest.fn<SessionInfoDto>(() => ({
            getCustomerId: jest.fn().mockReturnValue(expectedSessionCustomerId),
            expiration: new Date(Date.now() + (60000 * 30)),
            expiresIn: jest.fn().mockReturnValue(false),
            authType: SessionAuthType.ANON,
            matchesAuthType: new SessionInfoDto().matchesAuthType
        } ) );
    });

    describe('and GET profile', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getMemberProfile.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), emmaService, null).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get('/accounts/me/profile')

                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            const rs = [{address: {zip: '12345', longitude: -117.918976, latitude: 33.81209}, storeName: 'Test Store'}];

            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                // @ts-ignore
                ms.validateUser.mockResolvedValue(true);
                // @ts-ignore
                ms.getMemberProfile.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')

                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')

                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });

            describe('and stores are returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService: jest.Mocked<MemberService> = new MemberService(null, null) as jest.Mocked<MemberService>;
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({storePostalCode: '12345'});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.getRetailStoresByStoreGroup.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, emmaService, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should come back with stores when passing in a matching postal code', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')

                        .expect(HttpStatus.OK, {storePostalCode: '12345', retailStores: rs});
                });
            });

            describe('and stores are returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService: jest.Mocked<MemberService> = new MemberService(null, null) as jest.Mocked<MemberService>;
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({longitude: -118.386460, latitude: 33.903380});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.getRetailStoresByStoreGroup.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, undefined, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should come back with stores when passing in a long/lat that is within the radius', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {longitude: -118.386460, latitude: 33.903380, retailStores: rs});
                });
            });

            describe('and stores are not returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService: jest.Mocked<MemberService> = new MemberService(null, null) as jest.Mocked<MemberService>;
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({storePostalCode: '67890'});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.getRetailStoresByStoreGroup.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, undefined, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should not come back with stores when passing non matching postal code', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')

                        .expect(HttpStatus.OK, {storePostalCode: '67890', retailStores: []});
                });
            });

            describe('and stores are not returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService: jest.Mocked<MemberService> = new MemberService(null, null) as jest.Mocked<MemberService>;
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({longitude: -81.563873, latitude: 28.385233});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.getRetailStoresByStoreGroup.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, undefined, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should not come back with stores when passing in a long/lat outside of the radius', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/profile')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {longitude: -81.563873, latitude: 28.385233, retailStores: []});
                });
            });

        });
    });

    describe('and GET orders', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getOrderHistory.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get('/accounts/me/orders')

                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getOrderHistory.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/orders')
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({recordsPerPage: 25, pageIndex: 2, order: 'DESC'})
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/orders')
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({recordsPerPage: 25, pageIndex: 2, order: 'DESC'})
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/orders')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET orders/:id', () => {
        const orderId = 5;
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getOrderDetail.mockResolvedValue({});
                // @ts-ignore
                memberService.getReturnableProductsByOrderId.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/orders/${orderId}`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getOrderDetail.mockResolvedValue({});
                ms.getReturnableProductsByOrderId.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be forbidden, which means was authorized to execute', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/orders/${orderId}`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.FORBIDDEN, {
                            statusCode: 403,
                            error: 'Forbidden',
                            message: 'This user is not allowed to view that order.'
                        });
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be forbidden, which means was authorized to execute', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/orders/${orderId}`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.FORBIDDEN, {
                            statusCode: 403,
                            error: 'Forbidden',
                            message: 'This user is not allowed to view that order.'
                        });
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/orders/${orderId}`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET reviews', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getCustomerProductReviews.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/reviews`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getCustomerProductReviews.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET reviews/products', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getReviewableProducts.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/reviews/products`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getReviewableProducts.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews/products`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    const r = await request( app.getHttpServer() )
                        .get( `/accounts/me/reviews/products` )
                        .set( 'Authorization', 'Bearer some-fake-token' );
                    expect( r.body ).toEqual( {} );
                    expect( r.status ).toEqual( HttpStatus.OK );
                } );
            } );

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET reviews/:id', () => {
        const reviewId = 33;
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getCustomerProductReview.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {

                await request(app.getHttpServer())
                    .get(`/accounts/me/reviews/${reviewId}`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getCustomerProductReview.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews/${reviewId}`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews/${reviewId}`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET payments', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getPaymentInfo.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {

                await request(app.getHttpServer())
                    .get(`/accounts/me/payments`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getPaymentInfo.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/payments`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/payments`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET preferences/email', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getPaymentInfo.mockResolvedValue({});

                // @ts-ignore
                emmaService.getEmailPreferences.mockResolvedValue({ lists: [] });

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/preferences/email`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;

            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getMemberProfile.mockResolvedValue({email: ''});

                emmaService.getEmailPreferences.mockResolvedValue({lists: []});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    const r = await request(app.getHttpServer())
                        .get(`/accounts/me/preferences/email`)
                        .set('Authorization', 'Bearer some-fake-token');
                    expect(r.body).toEqual({lists: []});
                    expect(r.status).toEqual(HttpStatus.OK);
                }, 500);
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    const r = await request(app.getHttpServer())
                        .get(`/accounts/me/preferences/email`)
                        .set('Authorization', 'Bearer some-fake-token');
                    expect(r.body).toEqual({lists: []});
                    expect(r.status).toEqual(HttpStatus.OK);
                }, 500);
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/reviews/products`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                }, 500);
            });
        });
    });

    describe('and GET detail', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getCustomerDetail.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/detail`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;

            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getCustomerDetail.mockResolvedValue({email: ''});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/detail`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({names: 'one,two,three'})
                        .expect(HttpStatus.OK, {email: ''});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/detail`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({names: 'one,two,three'})
                        .expect(HttpStatus.OK, {email: ''});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/detail`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET promos', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.getActiveMemberPromos.mockResolvedValue({});

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get(`/accounts/me/promos`)
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;

            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                ms.validateUser.mockResolvedValue(true);
                ms.getActiveMemberPromos.mockResolvedValue({});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/promos`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({names: 'one,two,three'})
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/promos`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({names: 'one,two,three'})
                        .expect(HttpStatus.OK, {});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get(`/accounts/me/promos`)
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and POST waitlist', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.addToWaitlist.mockResolvedValue(true);

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .post('/accounts/me/waitlist')
                    .send({})
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            let ps;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                // @ts-ignore
                ms.validateUser.mockResolvedValue(true);
                // @ts-ignore
                ms.addToWaitlist.mockResolvedValue(true);

                expectedProduct = {master_product_id: 13};

                ps = new ProductService(null, null, null, null);
                ps.getProductByStoreGroup.mockResolvedValue(expectedProduct);
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/waitlist' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( {} )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/waitlist' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( {} )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .post('/accounts/me/waitlist')
                        .set('Authorization', 'Bearer some-fake-token')
                        .send({productId: expectedProduct.master_product_id})
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and GET waitlist', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.addToWaitlist.mockResolvedValue(true);

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .get('/accounts/me/waitlist')

                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                // @ts-ignore
                ms.validateUser.mockResolvedValue(true);
                // @ts-ignore
                ms.getWaitlist.mockResolvedValue({items: []});
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/waitlist')
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({page: 1, pageSize: 15})
                        .expect(HttpStatus.OK, {items: []});
                });
            });

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/waitlist')
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({page: 1, pageSize: 15})
                        .expect(HttpStatus.OK, {items: []});
                });
            });

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .get('/accounts/me/waitlist')
                        .set('Authorization', 'Bearer some-fake-token')
                        .query({page: 1, pageSize: 15})
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and POST waitlist/sets', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.addSetToWaitlist.mockResolvedValue(true);

                app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .post('/accounts/me/waitlist/sets')
                    .send({setId: 3})
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                // @ts-ignore
                ms.validateUser.mockResolvedValue(true);
                // @ts-ignore
                ms.addSetToWaitlist.mockResolvedValue(true);
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/waitlist/sets' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( { setId: 3 } )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/waitlist/sets' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( { setId: 3 } )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, new ProductService(null, null, null, null), session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .post('/accounts/me/waitlist/sets')
                        .set('Authorization', 'Bearer some-fake-token')
                        .send({setId: 3})
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        });
                });
            });
        });
    });

    describe('and POST wishlist', () => {
        describe('and no user', () => {
            beforeEach(async () => {
                const memberService = new MemberService(null, null);
                // @ts-ignore
                memberService.validateUser.mockResolvedValue(false);
                // @ts-ignore
                memberService.addToWishlist.mockResolvedValue(true);

                expectedProduct = {master_product_id: 3};

                const productServiceMock = new ProductService(null, null, null, null);
                // @ts-ignore
                productServiceMock.getProductByStoreGroup.mockResolvedValue(expectedProduct);

                app = (await getWiredUpApp(memberService, productServiceMock, null, emmaService).compile()).createNestApplication();
                await app.init();
            });

            test('should be unauthorized', async () => {
                await request(app.getHttpServer())
                    .post('/accounts/me/wishlist')
                    .send({productId: expectedProduct.master_product_id})
                    .expect(401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    });
            });
        });

        describe('and user session exists', () => {
            let ms: jest.Mocked<MemberService>;
            let ps;
            beforeEach(() => {
                ms = new MemberService(null, null) as jest.Mocked<MemberService>;
                // @ts-ignore
                ms.validateUser.mockResolvedValue(true);
                // @ts-ignore
                ms.addToWishlist.mockResolvedValue(true);

                expectedProduct = {master_product_id: 13};

                ps = new ProductService(null, null, null, null);
                ps.getProductByStoreGroup.mockResolvedValue(expectedProduct);
            });

            describe('and user authType is SessionAuthType.AUTOLOGIN', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/wishlist' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( { productId: expectedProduct.master_product_id } )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and user authType is SessionAuthType.CREDS', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.CREDS;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test( 'should be authorized', async () => {
                    await request( app.getHttpServer() )
                        .post( '/accounts/me/wishlist' )
                        .set( 'Authorization', 'Bearer some-fake-token' )
                        .send( { productId: expectedProduct.master_product_id } )
                        .expect( HttpStatus.NO_CONTENT, {} );
                } );
            } );

            describe('and is in dirty anon state', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.ANON;

                    app = (await getWiredUpApp(ms, ps, session, emmaService).compile()).createNestApplication();
                    await app.init();
                });

                test('should be authorized', async () => {
                    await request(app.getHttpServer())
                        .post('/accounts/me/wishlist')
                        .set('Authorization', 'Bearer some-fake-token')
                        .send({productId: expectedProduct.master_product_id})
                        .expect(HttpStatus.UNAUTHORIZED, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Session does not have appropriate authorization type'
                        } );
                } );
            } );
        } );
    } );

    describe( 'and GET retail stores', () => {
        describe( 'and no user', () => {
            beforeEach( async () => {
                const memberService = new MemberService( null, null );
                // @ts-ignore
                memberService.validateUser.mockResolvedValue( false );
                // @ts-ignore
                memberService.getMemberProfile.mockResolvedValue( {} );

                app = ( await getWiredUpApp( memberService, new ProductService(null, null, null, null), null, null ).compile() ).createNestApplication();
                await app.init();
            } );

            test( 'should be unauthorized', async () => {
                await request( app.getHttpServer() )
                    .get( '/accounts/me/retailstores' )

                    .expect( 401, {
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Session required to access this resource'
                    } );
            } );
        } );

        describe( 'and user session exists', () => {
            let ms;
            const rs = [{address: {zip: '12345', longitude: -117.918976, latitude: 33.81209}, storeName: 'Test Store'}];
            let MemberServiceMock;

            beforeEach( () => {
                MemberServiceMock = jest.fn<MemberService>(() => ({
                    validateUser: jest.fn(),
                    addToWaitlist: jest.fn(),
                    addToWishlist: jest.fn(),
                    getMemberProfile: jest.fn(),
                    getWaitlist: jest.fn(),
                    getOrderHistory: jest.fn(),
                    getOrderDetail: jest.fn(),
                    getReturnableProductsByOrderId: jest.fn(),
                    getCustomerProductReviews: jest.fn(),
                    getCustomerProductReview: jest.fn(),
                    getReviewableProducts: jest.fn(),
                    getPaymentInfo: jest.fn(),
                    getCustomerDetail: jest.fn(),
                    getActiveMemberPromos: jest.fn(),
                    addSetToWaitlist: jest.fn(),
                }));

                ms = new MemberService( null, null );
                // @ts-ignore
                ms.validateUser.mockResolvedValue( true );
                // @ts-ignore
                ms.getMemberProfile.mockResolvedValue( {} );
            } );

            describe('and stores are returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService = new MemberServiceMock();
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({longitude: -118.386460, latitude: 33.903380});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.searchRetailStoresByProfile.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, undefined, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should come back with stores when passing in a long/lat that is within the radius', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/retailstores?radius=30')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, [ { address: { zip: '12345',
                              longitude: -117.918976,
                              latitude: 33.81209 },
                           storeName: 'Test Store' } ]);
                });
            });

            describe('and stores are not returned', () => {
                beforeEach(async () => {
                    const session = new SessionInfoDtoMock();
                    session.authType = SessionAuthType.AUTOLOGIN;

                    const memberService = new MemberServiceMock();
                    memberService.validateUser.mockResolvedValue(true);
                    memberService.getMemberProfile.mockResolvedValue({storePostalCode: '67890'});

                    const rsService = new RetailStoreService(null, null, null);
                    // @ts-ignore
                    rsService.getRetailStoresByStoreGroup.mockResolvedValue(rs);

                    app = (await getWiredUpApp(memberService, new ProductService(null, null, null, null), session, undefined, rsService).compile()).createNestApplication();
                    await app.init();
                });

                test('should not come back with stores when passing in a long/lat that is outside of the radius', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/retailstores?radius=1')
                        .set('Authorization', 'Bearer some-fake-token')
                        .expect(HttpStatus.OK, []);
                });

                test('should not come back with stores when passing empty lat/long coordinates', async () => {
                    return request(app.getHttpServer())
                        .get('/accounts/me/retailstores')
                        .set('Authorization', 'Bearer some-fake-token')

                        .expect(HttpStatus.OK, []);
                });
            });
        } );
    } );

} );
