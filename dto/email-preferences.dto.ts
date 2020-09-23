import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, Expose, plainToClass } from 'class-transformer';

@Exclude()
export class EmailPreferencesDto {

    @ApiModelProperty({description: 'Email opt out status. Possible values \'none\', \'all\', \'basic\', \'blast\'', required: true})
    @Expose({name: 'optout_email'})
    optOutStatus: string;

    @ApiModelPropertyOptional({description: 'The email lists the user belongs to', isArray: true, type: String, default: []})
    @Transform(attrs => { const lists = []; for (const l in attrs) { lists.push(l); } return lists; })
    @Expose({name: 'lists'})
    lists: string[];

    @ApiModelPropertyOptional({description: 'Associative array with key/value pairs that are stored with this contact', default: {}})
    @Expose({name: 'vars'})
    vars: object;

    @ApiModelPropertyOptional({description: 'Associative array with key/value pairs that are stored with this contact', default: {}})
    @Expose({name: 'keys'})
    keys: object;

    @ApiModelPropertyOptional({description: 'The users engagement level', default: ''})
    @Expose({name: 'engagement'})
    engagement: string;

    @ApiModelPropertyOptional({description: 'Most used device when opening email', default: ''})
    @Expose({name: 'device'})
    device: string;

    @ApiModelPropertyOptional({description: 'Users purchases', isArray: true, type: Object})
    @Expose({name: 'purchases'})
    purchases: {}[];

    @ApiModelPropertyOptional({description: 'Users last incomplete purchase'})
    @Expose({name: 'purchase_incomplete'})
    purchaseIncomplete: any;

    @ApiModelPropertyOptional({description: 'Recent user activity', default: {}})
    @Expose({name: 'activity'})
    activity: any;

    @ApiModelPropertyOptional({description: 'User activity metrics over their lifetime', default: {}})
    @Expose({name: 'lifetime'})
    lifetime: any;

    @ApiModelPropertyOptional({description: 'Smart lists the user belongs to', isArray: true, type: String})
    @Expose({name: 'smart_lists'})
    smartLists: string[];

    constructor() {

    }

    static fromRpcResponse(obj: object): EmailPreferencesDto {
        return plainToClass(EmailPreferencesDto, obj);
    }

}