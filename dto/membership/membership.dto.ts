import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import * as _ from 'lodash';
import { Expose, Exclude, Type, Transform, plainToClass } from 'class-transformer';
import { transformToBoolean, getConvertedShortDateString, transformInt, transformDateString } from '../../../common/utils';

export enum MembershipLevel {
    Elite_VIP = 1000,
    Member = 100,
    Previously_Active_Purchasing_Member = 300,
    Purchasing_Member = 200,
    VIP = 500
}

export enum MembershipStatus {
    Active = 3930,
    Cancelled = 3940,
    Cancelled_Passive = 3941,
    Cancelled_Recreated = 3942,
    Pending = 3925,
    Prospective = 3926,
    Registered = 3910
}

export enum MembershipPeriodStatus {
    Pending = 3950,
    Cancelled = 3951,
    ErrorDuringProcessing = 3952,
    MarkedForCredit = 3953,
    CreditFailed = 3954,
    Skipped = 3955,
    CreditPending = 3956,
    Credited = 3957,
    Purchased = 3959
}

@Exclude()
export class StoreCreditDto {
    @ApiModelProperty()
    @Expose( { name: 'gift_certificate_code' } )
    giftCertificateCode: string;

    @ApiModelProperty()
    @Expose( { name: 'reason_comment' } )
    reasonComment: string;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'gift_certificate_type_id' } )
    giftCertificateTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'statuscode_label' } )
    statuscodeLabel: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    datetimeAdded: Date;

    @ApiModelProperty()
    @Expose( { name: 'membership_period_label' } )
    membershipPeriodLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'balance' } )
    balance: number;

    @ApiModelProperty()
    @Expose( { name: 'store_credit_id' } )
    storeCreditId: number;

    @ApiModelProperty()
    @Expose( { name: 'reason_label' } )
    reasonLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'amount' } )
    amount: number;

    @ApiModelProperty()
    @Expose( { name: 'store_credit_reason_id' } )
    storeCreditReasonId: string;

    @ApiModelProperty()
    @Expose( { name: 'admin' } )
    admin: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expires' } )
    dateExpires: Date;

    static getInstance ( rpcObject: object ): StoreCreditDto {
        rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( StoreCreditDto, rpcObject );
    }

}

@Exclude()
export class MembershipTrialDetail {

    @ApiModelProperty()
    @Expose( { name: 'membership_id' } )
    membershipId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_statuscode' } )
    membershipStatusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_level_group_id' } )
    membershipLevelGroupId: number;

    @ApiModelProperty()
    @Expose( { name: 'default_trial_period_days' } )
    defaultTrialPeriodDays: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_trial_id' } )
    membershipTrialId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'trial_period_days' } )
    trialPeriodDays: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateTimeAdded: Date;

    @ApiModelProperty( { type: String, format: 'date' } )
    @Expose( { name: 'date_period_started' } )
    @Transform( getConvertedShortDateString )
    datePeriodStarted: string;

    @ApiModelProperty()
    @Expose( { name: 'date_expires' } )
    @Transform( getConvertedShortDateString )
    dateExpires: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_cancelled' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateTimeCancelled: Date;

    @ApiModelProperty()
    @Expose( { name: 'original_date_expires' } )
    @Transform( getConvertedShortDateString )
    originalDateExpires: string;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statusCode: string;

    @ApiModelProperty()
    @Expose( { name: 'status' } )
    status: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_trial_cancel_reason_label' } )
    cancelReasonLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_trial_cancel_reason_comment' } )
    cancelReasonComment: string;

    @ApiModelProperty()
    @Expose( { name: 'status_friendly' } )
    friendlyStatus: string;

    @ApiModelProperty()
    @Expose( { name: 'name' } )
    name: string;

    @ApiModelProperty()
    @Expose( { name: 'value' } )
    value: string;

    @ApiModelProperty()
    @Expose( { name: 'is_eligible_for_trial' } )
    @Transform( transformToBoolean )
    isEligibleForTrial: boolean;

    static getInstance ( rpcObject: object ): MembershipTrialDetail {
        rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( MembershipTrialDetail, rpcObject );
    }
}

@Exclude()
export class MembershipPeriodDto {

    @ApiModelProperty()
    @Expose( { name: 'period_id' } )
    @Transform( ( val ) => transformInt( val, undefined ) )
    periodId: number;

    @ApiModelProperty()
    @Expose( { name: 'period_label' } )
    periodLabel: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_period_start' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    datePeriodStart: Date;

    @ApiModelProperty( { description: 'Value is only returned for members with a Credit based membership_type_id (1 or 2)' } )
    @Expose( { name: 'membership_period_id' } )
    @Transform( ( val ) => transformInt( val, undefined ) )
    membershipPeriodId: number;

    @ApiModelProperty( { description: 'Value is only returned for members with a Token based membership_type_id (3 or 4)' } )
    @Expose( { name: 'membership_billing_id' } )
    @Transform( ( val ) => transformInt( val, undefined ) )
    membershipBillingId: number;

    @ApiModelProperty( { description: '- 3950 Pending\n- 3951 Cancelled\n- 3952 Error During Processing\n- 3953 Marked For Credit\n- 3954 Credit Failed\n- 3955 Skipped\n- 3956 Credit Pending\n- 3957 Credited\n- 3959 Purchased' } )
    @Expose( { name: 'statuscode' } )
    @Transform( ( val ) => transformInt( val, undefined ) )
    statusCode: MembershipPeriodStatus;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_due' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateDue: Date;

    @ApiModelProperty()
    @Expose( { name: 'skip_allowed' } )
    @Transform( transformToBoolean )
    skipAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'perks_allowed' } )
    @Transform( transformToBoolean )
    vipPlusPerksAvailable: boolean;

    @ApiModelProperty()
    @Expose( { name: 'is_due' } )
    @Transform( transformToBoolean )
    isDue: boolean;

    @ApiModelProperty()
    @Expose( { name: 'membership_type_id' } )
    @Transform( ( val ) => transformInt( val, undefined ) )
    membershipTypeId: number;

    static getInstance ( rpcObject: object ): MembershipPeriodDto {
        rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( MembershipPeriodDto, rpcObject );
    }
}

export enum CreditStatus {
    Active = 3240,
    Redeemed = 3245,
    Expired = 3246,
    Cancelled = 3247,
    ConvertedToVariableCredit = 3248,
    ExpiredTransferred = 3249
}

export enum CreditCardStatus {
    Active = 1550,
    Inactive = 1559
}

export enum PspStatus {
    Active = 1690,
    Inactive = 1695
}


export class LoyaltyRedemptionDto {
    @ApiModelProperty()
    @Expose( { name: 'balance' } )
    balance: number;

    @ApiModelProperty()
    @Expose( { name: 'min_redemption_amount' } )
    minRedemptionAmount: number;

    @ApiModelProperty()
    @Expose( { name: 'eligible_credits' } )
    eligibleCredits: number;

    @ApiModelProperty()
    @Expose( { name: 'points_needed_for_redemption' } )
    pointsNeededForRedemption: number;

    @ApiModelProperty()
    @Expose( { name: 'purchase_point_multiplier' } )
    purchasePointMultiplier: number;
}

export class LoyaltyTierDto {
    @ApiModelProperty()
    @Expose( { name: 'membership_reward_tier_id' } )
    membershipRewardTierId: number;

    @ApiModelProperty()
    @Expose( { name: 'label' } )
    label: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_level_group_id' } )
    membershipLevelGroupId: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_reward_tier_recalculate' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    @Type( () => Date )
    dateRewardTierRecalculate: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_reward_tier_updated' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateRewardTierUpdated: Date;

    @ApiModelProperty()
    @Expose( { name: 'membership_tier_points' } )
    membershipTierPoints: number;

    @ApiModelProperty()
    @Expose( { name: 'points_to_next_tier' } )
    pointsToNextTier: number;

    @ApiModelProperty()
    @Expose( { name: 'required_points_earned' } )
    requiredPointsEarned: number;

    @ApiModelProperty()
    @Expose( { name: 'points_required_to_retain_tier' } )
    pointsRequiredToRetainTier: number;

    @ApiModelProperty()
    @Expose( { name: 'points_redeemed' } )
    pointsRedeemed: number;

    @ApiModelProperty()
    @Expose( { name: 'points_expired' } )
    pointsExpired: number;
}

@Exclude()
export class MembershipLoyaltyDto {
    @ApiModelProperty( { type: LoyaltyRedemptionDto, isArray: true } )
    @Expose( { name: 'redemption' } )
    @Type( () => LoyaltyRedemptionDto )
    redemption: Array<LoyaltyRedemptionDto>;

    @ApiModelProperty( { type: LoyaltyTierDto, isArray: true } )
    @Expose( { name: 'tier' } )
    @Type( () => LoyaltyTierDto )
    tier: Array<LoyaltyTierDto>;

    @ApiModelProperty()
    @Expose( { name: 'balance' } )
    balance: number;

    static getInstance ( rpcObject: object ): MembershipLoyaltyDto {
        if ( !rpcObject ) {
            return new MembershipLoyaltyDto();
        } else {
            rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
            return plainToClass( MembershipLoyaltyDto, rpcObject );
        }
    }

}

@Exclude()
export class MembershipTokenDto {

    //not sure what should be in this dto yet
    @ApiModelProperty()
    @Expose( { name: 'membership_token_id' } )
    membershipTokenId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_billing_id' } )
    membershipBillingId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_token_reason_id' } )
    membershipTokenReasonId: number;

    @ApiModelProperty()
    @Expose( { name: 'reason_comment' } )
    reasonComment: string;

    @ApiModelProperty()
    @Expose( { name: 'code' } )
    code: number;

    @ApiModelProperty()
    @Expose( { name: 'purchase_price' } )
    purchasePrice: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    @Type( () => Date )
    datetimeAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_modified' } )
    @Type( () => Date )
    datetimeModified: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expires' } )
    @Type( () => Date )
    dateExpires: Date;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'administrator_id' } )
    administratorId: number;

    @ApiModelProperty()
    @Expose( { name: 'statuscode_label' } )
    statusCodeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'token_transaction_comment' } )
    tokenTransactionComment: string;

    @ApiModelProperty()
    @Expose( { name: 'token_reason_label' } )
    tokenReasonLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'token_transaction_type_label' } )
    tokenTransactionTypeLabel: string;

    static getInstance ( rpcObject: object ): MembershipTokenDto {
        if ( !rpcObject ) {
            return new MembershipTokenDto();
        } else {
            rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
            return plainToClass( MembershipTokenDto, rpcObject );
        }
    }

    static getInstances(inputObjs: Array<object>): Array<MembershipTokenDto> {
        return inputObjs.map( MembershipTokenDto.getInstance );
    }

}

@Exclude()
export class TokenHistoryDto {
    @ApiModelProperty()
    @Expose( { name: 'page_number' } )
    pageNumber: number;

    @ApiModelProperty()
    @Expose( { name: 'page_count' } )
    pageCount: number;

    @ApiModelProperty( { type: MembershipTokenDto, isArray: true } )
    @Expose( { name: 'token_details' } )
    @Type( () => MembershipTokenDto )
    tokenDetails: Array<MembershipTokenDto>;
}

@Exclude()
export class MembershipDto {

    @ApiModelProperty()
    @Expose( { name: 'mplabel' } )
    mplabel: string;

    @ApiModelProperty()
    @Expose( { name: 'period_type' } )
    periodType: string;

    @ApiModelProperty()
    @Expose( { name: 'price' } )
    price: number;

    @ApiModelProperty()
    @Expose( { name: 'statuslabel' } )
    statusLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'mtlabel' } )
    mtLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_id' } )
    membershipId: number;

    @ApiModelProperty()
    @Expose( { name: 'customer_id' } )
    customerId: number;

    @ApiModelProperty()
    @Expose( { name: 'store_id' } )
    storeId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_type_id' } )
    membershipTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_type' } )
    membershipTypeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_plan_id' } )
    membershipPlanId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_completion_method_id' } )
    membershipCompletionMethodId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_signup_id' } )
    membershipSignupId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_reward_plan_id' } )
    membershipRewardPlanId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_tracking_id' } )
    orderTrackingId: number;

    @ApiModelProperty()
    @Expose( { name: 'discount_id' } )
    discountId: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_option_id' } )
    shippingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'offer_id' } )
    offerId: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_address_id' } )
    shippingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'payment_method' } )
    paymentMethod: string;

    @ApiModelProperty()
    @Expose( { name: 'payment_object_id' } )
    paymentObjectId: number;

    @ApiModelProperty()
    @Expose( { name: '' } )
    paymentOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'current_membership_recommendation_id' } )
    currentMembershipRecommendationId: number;

    @ApiModelProperty()
    @Expose( { name: 'current_period_id' } )
    currentPeriodId: number;

    @ApiModelProperty()
    @Expose( { name: 'next_period_id' } )
    nextPeriodId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_level_id' } )
    membershipLevelId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_team_id' } )
    membershipTeamId: number;

    @ApiModelProperty( { description: 'The number of available membership credits' } )
    @Expose( { name: 'membership_credits' } )
    membershipCredits: number;

    @ApiModelProperty()
    @Expose( { name: 'max_prepaid_credits' } )
    maxPrepaidCredits: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_added' } )
    @Type( () => Date )
    dateAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateTimeAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_modified' } )
    @Type( () => Date )
    dateTimeModified: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_next_scheduled' } )
    @Type( () => Date )
    dateNextScheduled: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_activated' } )
    @Type( () => Date )
    dateActivated: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_cancelled' } )
    @Type( () => Date )
    dateCancelled: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expires' } )
    @Type( () => Date )
    dateExpires: Date;

    @ApiModelProperty( { description: 'The users membership status code (group 128)' } )
    @Expose( { name: 'statuscode' } )
    statusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_reward_tier_id' } )
    membershipRewardTierId: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_reward_tier_recalculate' } )
    @Type( () => Date )
    rewardTierRecalculate: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_reward_tier_updated' } )
    @Type( () => Date )
    rewardTierUpdated: Date;

    @ApiModelProperty()
    @Expose( { name: 'billing_month' } )
    billingMonth: number;

    @ApiModelProperty()
    @Expose( { name: 'billing_day' } )
    billingDay: number;

    @ApiModelProperty()
    @Expose( { name: 'administrator_id' } )
    administratorId: number;

    @ApiModelProperty()
    @Expose( { name: 'administrator_firstname' } )
    adminFirstName: string;

    @ApiModelProperty()
    @Expose( { name: 'administrator_lastname' } )
    adminLastName: string;

    @ApiModelProperty( { description: 'The grouping or level of the membership' } )
    @Expose( { name: 'membership_level_group_id' } )
    membershipLevelGroupId: number;

    @ApiModelProperty( { description: 'The grouping or level of the membership', isArray: true, type: StoreCreditDto } )
    @Expose( { name: 'store_credits' } )
    @Transform( storecreds => storecreds && !!storecreds.length ? storecreds.map( ( storecred ) => StoreCreditDto.getInstance( storecred ) ) : [] )
    storeCredits: StoreCreditDto[];

    @ApiModelProperty( { description: 'The total available store credits' } )
    @Expose( { name: 'store_credit_balance' } )
    storeCreditBalance: number;

    @ApiModelProperty( { description: 'The persona of the member as determined by their quiz answers' } )
    persona: string;

    @ApiModelProperty( { description: 'The persona tag id of the member as determined by their quiz answers' } )
    personaTagId: number;

    @ApiModelProperty( { description: 'Is the current membership in a free trial phase' } )
    @Expose( { name: 'in_free_trial' } )
    @Transform( transformToBoolean )
    inFreeTrial: boolean;

    @ApiModelProperty( { isArray: true, type: MembershipTrialDetail } )
    @Expose( { name: 'free_trial' } )
    @Transform( trials => trials && !!trials.length ? trials.map( ( trial ) => MembershipTrialDetail.getInstance( trial ) ) : [] )
    membershipTrials: MembershipTrialDetail[];

    @ApiModelPropertyOptional( { type: MembershipPeriodDto } )
    period: MembershipPeriodDto;

    @ApiModelProperty( { description: 'Hashed email using the SHA-256 encoding algorithm' } )
    @Expose( { name: 'sha_email' } )
    shaEmail: string;

    @ApiModelProperty( { description: 'Hashed email using the MD5 encoding algorithm' } )
    @Expose( { name: 'hashed_user_email' } )
    hashedUserEmail: string;

    @ApiModelProperty( { description: 'The total available membership store credits' } )
    @Expose( { name: 'membership_store_credit_balance' } )
    membershipStoreCreditBalance: number;

    @ApiModelProperty()
    @Expose( { name: 'available_token_quantity' } )
    availableTokenQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'vip_plus_perks_available' } )
    @Transform( transformToBoolean )
    vipPlusPerksAvailable: boolean;

    @ApiModelPropertyOptional( { type: MembershipLoyaltyDto } )
    @Expose( { name: 'loyalty' } )
    @Transform( obj => obj ? MembershipLoyaltyDto.getInstance( obj ) : undefined)
    @Type( () => MembershipLoyaltyDto )
    loyalty: MembershipLoyaltyDto;

    static getInstance ( rpcObject: object ): MembershipDto {
        rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        const dto = plainToClass( MembershipDto, rpcObject );
        return dto;
    }

    @ApiModelPropertyOptional( { description: 'Can provide the date for the experience', default: undefined} )
    @Expose({name: 'onsite_membership_experience'})
    @Transform( ( val ) => transformDateString( val, undefined ) )
    onSiteMembershipExperience: Date;

    @ApiModelPropertyOptional( { description: 'Can provide if a member should NOT be allowed to use the mobile app', default: undefined} )
    mobileAppAccessNotPermitted: boolean;

    @ApiModelPropertyOptional( { description: 'Can provide a members nmp test group value', default: undefined} )
    nmpTestGroup: number;
}

@Exclude()
export class MembershipCancellationReasonDto {
    @ApiModelProperty()
    @Expose( { name: 'membership_downgrade_reason_id' } )
    reasonId: number;

    @ApiModelProperty()
    @Expose( { name: 'label' } )
    label: string;

    @ApiModelProperty()
    @Expose( { name: 'sort' } )
    sort: number;
}

export class LoyaltyTransactionLogDto {
    @ApiModelProperty()
    @Expose( { name: 'membership_reward_transaction_id' } )
    membershipRewardTransactionId: number;

    @ApiModelProperty()
    @Expose( { name: 'points' } )
    points: number;

    @ApiModelProperty()
    @Expose( { name: 'description' } )
    description: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expires' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateExpires: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    datetimeAdded: Date;

    @ApiModelProperty()
    @Expose( { name: 'transaction_type_id' } )
    transactionTypeId: number;
}

@Exclude()
export class LoyaltyHistoryDto {
    @ApiModelProperty()
    @Expose( { name: 'page_number' } )
    pageNumber: number;

    @ApiModelProperty()
    @Expose( { name: 'page_count' } )
    pageCount: number;

    @ApiModelProperty( { type: LoyaltyTransactionLogDto, isArray: true } )
    @Expose( { name: 'history_data' } )
    @Type( () => LoyaltyTransactionLogDto )
    historyData: Array<LoyaltyTransactionLogDto>;
}

export class MembershipSkipResultDto {
    @ApiModelProperty()
    @Expose( { name: 'comment' } )
    comment: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_due' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateDue: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_period_start' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    datePeriodStart: Date;

    @ApiModelProperty()
    @Expose( { name: 'membership_id' } )
    membershipId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_period_id' } )
    memebershipPeriodId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_period_statuscode' } )
    membershipPeriodStatusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_recommendation_id' } )
    membershipRecommendationId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_recommendation_method_id' } )
    membershipRecommendationMethodId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_recommendation_request_type_id' } )
    membershipRecommendationRequestTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_recommendation_type_id' } )
    membershipRecommendationTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'month_skipped' } )
    monthSkipped: boolean;

    @ApiModelProperty()
    @Expose( { name: 'new_request_allowed' } )
    newRequestAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'new_request_requested_not_fulfilled' } )
    newRequestRequestedNotFulfilled: boolean;

    @ApiModelProperty()
    @Expose( { name: 'period_id' } )
    periodId: number;

    @ApiModelProperty()
    @Expose( { name: 'period_label' } )
    periodLabel: string;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'products' } )
    products: Array<any>;

    @ApiModelProperty()
    @Expose( { name: 'skip_allowed' } )
    skipAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'viewed' } )
    viewed: boolean;

    static getInstance ( rpcObject: object ): MembershipSkipResultDto {
        rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( MembershipSkipResultDto, rpcObject );
    }
}

export class SkipMembershipPeriodDto {

    @ApiModelProperty()
    periodId: number;

    @ApiModelProperty()
    membershipSkipReasonId: number;

    @ApiModelProperty()
    reasonComment: string;

    @ApiModelProperty()
    membershipRecommendationId: number;
}
