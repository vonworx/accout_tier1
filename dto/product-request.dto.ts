import { ApiModelProperty } from '@nestjs/swagger';

export enum WaitlistType {
    EMAIL = 1,
    AUTO_ORDER = 2,
    PRE_ORDER = 3
}

export class ProductRequestDto {
    @ApiModelProperty( { description: 'Product id that will be processed.' } )
    productId: number;

    @ApiModelProperty( { description: 'Waitlist type id could be 1 = Email, 2 = Auto Order or 3 = Preorder/Auto Order' } )
    waitlistTypeId: WaitlistType;

    @ApiModelProperty( { description: 'Number of days into the future product will be auto purchased.  Takes priority over dateExpires' } )
    autoPurchaseDays: number;

    @ApiModelProperty( { description: 'The date the product will be auto purchased.  Will be ignored if autoPurchaseDays is set', type: String, format: 'date-time' } )
    dateExpires: Date;
}

export class ProductWishlistRequestDto {
    @ApiModelProperty( { description: 'Master product id that will be added to wishlist.' } )
    productId: number;
}

export class ProductSetRequestDto {
    @ApiModelProperty( { description: 'The master product id of the set (bundled products).' } )
    setId: number;

    @ApiModelProperty( { description: 'Component product ids.', isArray: true, type: Number } )
    componentProductIds: number[];

    @ApiModelProperty( { description: 'Waitlist type id could be 1 = Email, 2 = Auto Order or 3 = Preorder/Auto Order' } )
    waitlistTypeId: WaitlistType;

    @ApiModelProperty( { description: 'Number of days into the future product will be auto purchased.  Takes priority over dateExpires' } )
    autoPurchaseDays: number;

    @ApiModelProperty( { description: 'The date the product will be auto purchased.  Will be ignored if autoPurchaseDays is set', type: String, format: 'date-time' } )
    dateExpires: Date;
}
