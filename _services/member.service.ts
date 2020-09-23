import { Inject, HttpStatus, BadRequestException, Injectable } from '@nestjs/common';
import { RpcService } from '../../common/rpc.service';
import { Logger } from '../../common/logging/log.service';
import { AddressDto } from '../dto/address.dto';
import { VerifyAddressRequestDto, VerifyAddressResponseDto } from '../dto/verify-address.dto';
import { StoreDetailDto } from '../../common/dto/store-detail.dto';
import { SessionInfoDto } from '../../common/dto/session-info.dto';
import { CustomerDto, CustomerSignupDto } from '../dto/customer.dto';
import { plainToClass } from 'class-transformer';
import { CreateAddressDto } from '../dto/create-address.dto';
import { IAddress, AddressType } from '../dto/address.interface';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { PaymentInfoDto, PaymentResponseInfoDto, PaymentOptionResponseDto, PSPPaymentResponseInfoDto, DefaultPaymentDto } from '../dto/payment-info.dto';
import { WishlistResponseDto, WishlistItemDto, WishlistProductIdsResponseDto } from '../dto/wishlist-item.dto';
import { WaitlistResponseDto, WaitlistItemDto } from '../dto/waitlist-item.dto';
import { OrdersResponseDto, OrderHistoryDto } from '../dto/order.dto';
import { ProductReviewDto, SubmitProductReviewDto, ReviewableProductDto } from '../../products/dto/product-review.dto';
import { HeadersDto } from '../../common/dto/headers-info.dto';
import { OrderRmaDto, ReturnableProductsDto, ReturnProductFaultDto, ReturnProductSuccessDto } from '../dto/order-rma.dto';
import { ProductRequestDto, WaitlistType, ProductSetRequestDto } from '../dto/product-request.dto';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { AdyenPaymentRequestDto, AdyenPaymentSessionRequestDto, AdyenPaymentSessionResponseDto } from '../dto';
import { ServiceException } from '../../common/exceptions/service.exception';
import { AccountModuleErrorCodes } from '../../common/utils/error-util';
import { SubmitProductReviewResponseDto } from '../../products/dto';
import { ReviewImageResponseDto } from '../dto/product-review.dto';
import { ConfigurationDto } from '../../common/configuration/dto/configuration.dto';
import { addDaysToDate } from '../../common/utils';
import { CustomerDetailDto, CustomerNmpDetailsDto } from '../dto/customer-details.dto';
import { AddContactResponseDto } from '../../common/dto/contact.dto';
import { MembersActivePromoDto } from '../dto/members-active-promo.dto';
import { StringUtils } from '../../common/utils/string-utils';
import { MemberProfilesResponseDto } from '../dto/member-profiles-response.dto';
import { CCPARequestDto, CCPAResponseDto } from '../dto/ccpa-request.dto';
import { SortDirection } from '../../common/dto/sort-field';
import { DeletedCreditCardInfo } from '../dto/payment/deleted-creditcard-info';
import { DeletedPspInfo } from '../dto/payment/deleted-psp-info';
import { PatchPaymentInfoDto } from '../dto/payment/patch-payment-info.dto';
import { LocationDto } from '../dto/location.dto';
import { addressChangePermissionDenied } from '../resultHandlers/address-change';

export class MemberSaveResult {
    ok: boolean;
    result?: any;
    error?: any;
}

@Injectable()
export class MemberService extends RpcService {

    constructor ( @Inject( Logger.getToken() ) readonly logger: Logger, configurationDto: ConfigurationDto ) {
        super( configurationDto.bentoApiOptions );
    }

    onModuleInit () {
        super.onModuleInit();
        this.errorHandlers['members.removeAddress'] = addressChangePermissionDenied;
        this.errorHandlers['members.saveAddress'] = addressChangePermissionDenied;
        this.errorHandlers[ 'members.customerSignup' ] = ( rpcResult ) => {
            if ( rpcResult && rpcResult.error instanceof Array && rpcResult.error.length > 0 ) {
                const errors = rpcResult.error;
                const code = errors[ 0 ].code;
                const errorMessage = errors[ 0 ].message + ' ' + errors[ 0 ].data;
                const exception = new ServiceException( errorMessage, HttpStatus.BAD_REQUEST );
                exception.errorData = errors;

                if ( code === -32606 ) {
                    exception.errorCode = <number> AccountModuleErrorCodes.SignUpValidationError;
                } else {
                    exception.errorCode = <number> AccountModuleErrorCodes.General;
                }

                return exception;
            }

            return undefined;
        };
        this.errorHandlers[ 'members.saveProspectiveCustomer' ] = ( rpcResult ) => {
            if ( rpcResult && rpcResult.error instanceof Array && rpcResult.error.length > 0 ) {
                const errorCode = rpcResult.error[ 0 ].code;
                console.log( errorCode );
                //Error Code is existing email, rewrite the response
                if ( errorCode === 32055 ) {
                    delete rpcResult[ 'error' ];
                    rpcResult.result = { email_exists: true };
                }
            }
            return undefined;
        };
    }

    async validateUser ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<boolean> {

        if ( sessionInfo.customer &&
            sessionInfo.customer.length &&
            sessionInfo.customerAuth &&
            sessionInfo.customerAuth.length ) {
            const params = {
                customer: sessionInfo.customer,
                auth: sessionInfo.customerAuth,
                session: sessionInfo.session
            };

            return this.rpc( 'members.isLoggedIn', params, headers ).then( rpcResult => {
                if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 && StringUtils.toLowerCaseKeys( rpcResult.result[ 0 ] ).logged_in !== undefined ) {
                    return <boolean> StringUtils.toLowerCaseKeys( rpcResult.result[ 0 ] ).logged_in;
                } else {
                    throw this.getBadResultException( 'members.isLoggedIn', rpcResult );
                }
            } );
        } else {
            return Promise.resolve( false );
        }
    }

    async getMemberAddresses ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<AddressDto[]> {
        const params = {
            customer: sessionInfo.customer
        };

        return this.rpc( 'members.getAddress', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length === 1 && rpcResult.result[ 0 ].length >= 0 ) {
                const addresses: AddressDto[] = rpcResult.result[ 0 ].map( ( addr: object ) => plainToClass( AddressDto, addr ) );
                return addresses;
            } else {
                throw this.getBadResultException( 'members.getAddress', rpcResult );
            }
        } );
    }

    async createMemberAddress ( address: CreateAddressDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<AddressDto> {

        const params = this.getAddressParams( address );
        params[ 'customer' ] = sessionInfo.customer;
        headers.session = sessionInfo.session;
        headers.customer = sessionInfo.customer;

        return this._saveAddress( params, headers );
    }

    async verifyAddress ( address: VerifyAddressRequestDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<VerifyAddressResponseDto> {

        const params = {
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country_code: address.countryCode,
        };
        headers.session = sessionInfo.session;
        headers.customer = sessionInfo.customer;

        return this._verifyAddress( params, headers );
    }

    getAddressParams ( address: IAddress ): object {
        const params = {
            address_type: AddressType.Shipping,
            firstname: address.firstName,
            lastname: address.lastName,
            company: address.company !== undefined && address.company !== null ? address.company : '',
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country_code: address.countryCode,
            phone: address.phone,
            is_default: address.isDefault
        };

        if ( !!( <any> address ).id ) {
            params[ 'address_id' ] = ( <any> address ).id;
        }
        return params;
    }

    private async _saveAddress ( params: object, headers: HeadersDto ): Promise<AddressDto> {
        return this.rpc( 'members.saveAddress', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.address_id ) {
                const addr = rpcResult.result;

                const address: AddressDto = new AddressDto();
                address.id = addr.address_id;
                address.address1 = addr.address1;
                address.zip = addr.zip;
                address.phone = addr.phone;
                address.state = addr.state;
                address.firstName = addr.firstname;
                address.email = addr.email;
                address.company = addr.company;
                address.city = addr.city;
                address.lastName = addr.lastname;
                address.validated = addr.is_validated;
                address.address2 = addr.address2;
                address.countryCode = addr.country_code;

                return address;
            } else {
                throw this.getBadResultException( 'members.saveAddress', rpcResult );
            }
        } );
    }

    private async _verifyAddress ( params: object, headers: HeadersDto ): Promise<VerifyAddressResponseDto> {
        return this.rpc( 'members.verifyAddress', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && 'addresses' in rpcResult.result) {
                const vaddr = rpcResult.result;
                console.log( vaddr.addresses[ 0 ] );
                const address: VerifyAddressResponseDto = new VerifyAddressResponseDto();
                address.address1 = vaddr.addresses[ 0 ].ADDRESS;
                address.address2 = vaddr.addresses[ 0 ].ADDRESS2;
                address.city = vaddr.addresses[ 0 ].CITY;
                address.state = vaddr.addresses[ 0 ].STATE;
                address.zip = vaddr.addresses[ 0 ].ZIP;
                address.zipExt = vaddr.addresses[ 0 ].ZIPEXT;
                address.countryCode = vaddr.addresses[ 0 ].COUNTRY_CODE;
                address.resultCodes = vaddr.addresses[ 0 ].RESULT_CODES.split( ',' );
                address.exactMatch = vaddr.exact_match;
                address.errorDesc = vaddr.error_desc;
                address.errorCode = vaddr.error_code;

                return address;
            } else {
                throw this.getBadResultException( 'members.verifyAddress', rpcResult );
            }
        } );
    }

    async updateMemberAddress ( address: AddressDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<AddressDto> {

        const params = this.getAddressParams( address );
        params[ 'customer' ] = sessionInfo.customer;
        headers.customer = sessionInfo.customer;
        headers.session = sessionInfo.session;

        return this._saveAddress( params, headers );
    }

    async removeMemberAddress ( addressId: number, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<boolean> {

        const params = {
            customer: sessionInfo.customer,
            address_id: addressId,
            address_type: 'shipping'
        };

        return this.rpc( 'members.removeAddress', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.success ) {
                return true;
            } else {
                throw this.getBadResultException( 'members.removeAddress', rpcResult );
            }
        } );

    }
    async getMemberProfile ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<CustomerDto> {

        return Promise.all(
            [ this.getMemberDetails( sessionInfo, headers ),
            this.getMemberAttributes( sessionInfo, headers )
            ] ).then( results => {
                const customer = <CustomerDto> results[ 0 ];
                const attributes = <any> results[ 1 ];

                customer.profile = {};

                if ( attributes.persona ) {
                    customer.persona = attributes.persona;
                    delete attributes[ 'persona' ];
                }

                if ( attributes.membership_profile ) {
                    customer.profile = attributes.membership_profile;
                }

                if ( attributes.option_signatures ) {
                    customer.optionSignatures = attributes.option_signatures;
                }

                return customer;
            } );
    }

    public getMemberProfiles = async ( membershipId: number, headers: HeadersDto ): Promise<MemberProfilesResponseDto> => {
        const params = {
            membership_id: membershipId
        };

        return this.rpc( 'members.getMemberProfiles', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                const memberProfileResponse: MemberProfilesResponseDto = MemberProfilesResponseDto.getInstance(rpcResult.result);
                return memberProfileResponse;
            } else {
                throw this.getBadResultException( 'members.getMemberProfiles', rpcResult );
            }
        } );
    }

    public async getCoordinatesByZipCode( sessionInfo: SessionInfoDto, headers: HeadersDto, zip: string, country: string ): Promise<LocationDto> {
        const params = {
            customer: sessionInfo.customer,
            zip,
            country
        };

        return this.rpc('members.getCoordinatesByZipCode', params, headers).then(rpcResult => {
            if (rpcResult && rpcResult.result) {
                return rpcResult.result;
            } else {
                throw this.getBadResultException('members.getCoordinatesByZipCode', rpcResult);
            }
        });
    }

    public async getMemberDetails ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<CustomerDto> {
        const params = {
            customer: sessionInfo.customer
        };

        return this.rpc( 'members.getDetails', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && ( rpcResult.result.customer_id > 0 || rpcResult.result.CUSTOMER_ID > 0 ) ) {
                const customer: CustomerDto = CustomerDto.getInstance( <object> rpcResult.result );
                return customer;
            } else {
                throw this.getBadResultException( 'members.getDetails', rpcResult );
            }
        } );
    }

    private async getMemberAttributes ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<object> {
        const params = {
            customer: sessionInfo.customer
        };

        return this.rpc( 'members.getMemberAttributes', params, headers ).then( rpcResult => {
            if ( rpcResult.result && rpcResult.result ) {
                return rpcResult.result;
            } else {
                throw this.getBadResultException( 'members.getMemberAttributes', rpcResult );
            }
        } );
    }

    async updateMemberDetail ( profileUpdate: UpdateProfileDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<any> {
        const detailParams = {
            customer: sessionInfo.customer,
            firstname: profileUpdate.firstName,
            lastname: profileUpdate.lastName,
            company: profileUpdate.company,
            email: profileUpdate.email,
            profile: profileUpdate.profile
        };

        //Re-write a few params to match special handling done in BentoAPI
        if ( !!detailParams.profile ) {
            for ( const k in detailParams.profile ) {
                switch ( k ) {
                    case 'birth-day':
                    case 'birth-month':
                    case 'birth-year':
                        detailParams.profile[ k.replace( '-', '_' ) ] = detailParams.profile[ k ];
                        delete detailParams.profile[ k ];
                        break;
                }
            }
        }

        return this.rpc( 'members.updateDetails', detailParams, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.success ) {
                return true;
            } else {
                throw this.getBadResultException( 'members.updateDetails', rpcResult );
            }
        } );

    }

    async saveCustomerDetail ( customerDetail: CustomerDetailDto, headers: HeadersDto ): Promise<boolean> {
        const detailParams = {
            name: customerDetail.name,
            value: customerDetail.value
        };

        return this.rpc( 'members.setDetailRecord', detailParams, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result[ 0 ].success ) {
                return true;
            } else {
                throw this.getBadResultException( 'members.setDetailRecord', rpcResult );
            }
        } );

    }

    async updateUserPassword ( newPassword: string, session: SessionInfoDto, headers: HeadersDto ) {
        const detailParams = {
            customer: session.customer,
            password: newPassword
        };

        return this.rpc( 'members.updateDetails', detailParams, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.hasOwnProperty( 'success' ) ) {
                return rpcResult.result.success;
            } else {
                throw this.getBadResultException( 'members.updateDetails', rpcResult );
            }
        } );

    }

    async savePaymentInfo ( paymentInfoDto: PaymentInfoDto, sessionInfo: SessionInfoDto, storeDetail: StoreDetailDto, headers: HeadersDto ): Promise<PaymentResponseInfoDto> {
        const params = {
            customer: sessionInfo.customer,
            session: sessionInfo.session,
            card_num: paymentInfoDto.cardNum,
            card_type: paymentInfoDto.cardType,
            exp_month: paymentInfoDto.expMonth,
            exp_year: paymentInfoDto.expYear,
            name_on_card: paymentInfoDto.nameOnCard,
            card_code: paymentInfoDto.cardCode,
            address_id: paymentInfoDto.addressId,
            credit_card_id: paymentInfoDto.creditCardId,
            credit_card_is_default: paymentInfoDto.creditCardIsDefault ? paymentInfoDto.creditCardIsDefault : true,
            block_if_cart_has_items: paymentInfoDto.blockIfCardHasItems ? paymentInfoDto.blockIfCardHasItems : false,
            do_preauth: paymentInfoDto.doPreauth ? paymentInfoDto.doPreauth : false,
            is_validated: paymentInfoDto.isValidated ? paymentInfoDto.isValidated : false,
            customer_log_source_id: paymentInfoDto.customerLogId ? paymentInfoDto.customerLogId : 2,
            store_id: storeDetail.storeId,
            store_group_id: storeDetail.storeGroupId,
            card_is_token: paymentInfoDto.cardIsToken ? paymentInfoDto.cardIsToken : true
        };

        return this.rpc( 'members.savePayment', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result instanceof Array ) {
                const paymentResonseInfo: PaymentResponseInfoDto[] = rpcResult.result.map( ( resp: object ) => plainToClass( PaymentResponseInfoDto, resp ) );
                if ( paymentResonseInfo && paymentResonseInfo.length === 1 ) {
                    return paymentResonseInfo[ 0 ];
                } else {
                    this.getBadResultException( 'members.savePayment', rpcResult.result );
                }
            } else {
                throw this.getBadResultException( 'members.savePayment', rpcResult.result );
            }
        } );
    }

    async patchCreditCardPaymentInfo ( paymentId: number, PatchPaymentInfo: PatchPaymentInfoDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<PaymentOptionResponseDto[]> {

        const params = {
            session: sessionInfo.session,
            customer_id: sessionInfo.getCustomerId(),
            address_id: PatchPaymentInfo.addressId,
            isDefault: PatchPaymentInfo.isDefault,
            creditcard_id: paymentId,
        };

        return this.rpc( 'members.patchCreditCardPayment', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                console.log('************* : CreditCardPayment ===> ' + JSON.stringify(rpcResult.result));
                return rpcResult.result;
            } else {
                throw this.getBadResultException( 'members.patchCreditCardPayment', rpcResult.result );
            }
        });
    }

    async patchPSPPaymentInfo ( paymentId: number, PatchPaymentInfo: PatchPaymentInfoDto, sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<PaymentOptionResponseDto[]> {

        const params = {
            session: sessionInfo.session,
            customer_id: sessionInfo.getCustomerId(),
            address_id: PatchPaymentInfo.addressId,
            isDefault: PatchPaymentInfo.isDefault,
            psp_id: paymentId,
        };

        return this.rpc( 'members.patchPspPayment', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                console.log('************* : CreditCardPayment ===> ' + JSON.stringify(rpcResult.result));
                return rpcResult.result;
            } else {
                throw this.getBadResultException( 'members.patchPspPayment', rpcResult.result );
            }
        });
    }

    async getPaymentInfo ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<PaymentOptionResponseDto[]> {
    const params = {
            customer: sessionInfo.customer
        };

        return this.rpc( 'members.getPaymentOptions', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result instanceof Array ) {
                const paymentResonseInfo: PaymentOptionResponseDto[] = rpcResult.result.map( ( resp: object ) => PaymentOptionResponseDto.getInstance( resp ) );
                return paymentResonseInfo;
            } else {
                throw this.getBadResultException( 'members.getPaymentOptions', rpcResult.result );
            }
        } );
    }

    async removeCreditCard ( creditCardId: number, sessionInfo: SessionInfoDto, headers: HeadersDto): Promise<DeletedCreditCardInfo> {

        const params = {
            creditcard_id: creditCardId,
            customer_id: sessionInfo.getCustomerId()
        };

        return this.rpc( 'members.removeCreditCard', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return rpcResult.result;
            } else {
                throw this.getBadResultException( 'members.removeCreditCard', rpcResult.result );
            }
        } );

    }

    async removePsp ( pspId: number, sessionInfo: SessionInfoDto, headers: HeadersDto): Promise<DeletedPspInfo> {
        const params = {
            psp_id: pspId,
            customer_id: sessionInfo.getCustomerId()
        };

        return this.rpc( 'members.removePsp', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return rpcResult.result;

            } else {
                throw this.getBadResultException( 'members.removePsp', rpcResult.result );
            }
        } );
    }

    async getDefaultPaymentInfo ( sessionInfo: SessionInfoDto, headers: HeadersDto ): Promise<DefaultPaymentDto> {
        const params = {
            customer: sessionInfo.customer
        };

        return this.rpc( 'members.getDefaultPaymentOptions', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return plainToClass(DefaultPaymentDto, <object> rpcResult.result);
            } else {
                throw this.getBadResultException( 'members.getDefaultPaymentOptions', rpcResult.result );
            }
        } );
    }

    async signup ( customer: CustomerSignupDto, domain: string, session: SessionInfoDto, headers: HeadersDto ): Promise<MemberSaveResult> {

        const params: any = {
            email: customer.email,
            password: customer.password,
            domain,
            session: session.session
        };

        if ( !!customer.quizAnswers ) {
            params.speedy_signup = false;
            params.quiz_id = customer.quizAnswers.quizId;
            params.quiz_answers = customer.quizAnswers.answers.map( qa => {
                return {
                    quiz_question_id: qa.questionId,
                    quiz_answer_id: qa.answerId,
                    answer_text: qa.answerText,
                    sequence_number: qa.sequenceNumber
                };
            } );
        } else {
            params.speedy_signup = true;
        }

        if ( !!customer.profile ) {
            params.customer_details = { ...customer.profile };
        } else {
            params.customer_details = {};
        }

        if ( !!customer.details ) {
            params.customer_details = { ...params.customer_details, ...customer.details };
        }

        if ( !!customer.firstName ) {
            params.customer_details.first_name = customer.firstName;
        }

        if ( !!customer.lastName || customer.lastName === '' ) {
            params.customer_details.last_name = customer.lastName;
        }

        return this.rpc( 'members.customerSignup', params, headers ).then( ( rpcResult ) => {
            const saveResult = new MemberSaveResult();

            if ( rpcResult && rpcResult.result && Object.keys( rpcResult.result ).find( val => val.toLowerCase() === 'customer_key' && rpcResult.result[ val ] !== undefined ) ) {
                saveResult.ok = true;
                saveResult.result = rpcResult.result;
                return saveResult;
            } else {
                if ( rpcResult && rpcResult.error ) {
                    saveResult.ok = false;
                    saveResult.error = rpcResult.error;
                    return saveResult;
                }
                else {
                    throw this.getBadResultException( 'members.customerSignup', rpcResult.result );
                }
            }
        } );
    }

    async addToWishlist ( productId: number, headers: HeadersDto ): Promise<boolean> {
        return this.manageWishlist( productId, true, headers );
    }

    async removeFromWishlist ( productId: number, headers: HeadersDto ): Promise<boolean> {
        return this.manageWishlist( productId, false, headers );
    }

    getWishlist ( page: number, pageSize: number, sortDirection: SortDirection, headers: HeadersDto ): Promise<WishlistResponseDto> {
        const params =
        {
            size: pageSize,
            page,
            sort: 'datetime_modified',
            sort_direction: SortDirection[sortDirection].toLowerCase()
        };

        return this.rpc('members.getWishlist', params, headers).then(rpcResult => {
            if (rpcResult && rpcResult.result) {
                const result = rpcResult.result;
                const responseDto = new WishlistResponseDto();
                responseDto.page = page;
                responseDto.pageSize = pageSize;

                responseDto.total = result.hasOwnProperty('total_records') ? result.total_records : 0;
                responseDto.items = [];

                if (result.hasOwnProperty('result') && Array.isArray(result.result)) {
                    responseDto.items = (<Array<object>> result.result).map(item => WishlistItemDto.getInstance(item));
                } else {
                    // Adding these back for backwards compatibility
                    if (rpcResult && rpcResult.result && Array.isArray(rpcResult.result)) {
                        responseDto.items = (<Array<object>> rpcResult.result).map(item => WishlistItemDto.getInstance(item));
                        responseDto.total = !!rpcResult.result.length ? rpcResult.result[0].total_records : 0;
                    } else {
                        throw this.getBadResultException('members.getWishlist', rpcResult);
                    }
                }
                return responseDto;
            }

            throw this.getBadResultException('members.getWishlist', rpcResult);
        });
    }

    async getWishlistProductIds ( headers: HeadersDto ): Promise<WishlistProductIdsResponseDto> {
        const params = {};

        const rpcResult = await this.rpc( 'members.getWishlistProductIds', params, headers );

        if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) ) {
            const responseDto = new WishlistProductIdsResponseDto();
            responseDto.masterProductIds = rpcResult.result.map(p => p.master_product_id);
            responseDto.total = responseDto.masterProductIds.length;
            return responseDto;
        }
        else {
            throw this.getBadResultException( 'members.getWishlistProductIds', rpcResult );
        }

    }

    async manageWishlist ( productId: number, active: boolean, headers: HeadersDto ): Promise<boolean> {

        const params = {
            customer: headers.customer,
            product_id: productId,
            active
        };

        return this.rpc( 'members.updateWishlist', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && rpcResult.result.ok === true ) {
                return true;
            } else {
                throw this.getBadResultException( 'members.updateWishlist', rpcResult );
            }
        } );
    }

    async removeFromWaitlist ( waitlistId: number, session: SessionInfoDto, headers: HeadersDto ) {
        const params = {
            customer: session.customer,
            membership_product_wait_list_id: waitlistId
        };

        return this.rpc( 'members.removeFromWaitlist', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return true && rpcResult.result.success;
            } else {
                throw this.getBadResultException( 'members.removeFromWaitlist', rpcResult );
            }
        } );
    }

    async addToWaitlist ( product: ProductRequestDto, session: SessionInfoDto, headers: HeadersDto ) {

        //use autoPurchaseDays if possible
        product.dateExpires = product.autoPurchaseDays ? addDaysToDate( product.autoPurchaseDays ) : product.dateExpires;
        product.dateExpires = product.dateExpires ? product.dateExpires : undefined;
        const params = {
            customer: session.customer,
            product_id: product.productId,
            wait_list_type_id: product.waitlistTypeId,
            date_expires: product.dateExpires
        };

        return this.rpc( 'members.addToWaitlist', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return true && rpcResult.result.success;
            } else {
                throw this.getBadResultException( 'members.addToWaitlist', rpcResult );
            }
        } );
    }

    async addSetToWaitlist ( product: ProductSetRequestDto, session: SessionInfoDto, headers: HeadersDto ) {
        const params = {
            customer: session.customer,
            product_id: product.setId,
            wait_list_type_id: product.waitlistTypeId,
            date_expires: product.dateExpires,
            component_product_id_list: product.componentProductIds && product.componentProductIds.length > 0 ? product.componentProductIds.join( ',' ) : ''
        };

        return this.rpc( 'members.addToWaitlist', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result ) {
                return true && rpcResult.result.success;
            } else {
                throw this.getBadResultException( 'members.addToWaitlist', rpcResult );
            }
        } );
    }

    getWaitlist(page: number, pageSize: number, sortDirection: SortDirection, headers: HeadersDto): Promise<WaitlistResponseDto> {
        const WAIT_LIST_TYPE_IDS = `${WaitlistType.EMAIL},${WaitlistType.AUTO_ORDER},${WaitlistType.PRE_ORDER}`;

        const params = {
            records_per_page: pageSize,
            page_number: page,
            membership_product_wait_list_type_id_list: WAIT_LIST_TYPE_IDS,
            sort_direction: SortDirection[sortDirection].toLowerCase()
        };

        return this.rpc('members.getWaitlist', params, headers).then((rpcResult) => {

            if (rpcResult && rpcResult.result && Array.isArray(rpcResult.result)) {
                const responseDto = new WaitlistResponseDto();
                responseDto.page = page;
                responseDto.pageSize = pageSize;
                if (rpcResult.result.length === 0) {
                    responseDto.total = 0;
                    responseDto.items = [];
                } else {
                    responseDto.items = plainToClass(WaitlistItemDto, <Array<object>> rpcResult.result);
                    responseDto.total = rpcResult.result[0].total_records;
                }
                return responseDto;
            }
            throw this.getBadResultException('members.getWaitlist', rpcResult);
        });
    }

    async getWaitlistComponents ( waitlistIds: number[], headers: HeadersDto ): Promise<any> {
        const params = { waitlist_ids: waitlistIds};
        return this.rpc( 'members.getWaitlistComponents', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result ) {
                return rpcResult.result;
            }
            else {
                throw this.getBadResultException( 'members.getWaitlistComponents', rpcResult );
            }
        } );
    }

    async forgotPasswordByEmail ( email: string, storeDetail: StoreDetailDto, headers: HeadersDto ): Promise<{ message: any, success: boolean }> {
        const params =
        {
            email,
            storeGroupId: storeDetail.storeGroupId
        };

        return this.rpc( 'members.forgotPassword', params, headers ).then( rpcResult => {
            if ( rpcResult.result && rpcResult.result.length > 0 ) {
                return { message: rpcResult.result[ 0 ].message, success: rpcResult.result[ 0 ].success };
            } else {
                throw this.getBadResultException( 'members.forgotPassword', rpcResult );
            }
        } );
    }

    async resetPasswordByEmail ( prkey: string, password: string, confirm_password: string, storeDetail: StoreDetailDto, headers: HeadersDto ): Promise<{ message: string, success: boolean }> {
        const params =
        {
            prkey,
            password,
            confirm_password,
            storeGroupId: storeDetail.storeGroupId
        };

        return this.rpc( 'members.resetPassword', params, headers ).then( rpcResult => {
            if ( rpcResult.result && rpcResult.result.length > 0 ) {
                return { message: rpcResult.result[ 0 ].message, success: rpcResult.result[ 0 ].success };
            } else {
                throw this.getBadResultException( 'members.resetPassword', rpcResult );
            }
        } );
    }

    async getOrderHistory ( pageIndex: number, recordsPerPage: number, sort: string, storeDetail: StoreDetailDto, session: SessionInfoDto, headers: HeadersDto ): Promise<OrdersResponseDto> {

        const params = {
            customer: session.customer,
            store_group_id: storeDetail.storeGroupId,
            sort,
            records_per_page: recordsPerPage,
            page_index: pageIndex
        };

        return this.rpc( 'members.orderHistory', params, headers ).then( ( rpcResult ) => {

            if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) ) {
                const responseDto: OrdersResponseDto = new OrdersResponseDto();
                responseDto.totalRecords = recordsPerPage;
                if ( rpcResult.result[ 0 ].length === 0 ) {
                    responseDto.totalRecords = 0;
                    responseDto.orders = new Array();
                } else {
                    responseDto.orders = plainToClass( OrderHistoryDto, <Array<object>> rpcResult.result );
                    responseDto.totalRecords = responseDto.orders[ 0 ][ 0 ].totalCount;
                }
                return responseDto;
            }
            else {
                throw this.getBadResultException( 'members.orderHistory', rpcResult );
            }
        } );
    }

    async getCustomerProductReviews ( reviewCount: number, page: number, headers: HeadersDto, masterProductIds?: Array<number> ): Promise<ProductReviewDto[]> {
        const params = {
            master_product_ids: masterProductIds ? masterProductIds.join( ',' ) : '',
            records: reviewCount,
            page
        };

        return this.rpc( 'reviews.GetReviewsByCustomerId', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) ) {
                const productReviews: ProductReviewDto[] = rpcResult.result.map( ( resp: object ) => plainToClass( ProductReviewDto, resp ) );
                return productReviews;
            } else {
                throw this.getBadResultException( 'reviews.GetReviewsByCustomerId', rpcResult );
            }
        } );
    }

    async getCustomerProductReview ( reviewId: number, headers: HeadersDto ): Promise<ProductReviewDto[]> {
        const params = {
            review_id: reviewId
        };

        return this.rpc( 'reviews.GetReviewsById', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) ) {
                const productReviews: ProductReviewDto[] = rpcResult.result.map( ( resp: object ) => plainToClass( ProductReviewDto, resp ) );
                return productReviews;
            } else {
                throw this.getBadResultException( 'reviews.GetReviewsById', rpcResult );
            }
        } );
    }

    async getCustomerDetail ( names: Array<string>, headers: HeadersDto ): Promise<Array<CustomerDetailDto>> {
        const params = {
            name: names.join( ',' )
        };

        const methodName: string = 'members.getDetailByName';
        return this.rpc( methodName, params, headers ).then(rpcResult => {
            if (rpcResult && rpcResult.result) {
                return CustomerDetailDto.getInstances(rpcResult.result);
            }
            throw this.getBadResultException(methodName, rpcResult);
        } );

    }

    /**
     * returns the CustomerDetailDto that represents the retail_postreg_start record from BentoAPI. If no match is found it will return an empty CustomerDetailDetailDto model.
     * @param headers
     */
    async getOnSiteMembershipExperienceDetail(headers: HeadersDto): Promise<CustomerDetailDto> {
        const CustomerDetailRetailPostregStart = 'retail_postreg_start';
        const values = await this.getCustomerDetail([CustomerDetailRetailPostregStart], headers);

        if (!values) {
            return new CustomerDetailDto();
        }

        const customerDetailDto = values.find(value => value.name === CustomerDetailRetailPostregStart);

        if (!customerDetailDto) {
            return new CustomerDetailDto();
        }

        return customerDetailDto;
    }

    /**
     * returns the details specific to the nmp project.
     * @param headers
     */
    async getMemberNmpDetails(headers: HeadersDto): Promise<CustomerNmpDetailsDto> {
        const CustomerMobileAppNotPermitted = 'mobile_app_not_permitted';
        const CustomerNmpTestGroup = 'nmp_test_group';

        const nmpDetailsDto = new CustomerNmpDetailsDto();

        const values = await this.getCustomerDetail([CustomerMobileAppNotPermitted, CustomerNmpTestGroup], headers);

        if (!values) {
            return nmpDetailsDto;
        }

        values.forEach( detailRecord => {
            if ( detailRecord.name === CustomerMobileAppNotPermitted ){
                nmpDetailsDto.mobileAppAccessNotPermitted = StringUtils.toBoolean(detailRecord.value);
            }
            else if ( detailRecord.name === CustomerNmpTestGroup ){
                nmpDetailsDto.nmpTestGroup = !isNaN(parseInt(detailRecord.value)) ? parseInt(detailRecord.value) : undefined;
            }
        });

        return nmpDetailsDto;
    }

    async submitProductReview ( review: SubmitProductReviewDto, session: SessionInfoDto, headers: HeadersDto ): Promise<SubmitProductReviewResponseDto> {
        const params = {
            customer: session.customer,
            review_template_id: review.reviewTemplateId,
            page_number: review.pageNumber,
            product_id: review.productId,
            form_data: review.formData,
            review_id: review.reviewId,
            order_id: review.orderId,
            allow_review_update: review.allowReviewUpdate,
            points: review.points
        };

        return this.rpc( 'members.submitReview', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && rpcResult.result.ok === true ) {
                const res = new SubmitProductReviewResponseDto();
                res.reviewId = parseInt( rpcResult.result.review_id );
                return res;
            } else {
                throw this.getBadResultException( 'members.submitReview', rpcResult );
            }
        } );
    }

    async uploadReviewImage ( productId: number, base64DataUrl: string, headers: HeadersDto ): Promise<ReviewImageResponseDto> {
        const imageDatatRegex = /^data:image\/(jpg|jpeg|gif|png)\;base64,/i;

        if ( !imageDatatRegex.test( base64DataUrl ) ) {
            throw new BadRequestException( 'Only images are allowed to be uploaded' );
        }

        const params = {
            product_id: productId,
            imageBase64: base64DataUrl.replace( imageDatatRegex, '' )
        };

        return this.rpc( 'reviews.uploadReviewImage', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.success ) {
                return plainToClass( ReviewImageResponseDto, <object> rpcResult.result.data );
            } else {
                throw this.getBadResultException( 'reviews.uploadReviewImage', rpcResult );
            }
        } );
    }

    async getReviewableProducts ( session: SessionInfoDto, headers: HeadersDto ): Promise<ReviewableProductDto[]> {
        const params = {
            session: session.session,
            customer: session.customer
        };

        return this.rpc( 'members.GetAvailableProductsToReviewByCustomerByStoreGroup', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) ) {
                const reviewableProducts: ReviewableProductDto[] = rpcResult.result.map( ( resp: object ) => plainToClass( ReviewableProductDto, resp ) );
                return reviewableProducts.sort( ( a, b ) => b.datetimeAdded.getTime() - a.datetimeAdded.getTime() );
            } else {
                throw this.getBadResultException( 'members.GetAvailableProductsToReviewByCustomerByStoreGroup', rpcResult );
            }
        } );
    }

    async getReturnableProductsByOrderId ( orderId: number, headers: HeadersDto ): Promise<ReturnableProductsDto> {
        const params = { order_id: orderId };

        return this.rpc( 'orders.returnableProductsByOrderID', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length > 0 ) {
                return ReturnableProductsDto.getInstance( rpcResult.result[ 0 ] );
            } else {
                throw this.getBadResultException( 'orders.returnableProductsByOrderID', rpcResult );
            }
        } );
    }

    async returnProduct ( rmaDetails: OrderRmaDto, headers: HeadersDto ): Promise<any> {
        const params = { ...rmaDetails.toRpcParams() };

        return this.rpc( 'orders.returnProduct', params, headers ).then( ( rpcResult ) => {
            if ( rpcResult && rpcResult.result && rpcResult.result.length > 0 ) {
                const result = rpcResult.result[ 0 ];
                if ( !!result.success ) {
                    return ReturnProductSuccessDto.getInstance( result );
                } else {
                    return ReturnProductFaultDto.getInstance( result );
                }
            } else {
                throw this.getBadResultException( 'orders.returnProduct', rpcResult );
            }
        } );
    }

    async getOrderDetail ( orderId: number, session: SessionInfoDto, headers: HeadersDto ): Promise<OrderDetailDto> {

        const params = {
            customer: session.customer,
            order_id: orderId
        };

        return this.rpc( 'orders.orderDetail', params, headers ).then( ( rpcResult ) => {

            if ( rpcResult && rpcResult.result && Array.isArray( rpcResult.result ) && rpcResult.result.length > 0 ) {
                let responseDto: OrderDetailDto = new OrderDetailDto();
                responseDto = OrderDetailDto.getInstance( rpcResult.result[ 0 ] );
                return responseDto;
            }
            else {
                throw this.getBadResultException( 'orders.orderDetail', rpcResult.result );
            }
        } );
    }

    async getOrderRma ( orderId: number, rmaId: number, session: SessionInfoDto, headers: HeadersDto ): Promise<any> {
        const params = {
            order_id: orderId,
            rma_id: rmaId
        };

        return this.rpc( 'orders.getRMA', params, headers ).then( ( rpcResult ) => {

            if ( rpcResult && rpcResult.result ) {
                return rpcResult.result;
            }
            else {
                throw this.getBadResultException( 'orders.orderDetail', rpcResult.result );
            }
        } );
    }

    async getActiveMemberPromos ( activeDate: Date, headers: HeadersDto ): Promise<Array<MembersActivePromoDto>> {
        const params = {
            active_date: activeDate
        };

        return this.rpc( 'members.getActiveMemberPromos', params, headers ).then( ( rpcResult ) => {

            if ( rpcResult && rpcResult.result ) {
                return MembersActivePromoDto.getInstances( rpcResult.result );
            }
            else {
                throw this.getBadResultException( 'members.getActiveMemberPromos', rpcResult.result );
            }
        } );
    }

    async saveAdyenPayment ( paymentInfoDto: AdyenPaymentRequestDto, headers: HeadersDto ): Promise<any> {
        const params = {
            cseToken: paymentInfoDto.cardToken,
            tokenSdk: paymentInfoDto.tokenSdk
        };

        return this.rpc( 'orders.adyenZeroAuth', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result instanceof Array ) {

                if ( rpcResult.result && !!rpcResult.result.length ) {
                    const result = rpcResult.result[ 0 ];
                    if ( !!result.success && !!result.result.length ) {
                        const paymentResonseInfo: PSPPaymentResponseInfoDto = plainToClass( PSPPaymentResponseInfoDto, <object> result.result[ 0 ] );
                        return paymentResonseInfo;
                    }
                }
            }

            throw this.getBadResultException( 'orders.adyenZeroAuth', rpcResult.result );

        } );
    }

    async getAdyenPaymentSession ( paymentSessionDto: AdyenPaymentSessionRequestDto, headers: HeadersDto ): Promise<AdyenPaymentSessionResponseDto> {
        const params = {
            token: paymentSessionDto.token,
            return_url: paymentSessionDto.returnUrl,
            amount: paymentSessionDto.amount,
            token_sdk: 'ios',
            psp_test_order: !!paymentSessionDto.testOrder ? paymentSessionDto.testOrder : false
        };

        return this.rpc( 'orders.adyenPaymentSession', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result instanceof Array ) {
                if ( !!rpcResult.result.length ) {
                    const result: { payment_session: string } = rpcResult.result[ 0 ];
                    if ( !!result.payment_session ) {
                        const paymentSessionResponse: AdyenPaymentSessionResponseDto = plainToClass( AdyenPaymentSessionResponseDto, result );
                        return paymentSessionResponse;
                    }
                }
            }

            throw this.getBadResultException( 'orders.adyenPaymentSession', rpcResult.result );

        } );
    }

    async saveProspectiveCustomer ( email: string, headers: HeadersDto ): Promise<AddContactResponseDto> {
        const params = {
            email
        };

        return this.rpc( 'members.saveProspectiveCustomer', params, headers ).then( rpcResult => {

            if ( rpcResult && rpcResult.result.customer_id && rpcResult.result.sha_email && rpcResult.result.hashed_user_email ) {
                return new AddContactResponseDto( rpcResult.result.customer_id, rpcResult.result.hashed_user_email, rpcResult.result.sha_email );
            } else if ( rpcResult && rpcResult.result.email_exists ) {
                const res = new AddContactResponseDto();
                res.userExists = true;
                return res;
            }
            throw this.getBadResultException( 'members.saveProspectiveCustomer', rpcResult.result );

        } );
    }

    async isGoogleReCaptchaValid ( response: string, overrideEnv: boolean, version: 'v2' | 'v3', headers: HeadersDto ): Promise<boolean> {
        const params = { response, version, overrideEnv };

        return this.rpc( 'members.GoogleReCaptchaIsValid', params, headers ).then( rpcResult => {

            if ( rpcResult && rpcResult.result && rpcResult.result.length > 0 && rpcResult.result[ 0 ].hasOwnProperty( 'success' ) ) {
                return rpcResult.result[ 0 ].success;
            }
            throw this.getBadResultException( 'members.GoogleReCaptchaIsValid', rpcResult.result );

        } );
    }

    async submitCCPARequest ( ccpaRequest: CCPARequestDto, headers: HeadersDto ): Promise<CCPAResponseDto> {
        const params = { ...ccpaRequest.toRpcParams() };

        return this.rpc( 'members.submitCCPARequest', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result) {
                const ccpaResponse =  plainToClass( CCPAResponseDto, <object> rpcResult.result);
                return ccpaResponse;
            } else {
                throw this.getBadResultException( 'members.submitCCPARequest', rpcResult );
            }
        } ).catch( (err) => {
            throw this.getBadResultException( 'members.submitCCPARequest', err.errors[0] );
        });

    }

    async isUserFromState ( state: string, headers: HeadersDto ): Promise<boolean> {
        const params = { state };

        return this.rpc( 'members.isUserFromState', params, headers ).then( rpcResult => {
            if ( rpcResult && rpcResult.result && rpcResult.result.hasOwnProperty('is_from_state')) {
                return rpcResult.result.is_from_state;
            } else {
                throw this.getBadResultException( 'members.isUserFromState', rpcResult );
            }
        } );

    }

    async logMobileAppLoginAttemptedDetail(headers: HeadersDto) {
        const CustomerMobileAppNotPermitted = 'mobile_app_not_permitted';
        const CustomerMobileAppLoginAttempted = 'nmp_test_user_login_attempted';

        const values = await this.getCustomerDetail([CustomerMobileAppNotPermitted, CustomerMobileAppLoginAttempted], headers);

        //only attempt to record the attempted login if records were found
        if (values){
            const detailsCheck = {
                mobileAppNotPermittedFound: false,
                mobileAppLoginAttemptedFound: false
            };

            values.forEach( detailRecord => {
                if ( detailRecord.name === CustomerMobileAppNotPermitted ){
                    detailsCheck.mobileAppNotPermittedFound = StringUtils.toBoolean(detailRecord.value);
                }
                else if ( detailRecord.name === CustomerMobileAppLoginAttempted ){
                    detailsCheck.mobileAppLoginAttemptedFound = true;
                }
            });

            //Only logging the attempt if they haven't previously had a record logged
            if ( detailsCheck.mobileAppNotPermittedFound && !detailsCheck.mobileAppLoginAttemptedFound ){
                const customerDetail = new CustomerDetailDto();
                customerDetail.name = CustomerMobileAppLoginAttempted;
                customerDetail.value = '1';
                this.saveCustomerDetail(customerDetail, headers);
                console.log('logging the attempt going to try and log the attempt');
            }
        }
    }

}
