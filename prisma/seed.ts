import { PrismaClient, Role, OrderStatus } from "@prisma/client";
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
    {
      name: "索尼WH-1000XM5",
      description: "顶级降噪头戴式耳机，LDAC高音质，30小时续航",
      price: 2299.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=17",
        "https://picsum.photos/400/400?random=18",
      ]),
      stock: 45,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "华为MateBook 14",
      description: "2.5K全面屏笔记本，搭载英特尔12代酷睿处理器",
      price: 5999.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=19",
        "https://picsum.photos/400/400?random=20",
      ]),
      stock: 35,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "阿迪达斯Ultra Boost 22",
      description: "顶级跑鞋，Boost中底科技，提供卓越缓震性能",
      price: 1299.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=21",
        "https://picsum.photos/400/400?random=22",
      ]),
      stock: 70,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "美的变频空调1.5匹",
      description: "一级能效，静音运行，智能温控，节能省电",
      price: 2599.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=23",
        "https://picsum.photos/400/400?random=24",
      ]),
      stock: 40,
      category: "家用电器",
      sellerId: seller.id,
    },
    {
      name: "SK-II神仙水",
      description: "经典护肤精华露，改善肌肤质地，提亮肤色",
      price: 1690.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=25",
        "https://picsum.photos/400/400?random=26",
      ]),
      stock: 55,
      category: "美妆护肤",
      sellerId: seller.id,
    },
    {
      name: "ZARA基础款牛仔裤",
      description: "经典直筒版型，舒适弹力面料，百搭必备",
      price: 259.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=27",
        "https://picsum.photos/400/400?random=28",
      ]),
      stock: 120,
      category: "服装鞋帽",
      sellerId: seller.id,
    },
    {
      name: "飞利浦电动牙刷",
      description: "声波震动清洁，多种清洁模式，呵护口腔健康",
      price: 599.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=29",
        "https://picsum.photos/400/400?random=30",
      ]),
      stock: 85,
      category: "个人护理",
      sellerId: seller.id,
    },
    {
      name: "三只松鼠坚果礼盒",
      description: "精选优质坚果组合，营养健康，送礼自用两相宜",
      price: 128.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=31",
        "https://picsum.photos/400/400?random=32",
      ]),
      stock: 150,
      category: "食品饮料",
      sellerId: seller.id,
    },
    {
      name: "小米手环8",
      description: "全天候健康监测，超长续航，运动数据精准记录",
      price: 299.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=33",
        "https://picsum.photos/400/400?random=34",
      ]),
      stock: 200,
      category: "数码电子",
      sellerId: seller.id,
    },
    {
      name: "九阳破壁机",
      description: "多功能料理机，8叶立体刀组，制作营养果汁豆浆",
      price: 899.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=35",
        "https://picsum.photos/400/400?random=36",
      ]),
      stock: 65,
      category: "家用电器",
      sellerId: seller.id,
    },
    {
      name: "兰蔻小黑瓶精华",
      description: "修护肌肤屏障，提升肌肤自我修护力，焕发年轻光彩",
      price: 1180.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=37",
        "https://picsum.photos/400/400?random=38",
      ]),
      stock: 75,
      category: "美妆护肤",
      sellerId: seller.id,
    },
    {
      name: "膳魔师保温杯",
      description: "304不锈钢内胆，24小时保温，便携设计，健康饮水",
      price: 299.0,
      images: JSON.stringify([
        "https://picsum.photos/400/400?random=39",
        "https://picsum.photos/400/400?random=40",
      ]),
      stock: 100,
      category: "生活用品",
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
  const airpods = allProducts.find((p) => p.name === "AirPods Pro 2");
  const nike = allProducts.find((p) => p.name === "Nike Air Max 270");
  const airPurifier = allProducts.find((p) => p.name === "小米空气净化器4");
  const tshirt = allProducts.find((p) => p.name === "优衣库基础款T恤");

  // 创建不同状态的订单
  const ordersData = [
    // 待支付订单
    {
      product: iphone,
      quantity: 1,
      status: OrderStatus.PENDING,
      note: "请确认商品颜色为深空黑色",
      address: address1,
    },
    // 已支付订单
    {
      product: macbook,
      quantity: 1,
      status: OrderStatus.PAID,
      note: "请尽快发货，谢谢！",
      address: address2,
    },
    // 已发货订单
    {
      product: airpods,
      quantity: 2,
      status: OrderStatus.SHIPPED,
      note: "送货时请提前电话联系",
      trackingNumber: "SF1234567890",
      address: address1,
    },
    // 已完成订单
    {
      product: nike,
      quantity: 1,
      status: OrderStatus.COMPLETED,
      note: "尺码41码，谢谢",
      trackingNumber: "YT9876543210",
      address: address1,
    },
    // 已取消订单
    {
      product: airPurifier,
      quantity: 1,
      status: OrderStatus.CANCELED,
      note: "临时取消，抱歉",
      address: address2,
    },
    // 更多已完成订单
    {
      product: tshirt,
      quantity: 3,
      status: OrderStatus.COMPLETED,
      note: "颜色：白色、黑色、灰色各一件",
      trackingNumber: "ZTO5555666777",
      address: address1,
    },
  ];

  const createdOrders = [];
  for (const orderData of ordersData) {
    if (orderData.product) {
      const order = await prisma.order.create({
        data: {
          quantity: orderData.quantity,
          totalPrice: orderData.product.price * orderData.quantity,
          status: orderData.status,
          note: orderData.note,
          trackingNumber: orderData.trackingNumber || null,
          buyerId: buyer.id,
          productId: orderData.product.id,
          addressId: orderData.address.id,
        },
      });
      createdOrders.push({ order, productData: orderData.product });
    }
  }

  // 为已完成的订单创建评价
  if (nike) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: "非常满意！鞋子质量很好，穿着很舒适，物流也很快。5星好评！",
        userId: buyer.id,
        productId: nike.id,
      },
    });
  }

  if (tshirt) {
    await prisma.review.create({
      data: {
        rating: 4,
        comment:
          "T恤质量不错，纯棉材质很舒服，就是颜色比图片稍微深一点，但整体还是很满意的。",
        userId: buyer.id,
        productId: tshirt.id,
      },
    });
  }

  console.log("数据填充完成!");
  console.log(`创建用户: ${buyer.username} (买家), ${seller.username} (卖家)`);
  console.log(`创建商品: ${products.length} 个`);
  console.log("创建地址: 2 个");
  console.log(`创建订单: ${ordersData.length} 个 (涵盖所有订单状态)`);
  console.log("创建评价: 2 个 (针对已完成订单)");
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
