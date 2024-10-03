import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('reports')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard) // Apply the JWT guard to protect the route
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-products-percentage')
  getDeletedProductsPercentage() {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get('non-deleted-products-percentage')
  getNonDeletedProductsPercentage(
    @Query('hasPrice') hasPrice: boolean,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.reportsService.getNonDeletedProductsPercentage(
      hasPrice,
      startDate,
      endDate,
    );
  }

  @Get('average-price-by-category-brand')
  getAveragePriceByCategory(
    @Query('category') category: string,
    @Query('brand') brand: string,
  ) {
    return this.reportsService.getAveragePriceByCategoryBrand(category, brand);
  }
}
