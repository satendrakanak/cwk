import { Injectable } from '@nestjs/common';
import { Coupon } from '../coupon.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetCouponsDto } from 'src/coupons/dtos/get-coupons.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Injectable()
export class FindAllCouponsProvider {
  constructor(
    /**
     * Inject couponRepository
     */
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,

    /**
     * Inject paginationProvider
     */
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findAllCoupons(
    getCouponsDto: GetCouponsDto,
  ): Promise<Paginated<Coupon>> {
    const couponQuery = this.couponRepository
      .createQueryBuilder('coupon')
      .orderBy('coupon.createdAt', 'DESC');

    if (getCouponsDto.search?.trim()) {
      couponQuery.andWhere('LOWER(coupon.code) LIKE :search', {
        search: `%${getCouponsDto.search.trim().toLowerCase()}%`,
      });
    }

    if (getCouponsDto.status) {
      couponQuery.andWhere('coupon.status = :status', {
        status: getCouponsDto.status,
      });
    }

    if (getCouponsDto.type) {
      couponQuery.andWhere('coupon.type = :type', {
        type: getCouponsDto.type,
      });
    }

    if (getCouponsDto.isAutoApply !== undefined) {
      couponQuery.andWhere('coupon.isAutoApply = :isAutoApply', {
        isAutoApply: getCouponsDto.isAutoApply,
      });
    }

    if (getCouponsDto.startDate) {
      couponQuery.andWhere('coupon.createdAt >= :startDate', {
        startDate: getCouponsDto.startDate,
      });
    }

    if (getCouponsDto.endDate) {
      couponQuery.andWhere('coupon.createdAt <= :endDate', {
        endDate: getCouponsDto.endDate,
      });
    }

    const result = await this.paginationProvider.paginateQueryBuilder(
      {
        limit: getCouponsDto.limit ?? 10,
        page: getCouponsDto.page ?? 1,
      },
      couponQuery,
    );

    return result;
  }
}
