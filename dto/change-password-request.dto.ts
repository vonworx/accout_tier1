import { ApiModelProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDto {

    @ApiModelProperty({description: 'The users new password'})
    password: string;

}