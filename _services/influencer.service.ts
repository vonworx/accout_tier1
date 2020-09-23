import { Injectable, Inject } from '@nestjs/common';
import { RpcService } from '../../common/rpc.service';
import { Logger } from '../../common/logging/log.service';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { StoreDetailDto } from '../../common/dto/store-detail.dto';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { ResetInfluencerPasswordRequestDto } from '../../common/dto/reset-password-request.dto';
import { InfluencerPWResetRequiredResponseDto } from '../dto/influencer.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class InfluencerService extends RpcService {

    constructor ( @Inject( Logger.getToken() ) readonly logger: Logger, configurationDto: ConfigurationDto ) {
        super( configurationDto.bentoApiOptions );
    }

    async resetPasswordByEmail ( resetRequest: ResetInfluencerPasswordRequestDto, storeDetail: StoreDetailDto, headers: HeadersDto ): Promise<{ message: string, success: boolean }> {
        const params =
        {
            prkey: resetRequest.prkey,
            password: resetRequest.password,
            confirm_password: resetRequest.confirmPassword,
            terms_of_service_acceptance: resetRequest.termsOfServiceAcceptance,
            email_acceptance: resetRequest.emailAcceptance,
            details: resetRequest.details,
            storeGroupId: storeDetail.storeGroupId
        };

        return this.rpc( 'influencers.resetPassword', params, headers ).then( rpcResult => {
            if ( rpcResult.result && rpcResult.result.length > 0 ) {
                return { message: rpcResult.result[ 0 ].message, success: rpcResult.result[ 0 ].success };
            } else {
                throw this.getBadResultException( 'influencers.resetPassword', rpcResult );
            }
        } );
    }

    async resetPasswordRequired ( prkey: string, headers: HeadersDto ): Promise<InfluencerPWResetRequiredResponseDto> {
        const params = { prkey };

        return this.rpc( 'influencers.influencerPasswordResetRequired', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result) {
                return plainToClass(InfluencerPWResetRequiredResponseDto, <object> rpcResult.result);
            } else {
                throw this.getBadResultException( 'influencers.influencerPasswordResetRequired', rpcResult );
            }
        } );

    }
}