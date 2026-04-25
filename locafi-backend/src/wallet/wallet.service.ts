import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  /**
   * Returns the wallet for {@link userId}, creating one with zero balance and points if missing.
   * Atomic with upsert, safe under concurrent first requests.
   */
  async findOrCreate(
    userId: string,
    profile?: { name: string; email: string; passwordHash: string },
  ): Promise<WalletDocument> {
    if (!profile) {
      const existing = await this.walletModel.findOne({ userId }).exec();
      if (existing) {
        return existing;
      }
      throw new NotFoundException(`Wallet not found for userId: ${userId}`);
    }

    return this.walletModel
      .findOneAndUpdate(
        { userId },
        {
          $setOnInsert: {
            userId,
            name: profile.name,
            email: profile.email.toLowerCase(),
            password: profile.passwordHash,
            balance: 246.5,
            dsvRewardPoints: 0,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();
  }

  async findByEmail(email: string): Promise<WalletDocument | null> {
    return this.walletModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async createFromRegistration(input: {
    userId: string;
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<WalletDocument> {
    const wallet = new this.walletModel({
      userId: input.userId,
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.passwordHash,
      balance: 246.5,
      dsvRewardPoints: 0,
    });
    return wallet.save();
  }

  /**
   * Atomically deducts {@link amount} from balance and adjusts reward points by {@link points}
   * (typically positive when awarding points). Runs in a Mongo transaction for integrity.
   */
  async deductBalance(userId: string, amount: number, points: number): Promise<WalletDocument> {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('amount must be a non-negative finite number');
    }
    if (!Number.isFinite(points)) {
      throw new BadRequestException('points must be a finite number');
    }

    const session = await this.walletModel.db.startSession();
    try {
      let updatedWallet: WalletDocument | null = null;
      await session.withTransaction(async () => {
        const wallet = await this.walletModel.findOne({ userId }).session(session).exec();
        if (!wallet) {
          throw new NotFoundException(`Wallet not found for userId: ${userId}`);
        }
        if (wallet.balance < amount) {
          throw new BadRequestException('Insufficient balance');
        }

        updatedWallet = await this.walletModel
          .findOneAndUpdate(
            { userId },
            {
              $inc: {
                balance: -amount,
                dsvRewardPoints: Math.round(points),
              },
            },
            { new: true, runValidators: true, session },
          )
          .exec();
      });

      if (!updatedWallet) {
        throw new NotFoundException(`Wallet not found for userId: ${userId}`);
      }
      return updatedWallet;
    } finally {
      await session.endSession();
    }
  }

  async claimOffer(input: {
    userId: string;
    title: string;
    merchantName: string;
    amount: number;
    points: number;
  }): Promise<WalletDocument> {
    if (!input.userId?.trim()) {
      throw new BadRequestException('userId is required');
    }
    if (!input.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    if (!input.merchantName?.trim()) {
      throw new BadRequestException('merchantName is required');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException('amount must be a positive finite number');
    }
    if (!Number.isFinite(input.points)) {
      throw new BadRequestException('points must be a finite number');
    }

    const session = await this.walletModel.db.startSession();
    try {
      let updatedWallet: WalletDocument | null = null;
      await session.withTransaction(async () => {
        const wallet = await this.walletModel.findOne({ userId: input.userId }).session(session).exec();
        if (!wallet) {
          throw new NotFoundException(`Wallet not found for userId: ${input.userId}`);
        }

        if (wallet.balance < input.amount) {
          throw new BadRequestException('Insufficient balance');
        }

        updatedWallet = await this.walletModel
          .findOneAndUpdate(
            { userId: input.userId },
            {
              $inc: {
                balance: -input.amount,
                dsvRewardPoints: Math.round(input.points),
              },
            },
            { new: true, runValidators: true, session },
          )
          .exec();

        await this.transactionModel.create(
          [
            {
              userId: input.userId,
              title: input.title,
              merchantName: input.merchantName,
              amount: input.amount,
              timestamp: new Date(),
            },
          ],
          { session },
        );
      });

      if (!updatedWallet) {
        throw new NotFoundException(`Wallet not found for userId: ${input.userId}`);
      }
      return updatedWallet;
    } finally {
      await session.endSession();
    }
  }
}
