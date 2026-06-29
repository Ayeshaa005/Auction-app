import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  @MinLength(1)
  auctionId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}
