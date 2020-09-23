import { ProductItemDto } from './product-item.dto';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import * as _ from 'lodash';

@Exclude()
export class WishlistItemDto extends ProductItemDto {

    @ApiModelProperty()
    @Expose( { name: 'master_product_id' } )
    masterProductId: number;

    @ApiModelProperty()
    @Expose( { name: 'product_label' } )
    productLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'alias' } )
    alias: string;

    @ApiModelProperty( { type: String, format: 'date-time' } )
    @Expose( { name: 'date_expected' } )
    dateExpected: Date;

    @ApiModelProperty()
    @Expose( { name: 'default_unit_price' } )
    defaultUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'retail_unit_price' } )
    retailUnitPrice: number;

    @ApiModelProperty()
    @Expose( { name: 'product_category_id' } )
    productCategoryId: number;

    @ApiModelProperty()
    @Expose( { name: 'product_category_label' } )
    productCategoryLabel: string;

    @ApiModelProperty()
    @Expose( { name: 'available_quantity' } )
    availableQuantity: number;

    @ApiModelProperty()
    @Expose( { name: 'item_number' } )
    itemNumber: string;

    @ApiModelProperty()
    @Expose( { name: 'permalink' } )
    permalink: string;

    @ApiModelProperty()
    @Expose( { name: 'product_type_id' } )
    productTypeId: number;

	@ApiModelProperty()
	@Expose( { name: 'token_redemption_quantity' } )
	tokenRedemptionQuantity: number;

    @ApiModelProperty()
    componentCount: number;

    @ApiModelProperty({isArray: true, type: Number})
    tagIdList: Array<number>;

    @ApiModelProperty()
    availableQuantityAnyProfile: number;

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

    // tslint:disable-next-line:ban-types
    static getInstance ( item: Object ): WishlistItemDto {
        item = _.transform( item, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass( WishlistItemDto, item );
    }

}

export class WishlistResponseDto {

    @ApiModelProperty( { isArray: true, type: WishlistItemDto } )
    items: WishlistItemDto[];

    @ApiModelProperty()
    page: number;

    @ApiModelProperty()
    pageSize: number;

    @ApiModelProperty()
    total: number;

}

export class WishlistProductIdsResponseDto {

    @ApiModelProperty( { description: 'Total number of wishlist items' } )
    total: number;

    @ApiModelProperty( { description: 'Master product id', isArray: true, type: Number } )
    @Expose( { name: 'master_product_id' } )
    masterProductIds: Array<number>;

}