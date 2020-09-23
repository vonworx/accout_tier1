import { Exclude, Expose, plainToClass } from 'class-transformer';

import { ApiModelProperty } from '@nestjs/swagger';
import { StringUtils } from '../../common/utils/string-utils';

@Exclude()
export class TrackingDto {
    @ApiModelProperty()
    @Expose( { name: 'tracking_number' } )
    trackingNumber: string;
    @ApiModelProperty()
    @Expose( { name: 'tracking_url' } )
    trackingUrl: string;

    static getInstance ( result: object ): TrackingDto {
        return plainToClass<TrackingDto, object>( TrackingDto, StringUtils.toLowerCaseKeys( result ) );
    }
}