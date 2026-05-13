/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import {
  fetchPrintfullProducts,
  createDesignFile,
  createPrintfullOrder,
  getPrintfullOrder,
  type CreateOrderInput,
  type EstimateItem,
  estimateOrder,
} from "../_core/printfullService";

export const merchRouter = router({
  // Sync Printfull catalog into our database
  sync: adminProcedure.mutation(async () => {
    try {
      const products = await fetchPrintfullProducts();

      // Store in database
      for (const product of products) {
        await db.createOrUpdatePrintfullProduct({
          productId: product.id,
          name: product.name,
          category: product.category,
          imageUrl: product.image,
          variants: JSON.stringify(product.variants),
          price: product.price.toString(),
        });
      }

      return {
        success: true,
        count: products.length,
        message: `Synced ${products.length} products from Printfull`,
      };
    } catch (error: unknown) {
      console.error("[Merch] Sync error:", error);
      const message = error instanceof Error ? error.message : "Failed to sync Printfull catalog";
      throw new Error(message);
    }
  }),

  // Get synced merch catalog
  catalog: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await db.getPrintfullProducts({
          category: input.category,
          limit: input.limit,
          offset: input.offset,
        });

        return products;
      } catch (error: unknown) {
        console.error("[Merch] Catalog error:", error);
        throw new Error("Failed to fetch merch catalog");
      }
    }),

  // Assign a product to a Printfull variant
  assignToProduct: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        printfullProductId: z.number(),
        merchCategory: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await db.updateProductMerchLink({
          productId: input.productId,
          printfullProductId: input.printfullProductId,
          merchCategory: input.merchCategory,
        });

        if (!success) {
          throw new Error("Product not found");
        }

        return { success: true };
      } catch (error: unknown) {
        console.error("[Merch] Assignment error:", error);
        throw new Error((error instanceof Error ? error.message : "Failed to assign product"));
      }
    }),

  // Unlink a product from Printfull
  unlink: adminProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.updateProductMerchLink({
          productId: input.productId,
          printfullProductId: null,
          merchCategory: null,
        });

        return { success: true };
      } catch (error: unknown) {
        console.error("[Merch] Unlink error:", error);
        throw new Error("Failed to unlink product");
      }
    }),

  // Create a Printfull order after payment
  createOrder: adminProcedure
    .input(
      z.object({
        purchaseId: z.number(),
        printfullProductId: z.number(),
        variantId: z.number(),
        quantity: z.number().min(1).default(1),
        shippingAddress: z.object({
          address1: z.string(),
          address2: z.string().optional(),
          city: z.string(),
          postalCode: z.string(),
          country: z.string(),
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
        }),
        shippingMethod: z.enum(["standard", "express", "international"]).default("standard"),
        designUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Create design file if image provided
        let designId: number | undefined;
        if (input.designUrl) {
          const design = await createDesignFile(input.designUrl, "DJ Danny Design");
          designId = design.id;
        }

        // Create order on Printfull
        const orderInput: CreateOrderInput = {
          items: [
            {
              product_id: input.printfullProductId,
              variant_id: input.variantId,
              quantity: input.quantity,
              design_id: designId,
              product_name: "DJ Danny Merch",
            },
          ],
          shippingAddress: input.shippingAddress,
          shippingMethod: input.shippingMethod,
        };

        const printfullOrder = await createPrintfullOrder(orderInput);

        // Store merch order in database
        const merchOrder = await db.createMerchOrder({
          purchaseId: input.purchaseId,
          printfullOrderId: printfullOrder.id,
          status: "submitted",
          trackingNumber: printfullOrder.tracking_number,
          trackingUrl: printfullOrder.tracking_url,
          shippingAddress: JSON.stringify(input.shippingAddress),
          items: JSON.stringify(orderInput.items),
        });

        return {
          success: true,
          merchOrderId: merchOrder,
          printfullOrderId: printfullOrder.id,
          trackingNumber: printfullOrder.tracking_number,
        };
      } catch (error: unknown) {
        console.error("[Merch] Order creation error:", error);
        throw new Error((error instanceof Error ? error.message : "Failed to create merch order"));
      }
    }),

  // Check order status
  checkStatus: adminProcedure
    .input(z.object({ merchOrderId: z.number() }))
    .query(async ({ input }) => {
      try {
        const order = await db.getMerchOrder(input.merchOrderId);
        if (!order || !order.printfullOrderId) {
          throw new Error("Order not found");
        }

        const printfullOrder = await getPrintfullOrder(order.printfullOrderId);

        // Update status in database
        await db.updateMerchOrderStatus(
          input.merchOrderId,
          printfullOrder.status,
          printfullOrder.tracking_number,
          printfullOrder.tracking_url
        );

        return {
          status: printfullOrder.status,
          trackingNumber: printfullOrder.tracking_number,
          trackingUrl: printfullOrder.tracking_url,
        };
      } catch (error: unknown) {
        console.error("[Merch] Status check error:", error);
        throw new Error("Failed to check order status");
      }
    }),

  // List active merch orders
  listOrders: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const orders = await db.listMerchOrders({
          status: input.status,
          limit: input.limit,
          offset: input.offset,
        });

        return orders;
      } catch (error: unknown) {
        console.error("[Merch] List error:", error);
        throw new Error("Failed to list merch orders");
      }
    }),
});
