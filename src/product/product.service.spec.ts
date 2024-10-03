import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { Product } from './product';
import axios from 'axios';

jest.mock('axios');

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
            }),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaginatedProducts', () => {
    it('should return paginated products', async () => {
      const result: Product[] = [
        {
          id: '1',
          sku: '12345',
          name: 'Test Product',
          brand: 'Test Brand',
          model: 'Model 1',
          category: 'Test Category',
          color: 'Red',
          price: 100,
          currency: 'USD',
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      jest
        .spyOn(productRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue([result, 1]);

      const response = await service.getPaginatedProducts(
        1,
        'Test',
        'Category',
        100,
        500,
      );

      expect(response).toEqual({ total: 1, items: result });
    });
  });

  describe('removeProduct', () => {
    it('should call softDelete on productRepository', async () => {
      const result: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      jest.spyOn(productRepository, 'softDelete').mockResolvedValue(result);

      const response = await service.removeProduct('1');
      expect(productRepository.softDelete).toHaveBeenCalledWith('1');
      expect(response).toEqual(result);
    });
  });

  describe('fetchDataFromContentful', () => {
    it('should fetch data from Contentful and save it to the database', async () => {
      const mockData = {
        items: [
          {
            fields: {
              sku: '123',
              name: 'Test Product',
              brand: 'Test Brand',
              model: 'Model 1',
              category: 'Test Category',
              color: 'Red',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
            sys: { createdAt: new Date(), updatedAt: new Date() },
          },
        ],
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });
      jest.spyOn(productRepository, 'save');

      await service.fetchDataFromContentful();

      expect(axios.get).toHaveBeenCalledWith(expect.any(String));
      expect(productRepository.save).toHaveBeenCalledWith(
        mockData.items.map((item) => ({
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
        })),
      );
    });
  });
});
