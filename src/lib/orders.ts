export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: Customer;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: "1",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-123-4567",
      address: "123 Main St, Anytown, USA",
    },
    total: 199.99,
    status: "Completed",
    date: "2024-01-15",
    items: [
      { productId: "P001", productName: "Smart Watch", category: "Electronics", price: 99.99, quantity: 1 },
      { productId: "P002", productName: "Wireless Headphones", category: "Electronics", price: 99.99, quantity: 1 },
    ],
  },
  {
    id: "2",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-234-5678",
      address: "456 Oak Ave, Somewhere, USA",
    },
    total: 79.99,
    status: "Pending",
    date: "2024-01-14",
    items: [
      { productId: "P003", productName: "Running Shoes", category: "Sports", price: 79.99, quantity: 1 },
    ],
  },
  {
    id: "3",
    customer: {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1-555-345-6789",
      address: "789 Pine Rd, Elsewhere, USA",
    },
    total: 299.97,
    status: "Shipped",
    date: "2024-01-13",
    items: [
      { productId: "P002", productName: "Wireless Headphones", category: "Electronics", price: 99.99, quantity: 1 },
      { productId: "P001", productName: "Smart Watch", category: "Electronics", price: 99.99, quantity: 2 },
    ],
  },
  {
    id: "4",
    customer: {
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+1-555-456-7890",
      address: "321 Elm St, Nowhere, USA",
    },
    total: 99.99,
    status: "Completed",
    date: "2024-01-12",
    items: [
      { productId: "P002", productName: "Wireless Headphones", category: "Electronics", price: 99.99, quantity: 1 },
    ],
  },
];
