// services/pdfService.js - PROFESSIONAL INVOICE PDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const pdfService = {
  generateInvoicePDF: async (invoiceData) => {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('FASHION EMPORIUM', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('123 Fashion Street, Style City', 105, 28, { align: 'center' });
    doc.text('Phone: +91 9876543210 | Email: info@fashionemporium.com', 105, 34, { align: 'center' });
    
    // Invoice Title
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('TAX INVOICE', 105, 50, { align: 'center' });
    
    // Invoice Details
    const detailsY = 65;
    doc.setFontSize(10);
    
    // Left Column - Invoice Info
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, detailsY);
    doc.text(`Invoice Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`, 20, detailsY + 6);
    doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 20, detailsY + 12);
    
    // Right Column - Status and Type
    doc.text(`Status: ${invoiceData.status}`, 150, detailsY);
    doc.text(`Type: ${invoiceData.type.replace('_', ' ').toUpperCase()}`, 150, detailsY + 6);
    
    // Vendor Information
    const vendorY = detailsY + 25;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Bill To:', 20, vendorY);
    doc.setFontSize(10);
    doc.text(invoiceData.vendor.companyName, 20, vendorY + 6);
    doc.text(`Contact: ${invoiceData.vendor.contactPerson}`, 20, vendorY + 12);
    doc.text(`Phone: ${invoiceData.vendor.phone}`, 20, vendorY + 18);
    
    // Items Table
    const tableColumns = [
      { header: 'Product', dataKey: 'productName' },
      { header: 'Size', dataKey: 'size' },
      { header: 'Color', dataKey: 'color' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Unit Price', dataKey: 'unitPrice' },
      { header: 'Total', dataKey: 'totalPrice' }
    ];
    
    const tableRows = invoiceData.items.map(item => ({
      productName: item.productName,
      size: item.size || '-',
      color: item.color || '-',
      quantity: item.quantity,
      unitPrice: `₹${item.unitPrice.toFixed(2)}`,
      totalPrice: `₹${item.totalPrice.toFixed(2)}`
    }));
    
    doc.autoTable({
      startY: vendorY + 30,
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      theme: 'grid',
      headStyles: {
        fillColor: [70, 130, 180],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });
    
    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
    
    doc.text('Tax (18%):', 140, finalY + 6);
    doc.text(`₹${invoiceData.taxAmount.toFixed(2)}`, 180, finalY + 6, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount:', 140, finalY + 15);
    doc.text(`₹${invoiceData.totalAmount.toFixed(2)}`, 180, finalY + 15, { align: 'right' });
    
    // Payment Terms
    const termsY = finalY + 30;
    if (invoiceData.terms) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Payment Terms:', 20, termsY);
      doc.text(invoiceData.terms, 20, termsY + 6, { maxWidth: 170 });
    }
    
    // Notes
    const notesY = termsY + (invoiceData.terms ? 20 : 10);
    if (invoiceData.notes) {
      doc.text('Notes:', 20, notesY);
      doc.text(invoiceData.notes, 20, notesY + 6, { maxWidth: 170 });
    }
    
    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
    doc.text('This is a computer generated invoice.', 105, footerY + 4, { align: 'center' });
    
    return doc.output('blob');
  }
};