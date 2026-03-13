import emailjs from "@emailjs/browser";

const ADMIN_EMAIL = "saifkhan16382@gmail.com";
const ADMIN_WHATSAPP = "923188055850";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

export interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  subtotal: number;
  shipping: number;
  notes?: string;
}

function formatItemsList(items: OrderNotificationData["items"]): string {
  return items
    .map((item, i) => `${i + 1}. ${item.name} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString()}`)
    .join("\n");
}

export async function sendOrderEmailNotification(order: OrderNotificationData): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS not configured. Skipping email notification.");
    return;
  }

  const itemsList = formatItemsList(order.items);

  const templateParams = {
    to_email: ADMIN_EMAIL,
    order_id: order.orderId,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    customer_city: order.customerCity,
    items_list: itemsList,
    subtotal: `Rs. ${order.subtotal.toLocaleString()}`,
    shipping: order.shipping === 0 ? "Free" : `Rs. ${order.shipping.toLocaleString()}`,
    total: `Rs. ${order.total.toLocaleString()}`,
    notes: order.notes || "None",
    order_date: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
  };

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
}

export function sendOrderWhatsAppNotification(order: OrderNotificationData): void {
  const itemsList = order.items
    .map((item, i) => `${i + 1}. ${item.name} x${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}`)
    .join("%0A");

  const message =
    `🛒 *NEW ORDER - PakCart*%0A%0A` +
    `📦 *Order ID:* %23${order.orderId}%0A` +
    `📅 *Date:* ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}%0A%0A` +
    `👤 *Customer Details:*%0A` +
    `Name: ${order.customerName}%0A` +
    `Email: ${order.customerEmail}%0A` +
    `Phone: ${order.customerPhone}%0A` +
    `Address: ${order.customerAddress}, ${order.customerCity}%0A%0A` +
    `🛍️ *Items Ordered:*%0A${itemsList}%0A%0A` +
    `💰 *Subtotal:* Rs. ${order.subtotal.toLocaleString()}%0A` +
    `🚚 *Shipping:* ${order.shipping === 0 ? "Free" : `Rs. ${order.shipping.toLocaleString()}`}%0A` +
    `✅ *Total:* Rs. ${order.total.toLocaleString()}%0A%0A` +
    (order.notes ? `📝 *Notes:* ${order.notes}%0A%0A` : "") +
    `💳 *Payment:* Cash on Delivery`;

  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
  window.open(whatsappUrl, "_blank");
}
