import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import { transformToReturnableProductArray, transformToBoolean } from '../../common/utils';
import { RetailPointRequestDto } from '../../cart/dto/retail-point.dto';

export enum RmaItemType {
    Return = 10,
    Refund = 11,
    RefundAndStoreCredit = 12,
    StoreCredit = 15,
    MembershipCredit = 16,
    NoRefund = 19,
    Exchange = 20,
    DiffProduct = 21,
    ChangeSizeColor = 22,
    ReshipSameProd = 25
}

export class RmaItemDto {

    @ApiModelProperty({description: ''})
    actionId: number;

    @ApiModelProperty({description: 'The id of the condition of the item chosen by the user'})
    conditionId: number;

    @ApiModelProperty({description: 'The comment provided by the user for the item'})
    comment: string;

    @ApiModelProperty({description: 'The id of the product chosen as a replacement', default: 0})
    exchangeProductId: number;

    @ApiModelProperty({description: 'The orderLineId of the item from the order to be returned'})
    orderLineId: number;

    @ApiModelProperty({description: 'The id of the reason chosen by the user for returning this item'})
    reasonId: number;

    @ApiModelProperty({description: 'The id of the restocking fee associated with returning the item'})
    restockingFeeId: number;

    static getInstance(item: object): RmaItemDto {
        const dto: RmaItemDto = plainToClass(RmaItemDto, item);
        dto.exchangeProductId = !!dto.exchangeProductId ? dto.exchangeProductId : 0;
        dto.restockingFeeId = !!dto.restockingFeeId ? dto.restockingFeeId : 0;
        dto.actionId = !!dto.actionId ? dto.actionId : 0;
        dto.comment = !!dto.comment ? dto.comment : '';

        return dto;
    }

}

export class OrderRmaDto {

    @ApiModelProperty()
    orderId: number;

    @ApiModelProperty({description: 'Details for each item from the order that is being returned', isArray: true, type: RmaItemDto})
    @Transform(items => items && !!items.length ? items.map((item) => RmaItemDto.getInstance(item)) : [])
    items: RmaItemDto[];

    @ApiModelProperty({description: 'Carrier Retail Point info', type: RetailPointRequestDto})
    @Transform(crpInfo => crpInfo ? plainToClass(RetailPointRequestDto, crpInfo) : undefined)
    crpInfo: RetailPointRequestDto;

    toRpcParams(): any {
        const params: any = {};

        params.order_id = this.orderId;

        params.items = this.items.map((item) => {
            return {
                order_line_id: item.orderLineId,
                return_reason_id: item.reasonId,
                return_condition_id: item.conditionId,
                return_action_id: item.actionId,
                return_comment: item.comment,
                restocking_fee_id: item.restockingFeeId,
                exchange_product_id: item.exchangeProductId
            };
        });

        if ( !!this.crpInfo ) {
            params.crp_info = {
                address1: this.crpInfo.address1,
                city: this.crpInfo.city,
                location_id: this.crpInfo.locationId,
                company: this.crpInfo.company,
                zip: this.crpInfo.zip,
                email: this.crpInfo.email,
                phone: this.crpInfo.phone
            };
        }

        return params;
    }
}

@Exclude()
export class ReturnableProductDto {
    @ApiModelProperty()
    @Expose({name: 'ORDER_LINE_ID'})
    orderLineId: number;

    @ApiModelProperty()
    @Expose({name: 'ITEM_ID'})
    itemId: number;

    @ApiModelProperty()
    @Expose({name: 'PRODUCT_ID'})
    productId: number;

    @ApiModelProperty()
    @Expose({name: 'RMA_PRODUCT_ID'})
    rmaProductId: number;

    @ApiModelProperty()
    @Expose({name: 'RETURNABLE'})
    @Transform( value => transformToBoolean(value) )
    isReturnable: boolean;

    @ApiModelProperty()
    @Expose({name: 'RMA_ID'})
    rmaId: number;

    @ApiModelProperty()
    @Expose({name: 'TAX'})
    tax: number;

    /*
    "IS_GIFT": 0,
    UNIT_AMOUNT_PAID": 39.75,
    "LPN_CODE": "",
    "ORDER_LINE_ID": 52707290,
    "ALIAS": "UD1825453-0001 (BLACK)",
    "PRODUCT_TYPE_ID": 1,
    "UNIT_PRICE": 39.95,
    "RETURN_REASON_ID": "",
    "STORE_CREDIT_AMOUNT": "",
    "RESTOCKING_FEE_AMOUNT": "",
    "EXPECTED_RETURN_CONDITION_ID": "",
    "RETAIL_PRICE": 59.95,
    "RMA_PRODUCT_ID": "",
    "RETURN_ACTION_ID": "",
    "RETURN_ACTION_LABEL": "",
    "EXPECTED_RETURN_CONDITION_LABEL": "",
    "REFUND_AMOUNT": "",
    "LABEL": "PERFECT GIRL BRIEF - XS",
    "UNIT_DISCOUNT": 0.2,
    "RMA_ID": "",
    "DATETIME_RESOLVED": "",
    "IS_THIS_RMA": 0,
    "REASON_COMMENT": "",
    "ITEM_ID": 537167,
    "RETURNABLE": 1,
    "PRICE_ADJUSTMENT": 0,
    "FINAL_SALE": 0,
    "PRODUCT_ID": 6166096,
    "ITEM_NUMBER": "UD1825453-0001-57010",
    "RMA_STATUSCODE_LABEL": "",
    "RETURN_REASON_LABEL": "",
    "RESTOCKING_FEE_ID": "",
    "AMOUNT_PAID": "",
    "PURCHASE_PRICE": 39.95,
    "RESTOCKING_FEE_LABEL": "",
    "RMA_STATUSCODE": ""
    */
}

@Exclude()
export class ReturnableProductsDto {

    @ApiModelProperty()
    @Expose({name: 'products'})
    @Transform( value => transformToReturnableProductArray(value) )
    products: ReturnableProductDto[];

    @ApiModelProperty()
    @Expose({name: 'return_reasons'})
    returnReasons: any[];

    @ApiModelProperty()
    @Expose({name: 'refund_available'})
    refundAvailable: any[];

    static getInstance(rpcObject: object): ReturnableProductsDto {
        return plainToClass(ReturnableProductsDto, rpcObject);
    }

}

@Exclude()
export class ReturnProductSuccessDto {

    @ApiModelProperty()
    @Expose({name: 'success'})
    success: boolean;

    @ApiModelProperty()
    @Expose({name: 'data'})
    data: any;

    @ApiModelProperty()
    @Expose({name: 'successMessage'})
    successMessage: string;

    /*
    These props are expected by the UI but is not currently being retured by Bento API:

    label:string;
    color:string;
    size:string;
    reason:string;
    resolution:string;

    */

    static getInstance(rpcObject: object): ReturnProductSuccessDto {
        return plainToClass(ReturnProductSuccessDto, rpcObject);
    }
}

@Exclude()
export class ReturnProductFaultDto {

    @ApiModelProperty()
    @Expose({name: 'success'})
    success: boolean;

    @ApiModelProperty()
    @Expose({name: 'errors'})
    errors: any[];

    @ApiModelProperty()
    @Expose({name: 'errorMessage'})
    errorMessage: string;

    static getInstance(rpcObject: object): ReturnProductFaultDto {
        return plainToClass(ReturnProductFaultDto, rpcObject);
    }

}