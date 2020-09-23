import { Exclude, Expose } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

export enum CCPARequestType {
    Account_Deletion = 1,
    Data_Export = 2,
    Opt_Out = 4
}

@Exclude()
export class CCPAResponseDto {
    @ApiModelProperty()
    @Expose( { name: 'request_id' } )
    requestId: number;

    @ApiModelProperty()
    @Expose( { name: 'confirmation_code' } )
    confirmationCode: number;

    @ApiModelProperty( {description: 'Returns false if a previous request had been submitted for the email'} )
    @Expose( { name: 'is_new' } )
    isNew: boolean;
}

export class CCPARequestDto {
    @ApiModelProperty({description: 'User\'s email', required: true})
    email: string;

    @ApiModelProperty({description: 'User\'s first name ', required: false})
    firstname: string;

    @ApiModelProperty({description: 'User\'s last name', required: false})
    lastname: string;

    @ApiModelProperty({description: '1 = Europe, 2 = US', type: Number, required: false, default: 2})
    regionId: string;

    @ApiModelProperty({description: '1 = Live Agent, 2 = Live Chat, 3 = Web Form', type: Number, required: false, default: 3})
    requestSourceId: string;

    @ApiModelProperty({description: 'One of the valid request types: 1 = Account Deletion, 2 = Data Export, 3 = Opt-Out', required: true})
    requestTypeId: number;

    toRpcParams(): any {
        const params: any = {};

        if (this.email){
            params.email = this.email;
        }
        if (this.firstname){
            params.firstname = this.firstname;
        }
        if (this.lastname){
            params.lastname = this.lastname;
        }
        if (this.requestTypeId){
            params.request_type_id = this.requestTypeId;
        }
        if (this.requestSourceId){
            params.request_source_id = this.requestSourceId;
        }
        if (this.regionId){
            params.region_id = this.regionId;
        }
        return params;
    }
}