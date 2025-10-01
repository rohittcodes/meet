"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import type { MeetingRoom } from "@/types";
import { useCreateRoom, useRooms } from "@/queries";

export default function MeetingRoomsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ orgId }) => setOrgId(orgId));
  }, [params]);

  if (!orgId) {
    return <div>Loading...</div>;
  }

  return <MeetingRoomsPageClient orgId={orgId} />;
}

function MeetingRoomsPageClient({ orgId }: { orgId: string }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    maxParticipants: 50,
  });
	const roomsQuery = useRooms(orgId);
	const createRoom = useCreateRoom(orgId);

  if (sessionLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to view meeting rooms.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

	const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
			await createRoom.mutateAsync({
				name: createForm.name,
				description: createForm.description,
				maxParticipants: createForm.maxParticipants,
			});
      setCreateForm({ name: "", description: "", maxParticipants: 50 });
      setShowCreateForm(false);
    } catch (error) {
			// toast handled in mutation onError
    }
  };

  // Query key already depends on orgId; no extra effect required

	if (roomsQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading meeting rooms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meeting Rooms</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Room
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Meeting Room</CardTitle>
            <CardDescription>
              Create a new meeting room for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Team Meeting Room"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={String(createForm.maxParticipants)}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === "" ? 0 : parseInt(val, 10);
                    setCreateForm({ ...createForm, maxParticipants: Number.isNaN(num) ? 0 : num });
                  }}
                  min="1"
                  max="100"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Create Room
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{(roomsQuery.data || []).map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {room.name}
                <span className={`px-2 py-1 rounded text-xs ${
                  room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardTitle>
              <CardDescription>
                {room.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Max Participants: {room.maxParticipants}</p>
                <p>Created: {new Date(room.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    window.location.href = `/o/${orgId}/rooms/${room.id}`;
                  }}
                  className="flex-1"
                >
                  Join Room
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info("Room settings coming soon!");
                  }}
                >
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(roomsQuery.data || []).length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No meeting rooms yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first meeting room to get started with video calls.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Meeting Room
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
