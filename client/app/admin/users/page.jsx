"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await adminApiClient.get("/admin/users");
        setUsers(data.data.users || []);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    loadUsers();
  }, []);

  const toggleStatus = async (userId, status) => {
    try {
      await adminApiClient.patch(`/admin/users/${userId}`, { status });
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, status } : user)));
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Users</h1>
        <p className="text-sm text-[color:var(--color-text-soft)]">View and manage user accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-[color:var(--color-text)]">{user.name}</p>
                <p>{user.email}</p>
                <p>Status: {user.status}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleStatus(user._id, "active")}>Activate</Button>
                <Button variant="ghost" size="sm" onClick={() => toggleStatus(user._id, "blocked")}>Block</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


