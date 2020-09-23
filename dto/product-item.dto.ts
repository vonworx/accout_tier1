import { ApiModelProperty } from '@nestjs/swagger';

export enum ProductItemStatus {
    AVAILABLE = 'AVAILABLE',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    BACK_ORDER = 'BACK_ORDER',
    PRE_ORDER = 'PRE_ORDER',
    FULFILLED = 'FULFILLED',
    RECEIVED = 'SHIPPING',
    RETURNED = 'RETURNED'
}

export class ProductItemDto {

    @ApiModelProperty()
    productId: number;

    @ApiModelProperty()
    productName: string;

    @ApiModelProperty()
    attributes: object;

    @ApiModelProperty()
    price: number;

    @ApiModelProperty()
    thumbnailUrl: string;

    @ApiModelProperty()
    status: ProductItemStatus;

}