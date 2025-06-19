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

  // 创建商品数据（30个商品）
  const products = [
    {
      name: "iPhone 15 Pro",
      description: "苹果最新旗舰手机，搭载A17 Pro芯片，支持5G网络",
      price: 7999.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
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
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
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
        "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop",
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
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
      ]),
      stock: 80,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "索尼WH-1000XM5",
      description: "顶级降噪头戴式耳机，LDAC高音质，30小时续航",
      price: 2299.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
      ]),
      stock: 45,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "优衣库基础款T恤",
      description: "100%纯棉材质，多色可选，舒适透气",
      price: 99.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
      ]),
      stock: 200,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "阿迪达斯Ultra Boost 22",
      description: "顶级跑鞋，Boost中底科技，提供卓越缓震性能",
      price: 1299.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=400&h=400&fit=crop",
      ]),
      stock: 70,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "ZARA基础款牛仔裤",
      description: "经典直筒版型，舒适弹力面料，百搭必备",
      price: 259.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop",
      ]),
      stock: 120,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "Kindle Paperwhite",
      description: "6.8英寸电子书阅读器，防水设计，数周续航",
      price: 998.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
      ]),
      stock: 80,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "雅诗兰黛小棕瓶",
      description: "修护型精华露，改善肌肤弹性，延缓衰老",
      price: 1380.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
      ]),
      stock: 60,
      category: "美妆护肤",
      sellerId: seller.id,
    },
    {
      name: "星巴克咖啡豆礼盒",
      description: "精选阿拉比卡咖啡豆，多种风味，送礼佳品",
      price: 258.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop",
      ]),
      stock: 120,
      category: "食品饮料",
      sellerId: seller.id,
    },

    {
      name: "小米智能手表",
      description: "全天候健康监测，GPS定位，智能运动指导",
      price: 899.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
      ]),
      stock: 110,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "KitchenAid厨师机",
      description: "专业厨房搅拌机，多功能配件，烘焙好帮手",
      price: 3299.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1574781330855-d0db8cc8de29?w=400&h=400&fit=crop",
      ]),
      stock: 25,
      category: "家用电器",
      sellerId: seller.id,
    },

    {
      name: "蓝牙音响",
      description: "便携无线音响，重低音效果，防水设计",
      price: 399.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=400&fit=crop",
      ]),
      stock: 150,
      category: "数码电子",
      sellerId: seller.id,
    },

    {
      name: "瑜伽垫套装",
      description: "环保TPE材质，防滑设计，附赠瑜伽配件",
      price: 199.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1506629905521-8e7d4b1d3888?w=400&h=400&fit=crop",
      ]),
      stock: 130,
      category: "运动健身",
      sellerId: seller.id,
    },

    {
      name: "Louis Vuitton经典手提包",
      description: "奢华皮具，经典设计，彰显品味与地位",
      price: 15999.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      ]),
      stock: 8,
      category: "奢侈品",
      sellerId: seller.id,
    },
    {
      name: "Rolex Submariner腕表",
      description: "瑞士制造奢华腕表，防水1000米，经典潜水表",
      price: 89999.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523170335258-f5c54c6c-2d20?w=400&h=400&fit=crop",
      ]),
      stock: 3,
      category: "奢侈品",
      sellerId: seller.id,
    },
    {
      name: "Nintendo Switch OLED",
      description: "任天堂游戏机OLED版本，7英寸屏幕，随时随地畅玩",
      price: 2399.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      ]),
      stock: 60,
      category: "游戏设备",
      sellerId: seller.id,
    },
    {
      name: "Hermès丝巾",
      description: "法国奢侈品牌丝巾，手工印制，时尚配饰经典",
      price: 4999.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
      ]),
      stock: 12,
      category: "奢侈品",
      sellerId: seller.id,
    },
    {
      name: "Bose QuietComfort降噪耳机",
      description: "顶级主动降噪技术，舒适佩戴，音质卓越",
      price: 2699.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
      ]),
      stock: 40,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "DJI Air 2S无人机",
      description: "专业航拍无人机，5.4K视频录制，智能飞行模式",
      price: 6999.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop",
      ]),
      stock: 25,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "Chanel No.5香水",
      description: "经典法式香水，优雅女性专属，永恒的香氛传奇",
      price: 1299.0,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=400&h=400&fit=crop",
      ]),
      stock: 50,
      category: "美妆护肤",
      sellerId: seller.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }

  console.log("数据填充完成!");
  console.log(`创建用户: ${seller.username} (卖家)`);
  console.log(`创建商品: ${products.length} 个`);
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
