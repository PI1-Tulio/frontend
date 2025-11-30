type BaseInstruction = {
  id: number;
  actuallyExecuted: number;
  startTime: string;
  endTime: string;
  deliveryId: number;
};

export type Instruction = BaseInstruction & ({
  action: 'MOVE';
  value: number;
} | {
  action: 'TURN';
  value: 1 | 0;
});

export interface Delivery {
  id: number;
  name: string;
  potL: number;
  potR: number;
  startTime: string;
  endTime: string;
}

export type DeliveryWithInstructions = Delivery & {
  instructions: Instruction[]
}

export type CreateInstructionDTO = {
  action: 'MOVE';
  value: number;
} | {
  action: 'TURN';
  value: 1 | 0;
};

export interface CreateDeliveryDTO {
  name: string;
  potL: number;
  potR: number;
  instructions: CreateInstructionDTO[];
}