import { Type, Static } from '@sinclair/typebox';
import { db, pgp } from '../postgresDb';
import { TypeboxValidator } from '../../utils/TypeboxValidator';

export const SellerBatchRow = Type.Object({
  seller: Type.String(),
  batch: Type.String(),
});
export type SellerBatchRow = Static<typeof SellerBatchRow>;

export const sellerBatchRowValidator = new TypeboxValidator(SellerBatchRow);

export class SellerBatchConnector {
  async getBySeller(seller: string): Promise<SellerBatchRow | undefined> {
    const query = 'SELECT * FROM seller_batch WHERE seller = $(seller)';
    const sellerBatch = await db.oneOrNone(query, { seller });
    return sellerBatch ? sellerBatchRowValidator.validate(sellerBatch) : undefined;
  }

  async saveSellerBatch(sellerBatch: SellerBatchRow): Promise<void> {
    const insertColumnSet = new pgp.helpers.ColumnSet(
      ['seller', 'batch'],
      { table: 'seller_batch' }
    );
    const insertQuery = pgp.helpers.insert(sellerBatch, insertColumnSet);
    const insertQueryWithUpdate = `${insertQuery}
      ON CONFLICT (seller) DO UPDATE
      SET batch = EXCLUDED.batch`;
    await db.none(insertQueryWithUpdate);
  }
}

export const sellerBatchConnector = new SellerBatchConnector();