import { ApiModelProperty } from '@nestjs/swagger';

export class PatchPaymentInfoDto {
    @ApiModelProperty()
    addressId: number;

    @ApiModelProperty()
    isDefault: boolean;
}