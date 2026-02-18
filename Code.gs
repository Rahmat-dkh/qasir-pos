/**
 * POS Pro System - Backend logic
 */

function doGet(e) {
  // PAKSA SETUP DATABASE SETIAP KALI LOAD UNTUK MEMASTIKAN USER ADA
  setupDatabase();
  
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('POS Pro - Smart Cashier')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return "<!-- Error inclusion: " + filename + " -->";
  }
}

function getDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    ss: ss,
    products: ss.getSheetByName('Products') || ss.insertSheet('Products'),
    transactions: ss.getSheetByName('Transactions') || ss.insertSheet('Transactions'),
    details: ss.getSheetByName('TransactionDetails') || ss.insertSheet('TransactionDetails'),
    users: ss.getSheetByName('Users') || ss.insertSheet('Users')
  };
}

function setupDatabase() {
  const db = getDb();
  
  // 1. Setup Products
  if (db.products.getLastRow() < 1) {
    db.products.appendRow(['ID', 'Name', 'Price', 'Stock', 'Barcode', 'Category', 'ImageURL']);
  }
  
  // 2. Setup Transactions
  if (db.transactions.getLastRow() < 1) {
    db.transactions.appendRow(['InvoiceID', 'Date', 'Time', 'Total', 'Tax', 'Discount', 'GrandTotal', 'PaymentMethod', 'Cashier']);
  }

  // 3. Setup Details
  if (db.details.getLastRow() < 1) {
    db.details.appendRow(['InvoiceID', 'ProductID', 'ProductName', 'Quantity', 'Price', 'Subtotal']);
  }

  // 4. Setup Users (PASTIKAN SELALU ADA ADMIN)
  const userData = db.users.getDataRange().getValues();
  if (userData.length < 2) { // Jika hanya header atau kosong
    if (db.users.getLastRow() < 1) {
      db.users.appendRow(['Username', 'Password', 'Role']);
    }
    db.users.appendRow(['admin', 'admin123', 'admin']);
    db.users.appendRow(['kasir', 'kasir123', 'cashier']);
    Logger.log("Default users created.");
  }
}

/**
 * Fungsi pembantu untuk mengetes database secara manual
 */
function testDatabase() {
  setupDatabase();
  const db = getDb();
  const users = db.users.getDataRange().getValues();
  Logger.log("Daftar User di Database:");
  users.forEach((row, i) => {
    Logger.log("Row " + i + ": " + row[0] + " | " + row[1] + " | " + row[2]);
  });
}

function login(username, password) {
  try {
    const db = getDb();
    const users = db.users.getDataRange().getValues();
    
    const inputUser = String(username).trim();
    const inputPass = String(password).trim();
    
    Logger.log("Attempting login for: " + inputUser);
    
    // Cari user secara manual untuk menghindari masalah whitespace
    for (let i = 1; i < users.length; i++) {
        let dbUser = String(users[i][0]).trim();
        let dbPass = String(users[i][1]).trim();
        let role = String(users[i][2]).trim();
        
        if (dbUser === inputUser && dbPass === inputPass) {
            return { success: true, role: role, username: dbUser };
        }
    }
    
    return { success: false, message: "Gagal: Username atau Password salah!" };
  } catch (e) {
    Logger.log("Login Error: " + e.message);
    return { success: false, message: "Server Error: " + e.message };
  }
}

function getProducts() {
  try {
    const db = getDb();
    const data = db.products.getDataRange().getValues();
    if (data.length <= 1) return [];
    const headers = data.shift();
    return data.map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        const key = h.toString().toLowerCase().replace(/\s+/g, '');
        obj[key] = row[i];
      });
      return obj;
    });
  } catch (e) { return []; }
}

function saveProduct(product) {
  const db = getDb();
  const data = db.products.getDataRange().getValues();
  let rowIdx = -1;
  if (product.id) {
    rowIdx = data.findIndex(r => r[0] == product.id);
  }

  const rowData = [
    product.id || Utilities.getUuid(),
    product.name,
    product.price,
    product.stock,
    product.barcode,
    product.category,
    product.imageurl
  ];

  if (rowIdx > -1) {
    db.products.getRange(rowIdx + 1, 1, 1, rowData.length).setValues([rowData]);
  } else {
    db.products.appendRow(rowData);
  }
  return { success: true };
}

function bulkAddProducts(products) {
  const db = getDb();
  if (db.products.getLastRow() > 1) return { success: true, message: 'Data already exists' };

  const rows = products.map(p => [
    Utilities.getUuid(),
    p.name,
    p.price,
    p.stock,
    p.barcode,
    p.category,
    p.imageurl
  ]);
  
  db.products.getRange(db.products.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { success: true };
}

function deleteProduct(id) {
  const db = getDb();
  const data = db.products.getDataRange().getValues();
  const idx = data.findIndex(r => r[0] == id);
  if (idx > -1) {
    db.products.deleteRow(idx + 1);
    return { success: true };
  }
  return { success: false };
}

function processTransaction(payload) {
  const db = getDb();
  const invoiceId = 'INV-' + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss");
  const date = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  const time = Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss");

  db.transactions.appendRow([
    invoiceId, date, time, 
    payload.total, payload.tax, payload.discount, 
    payload.grandTotal, payload.paymentMethod, payload.cashier
  ]);

  const productData = db.products.getDataRange().getValues();
  payload.items.forEach(item => {
    db.details.appendRow([
      invoiceId, item.id, item.name, item.quantity, item.price, item.subtotal
    ]);
    const pIdx = productData.findIndex(r => r[0] == item.id);
    if (pIdx > -1) {
      const currentStock = productData[pIdx][3];
      db.products.getRange(pIdx + 1, 4).setValue(currentStock - item.quantity);
    }
  });

  return { success: true, invoiceId: invoiceId };
}

function getTransactionsHistory() {
  const db = getDb();
  const data = db.transactions.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data.shift();
  return data.reverse().map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      const key = h.toString().toLowerCase().replace(/\s+/g, '');
      obj[key] = row[i];
    });
    return obj;
  });
}

function exportToCSV() {
  const db = getDb();
  const data = db.transactions.getDataRange().getValues();
  if (data.length <= 1) return null;
  let csvContent = data.map(row => row.map(item => `"${item}"`).join(",")).join("\r\n");
  return "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
}

function getDashboardData() {
  const db = getDb();
  const transData = db.transactions.getDataRange().getValues();
  transData.shift(); 
  const totalSales = transData.reduce((acc, row) => acc + (parseFloat(row[6]) || 0), 0);
  
  const detailsData = db.details.getDataRange().getValues();
  detailsData.shift();
  const summary = {};
  detailsData.forEach(row => {
    const name = row[2];
    const qty = row[3];
    const subtotal = row[5];
    if(!summary[name]) summary[name] = { count: 0, revenue: 0 };
    summary[name].count += qty;
    summary[name].revenue += subtotal;
  });
  
  const topProducts = Object.keys(summary)
    .map(name => ({ name, count: summary[name].count, revenue: summary[name].revenue }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalSales: totalSales,
    totalOrders: transData.length,
    lowStock: getProducts().filter(p => p.stock < 10).length,
    topProducts: topProducts
  };
}

function getSalesChartData() {
  const db = getDb();
  const transData = db.transactions.getDataRange().getValues();
  transData.shift();
  
  const days = {};
  for(let i=0; i<7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd");
    days[dateStr] = 0;
  }
  
  transData.forEach(row => {
    const dStr = row[1];
    if(days[dStr] !== undefined) days[dStr] += parseFloat(row[6]) || 0;
  });
  
  const labels = Object.keys(days).reverse();
  const values = labels.map(l => days[l]);
  
  return { labels, values };
}
