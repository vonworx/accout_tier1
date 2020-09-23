import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    ParseIntPipe,
    Query,
    HttpStatus,
    NotImplementedException,
    Body,
    Delete,
    HttpCode,
    InternalServerErrorException,
    BadRequestException,
    Req,
    ForbiddenException,
    NotFoundException,
    HttpException
} from '@nestjs/common';
import { MemberService } from './_services/member.service';
import { StoreDetail } from '../common/decorators/store-detail.decorator';
import { ApiResponse, ApiUseTags, ApiOperation, ApiImplicitParam, ApiImplicitQuery, ApiImplicitHeader } from '@nestjs/swagger';
import { StoreDetailDto } from '../common/dto/store-detail.dto';
import { SessionInfo } from '../common/decorators/session-info.decorator';
import { SessionInfoDto } from '../common/dto/session-info.dto';
import { AddressDto } from './dto/address.dto';
import { VerifyAddressRequestDto, VerifyAddressResponseDto } from './dto/verify-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressType } from './dto/address.interface';
import { CartAddressDto, CartPaymentDto, PaymentMethod, CartProductType } from '../cart/dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaymentInfoDto, PaymentResponseInfoDto, PaymentOptionResponseDto } from './dto/payment-info.dto';
import { WaitlistResponseDto, WaitlistItemDto } from './dto/waitlist-item.dto';
import { WishlistResponseDto, WishlistProductIdsResponseDto } from './dto/wishlist-item.dto';
import { OrdersResponseDto } from './dto/order.dto';
import { DefaultValuePipe } from '../common/pipes/default-value.pipe';
import { OrderDetailDto, OrderLineItemDto } from './dto/order-detail.dto';
import { OrderRmaDto, RmaItemType } from './dto/order-rma.dto';
import { ProductReviewDto, SubmitProductReviewDto, ReviewableProductDto, SubmitProductReviewResponseDto } from '../products/dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { EmailPreferencesDto } from './dto/email-preferences.dto';
import { HeadersInfo } from '../common/decorators/headers-info.decorator';
import { HeadersDto } from '../common/dto/headers-info.dto';
import { plainToClass } from 'class-transformer';
import { ProductRequestDto, ProductWishlistRequestDto, ProductSetRequestDto } from './dto/product-request.dto';
import { CartService, GetCartOptions } from '../cart/cart.service';
import { AdyenPaymentRequestDto } from './dto/payment/adyen-payment-request.dto';
import { AdyenPaymentResponseDto } from './dto/payment/adyen-payment-response.dto';
import { ProductService } from '../products/product.service';
import { ReviewImageResponseDto, ReviewImageUploadDto } from './dto/product-review.dto';
import { Request } from 'express';
import { ApiControllerTags } from '../common/swagger';
import { ParseBoolPipe } from '../common/pipes/parse-bool-pipe';
import { RequiredPipe } from '../common/pipes/required.pipe';
import { EmmaService } from '@techstyle/emma-sdk';
import { EmmaDto } from '@techstyle/emma-sdk/dist/dto/emma.dto';
import { CustomerDetailDto } from './dto/customer-details.dto';
import { ParseArrayPipe } from '../common/pipes/parse-array.pipe';
import { AdyenPaymentSessionRequestDto } from './dto/payment/adyen-payment-session-request.dto';
import { AdyenPaymentSessionResponseDto } from './dto/payment/adyen-payment-session-response.dto';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';
import { MembersActivePromoDto } from './dto/members-active-promo.dto';
import { EffectiveDate } from '../common/decorators/effective-date.decorator';
import { getLaterDate } from '../common/utils/helper-functions';
import { MembershipService } from './_services/membership.service';
import { MemberProfilesResponseDto } from './dto/member-profiles-response.dto';
import { RetailStoreService } from '../retailstore/retailstore-service';
import * as Geopoint from 'geopoint';
import { DEFAULT_RADIUS_IN_MILES } from '../retailstore/dto/retailstore-address.dto';
import { SortDirection } from '../common/dto/sort-field';
import { ParseSortDirectionPipe } from '../common/pipes/parse-sort-direction.pipe';
import { SuggestedProductResponseDto } from './dto/product-suggested.dto';
import { RetailStoreDto } from '../retailstore/dto/retailstore.dto';
import { BrandType } from '../common/constants/brand.type';
import { transformDateStringToDate } from '../common/utils';
import { ServiceException } from '../common/exceptions/service.exception';
import { AccountModuleErrorCodes } from '../common/utils/error-util';
import { CreditCardStatus, PspStatus } from './dto/membership/membership.dto';
import { PatchPaymentInfoDto } from './dto/payment/patch-payment-info.dto';

import { LocationDto, GeoPointDto } from './dto/location.dto';
import { ParseGeoPointPipe } from '../common/pipes/parse-geo-point.pipe';
import { ParseEmptyStringPipe } from '../common/pipes/parse-empty-string.pipe';

@ApiUseTags( ApiControllerTags.MemberAccount )
@Controller( 'accounts/me' )
export class AccountController {
    constructor ( private readonly memberService: MemberService, private readonly cartService: CartService, private readonly productService: ProductService,
        private readonly emmaService: EmmaService, private readonly membershipService: MembershipService, private readonly retailStoreService: RetailStoreService  ) {

    }

    @Get()
    @ApiOperation( { title: 'Get User Login Status', description: 'Returns status of user login/session', operationId: 'getUserLoginStatus' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'User has required authentication information and is logged in' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async isLoggedIn () {

    }

    @Get( 'profile' )
    @ApiImplicitQuery( { name: 'includeEmail', description: 'Email preferences included with profile', required: false, type: Boolean } )
    @ApiImplicitQuery( { name: 'defaultPayment', description: 'Customers defaultPayment method', required: false, type: Boolean } )
    @ApiOperation( { title: 'Get User Profile', description: 'Get the logged-in users profile info', operationId: 'getUserProfile' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Get the logged in users profile information', type: CustomerDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getProfile ( @Query( 'includeEmail', new ParseBoolPipe( false ) ) includeEmail: boolean,
        @Query( 'defaultPayment', new ParseBoolPipe( false ) ) defaultPayment: boolean, @StoreDetail() storeDetail: StoreDetailDto,
        @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<CustomerDto> {
        const profile: CustomerDto = await this.memberService.getMemberProfile(sessionInfo, headers);

        if (includeEmail) {
            try {
                const emmaDto = await this.emmaService.getEmailPreferences(profile.email, storeDetail.storeGroupId);
                profile.emailPreferences = this.toEmailPreferencesDto(emmaDto);
            } catch (err) {
                profile.emailPreferences = null;
            }
        }
        if (defaultPayment) {
            try {
                profile.defaultPayment = await this.memberService.getDefaultPaymentInfo(sessionInfo, headers);
            } catch (err) {
                profile.defaultPayment = undefined;
            }
        }

        try {
            if (!!profile.storePostalCode || (!!profile.latitude && !!profile.longitude)) {
                const userGeopoint = !!profile.latitude && !!profile.longitude ? new Geopoint(profile.latitude, profile.longitude) : undefined;
                const retailStores = await this.retailStoreService.getRetailStoresByStoreGroup(storeDetail);
                profile.retailStores = retailStores.filter( rs => {
                    const addr = rs.address;
                    if (!!profile.storePostalCode) {
                        return rs.address.zip === `${profile.storePostalCode}` ? true : false;
                    } else if (!!userGeopoint && !!addr.longitude && !!addr.latitude) {
                        const storeGeopoint = new Geopoint(addr.latitude, addr.longitude);
                        addr.distanceInMiles = storeGeopoint.distanceTo(userGeopoint);
                        addr.distanceInKilometers = Geopoint.milesToKilometers(addr.distanceInMiles);
                        return addr.distanceInMiles <= DEFAULT_RADIUS_IN_MILES;
                    }
                    return false;
                }).sort( ( a, b ) => (a.address.distanceInMiles > b.address.distanceInMiles) ? 1 : -1);
            }
        }  catch (err) {
            profile.retailStores = undefined;
        }

        return profile;
    }

    @Get( 'profiles' )
    @ApiOperation( { title: 'Get User Profiles', description: 'Get the logged-in users associated profiles.', operationId: 'getUserProfiles' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Get the logged in users profile information', type: MemberProfilesResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getProfiles ( @HeadersInfo() headers: HeadersDto ): Promise<MemberProfilesResponseDto> {
        const membership = await this.membershipService.getMembershipDetail(headers);
        const profile = await this.memberService.getMemberProfiles( membership.membershipId, headers );

        return profile;
    }

    @Post( 'profile' )
    @ApiOperation( { title: 'Update Profile', description: 'Updates the logged-in users profile info', operationId: 'updateUserProfile' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Profile was successfully updated', type: CustomerDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async updateProfile ( @Body() updateDto: UpdateProfileDto, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<CustomerDto> {
        await this.memberService.updateMemberDetail( updateDto, sessionInfo, headers );
        return this.memberService.getMemberProfile( sessionInfo, headers );
    }

    @Get( 'addresses' )
    @ApiOperation( { title: 'Get User Addresses', description: 'Get the logged-in users addresses', operationId: 'getAddresses' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns a collection of the users addresses', type: AddressDto, isArray: true } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getMyAdrresses ( @StoreDetail() storeDetail: StoreDetailDto, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<AddressDto[]> {
        return this.memberService.getMemberAddresses( sessionInfo, headers );
    }

    @Post( 'addresses' )
    @ApiOperation( { title: 'Add User Address', description: 'Updates the logged-in users address.', operationId: 'upsertAddress' } )
    @ApiImplicitQuery( { name: 'applyCartShipAddress', description: 'Flag to set new address as cart shipping address', required: false, type: Boolean, isArray: false } )
    @ApiImplicitQuery( { name: 'applyCartBillingAddress', description: 'Flag to set new address as cart billing address', required: false, type: Boolean, isArray: false } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Address has been created', type: AddressDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    @ApiResponse( { status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error setting default address after upsert.' } )
    async createAddress (
      @Body() address: CreateAddressDto,
      @SessionInfo() sessionInfo: SessionInfoDto,
      @HeadersInfo() headers: HeadersDto,
      @Query( 'applyCartShipAddress', new ParseBoolPipe( false ) ) applyCartShipAddress: boolean,
      @Query( 'applyCartBillingAddress', new ParseBoolPipe( false ) ) applyCartBillingAddress: boolean ): Promise<AddressDto> {

        const addressDto = await this.memberService.createMemberAddress( address, sessionInfo, headers );
        await this._setCartAddressOnUpsertAddress(applyCartBillingAddress, applyCartShipAddress, addressDto, sessionInfo, headers);
        return addressDto;
    }

    @Post( 'address/verify' )
    @ApiOperation( { title: 'Verify Address', description: 'Verifies an address against service provider', operationId: 'verifyAddress' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns a verified address', type: VerifyAddressResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async verifyaddress ( @Body() address: VerifyAddressRequestDto, @StoreDetail() storeDetail: StoreDetailDto, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<VerifyAddressResponseDto> {
        return this.memberService.verifyAddress( address, sessionInfo, headers );
    }

    @Post( 'addresses/:id' )
    @ApiOperation( { title: 'Update Address by ID', description: 'Update the logged-in users address info for the given address id', operationId: 'updateAddressById' } )
    @ApiImplicitParam( { name: 'id', description: 'The ID of the address to update', required: true, type: Number } )
    @ApiImplicitQuery( { name: 'applyCartShipAddress', description: 'Flag to set new address as cart shipping address', required: false, type: Boolean, isArray: false } )
    @ApiImplicitQuery( { name: 'applyCartBillingAddress', description: 'Flag to set new address as cart billing address', required: false, type: Boolean, isArray: false } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Address has been updated', type: AddressDto } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified address does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    @ApiResponse( { status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error setting default address after upsert.' } )
    async updateAddress ( @Body() address: AddressDto,
      @Query( 'applyCartShipAddress', new ParseBoolPipe( false ) ) applyCartShipAddress: boolean,
      @Query( 'applyCartBillingAddress', new ParseBoolPipe( false ) ) applyCartBillingAddress: boolean,
      @SessionInfo() sessionInfo: SessionInfoDto,
      @HeadersInfo() headers: HeadersDto ): Promise<AddressDto> {

        const addressDto = await this.memberService.updateMemberAddress( address, sessionInfo, headers );
        await this._setCartAddressOnUpsertAddress(applyCartBillingAddress, applyCartShipAddress, addressDto, sessionInfo, headers);
        return addressDto;
    }

    @Delete( 'addresses/:id' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Delete Address by ID', description: 'Removes the specified address', operationId: 'removeAddressById' } )
    @ApiImplicitParam( { name: 'id', description: 'The identifier for the address to be removed', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Address has been removed' } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified address does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async removeAddress ( @Param( 'id', new ParseIntPipe() ) id: number, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<boolean> {
        return this.memberService.removeMemberAddress( id, sessionInfo, headers );
    }

    @Get( 'wishlist' )
    @ApiOperation( { title: 'Get Wishlist', description: 'Returns the users wishlist', operationId: 'getWishlist' } )
    @ApiImplicitQuery( { name: 'page', description: 'The wishlist page to retrieve', required: true, type: Number } )
    @ApiImplicitQuery( { name: 'pageSize', description: 'The quantity of items to display per page on the wishlist', required: true, type: Number } )
    @ApiImplicitQuery( { name: 'sortDirection', description: 'choose the direction you want to sort off datetime_modified', enum: ['asc', 'desc'], required: false, type: SortDirection } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns a list of user wishlist items', type: WishlistResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getWishlist (
        @Query( 'page', new DefaultValuePipe( 1 ), new ParseIntPipe() ) page: number,
        @Query( 'pageSize', new DefaultValuePipe( 5 ), new ParseIntPipe() ) pageSize: number,
        @Query( 'sortDirection', new DefaultValuePipe( SortDirection.ASC ), new ParseSortDirectionPipe() ) sortDirection: SortDirection,
        @HeadersInfo() headers: HeadersDto ): Promise<WishlistResponseDto> {
        return this.memberService.getWishlist( page, pageSize, sortDirection, headers );
    }

    @Get( 'wishlist/ids' )
    @ApiOperation( { title: 'Get Wishlist product ids', description: 'Returns the users wishlist product ids', operationId: 'getWishlistProductIds' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns a list of user wishlist product ids array', type: WishlistProductIdsResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getWishlistProductIds (
        @HeadersInfo() headers: HeadersDto ): Promise<WishlistProductIdsResponseDto> {
        return this.memberService.getWishlistProductIds(headers);
    }

    @Post( 'wishlist' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Add Product to Wishlist', description: 'Add a product to the users wishlist', operationId: 'addProductToWishlist' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Product successfully added to wishlist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async addWishlistProduct ( @Body() product: ProductWishlistRequestDto, @HeadersInfo() headers: HeadersDto, @StoreDetail() storeDetail: StoreDetailDto ) {
        const lookupProduct = await this.productService.getProductByStoreGroup( storeDetail, product.productId, headers );

        if ( !!lookupProduct && lookupProduct.master_product_id === product.productId ) {
            const result = await this.memberService.addToWishlist( product.productId, headers );
        } else {
            throw new BadRequestException( `The product Id ${product.productId} is not a master product id or is invalid in the store group ${storeDetail.storeGroupId}` );
        }
    }

    @Delete( 'wishlist/:productId' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Delete from Wishlist by Product ID', description: 'Removes the specified item from the users wishlist', operationId: 'removeFromWishlistByProductId' } )
    @ApiImplicitParam( { name: 'productId', description: 'The product ID to remove from the waitlist', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Product has been removed form wishlist' } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified item does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async removeWishlistProduct ( @Param( 'productId' ) id: number, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const result = await this.memberService.removeFromWishlist( id, headers );
    }

    @Get( 'waitlist' )
    @ApiOperation( { title: 'Get Waitlist', description: 'Gets the users waitlist', operationId: 'getWaitlist' } )
    @ApiImplicitQuery( { name: 'page', description: 'The waitlist page to retrieve', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'pageSize', description: 'The quantity of items to display per page on the waitlist', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'sortDirection', description: 'choose the direction you want to sort off datetime_modified', enum: ['asc', 'desc'], required: false, type: SortDirection } )
    @ApiResponse( { status: HttpStatus.OK, description: 'The users waitlist', type: WaitlistResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getWaitlist (
        @Query( 'page', new DefaultValuePipe( 1 ), new ParseIntPipe() ) page: number,
        @Query( 'pageSize', new DefaultValuePipe( 5 ), new ParseIntPipe() ) pageSize: number,
        @Query( 'sortDirection', new DefaultValuePipe( SortDirection.ASC ), new ParseSortDirectionPipe() ) sortDirection: SortDirection,
        @HeadersInfo() headers: HeadersDto, @StoreDetail() storeDetail: StoreDetailDto ): Promise<WaitlistResponseDto> {
        const response = await this.memberService.getWaitlist( page, pageSize, sortDirection, headers );

        if ( !!response && !!response.items && !!response.items.length ) {
            // if there's no masterProductId assume this is a set and use the productId instead to lookup
            const prodIds = response.items.map( ( item ) => !item.masterProductId ? item.productId : item.masterProductId );
            const prods = await this.getProductsForESData( storeDetail, headers, prodIds );
            const bundleItemIds = [];
            for ( const item of response.items) {
                const masterProd = !item.masterProductId ? prods.find( (p: { master_product_id: number; }) => p.master_product_id === item.productId ) :
                    prods.find( (p: { master_product_id: number; }) => p.master_product_id === item.masterProductId );

                if ( masterProd ) {
                    item.componentCount = !!masterProd.component_count ? masterProd.component_count : 0;
                    item.tagIdList = !!masterProd.tag_id_list  ? masterProd.tag_id_list : [];
                    item.availableQuantityAnyProfile = !!masterProd.available_quantity_any_profile ? masterProd.available_quantity_any_profile : 0;
                    item.waitlistAllowed = masterProd.hasOwnProperty('wait_list_allowed') ? masterProd.wait_list_allowed : null;
                    if (masterProd.hasOwnProperty('product_type_id') && masterProd.product_type_id === CartProductType.ProductSet) {
                        bundleItemIds.push(item.id);
                    }
                }

                if ( !!masterProd && !!masterProd.product_id_object_list && Array.isArray( masterProd.product_id_object_list ) ) {
                    const prod = masterProd.product_id_object_list.find( (p: { product_id: number; }) => p.product_id === item.productId );
                    if ( !!prod ) {
                        item.availableQuantity = prod.available_quantity;
                        item.availableQuantityPreOrder = prod.available_quantity_preorder;
                        item.dateAvailablePreOrder = !!prod.date_available_preorder ? new Date( prod.date_available_preorder ) : null;
                        item.dateInventoryAvailable = !!prod.date_inventory_available ? new Date( prod.date_inventory_available ) : null;
                    }
                }
            }

            // Fetch bundle items
            if (!!bundleItemIds.length) {
                const allWaitlistComponentIds = await this.memberService.getWaitlistComponents(bundleItemIds, headers);
                const allComponentProdIds = [];
                const allComponentProdIdsObj = {};
                for (const key in allWaitlistComponentIds) {
                    const waitlistComponentIds = allWaitlistComponentIds[key];
                    if (!!waitlistComponentIds && !!waitlistComponentIds.length) {
                        const componentProdIds = waitlistComponentIds.map( (wlc: { hasOwnProperty: (arg0: string) => any; master_product_id: any; component_product_id: any; }) => wlc.hasOwnProperty('master_product_id') && !!wlc.master_product_id
                                                                        ? wlc.master_product_id : wlc.component_product_id );
                        allComponentProdIds.push(componentProdIds);
                        allComponentProdIdsObj[key] = componentProdIds;
                    }
                }
                //Get product info of component products
                const componentProds = await this.getProductsForESData( storeDetail, headers, [].concat( ...allComponentProdIds ) );
                for ( const item of response.items) {
                    if (allWaitlistComponentIds.hasOwnProperty(item.id)) {
                        const bundleComponentIds = allWaitlistComponentIds[item.id];
                        const masterProdIds = allComponentProdIdsObj[item.id];
                        item.bundleItems = this.extractWaitlistBundleItems(componentProds.filter( (prod: { master_product_id: any; }) => masterProdIds.includes(prod.master_product_id)), bundleComponentIds);
                    }
                }
            }

        }

        return response;
    }

    @Post( 'waitlist' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Add Product to Waitlist', description: 'Adds a specified product to the users waitlist.', operationId: 'addProductToWaitlist' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Product has been added to waitlist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async addWaitlistProduct ( @Body() product: ProductRequestDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto, @StoreDetail() storeDetail: StoreDetailDto ) {

        await this.memberService.addToWaitlist( product, session, headers );

    }

    @Post( 'waitlist/sets' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Add Product Set to Waitlist', description: 'Adds a Product set to the users waitlist.', operationId: 'addProductSetToWaitlist' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Product set has been added to waitlist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async addWaitlistSetProduct ( @Body() product: ProductSetRequestDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const result = await this.memberService.addSetToWaitlist( product, session, headers );
    }

    @Delete( 'waitlist/:id' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Delete from Waitlist by ID', description: 'Removes a specified product from the users waitlist.', operationId: 'removeFromWaitlistById' } )
    @ApiImplicitParam( { name: 'id', description: 'The waitlist item id to remove from the waitlist.', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Item has been remove from waitlist.' } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified item does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async removeWaitlistProduct ( @Param( 'id' ) id: number, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const result = await this.memberService.removeFromWaitlist( id, session, headers );
    }

    @Get( 'orders' )
    @ApiOperation( { title: 'Get User Orders', description: 'Gets the list of orders.', operationId: 'getUserOrders' } )
    @ApiImplicitQuery( { name: 'recordsPerPage', description: 'The number of records per page to retrieve', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'pageIndex', description: 'The order list page to retrieve.', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'order', description: 'The sorting order for the orderlist.', required: false, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns the list of orders', type: OrdersResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getOrders ( @Query( 'recordsPerPage', new DefaultValuePipe( 5 ), new ParseIntPipe() ) recordsPerPage: number,
        @Query( 'pageIndex', new DefaultValuePipe( 1 ), new ParseIntPipe() ) pageIndex: number,
        @Query( 'order', new DefaultValuePipe( 'DESC' ) ) order: string,
        @StoreDetail() storeDetail: StoreDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<OrdersResponseDto> {
        return this.memberService.getOrderHistory( pageIndex, recordsPerPage, order, storeDetail, session, headers );
    }

    @Get( 'orders/:id' )
    @ApiOperation( { title: 'Get Order Detail by ID', description: 'Gets the order detail.', operationId: 'getUserOrderDetailById' } )
    @ApiImplicitParam( { name: 'id', description: 'The order ID to retrieve', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns details of the specified order id', type: OrderDetailDto } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified order does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getOrderDetail ( @Param( 'id', new ParseIntPipe() ) orderId: number, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto, @StoreDetail() storeDetail: StoreDetailDto ): Promise<OrderDetailDto> {
        const orderDetail = await Promise.all( [ this.memberService.getOrderDetail( orderId, session, headers ), this.memberService.getReturnableProductsByOrderId( orderId, headers ) ] ).then( results => {
            const detail = results[ 0 ];

            if ( detail.customerId !== session.getCustomerId() ) {
                throw new ForbiddenException( 'This user is not allowed to view that order.' );
            }
            const returnable = results[ 1 ];
            returnable.products.forEach( rp => {
                const orderLine = detail.orderLines.find( line => line.orderLineId === rp.orderLineId );
                if ( !!orderLine ) {
                    orderLine.rmaId = rp.rmaId;
                    orderLine.tax = rp.tax;
                }
            } );
            return detail;
        } );

        await this.populateItemProps(orderDetail, headers, storeDetail);
        if (!!orderDetail.splitOrders && !!orderDetail.splitOrders.length) {
            await Promise.all(orderDetail.splitOrders.map(async (splitOrder) => {
                await this.populateItemProps(splitOrder, headers, storeDetail);
            }));
        }

        /*
        const rmaIds = orderDetail.orderLines.reduce((agg:number[], item:OrderLineItemDto) => { if(item.rmaId > 0 && agg.indexOf(item.rmaId) >= 0) { agg.push(item.rmaId); } return agg;}, new Array<number>());

        if(!!rmaIds.length) {
            const rmas = await Promise.all(rmaIds.map(rmaId => this.memberService.getOrderRma(orderId, rmaId, session, headers)));
        }
        */

        return orderDetail;
    }

    @Post( 'orders/:id/rmas' )
    @ApiOperation( { title: 'Create RMA', description: 'Creates a return for the specified order and items', operationId: 'createRma' } )
    @ApiImplicitParam( { name: 'id', description: 'The order ID to post RMA details to.', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns details of the newly created RMA', type: OrderRmaDto } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified order/order line does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async createRMA ( @Body() rmaDetails: OrderRmaDto, @Param( 'id', new ParseIntPipe() ) orderId: number, @HeadersInfo() headers: HeadersDto, @SessionInfo() session: SessionInfoDto ): Promise<any> {
        const rmaDetailsDto = plainToClass( OrderRmaDto, rmaDetails );
        const orderDetail = await this.memberService.getOrderDetail( rmaDetailsDto.orderId, session, headers );
        rmaDetailsDto.items.forEach( ( rmaDetail ) => {
            if ( rmaDetail.actionId === 0 ) {
                if ( rmaDetail.exchangeProductId !== 0 ) {
                    //Flatten order lines
                    const orderLines = orderDetail.orderLines.reduce( ( ols: OrderLineItemDto[], ol: OrderLineItemDto ) => {
                        ols.push( ol );
                        if ( !!ol.bundleItems ) {
                            ols = ols.concat( ol.bundleItems );
                        }
                        return ols;
                    }, new Array<OrderLineItemDto>() );
                    const orderLine = orderLines.find( ol => ol.orderLineId === rmaDetail.orderLineId );
                    if ( !!orderLine ) {
                        rmaDetail.actionId = orderLine.productId === rmaDetail.exchangeProductId ? RmaItemType.ReshipSameProd : RmaItemType.ChangeSizeColor;
                    } else {
                        throw new NotFoundException( 'Order line not found' );
                    }
                } else {
                    rmaDetail.actionId = RmaItemType.Refund; //default to refund if not exchanging
                }
            }
        } );

        return this.memberService.returnProduct( rmaDetailsDto, headers );
    }

    @Get( 'reviews' )
    @ApiOperation( { title: 'Get User Reviews', description: 'Get all of the reviews a user has created.', operationId: 'getUserReviews' } )
    @ApiImplicitQuery( { name: 'count', description: 'Number of reviews to retrieve', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'page', description: 'Page number of the results to return', required: false, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Collection of all of the reviews a user has created', isArray: true, type: ProductReviewDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getReviews ( @Query( 'count', new DefaultValuePipe( '6' ), new ParseIntPipe() ) count: number, @Query( 'page', new DefaultValuePipe( '1' ), new ParseIntPipe() ) page: number,
        @HeadersInfo() headers: HeadersDto ): Promise<ProductReviewDto[]> {
        return this.memberService.getCustomerProductReviews( count, page, headers );
    }

    @Get( 'reviews/products' )
    @ApiOperation( { title: 'Get Reviewable Products', description: 'Gets collection of all of the products a user can review', operationId: 'getUserReviewableProducts' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Collection of all of the reviews a user has created', isArray: true, type: ReviewableProductDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getReviewableProducts ( @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<ReviewableProductDto[]> {
        return this.memberService.getReviewableProducts( session, headers );
    }

    @Get( 'reviews/:id' )
    @ApiOperation( { title: 'Get User Review By Id', description: 'Gets the details for a specified review for a given user.', operationId: 'getUserReviewById' } )
    @ApiImplicitParam( { name: 'id', description: 'The ID of the review to retrieve details for', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details for a single review a user has created', isArray: true, type: ProductReviewDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getReview ( @Param( 'id', new ParseIntPipe() ) reviewId: number, @HeadersInfo() headers: HeadersDto ): Promise<ProductReviewDto[]> {
        return this.memberService.getCustomerProductReview( reviewId, headers );
    }

    @Post( 'products/:id/images' )
    @ApiOperation( { title: 'Upload Review image', description: 'Upload a product image', operationId: 'uploadReviewImage' } )
    @ApiImplicitParam( { name: 'id', description: 'The product ID for the review image to be uploaded.', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Upload an image', type: ReviewImageResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async uploadReviewImage ( @Req() req: Request, @Body() imageData: ReviewImageUploadDto, @Param( 'id', new ParseIntPipe() ) productId: number, @HeadersInfo() headers: HeadersDto ): Promise<ReviewImageResponseDto> {

        return this.memberService.uploadReviewImage( productId, imageData.base64DataUrl, headers );
    }

    @Post( 'reviews' )
    @ApiOperation( { title: 'Add User Product Review', description: 'Posts a new review for the user.', operationId: 'addUserProductReview' } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Review successfully submitted', type: SubmitProductReviewResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async submitReview (
        @Body() reviewDto: SubmitProductReviewDto,
        @StoreDetail() storeDetail: StoreDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<SubmitProductReviewResponseDto> {
        return this.memberService.submitProductReview( reviewDto, session, headers );
    }

    @Post( 'payments/ideal' )
    @ApiOperation( { title: 'Add User IDEAL Payment', description: 'Ideal Payments - Not Implemented.', operationId: 'addUserIdealPayment' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async saveIdealPayment ( @Body() paymentInfoDto: PaymentInfoDto, @SessionInfo() sessionInfo: SessionInfoDto, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentResponseInfoDto> {
        throw new NotImplementedException();
    }

    @Post( 'payments/sepa' )
    @ApiOperation( { title: 'Add User Sepa Payment', description: 'Sepa Payments - Not Implemented.', operationId: 'addUserSepaPayment' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async saveSepaPayment ( @Body() paymentInfoDto: PaymentInfoDto, @SessionInfo() sessionInfo: SessionInfoDto, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentResponseInfoDto> {
        throw new NotImplementedException();
    }

    @Post( 'payments/adyen' )
    @ApiOperation( { title: 'Add User Adyen Payment', description: 'Save Adyen Payment information.', operationId: 'addUserAdyenPayment' } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Saves the adyen payment information', type: AdyenPaymentResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async saveAdyenPayment ( @Body() paymentInfoDto: AdyenPaymentRequestDto, @HeadersInfo() headers: HeadersDto ): Promise<AdyenPaymentResponseDto> {
        return this.memberService.saveAdyenPayment( paymentInfoDto, headers );
    }

    @Post( 'payments/adyen/session' )
    @ApiOperation( { title: 'Initialize Adyen Payment Session', description: 'Initialize a payment session with Adyen to begin the credit card authorization and tokenization process', operationId: 'adyenInitPaymentSession' } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Payment session created', type: AdyenPaymentSessionResponseDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async initAdyenPaymentSession ( @Body() paymentSessionDto: AdyenPaymentSessionRequestDto, @HeadersInfo() headers: HeadersDto ): Promise<AdyenPaymentSessionResponseDto> {
        return this.memberService.getAdyenPaymentSession( paymentSessionDto, headers );
    }

    @Post( 'payments' )
    @ApiOperation( { title: 'Add User Tokenized Payment', description: 'Saves the users payment information.', operationId: 'addUserTokenizedPayment' } )
    @ApiResponse( { status: HttpStatus.CREATED, description: 'Saves the payment information for the logged in user', type: PaymentResponseInfoDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async savePaymentInfo ( @Body() paymentInfoDto: PaymentInfoDto, @SessionInfo() sessionInfo: SessionInfoDto, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentResponseInfoDto> {

        const paymentRes = await this.memberService.savePaymentInfo( paymentInfoDto, sessionInfo, storeDetail, headers );

        //If updated an existing credit card may need to potentially remove it from the cart
        if ( !!paymentInfoDto.creditCardId ) {
            const options: GetCartOptions = new GetCartOptions();
            const cart = await this.cartService.getCart( storeDetail, sessionInfo, headers, options );
            if ( cart.cartId > 0 && cart.creditCardId === paymentInfoDto.creditCardId ) {
                const cartPayment = new CartPaymentDto();
                cartPayment.paymentMethod = PaymentMethod.CreditCard;
                cartPayment.paymentId = paymentRes.creditCardId;
                await this.cartService.setCartPayment( cartPayment, sessionInfo, headers );
            }
        }

        return Promise.resolve( paymentRes );

    }

    @Get( 'payments' )
    @ApiOperation( { title: 'Get My User Payments', description: 'Returns the users payment information & details.', operationId: 'getUserPayments' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns all payment information for the logged in user', type: PaymentOptionResponseDto, isArray: true } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getPaymentInfo ( @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentOptionResponseDto[]> {
        return this.memberService.getPaymentInfo( sessionInfo, headers );
    }

        /* Ricardo : Patch payment */
        @Patch('payments/:paymentMethod/:paymentId')
        @ApiOperation( { title: 'Patch Payment Method', description: 'Patch as payment method information.', operationId: 'PatchPaymentInfoDto' } )
        @ApiImplicitParam( { name: 'paymentMethod', description: 'Set to either "creditcard" for credit card or "psp" for payment service provider patch', required: true, type: PaymentMethod } )
        @ApiImplicitParam( { name: 'paymentId', description: 'The creditcard id or psp id that needs to be patched', required: true, type: Number } )
        @ApiResponse( { status: HttpStatus.OK, description: 'Patch the psp or creditcard payment method information for the logged in user', type: PaymentResponseInfoDto } )
        @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
        async updatePaymentPartial(@Body() PatchPaymentInfo: PatchPaymentInfoDto, @Param('paymentMethod') paymentType: PaymentMethod, @Param( 'paymentId',
            new ParseIntPipe()) paymentId: number, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto): Promise<PaymentOptionResponseDto[]> {

            //Get payment methods
            switch (paymentType){
                case PaymentMethod.CreditCard :
                    //Do creditcard paymentMethod
                    const creditcard = (await this.memberService.getPaymentInfo(sessionInfo, headers)).find(item=> item.creditCardId === paymentId);                    
                    if (creditcard === null || creditcard === undefined)
                    {
                        throw new NotFoundException(`Unable to find credit card id ${paymentId}`);
                    } else {
                        if (PatchPaymentInfo.isDefault === null || PatchPaymentInfo.isDefault === undefined ){
                            PatchPaymentInfo.isDefault = false;
                        }
                        if (PatchPaymentInfo.addressId === null || PatchPaymentInfo.addressId === undefined){
                            PatchPaymentInfo.addressId = creditcard.addressId;
                        }
                        const sessionCustomerId: number = sessionInfo.getCustomerId();
                        const creditCardCustomerId: number = creditcard.customerId;
                        if (sessionCustomerId !== creditCardCustomerId){
                            const ex = new ServiceException(`CustomerId ${sessionCustomerId} does not match the credit card customer id.`, HttpStatus.BAD_REQUEST);
                            ex.errorCode = AccountModuleErrorCodes.CreditCardPatchPaymentMethodInvalidCustomerId;
                        } else {
                            await this.memberService.patchCreditCardPaymentInfo(paymentId, PatchPaymentInfo, sessionInfo, headers);
                        }
                    }

                    break;

                case PaymentMethod.PSP :
                    //Do PSP paymentMethod
                    const psp = (await this.memberService.getPaymentInfo(sessionInfo, headers)).find(item => item.paymentServiceProviderId === paymentId);        
                    if (psp === null || psp === undefined) {
                        throw new NotFoundException(`Unable to find psp id ${paymentId}`);
                    } else {
                        if (PatchPaymentInfo.isDefault === null || PatchPaymentInfo.isDefault === undefined) {
                            PatchPaymentInfo.isDefault = false;
                        }
                        if (PatchPaymentInfo.addressId === null || PatchPaymentInfo.addressId === undefined) {
                            PatchPaymentInfo.addressId = psp.addressId;
                        }
                        const sessionCustomerId: number = sessionInfo.getCustomerId();
                        const pspCustomerId: number = psp.customerId;

                        if (sessionCustomerId !== pspCustomerId) {
                            const ex = new ServiceException(`CustomerId ${sessionCustomerId} does not match the credit card customer id.`, HttpStatus.BAD_REQUEST);
                            ex.errorCode = AccountModuleErrorCodes.CreditCardPatchPaymentMethodInvalidCustomerId;
                        } else {
                            await this.memberService.patchPSPPaymentInfo(paymentId, PatchPaymentInfo, sessionInfo, headers);
                        }
                    }
                    break;

                default:
                    {
                        const ex = new ServiceException('Provided PaymentMethod is not valid', HttpStatus.BAD_REQUEST);
                        ex.errorCode = AccountModuleErrorCodes.PatchPaymentInvalidPaymentMethod;
                        throw ex;
                    }
            }

            //Return new list of payment methods
            return this.memberService.getPaymentInfo(sessionInfo, headers);
        }

    @Delete( 'payments/creditcard/:creditCardId' )
    @ApiOperation( { title: 'Delete Credit Card by ID', description: 'Removes the credit card by id', operationId: 'removeCreditCardById' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns all payment information for the logged in user', type: PaymentOptionResponseDto, isArray: true } )
    @ApiImplicitParam( { name: 'creditCardId', description: 'The identifier for the credit card to be removed', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Credit card has been removed' } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified credit card does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async removeCreditCard ( @Param( 'creditCardId', new ParseIntPipe() ) creditCardId: number, @StoreDetail() storeDetail: StoreDetailDto,
        @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentOptionResponseDto[]>{

        const options: GetCartOptions = new GetCartOptions();

        //1. Check if user has more than 1 payment method
        const paymentMethods = await this.memberService.getPaymentInfo(sessionInfo, headers);

        //2. Check if creditcard id is valid
        const creditCard = paymentMethods.find((item) => item.creditCardId === creditCardId);

        if (creditCard === null || creditCard === undefined)
        {
            throw new NotFoundException(`Unable to find creditCardId ${creditCardId} in users wallet.`);
        } else {
            if (creditCard.isDefault){
                const ex = new ServiceException('You cannot delete your default payment method.', HttpStatus.BAD_REQUEST);
                ex.errorCode = AccountModuleErrorCodes.CreditCardDeleteDefaultValidationError;
                throw ex;
            }
        }

        //3. Check if creditcard is used in cart
        const cart = await this.cartService.getCart(storeDetail, sessionInfo, headers, options);

        if (cart !== null || cart !== undefined ) {
            const _isUsedInCart = cart.creditCardId === creditCardId ? true : false;
            if (_isUsedInCart){
                const ex = new ServiceException(`User creditCardId ${creditCardId} is currently in an existing cart.`, HttpStatus.BAD_REQUEST);
                ex.errorCode = AccountModuleErrorCodes.CreditCardDeleteCartValidationError;
                throw ex;
            }
        }

        // 4. If everything cc is valid and more than 1 payment method, then process credit card for soft delete.
        const deletedCardInfo = await this.memberService.removeCreditCard(creditCardId, sessionInfo, headers);

        // 5. If returned code is '1559' then credit card deletion is successful, otherwise, throw a delete failed error
        if (deletedCardInfo.statuscode === CreditCardStatus.Inactive )
        {
            return this.memberService.getPaymentInfo(sessionInfo, headers);
        } else {
            const ex = new ServiceException(`User creditCardId ${creditCardId} deletion failed. Please try again.`, HttpStatus.BAD_REQUEST);
            ex.errorCode = AccountModuleErrorCodes.CreditCardDeleteFailedError;
            throw ex;
        }
    }
    /** Ricardo */
    @Delete( 'payments/psp/:pspId' )
    @ApiOperation( { title: 'Delete payment service provider by id', description: 'Removes payment service provider by id', operationId: 'removePspById' } )
    @ApiImplicitParam( { name: 'pspId', description: 'The id of the payment service provider to delete', required: true, type: Number } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Payment service provider deleted' } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The payment service provider does not exist' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async removePsp ( @Param( 'pspId', new ParseIntPipe() ) pspId: number, @StoreDetail() storeDetail: StoreDetailDto, @SessionInfo() sessionInfo: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<PaymentOptionResponseDto[]>{

        const options: GetCartOptions = new GetCartOptions();

        const pspInfo = await this.memberService.getPaymentInfo(sessionInfo, headers);
        const psp = pspInfo.find((item) => item.paymentServiceProviderId === pspId );

        if (psp === null || psp === undefined)
        {
            throw new NotFoundException(`Payment service provider id ${pspId} not found`);
        } else {
            if (psp.isDefault){
                const ex = new ServiceException('You cannot delete your default payment method.', HttpStatus.BAD_REQUEST);
                ex.errorCode = AccountModuleErrorCodes.PspDeleteDefaultValidationError;
                throw ex;
            }
        }

        //3. Check if psp is used in cart
        const cart = await this.cartService.getCart(storeDetail, sessionInfo, headers, options);
        if (cart !== null || cart !== undefined){
            const _isUsedInCart = cart.paymentServiceProviderId === pspId ? true : false;
            if (_isUsedInCart){
                const ex = new ServiceException(`Psp id ${pspId} is currently in an existing cart.`, HttpStatus.BAD_REQUEST);
                ex.errorCode = AccountModuleErrorCodes.PspDeleteCartValidationError;
                throw ex;
            }
        }

        // 4. If everything is valid and more than 1 payment method, then process credit card for soft delete.
        const deletedPspInfo = await this.memberService.removePsp(pspId, sessionInfo, headers);

        if (deletedPspInfo.statuscode === PspStatus.Inactive )
        {
            return this.memberService.getPaymentInfo(sessionInfo, headers);
        } else {
            const ex = new ServiceException(`PSP id ${pspId} deletion failed. Please try again.`, HttpStatus.BAD_REQUEST);
            ex.errorCode = AccountModuleErrorCodes.PspDeleteFailedError;
            throw ex;
        }
    }

    @Post( 'reset' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Resets the logged in users password.', description: 'Resets password for logged in user providing new password. ', operationId: 'resetUserPassword' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Password has been successfully reset' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED } )
    async resetUserPassword ( @Body() resetPwdRequest: ChangePasswordRequestDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const success = await this.memberService.updateUserPassword( resetPwdRequest.password, session, headers );

        if ( !success ) {
            throw new InternalServerErrorException( 'Unable to reset password' );
        }
    }

    @Get( 'preferences/email' )
    @ApiOperation( { title: 'Get User Email Preferences', description: 'Get the users email preferences', operationId: 'getUserEmailPreferences' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns the users email preferences', type: EmailPreferencesDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getUserPreferences ( @StoreDetail() store: StoreDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<EmmaDto> {
        const cust = await this.memberService.getMemberProfile( session, headers );
        return this.emmaService.getEmailPreferences( cust.email, store.storeGroupId );
    }

    @Post( 'preferences/email' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Update User Email Preferences', description: 'Saves the users email preferences', operationId: 'updateUserEmailPreferences' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Preferences successfully updated' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async updateUserPreferences ( @Body() emailPrefs: EmailPreferencesDto, @StoreDetail() store: StoreDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const cust = await this.memberService.getMemberProfile( session, headers );
        const emmaDto: EmmaDto = this.toEmmaDto( emailPrefs, cust.email );
        await this.emmaService.saveEmailPreferences( emmaDto, false, store.storeGroupId );
    }

    @Patch( 'preferences/email' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Partial Update User Email Preferences', description: 'Updates the users email preferences, but only for the specified properties', operationId: 'partialUpdateUserEmailPreferences' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Preferences successfully updated' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async updateUserPreferencesPartial ( @Body() emailPrefs: EmailPreferencesDto, @StoreDetail() store: StoreDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        const cust = await this.memberService.getMemberProfile( session, headers );
        const emmaDto: EmmaDto = this.toEmmaDto( emailPrefs, cust.email );
        await this.emmaService.saveEmailPreferences( emmaDto, true, store.storeGroupId );
    }

    @Post( 'detail' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Saves customer details', description: 'Saves customer details, name/value pair', operationId: 'setCustomerDetails' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Customer details successfully saved' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async setCustomerDetails ( @Body() customerDetail: CustomerDetailDto, @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ) {
        await this.memberService.saveCustomerDetail( customerDetail, headers );
    }

    @Get( 'detail' )
    @ApiOperation( { title: 'Gets customer detail', description: 'Gets customer detail by name', operationId: 'getCustomerDetails' } )
    @ApiImplicitQuery( { name: 'names', description: 'Customer detail names to return values for', required: true, type: String } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Customer details successfully returned', type: CustomerDetailDto, isArray: true } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getCustomerDetails ( @Query( 'names', new RequiredPipe(), new ParseArrayPipe( ',' ) ) names: string[], @HeadersInfo() headers: HeadersDto ): Promise<Array<CustomerDetailDto>> {
        return this.memberService.getCustomerDetail( names, headers );
    }

    @Get( 'promos' )
    @ApiOperation( { title: 'Get members Active Promos', description: 'Get members active promos for the current user', operationId: 'getActiveMemberPromos' } )
    @ApiImplicitQuery( { name: 'activeDate', description: 'The date of the period to be returned. Date format yyyy-mm-dd', required: false, type: String } )
    @ApiImplicitHeader( { name: 'x-tfg-effective-date', description: 'Query the API using a specific point in time. Overrides activeDate query param.', required: false } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details of the users active promos' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getActiveMemberPromos ( @Query( 'activeDate', new ParseDatePipe( new Date() ) ) activeDate: Date, @EffectiveDate() effectiveDate: Date , @HeadersInfo() headers: HeadersDto ): Promise<MembersActivePromoDto[]> {

        const adjustedDate = effectiveDate ? effectiveDate : activeDate;
        return this.memberService.getActiveMemberPromos( adjustedDate, headers );
    }

    @Get( 'products/suggested' )
    @ApiOperation( { title: 'Get suggested products for member', description: 'Get the suggested products from quiz results for the member.', operationId: 'getSuggestedProductsForMember' } )
    @ApiImplicitQuery( { name: 'page', description: 'The page number of reviews to return', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'size', description: 'The size number of reviews to return', required: false, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Returns a list of suggested products for the member.', type: SuggestedProductResponseDto, isArray: true } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getSuggestedMemberProducts (
        @HeadersInfo() headers: HeadersDto,
        @Query( 'page', new DefaultValuePipe( 1 ), new ParseIntPipe() ) page: number,
        @Query( 'size', new DefaultValuePipe( 0 ), new ParseIntPipe() ) size: number

        ): Promise<SuggestedProductResponseDto> {
        const searchParams = {
            page,
            size
        };
        const response = await this.productService.getSuggestedMemberProducts(headers, searchParams);

        return response;
    }

    @Get( 'retailstores' )
    @ApiImplicitQuery( { name: 'radius', description: 'Radius in miles. Defaults to 30', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'zip', description: 'Zip code to search. OPTIONAL. Defaults to user\'s shipping address', required: false, type: String } )
    @ApiImplicitQuery( { name: 'country', description: 'Country code to search. OPTIONAL. Defaults to user\'s shipping address', required: false, type: String } )
    @ApiImplicitQuery( { name: 'point', description: 'Comma separated latitude and longitude in the format of `point=<latitude>,<longitude>`. OPTIONAL.', required: false, type: Number } )
    @ApiOperation( { title: 'Get retail stores', description: 'Get retail stores within the supplied radius', operationId: 'getRetailStores' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'List of nearby retail stores', type: RetailStoreDto } )
    @ApiResponse( { status: HttpStatus.NOT_FOUND, description: 'The specified zip code is not found in database' } )
    @ApiResponse( { status: HttpStatus.BAD_REQUEST, description: 'Invalid zip or point values in query paramameters' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getRetailStores ( @Query( 'radius', new DefaultValuePipe( '30' ), new ParseIntPipe() ) radius: number,
        @Query( 'point', new ParseEmptyStringPipe(), new ParseGeoPointPipe() ) point: LocationDto,
        @Query( 'zip', new ParseEmptyStringPipe() ) zip: string,
        @Query( 'country', new ParseEmptyStringPipe() ) country: string,
        @StoreDetail() storeDetail: StoreDetailDto,
        @SessionInfo() sessionInfo: SessionInfoDto,
        @HeadersInfo() headers: HeadersDto ): Promise<Array<RetailStoreDto>> {

        // Search priority order: (1) by lat/long, (2) by zip/country, (3) by member profile address
        if (!!point.latitude && !!point.longitude) {
            return this.retailStoreService.searchRetailStoresByCoordinates(storeDetail, radius, point);

        } else if (!!zip || !!country) {
            return this.retailStoreService.searchRetailStoresByZip(sessionInfo, headers, storeDetail, radius, zip, country);

        } else {
            return this.retailStoreService.searchRetailStoresByProfile(sessionInfo, headers, storeDetail, radius);
        }
    }

    private toEmmaDto = ( emailPrefs: EmailPreferencesDto, email: string ): EmmaDto => {
        const emmaDto: EmmaDto = new EmmaDto();
        emmaDto.keys = emailPrefs.keys;
        emmaDto.vars = emailPrefs.vars;
        emmaDto.optOutStatus = emailPrefs.optOutStatus;
        emmaDto.lists = emailPrefs.lists;
        emmaDto.email = email;
        return emmaDto;
    }

    private toEmailPreferencesDto = ( emmaDto: EmmaDto ): EmailPreferencesDto => {
        const emailPrefs: EmailPreferencesDto = new EmailPreferencesDto();
        emailPrefs.keys = emmaDto.keys;
        emailPrefs.vars = emmaDto.vars;
        emailPrefs.optOutStatus = emmaDto.optOutStatus;
        emailPrefs.lists = emmaDto.lists;
        return emailPrefs;
    }

    private getProductsForESData = async ( storeDetail: StoreDetailDto, headers: HeadersDto, productIds: Array<number> ): Promise<Array<any>> => {
        const fields = [...this.productService.productFields.minimumFields as Array<string>];
        fields.push( 'component_count' );
        fields.push( 'available_quantity' );
        fields.push( 'available_quantity_preorder' );
        fields.push( 'date_available_preorder' );
        fields.push( 'date_inventory_available' );
        fields.push( 'product_id_object_list' );
        fields.push( 'tag_id_list' );
        fields.push( 'product_id' );
        fields.push( 'available_quantity_any_profile' );
        fields.push( 'product_type_id' );
        fields.push( 'default_product_category_id' );
        fields.push( 'default_product_category_label' );
        fields.push( 'color' );
        return this.productService.getProductsByStoreGroup( storeDetail, productIds, headers, [], fields );
    }

    private populateItemProps = async (orderDetail: OrderDetailDto, headers: HeadersDto, storeDetail: StoreDetailDto) => {
        let latestDateInventoryAvailable: Date;
        let latestDatePreorderExpires: Date;
        if ( !!orderDetail.orderLines && !!orderDetail.orderLines.length ) {
            const EMPTY_WAREHOUSE_IDS = [];
            const prods = await this.productService.getProductsByStoreGroup( storeDetail, orderDetail.orderLines.map( ( item ) => item.masterProductId || item.productId ), headers, EMPTY_WAREHOUSE_IDS );
            orderDetail.orderLines.forEach( ( item ) => {
                const prod = prods.find( (p: { master_product_id: number; }) => p.master_product_id === ( item.masterProductId || item.productId ) );
                if ( !!prod ) {
                    item.permalink = !!prod.permalink ? prod.permalink : '';
                    item.tagIds = !!prod.tag_id_list ? prod.tag_id_list : [];

                    const p = !!prod.product_id_object_list && !!prod.product_id_object_list.length ? prod.product_id_object_list.find( (pio: { product_id: number; }) => pio.product_id === item.productId) : undefined;
                    if (!!p) {
                        item.dateInventoryAvailablePreorder = p.date_inventory_available_preorder;
                        if (!!item.dateInventoryAvailablePreorder) {
                            latestDateInventoryAvailable = getLaterDate(latestDateInventoryAvailable, item.dateInventoryAvailablePreorder);
                        }
                    }
                    item.datePreorderExpires = prod.date_preorder_expires;
                    if (!!item.datePreorderExpires) {
                        latestDatePreorderExpires = getLaterDate(latestDatePreorderExpires, item.datePreorderExpires);
                    }
                }
            } );
            orderDetail.latestDateInventoryAvailablePreorder = latestDateInventoryAvailable || null;
            orderDetail.latestDatePreorderExpires = latestDatePreorderExpires || null;
        }
    }

    private async _setCartAddressOnUpsertAddress( applyCartBillingAddress: boolean, applyCartShipAddress: boolean, addressDto: AddressDto, sessionInfo: SessionInfoDto, headers: HeadersDto ) {
      try {
        let addressType : AddressType = AddressType.None;
        if ( applyCartBillingAddress ) {
          addressType = AddressType.Billing;
        }
        if ( applyCartShipAddress ) {
          addressType = (addressType === AddressType.Billing) ? AddressType.All : AddressType.Shipping;
        }

        if ( addressType !== AddressType.None ) {
          const defaultAddress : CartAddressDto = {
              addressId: addressDto.id,
              addressType
            };
          await this.cartService.setAddress(defaultAddress, sessionInfo, headers);
        }
      } catch (err) {
        const httpException = new HttpException( 'Error setting default address after upsert.', HttpStatus.INTERNAL_SERVER_ERROR );
        throw httpException;
      }
    }

    private extractWaitlistBundleItems = (prods: any[], componentIds: any[]) => {
        return prods.map( (prod) => {
            const wlItem = new WaitlistItemDto();
            const masterProductId = prod.master_product_id || prod.product_id;
            const componentIdObj = componentIds.find( val => !!val.master_product_id && val.master_product_id === masterProductId);
            const instanceProductId = componentIdObj.component_product_id;
            if ( prod.hasOwnProperty('product_id_object_list') ) {
                const instanceProduct = prod.product_id_object_list.find( (val: { product_id: any; }) => val.product_id === instanceProductId );
                if ( !!instanceProduct ) {
                    wlItem.productSize = instanceProduct.label_instance;
                    wlItem.productId = instanceProduct.product_id;
                }
            }
            wlItem.productCategoryId = prod.default_product_category_id;
            wlItem.productCategoryLabel = prod.default_product_category_label;
            wlItem.color = prod.color;
            wlItem.productLabel = prod.label;
            wlItem.masterProductId = masterProductId;
            return wlItem;
        });
    }
}
