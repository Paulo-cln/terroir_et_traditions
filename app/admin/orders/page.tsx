import fs from "fs";
import path from "path";

export default function OrdersPage() {
  const filePath = path.join(process.cwd(), "data", "orders.json");
  const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Liste des commandes</h1>
      <ul className="space-y-4">
        {orders.map((order: any, i: number) => (
          <li key={i} className="p-4 bg-gray-100 rounded">
            <p><strong>{order.name}</strong> ({order.email})</p>
            <p>Adresse: {order.address?.address_line_1}, {order.address?.admin_area_2}</p>
            <p>Date: {new Date(order.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}