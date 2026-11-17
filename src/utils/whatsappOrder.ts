import { CartItem, Language, Product, Quotation } from '../types';
import {
  formatCurrency,
  formatItemQuantityUnit,
  formatItemUnitsLabel,
  getItemUnitPriceDetail
} from './calculations';

export const OWNER_WHATSAPP_NUMBER = '13053227353';

/**
 * Looks up the live distributor name from the product catalog for a quote line item.
 * Quotations strip `distributorName` from public cart items so customer PDFs never expose it;
 * this resolves it exclusively for internal owner WhatsApp dispatch.
 */
export function resolveItemDistributor(
  item: CartItem,
  products: Product[] = []
): string | undefined {
  const normalizedProductName = (item.productName || '').toLowerCase().trim();
  const matchedProduct = products.find(
    (p) =>
      p.id === item.productId ||
      p.name.toLowerCase().trim() === normalizedProductName
  );

  if (matchedProduct && item.color) {
    const targetCode = (item.color.code || '').toLowerCase().trim();
    const targetName = (item.color.name || '').toLowerCase().trim();
    const matchedColor = matchedProduct.colors?.find((c) => {
      const codeMatch = targetCode && (c.code || '').toLowerCase().trim() === targetCode;
      const nameMatch = targetName && (c.name || '').toLowerCase().trim() === targetName;
      return Boolean(codeMatch || nameMatch);
    });
    if (matchedColor?.distributorName?.trim()) {
      return matchedColor.distributorName.trim();
    }
  }

  if (matchedProduct?.distributorName?.trim()) {
    return matchedProduct.distributorName.trim();
  }

  if (item.color?.distributorName?.trim()) {
    return item.color.distributorName.trim();
  }

  return undefined;
}

export function buildOwnerWhatsAppOrderMessage(
  quote: Quotation,
  products: Product[] = [],
  language: Language = 'es'
): string {
  const isEn = language === 'en';
  const deliveryAmount = quote.deliveryCost ?? quote.deliveryTotal ?? 0;
  const deliveryAddr = quote.sameAsBillingAddress
    ? quote.client?.address || (isEn ? 'Client registered address' : 'Dirección del cliente')
    : quote.shippingAddress?.trim() || quote.client?.address || (isEn ? 'Pickup / To confirm' : 'Retiro / Por confirmar');

  const lines: string[] = [];

  lines.push(
    isEn
      ? `*APPROVED ORDER #${quote.quoteNumber}*`
      : `*PEDIDO APROBADO #${quote.quoteNumber}*`
  );
  lines.push(`${isEn ? 'Date' : 'Fecha'}: ${quote.date}`);
  if (quote.salespersonName) {
    lines.push(`${isEn ? 'Salesperson' : 'Vendedor'}: ${quote.salespersonName}`);
  }

  lines.push('');
  lines.push(isEn ? '*CLIENT DETAILS*' : '*DATOS DEL CLIENTE*');
  lines.push(`${isEn ? 'Client' : 'Cliente'}: ${quote.client?.name || 'N/A'}`);
  if (quote.client?.clientType) {
    lines.push(`${isEn ? 'Type' : 'Tipo'}: ${quote.client.clientType}`);
  }
  if (quote.client?.phone) {
    lines.push(`${isEn ? 'Phone' : 'Teléfono'}: ${quote.client.phone}`);
  }
  if (quote.client?.email) {
    lines.push(`Email: ${quote.client.email}`);
  }
  lines.push(`${isEn ? 'Address' : 'Dirección'}: ${deliveryAddr}`);

  lines.push('');
  lines.push(
    isEn
      ? `*ORDER ITEMS (${quote.items.length})*`
      : `*PRODUCTOS DEL PEDIDO (${quote.items.length})*`
  );

  quote.items.forEach((item, index) => {
    const distributor = resolveItemDistributor(item, products);
    const unitLabel = formatItemQuantityUnit(item, language);
    const packagingLabel = formatItemUnitsLabel(item, language);
    const priceDetail = getItemUnitPriceDetail(item, language);

    lines.push('');
    lines.push(`${index + 1}. *${item.productName}*`);

    if (item.color) {
      const colorText = item.color.code
        ? `${item.color.name} (${item.color.code})`
        : item.color.name;
      lines.push(`   • ${isEn ? 'Color' : 'Color'}: ${colorText}`);
    }

    lines.push(
      `   • ${isEn ? 'Distributor' : 'Distribuidor'}: *${
        distributor || (isEn ? 'Not assigned' : 'No especificado')
      }*`
    );

    const qtySummary =
      packagingLabel && !packagingLabel.toLowerCase().startsWith(`${item.userEnteredQuantity} ${unitLabel}`.toLowerCase())
        ? `${item.userEnteredQuantity} ${unitLabel} (${packagingLabel})`
        : `${item.userEnteredQuantity} ${unitLabel}`;
    lines.push(`   • ${isEn ? 'Qty' : 'Cantidad'}: ${qtySummary}`);
    lines.push(
      `   • ${isEn ? 'Price' : 'Precio'}: ${priceDetail.primaryRate} → ${formatCurrency(item.subtotal)}`
    );

    if (item.notes) {
      lines.push(`   • ${isEn ? 'Note' : 'Nota'}: ${item.notes}`);
    }
  });

  lines.push('');
  lines.push(isEn ? '*SUMMARY*' : '*RESUMEN*');
  lines.push(
    `${isEn ? 'Products Subtotal' : 'Subtotal Materiales'}: ${formatCurrency(quote.subtotalProducts)}`
  );
  if (quote.includeDelivery && deliveryAmount > 0) {
    lines.push(`Delivery: ${formatCurrency(deliveryAmount)}`);
  }
  lines.push(
    `${isEn ? 'FL Sales Tax (7%)' : 'Impuesto (7%)'}: ${formatCurrency(quote.taxAmount)}`
  );
  if (quote.installationTotal > 0) {
    lines.push(
      `${isEn ? 'Installation / Labor' : 'Instalación / Mano de obra'}: ${formatCurrency(quote.installationTotal)}`
    );
  }
  if (quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0) {
    lines.push(
      `${isEn ? 'Card Fee (3%)' : 'Recargo Tarjeta (3%)'}: ${formatCurrency(quote.cardFeeAmount)}`
    );
  }
  lines.push(`*TOTAL: ${formatCurrency(quote.total)}*`);

  if (quote.notes) {
    lines.push('');
    lines.push(`${isEn ? 'Notes' : 'Notas'}: ${quote.notes}`);
  }

  return lines.join('\n');
}

export function buildOwnerWhatsAppOrderUrl(
  quote: Quotation,
  products: Product[] = [],
  language: Language = 'es'
): string {
  const message = buildOwnerWhatsAppOrderMessage(quote, products, language);
  return `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
