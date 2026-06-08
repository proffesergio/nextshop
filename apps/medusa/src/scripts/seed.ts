/**
 * Seed script — run via: pnpm --filter @nextshop/medusa seed
 * (i.e. `medusa exec ./src/scripts/seed.ts`)
 *
 * Creates:
 *  - 1 Region  (Europe / EUR)
 *  - 1 Sales Channel (Default)
 *  - 1 Stock Location (Main Warehouse)
 *  - Sample products: grocery items including a Bangladesh-sourced product,
 *    and clothing items for the FreeStyleBD storefront.
 *
 * Note: unit-testing this script without a real Postgres + Medusa container
 * is not practical; manual smoke-testing against a running Medusa instance
 * is the recommended approach.
 */

import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { ExecArgs } from "@medusajs/framework/types";

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Starting seed…");

  // ── 1. Region ──────────────────────────────────────────────────────────────
  logger.info("Creating region (Europe / EUR)…");
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries: ["de", "fr", "gb", "nl", "pl", "se"],
        },
      ],
    },
  });

  const region = regions[0]!;
  logger.info(`Region created: ${region.name} (${region.id})`);

  // ── 2. Sales Channel ───────────────────────────────────────────────────────
  logger.info("Creating default sales channel…");
  const { result: salesChannels } =
    await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
            description: "The primary online sales channel for all storefronts",
            is_disabled: false,
          },
        ],
      },
    });

  const salesChannel = salesChannels[0]!;
  logger.info(`Sales channel created: ${salesChannel.name} (${salesChannel.id})`);

  // ── 3. Stock Location ──────────────────────────────────────────────────────
  logger.info("Creating main warehouse stock location…");
  const { result: stockLocations } =
    await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Main Warehouse",
            address: {
              address_1: "1 Market Street",
              city: "Amsterdam",
              country_code: "NL",
            },
          },
        ],
      },
    });

  const stockLocation = stockLocations[0]!;
  logger.info(
    `Stock location created: ${stockLocation.name} (${stockLocation.id})`
  );

  // ── 4. Products ────────────────────────────────────────────────────────────
  logger.info("Creating sample products…");

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        // ── Bangladesh-sourced grocery ───────────────────────────────────────
        {
          title: "Alphonso Mango",
          handle: "alphonso-mango",
          description:
            "Premium Alphonso mangoes sourced directly from Bangladeshi orchards. "
            + "Sweet, fragrant, and naturally ripened.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            origin: "Bangladesh",
            preferentialOrigin: true,
            isOrganic: true,
          },
          options: [
            { title: "Pack Size", values: ["500g", "1kg", "2kg"] },
          ],
          variants: [
            {
              title: "500g Pack",
              sku: "MANGO-BD-500G",
              options: { "Pack Size": "500g" },
              prices: [
                { amount: 499, currency_code: "eur" },
              ],
              manage_inventory: true,
            },
            {
              title: "1kg Pack",
              sku: "MANGO-BD-1KG",
              options: { "Pack Size": "1kg" },
              prices: [
                { amount: 899, currency_code: "eur" },
              ],
              manage_inventory: true,
            },
            {
              title: "2kg Pack",
              sku: "MANGO-BD-2KG",
              options: { "Pack Size": "2kg" },
              prices: [
                { amount: 1599, currency_code: "eur" },
              ],
              manage_inventory: true,
            },
          ],
        },

        // ── Standard grocery items ───────────────────────────────────────────
        {
          title: "Organic Whole Milk",
          handle: "organic-whole-milk",
          description: "Fresh organic whole milk from free-range cows. 3.5% fat.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: { isOrganic: true, category: "dairy" },
          options: [
            { title: "Volume", values: ["1L", "2L"] },
          ],
          variants: [
            {
              title: "1 Litre",
              sku: "MILK-ORG-1L",
              options: { Volume: "1L" },
              prices: [{ amount: 149, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "2 Litres",
              sku: "MILK-ORG-2L",
              options: { Volume: "2L" },
              prices: [{ amount: 259, currency_code: "eur" }],
              manage_inventory: true,
            },
          ],
        },
        {
          title: "Sourdough Bread",
          handle: "sourdough-bread",
          description:
            "Artisan sourdough loaf baked fresh daily. Stone-ground wheat flour, water, salt.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: { isArtisan: true, category: "bakery" },
          options: [
            { title: "Size", values: ["Small (400g)", "Large (800g)"] },
          ],
          variants: [
            {
              title: "Small (400g)",
              sku: "BREAD-SD-SM",
              options: { Size: "Small (400g)" },
              prices: [{ amount: 299, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "Large (800g)",
              sku: "BREAD-SD-LG",
              options: { Size: "Large (800g)" },
              prices: [{ amount: 499, currency_code: "eur" }],
              manage_inventory: true,
            },
          ],
        },
        {
          title: "Free-Range Eggs (12-pack)",
          handle: "free-range-eggs-12",
          description:
            "A dozen free-range eggs from local farms. Hens raised on pasture.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: { isFreeRange: true, category: "eggs" },
          options: [
            { title: "Type", values: ["Standard", "Organic"] },
          ],
          variants: [
            {
              title: "Standard",
              sku: "EGGS-FR-12-STD",
              options: { Type: "Standard" },
              prices: [{ amount: 349, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "Organic",
              sku: "EGGS-FR-12-ORG",
              options: { Type: "Organic" },
              prices: [{ amount: 449, currency_code: "eur" }],
              manage_inventory: true,
            },
          ],
        },

        // ── Clothing items (FreeStyleBD storefront) ──────────────────────────
        {
          title: "Premium Denim Jacket",
          handle: "premium-denim-jacket",
          description:
            "Export-quality denim jacket crafted in Bangladesh. Classic cut, "
            + "heavyweight 12oz denim, YKK zips.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            exportQuality: true,
            origin: "Bangladesh",
            category: "outerwear",
          },
          options: [
            { title: "Size", values: ["S", "M", "L", "XL", "XXL"] },
            { title: "Colour", values: ["Indigo", "Black", "Stone Wash"] },
          ],
          variants: [
            {
              title: "S / Indigo",
              sku: "DENIM-JKT-S-IND",
              options: { Size: "S", Colour: "Indigo" },
              prices: [{ amount: 7999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "M / Indigo",
              sku: "DENIM-JKT-M-IND",
              options: { Size: "M", Colour: "Indigo" },
              prices: [{ amount: 7999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "L / Indigo",
              sku: "DENIM-JKT-L-IND",
              options: { Size: "L", Colour: "Indigo" },
              prices: [{ amount: 7999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "XL / Black",
              sku: "DENIM-JKT-XL-BLK",
              options: { Size: "XL", Colour: "Black" },
              prices: [{ amount: 8499, currency_code: "eur" }],
              manage_inventory: true,
            },
          ],
        },
        {
          title: "Relaxed-Fit Cotton T-Shirt",
          handle: "relaxed-fit-cotton-tshirt",
          description:
            "100% combed cotton relaxed-fit tee. GOTS-certified organic cotton, "
            + "manufactured in Bangladesh to export standards.",
          status: "published",
          thumbnail: null,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            exportQuality: true,
            origin: "Bangladesh",
            isOrganic: true,
            category: "tops",
          },
          options: [
            { title: "Size", values: ["XS", "S", "M", "L", "XL"] },
            { title: "Colour", values: ["White", "Black", "Navy", "Olive"] },
          ],
          variants: [
            {
              title: "S / White",
              sku: "TSHIRT-S-WHT",
              options: { Size: "S", Colour: "White" },
              prices: [{ amount: 1999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "M / White",
              sku: "TSHIRT-M-WHT",
              options: { Size: "M", Colour: "White" },
              prices: [{ amount: 1999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "M / Black",
              sku: "TSHIRT-M-BLK",
              options: { Size: "M", Colour: "Black" },
              prices: [{ amount: 1999, currency_code: "eur" }],
              manage_inventory: true,
            },
            {
              title: "L / Navy",
              sku: "TSHIRT-L-NVY",
              options: { Size: "L", Colour: "Navy" },
              prices: [{ amount: 1999, currency_code: "eur" }],
              manage_inventory: true,
            },
          ],
        },
      ],
    },
  });

  logger.info(`Created ${products.length} products.`);

  // ── 5. Inventory levels ────────────────────────────────────────────────────
  // Give every inventory item a starting stock level at the main warehouse.
  // Inventory items are created automatically for variants with manage_inventory.
  logger.info("Setting inventory levels…");

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  if (inventoryItems.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item: { id: string }) => ({
          inventory_item_id: item.id,
          location_id: stockLocation.id,
          stocked_quantity: 100,
        })),
      },
    });
    logger.info(`Set inventory for ${inventoryItems.length} item(s).`);
  }

  logger.info("Seed complete.");
}
