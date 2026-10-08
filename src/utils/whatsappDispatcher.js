// Automated WhatsApp Business Dispatch Engine for Shree Vinayaka PetroSoft AI Shiva
// Matches the exact format demonstrated in Smart Petrol Pump ERP 2026 video

export function formatWhatsAppDeliveryNote({
  stationName = "Shree Vinayaka PetroSoft AI Shiva",
  deliveryDate = new Date().toISOString().split('T')[0],
  slipNo = "37",
  vehicleNo = "GJ15AS7487",
  product = "Diesel",
  qty = 160.0,
  rate = 90.21,
  amount = 14433.6,
  availableBalance = 164433.6,
  invoicePdfName = `Invoice_${Date.now()}.pdf`
}) {
  const textMessage = 
`📄 *${invoicePdfName}*

*Delivery Note Details :*
Material supplied from *${stationName}*
Delivery Date is *${deliveryDate}* . Slip No is *${slipNo}*
Vehicle Number - *${vehicleNo}* Product *${product}*
(Qty-${Number(qty).toFixed(2)};Rate-${Number(rate).toFixed(2)};Amount-${Number(amount).toFixed(2)})
Purchased. Your available balance is *₹${Number(availableBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*.
Thank you for your Business Visit Again 🙏`;

  return {
    invoicePdfName,
    textMessage,
    encodedUrl: (phone) => {
      const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      return `https://wa.me/${fullPhone}?text=${encodeURIComponent(textMessage)}`;
    }
  };
}

export function openWhatsAppWebDispatch(params, phone) {
  const { encodedUrl } = formatWhatsAppDeliveryNote(params);
  const targetUrl = encodedUrl(phone);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

export const sendWhatsAppSlip = openWhatsAppWebDispatch;
