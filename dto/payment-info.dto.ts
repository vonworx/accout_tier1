import { Exclude, Expose, Type, Transform, plainToClass } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import { transformToBoolean } from '../../common/utils';
import * as _ from 'lodash';

export class PaymentInfoDto {

    @ApiModelProperty({required: true})
    cardNum: string;

    @ApiModelProperty({required: true})
    cardType: string;

    @ApiModelProperty({required: true})
    expMonth: string;

    @ApiModelProperty({required: true})
    expYear: string;

    @ApiModelProperty({required: true})
    nameOnCard: string;

    @ApiModelProperty({required: true})
    cardCode: string;

    @ApiModelProperty({required: true})
    addressId: number;

    @ApiModelProperty({default: 0})
    creditCardId: number;

    @ApiModelProperty({default: true})
    creditCardIsDefault: boolean;

    @ApiModelProperty({default: false})
    blockIfCardHasItems: boolean;

    @ApiModelProperty({default: false})
    doPreauth: boolean;

    @ApiModelProperty({default: false})
    isValidated: boolean;

    @ApiModelProperty({default: 2})
    customerLogId: number;

    @ApiModelProperty({default: true})
    cardIsToken: boolean;
}

@Exclude()
export class PaymentResponseInfoDto {
    @ApiModelProperty()
    @Expose({name: 'creditcard_id'})
    creditCardId: number;

    @ApiModelProperty()
    @Expose({name: 'customer_id'})
    customerId: number;

    @ApiModelProperty()
    @Expose({name: 'address_id'})
    addressId: number;

    @ApiModelProperty()
    @Expose({name: 'card_type'})
    cardType: string;

    @ApiModelProperty()
    @Expose({name: 'exp_month'})
    expMonth: string;

    @ApiModelProperty()
    @Expose({name: 'exp_year'})
    expYear: string;

    @ApiModelProperty()
    @Expose({name: 'name_on_card'})
    nameOnCard: string;

    @ApiModelProperty()
    @Expose({name: 'last_four_digits'})
    lastFourDigits: string;

    @ApiModelProperty()
    @Expose({name: 'psp_id'})
    pspId: number;

    static getInstance ( paymentRespObj: object ): PaymentResponseInfoDto {
        paymentRespObj = _.transform( paymentRespObj, ( result, val, key ) => { result[ key.toLowerCase() ] = val; }, {} );
        const dto: PaymentResponseInfoDto = plainToClass( PaymentResponseInfoDto, paymentRespObj );

        if ( !!paymentRespObj[ 'psp_id' ] ) {
            dto.nameOnCard = paymentRespObj['acct_name'];
            dto.cardType = paymentRespObj['type'];
            dto.lastFourDigits = paymentRespObj['acct_num'];
        }

        return dto;
    }
}

@Exclude()
export class PaymentOptionResponseDto {

    @ApiModelProperty()
    @Expose({name: 'ADDRESS_ID'})
    addressId: number;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS_TYPE_ID'})
    addressTypeId: number;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS1'})
    address1: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS2'})
    address2: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS3'})
    address3: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS4'})
    address4: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS5'})
    address5: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS6'})
    address6: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS7'})
    address7: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS8'})
    address8: string;

    @ApiModelProperty()
    @Expose({name: 'ALIAS'})
    alias: string;

    @ApiModelProperty()
    @Expose({name: 'CARD_TYPE'})
    cardType: string;

    @ApiModelProperty()
    @Expose({name: 'CITY'})
    city: string;

    @ApiModelProperty()
    @Expose({name: 'COMPANY'})
    company: string;

    @ApiModelProperty()
    @Expose({name: 'COUNTRY_CODE'})
    countryCode: string;

    @ApiModelProperty()
    @Expose({name: 'CREDITCARD_ID'})
    creditCardId: number;

    @ApiModelProperty( { description: 'PSP Identifier for payment methods' } )
    @Expose({name: 'PSP_ID'})
    paymentServiceProviderId: number;

    @ApiModelProperty()
    @Expose({name: 'CUSTOMER_ID'})
    customerId: number;

    @ApiModelProperty({type: String, format: 'date-time'})
    @Expose({name: 'DATETIME_ADDED'})
    @Type(() => Date)
    createdDate: Date;

    @ApiModelProperty({type: String, format: 'date-time'})
    @Expose({name: 'DATETIME_MODIFIED'})
    @Type(() => Date)
    lastModifiedDate: Date;

    @ApiModelProperty()
    @Expose({name: 'EMAIL'})
    email: string;

    @ApiModelProperty()
    @Expose({name: 'EXP_MONTH'})
    expMonth: string;

    @ApiModelProperty()
    @Expose({name: 'EXP_YEAR'})
    expYear: number;

    @ApiModelProperty()
    @Expose({name: 'FIRSTNAME'})
    firstName: string;

    @ApiModelProperty()
    @Expose({name: 'IS_CUSTOMER_VALIDATED'})
    @Transform( transformToBoolean )
    isCustomerValidated: boolean;

    @ApiModelProperty()
    @Expose({name: 'IS_DEFAULT'})
    @Transform( transformToBoolean )
    isDefault: boolean;

    @ApiModelProperty()
    @Expose({name: 'IS_VALIDATED'})
    isValidated: string;

    @ApiModelProperty()
    @Expose({name: 'LAST_FOUR_DIGITS'})
    lastFourDigits: number;

    @ApiModelProperty()
    @Expose({name: 'LASTNAME'})
    lastName: string;

    @ApiModelProperty()
    @Expose({name: 'NAME'})
    name: string;

    @ApiModelProperty()
    @Expose({name: 'NAME_ON_CARD'})
    nameOnCard: string;

    @ApiModelProperty()
    @Expose({name: 'PHONE'})
    phone: string;

    @ApiModelProperty()
    @Expose({name: 'PHONE_DIGITS'})
    phoneDigits: number;

    @ApiModelProperty()
    @Expose({name: 'STATE'})
    state: string;

    @ApiModelProperty()
    @Expose({name: 'ZIP'})
    zip: string;

    static getInstance ( paymentRespObj: object ): PaymentOptionResponseDto {
        paymentRespObj = _.transform( paymentRespObj, ( result, val, key ) => { result[ key.toUpperCase() ] = val; }, {} );
        const dto: PaymentOptionResponseDto = plainToClass( PaymentOptionResponseDto, paymentRespObj );

        if ( !!paymentRespObj[ 'PSP_ID' ] ) {
            dto.nameOnCard = paymentRespObj['ACCT_NAME'];
            dto.cardType = paymentRespObj['TYPE'];
        }

        return dto;
    }
}

@Exclude()
export class PSPPaymentResponseInfoDto {
    @ApiModelProperty()
    @Expose({name: 'psp_id'})
    pspId: number;

    @ApiModelProperty()
    @Expose({name: 'type'})
    type: string;

    @ApiModelProperty()
    @Expose({name: 'acct_num'})
    acctNum: string;

    @ApiModelProperty()
    @Expose({name: 'acct_name'})
    acctName: string;

    @ApiModelProperty()
    @Expose({name: 'exp_month'})
    expMonth: string;

    @ApiModelProperty()
    @Expose({name: 'exp_year'})
    expYear: string;

    @ApiModelProperty()
    @Expose({name: 'bank_name'})
    bankName: string;

    @ApiModelProperty()
    @Expose({name: 'alias'})
    alias: string;

    @ApiModelProperty()
    @Expose({name: 'contract'})
    contract: string;

    @ApiModelProperty()
    @Expose({name: 'address_id'})
    addressId: number;

    @ApiModelProperty()
    @Expose({name: 'firstname'})
    firstname: string;

    @ApiModelProperty()
    @Expose({name: 'lastname'})
    lastname: string;

    @ApiModelProperty()
    @Expose({name: 'address1'})
    address1: string;

    @ApiModelProperty()
    @Expose({name: 'address2'})
    address2: string;

    @ApiModelProperty()
    @Expose({name: 'city'})
    city: string;

    @ApiModelProperty()
    @Expose({name: 'state'})
    state: string;

    @ApiModelProperty()
    @Expose({name: 'zip'})
    zip: string;

    @ApiModelProperty()
    @Expose({name: 'country_code'})
    countryCode: string;

    @ApiModelProperty()
    @Expose({name: 'phone'})
    phone: string;

    @ApiModelProperty()
    @Expose({name: 'us_phone_areacode'})
    usPhoneAreacode: string;

    @ApiModelProperty()
    @Expose({name: 'us_phone_prefix'})
    usPhonePrefix: string;

    @ApiModelProperty()
    @Expose({name: 'us_phone_linenumber'})
    usPhoneLinenumber: string;

    @ApiModelProperty()
    @Expose({name: 'email'})
    email: string;
}

@Exclude()
export class DefaultPaymentDto  {
    @ApiModelProperty()
    @Expose( { name: 'isExpired' } )
    @Transform( transformToBoolean )
    isExpired: boolean;
}
