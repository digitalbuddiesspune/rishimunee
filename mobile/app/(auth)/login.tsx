import React from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Text } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { useAuth } from "@hooks/useAuth";
import { login } from "@services/api/auth";
import { normalizeApiError } from "@utils/errors";
import { AuthScreenShell } from "@components/AuthScreenShell";

type Form = { email: string; password: string };

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export default function LoginScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { completeAuthentication } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const signIn = async (data: Form) => {
    try {
      const response = await login(data);
      await completeAuthentication(response);
      router.replace("/(tabs)");
    } catch (error: any) {
      const human = normalizeApiError(error, "login");
      Alert.alert(human.title, human.message);
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
        Welcome back
      </Text>
      <Text soft style={{ marginBottom: 6 }}>
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
      <Text soft style={{ marginVertical: 6 }}>
        Password
      </Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            secureTextEntry
            placeholder="Password"
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
        onPress={handleSubmit(signIn)}
        disabled={isSubmitting}
        style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 12 }}
      >
        <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "600" }}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Text>
      </TouchableOpacity>
      <Text soft style={{ marginTop: 12, textAlign: "center" }}>
        New here? <Link href="/(auth)/signup">Create an account</Link>
      </Text>
    </AuthScreenShell>
  );
}
