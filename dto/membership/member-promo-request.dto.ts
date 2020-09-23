import { ApiModelProperty } from '@nestjs/swagger';

export class MemberPromoRequestDto {

    @ApiModelProperty()
    promoCode: string;

    @ApiModelProperty()
    promoTypeId: number;

    @ApiModelProperty({type: String, format: 'date-time'})
    startDate: Date;

    @ApiModelProperty({type: String, format: 'date-time'})
    endDate: Date;

    @ApiModelProperty()
    allowSamePromoType: boolean;

}