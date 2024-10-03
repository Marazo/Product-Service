import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Product } from './product';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  private contentfulAPI: string;

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private configService: ConfigService,
  ) {
    const spaceId = this.configService.get<string>('CONTENTFUL_SPACE_ID');
    const environmentId = this.configService.get<string>(
      'CONTENTFUL_ENVIRONMENT',
    );
    const accessToken = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );
    const contentType = this.configService.get<string>(
      'CONTENTFUL_CONTENT_TYPE',
    );
    this.contentfulAPI = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?access_token=${accessToken}&content_type=${contentType}`;
  }

  @Cron('0 * * * *')
  async fetchDataFromContentful() {
    const { data } = await axios.get(this.contentfulAPI);

    const products = data.items.map((item) => ({
      sku: item.fields.sku,
      name: item.fields.name,
      brand: item.fields.brand,
      model: item.fields.model,
      category: item.fields.category,
      color: item.fields.color,
      price: item.fields.price,
      currency: item.fields.currency,
      stock: item.fields.stock,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
    }));

    await this.productRepository.save(products);
  }

  async getPaginatedProducts(
    page: number,
    name?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (name) query.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    if (category)
      query.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    if (minPrice) query.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('product.price <= :maxPrice', { maxPrice });

    const [items, total] = await query
      .skip((page - 1) * 5)
      .take(5)
      .getManyAndCount();

    return { total, items };
  }

  async removeProduct(id: string) {
    return this.productRepository.softDelete(id);
  }
}
