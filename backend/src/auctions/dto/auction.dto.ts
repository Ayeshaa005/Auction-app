import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  Min,
} from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  startPrice!: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsDateString()
  endsAt!: string;
}

export class UpdateAuctionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
