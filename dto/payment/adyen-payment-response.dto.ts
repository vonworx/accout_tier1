import { ApiModelProperty } from '@nestjs/swagger';

export class AdyenPaymentResponseDto {

    @ApiModelProperty({description: 'The pspId created'})
    pspId: number;
}