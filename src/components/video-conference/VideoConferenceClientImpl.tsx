'use client';

import { formatChatMessageLinks, RoomContext, VideoConference } from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  LogLevel,
  Room,
  RoomConnectOptions,
  RoomOptions,
  VideoPresets,
  type VideoCodec,
} from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import { ConnectionDetails } from '@/types';

export function VideoConferenceClientImpl(props: {
  connectionDetails: ConnectionDetails;
  userChoices: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  };
  codec: VideoCodec | undefined;
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const [e2eeSetupComplete, setE2eeSetupComplete] = useState(true); // Simplified for now

  const roomOptions = useMemo((): RoomOptions => {
    return {
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: true,
        videoCodec: props.codec,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
    };
  }, [props.codec]);

  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  useEffect(() => {
    room.connect(props.connectionDetails.serverUrl, props.connectionDetails.participantToken, connectOptions).catch((error) => {
      console.error('Room connection error:', error);
    });
    
    if (props.userChoices.videoEnabled) {
      room.localParticipant.setCameraEnabled(true).catch((error) => {
        console.error('Camera enable error:', error);
      });
    }
    
    if (props.userChoices.audioEnabled) {
      room.localParticipant.setMicrophoneEnabled(true).catch((error) => {
        console.error('Microphone enable error:', error);
      });
    }
  }, [room, props.connectionDetails, props.userChoices, connectOptions]);

  return (
    <div className="lk-room-container h-screen">
      <RoomContext.Provider value={room}>
        <VideoConference
          chatMessageFormatter={formatChatMessageLinks}
        />
      </RoomContext.Provider>
    </div>
  );
}
