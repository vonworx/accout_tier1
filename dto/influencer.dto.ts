import { Exclude, Expose } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class InfluencerDto {
    @ApiModelProperty()
    @Expose({name: 'promo_name'})
    promoName: string;

    @ApiModelProperty()
    @Expose({name: 'user_has_active_promo'})
    userHasActivePromo: boolean;

    @ApiModelProperty()
    @Expose({name: 'max_product_qty'})
    maxProductQty: number;

    @ApiModelProperty()
    @Expose({name: 'tier'})
    tier: string;

}

@Exclude()
export class InfluencerPWResetRequiredResponseDto {
    @ApiModelProperty()
    @Expose({name: 'reset_required'})
    resetRequired: boolean;

    @ApiModelProperty()
    @Expose({name: 'email'})
    email: string;

    @ApiModelProperty()
    @Expose({name: 'full_name'})
    fullName: string;

}
