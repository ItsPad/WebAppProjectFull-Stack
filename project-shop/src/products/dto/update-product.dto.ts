import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    readonly name: string;
    @IsOptional()
    @IsNumber()
    readonly price: number;
    @IsOptional()
    @IsString()
    readonly desc?: string;
    @IsOptional()
    @IsString()
    readonly image?: string;
}