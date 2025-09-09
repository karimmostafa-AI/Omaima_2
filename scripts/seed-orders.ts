import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleUsers = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'CUSTOMER' as const
  },
  {
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'CUSTOMER' as const
  },
  {
    email: 'bob.johnson@example.com',
    name: 'Bob Johnson',
    role: 'CUSTOMER' as const
  },
  {
    email: 'alice.brown@example.com',
    name: 'Alice Brown',
    role: 'CUSTOMER' as const
  },
];

const sampleProducts = [
  {
    name: 'Custom Tailored Suit',
    description: 'Premium custom-tailored business suit with perfect fit',
    price: 799.99,
    image: '/images/products/suit-1.jpg',
    stock: 50,
    status: 'ACTIVE' as const
  },
  {
    name: 'Wool Blazer',
    description: 'High-quality wool blazer for professional occasions',
    price: 349.99,
    image: '/images/products/blazer-1.jpg',
    stock: 30,
    status: 'ACTIVE' as const
  },
  {
    name: 'Dress Shirt',
    description: 'Premium cotton dress shirt with custom measurements',
    price: 89.99,
    image: '/images/products/shirt-1.jpg',
    stock: 100,
    status: 'ACTIVE' as const
  },
  {
    name: 'Formal Pants',
    description: 'Tailored formal pants with perfect fitting',
    price: 159.99,
    image: '/images/products/pants-1.jpg',
    stock: 75,
    status: 'ACTIVE' as const
  },
];

const orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

async function seedOrders() {
  console.log('Starting order seeding...');

  try {
    // First, create users if they don't exist
    console.log('Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`Created user: ${user.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${existingUser.email}`);
      }
    }

    // Create products if they don't exist
    console.log('Creating sample products...');
    const createdProducts = [];
    for (const productData of sampleProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      });

      if (!existingProduct) {
        const product = await prisma.product.create({
          data: productData
        });
        createdProducts.push(product);
        console.log(`Created product: ${product.name}`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`Product already exists: ${existingProduct.name}`);
      }
    }

    // Create sample orders
    console.log('Creating sample orders...');
    const ordersToCreate = 25;

    for (let i = 0; i < ordersToCreate; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      
      // Create random date within the last 3 months
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

      // Select 1-4 random products for this order
      const numberOfItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();

      for (let j = 0; j < numberOfItems; j++) {
        let randomProduct;
        do {
          randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        } while (usedProductIds.has(randomProduct.id) && usedProductIds.size < createdProducts.length);
        
        if (!usedProductIds.has(randomProduct.id)) {
          selectedProducts.push({
            product: randomProduct,
            quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
          });
          usedProductIds.add(randomProduct.id);
        }
      }

      // Calculate total
      const total = selectedProducts.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: randomUser.id,
          status: randomStatus,
          total: total,
          createdAt: createdAt,
          updatedAt: createdAt,
          items: {
            create: selectedProducts.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.product.price,
            }))
          }
        },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`Created order ${i + 1}: ${order.id} for ${randomUser.name} - $${total.toFixed(2)} (${randomStatus})`);
    }

    console.log('✅ Order seeding completed successfully!');
    console.log(`Created ${ordersToCreate} sample orders`);

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedOrders()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedOrders };
