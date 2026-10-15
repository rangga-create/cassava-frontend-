import { api } from "@/services/api";

export interface CreatePaymentData {
  salesOrderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
}

export interface PaymentStatusResponse {
  status: string;
  paymentId: string;
}

export const paymentsService = {
  create: async (data: CreatePaymentData) => {
    const response = await api.payments.create(data);
    return response.data;
  },
  getStatus: async (salesOrderId: string) => {
    const response = await api.payments.status(salesOrderId);
    return response.data as PaymentStatusResponse | null;
  },
};
