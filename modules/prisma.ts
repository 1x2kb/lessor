/* eslint-disable max-classes-per-file */
import { PrismaClient, Prisma as PrismaNS } from '@prisma/client';

export class NumberError extends Error {
  e164: string;

  constructor(e164: string, message: string) {
    super(`${e164} ${message}`);
    this.e164 = e164;
  }
}

export class NumberLeasedError extends NumberError {
  constructor(e164: string) {
    super(e164, 'is already leased');
  }
}

export class NumberNotFoundError extends NumberError {
  constructor(e164: string) {
    super(e164, 'was not found');
  }
}

export class NumberNotLeasedError extends NumberError {
  constructor(e164: string) {
    super(e164, 'is not leased');
  }
}

export default class Prisma {
  client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  async getAllNumbers() {
    return this.client.number.findMany();
  }

  async getAvailableE164(): Promise<string | undefined> {
    // TODO: should be where lease IS NULL OR lease.expiresAt < now
    const number = await this.client.number.findFirst({
      where: { lease: { is: null } },
      select: { e164: true },
    });

    return number?.e164;
  }

  async leaseE164(e164: string, wallet: string, expiresAt: Date) {
    // For now, this is "find-or-create" (https://github.com/prisma/docs/issues/640)
    const number = await this.client.number.upsert({
      where: { e164 },
      update: {},
      create: { e164 },
    });

    if (number.leaseId) throw new NumberLeasedError(e164);

    const lessee = await this.client.lessee.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
    });

    await this.client.lease.create({
      data: {
        expiresAt,
        lessee: {
          connect: {
            id: lessee.id,
          },
        },
        number: {
          connect: {
            id: number.id,
          },
        },
      },
    });
  }

  async storeMessage(
    sentToE164: string,
    sentFromE164: string,
    sentAt: Date,
    body: string
  ) {
    const number = await this.getNumber(sentToE164);
    if (!number.lease) return; // this is just to make eslint happy

    const { lessee } = number.lease;
    await this.client.message.create({
      data: {
        lesseeId: lessee.id,
        sentAt,
        sentToE164,
        sentFromE164,
        body,
      },
    });
  }

  async retrieveMessages(e164: string, unread = false) {
    const number = await this.getNumber(e164);

    const conditions: PrismaNS.MessageWhereInput = {
      lesseeId: number.lease?.lesseeId,
    };

    if (unread) conditions.isRead = false;

    return this.client.message.findMany({ where: conditions });
  }

  async getNumber(e164: string) {
    const number = await this.client.number.findUnique({
      where: { e164 },
      include: {
        lease: {
          include: {
            lessee: true,
          },
        },
      },
    });

    if (!number) throw new NumberNotFoundError(e164);
    if (!number.lease) throw new NumberNotLeasedError(e164);

    return number;
  }
}
