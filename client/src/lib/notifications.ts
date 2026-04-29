import emailjs from "@emailjs/browser";

const ADMIN_EMAIL = "saifkhan16382@gmail.com";

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
    console.error("EmailJS not configured. Missing env vars:", {
      serviceId: !!EMAILJS_SERVICE_ID,
      templateId: !!EMAILJS_TEMPLATE_ID,
      publicKey: !!EMAILJS_PUBLIC_KEY,
    });
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

  console.log("Sending order email via EmailJS...", { serviceId: EMAILJS_SERVICE_ID, templateId: EMAILJS_TEMPLATE_ID });
  const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
  console.log("EmailJS response:", response.status, response.text);
}

