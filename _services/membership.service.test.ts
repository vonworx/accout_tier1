import { MembershipService } from './membership.service';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { StoreDetailDto } from '../../common/dto/store-detail.dto';
import { SessionInfoDto } from '../../common/dto/session-info.dto';
import { Logger } from '../../common/logging/log.service';
import { MembershipDto, MemberStatusRequestDto, MemberPromoRequestDto, MembershipTrialDetail, MembershipPeriodDto, MembershipLoyaltyDto, SkipMembershipPeriodDto, LoyaltyHistoryDto, LoyaltyRedemptionDto, LoyaltyTierDto } from '../dto';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { SortDirection } from '../../common/dto/sort-field';

describe( 'MembershipService', () => {
    let service: MembershipService, rpcSpy: jest.SpyInstance;
    const headers: HeadersDto = new HeadersDto();
    let storeDetail: StoreDetailDto, sessionInfo: SessionInfoDto, configurationDto: ConfigurationDto;
    beforeEach( () => {
        configurationDto = new ConfigurationDto( process.env );
        service = new MembershipService( new Logger( '' ), configurationDto );
        rpcSpy = jest.spyOn( service, 'rpc' );

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
    } );

    describe( 'getMembershipDetail', () => {

        let getMembershipRpcResult;
        beforeEach( () => {
            getMembershipRpcResult = require( '../../../tests/fixtures/member/get-membership-details-result.json' );
        } );

        test( 'Returns a MembershiptDto', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result ).toBeInstanceOf( MembershipDto );
            } );
        } );

        test( 'Hydrates store credit balance', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result.storeCredits[ 0 ].balance ).toBe( 25 );
            } );
        } );

        test( 'Hydrates inFreeTrial, false', () => {
            getMembershipRpcResult.result[ 0 ].in_free_trial = false;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result.inFreeTrial ).toBe( false );
            } );
        } );

        test( 'Hydrates inFreeTrial, true', () => {
            getMembershipRpcResult.result[ 0 ].in_free_trial = true;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result.inFreeTrial ).toBe( true );
            } );
        } );

        test( 'Creates membershipTrials array', () => {
            getMembershipRpcResult.result[ 0 ].in_free_trial = true;
            getMembershipRpcResult.result[ 0 ].free_trial[0].datetime_added = new Date();
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 5 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result.membershipTrials ).toBeInstanceOf( Array );
                expect( result.membershipTrials ).toHaveLength( 1 );
                expect( result.membershipTrials[ 0 ] ).toBeInstanceOf( MembershipTrialDetail );
                expect( result.membershipTrials[ 0 ].dateTimeAdded ).toBeInstanceOf( Date );
                expect( result.membershipTrials[ 0 ].dateTimeCancelled ).toBe( null );
            } );
        } );

        test( 'Creates empty membershipTrials array', () => {
            getMembershipRpcResult.result[ 0 ].free_trial = [];
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 2 );
            return service.getMembershipDetail( headers ).then( result => {
                expect( result.membershipTrials ).toBeInstanceOf( Array );
                expect( result.membershipTrials ).toHaveLength( 0 );
            } );
        } );
    } );

    describe( 'cancelMembership', () => {
        let cancelResult, statusRequest: MemberStatusRequestDto;

        beforeEach( () => {
            cancelResult = require( '../../../tests/fixtures/member/cancel-membership-result.json' );
            statusRequest = new MemberStatusRequestDto();
            statusRequest.reasonId = 3490;
            statusRequest.status = 'CANCEL';
        } );

        test( 'Returns true with successful response', () => {
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( cancelResult ) );

            expect.assertions( 1 );
            return service.cancelMembership( statusRequest, headers ).then( result => {
                expect( result ).toBe( true );
            } );
        } );

        test( 'Passes the reason code in params', () => {
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( cancelResult ) );

            expect.assertions( 1 );
            return service.cancelMembership( statusRequest, headers ).then( result => {
                expect( rpcSpy.mock.calls[ 0 ][ 1 ].reason_id ).toBe( statusRequest.reasonId );
            } );
        } );

        test( 'Throws bad gateway when success is false', () => {
            const msg = 'Bad Things Happened';
            cancelResult.result[ 0 ].data.success = false;
            cancelResult.result[ 0 ].data.message = msg;

            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( cancelResult ) );

            expect.assertions( 1 );
            return service.cancelMembership( statusRequest, headers ).catch( err => {
                expect( err ).toBeInstanceOf( BadGatewayException );
            } );
        } );

    } );

    describe( 'addPromo', () => {
        let addPromoResult, promoRequest: MemberPromoRequestDto;

        beforeEach( () => {
            addPromoResult = require( '../../../tests/fixtures/member/addPromo-result.json' );

            promoRequest = new MemberPromoRequestDto();
            promoRequest.allowSamePromoType = true;
            promoRequest.promoTypeId = 2;
            promoRequest.promoCode = 'FUZZY25';
            promoRequest.startDate = new Date();
            promoRequest.endDate = new Date();
        } );

        test( 'makes the rpc call', async () => {
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( addPromoResult ) );

            expect.assertions( 2 );

            const result = await service.addPromo( promoRequest, headers );

            expect( rpcMock ).toHaveBeenCalled();
            expect( rpcMock ).toHaveBeenCalledTimes( 1 );
        } );

        test( 'allowSamePromoType true integration', async () => {
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( addPromoResult ) );

            expect.assertions( 1 );
            const result = await service.addPromo( promoRequest, headers );
            expect( rpcSpy.mock.calls[ 0 ][ 1 ].allow_same_type_promo ).toBe( 1 );

        } );

        test( 'allowSamePromoType false integration', async () => {
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( addPromoResult ) );
            promoRequest.allowSamePromoType = false;
            expect.assertions( 1 );
            const result = await service.addPromo( promoRequest, headers );
            expect( rpcSpy.mock.calls[ 0 ][ 1 ].allow_same_type_promo ).toBe( 0 );
        } );

        test( 'throws exception when request fails', async () => {
            addPromoResult.result.success = false;
            const rpcMock: jest.Mock = rpcSpy.mockImplementation( () => Promise.resolve( addPromoResult ) );

            expect.assertions( 1 );
            try {
                const result = await service.addPromo( promoRequest, headers );
            } catch ( e ) {
                expect( e ).toBeInstanceOf( BadGatewayException );
            }

        } );

    } );

    describe( 'MembershipPeriod', () => {

        let getMembershipPeriodRpcResult, skipMembershipPeriodRpcResult, getMembershipPeriodTokenBasedRpcResult;
        beforeEach( () => {
            getMembershipPeriodRpcResult = require( '../../../tests/fixtures/member/get-membership-period-credit-based-result.json' );
            skipMembershipPeriodRpcResult = require( '../../../tests/fixtures/member/skip-period-result.json' );
            getMembershipPeriodTokenBasedRpcResult = require( '../../../tests/fixtures/member/get-membership-period-token-based-result.json' );
        } );

        test( 'Returns a MembershiptPeriodDto', () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result ).toBeInstanceOf( MembershipPeriodDto );
            } );
        } );

        test( 'Hydrates skipAllowed, true', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.skipAllowed ).toBe( true );
            } );
        } );

        test( 'Hydrates periodLabel', () => {
            skipMembershipPeriodRpcResult.result[ 0 ].in_free_trial = true;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodRpcResult ) );

            expect.assertions( 1 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.periodLabel ).toBe( 'April 2020' );
            } );
        } );

        test( 'Hydrates vipPlusPerksAvailable, true', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodTokenBasedRpcResult ) );

            expect.assertions( 2 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.vipPlusPerksAvailable ).toBe( true );
                expect( result.membershipTypeId ).toBe( 3 );
            } );
        } );

        test( 'Hydrates vipPlusPerksAvailable, false', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodRpcResult ) );

            expect.assertions( 2 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.vipPlusPerksAvailable ).toBe( false );
                expect( result.membershipTypeId ).toBe( 1 );
            } );
        } );

        test( 'membershipPeriodId available', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodRpcResult ) );

            expect.assertions( 3 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.membershipPeriodId ).toBeDefined();
                expect( result.membershipBillingId ).toBeUndefined();
                expect( result.membershipTypeId ).toBe( 1 );
            } );
        } );

        test( 'membershipBillingId available', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipPeriodTokenBasedRpcResult ) );

            expect.assertions( 3 );
            return service.getMembershipPeriod( headers ).then( result => {
                expect( result.membershipBillingId ).toBeDefined();
                expect( result.membershipPeriodId ).toBeUndefined();
                expect( result.membershipTypeId ).toBe( 3 );
            } );
        } );

        test( 'it should return membership period for specific date', async () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( skipMembershipPeriodRpcResult ) );
            headers.session = '8027D83E-24759B29-AABE-446C-939F-02FE5E3E8EF6';
            headers.storeGroupId = 34;
            headers.customer = 'B1882B8-B2D21A72-7122-4C76-9034-3438235280B1';

            expect.assertions( 1 );
            const result = await service.getMembershipSkipPeriod( new Date(), headers );
            expect( result ).toBeDefined();
        });
        test( 'it should return confirmation that user has skipped the month', async () => {
            const skipMembershipPeriod: SkipMembershipPeriodDto = new SkipMembershipPeriodDto();
            // tslint:disable-next-line:max-line-length
            const rpcResult = { jsonrpc: '2.0', id: 1543440773403, result: [ { errorMessage: '', requestDurationInMilliseconds: 0, errors: [], success: true, statusCode: 200, stackTrace: '', subErrorCode: 0, successMessage: '', data: '', errorCode: 0, errorDetail: '', result: [], requestID: 0, statusText: 'OK' } ], request_duration: 5 };
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( rpcResult ) );

            skipMembershipPeriod.membershipRecommendationId = 156087150;
            skipMembershipPeriod.periodId = 1012;
            skipMembershipPeriod.membershipSkipReasonId = 0;
            skipMembershipPeriod.reasonComment = 'No money no problems';
            headers.session = '8028ECFA-4886C145-5F1A-4873-8134-81BBF3C46F0E';
            headers.customer = 'B190C4F-C220E305-2FF7-4F33-87E5-C85138369125';
            expect.assertions( 1 );
            const result = await service.skipMembershipPeriod( skipMembershipPeriod, headers );
            expect( result ).toBe( true );
        } );

    } );

    describe( 'getMemberLoyalty', () => {

        let getLoyaltyRewardsRpcResult;
        beforeEach( () => {
            getLoyaltyRewardsRpcResult = require( '../../../tests/fixtures/member/get-loyalty-details-result.json' );
        } );

        test( 'Returns a MembershipLoyaltyDto', async () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getLoyaltyRewardsRpcResult ) );

            expect.assertions( 1 );
            const result = await service.getLoyaltyDetails( sessionInfo, headers );
            expect( result ).toBeInstanceOf( MembershipLoyaltyDto );
        } );

    } );

    describe( 'getLoyaltyHistory', () => {

        let saveLoyaltyRewardsRpcResult;
        beforeEach( () => {
            saveLoyaltyRewardsRpcResult = require( '../../../tests/fixtures/member/get-loyalty-history-result.json' );
        } );

        test( 'Returns a LoyaltyHistoryDto.',  () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( saveLoyaltyRewardsRpcResult ) );

            expect.assertions( 3 );
            return service.getLoyaltyHistory( sessionInfo, headers, 1, 3 ).then(result => {
                expect( result.pageNumber ).toBe( 1 );
                expect( result.pageCount ).toBe( 3 );
                expect( result.historyData ).toBeInstanceOf( Array );
            });
        } );

    } );

    describe('getMemberPersona', () => {
        let getMembershipRpcResult;
        beforeEach( () => {
            getMembershipRpcResult = require( '../../../tests/fixtures/member/get-member-persona-result.json' );
        } );

        test( 'Hydrates a persona, with persona data', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 2 );
            return service.getMemberPersona( headers ).then(result => {
                expect( result.personaTagId ).toBe( 3983 );
                expect( result.personaName ).toBe( 'The Bombshell' );
            });
        } );

        test( 'Hydrates a persona, with default values', () => {
            getMembershipRpcResult.result = undefined;
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( getMembershipRpcResult ) );

            expect.assertions( 2 );
            return service.getMemberPersona( headers ).then(result => {
                expect( result.personaTagId ).toBe( 0 );
                expect( result.personaName ).toBe( '' );
            });
        } );

    });

    describe( 'deleteMembershipPromo', () => {
        let deleteMembershipPromoResult;
        let recordNotFoundResult;
        let badResult;

        beforeEach( () => {
            deleteMembershipPromoResult = { result: [ { success: true } ] };
            recordNotFoundResult = { result: undefined, errors: [ { code: -32604 } ] };
            badResult = { result: undefined, errors: [ { code: -32054 } ] };
        } );

        test( 'makes the correct rpc call', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( deleteMembershipPromoResult ) );

            expect.assertions( 2 );

            return service.deleteMembershipPromo( 'promo123', headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 0 ] ).toBe( 'members.deletePromo' );
            } );
        } );

        test( 'passes the correct params', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( deleteMembershipPromoResult ) );

            const expectedParams = {
                promo: 'promo123'
            };

            expect.assertions( 2 );

            return service.deleteMembershipPromo( 'promo123', headers ).then( result => {
                expect( rpcMock ).toHaveBeenCalledTimes( 1 );
                expect( rpcMock.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedParams );
            } );
        } );

        test( 'throws not found exception if an invalid promo was passed in', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( recordNotFoundResult ) );

            expect.assertions( 1 );

            return service.deleteMembershipPromo( 'promo123', headers ).catch( result => {
                expect( result ).toBeInstanceOf( NotFoundException );
            } );
        } );

        test( 'throws an exception for any other errors', () => {
            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( badResult ) );

            expect.assertions( 1 );

            return service.deleteMembershipPromo( 'promo123', headers ).catch( result => {
                expect( result ).toBeInstanceOf( BadGatewayException );
            } );
        } );
    } );

    describe( 'getMembershipTokens', () => {

        let saveTokenDetailsRpcResult;
        beforeEach( () => {
            saveTokenDetailsRpcResult = require( '../../../tests/fixtures/member/get-token-details-result.json' );
        } );

        test( 'Returns a TokenHistoryDto with token information in asc order.',  () => {

            const rpcMock = rpcSpy.mockImplementation( () => Promise.resolve( saveTokenDetailsRpcResult ) );

            expect.assertions( 4 );
            return service.getMembershipTokens( headers, 1, 3, SortDirection.ASC ).then(result => {
                expect( result.pageNumber ).toBe( 1 );
                expect( result.pageCount ).toBe( 1 );
                expect( result.tokenDetails ).toBeInstanceOf( Array );
                expect( result.tokenDetails[0].membershipTokenId ).toBe( 2 );
            });
        } );

    } );

} );
