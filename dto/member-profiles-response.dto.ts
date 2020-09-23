import { ApiModelProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Transform } from 'class-transformer';
import { StringUtils } from '../../common/utils/string-utils';
import { transformToBoolean } from '../../common/utils';

export class MemberProfileDto {
    @ApiModelProperty()
    @Expose( { name: 'age' } )
    age: number;
    @ApiModelProperty()
    @Expose( { name: 'bottom_size' } )
    bottomSize: number;

    @ApiModelProperty()
    @Expose( { name: 'enable_autoship' } )
    @Transform( transformToBoolean )
    enableAutoShip: boolean;

    @ApiModelProperty()
    @Expose( { name: 'is_current' } )
    @Transform( transformToBoolean )
    isCurrent: boolean;

    @ApiModelProperty()
    @Expose( { name: 'gender' } )
    gender: string;

    @ApiModelProperty()
    @Expose( { name: 'membership_id' } )
    membershipId: number;

    @ApiModelProperty()
    @Expose( { name: 'membership_profile_id' } )
    membershipProfileId: number;

    @ApiModelProperty()
    @Expose( { name: 'primary_personality_type_tag_id' } )
    primaryPersonalityTypeTagId: number;

    @ApiModelProperty()
    @Expose( { name: 'name' } )
    name: string;

    @ApiModelProperty()
    @Expose( { name: 'top_size' } )
    topSize: number;

    static getInstance = ( result: any ): MemberProfileDto => {
        const dto: MemberProfileDto = plainToClass<MemberProfileDto, object>( MemberProfileDto, StringUtils.toLowerCaseKeys( result ) );
        return dto;
    }

    static getInstances = ( profiles: Array<any> ): Array<MemberProfileDto> => {
        return profiles.map( MemberProfileDto.getInstance );
    }
}

export class MemberProfilesResponseDto {

    @ApiModelProperty()
    @Expose( { name: 'age' } )
    age: number;
    @ApiModelProperty()
    @Expose( { name: 'age_group_id' } )
    ageGroupId: number;
    @ApiModelProperty()
    @Expose( { name: 'enable_autoship' } )
    @Transform( transformToBoolean )
    enableAutoShip: boolean;
    @ApiModelProperty()
    @Expose( { name: 'has_taken_quiz' } )
    @Transform( transformToBoolean )
    hasTakenQuiz: boolean;
    @ApiModelProperty()
    @Expose( { name: 'gender' } )
    gender: string;
    @ApiModelProperty()
    @Expose( { name: 'membership_id' } )
    membershipId: number;
    @ApiModelProperty()
    @Expose( { name: 'membership_profile_id' } )
    membershipProfileId: number;
    @ApiModelProperty()
    @Expose( { name: 'membership_plan_id' } )
    membershipPlanId: number;
    @ApiModelProperty()
    @Expose( { name: 'primary_personality_type_tag_id' } )
    primaryPersonalityTypeTagId: number;
    @Expose( { name: 'primary_personality_type' } )
    primaryPersonalityType: string;
    @ApiModelProperty()
    @Expose( { name: 'product_option_profile_id' } )
    productOptionProfileId: number;
    @ApiModelProperty()
    @Expose( { name: 'name' } )
    name: string;
    @ApiModelProperty( { isArray: true, type: MemberProfileDto  } )
    @Expose( { name: 'all_profiles' } )
    allProfiles: Array<MemberProfileDto>;

    static getInstance = ( result: any ): MemberProfilesResponseDto => {
        const dto: MemberProfilesResponseDto = plainToClass<MemberProfilesResponseDto, object>( MemberProfilesResponseDto, StringUtils.toLowerCaseKeys(result) );
        dto.allProfiles = result.all_profiles ? MemberProfileDto.getInstances( result.all_profiles ) : [] ;
        return dto;
    }
}