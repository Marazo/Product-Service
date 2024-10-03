import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';

import { Product } from '../product/product';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const totalProducts = await this.productRepository.count();
    const deletedProducts = await this.productRepository.count({
      where: { deletedAt: Not(IsNull()) },
    }); // Assuming soft delete is implemented

    const percentage = (deletedProducts / totalProducts) * 100;
    return { percentage };
  }

  // Calculate percentage of non-deleted products with or without price and within a custom date range
  async getNonDeletedProductsPercentage(
    hasPrice: boolean,
    startDate: Date,
    endDate: Date,
  ): Promise<{ percentage: number }> {
    const query = await this.productRepository.query(`
      SELECT count(*) 
      FROM product
      where ${hasPrice ? 'product.price IS NOT NULL' : 'product.price IS NULL'}
      and product."createdAt" BETWEEN '${startDate}' AND '${endDate}';
    `);

    const filteredProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL')
      .andWhere(
        hasPrice ? 'product.price IS NOT NULL' : 'product.price IS NULL',
      )
      .andWhere('product.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const totalProducts = query[0].count;
    const percentage = (filteredProducts / totalProducts) * 100;
    return { percentage };
  }

  async getAveragePriceByCategoryBrand(
    category: string,
    brand: string,
  ): Promise<{ averagePrice: number }> {
    const { avg } = await this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'avg')
      .where('product.category = :category', { category })
      .andWhere('product.brand = :brand', { brand })
      .andWhere('product.price IS NOT NULL')
      .andWhere('product.deletedAt IS NULL')
      .getRawOne();

    return { averagePrice: parseFloat(avg) || 0 };
  }
}
