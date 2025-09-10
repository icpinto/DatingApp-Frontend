import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Payment() {
  const navigate = useNavigate();

  const handlePayment = async () => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Complete Payment
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Click the button below to proceed with the payment.
      </Typography>
      <Button variant="contained" color="primary" onClick={handlePayment}>
        Pay Now
      </Button>
    </Box>
  );
}

export default Payment;
