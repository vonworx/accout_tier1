'use strict';

import { Logger } from '../../common/logging/log.service';
import { StoreDetailDto } from '../../common/dto/store-detail.dto';
import { SessionInfoDto } from '../../common/dto/session-info.dto';
import { MemberService } from './member.service';
import { AddressDto } from '../dto/address.dto';
import { PaymentInfoDto, PaymentOptionResponseDto } from '../dto/payment-info.dto';
import { CustomerSignupDto } from '../dto/customer.dto';
import { BadGatewayException } from '@nestjs/common';
import { SubmitProductReviewDto } from '../../products/dto';
import { AddressType } from '../dto/address.interface';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { OrderRmaDto, ReturnableProductDto, RmaItemDto } from '../dto/order-rma.dto';
import { ProductRequestDto, ProductSetRequestDto } from '../dto/product-request.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { MemberQuestionAnswerDto, MemberQuizAnswersDto } from '../../quiz/dto';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { CustomerDetailDto } from '../dto/customer-details.dto';
import { plainToClass } from 'class-transformer';
import { MembersActivePromoDto } from '../dto/members-active-promo.dto';
import { SortDirection } from '../../common/dto/sort-field';
import { randomIntegerInRange, randomString } from '../../../tests/test-helpers';
import { AdyenPaymentSessionRequestDto, AdyenPaymentResponseDto, AdyenPaymentSessionResponseDto } from '../dto';

describe( 'MemberService', () => {
    let memberService: MemberService, storeDetail: StoreDetailDto, sessionInfo: SessionInfoDto, customerSignupDto: CustomerSignupDto, configurationDto: ConfigurationDto, signupRpcResponse, signupRpcFault;
    let headers: HeadersDto;

    beforeAll( () => {
        configurationDto = new ConfigurationDto( process.env );
    } );

    let rpcSpy: jest.SpyInstance;

    beforeEach( () => {
        memberService = new MemberService( new Logger( '' ), configurationDto );
        rpcSpy = jest.spyOn( memberService, 'rpc' );

        storeDetail = new StoreDetailDto();
        storeDetail.storeGroupId = 34;
        storeDetail.baseDomain = 'techstyle.com';

        sessionInfo = SessionInfoDto.getInstanceOf(
            {
                session: '0okm-nji9-8uhb-vgy7-6tfc',
                session_id: 1234,
                session_visitor: '1qaz-xsw2-3edc-vfr4-5tgb',
                domain: '*.techstyle.com',
                expiration: new Date( Date.now() + ( 30 * 60 * 1000 ) ),
            } );

        sessionInfo.customer = '7894-5612-3032-1654-9879';
        sessionInfo.customerAuth = '0123-6549-8798-7456-3210';

        customerSignupDto = new CustomerSignupDto();
        customerSignupDto.email = 'tier1testuser1@test.com';
        customerSignupDto.password = 'testing1234';

        signupRpcResponse = require( '../../../tests/fixtures/member/signup-result.json' );
        signupRpcFault = require( '../../../tests/fixtures/member/signup-fault.json' );

        signupRpcResponse.ok = true;
        signupRpcFault.ok = false;

        headers = new HeadersDto();
        headers.ip = '0.0.0.0';
        headers.storeGroupId = storeDetail.storeGroupId;
        headers.session = sessionInfo.session;
        headers.customer = sessionInfo.customer;

    } );

    afterEach( () => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    } );

    describe( 'getAddresses', () => {

        const addressResult = require( '../../../tests/fixtures/member/get-address-result.json' );

        test( 'it serializes results', () => {

            const mock_findCart = rpcSpy.mockImplementation( () => Promise.resolve( addressResult ) );

            expect.assertions( 2 );

            return memberService.getMemberAddresses( sessionInfo, headers ).then( addresses => {
                expect( addresses[ 0 ] ).toBeInstanceOf( AddressDto );
                expect( addresses ).toHaveLength( 2 );
            } );
        } );
    } );

    describe( 'getAddressParams', () => {

        let address: AddressDto;

        beforeEach( () => {
            address = new AddressDto();
            address.id = 24601;

        } );

        test( 'add address id when present', () => {

            const result: any = memberService.getAddressParams( address );

            expect( result.address_id ).toBe( 24601 );
        } );

        test( 'defaults company to empty string when undefined', () => {
            address.company = undefined;
            const result: any = memberService.getAddressParams( address );
            expect( result.company ).toBe( '' );
        } );

        test( 'defaults company to empty string when null', () => {
            address.company = null;
            const result: any = memberService.getAddressParams( address );
            expect( result.company ).toBe( '' );

        } );

        test( 'uses company when provided', () => {
            address.company = 'TechStyle';
            const result: any = memberService.getAddressParams( address );
            expect( result.company ).toBe( address.company );
        } );

        test( 'sets type to shipping', () => {
            address.company = 'TechStyle';
            const result: any = memberService.getAddressParams( address );
            expect( result.address_type ).toBe( AddressType.Shipping );
        } );

    } );

    describe( 'getCoordinatesByZipCode', () => {
        test( 'with result', async () => {
            const mockRpcResult = { result: '- some result -' };
            rpcSpy.mockImplementation( () => Promise.resolve(mockRpcResult) );
            const result = await memberService.getCoordinatesByZipCode(sessionInfo, headers, 'someZip', 'someCountry');
            expect(result).toBe('- some result -');
        } );

        test( 'no result', async () => {
            const mockRpcResult = {};
            rpcSpy.mockImplementation( () => Promise.resolve(mockRpcResult) );
            await expect( memberService.getCoordinatesByZipCode(sessionInfo, headers, 'someZip', 'someCountry') ).rejects.toThrowError(BadGatewayException);
        } );
    } );

    describe( 'getMemberDetails', () => {

        test( 'response is uppercase keys', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { CUSTOMER_ID: 1234, EMAIL: 'abc@123.com' } } ) );

            expect.assertions( 2 );

            memberService.getMemberDetails( sessionInfo, headers ).then( customer => {
                expect( customer.id ).toBe( 1234 );
                expect( customer.email ).toBe( 'abc@123.com' );
            } );
        } );

        test( 'response is lowercase keys', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { customer_id: 1234, email: 'abc@123.com' } } ) );

            expect.assertions( 2 );

            memberService.getMemberDetails( sessionInfo, headers ).then( customer => {
                expect( customer.id ).toBe( 1234 );
                expect( customer.email ).toBe( 'abc@123.com' );
            } );
        } );
    } );

    describe( 'getMemberAttributes', () => {

    } );

    describe( 'updateMemberDetails', () => {

        let update: UpdateProfileDto;

        beforeEach( () => {
            update = new UpdateProfileDto();
            update.firstName = 'Hubert';
            update.lastName = 'Cumberdale';
            update.email = 'hc3@warrior.com';
            update.profile = {
                'birth-day': '02',
                'birth-month': '02',
                'birth-year': '1976'
            };
        } );

        test( 're-writes birth-day', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { success: true } } ) );
            expect.assertions( 2 );
            memberService.updateMemberDetail( update, sessionInfo, headers ).then( result => {
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth-day' ] ).toBeUndefined();
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth_day' ] ).toBe( '02' );
            } );
        } );

        test( 're-writes birth-month', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { success: true } } ) );
            expect.assertions( 2 );
            memberService.updateMemberDetail( update, sessionInfo, headers ).then( result => {
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth-month' ] ).toBeUndefined();
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth_month' ] ).toBe( '02' );
            } );
        } );

        test( 're-writes birth-year', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { success: true } } ) );
            expect.assertions( 2 );
            memberService.updateMemberDetail( update, sessionInfo, headers ).then( result => {
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth-year' ] ).toBeUndefined();
                expect( rpcMock.mock.calls[ 0 ][ 1 ].profile[ 'birth_year' ] ).toBe( '1976' );
            } );
        } );
    } );

    describe( 'savePaymentInfo', () => {

        let savePaymentRpcResponse, savePaymentRpcFault;
        const paymentInfoDto = new PaymentInfoDto();

        beforeEach( () => {
            storeDetail.storeId = 121;
            storeDetail.storeGroupId = 34;

            savePaymentRpcResponse = require( '../../../tests/fixtures/member/save-payment-info-result.json' );
            savePaymentRpcFault = require( '../../../tests/fixtures/member/save-payment-info-fault.json' );
        } );

        test( 'makes the correct rpc call', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( savePaymentRpcResponse ) );

            expect.assertions( 2 );

            return memberService.savePaymentInfo( paymentInfoDto, sessionInfo, storeDetail, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.savePayment' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( savePaymentRpcResponse ) );

            expect.assertions( 2 );

            const expectedParams = {
                customer: headers.customer,
                session: headers.session,
                card_num: paymentInfoDto.cardNum,
                card_type: paymentInfoDto.cardType,
                exp_month: paymentInfoDto.expMonth,
                exp_year: paymentInfoDto.expYear,
                name_on_card: paymentInfoDto.nameOnCard,
                card_code: paymentInfoDto.cardCode,
                address_id: paymentInfoDto.addressId,
                credit_card_id: paymentInfoDto.creditCardId,
                credit_card_is_default: true,
                block_if_cart_has_items: false,
                do_preauth: false,
                is_validated: false,
                customer_log_source_id: 2,
                store_id: storeDetail.storeId,
                store_group_id: storeDetail.storeGroupId,
                card_is_token: true
            };

            return memberService.savePaymentInfo( paymentInfoDto, sessionInfo, storeDetail, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'return an single object when the save succeeds', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( savePaymentRpcResponse ) );

            expect.assertions( 2 );

            return memberService.savePaymentInfo( paymentInfoDto, sessionInfo, storeDetail, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.creditCardId ).toBe( 11600643 );

            } );
        } );

        test( 'does not return PaymentResponseInfoDto if save fails', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( savePaymentRpcFault ) );
            paymentInfoDto.cardNum = '123456';

            expect.assertions( 2 );
            return memberService.savePaymentInfo( paymentInfoDto, sessionInfo, storeDetail, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.creditCardId ).toBeUndefined();
            } );
        } );

    } );

    describe( 'signup', () => {

        test( 'makes the correct rpc call', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

            expect.assertions( 2 );

            return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.customerSignup' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

            expect.assertions( 2 );

            const expectedParams = {
                email: customerSignupDto.email,
                password: customerSignupDto.password,
                domain: storeDetail.baseDomain,
                session: sessionInfo.session
            };

            return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'return true when the save succeeds', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

            expect.assertions( 2 );

            return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.ok ).toBeTruthy();

            } );
        } );

        test( 'return false when the save fails', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcFault ) );

            expect.assertions( 2 );

            return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.ok ).toBeFalsy();
            } );
        } );

        describe( 'Speedy Signup', () => {

            test( 'sets speedy signup to true', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 2 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].speedy_signup ).toBe( true );
                } );
            } );

            test( 'quiz fields are not set', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 3 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].quiz_id ).toBeUndefined();
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].quiz_answers ).toBeUndefined();
                } );
            } );
        } );

        describe( 'Full Signup', () => {
            const quizId = 123, quizAnswers = new MemberQuizAnswersDto();

            beforeEach( () => {
                quizAnswers.answers = new Array();
                quizAnswers.quizId = quizId;

                const answer1: MemberQuestionAnswerDto = new MemberQuestionAnswerDto();
                answer1.answerId = 990;
                answer1.answerText = '';
                answer1.questionId = 667;
                answer1.sequenceNumber = 1;

                quizAnswers.answers.push( answer1 );

                customerSignupDto.quizAnswers = quizAnswers;

                customerSignupDto.firstName = 'Homer';
                customerSignupDto.lastName = 'Simpson';

                customerSignupDto.profile = {
                    shipping_zipcode: 55555,
                    signup_source: 'website'
                };

            } );

            test( 'sets speedy signup to false', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 2 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].speedy_signup ).toBe( false );
                } );
            } );

            test( 'uses first name', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 2 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].customer_details.first_name ).toBe( customerSignupDto.firstName );
                } );
            } );

            test( 'uses last name', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 2 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].customer_details.last_name ).toBe( customerSignupDto.lastName );
                } );
            } );

            test( 'uses last name, empty string', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                //Allow explicit setting of lastName to empty string
                customerSignupDto.lastName = '';

                expect.assertions( 2 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].customer_details.last_name ).toBe( customerSignupDto.lastName );
                } );
            } );

            test( 'uses profile', () => {
                const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( signupRpcResponse ) );

                expect.assertions( 3 );

                return memberService.signup( customerSignupDto, storeDetail.baseDomain, sessionInfo, headers ).then( ( result ) => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].customer_details.shipping_zipcode ).toBe( customerSignupDto.profile[ 'shipping_zipcode' ] );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].customer_details.signup_source ).toBe( customerSignupDto.profile[ 'signup_source' ] );
                } );
            } );

        } );
    } );

    describe( 'manageWishlist', () => {

        const manageWishlistResult = { result: { ok: true } };
        const manageWishlistFault = { result: { ok: false } };
        const productId = 66960;

        test( 'makes the correct rpc call', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( manageWishlistResult ) );

            expect.assertions( 2 );

            return memberService.manageWishlist( productId, false, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.updateWishlist' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( manageWishlistResult ) );

            expect.assertions( 2 );

            const expectedParams = {
                product_id: productId,
                customer: sessionInfo.customer,
                active: true
            };

            return memberService.manageWishlist( productId, true, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'return true when the save succeeds', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( manageWishlistResult ) );

            expect.assertions( 2 );

            return memberService.manageWishlist( productId, false, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result ).toBeTruthy();
            } );
        } );

        test( 'throws exception when the save fails', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( manageWishlistFault ) );

            expect.assertions( 2 );

            return memberService.manageWishlist( productId, true, headers ).catch( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result ).toBeInstanceOf( BadGatewayException );
            } );
        } );

        describe('add and remove from wishlist', () => {
            let manageSpy, manageMock;
            beforeEach(() => {
                manageSpy = jest.spyOn(memberService, 'manageWishlist');
                manageMock = manageSpy.mockImplementation(() => Promise.resolve(true));
            });

            test('addToWishlist sets active to true', () => {
                expect.assertions(2);

                return memberService.addToWishlist(productId, headers).then(() => {
                    expect(manageMock).toHaveBeenCalledTimes(1);
                    expect(manageMock.mock.calls[0][1]).toBe(true);
                });
            });

            test('removeFromWishlist sets active to false', () => {
                expect.assertions(2);

                return memberService.removeFromWishlist(productId, headers).then(() => {
                    expect(manageMock).toHaveBeenCalledTimes(1);
                    expect(manageMock.mock.calls[0][1]).toBe(false);
                });
            });

        });

    } );

    describe('getWaitlist', () => {
        let waitlistResults: any;
        let expectedSortDirection: SortDirection;

        beforeEach(() => {
            expectedSortDirection = <SortDirection> randomIntegerInRange(0, 2);
        });

        const getWaitlistRequest = (numberOfItems: number = 0): object => {
            const response = {result: []};

            if (numberOfItems <= 0) {
                return response;
            }

            for (let o: number = 0; o < numberOfItems + 1; o++) {
                const color = randomString();
                response.result.push({
                    master_product_id: o,
                    color,
                    alias: `(${color})`,
                    product_id: (o + 1) * 2,
                    product_label: randomString(),
                    product_category_label: randomString(),
                    total_records: randomIntegerInRange(1, 244)
                });
            }
            return response;
        };

        test('makes the correct rpc call', async () => {
            waitlistResults = getWaitlistRequest(randomIntegerInRange(1, 5));

            const rpcMock = rpcSpy.mockImplementation(() => Promise.resolve(waitlistResults));

            const expectedParams = {
                membership_product_wait_list_type_id_list: '1,2,3',
                page_number: 1,
                records_per_page: 4,
                sort_direction: SortDirection[expectedSortDirection].toLowerCase()
            };

            const result = await memberService.getWaitlist(expectedParams.page_number, expectedParams.records_per_page, expectedSortDirection, headers);

            expect.assertions(4);

            expect(result.items.length).toEqual(waitlistResults.result.length);
            expect(result.total).toEqual(waitlistResults.result[0].total_records);
            expect(rpcMock).toHaveBeenCalledTimes(1);
            expect(rpcMock).toBeCalledWith('members.getWaitlist', expectedParams, headers);
        });

        test('no result items', async () => {
            waitlistResults = getWaitlistRequest(0);

            const rpcMock = rpcSpy.mockImplementation(() => Promise.resolve(waitlistResults));

            const expectedParams = {
                membership_product_wait_list_type_id_list: '1,2,3',
                page_number: 1,
                records_per_page: 4,
                sort_direction: SortDirection[expectedSortDirection].toLowerCase()
            };

            const result = await memberService.getWaitlist(expectedParams.page_number, expectedParams.records_per_page, expectedSortDirection, headers);

            expect.assertions(4);

            expect(result.items).toEqual([]);
            expect(result.total).toEqual(0);
            expect(rpcMock).toHaveBeenCalledTimes(1);
            expect(rpcMock).toBeCalledWith('members.getWaitlist', expectedParams, headers);
        });

        test('and bad result', async () => {
            waitlistResults = {};

            rpcSpy.mockImplementation(() => Promise.resolve(waitlistResults));

            const expectedParams = {
                membership_product_wait_list_type_id_list: '1,2,3',
                page_number: 1,
                records_per_page: 4
            };

            expect.assertions(1);

            try {
                await memberService.getWaitlist(expectedParams.page_number, expectedParams.records_per_page, expectedSortDirection, headers);
            } catch (e) {
                expect(e).toBeInstanceOf(BadGatewayException);
            }
        });
    });

    describe('getWishlist', () => {
        let getWishlistResult;

        beforeEach(() => {
            getWishlistResult = require('../../../tests/fixtures/member/get-customer-wishlist-result.json');
        });

        test('makes the correct rpc call', async () => {
            const rpcMock = rpcSpy.mockImplementation(() => Promise.resolve(getWishlistResult));

            const expectedSortDirection: SortDirection = <SortDirection> randomIntegerInRange(0, 2);
            const expectedParams = {
                size: 4,
                page: 1,
                sort: 'datetime_modified',
                sort_direction: SortDirection[expectedSortDirection].toLowerCase()
            };

            await memberService.getWishlist(expectedParams.page, expectedParams.size, expectedSortDirection, headers);

            expect.assertions(2);
            expect(rpcMock).toHaveBeenCalledTimes(1);
            expect(rpcMock).toBeCalledWith('members.getWishlist', expectedParams, headers);
        });

        test('total records correctly set from result', async () => {
            const totalCount = 10;
            //Fake the total count in our fixture
            getWishlistResult.result.total_records = totalCount;
            rpcSpy.mockImplementation(() => Promise.resolve(getWishlistResult));

            expect.assertions(1);

            const result = await memberService.getWishlist(1, 4, SortDirection.ASC, headers);
            expect(result.total).toBe(totalCount);
        });

        test('total records set to 0 when no results', async () => {
            const emptyResult = {result: {total_records: 0, result: []}};
            rpcSpy.mockImplementation(() => Promise.resolve(emptyResult));

            expect.assertions(1);

            const result = await memberService.getWishlist(1, 4, SortDirection.ASC, headers);
            expect(result.total).toBe(0);
        });

        test('throws exception when result is not an array', async () => {
            const badResult = {result: { result: {} }};
            rpcSpy.mockImplementation(() => Promise.resolve(badResult));

            expect.assertions(1);

            try {
                await memberService.getWishlist(1, 4, SortDirection.ASC, headers);
            } catch (e) {
                expect(e).toBeInstanceOf(BadGatewayException);
            }
        });

        test('throws exception when result is falsy', async () => {
            const badResult = {result: undefined};
            rpcSpy.mockImplementation(() => Promise.resolve(badResult));

            expect.assertions(1);

            try {
                await memberService.getWishlist(1, 4, SortDirection.ASC, headers);
            } catch (e) {
                expect(e).toBeInstanceOf(BadGatewayException);
            }
        });
    });

    describe( 'getWishlistProductIds', () => {
        let getWishlistProductIdsResult;

        beforeEach( () => {
            getWishlistProductIdsResult = require( '../../../tests/fixtures/member/get-customer-wishlist-product-ids-result.json' );
        } );

        test( 'makes the correct rpc call', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getWishlistProductIdsResult ) );

            expect.assertions( 2 );

            return memberService.getWishlistProductIds( headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.getWishlistProductIds' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getWishlistProductIdsResult ) );

            const expectedParams = { };

            expect.assertions( 2 );

            return memberService.getWishlistProductIds( headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'total records correctly set from result', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getWishlistProductIdsResult ) );

            expect.assertions( 1 );

            return memberService.getWishlistProductIds( headers ).then( result => {
                expect( result.total ).toBe( 8 );
            } );
        } );

        test( 'total records set to 0 when no results', () => {
            const emptyResult = { result: [] };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( emptyResult ) );

            expect.assertions( 2 );

            return memberService.getWishlistProductIds( headers ).then( result => {
                expect( result.total ).toBe( 0 );
                expect( result.masterProductIds.length ).toBe( 0 );
            } );
        } );

        test( 'throws exception when result is not an array', () => {
            const badResult = { result: {} };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( badResult ) );

            expect.assertions( 1 );

            return memberService.getWishlistProductIds( headers ).catch( result => {
                expect( result ).toBeInstanceOf( BadGatewayException );
            } );
        } );

        test( 'throws exception when result is falsy', () => {
            const badResult = { result: undefined };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( badResult ) );

            expect.assertions( 1 );

            return memberService.getWishlistProductIds( headers ).catch( result => {
                expect( result ).toBeInstanceOf( BadGatewayException );
            } );
        } );
    } );

    describe( 'addToWaitlist', () => {

        let addResult;
        let productRequest: ProductRequestDto;

        beforeEach( () => {

            addResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: {
                    message: '',
                    success: true
                },
                request_duration: 26
            };

            productRequest = new ProductRequestDto();
            productRequest.productId = 109;
            productRequest.waitlistTypeId = 1;
        } );

        test( 'call correct method', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            const result = await memberService.addToWaitlist( productRequest, sessionInfo, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.addToWaitlist' );
        } );

        test( 'passes correct params', async () => {

            const expectedParams = {
                customer: sessionInfo.customer,
                product_id: productRequest.productId,
                wait_list_type_id: productRequest.waitlistTypeId
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            const result = await memberService.addToWaitlist( productRequest, sessionInfo, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
        } );

        test( 'calculates auto purchase days correctly', async () => {

            const today = new Date();
            const newdate = new Date();
            newdate.setDate( today.getDate() + 30 );

            const expectedParams = {
                customer: headers.customer,
                product_id: productRequest.productId,
                wait_list_type_id: productRequest.waitlistTypeId,
                date_expires: newdate
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 3 );

            const s = expectedParams.date_expires.getDate();
            productRequest.autoPurchaseDays = 30;
            const result = await memberService.addToWaitlist( productRequest, sessionInfo, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 1 ].date_expires.getDate() ).toBe( expectedParams.date_expires.getDate() );
            expect( rpcMock.mock.calls[ 0 ][ 1 ].date_expires.getMonth() ).toBe( expectedParams.date_expires.getMonth() );
        } );

        test( 'sets date_expires correctly', async () => {

            const today = new Date();
            const newdate = new Date();
            newdate.setDate( today.getDate() + 30 );

            const expectedParams = {
                customer: sessionInfo.customer,
                product_id: productRequest.productId,
                wait_list_type_id: productRequest.waitlistTypeId,
                date_expires: newdate
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 3 );

            productRequest.dateExpires = newdate;
            const result = await memberService.addToWaitlist( productRequest, sessionInfo, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 1 ].date_expires.getDate() ).toBe( expectedParams.date_expires.getDate() );
            expect( rpcMock.mock.calls[ 0 ][ 1 ].date_expires.getMonth() ).toBe( expectedParams.date_expires.getMonth() );
        } );

        test( 'returns false when request fails gracefully', () => {
            addResult.result.success = false;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            return memberService.addToWaitlist( productRequest, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result ).toBeFalsy();
            } );
        } );

    } );

    describe( 'addSetToWaitlist', () => {

        let addResult;
        let productRequest: ProductSetRequestDto;

        beforeEach( () => {

            addResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: {
                    message: '',
                    success: true
                },
                request_duration: 26
            };

            productRequest = new ProductSetRequestDto();
            productRequest.setId = 109;
            productRequest.waitlistTypeId = 1;
            productRequest.componentProductIds = [ 110, 111 ];
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            return memberService.addSetToWaitlist( productRequest, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.addToWaitlist' );
            } );
        } );

        test( 'passes correct params', () => {

            const expectedParams = {
                customer: sessionInfo.customer,
                product_id: productRequest.setId,
                wait_list_type_id: productRequest.waitlistTypeId,
                component_product_id_list: productRequest.componentProductIds.join( ',' )
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            return memberService.addSetToWaitlist( productRequest, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'returns false when request fails gracefully', () => {
            addResult.result.success = false;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( addResult ) );

            expect.assertions( 2 );

            return memberService.addSetToWaitlist( productRequest, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result ).toBeFalsy();
            } );
        } );

    } );

    describe( 'removeFromWaitlist', () => {

        let removeResult;
        const waitlistItemId = 9897;

        beforeEach( () => {
            removeResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: {
                    message: '',
                    success: true
                },
                request_duration: 39
            };
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( removeResult ) );

            expect.assertions( 2 );

            return memberService.removeFromWaitlist( waitlistItemId, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.removeFromWaitlist' );
            } );
        } );

        test( 'passes correct params', () => {

            const expectedParams = {
                customer: sessionInfo.customer,
                membership_product_wait_list_id: waitlistItemId
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( removeResult ) );

            expect.assertions( 2 );

            return memberService.removeFromWaitlist( waitlistItemId, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'returns false when request fails gracefully', () => {
            removeResult.result.success = false;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( removeResult ) );

            expect.assertions( 2 );

            return memberService.removeFromWaitlist( waitlistItemId, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result ).toBeFalsy();
            } );
        } );
    } );

    describe( 'getOrderHistory', () => {

        let orderHistoryResult;
        const records = 5, pageIndex = 1, sort = 'ASC';
        const orderHistoryTracking = require( '../../../tests/fixtures/member/get-order-history-result.json' );

        beforeEach( () => {
            orderHistoryResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ [ {} ] ],
                request_duration: 39
            };
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( orderHistoryResult ) );

            expect.assertions( 2 );

            return memberService.getOrderHistory( pageIndex, records, sort, storeDetail, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.orderHistory' );
            } );
        } );

        test( 'check orderHistory Tracking is populated', async () => {
            rpcSpy.mockImplementation( () => Promise.resolve( orderHistoryTracking) );
            expect.assertions( 6 );

            const result = await memberService.getOrderHistory( pageIndex, records, sort, storeDetail, sessionInfo, headers );
            (<any> result.orders[0]).forEach( (o, index)  => {
                    expect(o.tracking).not.toBeUndefined();
                    expect(o.tracking[0].trackingNumber).toBe(orderHistoryTracking.result[0][index].tracking[0].TRACKING_NUMBER);
                    expect(o.tracking[0].trackingUrl).toBe(orderHistoryTracking.result[0][index].tracking[0].TRACKING_URL);
            } );
        } );

        test('check orderHistory Tracking is undefined', async () => {
            orderHistoryTracking.result[0] = orderHistoryTracking.result[0].map(x => {
                const clone = {...x};
                delete clone.tracking;
                return clone;
            });
            rpcSpy.mockImplementation(() => Promise.resolve(orderHistoryTracking));
            expect.assertions(4);
            const result = await memberService.getOrderHistory(pageIndex, records, sort, storeDetail, sessionInfo, headers);
            (<any> result.orders[0]).forEach(o => {
                expect(o.tracking).not.toBeUndefined();
                expect(o.tracking.length).toEqual(0);
            });
        });
        test('check orderHistory Tracking is undefined', async () => {
            orderHistoryTracking.result[0] = orderHistoryTracking.result[0].map(x => {
                const clone = {...x};
                clone.tracking = [];
                return clone;
            });
            rpcSpy.mockImplementation(() => Promise.resolve(orderHistoryTracking));
            expect.assertions(4);
            const result = await memberService.getOrderHistory(pageIndex, records, sort, storeDetail, sessionInfo, headers);
            (<any> result.orders[0]).forEach(o => {
                expect(o.tracking).not.toBeUndefined();
                expect(o.tracking.length).toEqual(0);
            });
        });

        test( 'passes correct params', () => {

            const expectedParams = {
                customer: sessionInfo.customer,
                store_group_id: storeDetail.storeGroupId,
                sort,
                records_per_page: records,
                page_index: pageIndex
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( orderHistoryResult ) );

            expect.assertions( 2 );

            return memberService.getOrderHistory( pageIndex, records, sort, storeDetail, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );
    } );

    describe( 'getCustomerProductReviews', () => {

        let reviewResult;
        const records = 5;

        beforeEach( () => {
            reviewResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ {} ],
                request_duration: 39
            };
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getCustomerProductReviews( records, 1, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'reviews.GetReviewsByCustomerId' );
            } );
        } );

        test( 'passes correct params', () => {

            const expectedParams = {
                master_product_ids: '',
                records,
                page: 1
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getCustomerProductReviews( records, 1, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );
    } );

    describe( 'getReviewableProducts', () => {

        let reviewResult;
        const records = 5;

        beforeEach( () => {
            reviewResult = {
                jsonrpc: ' 2.0',
                id: 2,
                // tslint:disable-next-line: max-line-length
                result: [ { id: 1, master_product_id: 8517514, label: 'Scalloped Lace Brazilian', alias: 'UD1931999-3008 (Twisted Green Lime/Pink AF)', product_id: 8517520, order_id: 310193464, color: 'Twisted Green Lime/Pink AF', item_number: 'UD1931999-3008-57020', size: 'S', product_type_id: 1, datetime_added: null }, { id: 1, master_product_id: 8517514, label: 'Scalloped Lace Brazilian', alias: 'UD1931999-3008 (Twisted Green Lime/Pink AF)', product_id: 8517520, order_id: 310193464, color: 'Twisted Green Lime/Pink AF', item_number: 'UD1931999-3008-57020', size: 'S', product_type_id: 1, datetime_added: 'April, 18 2019 00:00:00' }, { id: 2, master_product_id: 8517880, label: 'Glissenette High-Waist Thong', alias: 'UD1931939-0204 (Metallic Honey Money)', product_id: 8517889, order_id: 310194433, color: 'Metallic Honey Money', item_number: 'UD1931939-0204-15120', size: '3X', product_type_id: 1, datetime_added: 'April, 18 2019 00:00:00' }, { id: 3, master_product_id: 7660801, label: 'Logo X Satin Bandeau Bralette', alias: 'BB1831711-5034 (Purple Fairy Dust X)', product_id: 7660813, order_id: 310194433, color: 'Purple Fairy Dust X', item_number: 'BB1831711-5034-57040', size: 'L', product_type_id: 1, datetime_added: 'October, 25 2018 00:00:00' }, { id: 4, master_product_id: 8517814, label: 'Glissenette Push Up Bra', alias: 'BA1931926-0204 (Metallic Honey Money)', product_id: 8517823, order_id: 310194484, color: 'Metallic Honey Money', item_number: 'BA1931926-0204-14350', size: '40D', product_type_id: 1, datetime_added: 'April, 18 2019 00:00:00' }, { id: 5, master_product_id: 8517112, label: 'Lace T-Shirt Bra', alias: 'BA1825661-7022 (Unicorn Lavender Pink)', product_id: 8517115, order_id: 310194544, color: 'Unicorn Lavender Pink', item_number: 'BA1825661-7022-14330', size: '38DD', product_type_id: 1 } ],
                request_duration: 39
            };
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getReviewableProducts( sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.GetAvailableProductsToReviewByCustomerByStoreGroup' );
            } );
        } );

        test( 'sorts products by newest to oldest', () => {

            const expectedParams = {
                master_product_ids: '',
                records,
                page: 1
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getReviewableProducts( sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result[ result.length - 1 ].itemNumber ).toBe('BB1831711-5034-57040');
            } );
        } );

        test( 'sorts products by newest to oldest if date is null or date_time missing', () => {

            const expectedParams = {
                master_product_ids: '',
                records,
                page: 1
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getReviewableProducts( sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result[ result.length - 1 ].itemNumber ).toBe( 'BB1831711-5034-57040' );
            } );
        } );
    } );

    describe( 'getCustomerProductReview', () => {

        let reviewResult;
        const reviewId = 7321708;

        beforeEach( () => {
            reviewResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ {} ],
                request_duration: 39
            };
        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getCustomerProductReview( reviewId, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'reviews.GetReviewsById' );
            } );
        } );

        test( 'passes correct params', () => {

            const expectedParams = {
                review_id: reviewId
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.getCustomerProductReview( reviewId, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );
    } );

    describe( 'submitProductReview', () => {

        let reviewResult, review;

        beforeEach( () => {
            reviewResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: {
                    ok: true
                },
                request_duration: 39
            };

            review = new SubmitProductReviewDto();
            review.reviewTemplateId = 56;
            review.pageNumber = 1;
            review.productId = 1111;
            review.formData = {};
            review.reviewId = 0;
            review.orderId = 0;
            review.allowReviewUpdate = true;
            review.points = 0;

        } );

        test( 'call correct method', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.submitProductReview( review, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.submitReview' );
            } );
        } );

        test( 'passes correct params', () => {

            const expectedParams = {
                customer: sessionInfo.customer,
                review_template_id: review.reviewTemplateId,
                page_number: review.pageNumber,
                product_id: review.productId,
                form_data: review.formData,
                review_id: review.reviewId,
                order_id: review.orderId,
                allow_review_update: review.allowReviewUpdate,
                points: review.points
            };

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( reviewResult ) );

            expect.assertions( 2 );

            return memberService.submitProductReview( review, sessionInfo, headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );
    } );

    describe( 'returnProduct', () => {

        let returnProductResult;
        let rmaDetails: OrderRmaDto;

        beforeEach( () => {
            returnProductResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ {
                    success: true,
                    data: {}
                } ]
            };

            rmaDetails = new OrderRmaDto();
            rmaDetails.orderId = 111;
            rmaDetails.items = [];
            const item = new RmaItemDto();
            item.actionId = 1;
            item.orderLineId = 2;
            item.comment = '';
            item.conditionId = 1;
            item.exchangeProductId = 0;
            item.reasonId = 3;
            item.restockingFeeId = 0;
            rmaDetails.items.push( item );
        } );

        test( 'makes the correct rpc call', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnProductResult ) );

            expect.assertions( 2 );

            return memberService.returnProduct( rmaDetails, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'orders.returnProduct' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnProductResult ) );

            expect.assertions( 2 );

            const expectedParams = { ...rmaDetails.toRpcParams() };

            return memberService.returnProduct( rmaDetails, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'return true when save succeeds', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnProductResult ) );

            expect.assertions( 2 );

            return memberService.returnProduct( rmaDetails, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.success ).toBeTruthy();

            } );
        } );

        test( 'return false when save fails', () => {
            const returnProductFault = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ {
                    success: false,
                    errors: [],
                    errorCode: 0,
                    errorMessage: ''
                } ]
            };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnProductFault ) );

            expect.assertions( 2 );

            return memberService.returnProduct( rmaDetails, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.success ).toBeFalsy();
            } );
        } );

    } );

    describe( 'getReturnableProductsByOrderId', () => {

        let returnableProductsResult, orderId;

        beforeEach( () => {
            returnableProductsResult = {
                jsonrpc: ' 2.0',
                id: 2,
                result: [ {
                    products: {
                        3333: {
                            ORDER_LINE_ID: 3333,
                            ITEM_ID: 537167,
                            PRODUCT_ID: 1,
                            RMA_PRODUCT_ID: 0,
                            RETURNABLE: 1
                        }
                    }
                } ]
            };

            orderId = 111;
        } );

        test( 'makes the correct rpc call', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnableProductsResult ) );

            expect.assertions( 2 );

            return memberService.getReturnableProductsByOrderId( orderId, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'orders.returnableProductsByOrderID' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnableProductsResult ) );

            expect.assertions( 2 );

            const expectedParams = { order_id: orderId };

            return memberService.getReturnableProductsByOrderId( orderId, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'returns product as an array', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnableProductsResult ) );

            expect.assertions( 2 );

            return memberService.getReturnableProductsByOrderId( orderId, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.products.length ).toBeGreaterThan( 0 );

            } );
        } );

        test( 'returns product array of ReturnableProductDtos', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( returnableProductsResult ) );
            expect.assertions( 2 );

            return memberService.getReturnableProductsByOrderId( orderId, headers ).then( ( result ) => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( result.products[ 0 ] ).toBeInstanceOf( ReturnableProductDto );

            } );
        } );

    } );

    describe( 'saveProspect', () => {

        const saveProspectResult = { customer_id: 234234234, sha_email: '6CA4FD348B07', hashed_user_email: '7FDABD2E9' };

        test( 'makes the correct rpc call', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: saveProspectResult } ) );

            expect.assertions( 2 );

            const result = await memberService.saveProspectiveCustomer( customerSignupDto.email, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.saveProspectiveCustomer' );
        } );

        test( 'passes the correct params', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: saveProspectResult } ) );

            expect.assertions( 2 );

            const expectedParams = {
                email: customerSignupDto.email
            };

            const result = await memberService.saveProspectiveCustomer( customerSignupDto.email, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
        } );

        test( 'return customer when the save succeeds', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: saveProspectResult } ) );

            expect.assertions( 4 );

            const result = await memberService.saveProspectiveCustomer( customerSignupDto.email, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( result.customerId ).toBe( saveProspectResult.customer_id );
            expect( result.hashedUserEmail ).toBe( saveProspectResult.hashed_user_email );
            expect( result.shaEmail ).toBe( saveProspectResult.sha_email );
        } );

        test( 'email exists', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: { email_exists: true } } ) );

            expect.assertions( 2 );

            const result = await memberService.saveProspectiveCustomer( customerSignupDto.email, headers );
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
            expect( result.userExists ).toBe( true );
        } );
    } );

    describe( 'MemberDetails', () => {

        let customerDetails: CustomerDetailDto;
        beforeEach( () => {
            customerDetails = new CustomerDetailDto();
            customerDetails.name = 'test';
            customerDetails.value = 'testValue';
        } );

        test( 'setCustomerDetails', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [ { success: true } ] } ) );

            expect.assertions( 1 );
            const rpcResult = await memberService.saveCustomerDetail( customerDetails, headers );
            expect( rpcResult ).toBe( true );
        } );

        test( 'getCustomerDetails', async () => {
            const result = {
                jsonrpc: '2.0',
                id: 2,
                result: [
                    {
                        value: 5.5,
                        datetime_added: '2018-12-30T10:20:58-05:00',
                        name: 'shoe-size'
                    },
                    {
                        value: 'mpub=|pcode=|plabel=|ccode=|clabel=',
                        datetime_added: '2010-08-30T10:20:58-05:00',
                        name: 'pcode_registration_data'
                    }
                ],
                request_duration: 4
            };

            const details = plainToClass(CustomerDetailDto, result.result);

            const rpcMock = rpcSpy.mockImplementation(() => Promise.resolve(result));
            const theNames = ['shoe-size', 'pcode_registration_data'];

            expect.assertions(4);
            const actual = await memberService.getCustomerDetail(theNames, headers);

            expect(rpcMock).toBeCalledWith('members.getDetailByName', {name: theNames.join(',')}, headers);
            expect(actual[0].datetimeAdded).not.toBeUndefined();
            expect(actual[1].datetimeAdded).not.toBeUndefined();

            expect(actual).toEqual(details);
        } );
    } );

    describe('and getOnSiteMembershipExperienceDetail', () => {
        describe('and customer detail collection undefined', () => {
            test('should be empty customerDetailDto', async () => {
                memberService.getCustomerDetail = jest.fn().mockResolvedValue(undefined);
                const result = await memberService.getOnSiteMembershipExperienceDetail(new HeadersDto());

                expect(result).toEqual(new CustomerDetailDto());
            });
        });
        describe('and customer detail collection empty', () => {
            test('should be empty customerDetailDto', async () => {
                memberService.getCustomerDetail = jest.fn().mockResolvedValue([]);
                const result = await memberService.getOnSiteMembershipExperienceDetail(new HeadersDto());

                expect(result).toEqual(new CustomerDetailDto());
            });
        });
        describe('and customer detail collection does not contain datetimeAdded', () => {
            test('should be empty customerDetailDto', async () => {
                const customerDetailDto = new CustomerDetailDto();
                customerDetailDto.name = 'retail_postreg_start';
                customerDetailDto.value = randomString();
                customerDetailDto.datetimeAdded = undefined;
                memberService.getCustomerDetail = jest.fn().mockResolvedValue([customerDetailDto]);
                const result = await memberService.getOnSiteMembershipExperienceDetail(new HeadersDto());

                expect(result).toEqual(customerDetailDto);
            });
        });
        describe('and customer detail collection does contain datetimeAdded', () => {
            test('should be empty customerDetailDto', async () => {
                const customerDetailDto = new CustomerDetailDto();
                customerDetailDto.name = 'retail_postreg_start';
                customerDetailDto.value = randomString();
                customerDetailDto.datetimeAdded = new Date();
                memberService.getCustomerDetail = jest.fn().mockResolvedValue([customerDetailDto]);
                const result = await memberService.getOnSiteMembershipExperienceDetail(new HeadersDto());

                expect(result).toEqual(customerDetailDto);
            });
        });
    });

    describe( 'MemberProfiles', () => {

        const memberProfileResult = require( '../../../tests/fixtures/member/get-member-profiles-result.json' );
        const memberNoAllProfilesResult = require( '../../../tests/fixtures/member/get-member-no-all-profiles-result.json' );

        test( 'it should serialize all available profiles', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( memberProfileResult ) );
            expect.assertions( 2 );
            const rpcResult = await memberService.getMemberProfiles( 23525354, headers );
            expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.getMemberProfiles' );
            expect( rpcResult ).toBeDefined();
            expect( rpcResult.allProfiles.length );

        } );

        test( 'it should not error if there are no all_profiles', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( memberNoAllProfilesResult ) );
            expect.assertions( 2 );
            const rpcResult = await memberService.getMemberProfiles( 23525354, headers );
            expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.getMemberProfiles' );
            expect( rpcResult ).toBeDefined();
            expect( rpcResult.allProfiles.length );

        } );
    } );

    describe( 'getPayments', () => {

        let getPaymentsResultPSP;

        beforeEach( () => {
            getPaymentsResultPSP = require( '../../../tests/fixtures/member/get-payments-psp-result.json' );
        } );

        test( 'psp, trasform', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getPaymentsResultPSP ) );

            expect.assertions( 3 );

            const result = await memberService.getPaymentInfo( sessionInfo, headers );
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toBeInstanceOf( PaymentOptionResponseDto );
            expect( result[ 0 ].paymentServiceProviderId ).toBeGreaterThan( 0 );
        } );

    } );

    describe( 'getActiveMemberPromos', () => {

        let getMembersActivePromos, activeDate;

        beforeEach( () => {
            getMembersActivePromos = require( '../../../tests/fixtures/member/get-members-active-promos-result.json' );
            activeDate = '2018-06-01';
        } );

        test( 'trasform', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: getMembersActivePromos } ) );

            expect.assertions( 4 );

            const result = await memberService.getActiveMemberPromos( activeDate, headers );
            expect( result.length ).toBeGreaterThan( 1 );
            expect( result[ 0 ] ).toBeInstanceOf( MembersActivePromoDto );
            expect( Array.isArray( result[ 0 ].discounts ) );
            expect( result[ 0 ].dateEnd ).toBe( null );
            expect( result[ 0 ].dateStart ).toBeInstanceOf( Date );
        } );

    } );

    describe( 'validateUser', () => {

        let validateUserResultCaptital, valdateUserResultLower;

        beforeEach( () => {
            validateUserResultCaptital = { LOGGED_IN: true };
            valdateUserResultLower = { logged_in: true };
        } );

        test( 'LOGGED_IN true', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [ validateUserResultCaptital ] } ) );

            const result = await memberService.validateUser( sessionInfo, headers );
            expect( result ).toBeTruthy();
        } );

        test( 'LOGGED_IN false', async () => {
            validateUserResultCaptital = { LOGGED_IN: false };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [ validateUserResultCaptital ] } ) );

            const result = await memberService.validateUser( sessionInfo, headers );
            expect( result ).toBeFalsy();
        } );

        test( 'logged_in true', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [ valdateUserResultLower ] } ) );

            const result = await memberService.validateUser( sessionInfo, headers );
            expect( result ).toBeTruthy();
        } );

        test( 'logged_in false', async () => {
            valdateUserResultLower = { logged_in: false };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [ valdateUserResultLower ] } ) );

            const result = await memberService.validateUser( sessionInfo, headers );
            expect( result ).toBeFalsy();
        } );

        test( 'result undefined exception', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( { result: [] } ) );
            try {
                const result = await memberService.validateUser( sessionInfo, headers );
            }
            catch ( err ) {
                expect( err ).toBeInstanceOf( BadGatewayException );
            }
        } );

    } );

    describe( 'getWaitlistComponents', () => {
        let getWaitlistComponentResult;

        beforeEach( () => {
            getWaitlistComponentResult = require( '../../../tests/fixtures/member/get-customer-waitlist-component-result.json' );
        } );

        test( 'makes the correct rpc call', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getWaitlistComponentResult ) );

            expect.assertions( 2 );

            return memberService.getWaitlistComponents( [1], headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.getWaitlistComponents' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getWaitlistComponentResult ) );

            const expectedParams = {
                waitlist_ids: [1]
            };

            expect.assertions( 2 );

            return memberService.getWaitlistComponents( [1], headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'throws exception when result is was not returned', () => {
            const badResult = { result: undefined };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( badResult ) );

            expect.assertions( 1 );

            return memberService.getWaitlistComponents( [1], headers ).catch( result => {
                expect( result ).toBeInstanceOf( BadGatewayException );
            } );
        } );
    } );

    describe( 'getAdyenPaymentSession', () => {
        const payment_session = 'fake-payment-1234-40903-session';
        const paymentSessionMockResponse = { result: [ { payment_session } ] };
        let paymentSessionRequest: AdyenPaymentSessionRequestDto;
        let rpcMock;

        const setupRpcMock = () => {
            rpcMock =  rpcSpy.mockImplementation( () => Promise.resolve( paymentSessionMockResponse ) );
        };

        beforeEach( () => {
            paymentSessionRequest = new AdyenPaymentSessionRequestDto();
            paymentSessionRequest.amount = 100;
            paymentSessionRequest.returnUrl = 'https://some.return.url.com/path';
            paymentSessionRequest.token = 'flubber';
        });

        test('returns paymentSession', () => {
            setupRpcMock();
            expect.assertions(2);

            return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                expect( result ).toBeInstanceOf( AdyenPaymentSessionResponseDto );
                expect( result.paymentSession ).toBe( payment_session );
            } );
        });

        describe( 'token_sdk', () => {
            test( 'token_sdk set to ios', () => {
                setupRpcMock();
                expect.assertions( 2 );

                return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].token_sdk ).toBe( 'ios' );
                } );
            } );
        });

        describe( 'psp_test_order', () => {

            test( 'false when testOrder undefined', () => {
                setupRpcMock();
                expect.assertions( 2 );

                return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].psp_test_order ).toBe( false );
                } );
            } );

            test( 'false when testOrder null', () => {
                paymentSessionRequest.testOrder = null;
                setupRpcMock();
                expect.assertions( 2 );
                return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].psp_test_order ).toBe( false );
                } );
            } );

            test( 'false when testOrder false', () => {
                paymentSessionRequest.testOrder = false;
                setupRpcMock();
                expect.assertions( 2 );

                return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].psp_test_order ).toBe( false );
                } );
            } );

            test( 'true when testOrder true', () => {

                paymentSessionRequest.testOrder = true;
                setupRpcMock();
                expect.assertions( 2 );

                return memberService.getAdyenPaymentSession(paymentSessionRequest, headers ).then( result => {
                    expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                    expect( rpcMock.mock.calls[ 0 ][ 1 ].psp_test_order ).toBe( true );
                } );
            } );
        });

        describe('removePsp', () => {

        });

        describe('removeCreditCard', () => {

        });

        describe('patchPSPPaymentInfo', () => {

        });

    });
} );
