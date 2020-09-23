import { ApiModelProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class MemberStatusRequestDto {

    @IsIn( [ 'cancel' ] )
    @ApiModelProperty( { description: 'The status to change the current logged in members status to. Available value is only \'cancel\'', required: true } )
    status: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiModelProperty( { description: 'Reason code for the status change as chosen by the member when changing their membership status', required: true } )
    reasonId: number;

}