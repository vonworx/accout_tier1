import { Controller, Get, HttpStatus, Body, Post, Delete, BadRequestException, ValidationPipe, HttpCode, ParseIntPipe, Query, Param } from '@nestjs/common';
import { ApiResponse, ApiUseTags, ApiOperation, ApiImplicitQuery, ApiImplicitParam } from '@nestjs/swagger';
import { MembershipDto, MembershipPeriodDto, MembershipLoyaltyDto, LoyaltyHistoryDto, MembershipSkipResultDto, SkipMembershipPeriodDto, TokenHistoryDto } from './dto/membership/membership.dto';
import { MembershipService } from './_services/membership.service';
import { SessionInfoDto } from '../common/dto/session-info.dto';
import { HeadersInfo } from '../common/decorators/headers-info.decorator';
import { HeadersDto } from '../common/dto/headers-info.dto';
import { StoreDetailDto } from '../common/dto/store-detail.dto';
import { StoreDetail } from '../common/decorators/store-detail.decorator';
import { SessionInfo } from '../common/decorators/session-info.decorator';
import { MemberStatusRequestDto, MemberPromoRequestDto } from './dto/membership';
import { ValidationException } from '../common/exceptions/validation.exception';
import { validate } from 'class-validator';
import { ApiControllerTags } from '../common/swagger';
import { DefaultValuePipe } from '../common/pipes/default-value.pipe';
import { ParseBoolPipe } from '../common/pipes/parse-bool-pipe';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';
import { plainToClass } from 'class-transformer';
import { EffectiveDate } from '../common/decorators/effective-date.decorator';
import { ServiceExceptionResponse } from '../common/exceptions/service.exception';
import { CartService } from '../cart/cart.service';
import { CartDto } from '../cart/dto';
import { SortDirection } from '../common/dto/sort-field';
import { ParseSortDirectionPipe } from '../common/pipes/parse-sort-direction.pipe';
import { MemberService } from './_services/member.service';
import { BrandType } from '../common/constants/brand.type';
import { CustomerNmpDetailsDto } from './dto/customer-details.dto';

@ApiUseTags( ApiControllerTags.MemberAccount )
@Controller( 'accounts/me' )
export class MembershipController {

    constructor(
        private readonly membershipService: MembershipService,
        private readonly cartService: CartService,
        private readonly memberService: MemberService) {
    }

    @Get( 'membership' )
    @ApiImplicitQuery( { name: 'includePeriod', description: 'Membership period included with membership details', required: false, type: Boolean } )
    @ApiOperation( { title: 'Get Membership', description: 'Get Membership details for the current user', operationId: 'getMembership' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details of the users membership', type: MembershipDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getMembership ( @Query( 'includePeriod', new ParseBoolPipe( false ) ) includePeriod: boolean, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ): Promise<MembershipDto> {
        let period;
        if ( includePeriod ) {
            period = await this.membershipService.getMembershipPeriod( headers );
        }

        const onSiteMembershipExperience = storeDetail.getBrandType() === BrandType.Fabletics
            ? (await this.memberService.getOnSiteMembershipExperienceDetail(headers)).datetimeAdded
            : undefined;

        let nmpRelatedCustomerDetails = new CustomerNmpDetailsDto();
        if ( storeDetail.getBrandType() === BrandType.Fabletics){
            nmpRelatedCustomerDetails = await this.memberService.getMemberNmpDetails(headers);
        }

        return Promise.all( [ this.membershipService.getMembershipDetail( headers ), this.membershipService.getMemberPersona( headers ) ] ).then( results => {
            const membership = results[ 0 ];
            membership.persona = results[ 1 ].personaName;
            membership.personaTagId = results[1].personaTagId;
            membership.period = period;
            membership.onSiteMembershipExperience = onSiteMembershipExperience;
            membership.mobileAppAccessNotPermitted = nmpRelatedCustomerDetails.mobileAppAccessNotPermitted;
            membership.nmpTestGroup = nmpRelatedCustomerDetails.nmpTestGroup;
            return membership;
        });
    }

    @Get( 'tokens' )
    @ApiOperation( { title: 'Get Member Tokens', description: 'Get token info for the current user.', operationId: 'getMembershipTokenDetails' } )
    @ApiImplicitQuery( { name: 'page', description: 'The current page of the paginated results to fetch. Default value is 1.', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'pageSize', description: 'The number of results to return for the current page being fetched. Default value is 5.', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'sortDirection', description: 'Choose the direction you want to sort off of for datetime_added.', enum: ['asc', 'desc'], required: false, type: SortDirection } )
    @ApiResponse( { status: HttpStatus.OK, description: 'History of the users tokens for the past 12 months.', type: TokenHistoryDto} )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getMembershipTokens (
        @Query( 'page', new DefaultValuePipe( '1' ), new ParseIntPipe() ) page: number,
        @Query( 'pageSize', new DefaultValuePipe( '5' ), new ParseIntPipe() ) pageSize: number,
        @Query( 'sortDirection', new DefaultValuePipe( SortDirection.ASC ), new ParseSortDirectionPipe() ) sortDirection: SortDirection,
        @HeadersInfo() headers: HeadersDto ): Promise<TokenHistoryDto> {

        return this.membershipService.getMembershipTokens( headers, page, pageSize, sortDirection );
    }

    @Post( 'membership/status' )
    @ApiOperation( { title: 'Update Membership Status', description: 'Update the membership status for the current user', operationId: 'updateMembershipStatus' } )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Membership Status was successfully changed' } )
    @ApiResponse( { status: HttpStatus.BAD_REQUEST, description: 'Invalid or missing request parameters', type: ValidationException } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    @ApiResponse( { status: HttpStatus.BAD_REQUEST, type: ServiceExceptionResponse, description: 'Invalid membership status change (errorCode=20002)' } )
    // tslint:disable-next-line:max-line-length
    async updateUserMembership ( @Body( new ValidationPipe( { transform: true, validationError: { target: false } } ) ) statusRequest: MemberStatusRequestDto, @SessionInfo() session: SessionInfoDto, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ) {

        const errors = await validate( statusRequest, { validationError: { target: false } } );

        if ( statusRequest.status && statusRequest.status.toUpperCase() === 'CANCEL' ) {
            return this.membershipService.cancelMembership( statusRequest, headers );
        } else {
            throw new BadRequestException();
        }

    }

    @Post( 'membership/promo' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Apply Promo', description: 'Assign or apply the promo to a member', operationId: 'applyPromo' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Promo was successfully applied to member' } )
    async applyMemberPromo ( @Body() memberPromo: MemberPromoRequestDto, @HeadersInfo() headers: HeadersDto ) {
        return this.membershipService.addPromo( memberPromo, headers );
    }

    @Delete( 'membership/promo/:promoCode' )
    @ApiOperation( { title: 'Delete Promo', description: 'Removes a membership promo code. This is only used for debugging', operationId: 'deleteMemberPromo' } )
    @ApiImplicitParam( { name: 'promoCode', description: 'The promotional code to remove', required: true, type: 'String' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async deleteMemberPromo (  @Param( 'promoCode') promoCode: string, @HeadersInfo() headers: HeadersDto, @SessionInfo() session: SessionInfoDto,  @StoreDetail() storeDetail: StoreDetailDto ): Promise<CartDto> {
        await this.membershipService.deleteMembershipPromo( promoCode, headers );
        const cart = await this.cartService.getCart( storeDetail, session, headers);
        return cart;
    }

    @Get( 'membership/period' )
    @ApiOperation( { title: 'Get Membership Period',
        description: 'Get Membership Period details for the current user.  Note that membershipBillingId is returned instead of membershipPeriodId for membership types that use tokens.',
        operationId: 'getMembershipPeriod' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details of the users membership period', type: MembershipPeriodDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getMembershipPeriod ( @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto, @EffectiveDate() effectiveDate: Date): Promise<MembershipPeriodDto> {
        return this.membershipService.getMembershipPeriod( headers, effectiveDate );
    }

    @Post( 'membership/period/skip' )
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Skip Membership Period', description: 'Skips period for user', operationId: 'skipMembershipPeriod' } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async skipMembershipPeriod ( @Body() skipPeriod: SkipMembershipPeriodDto, @HeadersInfo() headers: HeadersDto ): Promise<boolean> {

        return this.membershipService.skipMembershipPeriod( plainToClass(SkipMembershipPeriodDto, skipPeriod), headers );
    }

    @Get( 'membership/period/status/:date' )
    @ApiOperation( { title: 'Get Membership Period by date', description: 'Get Membership Period details for the current user by date', operationId: 'getMembershipPeriodStatus' } )
    @ApiImplicitParam( { name: 'date', description: 'The date of the period to be retured. Date format yyyy-mm-dd', required: true, type: String } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details of the users membership period', type: MembershipSkipResultDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getMembershipPeriodStatus ( @Param( 'date', new ParseDatePipe( new Date() ) ) date: Date, @HeadersInfo() headers: HeadersDto ): Promise<MembershipSkipResultDto> {
        return this.membershipService.getMembershipSkipPeriod( date, headers );
    }

    @Get( 'loyalty/details' )
    @ApiOperation( { title: 'Get Members Loyalty Details', description: 'Get member loyalty details for the current user', operationId: 'getLoyaltyDetails' } )
    @ApiResponse( { status: HttpStatus.OK, description: 'Details of the users loyalty points', type: MembershipLoyaltyDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getLoyaltyDetails ( @SessionInfo() session: SessionInfoDto, @HeadersInfo() headers: HeadersDto ): Promise<MembershipLoyaltyDto> {

        return this.membershipService.getLoyaltyDetails( session, headers );
    }

    @Get( 'loyalty/history' )
    @ApiOperation( { title: 'Get Members Loyalty History', description: 'Get paginated member loyalty history detail results. Ordered by date desc.', operationId: 'getLoyaltyHistory' } )
    @ApiImplicitQuery( { name: 'page', description: 'The current page of the paginated results to fetch. Default value is 1.', required: false, type: Number } )
    @ApiImplicitQuery( { name: 'count', description: 'The number of results to return for the current page being fetched. Default value is 5.', required: false, type: Number } )
    @ApiResponse( { status: HttpStatus.OK, description: 'History of the users loyalty points transactions.', type: LoyaltyHistoryDto } )
    @ApiResponse( { status: HttpStatus.UNAUTHORIZED, description: 'User is not authenticated and needs to login' } )
    async getLoyaltyHistory (
        @Query( 'page', new DefaultValuePipe( '1' ), new ParseIntPipe() ) page: number,
        @Query( 'count', new DefaultValuePipe( '5' ), new ParseIntPipe() ) count: number,
        @SessionInfo() session: SessionInfoDto,
        @HeadersInfo() headers: HeadersDto ): Promise<LoyaltyHistoryDto> {

        return this.membershipService.getLoyaltyHistory( session, headers, page, count );
    }
}
