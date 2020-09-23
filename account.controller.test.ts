'use strict';

import { randomIntegerInRange, randomString } from '../../tests/test-helpers';

jest.mock('./_services/member.service');
jest.mock('../cart/cart.service');
jest.mock('../products/product.service');
jest.mock('../retailstore/retailstore-service');
jest.mock('./_services/membership.service');
jest.mock('@techstyle/emma-sdk');
jest.mock('../common/configuration/dto/configuration.dto');
jest.mock('../common/dto/headers-info.dto');
jest.mock('../common/dto/store-detail.dto');

import { AccountController } from './account.controller';
import { MemberService } from './_services/member.service';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../products/product.service';
import { MembershipService } from './_services/membership.service';
import { EmmaService } from '@techstyle/emma-sdk';
import { ConfigurationDto } from '../common/configuration/dto/configuration.dto';
import { SortDirection } from '../common/dto/sort-field';
import { HeadersDto } from '../common/dto/headers-info.dto';
import { WishlistItemDto, WishlistResponseDto } from './dto/wishlist-item.dto';
import { WaitlistItemDto, WaitlistResponseDto } from './dto/waitlist-item.dto';
import { ProductFieldsDto } from '../products/dto/product-default-fields.dto';
import { StoreDetailDto } from '../common/dto/store-detail.dto';
import { RetailStoreService } from '../retailstore/retailstore-service';
import { CustomerDto } from './dto/customer.dto';
import { SessionInfoDto } from '../common/dto/session-info.dto';
import { DefaultPaymentDto, PaymentOptionResponseDto } from './dto/payment-info.dto';
import { EmailPreferencesDto } from './dto/email-preferences.dto';
import { BrandType } from '../common/constants/brand.type';
import { CustomerDetailDto } from './dto/customer-details.dto';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { ServiceException } from '../common/exceptions/service.exception';
import { AccountModuleErrorCodes } from '../common/utils/error-util';
import { CartDto, PaymentMethod } from '../cart/dto';
import { PatchPaymentInfoDto } from './dto/payment/patch-payment-info.dto';

describe('AccountController tests', () => {

    let controller: AccountController;
    let memberService: MemberService;
    let cartService: CartService;
    let productService: ProductService;
    let configurationDto: ConfigurationDto;
    let emmaService: EmmaService;
    let membershipService: MembershipService;
    let expectedSortDirection: SortDirection;
    let retailStoreService: RetailStoreService;
    let headersDto: HeadersDto, session: SessionInfoDto, storeDetail: StoreDetailDto;

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        expectedSortDirection = <SortDirection> randomIntegerInRange(0, 2);
        headersDto = new HeadersDto();
        session = new SessionInfoDto();
        storeDetail = new StoreDetailDto();

        memberService = new MemberService(null, null);
        cartService = new CartService(null, null, null, null);
        productService = new ProductService(null, null, null, null);
        configurationDto = new ConfigurationDto(null);
        emmaService = new EmmaService(null);
        membershipService = new MembershipService(null, null);
        retailStoreService = new RetailStoreService(null, null, null);

        controller = new AccountController(
            memberService,
            cartService,
            productService,
            emmaService,
            membershipService,
            retailStoreService);
    });

    describe('and getWishList', () => {
        let expected: WishlistResponseDto;
        beforeEach(() => {
            expected = new WishlistResponseDto();
            expected.items = [new WishlistItemDto()];
            expected.page = randomIntegerInRange(1, 20);
            expected.pageSize = randomIntegerInRange(21, 25);
            // @ts-ignore
            memberService.getWishlist.mockResolvedValue(expected);
        });

        test('should resolve', async () => {
            expect.assertions(2);
            const wishlistResult = await controller.getWishlist(expected.page, expected.pageSize, expectedSortDirection, headersDto);

            expect(wishlistResult).toEqual(expected);
            expect(memberService.getWishlist).toBeCalledWith(expected.page, expected.pageSize, expectedSortDirection, headersDto);
        });
    });

    describe('and getWaitList', () => {
        let expected: WaitlistResponseDto;
        beforeEach(() => {
            expected = new WaitlistResponseDto();
            expected.items = [];

            [...Array(randomIntegerInRange(1, 6)).keys()].forEach((i) => {
                const waitlistItemDto = new WaitlistItemDto();
                waitlistItemDto.productId = i + randomIntegerInRange(1, (i + 1) * 3 + 100);
                waitlistItemDto.tagIdList = [...Array(randomIntegerInRange(5, 20)).keys()].map(e => e * 100);
                expected.items.push(waitlistItemDto);
            });
            expected.page = randomIntegerInRange(1, 20);
            expected.pageSize = randomIntegerInRange(21, 25);
            // @ts-ignore
            memberService.getWaitlist.mockResolvedValue(expected);

            productService.productFields = new ProductFieldsDto();
            // @ts-ignore
            productService.getProductsByStoreGroup.mockResolvedValue(expected.items.map(e => ({
                master_product_id: e.productId,
                component_count: randomIntegerInRange(10, 20),
                tag_id_list: e.tagIdList.concat([50, 30])
            })));
        });

        test('should resolve', async () => {
            expect.assertions(2);
            const wishlistResult = await controller.getWaitlist(expected.page, expected.pageSize, expectedSortDirection, headersDto, new StoreDetailDto());

            expect(wishlistResult).toEqual(expected);
            expect(memberService.getWaitlist).toBeCalledWith(expected.page, expected.pageSize, expectedSortDirection, headersDto);
        });
    });

    describe('and getProfile', () => {
        let mock;
        let emmaDto;
        let defaultPaymentDto;
        let expected: CustomerDto;

        beforeEach(() => {
            mock = jest.fn();
            emmaDto = {
                keys: { something: randomString() },
                vars: {}
            };

            defaultPaymentDto = new DefaultPaymentDto();
            defaultPaymentDto.isExpired = randomIntegerInRange(0, 2) === 1;

            expected = new CustomerDto();
            expected.defaultPayment = defaultPaymentDto;
            expected.emailPreferences = new EmailPreferencesDto();
            expected.emailPreferences.keys = emmaDto.keys;
            expected.emailPreferences.vars = emmaDto.vars;

            // @ts-ignore
            emmaService.getEmailPreferences.mockResolvedValue(emmaDto);

            // @ts-ignore
            memberService.getMemberProfile.mockResolvedValue(new CustomerDto());

            // @ts-ignore
            memberService.getDefaultPaymentInfo.mockResolvedValue(defaultPaymentDto);
        });

        describe('and email and payment are included', () => {
            test('customer should return', async () => {
                const brandTypes = [BrandType.FabKids, BrandType.JustFab, BrandType.SavageXFenty, BrandType.ShoeDazzle];
                const nonFableticsBrand = brandTypes[randomIntegerInRange(0, brandTypes.length)];

                const storeDetailDto = new StoreDetailDto();
                // @ts-ignore
                storeDetailDto.getBrandType.mockReturnValue(nonFableticsBrand);

                // @ts-ignore
                memberService.getOnSiteMembershipExperienceDetail.mockResolvedValue(new CustomerDetailDto());

                expect.assertions(2);

                const actual = await controller.getProfile(
                    true,
                    true,
                    storeDetailDto,
                    new SessionInfoDto(),
                    headersDto);

                expect(emmaService.getEmailPreferences).toBeCalled();
                expect(actual).toEqual(expected);
            });
        });
    });

    describe('and getDetails', () => {
        test('customer collection data should return', async () => {
            // @ts-ignore
            emmaService.getEmailPreferences.mockResolvedValue({
                keys: { something: randomString() },
                vars: {}
            });

            // @ts-ignore
            memberService.getCustomerDetail.mockResolvedValue([]);

            const names = [randomString(), randomString()];

            expect.assertions(2);

            const actual = await controller.getCustomerDetails(names, headersDto);

            expect(actual).toEqual([]);
            expect(memberService.getCustomerDetail).toBeCalledWith(names, headersDto);
        });
    });
    describe('removePsp', async () => {
        let getPaymentInfoSpy, getCartSpy, removePspSpy;

        beforeEach(() => {
            getPaymentInfoSpy = jest.spyOn(memberService, 'getPaymentInfo');
            getCartSpy = jest.spyOn(cartService, 'getCart');
            removePspSpy = jest.spyOn(memberService, 'removePsp');
        });

        test('Not found Exception when Psp id does not exist', async () => {
            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([]));
            try {
                const result = await controller.removePsp(1111, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(NotFoundException);
            }
        });

        test('Bad request Exception when Psp is Default', async () => {
            const pspId = 1111;
            const defaultPsp = new PaymentOptionResponseDto();
            defaultPsp.paymentServiceProviderId = pspId;
            defaultPsp.isDefault = true;

            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([defaultPsp]));

            try {
                const result = await controller.removePsp(pspId, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.PspDeleteDefaultValidationError);
            }

        });

        test('Bad Request Exception when Deleting Psp applied to Cart', async () => {
            const pspId = 999;
            const defaultPsp = new PaymentOptionResponseDto();
            defaultPsp.paymentServiceProviderId = pspId;
            defaultPsp.isDefault = false;
            const cartWithPsp: CartDto = new CartDto();
            cartWithPsp.paymentMethod = PaymentMethod.PSP;
            cartWithPsp.paymentServiceProviderId = pspId;

            getCartSpy.mockImplementation(() =>
                Promise.resolve(cartWithPsp)
            );

            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([defaultPsp]));

            try {
                const result = await controller.removePsp(pspId, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.PspDeleteCartValidationError);
            }
        });
    });

    describe('removeCreditCard', async () => {
        let getPaymentInfoSpy, getCartSpy, removeCreditCardSpy;

        beforeEach(() => {
            getPaymentInfoSpy = jest.spyOn(memberService, 'getPaymentInfo');
            getCartSpy = jest.spyOn(cartService, 'getCart');
            removeCreditCardSpy = jest.spyOn(memberService, 'removeCreditCard');
        });

        test('Not found Exception when Credit Card does not exist', async () => {
            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([]));
            try {
                const result = await controller.removeCreditCard(999, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(NotFoundException);
            }
        });

        test('Bad request Exception when Credit Card is Default', async () => {
            const creditCardId = 999;
            const defaultCreditCard = new PaymentOptionResponseDto();
            defaultCreditCard.creditCardId = creditCardId;
            defaultCreditCard.isDefault = true;

            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([defaultCreditCard]));

            try {
                const result = await controller.removeCreditCard(creditCardId, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.CreditCardDeleteDefaultValidationError);
            }

        });

        test('Bad Request Exception when Deleting Credit Card applied to Cart', async () => {
            const creditCardId = 999;
            const defaultCreditCard = new PaymentOptionResponseDto();
            defaultCreditCard.creditCardId = creditCardId;
            defaultCreditCard.isDefault = false;
            const cartWithCreditCard: CartDto = new CartDto();
            cartWithCreditCard.paymentMethod = PaymentMethod.CreditCard;
            cartWithCreditCard.creditCardId = creditCardId;

            getCartSpy.mockImplementation(() =>
                Promise.resolve(cartWithCreditCard)
            );

            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([defaultCreditCard]));

            try {
                await controller.removeCreditCard(creditCardId, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.CreditCardDeleteCartValidationError);
            }
        });
    });

    describe('updatePaymentPartial', async () => {
        let getPaymentInfoSpy, getCartSpy, paymentResponseInfoDto;
        const sessionCustomerId = 9999;
        const paymentId = 1111;

        beforeEach(() => {
            getPaymentInfoSpy = jest.spyOn(memberService, 'getPaymentInfo');
            getCartSpy = jest.spyOn(cartService, 'getCart');
        });

        test('Case type is creditcard ', async () => {
            const creditCardCustomerId = sessionCustomerId;
            const PatchPaymentInfo = new PatchPaymentInfoDto();
            expect(creditCardCustomerId).toBe(sessionCustomerId);

            try{
                paymentResponseInfoDto = await memberService.patchCreditCardPaymentInfo(paymentId, PatchPaymentInfo, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.CreditCardDeleteCartValidationError);
            }
        });

        test('Case type is psp', async () => {
            const pspCustomerId = sessionCustomerId;
            const PatchPaymentInfo = new PatchPaymentInfoDto();
            expect(pspCustomerId).toBe(sessionCustomerId);

            try{
                paymentResponseInfoDto = await memberService.patchPSPPaymentInfo(paymentId, PatchPaymentInfo, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(ServiceException);
                expect((ex as ServiceException).errorCode).toBe(AccountModuleErrorCodes.PspDeleteCartValidationError);
            }
        });

        test('Return PaymentInfo', async () => {
            getPaymentInfoSpy.mockImplementation(() => Promise.resolve([paymentId]));

            try {
                const result = await controller.removePsp(1111, storeDetail, session, headersDto);
            } catch (ex) {
                expect(ex).toBeInstanceOf(NotFoundException);
            }
        });

    });

    describe('and getRetailStores', () => {
        const retailStoresStub = [
            {
                address: {
                    zip: '91367',
                    latitude: 34.185399,
                    longitude: -118.604674,
                    distanceInMiles: 13.131860647532795
                },
                storeName: 'VILLAGE AT TOPANGA'
            },
            {
                address: {
                    zip: '32246',
                    latitude: 30.256574,
                    longitude: -81.524928,
                    distanceInMiles: 28.78463669080759
                },
                storeName: 'ST JOHNS TOWN CENTER'
            }
        ];

        test('from coordinates', async () => {
            const expected = [ retailStoresStub[0] ];

            // @ts-ignore
            retailStoreService.searchRetailStoresByCoordinates.mockResolvedValue(expected);

            const radius = 30;
            const point = { latitude: 34.0901, longitude: -118.406 };
            const zip = undefined;
            const country = undefined;

            const actual = await controller.getRetailStores(
                radius,
                point,
                zip,
                country,
                new StoreDetailDto(),
                new SessionInfoDto(),
                headersDto
            );

            expect(actual).toEqual(expected);
        });

        test('from zip code', async () => {
            const expected = [ retailStoresStub[1] ];

            // @ts-ignore
            retailStoreService.searchRetailStoresByZip.mockResolvedValue(expected);

            const radius = 30;
            const point = { latitude: undefined, longitude: undefined };
            const zip = '90210';
            const country = 'US';

            const actual = await controller.getRetailStores(
                radius,
                point,
                zip,
                country,
                new StoreDetailDto(),
                new SessionInfoDto(),
                headersDto
            );

            expect(actual).toEqual(expected);
        });

        test('from profile information', async () => {
            const expected = [ retailStoresStub[0] ];

            // @ts-ignore
            //memberService.getMemberProfile.mockResolvedValue({ latitude: 34.0901, longitude: -118.406 });

            // @ts-ignore
            retailStoreService.searchRetailStoresByProfile.mockResolvedValue(expected);

            const radius = 30;
            const point = { latitude: undefined, longitude: undefined };
            const zip = undefined;
            const country = undefined;

            const actual = await controller.getRetailStores(
                radius,
                point,
                zip,
                country,
                new StoreDetailDto(),
                new SessionInfoDto(),
                headersDto
            );

            //expect(memberService.getMemberProfile).toHaveBeenCalled();
            expect(actual).toEqual(expected);
        });
    });
});
