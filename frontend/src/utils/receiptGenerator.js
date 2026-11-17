import { jsPDF } from 'jspdf';

export const downloadDealReceipt = ({
  receiptId,
  requestId,
  productTitle,
  category,
  postType,
  postOwnerName,
  postOwnerLocation,
  offerSenderName,
  offerSenderLocation,
  agreedPrice,
  quantity,
  deliveryDate,
  remarks
}) => {
  const doc = new jsPDF();
  const totalAmount = (Number(agreedPrice) || 0) * (Number(quantity) || 0);

  // Header Banner
  doc.setFillColor(19, 101, 52); // Agri-Bridge Dark Green
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRI-BRIDGE', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ACCEPTED OFFER & DEAL RECEIPT', 14, 28);

  // Metadata
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(`Receipt No: ${receiptId || `RCP-${Date.now().toString().slice(-6)}`}`, 14, 48);
  doc.text(`Request ID: ${requestId}`, 14, 54);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 140, 48);
  doc.text(`Status: ACCEPTED & CONFIRMED`, 140, 54);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 60, 196, 60);

  // Parties Section
  const buyerName = postType === 'Buyer' ? postOwnerName : offerSenderName;
  const buyerLoc = postType === 'Buyer' ? postOwnerLocation : offerSenderLocation;
  const sellerName = postType === 'Seller' ? postOwnerName : offerSenderName;
  const sellerLoc = postType === 'Seller' ? postOwnerLocation : offerSenderLocation;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Parties', 14, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Buyer: ${buyerName || 'Registered Buyer'} (${buyerLoc || 'Sri Lanka'})`, 14, 78);
  doc.text(`Seller: ${sellerName || 'Registered Seller'} (${sellerLoc || 'Sri Lanka'})`, 14, 85);

  doc.line(14, 92, 196, 92);

  // Order Details Table Box
  doc.setFillColor(242, 251, 245);
  doc.rect(14, 98, 182, 62, 'F');
  doc.setDrawColor(19, 101, 52);
  doc.rect(14, 98, 182, 62, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 101, 52);
  doc.text('Confirmed Deal Summary', 20, 108);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Product / Crop:`, 20, 118);
  doc.setFont('helvetica', 'bold');
  doc.text(`${productTitle} ${category ? `(${category})` : ''}`, 75, 118);

  doc.setFont('helvetica', 'normal');
  doc.text(`Agreed Unit Price:`, 20, 126);
  doc.setFont('helvetica', 'bold');
  doc.text(`LKR ${Number(agreedPrice).toLocaleString()} / Kg`, 75, 126);

  doc.setFont('helvetica', 'normal');
  doc.text(`Confirmed Quantity:`, 20, 134);
  doc.setFont('helvetica', 'bold');
  doc.text(`${quantity} Kg`, 75, 134);

  doc.setFont('helvetica', 'normal');
  doc.text(`Expected Delivery Date:`, 20, 142);
  doc.setFont('helvetica', 'bold');
  doc.text(`${deliveryDate || 'As agreed'}`, 75, 142);

  doc.setFontSize(12);
  doc.setTextColor(19, 101, 52);
  doc.text(`Total Deal Value:`, 20, 153);
  doc.text(`LKR ${totalAmount.toLocaleString()}`, 75, 153);

  // Remarks
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Remarks: "${remarks || 'None'}"`, 14, 172);

  // Footer
  doc.line(14, 265, 196, 265);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Agri-Bridge Smart Agricultural Marketplace | Electronically Generated Receipt', 14, 273);

  doc.save(`AgriBridge_Receipt_${requestId}_${productTitle.replace(/\s+/g, '_')}.pdf`);
};