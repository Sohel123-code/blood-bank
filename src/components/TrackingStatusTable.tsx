import React from "react";
import { TrackingOrder } from "../types/hospital";

const TrackingStatusTable: React.FC = () => {
  // Dummy tracking data
  const trackingData: TrackingOrder[] = [
    {
      orderId: "ORD-1001",
      patientName: "Ravi Kumar",
      bloodGroup: "B+",
      units: 3,
      status: "Completed",
      requestedAt: "12-11-2025 10:30",
      lastUpdated: "12-11-2025 14:05"
    },
    {
      orderId: "ORD-1002",
      patientName: "Sita Rao",
      bloodGroup: "O-",
      units: 2,
      status: "In Progress",
      requestedAt: "13-11-2025 09:00",
      lastUpdated: "13-11-2025 10:15"
    },
    {
      orderId: "ORD-1003",
      patientName: "Imran Ali",
      bloodGroup: "AB+",
      units: 1,
      status: "Pending",
      requestedAt: "13-11-2025 11:20",
      lastUpdated: "13-11-2025 11:45"
    },
    {
      orderId: "ORD-1004",
      patientName: "Priya Sharma",
      bloodGroup: "A+",
      units: 4,
      status: "Completed",
      requestedAt: "11-11-2025 15:20",
      lastUpdated: "11-11-2025 18:30"
    },
    {
      orderId: "ORD-1005",
      patientName: "Rajesh Patel",
      bloodGroup: "B-",
      units: 2,
      status: "In Progress",
      requestedAt: "13-11-2025 08:15",
      lastUpdated: "13-11-2025 09:45"
    },
    {
      orderId: "ORD-1006",
      patientName: "Anita Desai",
      bloodGroup: "O+",
      units: 1,
      status: "Cancelled",
      requestedAt: "10-11-2025 14:00",
      lastUpdated: "10-11-2025 16:20"
    }
  ];

  const getStatusBadgeClass = (status: TrackingOrder["status"]) => {
    switch (status) {
      case "Completed":
        return "status-badge status-badge--completed";
      case "In Progress":
        return "status-badge status-badge--progress";
      case "Pending":
        return "status-badge status-badge--pending";
      case "Cancelled":
        return "status-badge status-badge--cancelled";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="hospital-table">
      <h3 className="hospital-table__title">Tracking Status</h3>
      <div className="hospital-table__container">
        <table className="hospital-table__table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {trackingData.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.patientName}</td>
                <td>{order.bloodGroup}</td>
                <td>{order.units}</td>
                <td>
                  <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                </td>
                <td>{order.requestedAt}</td>
                <td>{order.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackingStatusTable;

