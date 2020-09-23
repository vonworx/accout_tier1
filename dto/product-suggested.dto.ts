import { ApiModelProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Type } from 'class-transformer';
import * as _ from 'lodash';

export class ProductSuggestedDto {
	@ApiModelProperty()
	@Expose( { name: 'average_review' } )
	averageReview: number;

	@ApiModelProperty()
	@Expose( { name: 'date_expected' } )
	dateExpected: Date;

	@ApiModelProperty()
	@Expose( { name: 'option_signature' } )
	optionSignature: string;

	@ApiModelProperty()
	@Expose( { name: 'retail_unit_price' } )
	retailUnitPrice: number;

	@ApiModelProperty()
	@Expose( { name: 'token_redemption_quantity' } )
	tokenRedemptionQuantity: number;

	@ApiModelProperty()
	@Expose( { name: 'available_quantity' } )
	availableQuantity: number;

	@ApiModelProperty()
	@Expose( { name: 'permalink' } )
	permalink: string;

	@ApiModelProperty()
	@Expose( { name: 'alias' } )
	alias: string;

	@ApiModelProperty()
	@Expose( { name: 'recommended_count' } )
	recommendedCount: number;

	@ApiModelProperty()
	@Expose( { name: 'sale_unit_price' } )
	saleUnitPrice: number;

	@ApiModelProperty()
	@Expose( { name: 'row_number' } )
	rowNumber: number;

	@ApiModelProperty()
	@Expose( { name: 'param_hash' } )
	paramHash: string;

	@ApiModelProperty()
	@Expose( { name: 'product_id' } )
	productId: number;

	@ApiModelProperty()
	@Expose( { name: 'item_number' } )
	itemNumber: string;

	@ApiModelProperty()
	@Expose( { name: 'master_product_id' } )
	masterProductId: number;

	@ApiModelProperty()
	@Expose( { name: 'product_label' } )
	productLabel: string;

	@ApiModelProperty()
	@Expose( { name: 'review_count' } )
	reviewCount: number;

	@ApiModelProperty()
	@Expose( { name: 'total_records' } )
	totalRecords: number;

	@ApiModelProperty()
	@Expose( { name: 'default_unit_price' } )
	defaultUnitPrice: number;

	@ApiModelProperty()
	@Expose( { name: 'related_product_count' } )
	relatedProductCount: number;

	@ApiModelProperty()
	@Expose( { name: 'sort' } )
	sort: number;

	@ApiModelProperty()
	@Expose( { name: 'product_category_label' } )
	productCategoryLabel: string;

	@ApiModelProperty()
	@Expose( { name: 'daily_fix_active' } )
	dailyFixActive: boolean;

	@ApiModelProperty()
	@Expose( { name: 'product_category_id' } )
	productCategoryId: number;

	static getInstance ( rpcObject: object ): ProductSuggestedDto {
		rpcObject = _.transform( rpcObject, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
		return plainToClass( ProductSuggestedDto, rpcObject );
	}

	static getInstances ( rpcResult: Array<any> ): Array<ProductSuggestedDto> {
		const products = rpcResult.map( ProductSuggestedDto.getInstance );
		return products;
	}
}

export class SuggestedProductResponseDto {

	@ApiModelProperty({description: 'Page number of the results'})
	page: number;
	@ApiModelProperty()
	pageSize: number;
	@ApiModelProperty()
	totalResults: number;
	@ApiModelProperty( { isArray: true, type: ProductSuggestedDto } )
	@Type( () => ProductSuggestedDto )
	products: Array<ProductSuggestedDto>;
}