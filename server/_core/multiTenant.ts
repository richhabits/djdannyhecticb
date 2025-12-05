import { db } from '../db';
import { brands } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Request } from 'express';

interface TenantConfig {
  id: number;
  slug: string;
  name: string;
  domain?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customCss?: string;
  features: {
    ecommerce: boolean;
    bookings: boolean;
    subscriptions: boolean;
    aiTools: boolean;
    analytics: boolean;
  };
  branding: {
    footerText?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

/**
 * Get tenant from request (domain or subdomain)
 */
export async function getTenantFromRequest(req: Request): Promise<TenantConfig | null> {
  const host = req.headers.host || '';
  
  // Check if domain matches a tenant
  const brand = await db.query.brands.findFirst({
    where: eq(brands.domain, host),
  });

  if (brand) {
    return mapBrandToTenant(brand);
  }

  // Check for subdomain (e.g., dannyhb.hecticradio.com)
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www') {
    const brandBySlug = await db.query.brands.findFirst({
      where: eq(brands.slug, subdomain),
    });

    if (brandBySlug) {
      return mapBrandToTenant(brandBySlug);
    }
  }

  // Return default brand
  const defaultBrand = await db.query.brands.findFirst({
    where: eq(brands.isDefault, true),
  });

  if (defaultBrand) {
    return mapBrandToTenant(defaultBrand);
  }

  return null;
}

/**
 * Map database brand to tenant config
 */
function mapBrandToTenant(brand: any): TenantConfig {
  return {
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    domain: brand.domain,
    primaryColor: brand.primaryColor || '#FF0000',
    secondaryColor: brand.secondaryColor || '#000000',
    logoUrl: brand.logoUrl,
    customCss: brand.customCss,
    features: {
      ecommerce: brand.featuresEcommerce ?? true,
      bookings: brand.featuresBookings ?? true,
      subscriptions: brand.featuresSubscriptions ?? true,
      aiTools: brand.featuresAiTools ?? true,
      analytics: brand.featuresAnalytics ?? true,
    },
    branding: {
      footerText: brand.footerText,
      seoTitle: brand.seoTitle || brand.name,
      seoDescription: brand.seoDescription,
    },
  };
}

/**
 * Middleware to inject tenant into request
 */
export async function tenantMiddleware(req: any, res: any, next: any) {
  const tenant = await getTenantFromRequest(req);
  req.tenant = tenant;
  next();
}

/**
 * Get CSS variables for tenant branding
 */
export function getTenantCssVariables(tenant: TenantConfig): string {
  return `
    :root {
      --primary-color: ${tenant.primaryColor};
      --secondary-color: ${tenant.secondaryColor};
    }
    ${tenant.customCss || ''}
  `;
}

/**
 * Create new tenant (white-label instance)
 */
export async function createTenant(data: {
  name: string;
  slug: string;
  domain?: string;
  primaryColor?: string;
  secondaryColor?: string;
  ownerId?: number;
}): Promise<TenantConfig> {
  const brand = await db.insert(brands).values({
    name: data.name,
    slug: data.slug,
    domain: data.domain,
    type: 'personality',
    primaryColor: data.primaryColor || '#FF0000',
    secondaryColor: data.secondaryColor || '#000000',
    isActive: true,
    isDefault: false,
    // Features enabled by default
    featuresEcommerce: true,
    featuresBookings: true,
    featuresSubscriptions: true,
    featuresAiTools: false, // Disabled by default for white-label
    featuresAnalytics: true,
  }).returning();

  return mapBrandToTenant(brand[0]);
}

/**
 * Update tenant configuration
 */
export async function updateTenant(
  tenantId: number,
  updates: Partial<TenantConfig>
): Promise<TenantConfig> {
  const brand = await db.update(brands)
    .set({
      name: updates.name,
      primaryColor: updates.primaryColor,
      secondaryColor: updates.secondaryColor,
      logoUrl: updates.logoUrl,
      customCss: updates.customCss,
      domain: updates.domain,
      featuresEcommerce: updates.features?.ecommerce,
      featuresBookings: updates.features?.bookings,
      featuresSubscriptions: updates.features?.subscriptions,
      featuresAiTools: updates.features?.aiTools,
      featuresAnalytics: updates.features?.analytics,
      footerText: updates.branding?.footerText,
      seoTitle: updates.branding?.seoTitle,
      seoDescription: updates.branding?.seoDescription,
    })
    .where(eq(brands.id, tenantId))
    .returning();

  return mapBrandToTenant(brand[0]);
}

/**
 * Get all tenants
 */
export async function getAllTenants(): Promise<TenantConfig[]> {
  const allBrands = await db.query.brands.findMany({
    where: eq(brands.isActive, true),
  });

  return allBrands.map(mapBrandToTenant);
}

/**
 * Delete tenant
 */
export async function deleteTenant(tenantId: number): Promise<void> {
  await db.update(brands)
    .set({ isActive: false })
    .where(eq(brands.id, tenantId));
}

/**
 * Check if feature is enabled for tenant
 */
export function hasFeature(tenant: TenantConfig | null, feature: keyof TenantConfig['features']): boolean {
  if (!tenant) return false;
  return tenant.features[feature] ?? false;
}

/**
 * Generate tenant subdomain URL
 */
export function getTenantUrl(tenant: TenantConfig): string {
  if (tenant.domain) {
    return `https://${tenant.domain}`;
  }
  return `https://${tenant.slug}.hecticradio.com`;
}

/**
 * Revenue sharing calculation for white-label
 */
export interface RevenueShare {
  grossRevenue: number;
  platformFee: number; // Percentage
  tenantRevenue: number;
  platformRevenue: number;
}

export function calculateRevenueShare(
  grossRevenue: number,
  platformFeePercentage: number = 20
): RevenueShare {
  const platformRevenue = (grossRevenue * platformFeePercentage) / 100;
  const tenantRevenue = grossRevenue - platformRevenue;

  return {
    grossRevenue,
    platformFee: platformFeePercentage,
    tenantRevenue,
    platformRevenue,
  };
}

/**
 * Get tenant analytics (sandboxed)
 */
export async function getTenantAnalytics(tenantId: number) {
  // Analytics filtered by brand_id
  // This ensures each tenant only sees their own data
  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT mp.user_id) as active_users,
      COUNT(mp.id) as total_plays,
      COUNT(DISTINCT m.id) as total_mixes
    FROM mix_plays mp
    INNER JOIN mixes m ON mp.mix_id = m.id
    WHERE m.brand_id = ${tenantId}
    AND mp.played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  return result.rows[0] || {
    active_users: 0,
    total_plays: 0,
    total_mixes: 0,
  };
}

export type { TenantConfig };
