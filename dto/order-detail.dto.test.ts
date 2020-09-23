import { AddressDto } from '../../account/dto/address.dto';
import { PaymentResponseInfoDto } from '../../account/dto/payment-info.dto';
import { OrderDetailDto, OrderLineItemDto, OrderLineDiscountDto } from './order-detail.dto';

describe( 'OrderDetailDto', () => {
    const orderSubmitFixture = require( '../../../tests/fixtures/cart/order-submit-result.json' );
    const orderDetailF = require( '../../../tests/fixtures/orders/order-detail-result.json' );
    let dto: OrderDetailDto;
    let orderDtoR: OrderDetailDto;

    beforeAll( () => {
        dto = OrderDetailDto.getInstance( orderSubmitFixture.result[ 0 ].order_detail );
        orderDtoR = OrderDetailDto.getInstance( orderDetailF.result[ 0 ] );
    } );

    test( 'json is serialized to dto', () => {
        expect( dto ).toBeInstanceOf( OrderDetailDto );
    } );

    test( 'shipping address is created', () => {
        expect( dto.shippingAddress ).toBeInstanceOf( AddressDto );
    } );

    test( 'billing address is created', () => {
        expect( dto.billingAddress ).toBeInstanceOf( AddressDto );
    } );

    test( 'payment info is created', () => {
        expect( dto.paymentInfo ).toBeInstanceOf( PaymentResponseInfoDto );
    } );

    test( 'order lines are created', () => {
        expect( dto.orderLines ).toHaveLength( 2 );
        expect( dto.orderLines[ 0 ] ).toBeInstanceOf( OrderLineItemDto );
    } );

    test( 'orderRewardPoints lines are created', () => {
        expect( dto.orderRewardPoints).toBe( orderDtoR.orderRewardPoints );
    } );

    describe( 'OrderLineDiscountDto', () => {

        let orderDetailFixture: any;
        let orderDto: OrderDetailDto;
        let sourceDiscounts: any[];

        beforeEach( () => {
            orderDetailFixture = require( '../../../tests/fixtures/orders/order-detail-result.json' );

            orderDto = OrderDetailDto.getInstance( orderDetailFixture.result[ 0 ] );

            sourceDiscounts = orderDetailFixture.result[ 0 ].order_line_discounts;
        } );

        test( 'Order Detail Serializes all of the discounts', () => {
            expect( sourceDiscounts.length ).toBe( orderDto.orderLineDiscounts.length );
        } );

        describe( 'OrderLineDiscount Properties', () => {

            let discount: OrderLineDiscountDto, srcDiscount: any, refAllowed: boolean, exAllowed: boolean, finalSale: boolean;

            beforeEach( () => {
                srcDiscount = sourceDiscounts[ 1 ];
                srcDiscount.exchanges_allowed = 1;
                exAllowed = true;

                srcDiscount.refunds_allowed = 1;
                refAllowed = true;

                srcDiscount.final_sale = 0;
                finalSale = false;

                discount = OrderLineDiscountDto.getInstance( srcDiscount );
            } );

            test( 'order_line_discount_id', () => {
                expect( discount.orderLineDiscountId ).toBe( srcDiscount.order_line_discount_id );
            } );
            test( 'order_line_id', () => {
                expect( discount.orderLineId ).toBe( srcDiscount.order_line_id );
            } );
            test( 'promo_id', () => {
                expect( discount.promoId ).toBe( srcDiscount.promo_id );
            } );
            test( 'discount_id', () => {
                expect( discount.discountId ).toBe( srcDiscount.discount_id );
            } );
            test( 'amount', () => {
                expect( discount.amount ).toBe( srcDiscount.amount );
            } );
            test( 'code', () => {
                expect( discount.promoCode ).toBe( srcDiscount.code );
            } );
            test( 'label', () => {
                expect( discount.label ).toBe( srcDiscount.label );
            } );
            test( 'long_label', () => {
                expect( discount.longLabel ).toBe( srcDiscount.long_label );
            } );
            test( 'refunds_allowed', () => {
                expect( discount.refundsAllowed ).toBe( refAllowed );
            } );
            test( 'exchanges_allowed', () => {
                expect( discount.exchangesAllowed ).toBe( exAllowed );
            } );
            test( 'final_sale', () => {
                expect( discount.finalSale ).toBe( finalSale );
            } );

        } );

    } );
});
