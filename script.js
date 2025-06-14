fetch("https://www.fast2sms.com/dev/bulkV2", {
  method: "POST",
  headers: {
    Authorization: "YOUR_FAST2SMS_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    route: "otp",
    variables_values: serverOtp,
    numbers: mobile
  })
});
