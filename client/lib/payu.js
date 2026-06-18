"use client";

export const submitHostedPayment = (payment) => {
  if (!payment) {
    throw new Error("Payment checkout details are missing");
  }

  if (payment.checkoutUrl) {
    window.location.assign(payment.checkoutUrl);
    return;
  }

  if (!payment.actionUrl || !payment.fields) {
    throw new Error("Payment checkout details are missing");
  }

  const form = document.createElement("form");
  form.method = payment.method || "POST";
  form.action = payment.actionUrl;
  Object.entries(payment.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

