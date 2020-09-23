import { WishlistItemDto } from './wishlist-item.dto';
import { plainToClass } from 'class-transformer';

'use strict';

const emptyCart = {cart_id: 111} ;

describe('WishlistItemDto', () => {

    let wishlistItem: WishlistItemDto, wishlistItemObj: any;

    beforeEach(() => {
        wishlistItemObj = {
            row_number: 1,
            total_records: 3,
            product_id: null,
            master_product_id: 6166150,
            product_label: 'SATIN CAMISOLE SET',
            alias: 'LI1826187-0001 (BLACK)',
            date_expected: 'February, 01 2018 00:00:00',
            default_unit_price: 39.95,
            retail_unit_price: 59.95,
            product_category_id: 1127,
            product_category_label: 'SleepWear',
            available_quantity: 0,
            item_number: 'LI1826187-0001-00',
            permalink: 'SATIN-CAMISOLE-SET-LI1826187-0001',
            product_type_id: null
        };
    });

    describe('object serialization', () => {

        beforeEach(() => {
            wishlistItem = plainToClass(WishlistItemDto, <object> wishlistItemObj);
        });

        test('master_product_id', () => {
            expect(wishlistItem.masterProductId).toBe(wishlistItemObj.master_product_id);
        });

        test('product_label', () => {
            expect(wishlistItem.productLabel).toBe(wishlistItemObj.product_label);
        });

        test('alias', () => {
            expect(wishlistItem.alias).toBe(wishlistItemObj.alias);
        });

        test('date_expected', () => {
            expect(wishlistItem.dateExpected).toBe(wishlistItemObj.date_expected);
        });

        test('default_unit_price', () => {
            expect(wishlistItem.defaultUnitPrice).toBe(wishlistItemObj.default_unit_price);
        });
        test('retail_unit_price', () => {
            expect(wishlistItem.retailUnitPrice).toBe(wishlistItemObj.retail_unit_price);
        });
        test('product_category_id', () => {
            expect(wishlistItem.productCategoryId).toBe(wishlistItemObj.product_category_id);
        });
        test('product_category_label', () => {
            expect(wishlistItem.productCategoryLabel).toBe(wishlistItemObj.product_category_label);
        });
        test('available_quantity', () => {
            expect(wishlistItem.availableQuantity).toBe(wishlistItemObj.available_quantity);
        });
        test('item_number', () => {
            expect(wishlistItem.itemNumber).toBe(wishlistItemObj.item_number);
        });
        test('permalink', () => {
            expect(wishlistItem.permalink).toBe(wishlistItemObj.permalink);
        });
        test('product_type_id', () => {
            expect(wishlistItem.productTypeId).toBe(wishlistItemObj.product_type_id);
        });
    });
});
