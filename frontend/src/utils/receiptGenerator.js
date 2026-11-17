import jsPDF from 'jspdf';

export const downloadDealReceipt = ({
  receiptId,
  requestId,
  productTitle,
  category,
  postType,
  postOwnerName,
  postOwnerLocation,
  postOwnerContact,
  offerSenderName,
  offerSenderLocation,
  offerSenderContact,
  agreedPrice,
  quantity,
  deliveryDate,
  remarks
}) => {
  const doc = new jsPDF();

  const unitPrice = Number(agreedPrice) || 0;
  const qty = Number(quantity) || 0;
  const totalAmount = unitPrice * qty;

  // Determine Buyer vs Seller roles and contacts
  const buyerName = postType === 'Buyer' ? postOwnerName : offerSenderName;
  const buyerLocation = postType === 'Buyer' ? postOwnerLocation : offerSenderLocation;
  const buyerContact = postType === 'Buyer' ? postOwnerContact : offerSenderContact;

  const sellerName = postType === 'Seller' ? postOwnerName : offerSenderName;
  const sellerLocation = postType === 'Seller' ? postOwnerLocation : offerSenderLocation;
  const sellerContact = postType === 'Seller' ? postOwnerContact : offerSenderContact;

  // Header Banner
  doc.setFillColor(15, 61, 36); // Agri-Bridge Dark Green
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRI-BRIDGE', 14, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('ORDER RECEIPT', 14, 29);

  // Receipt Metadata
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${receiptId || `RCP-${requestId}`}`, 14, 50);
  doc.text(`Request ID: ${requestId}`, 14, 56);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 140, 50);
  doc.text('Status: ACCEPTED & CONFIRMED', 140, 56);

  // Transaction Parties Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(14, 64, 182, 42, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(19, 101, 52);
  doc.text('Transaction Parties', 18, 72);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Buyer: ${buyerName || 'Registered Buyer'} (${buyerLocation || 'Sri Lanka'})`, 18, 80);
  doc.text(`Buyer Contact: ${buyerContact || 'Not provided'}`, 18, 86);

  doc.text(`Seller: ${sellerName || 'Registered Seller'} (${sellerLocation || 'Sri Lanka'})`, 18, 94);
  doc.text(`Seller Contact: ${sellerContact || 'Not provided'}`, 18, 100);

  // Confirmed Order Summary Table (Pure jsPDF)
  const startY = 114;
  const rowHeight = 11;
  const col1Width = 65;
  const col2Width = 117;
  const tableWidth = col1Width + col2Width;

  // Table Header
  doc.setFillColor(19, 101, 52);
  doc.rect(14, startY, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Confirmed Order Summary', 18, startY + 7.5);
  doc.text('Details', 14 + col1Width + 4, startY + 7.5);

  const rows = [
    ['Product / Crop:', `${productTitle} (${category || 'General'})`],
    ['Agreed Unit Price:', `LKR ${unitPrice.toLocaleString()} / Kg`],
    ['Confirmed Quantity:', `${qty.toLocaleString()} Kg`],
    ['Expected Delivery Date:', deliveryDate || 'As agreed'],
    ['Total Order Value:', `LKR ${totalAmount.toLocaleString()}`]
  ];

  rows.forEach((row, index) => {
    const y = startY + rowHeight * (index + 1);
    const isLastRow = index === rows.length - 1;

    if (isLastRow) {
      doc.setFillColor(242, 251, 245);
      doc.rect(14, y, tableWidth, rowHeight, 'F');
    }

    doc.setDrawColor(210, 210, 210);
    doc.rect(14, y, col1Width, rowHeight, 'S');
    doc.rect(14 + col1Width, y, col2Width, rowHeight, 'S');

    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 18, y + 7.5);

    doc.setFont('helvetica', isLastRow ? 'bold' : 'normal');
    if (isLastRow) doc.setTextColor(19, 101, 52);
    doc.text(row[1], 14 + col1Width + 4, y + 7.5);
  });

  // Remarks Section
  const finalY = startY + rowHeight * (rows.length + 1) + 10;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Remarks:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(remarks ? `"${remarks}"` : '"No additional remarks"', 34, finalY);

  // Footer
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 272, 196, 272);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Agri-Bridge Smart Agricultural Marketplace | Electronically Generated Order Receipt', 14, 280);

  const safeTitle = (productTitle || 'Order').replace(/\s+/g, '_');
  doc.save(`AgriBridge_Order_Receipt_${requestId}_${safeTitle}.pdf`);
};