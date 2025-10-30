
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  imageUrl: string;

  @Prop()
  amount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
