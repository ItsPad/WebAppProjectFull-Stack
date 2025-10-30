import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsString()
    readonly name: string;
    @IsNumber()
    readonly price: number;
    @IsOptional()
    @IsString()
    readonly description?: string;
    @IsOptional()
    @IsString()
    readonly imageUrl?: string;
    @IsNumber()
    readonly amount: number;
}
