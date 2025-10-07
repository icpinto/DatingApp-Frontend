import React, { useCallback } from "react";
import { Alert, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import { CAPABILITIES } from "../../utils/capabilities";
import Guard from "./Guard";
import { UserProvider, useUserContext } from "./UserContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentContent() {
  const navigate = useNavigate();
  const { hasCapability, getReason } = useUserContext();

  const handlePayment = async () => {
    if (!hasCapability(CAPABILITIES.BILLING_INITIATE_PAYMENT)) {
      return;
    }
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    let orderData;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      orderData = await response.json();
    } catch (error) {
      console.error("Error creating order:", error);
      return;
    }

    const options = {
      key: "RAZORPAY_KEY", // Replace with your Razorpay key
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.id,
      name: "MatchUp",
      description: "Premium Access",
      handler: async function (response) {
        try {
          await fetch("/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(response),
          });
          localStorage.setItem("hasPaid", "true");
          navigate("/home");
        } catch (err) {
          console.error("Payment verification failed:", err);
        }
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const paymentUnavailable = useCallback(
    () => (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        {getReason(CAPABILITIES.BILLING_VIEW_PAYMENT) ||
          "Payments are currently unavailable."}
      </Alert>
    ),
    [getReason]
  );

  const initiateReason = getReason(CAPABILITIES.BILLING_INITIATE_PAYMENT);

  return (
    <Guard can={CAPABILITIES.BILLING_VIEW_PAYMENT} fallback={paymentUnavailable}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Complete Payment
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Click the button below to proceed with the payment.
        </Typography>
        <Guard can={CAPABILITIES.BILLING_INITIATE_PAYMENT}>
          {({ isAllowed }) => (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!isAllowed) {
                    return;
                  }
                  handlePayment();
                }}
                disabled={!isAllowed}
              >
                Pay Now
              </Button>
              {!isAllowed && initiateReason && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  {initiateReason}
                </Alert>
              )}
            </>
          )}
        </Guard>
      </Box>
    </Guard>
  );
}

function Payment() {
  const accountLifecycle = useAccountLifecycle();

  return (
    <UserProvider accountStatus={accountLifecycle?.status}>
      <PaymentContent />
    </UserProvider>
  );
}

export default Payment;
