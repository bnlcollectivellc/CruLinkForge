import { PrismaClient } from '@prisma/client';
import materialsData from '../src/data/materials.json';
import servicesData from '../src/data/services.json';
import finishesData from '../src/data/finishes.json';
import templatesData from '../src/data/templates.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Browning's Welding as the first tenant
  const brownings = await prisma.tenant.upsert({
    where: { slug: 'browningswelding' },
    update: {},
    create: {
      name: "Browning's Welding",
      slug: 'browningswelding',
      subdomain: 'brownings',
      email: 'info@browningswelding.com',
      phone: '(479) 555-0123',
      address: {
        street: '123 Main Street',
        city: 'Springdale',
        state: 'AR',
        zip: '72764',
        country: 'USA',
      },
      primaryColor: '#E63329',
      secondaryColor: '#1a1a1a',
      taxRate: 0.065,
      taxLabel: 'Arkansas Sales Tax',
      currency: 'USD',
      timezone: 'America/Chicago',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
    },
  });

  console.log(`Created tenant: ${brownings.name} (${brownings.id})`);

  // Seed Materials
  console.log('Seeding materials...');
  for (const category of materialsData.categories) {
    for (const subcategory of category.subcategories) {
      await prisma.material.upsert({
        where: {
          id: `${brownings.id}-${category.id}-${subcategory.id}`,
        },
        update: {
          thicknesses: subcategory.thicknesses,
        },
        create: {
          id: `${brownings.id}-${category.id}-${subcategory.id}`,
          tenantId: brownings.id,
          category: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          categoryImage: category.image,
          categoryDesc: category.description,
          subcategory: subcategory.id,
          subcategoryName: subcategory.name,
          subcategoryDesc: subcategory.description,
          thicknesses: subcategory.thicknesses,
          isActive: true,
          sortOrder: 0,
        },
      });
    }
  }

  // Seed Volume Discounts
  console.log('Seeding volume discounts...');
  for (const discount of materialsData.volumeDiscounts) {
    await prisma.volumeDiscount.create({
      data: {
        tenantId: brownings.id,
        minQty: discount.minQty,
        maxQty: discount.maxQty,
        discount: discount.discount,
      },
    });
  }

  // Seed Services
  console.log('Seeding services...');
  for (const service of servicesData.services) {
    await prisma.service.upsert({
      where: {
        id: `${brownings.id}-${service.id}`,
      },
      update: {
        config: {
          types: service.types || null,
          options: service.options || null,
          pricingNote: service.pricingNote || null,
          note: service.note || null,
          pricePerBend: service.pricePerBend || null,
          pricePerCut: service.pricePerCut || null,
          pricePerHole: service.pricePerHole || null,
          pricePerSqIn: service.pricePerSqIn || null,
        },
      },
      create: {
        id: `${brownings.id}-${service.id}`,
        tenantId: brownings.id,
        name: service.name,
        description: service.description,
        category: service.category,
        icon: service.icon,
        basePrice: service.basePrice,
        pricePerUnit: service.pricePerBend || service.pricePerCut || service.pricePerHole || service.pricePerSqIn || null,
        unitType: service.pricePerBend ? 'bend' : service.pricePerCut ? 'cut' : service.pricePerHole ? 'hole' : service.pricePerSqIn ? 'sqin' : null,
        config: {
          types: service.types || null,
          options: service.options || null,
          pricingNote: service.pricingNote || null,
          note: service.note || null,
        },
        included: service.included,
        requiresSelection: service.requiresSelection || false,
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  // Seed Shipping Options
  console.log('Seeding shipping options...');
  for (const option of servicesData.shipping.options) {
    await prisma.shippingOption.create({
      data: {
        tenantId: brownings.id,
        name: option.name,
        description: option.description,
        type: option.calculated ? 'CALCULATED' : option.price === 0 ? 'PICKUP' : 'FLAT_RATE',
        price: option.price,
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  // Seed Finishes
  console.log('Seeding finishes...');
  for (const finish of finishesData.finishes) {
    await prisma.finish.upsert({
      where: {
        id: `${brownings.id}-${finish.id}`,
      },
      update: {
        colors: finish.colors || null,
        options: finish.options || null,
      },
      create: {
        id: `${brownings.id}-${finish.id}`,
        tenantId: brownings.id,
        name: finish.name,
        description: finish.description,
        priceMultiplier: finish.priceMultiplier,
        leadTimeDays: finish.leadTimeDays,
        minOrderQty: finish.minOrderQty || null,
        note: finish.note || null,
        compatibleMaterials: finish.compatibleMaterials,
        colors: finish.colors || null,
        options: finish.options || finish.types || null,
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  // Seed Templates
  console.log('Seeding templates...');
  for (const template of templatesData.templates) {
    await prisma.template.upsert({
      where: {
        id: `${brownings.id}-${template.id}`,
      },
      update: {
        parameters: template.parameters,
      },
      create: {
        id: `${brownings.id}-${template.id}`,
        tenantId: brownings.id,
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        shapeType: template.id,
        parameters: template.parameters,
        popular: template.popular || false,
        bendRequired: template.bendRequired || false,
        isActive: true,
        isGlobal: true, // Make default templates available to all tenants
        isCustom: false,
        sortOrder: 0,
      },
    });
  }

  // Create a demo admin user for Browning's
  console.log('Creating demo admin user...');
  await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'admin@browningswelding.com',
        tenantId: brownings.id,
      },
    },
    update: {},
    create: {
      tenantId: brownings.id,
      email: 'admin@browningswelding.com',
      name: 'Admin User',
      role: 'OWNER',
      // Password would be set via auth flow
    },
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
