import { ProductItemDto } from './product-item.dto';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToClass, Exclude, Transform } from 'class-transformer';
import * as _ from 'lodash';

@Exclude()
export class WaitlistItemDto extends ProductItemDto {

    @ApiModelProperty()
    @Expose( { name: 'membership_product_wait_list_id' } )
    id: number;

    @ApiModelProperty()
    @Expose( { name: 'master_product_id' } )
    masterProductId: number;

    @ApiModelProperty()
    @Expose( { name: 'product_label' } )
    productLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'default_unit_price' } )
    defaultUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'retail_unit_price' } )
    retailUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'default_product_category_id' } )
    productCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'default_product_category_label' } )
    productCategoryLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'product_size' } )
    productSize: string;

    @ApiModelProperty()
    @Expose( { name: 'product_id' } )
    productId: number;

    @ApiModelProperty()
    @Expose( { name: 'alias' } )
    alias: string;

    @ApiModelProperty()
    @Expose( { name: 'item_number' } )
    itemNumber: string;

    @ApiModelProperty()
    @Expose( { name: 'permalink' } )
    permalink: string;

    @ApiModelProperty()
    @Expose( { name: 'wait_list_type_id' } )
    waitlistTypeId: number;

    @ApiModelProperty()
    @Expose( { name: 'wait_list_type_label' } )
    waitlistTypeLabel: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'datetime_added' } )
    dateAdded: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expires' } )
    dateExpires: Date;

    @ApiModelProperty()
    @Expose( { name: 'featured_product_location_id_list' } )
    fplIdList: string;

    @ApiModelProperty()
    @Expose( { name: 'statuscode' } )
    statusCode: number;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    dateAvailablePreOrder: Date;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    dateInventoryAvailable: Date;

    @ApiModelProperty()
    availableQuantity: number;

    @ApiModelProperty()
    availableQuantityPreOrder: number;

	@ApiModelProperty()
	@Expose( { name: 'token_redemption_quantity' } )
	tokenRedemptionQuantity: number;

    @ApiModelProperty()
    @Expose()
    @Transform( ( val, obj, type ) => {
        const colorMatches = !!obj.alias ? obj.alias.match( /\(([^)]+)\)/g ) : [];
        if ( !!colorMatches && colorMatches.length > 0 ) {
            return colorMatches[ 0 ].replace( '(', '' ).replace( ')', '' );
        }
        return '';
    } )
    color: string;

    @ApiModelProperty()
    componentCount: number;

    @ApiModelProperty({isArray: true, type: Number})
    tagIdList: Array<number>;

    @ApiModelProperty()
    availableQuantityAnyProfile: number;

    @ApiModelPropertyOptional()
    waitlistAllowed: boolean;

    @ApiModelProperty( { description: 'Order Lines that belong to a bundle/set in an order', isArray: true, type: Object } )
    bundleItems: WaitlistItemDto[];

    // tslint:disable-next-line:ban-types
    static getInstance ( item: Object ): WaitlistItemDto {
        item = _.transform( item, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( WaitlistItemDto, item );
    }

}

export class WaitlistResponseDto {

    @ApiModelProperty( { isArray: true, type: WaitlistItemDto } )
    items: WaitlistItemDto[];

    @ApiModelProperty()
    page: number;

    @ApiModelProperty()
    pageSize: number;

    @ApiModelProperty()
    total: number;

}
