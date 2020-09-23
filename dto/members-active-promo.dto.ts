import { ApiModelProperty } from '@nestjs/swagger';
import * as _ from 'lodash';
import { Expose, Exclude, Transform, plainToClass } from 'class-transformer';
import { transformToBoolean, transformFloat, transformInt, getConvertedShortDateString, transformDateString } from '../../common/utils';

@Exclude()
export class MembersActivePromoDto {

    @ApiModelProperty()
    @Expose( { name: 'add_product_automatically' } )
    addProductAutomatically: string;

    @ApiModelProperty()
    @Expose( { name: 'allow_like_promos' } )
    @Transform((val) => transformToBoolean(val))
    allowLikePromos: boolean;

    @ApiModelProperty()
    @Expose( { name: 'allow_membership_credits' } )
    @Transform((val) => transformToBoolean(val))
    allowMembershipCredits: boolean;

    @ApiModelProperty()
    @Expose( { name: 'apply_automatically' } )
    @Transform((val) => transformToBoolean(val))
    applyAutomatically: boolean;

    @ApiModelProperty()
    @Expose( { name: 'code' } )
    code: string;

    @ApiModelProperty()
    @Expose( { name: 'd1_applied_to' } )
    d1AppliedTo: string;

    @ApiModelProperty()
    @Expose( { name: 'd1_calculation_method' } )
    d1CalculationMethod: string;

    @ApiModelProperty()
    @Expose( { name: 'd1_discount_id' } )
    d1DiscountId: number;

    @ApiModelProperty()
    @Expose( { name: 'd1_label' } )
    d1Label: string;

    @ApiModelProperty()
    @Expose( { name: 'd1_percentage' } )
    d1Percentage: number;

    @ApiModelProperty()
    @Expose( { name: 'd1_rate' } )
    d1Rate: number;

    @ApiModelProperty()
    @Expose( { name: 'd2_applied_to' } )
    d2AppliedTo: string;

    @ApiModelProperty()
    @Expose( { name: 'd2_calculation_method' } )
    d2CalculationMethod: string;

    @ApiModelProperty()
    @Expose( { name: 'd2_discount_id' } )
    d2DiscountId: number;

    @ApiModelProperty()
    @Expose( { name: 'd2_label' } )
    d2Label: string;

    @ApiModelProperty()
    @Expose( { name: 'd2_percentage' } )
    d2Percentage: number;

    @ApiModelProperty()
    @Expose( { name: 'd2_rate' } )
    d2Rate: number;

    @ApiModelProperty()
    @Expose( { name: 'date_end' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateEnd: Date;

    @ApiModelProperty()
    @Expose( { name: 'date_start' } )
    @Transform( ( val ) => transformDateString( val, undefined ) )
    dateStart: Date;

    @ApiModelProperty()
    @Expose( { name: 'description' } )
    @Transform((val) => transformFloat(val, undefined))
    description: number;

    @ApiModelProperty()
    @Expose( { name: 'discounts' } )
    discounts: any[];

    @ApiModelProperty()
    @Expose( { name: 'display_on_pdp' } )
    @Transform((val) => transformToBoolean(val))
    displayOnPdp: boolean;

    @ApiModelProperty()
    @Expose( { name: 'exchanges_allowed' } )
    @Transform((val) => transformFloat(val, undefined))
    exchangesAllowed: number;

    @ApiModelProperty()
    @Expose( { name: 'featured_product_location_id' } )
    @Transform((val) => transformInt(val, undefined))
    featuredProductLocationId: number;

    @ApiModelProperty()
    @Expose( { name: 'filtered_benefit_featured_product_location_id' } )
    filteredBenefitFeaturedProductLocationId: string;

    @ApiModelProperty()
    @Expose( { name: 'filtered_benefit_product_category_id' } )
    filteredBenefitProductCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'filtered_featured_product_location_id' } )
    filteredFeaturedProductLocationId: number;

    @ApiModelProperty()
    @Expose( { name: 'filtered_product_category_id' } )
    filteredProductCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'group_code' } )
    groupCode: string;

    @ApiModelProperty()
    @Expose( { name: 'label' } )
    label: string;

    @ApiModelProperty()
    @Expose( { name: 'max_discount_sets_per_use' } )
    @Transform((val) => transformFloat(val, undefined))
    maxDiscountSetsPerUse: number;

    @ApiModelProperty()
    @Expose( { name: 'max_product_quantity' } )
    maxProductQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'max_purchase_unit_price' } )
    maxPurchaseUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'max_required_purchase_unit_price' } )
    maxRequiredPurchaseUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'max_uses_per_customer' } )
    @Transform((val) => transformFloat(val, undefined))
    maxUsesPerCustomer: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_plan_id' } )
    membershipPlanId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_promo_current_period_only' } )
    membershipPromoCurrentPeriodOnly: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_promo_expiration_days' } )
    membershipPromoExpirationDays: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_reward_multiplier' } )
    membershipRewardMultiplier: string;

    @ApiModelProperty()
    @Expose( { name: 'min_product_quantity' } )
    @Transform((val) => transformFloat(val, undefined))
    minProductQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'min_purchase_unit_price' } )
    @Transform((val) => transformFloat(val, undefined))
    minPurchaseUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'min_required_purchase_unit_price' } )
    @Transform((val) => transformFloat(val, undefined))
    minRequiredPurchaseUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'min_subtotal' } )
    @Transform((val) => transformFloat(val, undefined))
    minSubtotal: number;

    @ApiModelProperty()
    @Expose( { name: 'pdp_label' } )
    pdpLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'processing_priority' } )
    @Transform((val) => transformFloat(val, undefined))
    processingPriority: number;

    @ApiModelProperty()
    @Expose( { name: 'product_category_id' } )
    productCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'product_id' } )
    productId: number;

    @ApiModelProperty()
    @Expose( { name: 'promo_id' } )
    @Transform((val) => transformInt(val, undefined))
    promoId: number;

    @ApiModelProperty()
    @Expose( { name: 'promo_type_id' } )
    @Transform((val) => transformInt(val, undefined))
    promoTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'refunds_allowed' } )
    @Transform((val) => transformToBoolean(val))
    refundsAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'remove_product_automatically' } )
    @Transform( ( val ) => transformToBoolean( val ) )
    removeProductAutomatically: boolean;

    @ApiModelProperty()
    @Expose( { name: 'required_featured_product_location_id' } )
    requiredFeaturedProductLocationId: number;

    @ApiModelProperty()
    @Expose( { name: 'required_membership_plan_id' } )
    requiredMembershipPlanId: number;

    @ApiModelProperty()
    @Expose( { name: 'required_product_category_id' } )
    requiredProductCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'required_product_id' } )
    requiredProductId: number;

    @ApiModelProperty()
    @Expose( { name: 'required_product_quantity' } )
    requiredProductQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'required_promo_id' } )
    requiredPromoId: number;

    @ApiModelProperty()
    @Expose( { name: 'restrict_code_access_to_specific_memberships' } )
    @Transform((val) => transformFloat(val, undefined))
    restrictCodeAccessToSpecificMemberships: number;

    @ApiModelProperty()
    @Expose( { name: 'rush_shipping_discount_allowed' } )
    @Transform((val) => transformFloat(val, undefined))
    rushShippingDiscountAllowed: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_discount_id' } )
    shippingDiscountId: string;

    @ApiModelProperty()
    @Expose( { name: 'shipping_option_id' } )
    shippingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    @Transform((val) => transformFloat(val, undefined))
    statuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'store_group_id' } )
    @Transform((val) => transformInt(val, undefined))
    storeGroupId: number;

    @ApiModelProperty()
    @Expose( { name: 'subtotal_discount_id' } )
    @Transform((val) => transformInt(val, undefined))
    subtotalDiscountId: number;

    @ApiModelProperty()
    @Expose( { name: 'terms' } )
    terms: string;

    @ApiModelProperty()
    @Expose( { name: 'time_end' } )
    timeEnd: string;

    @ApiModelProperty()
    @Expose( { name: 'time_start' } )
    @Transform(getConvertedShortDateString)
    timeStart: Date;

    static getInstance(inputObj: object): MembersActivePromoDto {
        inputObj = _.transform(inputObj, (result, val, key) => { result[key.toLowerCase()] = val; } , {});
        return plainToClass(MembersActivePromoDto, inputObj);
    }

    static getInstances(inputObjs: Array<object>): Array<MembersActivePromoDto> {
        return inputObjs.map( MembersActivePromoDto.getInstance );
    }

}