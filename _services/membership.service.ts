import { Inject, BadGatewayException, Injectable, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { RpcService } from '../../common/rpc.service';
import { MembershipDto, MembershipPeriodDto, MembershipLoyaltyDto, LoyaltyHistoryDto, LoyaltyTransactionLogDto, MembershipSkipResultDto, SkipMembershipPeriodDto, MembershipTokenDto, TokenHistoryDto } from '../dto/membership/membership.dto';
import { SessionInfoDto } from '../../common/dto/session-info.dto';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { MemberStatusRequestDto, MemberPromoRequestDto } from '../dto';
import { Logger } from '../../common/logging/log.service';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { plainToClass } from 'class-transformer';
import { StringUtils } from '../../common/utils/string-utils';
import { ServiceException } from '../../common/exceptions/service.exception';
import { AccountModuleErrorCodes } from '../../common/utils/error-util';
import { BentoAPIErrorCode } from '../../common/enums/bentoapi.enum';
import { SortDirection } from '../../common/dto/sort-field';

@Injectable()
export class MembershipService extends RpcService {

    constructor ( @Inject( Logger.getToken() ) readonly logger: Logger, configurationDto: ConfigurationDto ) {
        super( configurationDto.bentoApiOptions );
    }

    onModuleInit () {
        super.onModuleInit();

        this.errorHandlers[ 'members.cancelMembership' ] = ( rpcResult ) => {
            let ex;
            try {
                if ( rpcResult.result[ 0 ].data.success === false ) {
                    const data = rpcResult.result[ 0 ].data;
                    if ( data.message && data.message.general && Array.isArray( data.message.general ) && data.message.general.length > 0){
                        const message = data.message.general[0];
                        if ( message.indexOf( `Can't downgrade`) === 0){
                            ex = new ServiceException( message, HttpStatus.BAD_REQUEST );
                            ex.errorCode = AccountModuleErrorCodes.MembershipStatusValidationError;
                            ex.errorData = data;
                        }
                    } else{
                        ex = new BadGatewayException( rpcResult, rpcResult.result[ 0 ].data.message );
                    }
                }
            } catch ( err ) { }

            return ex;
        };
    }

    async getMembershipDetail ( headers: HeadersDto ): Promise<MembershipDto> {
        const params = {
            customer: headers.customer
        };

        return this.rpc( 'members.getMemberDetails', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 ) {
                return MembershipDto.getInstance( rpcResult.result[ 0 ] );
            }
            throw this.getBadResultException( 'members.getMemberDetails', rpcResult );
        } );
    }

    async cancelMembership ( statusRequest: MemberStatusRequestDto, headers: HeadersDto ): Promise<any> {
        const params = {
            reason_id: statusRequest.reasonId
        };

        return this.rpc( 'members.cancelMembership', params, headers ).then( rpcResult => {
            if ( Array.isArray( rpcResult.result ) && rpcResult.result.length === 1 && !!rpcResult.result[ 0 ].data && rpcResult.result[ 0 ].data.success === true ) {
                return true;
            }
            throw this.getBadResultException( 'members.cancelMembership', rpcResult );
        } );
    }

    async getMembershipSkipPeriod ( datePeriod: Date, headers: HeadersDto ): Promise<MembershipSkipResultDto> {
        const params = {
            date: StringUtils.formatDate_yyyy_MM_dd( datePeriod )
        };

        const rpcResult = await this.rpc( 'members.isMonthSkipped', params, headers );
        if ( Array.isArray( rpcResult.result ) && rpcResult.result.length === 1 ) {
            const membershipSkipDto: MembershipSkipResultDto = MembershipSkipResultDto.getInstance( rpcResult.result[ 0 ] );
            return membershipSkipDto;
        }
        throw this.getBadResultException( 'members.isMonthSkipped', rpcResult );
    }

    async getMemberPersona ( headers: HeadersDto ): Promise<{ personaName: string, personaTagId: number }> {
        return this.rpc( 'members.getPersona', {}, headers ).then( rpcResult => {
            if ( rpcResult.result ) {
                return {
                    personaName: rpcResult.result.customer_persona,
                    personaTagId: rpcResult.result.persona_tag
                };
            }
            return {
                personaName: '',
                personaTagId: 0
            };
        } );
    }

    async addPromo ( promo: MemberPromoRequestDto, headers: HeadersDto ): Promise<boolean> {

        const params = {
            promo: promo.promoCode,
            membership_promo_type_id: promo.promoTypeId,
            date_start: promo.startDate,
            date_end: promo.endDate,
            allow_same_type_promo: promo.allowSamePromoType ? 1 : 0
        };

        return this.rpc( 'members.addPromo', params, headers ).then( rpcResult => {
            if ( rpcResult.result && rpcResult.result.success === true ) {
                return true;
            }
            throw this.getBadResultException( 'members.addPromo', rpcResult );
        } );
    }

    async getMembershipTokens ( headers: HeadersDto, page: number, pageSize: number, sortDirection: SortDirection, ): Promise<TokenHistoryDto> {
        const params =
        {
            page_size: pageSize,
            page,
            sort_direction: SortDirection[sortDirection].toLowerCase()
        };

        return this.rpc( 'members.getMembershipTokens', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && rpcResult.result.success === true ) {
                return plainToClass<TokenHistoryDto, object>( TokenHistoryDto, rpcResult.result );
            }
            else {
                throw this.getBadResultException( 'members.getMembershipTokens', rpcResult.result );
            }
        } );
    }

    async getMembershipPeriod ( headers: HeadersDto, effectiveDate?: Date  ): Promise<MembershipPeriodDto> {
        const params = {
            ...effectiveDate ? {effective_date: effectiveDate} : {}
        };

        return this.rpc( 'members.getMembershipPeriod', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 ) {
                return MembershipPeriodDto.getInstance( <object> rpcResult.result[ 0 ] );
            }
            throw this.getBadResultException( 'members.getMembershipPeriod', rpcResult );
        } );
    }

    async getMembershipPeriodRecommendation ( headers: HeadersDto ): Promise<MembershipPeriodDto> {
        const params = {};

        return this.rpc( 'members.getRecommendation', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 ) {
                return MembershipPeriodDto.getInstance( <object> rpcResult.result[ 0 ] );
            }
            throw this.getBadResultException( 'members.getRecommendation', rpcResult );
        } );
    }

    async skipMembershipPeriod ( skipMembershipPeriod: SkipMembershipPeriodDto, headers: HeadersDto ): Promise<boolean> {
        const params = {
            period_id: skipMembershipPeriod.periodId,
            membership_skip_reason_id: skipMembershipPeriod.membershipSkipReasonId,
            reason_comment: skipMembershipPeriod.reasonComment,
            membership_recommendation_id: skipMembershipPeriod.membershipRecommendationId ? skipMembershipPeriod.membershipRecommendationId : null
        };

        const rpcResult = await this.rpc( 'members.skipMembershipPeriod', params, headers );
        if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 ) {
            return true;
        }
        throw this.getBadResultException( 'members.skipMembershipPeriod', rpcResult );

    }

    async getLoyaltyDetails ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<MembershipLoyaltyDto> {
        const params = {
            customer: sessionInfo.customer
        };

        const rpcResult = await this.rpc( 'members.getRewardDetails', params, headers );
        if ( rpcResult && rpcResult.result.length && !!rpcResult.result[ 0 ].success === true) {
            return plainToClass<MembershipLoyaltyDto, object>( MembershipLoyaltyDto, rpcResult.result[ 0 ] );
        }
        throw this.getBadResultException( 'members.getRewardDetails', rpcResult );

    }

    async getLoyaltyHistory ( sessionInfo: SessionInfoDto, headers: HeadersDto, page: number, count: number ): Promise<LoyaltyHistoryDto> {
        const params = {
            customer: sessionInfo.customer,
            page,
            count
        };

        const rpcResult = await this.rpc( 'members.getRewardHistory', params, headers );
        if ( rpcResult && rpcResult.result.length && !!rpcResult.result[ 0 ].success === true) {
            return plainToClass<LoyaltyHistoryDto, object>( LoyaltyHistoryDto, rpcResult.result[ 0 ] );
        }
        throw this.getBadResultException( 'members.getRewardHistory', rpcResult );

    }

    async deleteMembershipPromo ( promoCode: string, headers: HeadersDto ): Promise<boolean> {

        const params = {
            promo: promoCode
        };

        return this.rpc( 'members.deletePromo', params, headers ).then( rpcResult => {
            if ( rpcResult.hasOwnProperty('result') && Array.isArray(rpcResult.result) && !!rpcResult.result.length && rpcResult.result[0].success === true ) {
                return true;
            }
            throw this.getBadResultException( 'members.deletePromo', rpcResult );
        } )
        .catch( err => {
            const errResp = err.hasOwnProperty('errors') || !err.hasOwnProperty('response') ? err : err.response.message.serviceResult;
            if (errResp.hasOwnProperty('errors') && !!errResp.errors.length) {
                const error = errResp.errors[0];
                if (error.code === BentoAPIErrorCode.Record_Not_Found ) {
                    throw this.getNotFoundResultException( 'members.deletePromo', errResp.errors );
                } else {
                    throw this.getBadResultException( 'members.deletePromo', errResp.errors );
                }
            }
            return false;
        });
    }

    isMemberVip = async ( headers: HeadersDto ): Promise<boolean> => {
        const customerDetail = await this.getMembershipDetail( headers );
        return customerDetail.membershipLevelId >= 400 ? true : false;
    }

}
