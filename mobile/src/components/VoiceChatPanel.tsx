import React, { useEffect, useRef, useState } from "react";
import { Platform, View, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid } from "react-native";
import { useThemeColors } from "@theme/index";
import { createRealtimeSession } from "@services/api/realtime";
import ConfirmChatAccessModal from "@components/ConfirmChatAccessModal";
import { useRouter } from "expo-router";

type Props = {
  astrologerId?: string | null;
  compact?: boolean;
  onStatusChange?: (status: "idle" | "connecting" | "connected" | "error") => void;
};

export default function VoiceChatPanel({ astrologerId, compact = false, onStatusChange }: Props) {
  const c = useThemeColors();
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pcRef = useRef<any>(null);
  const localStreamRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const router = useRouter();
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const startAttemptRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAndroid = Platform.OS === "android";
  const androidApiLevel = isAndroid && typeof Platform.Version === "number" ? Platform.Version : 0;

  const setErrorSafe = (msg: string) => {
    if (!mountedRef.current) return;
    setError(msg);
  };

  const setStatusAndNotify = (st: "idle" | "connecting" | "connected" | "error") => {
    if (!mountedRef.current) return;
    setStatus(st);
    try { onStatusChange?.(st); } catch {}
  };

  const cleanup = (nextStatus: "idle" | "error" = "idle", nextError = "") => {
    try {
      const pc = pcRef.current;
      pc?.getSenders?.().forEach((s: any) => {
        if (s?.track) s.track.enabled = false;
      });
    } catch {}
    try { pcRef.current?.close?.(); } catch {}
    try {
      const local = localStreamRef.current;
      local?.getTracks?.().forEach((t: any) => t?.stop?.());
    } catch {}
    pcRef.current = null;
    localStreamRef.current = null;
    startingRef.current = false;
    if (nextError) setErrorSafe(nextError);
    if (mountedRef.current) {
      setStatusAndNotify(nextStatus);
      setMicEnabled(true);
      setSpeakerOn(true);
      setBtOn(false);
    }
  };

  const ensureRecordAudioPermission = async () => {
    if (!isAndroid || androidApiLevel < 23) return true;
    const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return true;
    const res = await PermissionsAndroid.request(permission);
    if (res === PermissionsAndroid.RESULTS.GRANTED) return true;
    setErrorSafe("Microphone permission is required for voice chat.");
    return false;
  };

  const ensureBluetoothPermission = async () => {
    if (!isAndroid || androidApiLevel < 31) return true;
    const permission = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT;
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return true;
    const res = await PermissionsAndroid.request(permission);
    if (res === PermissionsAndroid.RESULTS.GRANTED) return true;
    setErrorSafe("Bluetooth permission is required to use Bluetooth audio route.");
    return false;
  };

  const ensureNativeVoicePermissions = async () => {
    const hasRecordPermission = await ensureRecordAudioPermission();
    if (!hasRecordPermission) return false;
    // On Android 12+ WebRTC's audio device initialization can access Bluetooth APIs.
    const hasBluetoothPermission = await ensureBluetoothPermission();
    if (!hasBluetoothPermission) return false;
    return true;
  };

  const startVoice = async () => {
    if (startingRef.current || status === "connecting" || status === "connected") return;
    startingRef.current = true;
    const attemptId = ++startAttemptRef.current;
    setErrorSafe("");
    setStatusAndNotify("connecting");
    try {
      const hasNativePermissions = await ensureNativeVoicePermissions();
      if (!hasNativePermissions) {
        cleanup("error", "Required permissions are missing for voice chat.");
        return;
      }

      const resp = await createRealtimeSession(astrologerId || undefined).catch((err: any) => {
        const code = err?.response?.data?.details?.code || err?.response?.data?.code;
        if (err?.response?.status === 402 && code === "PASS_REQUIRED") {
          if (mountedRef.current) setConfirmOpen(true);
          return null;
        }
        throw err;
      });
      if (!resp) {
        cleanup("idle");
        return;
      }
      const client_secret = (resp?.data?.client_secret ?? resp?.client_secret) as string | undefined;
      if (!client_secret) throw new Error("Missing realtime session");
      if (!mountedRef.current || startAttemptRef.current !== attemptId) return;

      if (Platform.OS === "web") {
        const WebRTCPeerConnection = (globalThis as any).RTCPeerConnection;
        if (!WebRTCPeerConnection) throw new Error("WebRTC is not available on this device/browser.");
        const pc = new WebRTCPeerConnection();
        pcRef.current = pc;
        pc.ontrack = (event: any) => {
          const [stream] = event.streams || [];
          if (audioRef.current) {
            (audioRef.current as any).srcObject = stream;
            (audioRef.current as any).play?.();
          }
        };
        try { pc.createDataChannel("oai-events"); } catch {}
        const nav = navigator as any;
        const local = await nav?.mediaDevices?.getUserMedia?.({ audio: true });
        if (!local) throw new Error("Could not access microphone stream.");
        localStreamRef.current = local;
        for (const track of local.getTracks()) pc.addTrack(track, local);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const r = await fetch("https://api.openai.com/v1/realtime/calls", {
          method: "POST",
          headers: { Authorization: `Bearer ${client_secret}`, "Content-Type": "application/sdp" },
          body: offer.sdp || ""
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`Realtime connect failed: ${r.status} ${t}`);
        }
        const answer = { type: "answer", sdp: await r.text() } as any;
        await pc.setRemoteDescription(answer);
        pc.onconnectionstatechange = () => {
          const st = (pc as any).connectionState as any;
          if (st === "connected") setStatusAndNotify("connected");
          else if (["failed", "disconnected", "closed"].includes(st)) cleanup("error", "Voice connection ended.");
        };
        setStatusAndNotify("connected");
      } else {
        const rtc = await import("react-native-webrtc").catch(() => null as any);
        if (!rtc || !rtc.RTCPeerConnection || !rtc.mediaDevices) {
          cleanup("error", "Voice requires a development build with native modules.");
          return;
        }
        const pc = new rtc.RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        } as any);
        pcRef.current = pc;
        (pc as any).onaddstream = (event: any) => {
          // Audio track should play automatically in RN when stream is active
        };
        (pc as any).ontrack = (_event: any) => {
          // Newer track event; audio routing is handled by RN WebRTC
        };
        // Keep the native path minimal to reduce runtime crash surface.
        const local = await (rtc.mediaDevices as any).getUserMedia({ audio: true });
        if (!local) throw new Error("Could not access microphone stream.");
        localStreamRef.current = local;
        const tracks = local.getTracks ? local.getTracks() : [];
        for (const t of tracks) {
          (pc as any).addTrack?.(t, local);
        }
        const offer = await (pc as any).createOffer();
        await (pc as any).setLocalDescription(offer);
        const r = await fetch("https://api.openai.com/v1/realtime/calls", {
          method: "POST",
          headers: { Authorization: `Bearer ${client_secret}`, "Content-Type": "application/sdp" },
          body: offer.sdp || ""
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`Realtime connect failed: ${r.status} ${t}`);
        }
        const answer = { type: "answer", sdp: await r.text() } as any;
        const remoteDesc = rtc.RTCSessionDescription ? new rtc.RTCSessionDescription(answer) : answer;
        await (pc as any).setRemoteDescription(remoteDesc);
        (pc as any).onconnectionstatechange = () => {
          const st = (pc as any).connectionState as any;
          if (st === "connected") setStatusAndNotify("connected");
          else if (["failed", "disconnected", "closed"].includes(st)) cleanup("error", "Voice connection ended.");
        };
        setStatusAndNotify("connected");
      }
    } catch (e: any) {
      cleanup("error", e?.message || "Failed to start voice chat");
    } finally {
      if (startAttemptRef.current === attemptId) startingRef.current = false;
    }
  };

  const stopVoice = () => cleanup("idle");

  const toggleMic = () => {
    const local = localStreamRef.current as any;
    if (!local) return;
    const enabled = !micEnabled;
    for (const t of local.getAudioTracks?.() || []) t.enabled = enabled;
    setMicEnabled(enabled);
  };

  const toggleSpeaker = () => {
    if (Platform.OS !== "web") {
      setErrorSafe("Audio route controls are temporarily disabled to keep calls stable.");
      return;
    }
    const next = !speakerOn;
    setSpeakerOn(next);
  };

  const toggleBluetooth = async () => {
    if (Platform.OS !== "web") {
      setErrorSafe("Bluetooth route is temporarily disabled to keep calls stable.");
      return;
    }
    const next = !btOn;
    if (next) {
      const hasPermission = await ensureBluetoothPermission();
      if (!hasPermission) return;
      setBtOn(true);
      return;
    }
    setBtOn(false);
  };

  return (
    <View style={{ marginTop: 8, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, borderRadius: 12, padding: 12 }}>
      <View style={{ gap: 10 }}>
        <View>
          <Text style={{ color: c.text, fontWeight: "700" }}>Realtime Voice</Text>
          <Text style={{ color: c.textSoft, fontSize: 12 }}>
            {status === "idle" && "Tap Start to begin talking."}
            {status === "connecting" && "Connecting…"}
            {status === "connected" && (micEnabled ? "Listening…" : "Mic muted")}
            {status === "error" && (error || "Connection error")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {status !== "connected" ? (
            <TouchableOpacity
              onPress={startVoice}
              style={{ backgroundColor: c.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, minWidth: compact ? 110 : 100, alignItems: "center" }}
            >
              {status === "connecting" ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>Start</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={toggleMic}
                style={{ borderColor: c.border, borderWidth: 1, backgroundColor: c.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: compact ? 130 : 110, flexGrow: compact ? 1 : 0, alignItems: "center" }}
              >
                <Text style={{ color: c.text }}>{micEnabled ? "Mute" : "Unmute"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSpeaker}
                style={{ borderColor: c.border, borderWidth: 1, backgroundColor: c.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: compact ? 130 : 110, flexGrow: compact ? 1 : 0, alignItems: "center" }}
              >
                <Text style={{ color: c.text }}>{speakerOn ? "Speaker" : "Earpiece"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleBluetooth}
                style={{ borderColor: c.border, borderWidth: 1, backgroundColor: c.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: compact ? 130 : 110, flexGrow: compact ? 1 : 0, alignItems: "center" }}
              >
                <Text style={{ color: c.text }}>{btOn ? "Bluetooth On" : "Bluetooth Off"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopVoice}
                style={{ backgroundColor: c.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: compact ? 130 : 110, flexGrow: compact ? 1 : 0, alignItems: "center" }}
              >
                <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>End</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      {Platform.OS === "web" && (
        <audio ref={audioRef as any} autoPlay playsInline />
      )}
      {Platform.OS !== "web" && (
        <Text style={{ color: c.textSoft, fontSize: 12, marginTop: 6 }}>
          Connected over native WebRTC when started.
        </Text>
      )}
      <ConfirmChatAccessModal
        visible={!!confirmOpen}
        astrologerId={astrologerId || ""}
        onClose={() => setConfirmOpen(false)}
        onConfirmed={async () => {
          setConfirmOpen(false);
          // After purchase, auto-start the voice call
          startVoice();
        }}
        onInsufficient={() => {
          setConfirmOpen(false);
          router.push("/(tabs)/wallet");
        }}
      />
    </View>
  );
}
