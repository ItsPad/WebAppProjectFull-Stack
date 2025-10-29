import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://patape6742_db_user:pzO0KDwfuiHVxyQx@cluster0.hqijale.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
