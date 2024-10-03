import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product';

describe('ReportsService', () => {
  let reportsService: ReportsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    reportsService = module.get<ReportsService>(ReportsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return the percentage of deleted products', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(100); // total products
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(20); // deleted products

      const result = await reportsService.getDeletedProductsPercentage();

      expect(result).toEqual({ percentage: 20 });
      expect(productRepository.count).toHaveBeenCalledTimes(2);
      expect(productRepository.count).toHaveBeenCalledWith({
        where: { deletedAt: expect.anything() },
      });
    });
  });

  describe('getNonDeletedProductsPercentage', () => {
    it('should return the percentage of non-deleted products with a price in a date range', async () => {
      const hasPrice = true;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Mock for raw query
      jest
        .spyOn(productRepository, 'query')
        .mockResolvedValue([{ count: '100' }]); // total products
      // Mock for filtered products
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(80), // non-deleted products with price in date range
      } as any);

      const result = await reportsService.getNonDeletedProductsPercentage(
        hasPrice,
        startDate,
        endDate,
      );

      expect(result).toEqual({ percentage: 80 });
      expect(productRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('getAveragePriceByCategoryBrand', () => {
    it('should return the average price of products by category and brand', async () => {
      const category = 'Electronics';
      const brand = 'TestBrand';

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '100' }),
      } as any);

      const result = await reportsService.getAveragePriceByCategoryBrand(
        category,
        brand,
      );

      expect(result).toEqual({ averagePrice: 100 });
      expect(productRepository.createQueryBuilder).toHaveBeenCalled();
      expect(productRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'product.category = :category',
        { category },
      );
      expect(
        productRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith('product.brand = :brand', { brand });
    });

    it('should return 0 if no average price is found', async () => {
      const category = 'NonExistentCategory';
      const brand = 'NonExistentBrand';

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: null }),
      } as any);

      const result = await reportsService.getAveragePriceByCategoryBrand(
        category,
        brand,
      );

      expect(result).toEqual({ averagePrice: 0 });
    });
  });
});
