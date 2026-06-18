"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient } from "../../lib/api-client.js";
import { getAuthToken } from "../../lib/store/tokenManager.js";
import { Button } from "../ui/Button.jsx";

export default function VoiceChatPanel({ astrologerId }) {
  const [status, setStatus] = useState("idle"); // idle|connecting|connected|error
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioRef = useRef(null);
  const stopCleanupRef = useRef(() => {});

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try { stopCleanupRef.current?.(); } catch (_) {}
    };
  }, []);

  const startVoice = async () => {
    if (status === "connecting" || status === "connected") return;
    setStatus("connecting");
    setError("");

    try {
      // 1) Create ephemeral OpenAI Realtime session (server-gated)
      const { data } = await apiClient.post("/realtime/session", { astrologerId }).catch((err) => {
        const status = err?.response?.status;
        const code = err?.response?.data?.details?.code;
        if (status === 402 && code === "PASS_REQUIRED") {
          throw new Error("Chat pass required. Please confirm purchase in text chat first.");
        }
        throw err;
      });
      const { client_secret } = data?.data || {};
      if (!client_secret) throw new Error("Missing client secret");

      // 2) Prepare WebRTC peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Remote audio playback
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          audioRef.current.play().catch(() => {});
        }
      };

      // Create a data channel (optional; can be used later for transcripts or events)
      try { pc.createDataChannel("oai-events"); } catch (_) {}

      // 3) Get microphone
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }

      // 4) Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 5) Send SDP offer to OpenAI Realtime and set answer
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${client_secret}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      });

      if (!sdpResponse.ok) {
        const text = await sdpResponse.text();
        throw new Error(`Realtime connect failed: ${sdpResponse.status} ${text}`);
      }
      const answer = { type: "answer", sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);

      // Handle connection state
      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === "connected") setStatus("connected");
        else if (st === "failed" || st === "disconnected" || st === "closed") setStatus("error");
      };

      // Provide cleanup
      stopCleanupRef.current = () => {
        try { pc.getSenders().forEach((s) => s.track && (s.track.enabled = false)); } catch (_) {}
        try { pc.close(); } catch (_) {}
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
        pcRef.current = null;
        localStreamRef.current = null;
        setStatus("idle");
      };

      setStatus("connected");
    } catch (e) {
      setError(e?.message || "Failed to start voice chat");
      setStatus("error");
    }
  };

  const stopVoice = () => {
    try { stopCleanupRef.current?.(); } catch (_) {}
  };

  const toggleMic = () => {
    const localStream = localStreamRef.current;
    if (!localStream) return;
    const enabled = !micEnabled;
    for (const track of localStream.getAudioTracks()) {
      track.enabled = enabled;
    }
    setMicEnabled(enabled);
  };

  return (
    <div className="mt-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-medium text-[color:var(--color-text)]">Realtime Voice</div>
          <div className="text-[12px] text-[color:var(--color-text-soft)]">
            {status === "idle" && "Tap Start to begin talking."}
            {status === "connecting" && "Connecting…"}
            {status === "connected" && (micEnabled ? "Listening…" : "Mic muted")}
            {status === "error" && (error || "Connection error")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status !== "connected" ? (
            <Button size="sm" onClick={startVoice}>Start</Button>
          ) : (
            <>
              <Button size="sm" variant={micEnabled ? "outline" : "default"} onClick={toggleMic}>
                {micEnabled ? "Mute" : "Unmute"}
              </Button>
              <Button size="sm" onClick={stopVoice}>End</Button>
            </>
          )}
        </div>
      </div>
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}
