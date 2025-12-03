import { AxiosError } from "axios";
import { api } from "./client";
import type { CreateDeliveryDTO, Delivery, DeliveryWithInstructions } from "./DeliveryDTO";


export async function createDelivery(createDeliveryDTO: CreateDeliveryDTO): Promise<Delivery> {
  const { data } = await api.post<Delivery>("/delivery", createDeliveryDTO);
  return data;
}

export async function resendDelivery(deliveryId: number) {
  await api.post(`/delivery/resend/${deliveryId}`);
}

export async function getDeliveryById(id: number): Promise<DeliveryWithInstructions | undefined> {
  try {
    const { data } = await api.get<DeliveryWithInstructions>(`/delivery/${id}`);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 404) {
        return undefined;
      }
    }

    throw err;
  }
}

export async function listDeliveries(): Promise<Delivery[]> {
  const { data } = await api.get<Delivery[]>("/deliveries");
  return data;
}