import { Controller, Get, Query, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get products paginated data.' })
  @ApiQuery({ required: false, name: 'page' })
  @ApiQuery({ required: false, name: 'name' })
  @ApiQuery({ required: false, name: 'category' })
  @ApiQuery({ required: false, name: 'minPrice' })
  @ApiQuery({ required: false, name: 'maxPrice' })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productService.getPaginatedProducts(
      page,
      name,
      category,
      minPrice,
      maxPrice,
    );
  }

  @Delete(':id')
  async removeProduct(@Param('id') id: string) {
    return this.productService.removeProduct(id);
  }
}
