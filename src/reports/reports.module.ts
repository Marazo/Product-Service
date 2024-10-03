import { Module } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Product } from 'src/product/product';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
