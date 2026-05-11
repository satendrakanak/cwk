export enum CouponType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export enum CouponScope {
  GLOBAL = "GLOBAL",
  COURSE = "COURSE",
}

export enum CouponStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
}
export type Coupon = {
  id: number;

  code: string;

  type: CouponType;

  value: number;

  maxDiscount?: number;

  minOrderValue?: number;

  scope: CouponScope;

  applicableCourseIds?: number[];

  isAutoApply: boolean;

  usageLimit?: number;

  usedCount: number;

  perUserLimit: number;

  validFrom: string;
  validTill: string;

  status: CouponStatus;

  createdAt: string;
  updatedAt: string;

  deletedAt?: string | null;
};

export type CreateCouponPayload = {
  code: string;

  type?: CouponType;

  value?: number;

  maxDiscount?: number;
  minOrderValue?: number;

  scope?: CouponScope;

  applicableCourseIds?: number[] | null;

  isAutoApply?: boolean;

  usageLimit?: number;
  perUserLimit?: number;

  validFrom?: Date | null;
  validTill?: Date | null;

  status?: CouponStatus;

  meta?: Record<string, any>;
};

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

export type AutoApplyCouponPayload = {
  cartTotal: number;
  courseIds: number[];
};

export type ApplyCouponPayload = {
  code: string;
  cartTotal: number;
  courseIds: number[];
};

export type CouponApplyResponse = {
  couponId: number;
  code: string;
  discount: number;
  finalAmount: number;
};

export type CouponMap = Record<number, CouponApplyResponse | null>;
