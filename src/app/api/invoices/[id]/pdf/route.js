// // app/api/invoices/[id]/pdf/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from '@/lib/auth';
// import Invoice from '@/Models/Invoice';
// import Vendor from '@/Models/Vendor';
// import User from '@/Models/User';
// import connectDB from '@/lib/mongodb';
// import PDFDocument from 'pdfkit';

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession(request);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const invoice = await Invoice.findById(id)
//       .populate('vendor', 'companyName contactPerson phone email address gstNumber panNumber')
//       .populate('createdBy', 'firstName lastName email')
//       .populate('approvedBy', 'firstName lastName')
//       .populate('items.product', 'name description');

//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     // Check access permissions
//     if (session.user.role === 'vendor' || session.user.isVendor) {
//       const vendor = await Vendor.findOne({ user: session.user.id });
//       if (!vendor || vendor._id.toString() !== invoice.vendor._id.toString()) {
//         return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//       }
//     }

//     // Create PDF
//     const doc = new PDFDocument({ margin: 50 });
//     const chunks = [];
    
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => {});
    
//     // PDF Header
//     doc.fontSize(20).font('Helvetica-Bold')
//        .fillColor('#2c5aa0')
//        .text('INVOICE', { align: 'center' });
    
//     doc.moveDown(0.5);
//     doc.fontSize(10).font('Helvetica')
//        .fillColor('#666666')
//        .text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'center' });
    
//     // Company Info
//     doc.moveDown(1);
//     doc.fontSize(12).font('Helvetica-Bold')
//        .fillColor('#000000')
//        .text('FROM:', 50, 120);
    
//     doc.fontSize(10).font('Helvetica')
//        .text('Your Company Name')
//        .text('123 Business Street')
//        .text('City, State 12345')
//        .text('Phone: (555) 123-4567')
//        .text('Email: info@company.com');
    
//     // Vendor Info
//     doc.fontSize(12).font('Helvetica-Bold')
//        .text('BILL TO:', 300, 120);
    
//     doc.fontSize(10).font('Helvetica')
//        .text(invoice.vendor.companyName)
//        .text(invoice.vendor.contactPerson);
    
//     if (invoice.vendor.address) {
//       doc.text(`${invoice.vendor.address.street || ''}`)
//          .text(`${invoice.vendor.address.city || ''}, ${invoice.vendor.address.state || ''} ${invoice.vendor.address.zipCode || ''}`);
//     }
    
//     doc.text(`Phone: ${invoice.vendor.phone}`)
//        .text(`Email: ${invoice.vendor.email}`);
    
//     if (invoice.vendor.gstNumber) {
//       doc.text(`GST: ${invoice.vendor.gstNumber}`);
//     }
//     if (invoice.vendor.panNumber) {
//       doc.text(`PAN: ${invoice.vendor.panNumber}`);
//     }
    
//     // Invoice Details
//     doc.moveDown(2);
//     const detailsY = doc.y;
    
//     doc.fontSize(10).font('Helvetica')
//        .text('Invoice Date:', 50, detailsY)
//        .text(new Date(invoice.createdAt).toLocaleDateString(), 150, detailsY)
       
//        .text('Due Date:', 50, detailsY + 15)
//        .text(new Date(invoice.dueDate).toLocaleDateString(), 150, detailsY + 15)
       
//        .text('Invoice Type:', 300, detailsY)
//        .text(invoice.type.replace('_', ' ').toUpperCase(), 380, detailsY)
       
//        .text('Status:', 300, detailsY + 15)
//        .text(invoice.status, 380, detailsY + 15);
    
//     // Items Table Header
//     doc.moveDown(2);
//     const tableTop = doc.y;
    
//     doc.fontSize(10).font('Helvetica-Bold')
//        .fillColor('#ffffff')
//        .rect(50, tableTop, 500, 20).fill('#2c5aa0')
//        .fillColor('#ffffff')
//        .text('Description', 60, tableTop + 5)
//        .text('Size', 250, tableTop + 5)
//        .text('Color', 320, tableTop + 5)
//        .text('Qty', 380, tableTop + 5)
//        .text('Unit Price', 420, tableTop + 5)
//        .text('Amount', 480, tableTop + 5, { align: 'right' });
    
//     // Items Table Rows
//     let y = tableTop + 25;
//     doc.fillColor('#000000').font('Helvetica');
    
//     invoice.items.forEach((item, index) => {
//       if (y > 700) { // New page if needed
//         doc.addPage();
//         y = 50;
//       }
      
//       const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
//       doc.rect(50, y, 500, 20).fill(bgColor);
      
//       doc.fillColor('#000000')
//          .text(item.productName || 'Product', 60, y + 5)
//          .text(item.size || '-', 250, y + 5)
//          .text(item.color || '-', 320, y + 5)
//          .text(item.quantity.toString(), 380, y + 5)
//          .text(`₹${item.unitPrice.toFixed(2)}`, 420, y + 5)
//          .text(`₹${item.totalPrice.toFixed(2)}`, 480, y + 5, { align: 'right' });
      
//       y += 20;
//     });
    
//     // Totals
//     const totalsY = y + 10;
//     doc.font('Helvetica-Bold')
//        .text('Subtotal:', 400, totalsY)
//        .text(`₹${invoice.subtotal.toFixed(2)}`, 480, totalsY, { align: 'right' })
       
//        .text('Tax (18%):', 400, totalsY + 15)
//        .text(`₹${invoice.taxAmount.toFixed(2)}`, 480, totalsY + 15, { align: 'right' })
       
//        .text('Total Amount:', 400, totalsY + 30)
//        .text(`₹${invoice.totalAmount.toFixed(2)}`, 480, totalsY + 30, { align: 'right' });
    
//     // Notes & Terms
//     if (invoice.notes || invoice.terms) {
//       doc.moveDown(3);
//       doc.fontSize(10).font('Helvetica-Bold')
//          .text('Notes & Terms:', 50, doc.y);
      
//       doc.font('Helvetica');
//       if (invoice.notes) {
//         doc.text(invoice.notes, 50, doc.y + 15, { width: 500 });
//       }
//       if (invoice.terms) {
//         doc.text(invoice.terms, 50, doc.y + 15, { width: 500 });
//       }
//     }
    
//     // Footer
//     const footerY = 750;
//     doc.fontSize(8).font('Helvetica')
//        .fillColor('#666666')
//        .text('Thank you for your business!', 50, footerY, { align: 'center' })
//        .text('Generated on: ' + new Date().toLocaleDateString(), 50, footerY + 10, { align: 'center' });
    
//     doc.end();
    
//     // Wait for PDF to finish
//     await new Promise((resolve) => {
//       doc.on('end', resolve);
//     });
    
//     const pdfBuffer = Buffer.concat(chunks);
    
//     return new Response(pdfBuffer, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
//         'Content-Length': pdfBuffer.length.toString(),
//       },
//     });
    
//   } catch (error) {
//     console.error('PDF Generation Error:', error);
//     return NextResponse.json({ 
//       success: false,
//       error: 'Failed to generate PDF' 
//     }, { status: 500 });
//   }
// }





// app/api/invoices/[id]/pdf/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import Invoice from '@/Models/Invoice';
import Vendor from '@/Models/Vendor';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await Invoice.findById(id)
      .populate('vendor', 'companyName contactPerson phone address')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check access rights
    if (session.user.role === 'vendor' || session.user.isVendor) {
      const vendor = await Vendor.findOne({ user: session.user.id });
      if (!vendor || vendor._id.toString() !== invoice.vendor._id.toString()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Use client-side PDF generation approach
    const htmlContent = generateInvoiceHTML(invoice);
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate invoice',
      details: error.message 
    }, { status: 500 });
  }
}

// HTML Invoice Generator
function generateInvoiceHTML(invoice) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c5aa0;
            font-size: 32px;
            margin-bottom: 5px;
        }
        
        .invoice-number {
            font-size: 18px;
            color: #666;
            font-weight: bold;
        }
        
        .company-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -15px 20px -15px;
        }
        
        .col {
            flex: 1;
            padding: 0 15px;
            min-width: 250px;
        }
        
        .section-title {
            color: #2c5aa0;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .info-label {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        
        .info-value {
            color: #212529;
            font-size: 14px;
        }
        
        .table-container {
            overflow-x: auto;
            margin: 25px 0;
        }
        
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        
        .invoice-table th {
            background: #2c5aa0;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        .invoice-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #dee2e6;
            font-size: 14px;
        }
        
        .invoice-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .invoice-table tr:hover {
            background: #e3f2fd;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .total-row:last-child {
            border-bottom: none;
        }
        
        .total-row.final {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            border-top: 2px solid #2c5aa0;
            padding-top: 12px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-approved {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-draft {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        
        .notes-section {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .invoice-container {
                box-shadow: none;
                border: none;
                padding: 15px;
            }
            
            .no-print {
                display: none;
            }
        }
        
        .print-btn {
            background: #2c5aa0;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .print-btn:hover {
            background: #1e3d6f;
        }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        <p style="color: #666; font-size: 12px; margin-top: 5px;">
            Click print and save as PDF for best results
        </p>
    </div>

    <div class="invoice-container">
        <div class="header">
            <h1>INVOICE</h1>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
        </div>

        <div class="company-info">
            <div class="row">
                <div class="col">
                    <h3 style="color: #2c5aa0; margin-bottom: 10px;">FASHION STORE</h3>
                    <p>📧 info@fashionstore.com</p>
                    <p>📞 +91 98765 43210</p>
                    <p>📍 123 Business Street, Mumbai, MH 400001</p>
                </div>
                <div class="col">
                    <h3 style="color: #2c5aa0; margin-bottom: 10px;">BILLED TO</h3>
                    <p><strong>${invoice.vendor.companyName}</strong></p>
                    <p>👤 ${invoice.vendor.contactPerson}</p>
                    <p>📞 ${invoice.vendor.phone}</p>
                    ${invoice.vendor.address ? `
                        <p>📍 ${invoice.vendor.address.street || ''}, ${invoice.vendor.address.city || ''}, ${invoice.vendor.address.state || ''} - ${invoice.vendor.address.zipCode || ''}</p>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Invoice Date</div>
                <div class="info-value">${new Date(invoice.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Due Date</div>
                <div class="info-value">${new Date(invoice.dueDate).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Invoice Type</div>
                <div class="info-value">${invoice.type.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="status-badge ${
                        invoice.status === 'Approved' ? 'status-approved' :
                        invoice.status === 'Pending Approval' ? 'status-pending' :
                        'status-draft'
                    }">
                        ${invoice.status}
                    </span>
                </div>
            </div>
            ${invoice.approvedBy ? `
            <div class="info-item">
                <div class="info-label">Approved By</div>
                <div class="info-value">${invoice.approvedBy.firstName} ${invoice.approvedBy.lastName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Approved Date</div>
                <div class="info-value">${new Date(invoice.approvedAt).toLocaleDateString('en-IN')}</div>
            </div>
            ` : ''}
        </div>

        <div class="table-container">
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Variant</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th class="text-right">Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.productName}</strong>
                            </td>
                            <td>
                                ${item.size || item.color ? `
                                    ${item.size ? `Size: ${item.size}` : ''}
                                    ${item.size && item.color ? ' • ' : ''}
                                    ${item.color ? `Color: ${item.color}` : ''}
                                ` : 'Standard'}
                            </td>
                            <td>${item.quantity}</td>
                            <td>₹${item.unitPrice.toFixed(2)}</td>
                            <td class="text-right">₹${item.totalPrice.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span><strong>₹${invoice.subtotal.toFixed(2)}</strong></span>
            </div>
            <div class="total-row">
                <span>Tax (18%):</span>
                <span><strong>₹${invoice.taxAmount.toFixed(2)}</strong></span>
            </div>
            <div class="total-row final">
                <span>GRAND TOTAL:</span>
                <span>₹${invoice.totalAmount.toFixed(2)}</span>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes-section">
            <h4 style="color: #856404; margin-bottom: 10px;">📝 Notes</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        ${invoice.terms ? `
        <div class="notes-section">
            <h4 style="color: #856404; margin-bottom: 10px;">📋 Terms & Conditions</h4>
            <p>${invoice.terms}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>Thank you for your business! 🎉</strong></p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p style="margin-top: 10px; font-size: 10px;">
                Generated on ${new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
        </div>
    </div>

    <script>
        // Auto-print when opened (optional)
        // window.onload = function() {
        //     setTimeout(() => {
        //         window.print();
        //     }, 1000);
        // };
    </script>
</body>
</html>
  `;
}