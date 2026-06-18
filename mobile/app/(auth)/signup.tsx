import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Text } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { useAuth } from "@hooks/useAuth";
import { requestSignupOtp, resendOtp, verifySignupOtp } from "@services/api/auth";
import { normalizeApiError } from "@utils/errors";
import { AuthScreenShell } from "@components/AuthScreenShell";

type Form = { name: string; email: string; phone: string; password: string };

const schema = yup.object({
  name: yup.string().min(2).required(),
  email: yup.string().email().required(),
  phone: yup.string().min(10).max(15).required(),
  password: yup.string().min(6).required(),
});

export default function SignupScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { completeAuthentication } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const requestCode = async (data: Form) => {
    try {
      const response = await requestSignupOtp(data);
      setChallenge(response?.data || response);
    } catch (error: any) {
      const human = normalizeApiError(error, "signup");
      Alert.alert(human.title, human.message);
    }
  };

  const verifyCode = async () => {
    try {
      setVerifying(true);
      const response = await verifySignupOtp(challenge.challengeId, otp);
      await completeAuthentication(response);
      router.replace("/(tabs)");
    } catch (error: any) {
      const human = normalizeApiError(error, "signup");
      Alert.alert(human.title, human.message);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    try {
      const response = await resendOtp(challenge.challengeId);
      setChallenge(response?.data || response);
      setOtp("");
    } catch (error: any) {
      Alert.alert("Unable to resend", error?.response?.data?.message || error?.message || "");
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    color: c.text,
  };

  return (
    <AuthScreenShell>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16, textAlign: "center" }}>
        {challenge ? "Verify your email" : "Create your account"}
      </Text>
      {!challenge ? (
        <>
          <Text soft style={{ marginBottom: 6 }}>
            Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                placeholder="Your name"
                placeholderTextColor={c.textSoft}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={inputStyle}
              />
            )}
          />
          {errors.name && <Text style={{ color: c.danger }}>{errors.name.message}</Text>}
          <Text soft style={{ marginBottom: 6, marginTop: 8 }}>
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor={c.textSoft}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={inputStyle}
              />
            )}
          />
          {errors.email && <Text style={{ color: c.danger }}>{errors.email.message}</Text>}
          <Text soft style={{ marginBottom: 6, marginTop: 8 }}>
            Phone
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                keyboardType="phone-pad"
                placeholder="10-digit mobile number"
                placeholderTextColor={c.textSoft}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={inputStyle}
              />
            )}
          />
          {errors.phone && <Text style={{ color: c.danger }}>{errors.phone.message}</Text>}
          <Text soft style={{ marginVertical: 6 }}>
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                secureTextEntry
                placeholder="Create a password"
                placeholderTextColor={c.textSoft}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={inputStyle}
              />
            )}
          />
          {errors.password && <Text style={{ color: c.danger }}>{errors.password.message}</Text>}
          <TouchableOpacity
            onPress={handleSubmit(requestCode)}
            disabled={isSubmitting}
            style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 12 }}
          >
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "600" }}>
              {isSubmitting ? "Sending code..." : "Continue with email verification"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text soft style={{ marginBottom: 10 }}>
            Enter the six-digit code sent to your email.
          </Text>
          <TextInput
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            placeholder="6-digit code"
            placeholderTextColor={c.textSoft}
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
            style={inputStyle}
          />
          <TouchableOpacity
            onPress={verifyCode}
            disabled={verifying || otp.length !== 6}
            style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 12 }}
          >
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "600" }}>
              {verifying ? "Verifying..." : "Verify and create account"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resend} style={{ padding: 12 }}>
            <Text style={{ color: c.primary, textAlign: "center" }}>Resend code</Text>
          </TouchableOpacity>
        </>
      )}
      <Text soft style={{ marginTop: 12, textAlign: "center" }}>
        Have an account? <Link href="/(auth)/login">Sign in</Link>
      </Text>
    </AuthScreenShell>
  );
}
