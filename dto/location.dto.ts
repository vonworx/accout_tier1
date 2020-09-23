import { Exclude, Expose  } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class LocationDto {

  @ApiModelProperty()
  latitude: number;

  @ApiModelProperty()
  longitude: number;

}

@Exclude()
export class GeoPointDto {

  @ApiModelProperty()
  degLat: number;

  @ApiModelProperty()
  degLon: number;

  @ApiModelProperty()
  radLat: number;

  @ApiModelProperty()
  radLon: number;

}
