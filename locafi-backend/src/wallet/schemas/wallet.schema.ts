import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ collection: 'wallets', timestamps: true })
export class Wallet {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: Number, required: true, default: 0 })
  balance: number;

  @Prop({ type: Number, required: true, default: 0 })
  dsvRewardPoints: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
