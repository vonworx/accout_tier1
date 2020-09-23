import { ApiModelProperty } from '@nestjs/swagger';
import { AddressType, IAddress } from './address.interface';

export class CreateAddressDto implements IAddress {

    @ApiModelProperty()
    type: AddressType;

    @ApiModelProperty()
    firstName: string;

    @ApiModelProperty()
    lastName: string;

    @ApiModelProperty()
    company: string;

    @ApiModelProperty()
    address1: string;

    @ApiModelProperty()
    address2: string;

    @ApiModelProperty()
    city: string;

    @ApiModelProperty()
    state: string;

    @ApiModelProperty()
    zip: string;

    @ApiModelProperty()
    countryCode: string;

    @ApiModelProperty()
    phone: string;

    @ApiModelProperty()
    isDefault: boolean;

}
