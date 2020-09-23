import { ApiModelProperty } from '@nestjs/swagger';
import { plainToClass, Transform, Expose, Exclude } from 'class-transformer';
import { StringUtils } from '../../common/utils/string-utils';
import { transformDateStringToDate } from '../../common/utils';

@Exclude()
export class CustomerDetailDto {

    @ApiModelProperty()
    @Expose({name: 'name'})
    name: string;

    @ApiModelProperty()
    @Expose({name: 'value'})
    value: string;

    @ApiModelProperty()
    @Expose({name: 'datetime_added'})
    @Transform(val => transformDateStringToDate(val))
    datetimeAdded: (Date | undefined);

    static getInstance(customerDetail: object): CustomerDetailDto {
        customerDetail = StringUtils.toLowerCaseKeys(customerDetail) as object;
        return plainToClass(CustomerDetailDto, customerDetail);
    }

    static getInstances(customerDetails: Array<object>): Array<CustomerDetailDto> {
        return !customerDetails || customerDetails.length === 0
            ? []
            : customerDetails.map(CustomerDetailDto.getInstance);
    }
}

@Exclude()
export class CustomerNmpDetailsDto {

    mobileAppAccessNotPermitted: boolean;

    nmpTestGroup: number;
}
