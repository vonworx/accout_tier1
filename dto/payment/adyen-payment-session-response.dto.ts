import { ApiModelProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class AdyenPaymentSessionResponseDto {

    @ApiModelProperty( { description: 'The paymentSession identifier generated by Adyen'} )
    @Expose( { name: 'payment_session' })
    paymentSession: string;

}