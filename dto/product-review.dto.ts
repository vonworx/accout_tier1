import { ApiModelProperty } from '@nestjs/swagger';
import { ProductItemDto } from './product-item.dto';
import { Exclude, Expose } from 'class-transformer';

export class ProductReviewDto {

    @ApiModelProperty()
    product: ProductItemDto;

    @ApiModelProperty()
    overallRating: number;

    @ApiModelProperty()
    comfortRating: number;

    @ApiModelProperty()
    supportRating: number;

    @ApiModelProperty()
    recommend: boolean;

    @ApiModelProperty()
    title: string;

    @ApiModelProperty()
    description: string;

    @ApiModelProperty()
    yesVotes: number;

    @ApiModelProperty()
    noVotes: number;

}

export class ReviewImageUploadDto {

    @ApiModelProperty({description: 'base64 image data url'})
    base64DataUrl: string;

}

@Exclude()
export class ReviewImageResponseDto {

    @ApiModelProperty()
    @Expose({name: 'imagename'})
    imageName: string;

    @ApiModelProperty()
    @Expose({name: 'thumbimagename'})
    thumbImageName: string;

}