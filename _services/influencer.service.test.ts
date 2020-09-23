'use strict';

import { Logger } from '../../common/logging/log.service';
import { StoreDetailDto } from '../../common/dto/store-detail.dto';
import { SessionInfoDto } from '../../common/dto/session-info.dto';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { InfluencerService } from './influencer.service';
import { ResetInfluencerPasswordRequestDto } from '../../common/dto/reset-password-request.dto';

describe( 'InfluencerService', () => {
    let influencerService: InfluencerService, storeDetail: StoreDetailDto, sessionInfo: SessionInfoDto, configurationDto: ConfigurationDto;
    let headers: HeadersDto;

    beforeAll( () => {
        configurationDto = new ConfigurationDto( process.env );
    } );

    let rpcSpy: jest.SpyInstance;

    beforeEach( () => {
        influencerService = new InfluencerService( new Logger( ''), configurationDto );
        rpcSpy = jest.spyOn( influencerService, 'rpc' );

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

        headers = new HeadersDto();
        headers.ip = '0.0.0.0';
        headers.storeGroupId = storeDetail.storeGroupId;
        headers.session = sessionInfo.session;
        headers.customer = sessionInfo.customer;
    } );

    afterEach( () => {
        rpcSpy.mockReset();
        rpcSpy.mockRestore();
    } );

    describe( 'influencerPasswordResetRequired', () => {

        let validateInfluencerResult, prkey;

        beforeEach( () => {
            prkey = '186428416-9af09542d5b0093cb4c6a409aca5f2ce';
            validateInfluencerResult = {
                reset_required : true,
                email : 'test@test.com',
                full_name: 'Testy Tester'
            };
        } );

        test( 'Influencer pw reset check required', async () => {

            const rpcMock = rpcSpy.mockImplementation ( () => Promise.resolve( {result: validateInfluencerResult } ));

            const result = await influencerService.resetPasswordRequired( prkey, headers );
            expect( result.resetRequired ).toBeTruthy();
            expect( result.email ).toContain( 'test@test.com' );
            expect( result.fullName).toContain( 'Testy Tester' );
        } );

        test( 'Influencer pw reset check not required', async () => {
            validateInfluencerResult = {
                reset_required : false,
                email : 'test@test.com',
                full_name: 'Testy Tester'
             };
            const rpcMock = rpcSpy.mockImplementation ( () => Promise.resolve( {result: validateInfluencerResult } ));

            const result = await influencerService.resetPasswordRequired( prkey, headers );
            expect( result.resetRequired ).toBeFalsy();
        } );

    } );

    describe( 'influencerPWReset', () => {

        let prkey, influencerPWResetResult, passwordResetRequest: ResetInfluencerPasswordRequestDto;

        beforeEach( () => {
            prkey = '186428416-9af09542d5b0093cb4c6a409aca5f2ce';
            influencerPWResetResult = [{message: 'Your Password has been changed', success: true}];
            passwordResetRequest = new ResetInfluencerPasswordRequestDto();
            passwordResetRequest.prkey = prkey;
            passwordResetRequest.password = '123456';
            passwordResetRequest.confirmPassword = '123456';
        } );

        test( 'Influencer pw reset success', async () => {

            const rpcMock = rpcSpy.mockImplementation ( () => Promise.resolve( {result: influencerPWResetResult } ));

            const result = await influencerService.resetPasswordByEmail( passwordResetRequest, storeDetail, headers );
            expect( result.success ).toBeTruthy();
            expect( result.message).toBe('Your Password has been changed');
        } );

        test( 'Influencer pw reset prkey expired', async () => {
            influencerPWResetResult = [{message: 'Error Resetting Password', code: -32080, data: 'Password reset has expired'}];
            const rpcMock = rpcSpy.mockImplementation ( () => Promise.resolve( {result: influencerPWResetResult } ));

            const result = await influencerService.resetPasswordByEmail( passwordResetRequest, storeDetail, headers );
            expect( result.success ).toBeUndefined();
            expect( result.message).toBe('Error Resetting Password');
        } );

    } );
} );