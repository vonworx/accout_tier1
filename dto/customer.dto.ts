import * as _ from 'lodash';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { MemberQuizAnswersDto } from '../../quiz/dto';
import { EmailPreferencesDto } from './email-preferences.dto';
import { DefaultPaymentDto } from './payment-info.dto';
import { RetailStoreDto } from '../../retailstore/dto/retailstore.dto';
import { transformDateString, transformFloat } from '../../common/utils';
import { InfluencerDto } from './influencer.dto';

@Exclude()
export class CustomerDto {

    @ApiModelProperty()
    @Expose({name: 'customer_key'})
    customerKey: string;

    @ApiModelProperty()
    @Expose({name: 'statuscode'})
    statusCode: number;

    @ApiModelProperty()
    @Expose({name: 'store_group_id'})
    storeGroupId: number;

    @ApiModelProperty()
    @Expose({name: 'customer_id'})
    id: number;

    @ApiModelProperty()
    @Expose({name: 'default_address_id'})
    defaultAddressId: number;

    @ApiModelProperty()
    @Expose({name: 'firstname'})
    firstName: string;

    @ApiModelProperty()
    @Expose({name: 'lastname'})
    lastName: string;

    @ApiModelProperty()
    @Expose({name: 'salutation'})
    salutation: string;

    @ApiModelProperty()
    @Expose({name: 'email'})
    email: string;

    @ApiModelProperty()
    @Expose({name: 'birthyear'})
    birthYear: string;

    @ApiModelProperty()
    @Expose({name: 'company'})
    company: string;

    @ApiModelProperty()
    @Expose({name: 'prkey'})
    prKey: string;

    @ApiModelProperty()
    @Expose({name: 'store_id'})
    storeId: number;

    @ApiModelProperty()
    @Expose({name: 'username'})
    username: string;

    @ApiModelProperty()
    @Expose({name: 'customer_type_id'})
    customerTypeId: number;

    @ApiModelProperty({default: '', description: 'Gender chosen by customer on signup or from quiz.'})
    @Expose({name: 'gender'})
    @Transform( value => value && value.length > 0 ? value.toUpperCase() : '')
    gender: string;

    @ApiModelProperty()
    @Expose({name: 'is_influencer'})
    isInfluencer: boolean;

    @ApiModelPropertyOptional({description: 'Only included when isInfluencer property is true on getMemberProfile.', default: false})
    @Expose({name: 'influencer_info'})
    @Transform( influencerInfo => plainToClass(InfluencerDto, influencerInfo ) )
    influencerInfo: InfluencerDto;

    @ApiModelProperty()
    profile: object;

    @ApiModelProperty()
    persona: string;

    @ApiModelPropertyOptional({description: 'Only included when includeEmail query parameter is true on getUserProfile.', default: false})
    emailPreferences: EmailPreferencesDto;

    @ApiModelPropertyOptional({description: 'Only included when defaultPayment query parameter is true on getUserProfile.', default: false})
    defaultPayment: DefaultPaymentDto;

    @ApiModelProperty( { description: 'Hashed email using the SHA-256 encoding algorithm' } )
    @Expose({name: 'sha_email'})
    shaEmail: string;

    @ApiModelProperty( { description: 'Hashed email using the MD5 encoding algorithm' } )
    @Expose({name: 'hashed_user_email'})
    hashedUserEmail: string;

    @ApiModelProperty( { description: 'VIP savings to date' } )
    @Expose({name: 'vip_savings'})
    vipSavings: number;

    @ApiModelProperty( { description: 'key/value pairs of profile settings that correlate to option signature ids. Key is the profile/customer_detail key and value is an array of option signature ids', type: Object } )
    optionSignatures: object;

    @ApiModelProperty()
    @Expose({name: 'longitude'})
    @Transform( value => !!value ? transformFloat(value, undefined) : undefined )
    longitude: number;

    @ApiModelProperty()
    @Expose({name: 'latitude'})
    @Transform( value => !!value ? transformFloat(value, undefined) : undefined )
    latitude: number;

    @ApiModelProperty()
    @Expose({name: 'store_postal_code'})
    @Transform( value => !!value ? `${value}` : '' )
    storePostalCode: string;

    @ApiModelProperty()
    retailStores: RetailStoreDto[];

    @ApiModelProperty( { description: 'Number of days since last order was placed.' } )
    @Expose({name: 'days_since_last_order'})
    @Transform( numDays => !!numDays && numDays > 0 ? numDays : null )
    daysSinceLastOrder: number;

    @ApiModelProperty( { description: 'Customer last login' } )
    @Expose({name: 'last_login'})
    @Transform( ( val ) => transformDateString( val, undefined ) )
    lastLogin: Date;

    @ApiModelProperty( { description: 'Hashed phone using the SHA-256 encoding algorithm' } )
    @Expose({name: 'sha_phone'})
    shaPhone: string;

    @ApiModelProperty( { description: 'Hashed email using the SHA-1 encoding algorithm' } )
    @Expose({name: 'sha1_hashed_user_email'})
    sha1HashedUserEmail: string;

    static getInstance(customer: object): CustomerDto {
        customer = _.transform( customer, ( result, value, key ) => { result[ key.toLowerCase() ] = value; }, {} );
        return plainToClass(CustomerDto, customer);
    }

}

export class CustomerSignupDto {

    @ApiModelPropertyOptional()
    firstName: string;

    @ApiModelPropertyOptional()
    lastName: string;

    @ApiModelProperty( { required: true } )
    email: string;

    @ApiModelProperty( { required: true } )
    password: string;

    @ApiModelProperty( { description: 'Email opt out status. Possible values \'none\', \'all\', \'basic\', \'blast\'', required: true } )
    optOutStatus: string;

    @ApiModelProperty( { required: false, isArray: true, type: String } )
    marketingLists: string[];

    @ApiModelPropertyOptional( { description: 'A users answers to the quiz presented at signup. If excluded will process signup as a \`speedy signup\`', type: MemberQuizAnswersDto } )
    quizAnswers: MemberQuizAnswersDto;

    @ApiModelPropertyOptional( { description: 'Associative array to store profile information about the customer' } )
    profile: {};

    @ApiModelPropertyOptional( { description: 'Associative array to store additional key/value pairs in customer detail' } )
    details: {};

}
