"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const mockOrders = [
  {
    id: "1",
    customer: "John Doe",
    email: "john@example.com",
    total: 199.99,
    status: "Completed",
    date: "2024-01-15",
    items: ["Smart Watch", "Wireless Headphones"],
  },
  {
    id: "2",
    customer: "Jane Smith",
    email: "jane@example.com",
    total: 79.99,
    status: "Pending",
    date: "2024-01-14",
    items: ["Running Shoes"],
  },
  {
    id: "3",
    customer: "Bob Johnson",
    email: "bob@example.com",
    total: 299.97,
    status: "Shipped",
    date: "2024-01-13",
    items: ["Wireless Headphones", "Smart Watch"],
  },
  {
    id: "4",
    customer: "Alice Brown",
    email: "alice@example.com",
    total: 99.99,
    status: "Completed",
    date: "2024-01-12",
    items: ["Wireless Headphones"],
  },
];

export default function ViewOrder() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = () => {
    const foundOrder = mockOrders.find((o) => o.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Order Details</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Order ID
              </label>
              <p className="mt-2 text-lg text-gray-900 font-medium">
                #{order.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Customer
              </label>
              <p className="mt-2 text-lg text-gray-900 font-medium">
                {order.customer}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Email
              </label>
              <p className="mt-2 text-lg text-gray-900">{order.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total
              </label>
              <p className="mt-2 text-lg text-gray-900 font-semibold">
                ${order.total.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Status
              </label>
              <p className="mt-2">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date
              </label>
              <p className="mt-2 text-lg text-gray-900">{order.date}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Items</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="text-lg text-gray-900">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push("/orders")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-200"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
