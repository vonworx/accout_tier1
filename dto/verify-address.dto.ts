import {Exclude, Expose, plainToClass} from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import * as _ from 'lodash';

@Exclude()
export class VerifyAddressRequestDto {

    @ApiModelProperty()
    @Expose({name: 'MAILERADDRESS1'})
    address1: string;

    @ApiModelProperty()
    @Expose({name: 'MAILERADDRESS2'})
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
    @Expose({name: 'ZIPEXT'})
    zipExt: string;

    @ApiModelProperty()
    @Expose({name: 'COUNTRY_CODE'})
    countryCode: string;

    static getInstance(VerifyAddressObj: object): VerifyAddressRequestDto {
        VerifyAddressObj = _.transform(VerifyAddressObj, (result, val, key) => { result[key.toUpperCase()] = val; } , {});
        return plainToClass(VerifyAddressRequestDto, VerifyAddressObj);
    }
}

export class VerifyAddressResponseDto extends VerifyAddressRequestDto {

    @ApiModelProperty({description: 'Result codes that indicate the status of the address. See http://wiki.melissadata.com/index.php?title=Result_Code_Details#Address_Object', isArray: true, type: String})
    resultCodes: string[];

    @ApiModelProperty({description: 'The suggested address is an exact match'})
    @Expose({name: 'exact_match'})
    exactMatch: boolean;

    @ApiModelProperty({})
    @Expose({name: 'error_desc'})
    errorDesc: string;

    @ApiModelProperty()
    @Expose({name: 'error_code'})
    errorCode: number;

}
