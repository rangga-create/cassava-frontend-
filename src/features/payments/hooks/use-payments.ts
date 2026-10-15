"use client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { paymentsService } from "../services/payments.service";
import type { CreatePaymentData } from "../services/payments.service";

export function usePayment(salesOrderId?: string) {
  const queryClient = useQueryClient();

  const { data: paymentStatus } = useQuery({
    queryKey: ["payment", salesOrderId],
    queryFn: () => paymentsService.getStatus(salesOrderId!),
    enabled: !!salesOrderId,
  });

  const createPayment = useMutation({
    mutationFn: paymentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  return {
    paymentStatus,
    createPayment: createPayment.mutateAsync,
    isCreating: createPayment.isPending,
  };
}
