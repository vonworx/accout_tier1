import { Exclude, Expose, Type, Transform, plainToClass } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import { transformToBoolean } from '../../common/utils';
import { CartProductType, CartItemDto } from '../../cart/dto';
import { TrackingDto } from './tracking.dto';

export enum OrderStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    SHIPPED = 'SHIPPED'
}

export class OrderDto {

    @ApiModelProperty()
    id: number;

    @ApiModelProperty()
    orderNumber: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    orderDate: Date;

    @ApiModelProperty()
    totalCost: number;

    @ApiModelProperty()
    status: OrderStatus;

    @ApiModelProperty()
    canReturn: boolean;
}

@Exclude()
export class ShippingLineDto {
    @ApiModelProperty()
    @Expose( { name: 'cost' } )
    cost: number;

    @ApiModelProperty()
    @Expose( { name: 'amount' } )
    amount: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_option_id' } )
    shippingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'level' } )
    level: string;

    @ApiModelProperty()
    @Expose( { name: 'type' } )
    type: string;

    static getInstance ( shippingLineObj: object ): ShippingLineDto {
        const dto: ShippingLineDto = plainToClass( ShippingLineDto, shippingLineObj );
        return dto;
    }
}

@Exclude()
export class OrderHistoryDto {
    @ApiModelProperty()
    @Expose( { name: 'ADDRESS1' } )
    address1: string;

    @ApiModelProperty()
    @Expose( { name: 'ADDRESS2' } )
    address2: string;

    @ApiModelProperty()
    @Expose( { name: 'AUTH_PAYMENT_TRANSACTION_ID' } )
    authPaymentTransactionId: number;

    @ApiModelProperty()
    @Expose( { name: 'BILL_ADDRESS1' } )
    billAddress1: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_ADDRESS2' } )
    billAddress2: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_CITY' } )
    billCity: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_COUNTRY_CODE' } )
    billCountryCode: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_FIRSTNAME:' } )
    billFirstname: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_LASTNAME' } )
    billLastname: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_STATE' } )
    billState: string;

    @ApiModelProperty()
    @Expose( { name: 'BILL_ZIP' } )
    billZip: string;

    @ApiModelProperty()
    @Expose( { name: 'BILLING_ADDRESS_ID' } )
    billingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'CAPTURE_PAYMENT_TRANSACTION_ID' } )
    capturePaymentTransactionId: number;

    @ApiModelProperty()
    @Expose( { name: 'CITY:' } )
    city: string;

    @ApiModelProperty()
    @Expose( { name: 'CODE' } )
    code: string;

    @ApiModelProperty()
    @Expose( { name: 'COMPANY' } )
    company: string;

    @ApiModelProperty()
    @Expose( { name: 'COUNTRY_CODE' } )
    countryCode: string;

    @ApiModelProperty()
    @Expose( { name: 'CREDIT' } )
    credit: number;

    @ApiModelProperty()
    @Expose( { name: 'CURRENCY_CODE' } )
    currencyCode: string;

    @ApiModelProperty()
    @Expose( { name: 'CUSTOMER_ID' } )
    customerId: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATE_ADDED' } )
    dateAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATE_DELIVERED' } )
    dateDelivered: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATE_PLACED' } )
    datePlaced: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATE_SHIPPED' } )
    dateShipped: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_ADDED' } )
    dateTimeAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_LOCAL_TRANSACTION' } )
    dateTimeLocalTransaction: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_MODIFIED' } )
    dateTimeModified: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_PAYMENT_MODIFIED' } )
    dateTimePaymentModified: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_PROCESSING_MODIFIED' } )
    dateTimeProcessingModified: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'DATETIME_TRANSACTION' } )
    dateTimeTransaction: Date;

    @ApiModelProperty()
    @Expose( { name: 'DISCOUNT' } )
    discount: number;

    @ApiModelProperty()
    @Expose( { name: 'ESTIMATED_WEIGHT' } )
    estimatedWeight: string;

    @ApiModelProperty()
    @Expose( { name: 'FIRSTNAME' } )
    firstName: string;

    @ApiModelProperty()
    @Expose( { name: 'IS_AUTOSHIP' } )
    @Transform( value => transformToBoolean( value ) )
    isAutoship: boolean;

    @ApiModelProperty()
    @Expose( { name: 'IS_MEMBERSHIP_CREDIT' } )
    @Transform( value => transformToBoolean( value ) )
    isMemberCredit: boolean;

    @ApiModelProperty()
    @Expose( { name: 'IS_RETURNABLE' } )
    @Transform( value => transformToBoolean( value ) )
    isReturnable: boolean;

    @ApiModelProperty()
    @Expose( { name: 'IS_TRIAL' } )
    @Transform( value => transformToBoolean( value ) )
    isTrial: boolean;

    @ApiModelProperty()
    @Expose( { name: 'IS_TRIAL_ACTIVE' } )
    @Transform( value => transformToBoolean( value ) )
    isTrialActive: boolean;

    @ApiModelProperty()
    @Expose( { name: 'IS_TRIAL_COMPLETION' } )
    @Transform( value => transformToBoolean( value ) )
    isTrialCompletion: boolean;

    @ApiModelProperty()
    @Expose( { name: 'LASTNAME' } )
    lastName: string;

    @ApiModelProperty()
    @Expose( { name: 'MASTER_ORDER_ID' } )
    masterOrderId: number;

    @ApiModelProperty()
    @Expose( { name: 'MEMBERSHIP_LEVEL_ID' } )
    membershipLevelId: number;

    @ApiModelProperty()
    @Expose( { name: 'ORDER_ID' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'ORDER_SHIPPING_TYPE' } )
    orderShippingType: string;

    @ApiModelProperty()
    @Expose( { name: 'ORDER_SOURCE_ID' } )
    orderSourceId: number;

    @ApiModelProperty()
    @Expose( { name: 'ORDER_TRACKING_ID' } )
    orderTrackingId: number;

    @ApiModelProperty()
    @Expose( { name: 'ORDER_TYPE' } )
    orderType: string;

    @ApiModelProperty()
    @Expose( { name: 'PAYMENT_METHOD' } )
    paymentMethod: string;

    @ApiModelProperty()
    @Expose( { name: 'PAYMENT_OPTION_ID' } )
    paymentOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'PAYMENT_STATUSCODE' } )
    paymentStatuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'PAYMENT_STATUSCODE_LABEL' } )
    paymentStatuscodeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'PROCESSING_STATUSCODE' } )
    processingStatuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'PROCESSING_STATUSCODE_LABEL' } )
    processingStatuscodeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'RESERVED_ID' } )
    reservedId: number;

    @ApiModelProperty()
    @Expose( { name: 'RMA_ID' } )
    rmaId: number;

    @ApiModelProperty()
    @Expose( { name: 'RMA_STATUSCODE' } )
    rmaStatuscode: number;

    @ApiModelProperty()
    @Expose( { name: 'ROW_NUM' } )
    rowNum: number;

    @ApiModelProperty()
    @Expose( { name: 'SESSION_ID' } )
    sessionId: number;

    @ApiModelProperty()
    @Expose( { name: 'SHIPPING' } )
    shipping: number;

    @ApiModelProperty()
    @Expose( { name: 'SHIPPING_ADDRESS_ID' } )
    shippingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'SHIPPING_OPTION_ID' } )
    shippingOptionId: number;

    @ApiModelProperty()
    @Expose( { name: 'SHIPPING_OPTION_LABEL' } )
    shippingOptionLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'STATE' } )
    state: string;

    @ApiModelProperty()
    @Expose( { name: 'STORE_DOMAIN_ID' } )
    storeDomainId: number;

    @ApiModelProperty()
    @Expose( { name: 'STORE_GROUP_ID' } )
    storeGroupId: number;

    @ApiModelProperty()
    @Expose( { name: 'STORE_ID' } )
    storeId: number;

    @ApiModelProperty()
    @Expose( { name: 'STORE_LABEL' } )
    storeLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'SUBTOTAL' } )
    subtotal: number;

    @ApiModelProperty()
    @Expose( { name: 'SURCHARGE_AMOUNT' } )
    tariffSurchargeAmount: number;

    @ApiModelProperty()
    @Expose( { name: 'TAX' } )
    tax: number;

    @ApiModelProperty()
    @Expose( { name: 'TOTAL' } )
    total: number;

    @ApiModelProperty()
    @Expose( { name: 'TOTAL_COUNT' } )
    totalCount: number;

    @ApiModelProperty()
    @Expose( { name: 'TOTAL_FORMATTED' } )
    totalFormatted: string;

    @ApiModelProperty()
    @Expose( { name: 'ZIP' } )
    zip: string;

    @ApiModelProperty()
    @Expose( { name: 'VAT_AMOUNT' } )
    vatAmount: number;

    @ApiModelProperty( { isArray: true, type: TrackingDto } )
    @Expose( { name: 'tracking' } )
    @Transform( val => !!val ? val.map( f => TrackingDto.getInstance(f)) : [])
    tracking: Array<TrackingDto>;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'LATEST_DATE_TIME_INVENTORY_AVAILABLE_PREORDER' } )
    latestDateInventoryAvailablePreorder: Date;

    static getInstance ( orderHistoryDto: object ): OrderHistoryDto {
        const dto: OrderHistoryDto = plainToClass( OrderHistoryDto, orderHistoryDto );
        return dto;
    }
}

export class OrdersResponseDto {

    @ApiModelProperty( { isArray: true, type: OrderHistoryDto } )
    orders: OrderHistoryDto[];

    @ApiModelProperty()
    totalRecords: number;

    @ApiModelProperty()
    order: string;

}

@Exclude()
export class OrderSummaryResponseDto {

    @ApiModelProperty()
    @Expose( { name: 'credit' } )
    credit: number;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'product_sources' } )
    productSources: {}[];

    @ApiModelProperty()
    @Expose( { name: 'tax' } )
    tax: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping' } )
    shipping: number;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'coupons' } )
    coupons: {}[];

    @ApiModelProperty()
    @Expose( { name: 'types' } )
    types: any;

    @ApiModelProperty()
    @Expose( { name: 'subtotal' } )
    subtotal: number;

    @ApiModelProperty()
    @Expose( { name: 'surcharge_amount' } )
    tariffSurchargeAmount: number;

    @ApiModelProperty()
    @Expose( { name: 'shipping_address_id' } )
    shippingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'master_order_id' } )
    masterOrderId: string;

    @ApiModelProperty()
    @Expose( { name: 'store_id' } )
    storeId: number;

    @Expose( { name: 'auth_payment_transaction_id' } )
    authPaymentTransactionId: string;

    @ApiModelProperty()
    @Expose( { name: 'offers' } )
    offers: any;

    @ApiModelProperty()
    @Expose( { name: 'order_source_id' } )
    order_source_id: number;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'credits' } )
    credits: {}[];

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_placed' } )
    datePlaced: Date;

    @ApiModelProperty()
    @Expose( { name: 'ip' } )
    ip: string;

    @ApiModelProperty()
    @Expose( { name: 'customer_id' } )
    customerId: number;

    @ApiModelProperty()
    @Expose( { name: 'processing_status_code' } )
    processingStatusCode: number;

    @ApiModelProperty()
    @Expose( { name: 'payment_method' } )
    paymentMethod: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_shipped' } )
    dateShipped: Date;

    @ApiModelProperty( { isArray: true, type: CartItemDto } )
    @Expose( { name: 'order_lines' } )
    @Transform( value => value.map( ( resp: object ) => plainToClass( CartItemDto, resp ) ) )
    orderLines: CartItemDto[];

    @ApiModelProperty()
    @Expose( { name: 'gift_certificates' } )
    giftCertificates: any;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_added' } )
    dateAdded: Date;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'discounts' } )
    discounts: {}[];

    @ApiModelProperty()
    @Expose( { name: 'billing_address_id' } )
    billingAddressId: number;

    @ApiModelProperty()
    @Expose( { name: 'discount' } )
    discount: number;

    @ApiModelProperty()
    @Expose( { name: 'capture_payment_transaction_id' } )
    capturePaymentTransactionId: string;

    @ApiModelProperty()
    @Expose( { name: 'code' } )
    code: string;

    @ApiModelProperty( { isArray: true, type: ShippingLineDto } )
    @Expose( { name: 'shipping_lines' } )
    @Type( () => ShippingLineDto )
    shippingLines: ShippingLineDto[];

    @ApiModelProperty()
    @Expose( { name: 'order_id' } )
    orderId: number;

    @ApiModelProperty()
    @Expose( { name: 'order_tracking_id' } )
    orderTrackingId: string;

    @ApiModelProperty( { isArray: true, type: Object } )
    @Expose( { name: 'autoship_plans' } )
    autoshipPlans: {}[];

    @ApiModelProperty()
    @Expose( { name: 'session_id' } )
    sessionId: number;

    @ApiModelProperty()
    @Expose( { name: 'payment_option_id' } )
    paymentOptionId: number;

    static getInstance ( orderResponseObj: object ): OrderSummaryResponseDto {
        const dto: OrderSummaryResponseDto = plainToClass( OrderSummaryResponseDto, orderResponseObj );

        if ( !!dto.orderLines ) {
            const membershipProduct = dto.orderLines.find( item => item.productTypeId === CartProductType.Membership );
            if ( !!membershipProduct ) {
                const membershipCost = membershipProduct.retailUnitPrice;
                membershipProduct.purchaseUnitPrice = membershipCost;
                membershipProduct.extendedPurchasePrice = membershipCost;
                membershipProduct.vipUnitPrice = membershipCost;

                dto.subtotal += membershipCost;
            }

            //The subtotal includes the tariffSurchageAmount if a tariffSurchargeAmount is being charged
            //need to remove it from the subtotal so the subtotal is clear of the surcharge
            if ( dto.tariffSurchargeAmount > 0 ){
                dto.subtotal = dto.subtotal - dto.tariffSurchargeAmount;
            }
        }

        return dto;
    }
}