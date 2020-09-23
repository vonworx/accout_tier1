import { ApiModelProperty } from '@nestjs/swagger';

export class AdyenPaymentSessionRequestDto {

    @ApiModelProperty( { description: 'The Adyen token from the iOS sdk used to initialize the payment session'} )
    token: string;

    @ApiModelProperty( { description: 'The amount to authorize for the transaction'} )
    amount: number;

    @ApiModelProperty( { description: 'The url to return to. For iOS sdk would be the URL scheme of the app. (eg. `justfab://`)' } )
    returnUrl: string;

    @ApiModelProperty( { description: 'Initialize a payment session for adding a payment method for the purpose of testing orders', default: false })
    testOrder: boolean;

}