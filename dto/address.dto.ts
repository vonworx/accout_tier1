import {Exclude, Expose, Type, Transform, plainToClass} from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import { IAddress } from './address.interface';
import { transformToBoolean } from '../../common/utils';
import * as _ from 'lodash';

const ADDRESS_TYPE_SHIPPING = 1;
const ADDRESS_TYPE_BILLING = 2;

@Exclude()
export class AddressDto implements IAddress {

    @ApiModelProperty()
    @Expose({name: 'ADDRESS_ID'})
    id: number;

    @ApiModelProperty()
    @Expose({name: 'FIRSTNAME'})
    firstName: string;

    @ApiModelProperty()
    @Expose({name: 'LASTNAME'})
    lastName: string;

    @ApiModelProperty()
    @Expose({name: 'COMPANY'})
    company: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS1'})
    address1: string;

    @ApiModelProperty()
    @Expose({name: 'ADDRESS2'})
    address2: string;

    @ApiModelProperty()
    @Expose({name: 'CITY'})
    city: string;

    @ApiModelProperty()
    @Expose({name: 'STATE'})
    state: string;

    @ApiModelProperty()
    @Expose({name: 'ZIP'})
    zip: string;

    @ApiModelProperty()
    @Expose({name: 'COUNTRY_CODE'})
    countryCode: string;

    @ApiModelProperty()
    @Expose({name: 'PHONE'})
    phone: string;

    @ApiModelProperty()
    @Expose({name: 'IS_DEFAULT'})
    @Transform( value => transformToBoolean(value) )
    isDefault: boolean;

    @ApiModelProperty({type: String, format: 'date-time'})
    @Expose({name: 'DATETIME_MODIFIED'})
    @Type(() => Date)
    lastModifiedDate: Date;

    @ApiModelProperty({type: String, format: 'date-time'})
    @Expose({name: 'DATETIME_ADDED'})
    @Type(() => Date)
    createdDate: Date;

    @ApiModelProperty()
    @Expose({name: 'EMAIL'})
    email: string;

    @ApiModelProperty()
    @Expose({name: 'IS_VALIDATED'})
    @Transform( value => transformToBoolean(value) )
    validated: boolean;

    static getInstance(addressObj: object): AddressDto {
        addressObj = _.transform(addressObj, (result, val, key) => { result[key.toUpperCase()] = val; } , {});
        return plainToClass(AddressDto, addressObj);
    }

}
