import dayjs from "dayjs";
import { Order } from "../models/Order.js";
import { Chat } from "../models/Chat.js";

export const getRevenueSeries = async ({ start, end }) => {
  const from = dayjs(start).startOf("day").toDate();
  const to = dayjs(end).endOf("day").toDate();

  const pipeline = [
    { $match: { createdAt: { $gte: from, $lte: to }, status: "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const data = await Order.aggregate(pipeline);
  return data.map((row) => ({ date: row._id, total: row.total, count: row.count }));
};

export const getChatVolume = async ({ start, end }) => {
  const from = dayjs(start).startOf("day").toDate();
  const to = dayjs(end).endOf("day").toDate();
  const count = await Chat.countDocuments({ createdAt: { $gte: from, $lte: to } });
  return { count, start: from, end: to };
};

