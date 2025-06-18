import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("开始填充数据...");

  // 清理现有数据
  await prisma.review.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 创建买家
  const buyer = await prisma.user.create({
    data: {
      username: "buyer001",
      email: "buyer@example.com",
      phone: "13800138001",
      passwordHash: hashedPassword,
      role: Role.BUYER,
      realName: "张三",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  });

  // 创建卖家
  const seller = await prisma.user.create({
    data: {
      username: "seller001",
      email: "seller@example.com",
      phone: "13800138002",
      passwordHash: hashedPassword,
      role: Role.SELLER,
      realName: "李四",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  });

  // 创建商品数据
  const products = [
    {
      name: "iPhone 15 Pro",
      description: "苹果最新旗舰手机，搭载A17 Pro芯片，支持5G网络",
      price: 7999.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=1",
        "https://picsum.photos/400/400?random=2",
      ]),
      stock: 50,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "MacBook Air M2",
      description: "轻薄便携笔记本电脑，搭载M2芯片，13.6英寸视网膜显示屏",
      price: 8999.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=3",
        "https://picsum.photos/400/400?random=4",
      ]),
      stock: 30,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "AirPods Pro 2",
      description: "主动降噪无线耳机，支持空间音频和透明模式",
      price: 1899.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=5",
        "https://picsum.photos/400/400?random=6",
      ]),
      stock: 100,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "Nike Air Max 270",
      description: "舒适透气运动鞋，适合日常穿着和运动",
      price: 899.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=7",
        "https://picsum.photos/400/400?random=8",
      ]),
      stock: 80,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "小米空气净化器4",
      description: "高效过滤PM2.5，静音运行，智能控制",
      price: 1299.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=9",
        "https://picsum.photos/400/400?random=10",
      ]),
      stock: 60,
      category: "家用电器",
      sellerId: seller.id,
    },
    {
      name: "戴森V15吸尘器",
      description: "强劲吸力无线吸尘器，激光显示灰尘技术",
      price: 4590.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=11",
        "https://picsum.photos/400/400?random=12",
      ]),
      stock: 25,
      category: "家用电器",
      sellerId: seller.id,
    },
    {
      name: "优衣库基础款T恤",
      description: "100%纯棉材质，多色可选，舒适透气",
      price: 99.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=13",
        "https://picsum.photos/400/400?random=14",
      ]),
      stock: 200,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "茅台飞天53度500ml",
      description: "中国白酒经典，酱香型白酒代表",
      price: 2899.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=15",
        "https://picsum.photos/400/400?random=16",
      ]),
      stock: 15,
      category: "食品饮料",
      sellerId: seller.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }

  // 创建买家地址
  const address1 = await prisma.address.create({
    data: {
      receiverName: "张三",
      phone: "13800138001",
      province: "广东省",
      city: "深圳市",
      district: "南山区",
      detail: "科技园南区深南大道10000号腾讯大厦A座1001室",
      isDefault: true,
      userId: buyer.id,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      receiverName: "张三",
      phone: "13800138001",
      province: "北京市",
      city: "北京市",
      district: "海淀区",
      detail: "中关村大街1号海龙大厦B座2008室",
      isDefault: false,
      userId: buyer.id,
    },
  });

  // 获取商品用于创建订单
  const allProducts = await prisma.product.findMany();
  const iphone = allProducts.find((p) => p.name === "iPhone 15 Pro");
  const macbook = allProducts.find((p) => p.name === "MacBook Air M2");

  // 创建订单
  if (iphone) {
    await prisma.order.create({
      data: {
        quantity: 1,
        totalPrice: iphone.price,
        status: "PAID",
        note: "请尽快发货，谢谢！",
        buyerId: buyer.id,
        productId: iphone.id,
        addressId: address1.id,
      },
    });
  }

  if (macbook) {
    await prisma.order.create({
      data: {
        quantity: 1,
        totalPrice: macbook.price,
        status: "PENDING",
        note: "送货时请提前电话联系",
        buyerId: buyer.id,
        productId: macbook.id,
        addressId: address2.id,
      },
    });
  }

  console.log("数据填充完成!");
  console.log(`创建用户: ${buyer.username} (买家), ${seller.username} (卖家)`);
  console.log(`创建商品: ${products.length} 个`);
  console.log("创建地址: 2 个");
  console.log("创建订单: 2 个");
  console.log("默认密码: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
