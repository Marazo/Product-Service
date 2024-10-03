import { Test, TestingModule } from '@nestjs/testing';
import { UpdateResult } from 'typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getPaginatedProducts: jest.fn(),
            removeProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should call productService.getPaginatedProducts with the correct parameters', async () => {
      const result = { total: 1, items: [] };
      jest
        .spyOn(productService, 'getPaginatedProducts')
        .mockResolvedValue(result);

      const queryParams = {
        page: 1,
        name: 'test',
        category: 'electronics',
        minPrice: 100,
        maxPrice: 500,
      };
      const response = await controller.getProducts(
        queryParams.page,
        queryParams.name,
        queryParams.category,
        queryParams.minPrice,
        queryParams.maxPrice,
      );

      expect(productService.getPaginatedProducts).toHaveBeenCalledWith(
        queryParams.page,
        queryParams.name,
        queryParams.category,
        queryParams.minPrice,
        queryParams.maxPrice,
      );
      expect(response).toEqual(result);
    });
  });

  describe('removeProduct', () => {
    it('should call productService.removeProduct with the correct id', async () => {
      const productId = '123';
      const result: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      jest.spyOn(productService, 'removeProduct').mockResolvedValue(result);

      const response = await controller.removeProduct(productId);
      expect(productService.removeProduct).toHaveBeenCalledWith(productId);
      expect(response).toEqual(result);
    });
  });
});
