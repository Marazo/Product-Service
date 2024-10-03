import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/auth.guard';

describe('ReportsController', () => {
  let reportsController: ReportsController;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getDeletedProductsPercentage: jest.fn(),
            getNonDeletedProductsPercentage: jest.fn(),
            getAveragePriceByCategoryBrand: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Override guard for testing without actual authentication
      .useValue({ canActivate: jest.fn(() => true) }) // Mock canActivate to always return true
      .compile();

    reportsController = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return the deleted products percentage', async () => {
      const result = { percentage: 50 };
      jest
        .spyOn(reportsService, 'getDeletedProductsPercentage')
        .mockResolvedValue(result);

      expect(await reportsController.getDeletedProductsPercentage()).toEqual(
        result,
      );
      expect(reportsService.getDeletedProductsPercentage).toHaveBeenCalled();
    });
  });

  describe('getNonDeletedProductsPercentage', () => {
    it('should return the non-deleted products percentage', async () => {
      const result = { percentage: 75 };
      const hasPrice = true;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      jest
        .spyOn(reportsService, 'getNonDeletedProductsPercentage')
        .mockResolvedValue(result);

      expect(
        await reportsController.getNonDeletedProductsPercentage(
          hasPrice,
          startDate,
          endDate,
        ),
      ).toEqual(result);

      expect(
        reportsService.getNonDeletedProductsPercentage,
      ).toHaveBeenCalledWith(hasPrice, startDate, endDate);
    });
  });

  describe('getAveragePriceByCategory', () => {
    it('should return the average price by category and brand', async () => {
      const result = { averagePrice: 100 };
      const category = 'Electronics';
      const brand = 'TestBrand';

      jest
        .spyOn(reportsService, 'getAveragePriceByCategoryBrand')
        .mockResolvedValue(result);

      expect(
        await reportsController.getAveragePriceByCategory(category, brand),
      ).toEqual(result);

      expect(
        reportsService.getAveragePriceByCategoryBrand,
      ).toHaveBeenCalledWith(category, brand);
    });
  });
});
