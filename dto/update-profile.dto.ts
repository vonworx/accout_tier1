import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateProfileDto {

    @ApiModelProperty()
    persona: string;

    @ApiModelProperty()
    firstName: string;

    @ApiModelProperty()
    lastName: string;

    @ApiModelProperty()
    email: string;

    @ApiModelProperty()
    company: string;

    @ApiModelProperty({description: 'Associative array of profile information'})
    profile: object;

}