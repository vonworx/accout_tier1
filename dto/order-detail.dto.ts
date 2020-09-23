import { Exclude, Expose, Transform, plainToClass, Type } from 'class-transformer';
import * as _ from 'lodash';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { transformSingleIntArray, transformSingleValueArray, transformSingleNumberArray, transformSingleDateArray, transformToBoolean, transformSingleShortDateStringArray } from '../../common/utils';
import { AddressDto } from './address.dto';
import { PaymentInfoDto, PaymentResponseInfoDto } from './payment-info.dto';
import { MembershipDto } from '.';
import { CartProductType } from '../../cart/dto/cart.dto';
import { TrackingDto } from './tracking.dto';
import { DiscountDto } from '../../cart/dto';

@Exclude()
export class OrderLineDiscountDto {
    @ApiModelProperty()
    @Expose( { name: 'order_line_discount_id' } )
    orderLineDiscountId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_line_id' } )
    orderLineId: number;

    @ApiModelProperty()
    @Expose( { name: 'promo_id' } )
    promoId: number;

    @ApiModelProperty()
    @Expose( { name: 'discount_id' } )
    discountId: number;

    @ApiModelProperty()
    @Expose( { name: 'amount' } )
    amount: number;

    @ApiModelProperty()
    @Expose( { name: 'code' } )
    promoCode: string;

    @ApiModelProperty()
    @Expose( { name: 'label' } )
    label: string;

    @ApiModelProperty()
    @Expose( { name: 'long_label' } )
    longLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'refunds_allowed' } )
    @Transform( transformToBoolean )
    refundsAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'exchanges_allowed' } )
    @Transform( transformToBoolean )
    exchangesAllowed: boolean;

    @ApiModelProperty()
    @Expose( { name: 'final_sale' } )
    @Transform( transformToBoolean )
    finalSale: boolean;

    static getInstance ( orderLineDiscount: object ): OrderLineDiscountDto {

        orderLineDiscount = _.transform( orderLineDiscount, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );

        const dto: OrderLineDiscountDto = plainToClass( OrderLineDiscountDto, orderLineDiscount );

        return dto;
    }
}

@Exclude()
export class OrderLineItemDto {

    /* REMOVED

    @ApiModelProperty()
    @Expose({name: 'pricing_option_id'})
    pricingOptionId: number;

    @ApiModelProperty()
    @Expose({name: 'lpn_code'})
    lpnCode: string;

    @ApiModelProperty()
    @Expose({name: 'statuscode'})
    statusCode: number;

    */

    @ApiModelProperty()
    @Expose( { name: 'unit_price_adjustment' } )
    unitPriceAdjustment: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_price' } )
    shippingPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'extended_shipping_price' } )
    extendedShippingPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'quantity' } )
    quantity: number;

    @ApiModelProperty()
    @Expose( { name: 'order_line_id' } )
    orderLineId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_offer_id' } )
    orderOfferId: number;

    @ApiModelProperty()
    @Expose( { name: 'offer_id' } )
    offerId: number;

    @ApiModelProperty()
    @Expose( { name: 'offer_type_id' } )
    offerTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'offer_item_count' } )
    offerItemCount: number;

    @ApiModelProperty()
    @Expose( { name: 'product_type_id' } )
    productTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'retail_unit_price' } )
    retailUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'purchase_unit_price' } )
    purchaseUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'product_id' } )
    productId: number;

    @ApiModelProperty()
    @Expose( { name: 'master_product_id' } )
    masterProductId: number;

    @ApiModelProperty()
    @Expose( { name: 'autoship_quantity' } )
    autoshipQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'extended_purchase_price' } )
    extendedPurchasePrice: number;

    @ApiModelProperty()
    @Expose( { name: 'autoship_frequency_id' } )
    autoshipFrequencyId: number;

    @ApiModelProperty()
    @Expose( { name: 'group_key' } )
    groupKey: string;

    @ApiModelProperty()
    @Expose( { name: 'group_code' } )
    groupCode: string;

    @ApiModelProperty()
    @Expose( { name: 'autoship_frequency_datepart' } )
    autoshipFrequencyDatepart: string;

    @ApiModelProperty()
    @Expose( { name: 'autoship_frequency_value' } )
    autoshipFrequencyValue: string;

    @ApiModelProperty()
    @Expose( { name: 'medium_description' } )
    mediumDescription: string;

    @ApiModelProperty()
    @Expose( { name: 'description' } )
    description: string;

    @ApiModelProperty()
    @Expose( { name: 'label' } )
    label: string;

    @ApiModelProperty()
    @Expose( { name: 'alias' } )
    alias: string;

    @ApiModelProperty()
    @Expose( { name: 'item_number' } )
    itemNumber: string;

    @ApiModelProperty()
    @Expose( { name: 'default_product_category_id' } )
    defaultProductCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'is_offer' } )
    @Transform( transformToBoolean )
    isOffer: boolean;

    @ApiModelProperty()
    @Expose( { name: 'has_offer' } )
    @Transform( transformToBoolean )
    hasOffer: boolean;

    @ApiModelProperty()
    @Expose( { name: 'is_returnable' } )
    @Transform( transformToBoolean )
    isReturnable: boolean;

    @ApiModelProperty()
    @Expose( { name: 'lpn_code' } )
    lpnCode: string;

    @ApiModelProperty()
    @Expose( { name: 'unit_cost' } )
    unitCost: number;

    @ApiModelProperty()
    @Expose( { name: 'is_multipay' } )
    @Transform( transformToBoolean )
    isMultipay: boolean;

    @ApiModelProperty()
    @Expose( { name: 'retail_price' } )
    retailPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'product_source' } )
    productSource: string;

    @ApiModelProperty()
    @Expose( { name: 'product_statuscode' } )
    productStatuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'order_line_statuscode' } )
    orderLineStatuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'vip_unit_price' } )
    vipUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'unit_discount' } )
    unitDiscount: number;

    @ApiModelProperty()
    @Expose( { name: 'instance_label' } )
    instanceLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'is_trial' } )
    @Transform( transformToBoolean )
    isTrial: boolean;

    @ApiModelProperty()
    @Expose( { name: 'pricing_option_id' } )
    pricingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'item_id' } )
    itemId: number;

    @ApiModelProperty()
    @Expose( { name: 'master_label' } )
    masterLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'price_adjustment' } )
    priceAdjustment: number;

    @ApiModelProperty()
    @Expose( { name: 'prefix_label' } )
    prefixLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'warehouse_id' } )
    warehouseId: number;

    @ApiModelProperty()
    @Expose( { name: 'extended_price' } )
    extendedPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'option_label' } )
    optionLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'gift_certificate_id' } )
    giftCertificateId: number;

    @ApiModelProperty( { description: 'The id of the rma if this item has been returned' } )
    rmaId: number;

    @ApiModelProperty( { description: 'The amount of tax paid for this item' } )
    tax: number;

    @ApiModelProperty()
    permalink: string;

    @ApiModelProperty( { description: 'Tag ids that this product belongs to', type: Number, isArray: true } )
    @Expose( { name: 'tag_id_list' } )
    tagIds: number[];

    @ApiModelProperty( { description: 'Order Lines that belong to a bundle/set in an order', isArray: true, type: Object } )
    bundleItems: OrderLineItemDto[];

    @ApiModelPropertyOptional( { description: 'Discount applied to the order line item.', type: OrderLineDiscountDto } )
    @Expose( { name: 'discount' } )
    @Type(() => OrderLineDiscountDto )
    discount: OrderLineDiscountDto;

    @ApiModelProperty()
    dateInventoryAvailablePreorder: Date;

    @ApiModelProperty()
    datePreorderExpires: Date;

    static getInstance ( orderLine: object ): OrderLineItemDto {

        orderLine = _.transform( orderLine, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );

        const dto: OrderLineItemDto = plainToClass( OrderLineItemDto, orderLine );

        return dto;
    }

}

// tslint:disable:max-classes-per-file
// disabling this rule for now to fix other linting errors
@Exclude()
export class OrderDetailDto {
    @ApiModelProperty()
    @Expose( { name: 'credit' } )
    @Transform( transformSingleNumberArray )
    credit: number;

    @ApiModelProperty()
    @Expose( { name: 'tax' } )
    @Transform( transformSingleNumberArray )
    tax: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping' } )
    @Transform( transformSingleNumberArray )
    shipping: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_discount' } )
    @Transform( transformSingleNumberArray )
    shippingDiscount: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_option_id' } )
    @Transform( transformSingleNumberArray )
    shippingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_option_label' } )
    @Transform( transformSingleValueArray )
    shippingOptionLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'subtotal' } )
    @Transform( transformSingleNumberArray )
    subtotal: number;

    @ApiModelProperty()
    @Expose( { name: 'surcharge_amount' } )
    @Transform( transformSingleNumberArray )
    tariffSurchargeAmount: number;

    @ApiModelProperty()
    @Expose( { name: 'gift_certificate_total' } )
    @Transform( transformSingleNumberArray )
    giftCertificateTotal: number;

    @ApiModelProperty()
    @Expose( { name: 'total' } )
    @Transform( transformSingleNumberArray )
    total: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_address_id' } )
    @Transform( transformSingleIntArray )
    shippingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'master_order_id' } )
    @Transform( transformSingleValueArray )
    masterOrderId: string;

    @ApiModelProperty()
    @Expose( { name: 'store_id' } )
    @Transform( transformSingleIntArray )
    storeId: number;

    @ApiModelProperty()
    @Expose( { name: 'store_domain_id' } )
    @Transform( transformSingleIntArray )
    storeDomainId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_source_id' } )
    @Transform( transformSingleIntArray )
    orderSourceId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_source_label' } )
    @Transform( transformSingleValueArray )
    orderSourceLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'date_placed' } )
    @Transform( transformSingleShortDateStringArray )
    datePlaced: string;

    @ApiModelProperty()
    @Expose( { name: 'customer_id' } )
    @Transform( transformSingleIntArray )
    customerId: number;

    @ApiModelProperty()
    @Expose( { name: 'processing_statuscode' } )
    @Transform( transformSingleIntArray )
    processingStatusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'processing_statuscode_label' } )
    @Transform( transformSingleValueArray )
    processingStatusCodeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'payment_method' } )
    @Transform( transformSingleValueArray )
    paymentMethod: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_shipped' } )
    @Transform( transformSingleDateArray )
    dateShipped: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    @Transform( transformSingleDateArray )
    dateAdded: Date;

    @ApiModelProperty()
    @Expose( { name: 'billing_address_id' } )
    @Transform( transformSingleIntArray )
    billingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'subtotal_discount' } )
    @Transform( transformSingleNumberArray )
    subtotalDiscount: number;

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    @Transform( transformSingleIntArray )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_tracking_id' } )
    @Transform( transformSingleValueArray )
    orderTrackingId: string;

    @ApiModelProperty()
    @Expose( { name: 'payment_option_id' } )
    @Transform( transformSingleValueArray )
    paymentOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'support_email' } )
    @Transform( transformSingleValueArray )
    supportEmail: string;

    @ApiModelProperty( { type: OrderLineItemDto, isArray: true } )
    @Expose( { name: 'order_lines' } )
    @Transform( value => !!value ? value.map( ( resp: object ) => OrderLineItemDto.getInstance( resp ) ) : [] )
    orderLines: OrderLineItemDto[];

    @ApiModelProperty( { type: AddressDto } )
    @Expose( { name: 'shipping_address' } )
    @Transform( value => value && value.length === 1 ? AddressDto.getInstance( value[ 0 ] ) : undefined )
    shippingAddress: AddressDto;

    @ApiModelProperty( { type: AddressDto } )
    @Expose( { name: 'billing_address' } )
    @Transform( value => value && value.length === 1 ? AddressDto.getInstance( value[ 0 ] ) : undefined )
    billingAddress: AddressDto;

    @ApiModelProperty( { type: PaymentResponseInfoDto } )
    @Expose( { name: 'payment_info' } )
    @Transform( value => value && value.length === 1 ? PaymentResponseInfoDto.getInstance( value[ 0 ] ) : undefined )
    paymentInfo: PaymentResponseInfoDto;

    @ApiModelProperty()
    @Expose( { name: 'membership_level_id' } )
    @Transform( transformSingleNumberArray )
    membershipLevelId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_level' } )
    @Transform( transformSingleValueArray )
    membershipLevel: string;

    @ApiModelProperty( { type: MembershipDto } )
    membershipDetail: MembershipDto;

    @ApiModelProperty()
    @Expose( { name: 'store_credit_total' } )
    @Transform( transformSingleNumberArray )
    storeCreditTotal: number;

    @ApiModelProperty( { isArray: true, type: OrderLineDiscountDto } )
    @Expose( { name: 'order_line_discounts' } )
    @Transform( value => !!value ? value.map( ( resp: object ) => OrderLineDiscountDto.getInstance( resp ) ) : [] )
    orderLineDiscounts: OrderLineDiscountDto[];

    @ApiModelProperty()
    @Expose( { name: 'vat_amount' } )
    @Transform( transformSingleNumberArray )
    vatAmount: number;

    @ApiModelProperty( { description: 'Calculated discount summing the difference of each orderLines retailUnitPrice - vipUnitPrice' } )
    vipDiscount: number;

    @ApiModelProperty( { description: 'Reward points for order' } )
    @Expose( { name: 'order_reward_points' } )
    orderRewardPoints: number;

    @ApiModelProperty()
    @Expose( { name: 'store_credit_amount' } )
    @Transform( transformSingleNumberArray )
    storeCreditAmount: number;

    @ApiModelProperty()
    @Expose( { name: 'member_credit_amount' } )
    @Transform( transformSingleNumberArray )
    memberCreditAmount: number;

    @ApiModelProperty( { isArray: true, type: TrackingDto } )
    @Expose( { name: 'tracking' } )
    @Type( () => TrackingDto )
    tracking: Array<TrackingDto>;

    @ApiModelProperty()
    @Expose( { name: 'vip_savings' } )
    @Transform( transformSingleNumberArray )
    vipSavings: number;

    @ApiModelProperty()
    @Expose( { name: 'is_master_order' } )
    @Transform( transformToBoolean )
    isMasterOrder: boolean;

    @ApiModelProperty()
    @Expose( { name: 'is_preorder' } )
    @Transform( transformToBoolean )
    isPreorder: boolean;

    @Expose( { name: 'split_orders' } )
    @Transform( value => !!value ? value.map( ( resp: object ) => OrderDetailDto.getInstance( resp ) ) : undefined )
    splitOrders: OrderDetailDto[];

    @ApiModelProperty()
    latestDateInventoryAvailablePreorder: Date;

    @ApiModelProperty()
    latestDatePreorderExpires: Date;

    @ApiModelProperty( { isArray: true, type: DiscountDto } )
    @Expose( { name: 'discounts' } )
    @Type( () => DiscountDto )
    discounts: DiscountDto[] = new Array<DiscountDto>();

    static getInstance ( orderResult: any ): OrderDetailDto {

        let orderDetail = orderResult.order_detail ? orderResult.order_detail : orderResult;
        orderDetail = _.transform( orderDetail, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );

        const dto: OrderDetailDto = plainToClass<OrderDetailDto, object>(OrderDetailDto, orderDetail);
        dto.orderRewardPoints = orderDetail ? orderDetail.order_reward_points : null;
        if (!!dto.orderLines) {
            const membershipProduct = dto.orderLines.find(item => item.productTypeId === CartProductType.Membership);
            if (!!membershipProduct) {
                const membershipCost = membershipProduct.retailUnitPrice;
                membershipProduct.purchaseUnitPrice = membershipCost;
                membershipProduct.extendedPurchasePrice = membershipCost;
                membershipProduct.vipUnitPrice = membershipCost;

                dto.subtotal += membershipCost;
                dto.total += membershipCost;
            }
        }

        let vipDiscount = 0;
        if ( dto.orderLines && dto.orderLines.length > 0 ) {
            dto.orderLines.forEach( item => {
                vipDiscount += item.retailUnitPrice - item.vipUnitPrice;
            } );
        }
        dto.vipDiscount = vipDiscount;

        dto.shipping = ( !!dto.shipping ? dto.shipping : 0 ) - ( !!dto.shippingDiscount ? dto.shippingDiscount : 0 );

        //Group lines by bundles
        const bundleOrderLines = new Array<OrderLineItemDto>();

        dto.orderLines.forEach( orderLine => {
            // check if the item is bundle parent
            if ( orderLine.productTypeId === CartProductType.ProductSet ) {
                // find all the parts of that bundle based on the groupKey
                orderLine.bundleItems = dto.orderLines.filter( i => i.groupKey === orderLine.groupKey && i.productTypeId === CartProductType.ProductSetProduct ).sort( ( a, b ) => b.defaultProductCategoryId - a.defaultProductCategoryId );
                // keep a list of items being nested as part of a bundle to remove them from the flat array later
                bundleOrderLines.push( ...orderLine.bundleItems );
            }
        } );

        if ( bundleOrderLines.length ) {
            dto.orderLines = dto.orderLines.filter( line => bundleOrderLines.findIndex( bundleLine => bundleLine.orderLineId === line.orderLineId ) === -1 );
        }

        return dto;
    }

    getProductIds (): number[] {
        return this.orderLines.map( o => o.productId );
    }

    @ApiModelPropertyOptional()
    trustPilotPayload: string | undefined;
}
