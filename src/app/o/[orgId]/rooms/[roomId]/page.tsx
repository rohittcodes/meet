"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/client";
import { VideoConferenceClientImpl } from "@/components/video-conference/VideoConferenceClientImpl";
import { ConnectionDetails } from "@/types";
import { useGetConnectionDetails } from "@/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function MeetingRoomPage({ params }: { params: Promise<{ orgId: string; roomId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ orgId, roomId }) => {
      setOrgId(orgId);
      setRoomId(roomId);
    });
  }, [params]);

  if (!orgId || !roomId) {
    return <div>Loading...</div>;
  }

  return <MeetingRoomPageClient orgId={orgId} roomId={roomId} />;
}

function MeetingRoomPageClient({ orgId, roomId }: { orgId: string; roomId: string }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [userChoices, setUserChoices] = useState<{
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
  } | null>(null);
  const [showPreJoin, setShowPreJoin] = useState(true);
  const getConnection = useGetConnectionDetails();

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
          <p className="text-gray-600 mb-4">You need to be logged in to join the meeting.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handlePreJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const videoEnabled = formData.get('videoEnabled') === 'on';
    const audioEnabled = formData.get('audioEnabled') === 'on';

    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const data = await getConnection.mutateAsync({
        roomName: roomId,
        participantName: username,
        metadata: JSON.stringify({ organizationId: orgId, roomId }),
      });

      setConnectionDetails(data as ConnectionDetails);
      setUserChoices({
        username,
        videoEnabled,
        audioEnabled,
      });
      setShowPreJoin(false);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      toast.error("Failed to join meeting. Please try again.");
    }
  };

  const handleLeaveMeeting = () => {
    setConnectionDetails(null);
    setUserChoices(null);
    setShowPreJoin(true);
    window.location.href = `/o/${orgId}/rooms`;
  };

  if (showPreJoin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Meeting Room</CardTitle>
            <CardDescription>
              Enter your details to join the meeting room.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreJoinSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={session.user.name || session.user.email}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="videoEnabled"
                    name="videoEnabled"
                    defaultChecked
                    className="rounded"
                  />
                  <Label htmlFor="videoEnabled">Enable Camera</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="audioEnabled"
                    name="audioEnabled"
                    defaultChecked
                    className="rounded"
                  />
                  <Label htmlFor="audioEnabled">Enable Microphone</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Join Meeting
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = `/o/${orgId}/rooms`}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!connectionDetails || !userChoices) {
    return <div>Loading meeting...</div>;
  }

  return (
    <div className="h-screen">
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="destructive"
          onClick={handleLeaveMeeting}
          size="sm"
        >
          Leave Meeting
        </Button>
      </div>
      <VideoConferenceClientImpl
        connectionDetails={connectionDetails}
        userChoices={userChoices}
        codec="vp9"
      />
    </div>
  );
}
