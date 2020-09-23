import { ApiModelProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { Transform, Expose } from 'class-transformer';
import { DeviceDetailDto } from '../../../common/dto/device-info.dto';

export class AdyenPaymentRequestDto {

    @ApiModelProperty({description: 'The Adyen client-side tokenized card data'})
    cardToken: string;

    @IsIn(['web', 'ios'])
    @ApiModelProperty( { description: 'The sdk that generated the token. Options are `web` or `ios`', default: 'web'})
    @Transform(value => value || 'web', { toClassOnly: true })
    @Expose()
    tokenSdk: string;

    @ApiModelProperty({description: 'Device Info for 3ds2', required: false})
    deviceDetail: DeviceDetailDto;
}