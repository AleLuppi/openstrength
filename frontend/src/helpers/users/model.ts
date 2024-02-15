/*****************/
/** USER CONFIG **/
/*****************/

/**
 * User Config interface.
 *
 * This holds unmutable info to manage user.
 */
export interface UserConfig {
  /**
   * History of payments by user.
   */
  payments: UserConfigPayment[];

  /**
   * Hold current user subscription plan.
   */
  subscription?: UserConfigSubscription;

  /**
   * Define access level, that is what user can access within the app.
   * The lower, the more user can access.
   */
  accessLevel: null | undefined | 1 | 2 | 3 | 4 | 5;
}

/**
 * User Config Payment interface.
 *
 * Single user payment info.
 */
interface UserConfigPayment {
  /**
   * Amount paid.
   */
  price: number;

  /**
   * Reference currency.
   */
  currency: "eur" | "usd";

  /**
   * Payment date.
   */
  date: Date;

  /**
   * Payment method.
   */
  paymentMethod: "creditCard" | "debitCard" | "bankTransfer" | "other";

  /**
   * Tool used to allow payment.
   */
  tool: null | "paypal" | "stripe";

  /**
   * Whether payment tool approved the money transfer.
   */
  approved: boolean;

  /**
   * Optional subscription enabled by the payment.
   */
  subscription: string | null;
}

/**
 * User Config Subscription interface.
 *
 * Current user subscription info.
 */
interface UserConfigSubscription {
  /**
   * Reference name to identify subscription.
   */
  label: string;

  /**
   * Subscription price.
   */
  price: number;

  /**
   * Reference currency.
   */
  currency: "eur" | "usd";

  /**
   * How many months elapse between payments.
   * If <= 0, it is considered as a non-recurrent payment (no subscription).
   * Use 1200 months (100 years) for lifetime subscription.
   */
  recurrence: number;

  /**
   * Date when last payment occurred.
   */
  renewalDate: Date;

  /**
   * Next payment due date.
   * Should match renewal date + recurrence.
   */
  expiringDate: Date;
}
